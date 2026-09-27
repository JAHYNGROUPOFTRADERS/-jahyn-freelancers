import { clamp } from '../utils'

export function Checkbox({ checked, onChange, size = 22 }: { checked: boolean; onChange: () => void; size?: number }) {
  return (
    <button
      onClick={onChange}
      className={`relative shrink-0 rounded-lg border-2 transition-all duration-150 ${
        checked ? 'border-cyan-400 bg-cyan-400/15' : 'border-slate-600 bg-transparent hover:border-slate-400'
      }`}
      style={{ width: size, height: size }}
      aria-pressed={checked}
      aria-label={checked ? 'Completed — click to undo' : 'Mark as completed'}
    >
      {checked && (
        <svg
          key="tick"
          className="animate-check absolute inset-0 m-auto"
          width={Math.round(size * 0.7)}
          height={Math.round(size * 0.7)}
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M5 13l4 4L19 7" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

export function ProgressRing({
  value,
  size = 160,
  stroke = 12,
  label,
  sub,
  color = '#22d3ee',
}: {
  value: number
  size?: number
  stroke?: number
  label?: React.ReactNode
  sub?: React.ReactNode
  color?: string
}) {
  const v = clamp(value, 0, 100)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - v / 100)
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#1c2227" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(.2,.7,.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="font-display text-3xl font-bold text-slate-100">{label}</div>
        {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
      </div>
    </div>
  )
}
