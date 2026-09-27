import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine,
} from 'recharts'

const axis = { stroke: '#4b5563', fontSize: 11 }
const grid = '#1e252b'

export function DarkTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-base-border bg-[#111417]/95 px-3 py-2 text-xs shadow-card">
      {label !== undefined && label !== '' && <div className="mb-1 font-medium text-slate-300">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="font-medium text-slate-100">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export function TrendLineChart({
  data,
  xKey,
  yKey,
  color = '#22d3ee',
  name,
  refLine,
  refLabel,
  height = 260,
  area,
}: {
  data: any[]
  xKey: string
  yKey: string
  color?: string
  name?: string
  refLine?: number
  refLabel?: string
  height?: number
  area?: boolean
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      {area ? (
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id={`g-${yKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={grid} strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey={xKey} tick={axis} tickLine={false} axisLine={{ stroke: '#1e252b' }} />
          <YAxis tick={axis} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
          <Tooltip content={<DarkTooltip />} cursor={{ stroke: '#2a323a' }} />
          {refLine !== undefined && (
            <ReferenceLine y={refLine} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: refLabel, fill: '#fbbf24', fontSize: 10, position: 'insideTopRight' }} />
          )}
          <Area type="monotone" dataKey={yKey} name={name || yKey} stroke={color} strokeWidth={2} fill={`url(#g-${yKey})`} dot={{ r: 2.5, strokeWidth: 1, fill: color }} activeDot={{ r: 4 }} />
        </AreaChart>
      ) : (
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <CartesianGrid stroke={grid} strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey={xKey} tick={axis} tickLine={false} axisLine={{ stroke: '#1e252b' }} />
          <YAxis tick={axis} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
          <Tooltip content={<DarkTooltip />} />
          {refLine !== undefined && (
            <ReferenceLine y={refLine} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: refLabel, fill: '#fbbf24', fontSize: 10, position: 'insideTopRight' }} />
          )}
          <Line type="monotone" dataKey={yKey} name={name || yKey} stroke={color} strokeWidth={2} dot={{ r: 2.5, strokeWidth: 1, fill: color }} activeDot={{ r: 4 }} />
        </LineChart>
      )}
    </ResponsiveContainer>
  )
}

export function SimpleBarChart({
  data,
  xKey,
  yKey,
  color = '#22d3ee',
  name,
  height = 260,
  unitSuffix = '',
}: {
  data: any[]
  xKey: string
  yKey: string
  color?: string
  name?: string
  height?: number
  unitSuffix?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid stroke={grid} strokeDasharray="3 6" vertical={false} />
        <XAxis dataKey={xKey} tick={axis} tickLine={false} axisLine={{ stroke: '#1e252b' }} />
        <YAxis tick={axis} tickLine={false} axisLine={false} />
        <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
        <Bar dataKey={yKey} name={name || yKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={42} unit={unitSuffix || undefined} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DonutChart({
  data,
  nameKey,
  valueKey,
  colors,
  height = 260,
  centerLabel,
  centerSub,
}: {
  data: any[]
  nameKey: string
  valueKey: string
  colors: string[]
  height?: number
  centerLabel?: string
  centerSub?: string
}) {
  const total = data.reduce((a, b) => a + (Number(b[valueKey]) || 0), 0)
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie data={data} dataKey={valueKey} nameKey={nameKey} innerRadius="62%" outerRadius="88%" paddingAngle={3} stroke="none">
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<DarkTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {total > 0 && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-display text-xl font-bold text-slate-100">{centerLabel}</div>
          <div className="text-xs text-slate-500">{centerSub}</div>
        </div>
      )}
    </div>
  )
}

export function LegendDots({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5 text-xs text-slate-500">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: it.color }} />
          {it.label}
        </div>
      ))}
    </div>
  )
}
