import { useState } from 'react'
import { useStore } from '../state/store'
import { HabitList } from '../ui/HabitList'
import { Card, SectionTitle, Modal, StatTile } from '../ui/primitives'
import { Checkbox, ProgressRing } from '../ui/controls'
import { habitCompletion, streakDiscipline, streakCleanFood, wakeUpResult } from '../state/stats'
import { fmtDateLong, pct, uid, addDays } from '../utils'
import type { HabitDef } from '../types'

const CATEGORIES = ['MORNING', 'SCHOOL', 'STUDY', 'HEALTH', 'DISCIPLINE', 'FINANCE', 'CUSTOM']

export function HabitsPage() {
  const { state, today, addHabit, updateHabit, deleteHabit, moveHabit, updateLog, notify } = useStore()
  const log = state.dailyLogs[today]
  const [modal, setModal] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('CUSTOM')

  const disc = streakDiscipline(state, today)
  const clean = streakCleanFood(state, today)
  const completion = habitCompletion(state, today)

  const toggleJunk = (v: boolean) => {
    updateLog(today, { junkFood: v, junkFoodDetail: v ? (log?.junkFoodDetail ?? null) : null })
  }

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-shimmer">Habits &amp; Discipline</h1>
        <p className="mt-1 text-sm text-slate-500">{fmtDateLong(today)} · consistency indicator, not a judgment</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon="✅" label="Today" value={pct(completion)} tone={completion >= 80 ? 'good' : 'default'} />
        <StatTile icon="🔒" label="Discipline streak" value={`${disc.current}d`} sub={`best ${disc.best}d`} tone="info" />
        <StatTile icon="🥗" label="Clean-food streak" value={`${clean.current}d`} sub={`best ${clean.best}d`} tone="info" />
        <StatTile icon="⏰" label="Wake-up" value={log?.wakeUpActual ? (wakeUpResult(state, today).onTime ? 'On time' : 'Late') : '—'} tone={log?.wakeUpActual ? (wakeUpResult(state, today).onTime ? 'good' : 'warn') : 'default'} />
      </div>

      <Card>
        <SectionTitle
          icon="☰"
          title="All habits"
          subtitle="Add, rename, reorder, disable or delete — per-day checks live on Today"
          right={<button className="btn btn-primary" onClick={() => setModal(true)}>+ New habit</button>}
        />
        <div className="space-y-6">
          {CATEGORIES.map((cat) => {
            const items = state.habits.filter((h) => (h.category === cat) || (cat === 'CUSTOM' && !CATEGORIES.slice(0, 6).includes(h.category)))
            if (!items.length) return null
            return (
              <div key={cat}>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{cat}</h4>
                <div className="space-y-2">
                  {items.map((h) => (
                    <HabitRow
                      key={h.id}
                      habit={h}
                      onRename={(name) => updateHabit(h.id, { name })}
                      onToggleEnabled={() => updateHabit(h.id, { enabled: !h.enabled })}
                      onMove={(dir) => moveHabit(h.id, dir)}
                      onDelete={() => {
                        deleteHabit(h.id)
                        notify('Habit deleted')
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle icon="🔒" title="Discipline tracker" subtitle="Private and neutral — one day at a time" />
          <div className="flex items-center gap-6">
            <ProgressRing value={disc.current >= 90 ? 100 : (disc.current % 30) * (100 / 30)} size={120} color="#34d399" label={`${disc.current}d`} sub="current streak" />
            <div className="flex-1 space-y-2 text-sm">
              <div className="flex justify-between border-b border-base-border pb-2">
                <span className="text-slate-500">Current streak</span>
                <span className="font-semibold text-slate-100">{disc.current} days</span>
              </div>
              <div className="flex justify-between border-b border-base-border pb-2">
                <span className="text-slate-500">Longest streak</span>
                <span className="font-semibold text-slate-100">{disc.best} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Days completed</span>
                <span className="font-semibold text-slate-100">
                  {Object.values(state.dailyLogs).filter((l) => l.habits['h-nofap']).length} days
                </span>
                </div>
              <div className="pt-2">
                <button
                  className="btn btn-danger w-full"
                  onClick={() => {
                    updateLog(today, { habits: { ...log?.habits, 'h-nofap': false } })
                    notify('Streak reset — forward, not back', 'warn')
                  }}
                >
                  Reset streak (start from day 1)
                </button>
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-slate-600">
            Track privately. Progress is not linear — what matters is the next right day.
          </p>
        </Card>

        <Card>
          <SectionTitle icon="🥗" title="Food discipline" subtitle="Did you eat junk food today?" />
          <div className="flex gap-3">
            <button
              className={`btn flex-1 ${log?.junkFood === false ? 'btn-primary' : ''}`}
              onClick={() => toggleJunk(false)}
            >
              NO — clean day
            </button>
            <button
              className={`btn flex-1 ${log?.junkFood === true ? 'btn-danger' : ''}`}
              onClick={() => toggleJunk(true)}
            >
              YES
            </button>
          </div>
          {log?.junkFood === false && <div className="mt-3 chip chip-ok">🔥 Clean day — fuel, not rules</div>}
          {log?.junkFood === true && (
            <div className="mt-3 space-y-2 rounded-xl border border-base-border bg-base-card2 p-3">
              <div className="text-sm text-slate-400">Optional details — no guilt, just data:</div>
              <input
                className="input"
                placeholder="Food"
                value={log.junkFoodDetail?.food ?? ''}
                onChange={(e) => updateLog(today, { junkFoodDetail: { food: e.target.value, quantity: log.junkFoodDetail?.quantity ?? '', cost: log.junkFoodDetail?.cost ?? 0 } })}
              />
              <div className="flex gap-2">
                <input
                  className="input"
                  placeholder="Quantity"
                  value={log.junkFoodDetail?.quantity ?? ''}
                  onChange={(e) => updateLog(today, { junkFoodDetail: { food: log.junkFoodDetail?.food ?? '', quantity: e.target.value, cost: log.junkFoodDetail?.cost ?? 0 } })}
                />
                <input
                  className="input"
                  type="number"
                  placeholder="Approx. cost"
                  value={log.junkFoodDetail?.cost ?? ''}
                  onChange={(e) => updateLog(today, { junkFoodDetail: { food: log.junkFoodDetail?.food ?? '', quantity: log.junkFoodDetail?.quantity ?? '', cost: Number(e.target.value) || 0 } })}
                />
              </div>
            </div>
          )}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <MiniBox label="Clean days (7d)" value={`${last7Clean(state, today)}/7`} />
            <MiniBox label="Clean days (30d)" value={`${last30Clean(state, today)}/30`} />
            <MiniBox label="Today" value={log?.junkFood === false ? 'Clean' : log?.junkFood === true ? 'Junk' : '—'} />
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle icon="💯" title="Daily habit score" subtitle="A consistency indicator — not a judgment of you" />
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <ProgressRing value={completion} size={140} label={pct(completion)} sub="habits complete" />
          <div className="flex-1 space-y-1.5 text-sm">
            {state.habits.filter((h) => h.enabled).slice(0, 8).map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-3 rounded-lg bg-base-card2 px-3 py-1.5">
                <span className="text-slate-400">{h.name}</span>
                <span className={log?.habits[h.id] ? 'text-emerald-300' : 'text-slate-600'}>{log?.habits[h.id] ? '✓ 1 pt' : '· 0 pt'}</span>
              </div>
            ))}
            <div className="pt-2 text-xs text-slate-600">
              Score = share of enabled habits completed today. Everyone's mix is different — compare only with yesterday's you.
            </div>
          </div>
        </div>
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="New habit">
        <div className="space-y-3">
          <div>
            <span className="label">Habit name</span>
            <input className="input" autoFocus placeholder="e.g. Read 10 pages" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <span className="label">Category</span>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button className="btn" onClick={() => setModal(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (!name.trim()) return
                addHabit({ name: name.trim(), category })
                setName('')
                setCategory('CUSTOM')
                setModal(false)
                notify('Habit added')
              }}
            >
              Add habit
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function HabitRow({
  habit,
  onRename,
  onToggleEnabled,
  onMove,
  onDelete,
}: {
  habit: HabitDef
  onRename: (name: string) => void
  onToggleEnabled: () => void
  onMove: (dir: -1 | 1) => void
  onDelete: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(habit.name)
  return (
    <div className="flex items-center gap-2 rounded-xl border border-base-border bg-base-card2/50 px-3 py-2">
      {editing ? (
        <>
          <input className="input flex-1" value={draft} autoFocus onChange={(e) => setDraft(e.target.value)} />
          <button className="btn btn-primary px-2.5 py-1.5 text-xs" onClick={() => { onRename(draft.trim() || habit.name); setEditing(false) }}>Save</button>
          <button className="btn px-2.5 py-1.5 text-xs" onClick={() => { setDraft(habit.name); setEditing(false) }}>Cancel</button>
        </>
      ) : (
        <>
          <span className={`flex-1 text-sm ${habit.enabled ? 'text-slate-200' : 'text-slate-600 line-through'}`}>{habit.name}</span>
          {habit.custom && <span className="chip text-[10px]">custom</span>}
          <button className="btn btn-ghost px-1.5 py-1 text-xs" title="Move up" onClick={() => onMove(-1)}>↑</button>
          <button className="btn btn-ghost px-1.5 py-1 text-xs" title="Move down" onClick={() => onMove(1)}>↓</button>
          <button className="btn btn-ghost px-1.5 py-1 text-xs" title="Rename" onClick={() => setEditing(true)}>✎</button>
          <button
            className={`btn px-2 py-1 text-[11px] ${habit.enabled ? '' : 'opacity-60'}`}
            onClick={onToggleEnabled}
            title={habit.enabled ? 'Disable (keeps history)' : 'Enable'}
          >
            {habit.enabled ? '✓ On' : 'Off'}
          </button>
          <button className="btn btn-ghost px-1.5 py-1 text-xs text-rose-300" title="Delete" onClick={onDelete}>✕</button>
        </>
      )}
    </div>
  )
}

function MiniBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-base-border bg-base-card2 p-3 text-center">
      <div className="font-display text-lg font-bold text-slate-100">{value}</div>
      <div className="mt-0.5 text-[11px] text-slate-500">{label}</div>
    </div>
  )
}

function last7Clean(s: ReturnType<typeof useStore>['state'], today: string): number {
  let n = 0
  for (let i = 0; i < 7; i++) {
    const d = addDays(today, -i)
    const log = s.dailyLogs[d]
    if (log?.junkFood === false) n++
  }
  return n
}

function last30Clean(s: ReturnType<typeof useStore>['state'], today: string): number {
  let n = 0
  for (let i = 0; i < 30; i++) {
    const d = addDays(today, -i)
    const log = s.dailyLogs[d]
    if (log?.junkFood === false) n++
  }
  return n
}
