import { useState } from 'react'
import { useStore } from '../state/store'
import { Card, SectionTitle, StatTile, EmptyState } from '../ui/primitives'
import { TrendLineChart, SimpleBarChart } from '../ui/charts'
import {
  dayKm, rangeKm, rangeWorkoutMin, streakExercise, rangeMinutes, dayMinutes,
} from '../state/stats'
import { addDays, fmtDate, fmtDuration, fmtKm, pace, startOfWeek, sum, weekdayShort } from '../utils'
import { WORKOUT_TYPES } from '../data/defaults'
import { HabitList } from '../ui/HabitList'

export function FitnessPage() {
  const { state, today, addWorkout, deleteWorkout, notify } = useStore()
  const [form, setForm] = useState({ date: today, type: 'Run', distanceKm: '', durationMin: '', steps: '', calories: '' })

  const weekStart = startOfWeek(today)
  const weekKm = rangeKm(state, weekStart, today)
  const monthStart = today.slice(0, 7) + '-01'
  const monthKm = rangeKm(state, monthStart, today)
  const totalKm = sum(state.workouts.map((w) => w.distanceKm))
  const weekWorkoutMin = rangeWorkoutMin(state, weekStart, today)
  const exStreak = streakExercise(state, today)

  // last 14 days distance
  const days14 = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13))
  const distData = days14.map((d) => ({ date: fmtDate(d), km: Math.round(dayKm(state, d) * 10) / 10 }))

  // weekly distance last 6 weeks
  const weeks6 = Array.from({ length: 6 }, (_, i) => startOfWeek(addDays(today, i * 7 - 35)))
  const weekData = weeks6.map((ws) => ({
    week: fmtDate(ws),
    km: Math.round(rangeKm(state, ws, addDays(ws, 6)) * 10) / 10,
  }))

  const recent = [...state.workouts].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 12)

  const submit = () => {
    const km = parseFloat(form.distanceKm) || 0
    const min = parseInt(form.durationMin, 10) || 0
    const steps = parseInt(form.steps, 10) || 0
    const cal = form.calories ? parseInt(form.calories, 10) : null
    if (km === 0 && min === 0) {
      notify('Enter distance or duration', 'warn')
      return
    }
    addWorkout({ date: form.date, type: form.type, distanceKm: km, durationMin: min, steps, calories: cal })
    notify('Workout logged — nice work')
    setForm({ date: today, type: 'Run', distanceKm: '', durationMin: '', steps: '', calories: '' })
  }

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-shimmer">Fitness</h1>
        <p className="mt-1 text-sm text-slate-500">Manual entry — every session counts</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon="🏃" label="Week distance" value={fmtKm(weekKm)} sub={`goal ${state.settings.runGoalKm} km/day pace`} />
        <StatTile icon="📅" label="Month distance" value={fmtKm(monthKm)} tone="info" />
        <StatTile icon="⚡" label="Week workout time" value={fmtDuration(weekWorkoutMin)} />
        <StatTile icon="🔥" label="Exercise streak" value={`${exStreak.current}d`} sub={`best ${exStreak.best}d`} tone="good" />
      </div>

      <Card>
        <SectionTitle icon="➕" title="Log a workout" subtitle="Calories are optional and approximate — not a medical estimate" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
          <div>
            <span className="label">Date</span>
            <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <span className="label">Type</span>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {WORKOUT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="label">Distance (km)</span>
            <input type="number" step="0.1" min="0" className="input" placeholder="0.0" value={form.distanceKm} onChange={(e) => setForm({ ...form, distanceKm: e.target.value })} />
          </div>
          <div>
            <span className="label">Duration (min)</span>
            <input type="number" min="0" className="input" placeholder="0" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} />
          </div>
          <div>
            <span className="label">Steps (opt.)</span>
            <input type="number" min="0" className="input" placeholder="0" value={form.steps} onChange={(e) => setForm({ ...form, steps: e.target.value })} />
          </div>
          <div>
            <span className="label">Calories (opt.)</span>
            <input type="number" min="0" className="input" placeholder="—" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button className="btn btn-primary" onClick={submit}>Save workout</button>
          {form.distanceKm && form.durationMin && parseFloat(form.durationMin) > 0 && parseFloat(form.distanceKm) > 0 && (
            <span className="chip">Pace: {pace(parseFloat(form.durationMin) / parseFloat(form.distanceKm))}</span>
          )}
</div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle icon="📈" title="Distance per day" subtitle="Last 14 days" />
          <TrendLineChart data={distData} xKey="date" yKey="km" name="km" area color="#22d3ee" />
        </Card>
        <Card>
          <SectionTitle icon="📊" title="Distance per week" subtitle="Last 6 weeks" />
          <SimpleBarChart data={weekData} xKey="week" yKey="km" name="km" color="#7dd3fc" />
        </Card>
      </div>

      <Card>
        <SectionTitle icon="🗒" title="Recent workouts" subtitle="Most recent 12" />
        {recent.length === 0 ? (
          <EmptyState icon="🏃" title="No workouts yet" hint="Log your first run above — data feeds the charts and streaks." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-border text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Distance</th>
                  <th className="py-2 pr-3">Duration</th>
                  <th className="py-2 pr-3">Pace</th>
                  <th className="py-2 pr-3">Steps</th>
                  <th className="py-2 pr-3">Cal</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {recent.map((w) => {
                  const p = w.distanceKm > 0 ? w.durationMin / w.distanceKm : undefined
                  return (
                    <tr key={w.id} className="border-b border-base-border/50">
                      <td className="py-2 pr-3 text-slate-300">{fmtDate(w.date)}</td>
                      <td className="py-2 pr-3 text-slate-400">{w.type}</td>
                      <td className="py-2 pr-3 text-slate-200">{w.distanceKm > 0 ? fmtKm(w.distanceKm) : '—'}</td>
                      <td className="py-2 pr-3 text-slate-200">{w.durationMin > 0 ? fmtDuration(w.durationMin) : '—'}</td>
                      <td className="py-2 pr-3 text-slate-400">{p ? pace(p) : '—'}</td>
                      <td className="py-2 pr-3 text-slate-400">{w.steps || '—'}</td>
                      <td className="py-2 pr-3 text-slate-400">{w.calories ?? '—'}</td>
                      <td className="py-2 text-right">
                        <button className="btn btn-ghost px-2 py-1 text-xs text-rose-300" onClick={() => deleteWorkout(w.id)}>✕</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
