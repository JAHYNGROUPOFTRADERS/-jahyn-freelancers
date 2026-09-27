import { useMemo, useState } from 'react'
import { useStore } from '../state/store'
import { Checkbox } from './controls'
import { Pill } from './primitives'
import { habitCompletion } from '../state/stats'
import { pct } from '../utils'

const CATEGORY_ORDER = ['MORNING', 'SCHOOL', 'STUDY', 'HEALTH', 'DISCIPLINE', 'FINANCE', 'CUSTOM']

export function HabitList({ date, compact }: { date: string; compact?: boolean }) {
  const { state, toggleHabit } = useStore()
  const log = state.dailyLogs[date]

  const grouped = useMemo(() => {
    const groups: Record<string, typeof state.habits> = {}
    for (const h of state.habits) {
      if (!h.enabled) continue
      const key = CATEGORY_ORDER.includes(h.category) ? h.category : 'CUSTOM'
      ;(groups[key] ||= []).push(h)
    }
    return CATEGORY_ORDER.filter((c) => groups[c]?.length).map((c) => [c, groups[c]] as const)
  }, [state.habits])

  const overall = habitCompletion(state, date)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-base-border bg-base-card2 px-4 py-3">
        <div className="text-sm text-slate-400">
          <span className="font-display text-xl font-bold text-slate-100">{pct(overall)}</span>
          <span className="ml-2">of today's habits complete</span>
        </div>
        <div className="hidden h-2 w-40 overflow-hidden rounded-full bg-[#0d1013] sm:block">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all duration-500"
            style={{ width: `${overall}%` }}
          />
        </div>
        <Pill tone={overall >= 80 ? 'ok' : 'default'}>{overall >= 80 ? 'Great pace' : 'Keep going'}</Pill>
      </div>

      {grouped.map(([cat, habits]) => (
        <div key={cat}>
          <div className="mb-2 flex items-center gap-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{cat}</h4>
            <span className="text-xs text-slate-600">
              {habits.filter((h) => log?.habits[h.id]).length}/{habits.length}
            </span>
          </div>
          <div className={compact ? 'space-y-1.5' : 'space-y-2'}>
            {habits.map((h) => {
              const done = !!log?.habits[h.id]
              return (
                <button
                  key={h.id}
                  onClick={() => toggleHabit(date, h.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-150 ${
                    done
                      ? 'border-cyan-400/25 bg-cyan-400/[0.06] hover:bg-cyan-400/10'
                      : 'border-base-border bg-base-card2/50 hover:border-slate-600 hover:bg-base-card2'
                  }`}
                >
                  <Checkbox checked={done} onChange={() => toggleHabit(date, h.id)} />
                  <span className={`flex-1 text-sm ${done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{h.name}</span>
                  {done && <span className="text-xs text-cyan-300">✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
