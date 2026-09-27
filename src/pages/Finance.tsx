import { useState } from 'react'
import { useStore } from '../state/store'
import { Card, SectionTitle, StatTile, EmptyState } from '../ui/primitives'
import { ProgressRing } from '../ui/controls'
import { DonutChart, SimpleBarChart, TrendLineChart, LegendDots } from '../ui/charts'
import { daySpent, monthSpent, rangeSpent, streakBudget } from '../state/stats'
import { EXPENSE_CATEGORIES, EXPENSE_COLORS } from '../data/defaults'
import { addDays, fmtDate, fmtMoney, startOfWeek } from '../utils'

export function FinancePage() {
  const { state, today, addExpense, deleteExpense, notify, updateSettings } = useStore()
  const [form, setForm] = useState({ date: today, category: 'Food', description: '', amount: '' })
  const [error, setError] = useState('')

  const cur = state.settings.currency
  const todaySpent = daySpent(state, today)
  const weekSpent = rangeSpent(state, startOfWeek(today), today)
  const monthKeyStr = today.slice(0, 7)
  const monthTotal = monthSpent(state, monthKeyStr)
  const budget = state.settings.monthlyBudget
  const budgetPct = budget > 0 ? Math.min(100, Math.round((monthTotal / budget) * 100)) : 0
  const remaining = budget - monthTotal
  const bStreak = streakBudget(state, today)

  const byCategory = EXPENSE_CATEGORIES.map((c) => ({
    name: c,
    value: sumBy(state.expenses.filter((e) => e.date.startsWith(monthKeyStr) && e.category === c), (e) => e.amount),
  })).filter((r) => r.value > 0)

  const days31 = Array.from({ length: 31 }, (_, i) => addDays(today, i - 30))
  const dailyData = days31.map((d) => ({ date: fmtDate(d), amount: daySpent(state, d) }))

  const recent = [...state.expenses].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 12)

  const submit = () => {
    const amt = parseFloat(form.amount)
    if (!isFinite(amt) || amt <= 0) {
      setError('Enter a valid amount')
      return
    }
    addExpense({ date: form.date, category: form.category, description: form.description.trim() || form.category, amount: Math.round(amt * 100) / 100 })
    notify(`Logged ${fmtMoney(amt, cur)} — ${form.category}`)
    setForm({ date: today, category: 'Food', description: '', amount: '' })
    setError('')
  }

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-shimmer">Finance</h1>
        <p className="mt-1 text-sm text-slate-500">Know where every rupee goes</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon="📅" label="Today" value={fmtMoney(todaySpent, cur)} />
        <StatTile icon="🗓" label="This week" value={fmtMoney(weekSpent, cur)} />
        <StatTile icon="📆" label="This month" value={fmtMoney(monthTotal, cur)} tone={remaining < 0 ? 'warn' : 'info'} />
        <StatTile icon="🔥" label="Budget streak" value={`${bStreak.current}d`} sub={`best ${bStreak.best}d`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <SectionTitle icon="🎯" title="Monthly budget" subtitle={remaining >= 0 ? `${fmtMoney(remaining, cur)} remaining` : `Over by ${fmtMoney(-remaining, cur)}`} />
          <div className="flex flex-col items-center gap-4">
            <ProgressRing value={budgetPct} size={150} color={remaining < 0 ? '#fb7185' : '#34d399'} label={fmtMoney(monthTotal, cur)} sub={`of ${fmtMoney(budget, cur)}`} />
            <input
              type="range"
              min={500}
              max={20000}
              step={500}
              value={budget}
              onChange={(e) => updateSettings({ monthlyBudget: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle icon="🧾" title="Add expense" subtitle="Date · category · description · amount" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <div>
              <span className="label">Date</span>
              <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <span className="label">Category</span>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <span className="label">Description</span>
              <input className="input" placeholder="e.g. Snack" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <span className="label">Amount</span>
              <input type="number" min="0" step="0.01" className="input" placeholder="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
          </div>
          {error && <div className="mt-2 text-xs text-rose-300">{error}</div>}
          <button className="btn btn-primary mt-4" onClick={submit}>Save expense</button>

          <div className="mt-6">
            <div className="mb-2 text-xs uppercase tracking-wider text-slate-500">Recent expenses</div>
            {recent.length === 0 ? (
              <EmptyState icon="🧾" title="No expenses yet" hint="Log your first expense above." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-base-border text-left text-xs uppercase tracking-wider text-slate-500">
                      <th className="py-2 pr-3">Date</th>
                      <th className="py-2 pr-3">Category</th>
                      <th className="py-2 pr-3">Description</th>
                      <th className="py-2 pr-3 text-right">Amount</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((e) => (
                      <tr key={e.id} className="border-b border-base-border/50">
                        <td className="py-2 pr-3 text-slate-300">{fmtDate(e.date)}</td>
                        <td className="py-2 pr-3">
                          <span className="chip" style={{ borderColor: (EXPENSE_COLORS[e.category] || '#94a3b8') + '55' }}>
                            <span className="inline-block h-2 w-2 rounded-full" style={{ background: EXPENSE_COLORS[e.category] || '#94a3b8' }} />
                            {e.category}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-slate-300">{e.description}</td>
                        <td className="py-2 pr-3 text-right font-medium text-slate-100">{fmtMoney(e.amount, cur)}</td>
                        <td className="py-2 text-right">
                          <button className="btn btn-ghost px-2 py-1 text-xs text-rose-300" onClick={() => deleteExpense(e.id)}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <SectionTitle icon="🍩" title="By category" subtitle="This month" />
          {byCategory.length === 0 ? (
            <EmptyState icon="🍩" title="No data yet" />
          ) : (
            <>
              <DonutChart data={byCategory} nameKey="name" valueKey="value" colors={byCategory.map((r) => EXPENSE_COLORS[r.name] || '#94a3b8')} centerLabel={fmtMoney(monthTotal, cur)} centerSub="this month" />
              <LegendDots items={byCategory.map((r) => ({ label: `${r.name} — ${fmtMoney(r.value, cur)}`, color: EXPENSE_COLORS[r.name] || '#94a3b8' }))} />
            </>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle icon="📊" title="Daily spending" subtitle="Last 31 days" />
          <SimpleBarChart data={dailyData} xKey="date" yKey="amount" name="spent" color="#fbbf24" />
        </Card>
      </div>
    </div>
  )
}

function sumBy<T>(arr: T[], f: (x: T) => number): number {
  return arr.reduce((a, b) => a + f(b), 0)
}
