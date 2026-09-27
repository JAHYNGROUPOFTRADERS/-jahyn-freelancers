import type { AppState, DailyLog, HabitDef, WeightEntry } from '../types'
import { DEFAULT_HABITS, DEFAULT_SETTINGS, defaultRoutineBlocks } from '../data/defaults'
import { addDays, diffDays, sum, daysInMonthOf } from '../utils'

const KEY = 'winter-arc-state-v1'

export function makeLog(date: string): DailyLog {
  return {
    date,
    wakeUpTarget: null,
    wakeUpActual: null,
    habits: {},
    routineDone: {},
    junkFood: null,
    junkFoodDetail: null,
    healthyMeals: null,
    sleepTime: null,
    note: '',
  }
}

export function defaultState(): AppState {
  const s: AppState = {
    version: 1,
    profile: { name: '', startWeight: 85, targetWeight: 70, targetDate: null },
    settings: { ...DEFAULT_SETTINGS },
    habits: DEFAULT_HABITS.map((h) => ({ ...h })),
    dailyLogs: {},
    routine: defaultRoutineBlocks(),
    weightEntries: [{ date: DEFAULT_SETTINGS.arcStartDate, kg: 85 }],
    workouts: [],
    studySessions: [],
    expenses: [],
    streakCache: {},
  }
  return s
}

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return normalizeState(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveState(s: AppState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    // storage blocked or full — ignore
  }
}

export function normalizeState(p: Partial<AppState> | undefined): AppState {
  const base = defaultState()
  if (!p || typeof p !== 'object') return base
  const st: AppState = {
    version: 1,
    profile: { ...base.profile, ...(p.profile || {}) },
    settings: { ...base.settings, ...(p.settings || {}) },
    habits: Array.isArray(p.habits) && p.habits.length ? p.habits : base.habits,
    dailyLogs: {},
    routine: Array.isArray(p.routine) && p.routine.length ? p.routine : base.routine,
    weightEntries: Array.isArray(p.weightEntries) ? p.weightEntries : base.weightEntries,
    workouts: Array.isArray(p.workouts) ? p.workouts : [],
    studySessions: Array.isArray(p.studySessions) ? p.studySessions : [],
    expenses: Array.isArray(p.expenses) ? p.expenses : [],
    streakCache: p.streakCache || {},
  }
  for (const [d, l] of Object.entries(p.dailyLogs || {})) {
    st.dailyLogs[d] = { ...makeLog(d), ...(l as object), date: d }
  }
  return st
}

export function makeDefaultState(): AppState {
  return defaultState()
}

/* ---------------- derived stats ---------------- */

export function arcDayNumber(s: AppState, date: string): number {
  return Math.max(1, diffDays(date, s.settings.arcStartDate) + 1)
}

export function endOfPeriodStr(s: AppState): string {
  return addDays(s.settings.arcStartDate, s.settings.periodDays - 1)
}

export function daysRemaining(s: AppState, date: string): number {
  return Math.max(0, diffDays(endOfPeriodStr(s), date))
}

export function enabledHabits(s: AppState): HabitDef[] {
  return s.habits.filter((h) => h.enabled)
}

export function habitCompletion(s: AppState, date: string): number {
  const hs = enabledHabits(s)
  if (!hs.length) return 0
  const log = s.dailyLogs[date]
  if (!log) return 0
  const done = hs.filter((h) => log.habits[h.id]).length
  return Math.round((done / hs.length) * 100)
}

export function routineCompletion(s: AppState, date: string): number {
  const log = s.dailyLogs[date]
  if (!log || !s.routine.length) return 0
  const done = s.routine.filter((b) => log.routineDone[b.id]).length
  return Math.round((done / s.routine.length) * 100)
}

export function wakeUpResult(s: AppState, date: string): { onTime: boolean | null; lateMin: number; actual: string | null; target: string } {
  const log = s.dailyLogs[date]
  const target = log?.wakeUpTarget || s.settings.wakeUpTarget
  const actual = log?.wakeUpActual || null
  if (!actual) return { onTime: null, lateMin: 0, actual: null, target }
  const t = timeToMin(target)
  const a = timeToMin(actual)
  const late = a - t
  return { onTime: late <= 0, lateMin: Math.max(0, late), actual, target }
}

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + (m || 0)
}

export function daySpent(s: AppState, date: string): number {
  return sum(s.expenses.filter((e) => e.date === date).map((e) => e.amount))
}

export function rangeSpent(s: AppState, from: string, to: string): number {
  return sum(s.expenses.filter((e) => e.date >= from && e.date <= to).map((e) => e.amount))
}

export function monthSpent(s: AppState, mk: string): number {
  return sum(s.expenses.filter((e) => e.date.startsWith(mk)).map((e) => e.amount))
}

export function dayMinutes(s: AppState, date: string): number {
  return sum(s.studySessions.filter((x) => x.date === date).map((x) => x.minutes))
}

