import { useMemo } from 'react'
import type { AppState } from '../types'
import { heatmapData } from '../state/stats'
import { fmtDateLong, fmtDuration, fmtMoney, fmtKm } from '../utils'
import type { HeatCell } from '../state/stats'

function intensity(completion: number): string {
  if (completion <= 0) return 'bg-[#14181c] border border-base-border'
  if (completion < 25) return 'bg-cyan-400/10'
  if (completion < 50) return 'bg-cyan-400/25'
  if (completion < 75) return 'bg-cyan-400/50'
  return 'bg-cyan-400/80'
}

export function Heatmap({ state, from, to }: { state: AppState; from: string; to: string }) {
  const cells = useMemo(() => heatmapData(state, from, to), [state, from, to])

  // group cells into weeks (columns), Monday first
  const weeks: HeatCell[][] = useMemo(() => {
    const out: HeatCell[][] = []
    let week: HeatCell[] = []
    for (const cell of cells) {
      const dow = (new Date(cell.date + 'T00:00:00').getDay() + 6) % 7
      while (week.length < dow && week.length < 7) week.push({ ...cell, date: '' } as HeatCell)
      // pad start of first week with blanks
      if (out.length === 0 && week.length < dow) {
        week = Array.from({ length: dow }, () => ({ ...cell, date: '' } as HeatCell))
      }
      week.push(cell)
      if (dow === 6) {
        out.push(week)
        week = []
      }
    }
    if (week.length) out.push(week)
    return out
  }, [cells])

  const months = useMemo(() => {
    const labels: { idx: number; label: string }[] =
      []
    let last = ''
    weeks.forEach((w, i) => {
      const first = w.find((c) => c.date)
      if (!first) return
      const mk = first.date.slice(0, 7)
      if (mk !== last) {
        labels.push({ idx: i, label: new Date(first.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short' }) })
        last = mk
      }
    })
    return labels
  }, [weeks])

  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex flex-col gap-1">
          {/* month labels */}
          <div className="flex gap-[3px]">
            {weeks.map((_, i) => {
              const m = months.find((x) => x.idx === i)
              return (
                <div key={i} className="w-[15px] text-[9px] text-slate-600">
                  {m ? m.label : ''}
                </div>
              )
            })}
          </div>
          {Array.from({ length: 7 }).map((_, dow) => (
            <div key={dow} className="flex gap-[3px]">
              {weeks.map((week, wi) => {
                const cell = week[dow]
                if (!cell || !cell.date) return <div key={wi} className="h-[15px] w-[15px]" />
                return (
                  <div
                    key={wi}
                    className={`group relative h-[15px] w-[15px] rounded-[3px] ${intensity(cell.completion)}`}
                    tabIndex={0}
                  >
                    <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden w-52 -translate-x-1/2 rounded-lg border border-base-border bg-[#111417] p-2.5 text-xs shadow-card group-hover:block group-focus:block">
                      <div className="mb-1 font-medium text-slate-200">{fmtDateLong(cell.date)}</div>
                      <div className="space-y-0.5 text-slate-500">
                        <div>Completion: <span className="text-slate-300">{cell.completion}%</span></div>
                        <div>Study: <span className="text-slate-300">{fmtDuration(cell.studyMin)}</span></div>
                        <div>Workout: <span className="text-slate-300">{cell.km > 0 ? fmtKm(cell.km) : '—'}</span></div>
                        <div>Spent: <span className="text-slate-300">{cell.spent > 0 ? fmtMoney(cell.spent) : '—'}</span></div>
                        {cell.weight !== null && <div>Weight: <span className="text-slate-300">{cell.weight} kg</span></div>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-600">
        <span>Less</span>
        <span className="h-[10px] w-[10px] rounded-[2px] bg-[#14181c] border border-base-border" />
        <span className="h-[10px] w-[10px] rounded-[2px] bg-cyan-400/10" />
        <span className="h-[10px] w-[10px] rounded-[2px] bg-cyan-400/25" />
        <span className="h-[10px] w-[10px] rounded-[2px] bg-cyan-400/50" />
        <span className="h-[10px] w-[10px] rounded-[2px] bg-cyan-400/80" />
        <span>More</span>
      </div>
    </div>
  )
}
