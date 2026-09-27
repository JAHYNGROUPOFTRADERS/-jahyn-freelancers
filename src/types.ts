export type ThemeMode = 'midnight' | 'glacier' | 'carbon'

export interface HabitDef {
  id: string
  name: string
  category: string
  enabled: boolean
  custom?: boolean
}

export interface RoutineBlock {
  id: string
  time: string // HH:MM
  title: string
  done: boolean
}

export interface Expense {
  id: string
  date: string // YYYY-MM-DD
  category: string
  description: string
  amount: number
}

export interface WeightEntry {
  date: string // YYYY-MM-DD
  kg: number
}

export interface Workout {
  id: string
  date: string
  type: string
  distanceKm: number
  durationMin: number
  steps: number
  calories: number | null
}

export interface StudySession {
  id: string
  date: string
  subject: string
  minutes: number
  topic: string
  questions: number | null
  revised: boolean
}

export interface DailyLog {
  date: string // YYYY-MM-DD
  wakeUpTarget: string | null
  wakeUpActual: string | null
  habits: Record<string, boolean>
  routineDone: Record<string, boolean>
  junkFood: boolean | null
  junkFoodDetail?: { food: string; quantity: string; cost: number } | null
  healthyMeals: number | null
  sleepTime: string | null
  note?: string
}

export interface Settings {
  arcStartDate: string
  periodDays: number
  wakeUpTarget: string
  sleepTarget: string
  schoolStart: string
  schoolEnd: string
  studyGoalMin: number
  runGoalKm: number
  monthlyBudget: number
  targetWeight: number
  targetDate: string | null
  startWeight: number
  theme: ThemeMode
  remindersEnabled: boolean
  reminders: string[]
  currency: string
  name: string
}

export interface StreakInfo {
  current: number
  best: number
}

export interface AppState {
  disciplineResetDate?: string | null
  version: number
  profile: {
    name: string
    startWeight: number
    targetWeight: number
    targetDate: string | null
  }
  settings: Settings
  habits: HabitDef[]
  dailyLogs: Record<string, DailyLog>
  routine: RoutineBlock[]
  weightEntries: WeightEntry[]
  workouts: Workout[]
  studySessions: StudySession[]
  expenses: Expense[]
  streakCache: Record<string, { current: number; best: number }>
}
