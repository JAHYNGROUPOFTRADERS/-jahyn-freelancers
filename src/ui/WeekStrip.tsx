import { useMemo } from 'react'
import { useStore } from '../state/store'
import { addDays, fmtDate, parseDate } from '../utils'
import { habitCompletion } from '../state/stats'

export function WeekStrip({ date, onChange }: { date: string; onChange: (d: string) => void }) {
  const { state, today } = useStore()

  const days = useMemo(() => {
    const base = parseDate(date)
    const dow = (base.getDay() + 6) % 7
    const monday = addDays(date, -dow)
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  }, [date])

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <button className="btn px-2.5 py-1.5" onClick={() => onChange(addDays(date, -7))} aria-label="Previous week">
          ‹
        </button>
        <div className="text-sm font-medium text-slate-300">{fmtDate(date, { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        <div className="flex gap-1.5">
          {date !== today && (
            <button className="btn btn-primary px-2.5 py-1.5" onClick={() => onChange(today)}>
              Today
            </button>
          )}
          <button className="btn px-2.5 py-1.5" onClick={() => onChange(addDays(date, 7))} aria-label="Next week">
            ›
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const c = habitCompletion(state, d)
          const isToday = d === today
          const isFuture = d > today
          const selected = d === date
          return (
            <button
              key={d}
              disabled={isFuture}
              onClick={() => onChange(d)}
              className={`flex flex-col items-center rounded-xl border px-1 py-2 transition-all ${
                selected
                  ? 'border-cyan-400/60 bg-cyan-400/10'
                  : isFuture
                    ? 'border-transparent opacity-40'
                    : 'border-base-border bg-base-card2/60 hover:border-slate-600'
              }`}
            >
              <span className="text-[10px] uppercase text-slate-500">{fmtDate(d, { weekday: 'short' })}</span>
              <span className={`font-display text-sm font-semibold ${isToday ? 'text-cyan-300' : 'text-slate-200'}`}>{d.slice(8)}</span>
              <span className="mt-0.5 text-[9px] text-slate-500">{c}%</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
