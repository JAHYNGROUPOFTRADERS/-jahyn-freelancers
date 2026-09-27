import type { HabitDef, RoutineBlock, Settings } from '../types'

export const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'School', 'Other'] as const
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export const EXPENSE_COLORS: Record<string, string> = {
  Food: '#34d399',
  Transport: '#22d3ee',
  Shopping: '#a78bfa',
  Entertainment: '#fbbf24',
  School: '#7dd3fc',
  Other: '#94a3b8',
}

export const WORKOUT_TYPES = ['Run', 'Gym', 'Home Workout', 'Yoga', 'Cycling', 'Other'] as const

export const DEFAULT_HABITS: HabitDef[] = [
  // MORNING
  { id: 'h-wake', name: 'Wake up on time', category: 'MORNING', enabled: true },
  { id: 'h-water-am', name: 'Drink water', category: 'MORNING', enabled: true },
  { id: 'h-hygiene', name: 'Morning hygiene', category: 'MORNING', enabled: true },
  { id: 'h-run', name: 'Running / exercise', category: 'MORNING', enabled: true },
  { id: 'h-stretch', name: 'Stretching', category: 'MORNING', enabled: true },
  { id: 'h-breakfast', name: 'Healthy breakfast', category: 'MORNING', enabled: true },
  // SCHOOL
  { id: 'h-school', name: 'Attend school', category: 'SCHOOL', enabled: true },
  { id: 'h-attention', name: 'Pay attention in class', category: 'SCHOOL', enabled: true },
  { id: 'h-schoolwork', name: 'Complete school work', category: 'SCHOOL', enabled: true },
  { id: 'h-nophone', name: 'Avoid unnecessary phone usage', category: 'SCHOOL', enabled: true },
  // STUDY
  { id: 'h-study1', name: 'Study Session 1', category: 'STUDY', enabled: true },
  { id: 'h-study2', name: 'Study Session 2', category: 'STUDY', enabled: true },
  { id: 'h-revision', name: 'Revision', category: 'STUDY', enabled: true },
  { id: 'h-homework', name: 'Homework completed', category: 'STUDY', enabled: true },
  // HEALTH
  { id: 'h-workout', name: 'Workout / running', category: 'HEALTH', enabled: true },
  { id: 'h-water', name: 'Drink enough water', category: 'HEALTH', enabled: true },
  { id: 'h-nojunk', name: 'No junk food', category: 'HEALTH', enabled: true },
  { id: 'h-meals', name: 'Healthy meals', category: 'HEALTH', enabled: true },
  { id: 'h-sleep', name: 'Sleep on time', category: 'HEALTH', enabled: true },
  // DISCIPLINE
  { id: 'h-noscroll', name: 'No unnecessary scrolling', category: 'DISCIPLINE', enabled: true },
  { id: 'h-nofap', name: 'No masturbation', category: 'DISCIPLINE', enabled: true },
  { id: 'h-schedule', name: 'Follow planned schedule', category: 'DISCIPLINE', enabled: true },
  { id: 'h-noproc', name: 'No procrastination', category: 'DISCIPLINE', enabled: true },
  // FINANCE
  { id: 'h-expense', name: "Record today's spending", category: 'FINANCE', enabled: true },
]

export const DEFAULT_ROUTINE: { time: string; title: string }[] = [
  { time: '04:40', title: 'Wake Up' },
  { time: '04:45', title: 'Water + Freshen Up' },
  { time: '05:00', title: 'Running / Exercise' },
  { time: '05:45', title: 'Cool Down + Bath' },
  { time: '06:15', title: 'Breakfast' },
  { time: '06:45', title: 'Prepare for School' },
  { time: '07:00', title: 'School' },
  { time: '14:30', title: 'Return / Lunch' },
  { time: '15:30', title: 'Rest' },
  { time: '16:00', title: 'Study Session 1' },
  { time: '17:30', title: 'Break' },
  { time: '18:00', title: 'Study Session 2' },
  { time: '20:00', title: 'Dinner' },
  { time: '20:30', title: 'Revision' },
  { time: '21:30', title: 'Prepare for Tomorrow' },
  { time: '22:00', title: 'Sleep' },
]

export const DEFAULT_REMINDERS: string[] = ['04:40', '05:00', '16:00', '20:30', '21:30', '22:00']

export const DEFAULT_SETTINGS: Settings = {
  arcStartDate: `${new Date().getFullYear()}-10-01`,
  periodDays: 120,
  wakeUpTarget: '04:40',
  sleepTarget: '22:00',
  schoolStart: '07:00',
  schoolEnd: '14:30',
  studyGoalMin: 180,
  runGoalKm: 3,
  monthlyBudget: 5000,
  targetWeight: 70,
  targetDate: null,
  startWeight: 85,
  theme: 'midnight',
  remindersEnabled: false,
  reminders: DEFAULT_REMINDERS,
  currency: '₹',
  name: '',
}

export function defaultRoutineBlocks(): RoutineBlock[] {
  return DEFAULT_ROUTINE.map((r) => ({ id: 'r-' + r.time + '-' + r.title.toLowerCase().replace(/[^a-z]+/g, '-').slice(0, 20), time: r.time, title: r.title, done: false }))
}

export const MOTIVATION_QUOTES: string[] = [
  'Discipline beats motivation.',
  'Win the morning. Win the day.',
  'Small progress is still progress.',
  'Consistency compounds.',
  'The work you do today compounds tomorrow.',
  'Show up. Especially when it is hard.',
  'You are building something bigger than you can see.',
  'Future you is watching. Make them proud.',
  'One day or day one — you decide.',
  'Progress over perfection.',
  'The cold never hurt anyone who kept moving.',
  'Do it tired. Do it anyway.',
  'Track the process. Build the habit. Let results follow.',
  'A little better every day is a lot by spring.',
  'Nobody is coming. Good. That means it is on you.',
  'Hard days build the identity you want.',
  'You do not have to feel like it. You just have to start.',
  'The streak is not the goal. The person you become is.',
]
