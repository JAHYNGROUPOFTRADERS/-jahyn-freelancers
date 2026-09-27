import { useState } from 'react'
import { useStore } from '../state/store'
import {
  arcDayNumber, currentWeight, dayMinutes, daySpent, daysRemaining, habitCompletion,
  streakOverall, wakeUpResult, weightProgressPct, enabledHabits, dayKm, rangeSpent,
} from '../state/stats'
import { fmtDateLong, fmtDuration, fmtMoney, fmtTime12, greetingFor, startOfWeek, sum } from '../utils'
import { Card, SectionTitle, StatTile, Modal } from '../ui/primitives'
import { ProgressRing } from '../ui/controls'
import { HabitList } from '../ui/HabitList'
import { WeekStrip } from '../ui/WeekStrip'
import { RoutineEditor } from '../ui/RoutineEditor'
import { MOTIVATION_QUOTES } from '../data/defaults'
import { Tilt3D, HeroOrb, useTiltDisabled } from '../ui/tilt'

const TILE_ICONS = { run: '🏃', study: '📚', spend: '💰', weight: '⚖' }

export function TodayPage() {
  const { state, today, updateSettings, setWakeActual, notify } = useStore()
  const now = new Date()
  const log = state.dailyLogs[today]
  const dayNum = arcDayNumber(state, today)
  const completion = habitCompletion(state, today)
  const quote = MOTIVATION_QUOTES[dayNum % MOTIVATION_QUOTES.length]
  const allDone = completion === 100
  const cur = currentWeight(state)
  const weekSpent = rangeSpent(state, startOfWeek(today), today)
  const dailyAllowance = state.settings.monthlyBudget / 30

  // wake-up modal state
  const [wakeModal, setWakeModal] = useState(false)
  const [wHour, setWHour] = useState('04')
  const [wMin, setWMin] = useState('40')
  const [wPeriod, setWPeriod] = useState<'AM' | 'PM'>('AM')

  const openWakeModal = () => {
    const cur = log?.wakeUpTarget || state.settings.wakeUpTarget
    const [h, m] = cur.split(':')
    let hr = parseInt(h, 10)
    const period: 'AM' | 'PM' = hr >= 12 ? 'PM' : 'AM'
    hr = hr % 12
    if (hr === 0) hr = 12
    setWHour(String(hr).padStart(2, '0'))
    setWMin(m)
    setWPeriod(period)
    setWakeModal(true)
  }

  const saveWakeTarget = () => {
    let h = parseInt(wHour, 10)
    const m = parseInt(wMin, 10)
    if (wPeriod === 'PM' && h !== 12) h += 12
    if (wPeriod === 'AM' && h === 12) h = 0
    const t = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    updateSettings({ wakeUpTarget: t })
    setWakeModal(false)
    notify(`Wake-up target set to ${fmtTime12(t)}`)
  }

  const weight = weightProgressPct(state)
  const wake = wakeUpResult(state, today)
  const tiltOff = useTiltDisabled()

  return (
    <div className="space-y-5 fade-in">
      {/* Hero */}
      <Tilt3D max={3} scale={1.002} flat={tiltOff}>
        <section className="card relative overflow-hidden p-6 md:p-8">
          <div className="bg-3d-grid pointer-events-none absolute inset-0 opacity-60" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="relative flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <div className="text-[11px] uppercase tracking-[0.25em] text-slate-500">WINTER ARC · {fmtDateLong(today)}</div>
              <div className="mt-1 flex flex-wrap items-end gap-x-4 gap-y-1">
                <h1 className="font-display text-4xl font-bold text-shimmer md:text-5xl">{greetingFor(now.getHours())}</h1>
                <div className="font-display text-lg text-slate-500">DAY {String(dayNum).padStart(2, '0')}</div>
              </div>
              <p className="mt-2 max-w-lg text-sm text-slate-400">{quote}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="chip">🔥 {streakOverall(state, today).current}-day streak</span>
                <span className="chip">📅 {daysRemaining(state, today)} days left in arc</span>
                <span className="chip">✅ {enabledHabits(state).length} habits today</span>
              </div>
              <div className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <ProgressRing value={completion} size={110} stroke={10} label={`${completion}%`} sub="today" />
                <div>
                  <div className="text-sm text-slate-400">Today's progress</div>
                  {allDone ? (
                    <div className="mt-1 font-semibold text-emerald-300">🎯 Day complete — you showed up today.</div>
                  ) : (
                    <div className="mt-1 text-sm text-slate-500">
                      {enabledHabits(state).length - enabledHabits(state).filter((h) => log?.habits[h.id]).length} habits remaining
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="hidden shrink-0 md:block">
              <HeroOrb size={230} />
            </div>
          </div>
        </section>
      </Tilt3D>

      {allDone && <DayComplete dayNum={dayNum} />}

      {/* Week strip */}
      <Card>
        <WeekStrip date={today} onChange={() => {}} />
      </Card>

      {/* Wake-up + goal */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <SectionTitle
            icon="⏰"
            title="Wake-Up"
            subtitle="Target vs actual"
            right={
              <button className="btn btn-ghost px-2 py-1" onClick={openWakeModal} aria-label="Set wake-up target">⚙️</button>
            }
          />
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Target</div>
              <div className="font-display text-xl font-bold text-slate-100">{fmtTime12(wake.target)}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Actual</div>
              <div className="font-display text-xl font-bold text-cyan-300">{wake.actual ? fmtTime12(wake.actual) : '—'}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Result</div>
              {wake.onTime === null ? (
                <div className="font-display text-xl text-slate-600">—</div>
              ) : wake.onTime ? (
                <div className="font-display text-xl text-emerald-300">✅</div>
              ) : (
                <div className="font-display text-xl text-amber-300">⚠️</div>
              )}
            </div>
          </div>
          <div className="mt-3 text-center text-xs text-slate-500">
            {wake.onTime === false ? `Late by ${wake.lateMin} min — still showed up. Keep going.` : 'Set your actual wake-up time each morning.'}

          </div>
          <div className="mt-4 flex gap-2">
            <button
              className="btn btn-primary flex-1"
              onClick={() => {
                const n = new Date()
                setWakeActual(today, `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`)
                notify('Wake-up time recorded')
              }}
            >
              I'm awake
            </button>
            <button className="btn" onClick={() => setWakeActual(today, null)}>Clear</button>
            <button className="btn" onClick={openWakeModal}>Set target</button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle icon="🎯" title="Winter Arc Goal" subtitle="Build a healthier, stronger, more disciplined version of yourself" />
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <ProgressRing value={weight} size={150} color="#a78bfa" label={`${weight}%`} sub="to target weight" />
            <div className="flex-1">
              <div className="mb-3 flex items-baseline gap-2">
                <span className="font-display text-2xl font-bold text-slate-100">{state.profile.startWeight} kg</span>
                <span className="text-slate-500">→</span>
                <span className="font-display text-2xl font-bold text-violet-300">{state.profile.targetWeight} kg</span>
                <span className="ml-2 text-xs text-slate-500">current {cur} kg</span>
                <span className="ml-auto text-xs text-slate-500">{state.profile.targetDate ? `by ${state.profile.targetDate}` : 'no deadline'}</span>
              </div>
              <div className="relative h-2.5 overflow-hidden rounded-full bg-[#0d1013]">
                <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all duration-500" style={{ width: `${weight}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>Start {state.profile.startWeight} kg</span>
                <span>Target {state.profile.targetWeight} kg</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <MiniStat label="Days active" value={String(dayNum)} />
                <MiniStat label="Workouts" value={String(state.workouts.length)} />
                <MiniStat label="Study hours" value={fmtDuration(sum(state.studySessions.map((x) => x.minutes)))} />
                <MiniStat label="Total spent" value={fmtMoney(sum(state.expenses.map((e) => e.amount)), state.settings.currency)} />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon="🏃" label="Run today" value={dayKm(state, today) > 0 ? dayKm(state, today).toFixed(1) + ' km' : '—'} />
        <StatTile icon="📚" label="Study today" value={fmtDuration(dayMinutes(state, today))} sub={`goal ${fmtDuration(state.settings.studyGoalMin)}`} tone={dayMinutes(state, today) >= state.settings.studyGoalMin ? 'good' : 'default'} />
        <StatTile icon="💰" label="Spent today" value={fmtMoney(daySpent(state, today), state.settings.currency)} sub={`week ${fmtMoney(weekSpent, state.settings.currency)}`} tone={weekSpent > dailyAllowance * 7 ? 'warn' : 'default'} />
        <StatTile icon="⚖" label="Weight" value={`${cur} kg`} sub={`${weight}% to target`} tone="info" />
      </div>

      {/* Habits + routine */}
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <SectionTitle icon="✅" title="Habits" subtitle="Tap to toggle · edit in Habits tab" />
          <HabitList date={today} compact />
          <div className="mt-4 flex flex-col gap-2">
            <a className="btn w-full" href="#/habits">Open habit editor</a>
            <a className="btn w-full" href="#/weight">Log weight</a>
            <a className="btn w-full" href="#/study">Start focus timer</a>
          </div>
        </Card>
      </div>
      <RoutineEditor date={today} />

      {/* Wake-up target modal */}
      <Modal open={wakeModal} onClose={() => setWakeModal(false)} title="Set wake-up target">
        <div className="flex items-end gap-2">
          <div>
            <span className="label">Hour</span>
            <input className="input w-20 text-center" value={wHour} onChange={(e) => setWHour(e.target.value)} inputMode="numeric" maxLength={2} />
          </div>
          <span className="pb-2 text-slate-500">:</span>
          <div>
            <span className="label">Minute</span>
            <input className="input w-20 text-center" value={wMin} onChange={(e) => setWMin(e.target.value)} inputMode="numeric" maxLength={2} />
          </div>
          <div>
            <span className="label">Period</span>
            <div className="flex gap-1">
              {(['AM', 'PM'] as const).map((p) => (
                <button key={p} className={`btn px-3 py-2 ${wPeriod === p ? 'btn-primary' : ''}`} onClick={() => setWPeriod(p)}>{p}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn" onClick={() => setWakeModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={saveWakeTarget}>Save</button>
        </div>
      </Modal>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-base-border bg-base-card2 p-3">
      <div className="text-[11px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="mt-1 font-display text-lg font-semibold text-slate-100">{value}</div>
    </div>
  )
}

function DayComplete({ dayNum }: { dayNum: number }) {
  return (
    <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 md:bottom-8 md:left-auto md:right-8 md:translate-x-0">
      <div className="glass flex items-center gap-3 rounded-2xl border border-emerald-400/30 px-5 py-3.5 shadow-card fade-in">
        <span className="text-2xl" aria-hidden>🎯</span>
        <div>
          <div className="font-display font-bold text-emerald-300">DAY COMPLETE</div>
  <div className="text-xs text-slate-400">Day {dayNum} · 100% — you showed up today.</div>
        </div>
      </div>
    </div>
  )
}