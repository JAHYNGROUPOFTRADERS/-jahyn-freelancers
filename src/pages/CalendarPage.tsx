import { useState } from 'react'
import { useStore } from '../state/store'
import { Card, SectionTitle, Modal } from '../ui/primitives'
import { habitCompletion, wakeUpResult, dayMinutes, dayKm, daySpent, currentWeight } from '../state/stats'
import { addDays, fmtDateLong, fmtDuration, fmtKm, fmtMoney, pct, todayStr, toLocalDateStr, weekdayShort } from '../utils'

export function CalendarPage() {
  const { state, today } = useStore()
  const [monthOffset, setMonthOffset] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)

  const base = new Date()
  base.setDate(1)
  base.setMonth(base.getMonth() + monthOffset)
  const y = base.getFullYear()
  const m = base.getMonth()
  const monthName = base.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const firstDow = (base.getDay() + 6) % 7
  const daysInMonth = new Date(y, m + 1, 0).getDate()

  const cells: (string | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => toLocalDateStr(new Date(y, m, i + 1))),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-shimmer">Calendar</h1>
        <p className="mt-1 text-sm text-slate-500">Every day tells a story — click any past or present day</p>
      </div>

      <Card>
        <SectionTitle
          icon="🗓"
          title={monthName}
          subtitle="Intensity = habit completion"
          right={
            <div className="flex gap-2">
              <button className="btn px-2.5" onClick={() => setMonthOffset(monthOffset - 1)}>‹</button>
              <button className="btn px-2.5" onClick={() => setMonthOffset(0)} disabled={monthOffset === 0}>This month</button>
              <button className="btn px-2.5" onClick={() => setMonthOffset(monthOffset + 1)} disabled={monthOffset >= 0}>›</button>
            </div>
          }
        />
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div key={d} className="pb-1 text-[10px] uppercase tracking-wider text-slate-600">{d}</div>
          ))}
          {cells.map((d, i) => {
            if (!d) return <div key={i} />
            const c = habitCompletion(state, d)
            const isFuture = d > today
            const logged = !!state.dailyLogs[d]
            return (
              <button
                key={d}
                disabled={isFuture}
                onClick={() => setSelected(d)}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border text-xs transition-all ${
                  d === today
                    ? 'border-cyan-400/70 bg-cyan-400/10 text-cyan-200'
                    : c > 0
                      ? `border-base-border bg-cyan-400/${Math.max(10, Math.round(c / 20) * 10)} text-slate-200`
                      : 'border-base-border bg-base-card2/60 text-slate-500'
                } ${isFuture ? 'opacity-35' : ''} hover:border-slate-500`}
              >
                <span className="font-display font-semibold">{d.slice(8)}</span>
                {logged && <span className="text-[9px] text-slate-400">{c}%</span>}
                {d === today && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-cyan-300" />}
              </button>
            )
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-600">
          <span>Less</span>
          <span className="h-2.5 w-2.5 rounded bg-[#14181c] border border-base-border" />
          <span className="h-2.5 w-2.5 rounded bg-cyan-400/20" />
          <span className="h-2.5 w-2.5 rounded bg-cyan-400/40" />
          <span className="h-2.5 w-2.5 rounded bg-cyan-400/60" />
          <span className="h-2.5 w-2.5 rounded bg-cyan-400/80" />
          <span>More</span>
        </div>
      </Card>

      <DaySummaryModal date={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

function DaySummaryModal({ date, onClose }: { date: string | null; onClose: () => void }) {
  const { state, toggleHabit, updateLog } = useStore()
  if (!date) return null
  const log = state.dailyLogs[date]
  const c = habitCompletion(state, date)
  const keyHabits = [
    { id: 'h-run', label: 'Exercise' },
    { id: 'h-study1', label: 'Study 1' },
    { id: 'h-study2', label: 'Study 2' },
    { id: 'h-nojunk', label: 'No junk food' },
    { id: 'h-nofap', label: 'Discipline' },
    { id: 'h-sleep', label: 'Sleep on time' },
  ]

  return (
    <Modal open={!!date} onClose={onClose} title={fmtDateLong(date)}>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <MiniBox label="Completion" value={pct(c)} />
          <MiniBox label="Study" value={fmtDuration(dayMinutes(state, date))} />
          <MiniBox label="Run" value={dayKm(state, date) > 0 ? fmtKm(dayKm(state, date)) : '—'} />
          <MiniBox label="Spent" value={daySpent(state, date) > 0 ? fmtMoney(daySpent(state, date), state.settings.currency) : '—'} />
          <MiniBox label="Junk food" value={log?.junkFood === false ? 'No' : log?.junkFood === true ? 'Yes' : '—'} />
          <MiniBox label="Wake-up" value={log?.wakeUpActual ? (wakeUpResult(state, date).onTime ? 'On time' : 'Late') : '—'} />
        </div>

        <div>
          <div className="mb-2 text-xs uppercase tracking-wider text-slate-500">Key habits — tap to edit this day</div>
          <div className="space-y-1.5">
            {keyHabits.map((kh) => {
              const done = !!log?.habits[kh.id]
              return (
                <button
                  key={kh.id}
                  onClick={() => toggleHabit(date, kh.id)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                    done ? 'border-emerald-400/25 bg-emerald-400/5 text-slate-200' : 'border-base-border bg-base-card2/50 text-slate-400'
                  }`}
                >
                  <span>{kh.label}</span>
                  <span>{done ? '✅' : '❌'}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <span className="label">Note for this day</span>
          <textarea
            className="input min-h-20"
            placeholder="Anything worth remembering about today…"
            value={log?.note ?? ''}
            onChange={(e) => updateLog(date, { note: e.target.value })}
          />
        </div>

        <div className="flex justify-end">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </Modal>
  )
}

function MiniBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-base-border bg-base-card2 p-2.5 text-center">
      <div className="font-display text-sm font-bold text-slate-100">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
    </div>
  )
}
