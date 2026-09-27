export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'id-' + Math.random().toString(36).slice(2) + '-' + Date.now().toString(36)
}

export function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayStr(): string {
  return toLocalDateStr(new Date())
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function addDays(s: string, n: number): string {
  const d = parseDate(s)
  d.setDate(d.getDate() + n)
  return toLocalDateStr(d)
}

export function diffDays(a: string, b: string): number {
  const ms = parseDate(a).getTime() - parseDate(b).getTime()
  return Math.round(ms / 86400000)
}

export function isSameMonth(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7)
}

export function monthKey(s: string): string {
  return s.slice(0, 7)
}

export function fmtDate(s: string, opts?: Intl.DateTimeFormatOptions): string {
  return parseDate(s).toLocaleDateString(undefined, opts || { day: 'numeric', month: 'short' })
}

export function fmtDateLong(s: string): string {
  return parseDate(s).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function fmtMoney(n: number, currency = '₹'): string {
  const v = Math.round(n * 100) / 100
  return `${currency}${v.toLocaleString(undefined, { maximumFractionDigits: v % 1 === 0 ? 0 : 2 })}`
}

export function fmtKm(n: number): string {
  return `${Math.round(n * 10) / 10} km`
}

export function fmtDuration(min: number): string {
  const m = Math.round(min)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  const r = m % 60
  return r === 0 ? `${h}h` : `${h}h ${r}m`
}

export function fmtHours(min: number): string {
  return (min / 60).toFixed(1) + 'h'
}

export function pace(minPerKm: number | undefined): string {
  if (!minPerKm || !isFinite(minPerKm) || minPerKm <= 0) return '—'
  const m = Math.floor(minPerKm)
  const s = Math.round((minPerKm - m) * 60)
  return `${m}:${String(s).padStart(2, '0')} /km`
}

export function minutesToTime(totalMin: number): string {
  const t = ((totalMin % 1440) + 1440) % 1440
  const h = Math.floor(t / 60)
  const m = t % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

export function fmtTime12(t: string | null): string {
  if (!t) return '—'
  const [hStr, mStr] = t.split(':')
  let h = Number(hStr)
  const suffix = h >= 12 ? 'PM' : 'AM'
  h = h % 12
  if (h === 0) h = 12
  return `${String(h).padStart(2, '0')}:${mStr} ${suffix}`
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

export function pct(n: number): string {
  return `${Math.round(n)}%`
}

export function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0)
}

export function startOfWeek(s: string): string {
  const d = parseDate(s)
  const day = (d.getDay() + 6) % 7 // Monday = 0
  d.setDate(d.getDate() - day)
  return toLocalDateStr(d)
}

export function startOfMonth(s: string): string {
  return s.slice(0, 7) + '-01'
}

export function daysInMonthOf(s: string): number {
  const d = parseDate(s)
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

export function greetingFor(hour: number): string {
  if (hour < 5) return 'Still up'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function weekdayShort(s: string): string {
  return parseDate(s).toLocaleDateString(undefined, { weekday: 'short' })
}