export function rangeMinutes(s: AppState, from: string, to: string): number {
  return sum(s.studySessions.filter((x) => x.date >= from && x.date <= to).map((x) => x.minutes))
}

export function dayKm(s: AppState, date: string): number {
  return sum(s.workouts.filter((x) => x.date === date).map((x) => x.distanceKm))
}

export function rangeKm(s: AppState, from: string, to: string): number {
  return sum(s.workouts.filter((x) => x.date >= from && x.date <= to).map((x) => x.distanceKm))
}

export function rangeWorkoutMin(s: AppState, from: string, to: string): number {
  return sum(s.workouts.filter((x) => x.date >= from && x.date <= to).map((x) => x.durationMin))
}

export function latestWeight(s: AppState): WeightEntry | null {
  if (!s.weightEntries.length) return null
  let best = s.weightEntries[0]
  for (const w of s.weightEntries) if (w.date > best.date) best = w
  return best
}

export function currentWeight(s: AppState): number {
  const lw = latestWeight(s)
  return lw ? lw.kg : s.profile.startWeight
}

export function weightProgressPct(s: AppState): number {
  const start = s.profile.startWeight
  const target = s.profile.targetWeight
  const cur = currentWeight(s)
  const total = start - target
  if (total <= 0) return cur <= target ? 100 : 0
  const lost = start - cur
  return Math.round(clamp01(lost / total) * 100)
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x))
}

/* ---------------- streaks ---------------- */

export interface StreakResult {
  current: number
  best: number
}

/** best = longest qualifying run across the arc; current = chain ending today (an incomplete today does not break it) */
export function computeStreak(s: AppState, date: string, predicate: (log: DailyLog) => boolean): StreakResult {
  let best = 0
  let run = 0
  let d = s.settings.arcStartDate
  const end = date < s.settings.arcStartDate ? s.settings.arcStartDate : date
  while (d <= end) {
    const log = s.dailyLogs[d]
    if (log && predicate(log)) {
      run++
      if (run > best) best = run
    } else {
      run = 0
    }
    d = addDays(d, 1)
  }
  let cur = 0
  d = date
  if (!(s.dailyLogs[d] && predicate(s.dailyLogs[d]))) d = addDays(d, -1)
  while (d >= s.settings.arcStartDate) {
    const log = s.dailyLogs[d]
    if (log && predicate(log)) {
      cur++
      d = addDays(d, -1)
    } else break
  }
  return { current: cur, best: Math.max(best, cur) }
}

export function streakOverall(s: AppState, date: string): StreakResult {
  return computeStreak(s, date, (log) => {
    const hs = enabledHabits(s)
    if (!hs.length) return false
    const done = hs.filter((h) => log.habits[h.id]).length
    return done / hs.length >= 0.8
  })
}

export function streakExercise(s: AppState, date: string): StreakResult {
  return computeStreak(s, date, (log) => dayKm(s, log.date) > 0 || !!log.habits['h-workout'] || !!log.habits['h-run'])
}

export function streakStudy(s: AppState, date: string): StreakResult {
  return computeStreak(s, date, (log) => dayMinutes(s, log.date) > 0)
}

export function streakCleanFood(s: AppState, date: string): StreakResult {
  return computeStreak(s, date, (log) => log.junkFood === false)
}

export function streakBudget(s: AppState, date: string): StreakResult {
  return computeStreak(s, date, (log) => {
    const spent = daySpent(s, log.date)
    if (spent === 0) return true
    const dailyAllowance = s.settings.monthlyBudget / daysInMonthOf(log.date)
    return spent <= dailyAllowance
  })
}

export function streakWakeUp(s: AppState, date: string): StreakResult {
  return computeStreak(s, date, (log) => {
    if (!log.wakeUpActual) return false
    return wakeUpResult(s, log.date).onTime === true
  })
}

export function streakDiscipline(s: AppState, date: string): StreakResult {
  return computeStreak(s, date, (log) => !!log.habits['h-nofap'])
}

/* ---------------- heatmap ---------------- */

export interface HeatCell {
  date: string
  completion: number
  studyMin: number
  km: number
  spent: number
  weight: number | null
  junk: boolean | null
  wakeOnTime: boolean | null
}

export function heatmapData(s: AppState, from: string, to: string): HeatCell[] {
  const cells: HeatCell[] = []
  let d = from
  while (d <= to) {
    const log = s.dailyLogs[d]
    cells.push({
      date: d,
      completion: log ? habitCompletion(s, d) : 0,
      studyMin: dayMinutes(s, d),
      km: dayKm(s, d),
      spent: daySpent(s, d),
      weight: s.weightEntries.find((w) => w.date === d)?.kg ?? null,
      junk: log?.junkFood ?? null,
      wakeOnTime: log?.wakeUpActual ? wakeUpResult(s, d).onTime : null,
    })
    d = addDays(d, 1)
  }
  return cells
}
