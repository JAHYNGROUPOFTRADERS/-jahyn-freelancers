import { useMemo, useState } from 'react'
import { useStore } from '../state/store'
import { Card, SectionTitle, StatTile, EmptyState } from '../ui/primitives'
import { TrendLineChart, SimpleBarChart, DonutChart, LegendDots } from '../ui/charts'
import { Heatmap } from '../ui/Heatmap'
import { Checkbox } from '../ui/controls'
import {
  arcDayNumber, dayKm, dayMinutes, daySpent, habitCompletion, monthSpent, rangeKm, rangeMinutes,
  streakExercise, streakStudy, streakOverall, streakWakeUp, streakCleanFood, streakBudget,
  currentWeight, weightProgressPct, endOfPeriodStr, enabledHabits, wakeUpResult,
} from '../state/stats'
import { Modal } from '../ui/primitives'
import { EXPENSE_CATEGORIES, EXPENSE_COLORS } from '../data/defaults'
import { addDays, fmtDate, fmtDuration, fmtHours, fmtKm, fmtMoney, pct, startOfMonth, startOfWeek, sum } from '../utils'

export function AnalyticsPage() {
  const { state, today } = useStore()
  const [showReport, setShowReport] = useState(false)
  const cur = state.settings.currency

  const days30 = useMemo(() => Array.from({ length: 30 }, (_, i) => addDays(today, i - 29)), [today])
  const days14 = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(today, i - 13)), [today])

  const weightData = [...state.weightEntries].sort((a, b) => (a.date < b.date ? -1 : 1)).map((w) => ({ date: fmtDate(w.date), kg: w.kg }))
  const runData = days30.map((d) => ({ date: fmtDate(d), km: Math.round(dayKm(state, d) * 10) / 10 }))
  const studyData = days30.map((d) => ({ date: fmtDate(d), hours: Math.round((dayMinutes(state, d) / 60) * 10) / 10 }))
  const spendData = days30.map((d) => ({ date: fmtDate(d), amount: daySpent(state, d) }))

  const mk = today.slice(0, 7)
  const byCategory = EXPENSE_CATEGORIES.map((c) => ({ name: c, value: sum(state.expenses.filter((e) => e.date.startsWith(mk) && e.category === c).map((e) => e.amount)) })).filter((r) => r.value > 0)
  const monthTotal = monthSpent(state, mk)

  const bySubject = ['Physics', 'Chemistry', 'Biology', 'Maths', 'English', 'Other']
    .map((s) => ({ subject: s, min: sum(state.studySessions.filter((x) => x.subject === s).map((x) => x.minutes)) }))
    .filter((r) => r.min > 0)

  const weeks8 = Array.from({ length: 8 }, (_, i) => startOfWeek(addDays(today, i * 7 - 49)))
  const workoutWeekData = weeks8.map((ws) => ({
    week: fmtDate(ws),
    min: sum(state.workouts.filter((w) => w.date >= ws && w.date <= addDays(ws, 6)).map((w) => w.durationMin)),
  }))

  const habitBarData = days14.map((d) => ({ date: fmtDate(d), pct: habitCompletion(state, d) }))

  const stO = streakOverall(state, today)
  const stEx = streakExercise(state, today)
  const stSt = streakStudy(state, today)
  const stFood = streakCleanFood(state, today)
  const stBud = streakBudget(state, today)
  const stWake = streakWakeUp(state, today)

  const arcStart = state.settings.arcStartDate
  const heatFrom = arcStart < addDays(today, -120) ? addDays(today, -120) : arcStart

  const completionAvg = Math.round(sum(days30.map((d) => habitCompletion(state, d))) / 30)

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-shimmer">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">Your arc, measured. Trends beat single days.</p>
      </div>

      {/* Streaks */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <StatTile icon="🔥" label="Overall" value={`${stO.current}d`} sub={`best ${stO.best}`} tone="good" />
        <StatTile icon="🏃" label="Exercise" value={`${stEx.current}d`} sub={`best ${stEx.best}`} />
        <StatTile icon="📚" label="Study" value={`${stSt.current}d`} sub={`best ${stSt.best}`} />
        <StatTile icon="🥗" label="Clean food" value={`${stFood.current}d`} sub={`best ${stFood.best}`} />
        <StatTile icon="💰" label="Budget" value={`${stBud.current}d`} sub={`best ${stBud.best}`} />
        <StatTile icon="⏰" label="Wake-up" value={`${stWake.current}d`} sub={`best ${stWake.best}`} />
      </div>

      {/* Milestone badges */}
      <Card>
        <SectionTitle icon="🏆" title="Milestones" subtitle="Earned by discipline streaks" />
        <MilestoneBadges streak={Math.max(stO.current, stEx.current, stSt.current, stFood.current)} />
      </Card>

      {/* Charts grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle icon="⚖" title="Weight progression" />
          {weightData.length < 2 ? <EmptyState icon="⚖" title="Add weight entries" /> : <TrendLineChart data={weightData} xKey="date" yKey="kg" name="kg" area color="#a78bfa" />}
        </Card>
        <Card>
          <SectionTitle icon="🏃" title="Running distance" subtitle="Last 30 days" />
          <TrendLineChart data={runData} xKey="date" yKey="km" name="km" area color="#22d3ee" />
        </Card>
        <Card>
          <SectionTitle icon="📚" title="Study hours" subtitle="Last 30 days" />
          <TrendLineChart data={studyData} xKey="date" yKey="hours" name="hours" area color="#34d399" />
        </Card>
        <Card>
          <SectionTitle icon="💰" title="Daily spending" subtitle="Last 30 days" />
          <TrendLineChart data={spendData} xKey="date" yKey="amount" name="spent" color="#fbbf24" />
        </Card>
        <Card>
          <SectionTitle icon="📚" title="Study by subject" subtitle="Total minutes" />
          {bySubject.length === 0 ? <EmptyState icon="📚" title="No study data" /> : <SimpleBarChart data={bySubject} xKey="subject" yKey="min" name="minutes" color="#a78bfa" />}
        </Card>
        <Card>
          <SectionTitle icon="💪" title="Weekly workout duration" subtitle="Minutes per week — last 8 weeks" />
          <SimpleBarChart data={workoutWeekData} xKey="week" yKey="min" name="minutes" color="#22d3ee" />
        </Card>
        <Card>
          <SectionTitle icon="✅" title="Daily habit completion" subtitle="Percent per day — last 14 days" />
          <SimpleBarChart data={habitBarData} xKey="date" yKey="pct" name="%" color="#34d399" />
        </Card>
        <Card>
          <SectionTitle icon="🍩" title="Expense categories" subtitle="This month" />
          {byCategory.length === 0 ? <EmptyState icon="🍩" title="No expenses" /> : (
            <>
              <DonutChart data={byCategory} nameKey="name" valueKey="value" colors={byCategory.map((r) => EXPENSE_COLORS[r.name] || '#94a3b8')} centerLabel={fmtMoney(monthTotal, cur)} centerSub="this month" />
              <LegendDots items={byCategory.map((r) => ({ label: r.name, color: EXPENSE_COLORS[r.name] || '#94a3b8' }))} />
            </>
          )}
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <SectionTitle icon="🟩" title="Consistency heatmap" subtitle="Hover a day for details · intensity = habit completion" />
        <Heatmap state={state} from={heatFrom} to={today} />
      </Card>

      {/* Monthly report */}
      <Card>
        <SectionTitle
          icon="📄"
          title="Monthly report"
          subtitle="Factual, encouraging — generated from your data"
          right={<button className="btn btn-primary" onClick={() => setShowReport(true)}>View report</button>}
        />
        <p className="text-sm text-slate-500">
          A summary for {new Date(today + 'T00:00:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} is ready.
        </p>
      </Card>

      <MonthlyReportModal open={showReport} onClose={() => setShowReport(false)} />
    </div>
  )
}

function MilestoneBadges({ streak }: { streak: number }) {
  const milestones = [
    { days: 7, label: '7 DAY START' },
    { days: 14, label: '14 DAY MOMENTUM' },
    { days: 30, label: '30 DAY DISCIPLINE' },
    { days: 60, label: '60 DAY POWER' },
    { days: 90, label: '90 DAY LEGEND' },
  ]
  return (
    <div className="flex flex-wrap gap-3">
      {milestones.map((m) => {
        const earned = streak >= m.days
        return (
          <div
            key={m.days}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 ${
              earned ? 'border-amber-400/40 bg-amber-400/10 text-amber-200' : 'border-base-border bg-base-card2 text-slate-600'
            }`}
          >
            <span aria-hidden>{earned ? '🏆' : '🔒'}</span>
            <span className="text-sm font-semibold">{m.days} DAYS</span>
            <span className="text-[11px] uppercase tracking-wider opacity-70">{earned ? m.label : 'locked'}</span>
          </div>
        )
      })}
    </div>
  )
}

function MonthlyReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, today } = useStore()
  const mk = today.slice(0, 7)
  const days = Array.from({ length: 31 }, (_, i) => `${mk}-${String(i + 1).padStart(2, '0')}`).filter((d) => d <= today)
  const tracked = days.filter((d) => state.dailyLogs[d])
  const avgCompletion = tracked.length ? Math.round(sum(tracked.map((d) => habitCompletion(state, d))) / tracked.length) : 0
  const studyH = Math.round(sum(state.studySessions.filter((x) => x.date.startsWith(mk)).map((x) => x.minutes)) / 60)
  const runKm = Math.round(sum(state.workouts.filter((x) => x.date.startsWith(mk)).map((x) => x.distanceKm)) * 10) / 10
  const cleanDays = tracked.filter((d) => state.dailyLogs[d].junkFood === false).length
  const wakeDays = tracked.filter((d) => state.dailyLogs[d].wakeUpActual).length
  const wakeOnTime = tracked.filter((d) => state.dailyLogs[d].wakeUpActual && wakeUpResult(state, d).onTime).length
  const spent = monthSpent(state, mk)
  const stO = streakOverall(state, today)

  // most consistent habit + one needing improvement
  const habitStats = enabledHabits(state)
    .map((h) => ({ h, n: tracked.filter((d) => state.dailyLogs[d].habits[h.id]).length }))
    .sort((a, b) => b.n - a.n)
  const bestHabit = habitStats[0]
  const worstHabit = habitStats[habitStats.length - 1]

  return (
    <Modal open={open} onClose={onClose} title={`${new Date(today + 'T00:00:00').toLocaleDateString(undefined, { month: 'long' })} Report`} wide>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <MiniStat label="Days tracked" value={`${tracked.length}/${days.length}`} />
        <MiniStat label="Habit completion" value={pct(avgCompletion)} />
        <MiniStat label="Study time" value={`${studyH} h`} />
        <MiniStat label="Running" value={fmtKm(runKm)} />
        <MiniStat label="Clean-food days" value={`${cleanDays}/${tracked.length}`} />
        <MiniStat label="Wake-ups logged" value={`${wakeDays}`} />
        <MiniStat label="Wake-up consistency" value={wakeDays ? pct((wakeOnTime / wakeDays) * 100) : '—'} />
        <MiniStat label="Money spent" value={fmtMoney(spent, state.settings.currency)} />
        <MiniStat label="Longest overall streak" value={`${stO.best} days`} />
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/5 p-4">
          <div className="text-xs uppercase tracking-wider text-emerald-300">Most consistent habit</div>
          <div className="mt-1 font-display text-lg font-semibold text-slate-100">{bestHabit ? bestHabit.h.name : '—'}</div>
        </div>
        <div className="rounded-xl border border-amber-400/25 bg-amber-400/5 p-4">
          <div className="text-xs uppercase tracking-wider text-amber-300">Focus area next month</div>
          <div className="mt-1 font-display text-lg font-semibold text-slate-100">{worstHabit ? worstHabit.h.name : '—'}</div>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        Numbers describe your routines, not your worth. Trends over months matter more than any single day — keep the process running.
      </p>
      <div className="mt-4 flex justify-end">
        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </Modal>
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


