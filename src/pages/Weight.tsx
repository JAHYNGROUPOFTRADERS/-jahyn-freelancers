import { useState } from 'react'
import { useStore } from '../state/store'
import { Card, SectionTitle, StatTile, EmptyState } from '../ui/primitives'
import { ConfirmDialog } from '../ui/confirm'
import { TrendLineChart } from '../ui/charts'
import { ProgressRing } from '../ui/controls'
import { currentWeight, latestWeight, weightProgressPct } from '../state/stats'
import { fmtDate, fmtDateLong } from '../utils'

export function WeightPage() {
  const { state, today, addWeightEntry, deleteWeightEntry, notify } = useStore()
  const [date, setDate] = useState(today)
  const [kg, setKg] = useState('')
  const [confirmDel, setConfirmDel] = useState<string | null>(null)

  const cur = currentWeight(state)
  const start = state.profile.startWeight
  const target = state.profile.targetWeight
  const progress = weightProgressPct(state)
  const change = Math.round((cur - start) * 10) / 10
  const remaining = Math.round((cur - target) * 10) / 10
  const sorted = [...state.weightEntries].sort((a, b) => (a.date < b.date ? -1 : 1))
  const chartData = sorted.map((w) => ({ date: fmtDate(w.date), kg: w.kg }))

  const submit = () => {
    const v = parseFloat(kg)
    if (!isFinite(v) || v <= 0 || v > 400) {
      notify('Enter a valid weight', 'warn')
      return
    }
    addWeightEntry({ date, kg: Math.round(v * 10) / 10 })
    notify(`Weight logged: ${v} kg`)
    setKg('')
  }

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-shimmer">Weight Journey</h1>
        <p className="mt-1 text-sm text-slate-500">Focus on long-term trends, not daily fluctuations</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon="🚀" label="Starting" value={`${start} kg`} />
        <StatTile icon="📍" label="Current" value={`${cur} kg`} tone="info" />
        <StatTile icon="🏁" label="Target" value={`${target} kg`} />
        <StatTile icon="📉" label="Progress" value={`${progress}%`} tone={progress >= 50 ? 'good' : 'default'} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle icon="⚖" title="Weight trend" subtitle="Target line in amber · weekly entries recommended" />
          {chartData.length < 2 ? (
            <EmptyState icon="⚖" title="Add at least two entries" hint="One entry exists from your start date — add another to see the trend." />
          ) : (
            <TrendLineChart
              data={chartData}
              xKey="date"
              yKey="kg"
              name="kg"
              area
              color="#a78bfa"
              refLine={target}
              refLabel={`target ${target} kg`}
            />
          )}
        </Card>

        <Card>
          <SectionTitle icon="🎯" title="Journey" />
          <div className="flex flex-col items-center gap-4">
            <ProgressRing value={progress} size={150} color="#a78bfa" label={`${progress}%`} sub="of the way" />
            <div className="w-full space-y-2 text-sm">
              <Row label="Total change" value={`${change > 0 ? '+' : ''}${change} kg`} />
              <Row label="Remaining" value={`${remaining > 0 ? remaining : 0} kg`} />
              <Row label="Entries" value={String(state.weightEntries.length)} />
              <Row label="Last entry" value={latestWeight(state) ? fmtDateLong(latestWeight(state)!.date) : '—'} />
            </div>
            <div className="w-full rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-xs leading-relaxed text-amber-200/80">
              Target: build a healthier, stronger and more disciplined version of yourself. A sustainable pace is 0.25–0.5 kg per week — no crash dieting.
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle icon="➕" title="Add entry" subtitle="Weekly weigh-ins keep the trend clean" />
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <span className="label">Date</span>
            <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <span className="label">Weight (kg)</span>
            <input type="number" step="0.1" min="0" className="input w-36" placeholder="e.g. 82.5" value={kg} onChange={(e) => setKg(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={submit}>Save entry</button>
        </div>

        <div className="mt-5 overflow-x-auto">
          {sorted.length === 0 ? (
            <EmptyState icon="🗒" title="No entries yet" />
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-border text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Weight</th>
                  <th className="py-2 pr-3">Change vs start</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sorted.slice().reverse().map((w) => (
                  <tr key={w.date} className="border-b border-base-border/50">
                    <td className="py-2 pr-3 text-slate-300">{fmtDate(w.date)}</td>
                    <td className="py-2 pr-3 font-medium text-slate-100">{w.kg} kg</td>
                    <td className="py-2 pr-3 text-slate-400">
                      {w.kg - start >= 0 ? '+' : ''}
                      {Math.round((w.kg - start) * 10) / 10} kg
                    </td>
                    <td className="py-2 text-right">
                      <button className="btn btn-ghost px-2 py-1 text-xs text-rose-300" onClick={() => setConfirmDel(w.date)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={confirmDel !== null}
        title="Delete weight entry"
        message={`Remove the entry from ${confirmDel ? fmtDateLong(confirmDel) : ''}? You can re-add it anytime.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => confirmDel && deleteWeightEntry(confirmDel)}
        onClose={() => setConfirmDel(null)}
      />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-base-border pb-1.5">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-100">{value}</span>
    </div>
  )
}
