import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { AppState, DailyLog, Expense, HabitDef, RoutineBlock, Settings, StudySession, WeightEntry, Workout } from '../types'
import { loadState, makeLog, normalizeState, saveState } from './stats'
import { uid } from '../utils'

export interface Toast {
  id: string
  msg: string
  kind: 'ok' | 'info' | 'warn'
}

interface StoreCtx {
  state: AppState
  today: string
  toasts: Toast[]
  notify: (msg: string, kind?: Toast['kind']) => void
  dismissToast: (id: string) => void
  // daily logs
  updateLog: (date: string, patch: Partial<DailyLog>) => void
  toggleHabit: (date: string, habitId: string) => void
  toggleRoutineBlock: (date: string, blockId: string) => void
  setWakeActual: (date: string, time: string | null) => void
  // habits
  addHabit: (h: { name: string; category: string }) => void
  updateHabit: (id: string, patch: Partial<HabitDef>) => void
  deleteHabit: (id: string) => void
  moveHabit: (id: string, dir: -1 | 1) => void
  // routine
  addRoutineBlock: (b: { time: string; title: string }) => void
  updateRoutineBlock: (id: string, patch: Partial<RoutineBlock>) => void
  deleteRoutineBlock: (id: string) => void
  duplicateRoutineBlock: (id: string) => void
  moveRoutineBlock: (id: string, dir: -1 | 1) => void
  reorderRoutine: (fromIdx: number, toIdx: number) => void
  resetRoutineDone: (date: string) => void
  // entries
  addWorkout: (w: Omit<Workout, 'id'>) => void
  deleteWorkout: (id: string) => void
  addStudySession: (s: Omit<StudySession, 'id'>) => void
  deleteStudySession: (id: string) => void
  addExpense: (e: Omit<Expense, 'id'>) => void
  deleteExpense: (id: string) => void
  addWeightEntry: (e: WeightEntry) => void
  deleteWeightEntry: (date: string) => void
  // settings & profile
  updateSettings: (patch: Partial<Settings>) => void
  setDisciplineReset: (date: string | null) => void
  // data tools
  exportJSON: () => void
  importJSON: (file: File) => void
  resetAll: () => void
}

const Ctx = createContext<StoreCtx | null>(null)

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState() || normalizeState(undefined))
  const [toasts, setToasts] = useState<Toast[]>([])
  const saveTimer = useRef<number | null>(null)

  // debounced persistence
  useEffect(() => {
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => saveState(state), 250)
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current)
    }
  }, [state])

  const notify = (msg: string, kind: Toast['kind'] = 'ok') => {
    const id = uid()
    setToasts((t) => [...t.slice(-3), { id, msg, kind }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }

  const dismissToast = (id: string) => setToasts((t) => t.filter((x) => x.id !== id))

  const today = useMemo(() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }, [])

  const api: StoreCtx = useMemo(() => {
    function ensureLog(s: AppState, date: string): AppState {
      if (s.dailyLogs[date]) return s
      return { ...s, dailyLogs: { ...s.dailyLogs, [date]: makeLog(date) } }
    }

    return {
      state,
      today,
      toasts,
      notify,
      dismissToast,

      updateLog: (date, patch) =>
        setState((s) => {
          const withLog = ensureLog(s, date)
          return { ...withLog, dailyLogs: { ...withLog.dailyLogs, [date]: { ...withLog.dailyLogs[date], ...patch } } }
        }),

      toggleHabit: (date, habitId) =>
        setState((s) => {
          const withLog = ensureLog(s, date)
          const log = withLog.dailyLogs[date]
          const habits = { ...log.habits, [habitId]: !log.habits[habitId] }
          return { ...withLog, dailyLogs: { ...withLog.dailyLogs, [date]: { ...log, habits } } }
        }),

      toggleRoutineBlock: (date, blockId) =>
        setState((s) => {
          const withLog = ensureLog(s, date)
          const log = withLog.dailyLogs[date]
          const routineDone = { ...log.routineDone, [blockId]: !log.routineDone[blockId] }
          return { ...withLog, dailyLogs: { ...withLog.dailyLogs, [date]: { ...log, routineDone } } }
        }),

      resetRoutineDone: (date) =>
        setState((s) => {
          const withLog = ensureLog(s, date)
          return { ...withLog, dailyLogs: { ...withLog.dailyLogs, [date]: { ...withLog.dailyLogs[date], routineDone: {} } } }
        }),

      setWakeActual: (date, time) =>
        setState((s) => {
          const withLog = ensureLog(s, date)
          return { ...withLog, dailyLogs: { ...withLog.dailyLogs, [date]: { ...withLog.dailyLogs[date], wakeUpActual: time } } }
        }),

      addHabit: (h) =>
        setState((s) => ({
          ...s,
          habits: [...s.habits, { id: 'hc-' + uid().slice(0, 8), name: h.name, category: h.category, enabled: true, custom: true }],
        })),

      updateHabit: (id, patch) =>
        setState((s) => ({ ...s, habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)) })),

      deleteHabit: (id) => setState((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) })),

      moveHabit: (id, dir) =>
        setState((s) => {
          const idx = s.habits.findIndex((h) => h.id === id)
          const to = idx + dir
          if (idx < 0 || to < 0 || to >= s.habits.length) return s
          const habits = [...s.habits]
          const [item] = habits.splice(idx, 1)
          habits.splice(to, 0, item)
          return { ...s, habits }
        }),

      addRoutineBlock: (b) =>
        setState((s) => ({ ...s, routine: [...s.routine, { id: 'rb-' + uid().slice(0, 8), time: b.time, title: b.title, done: false }] })),

      updateRoutineBlock: (id, patch) =>
        setState((s) => ({ ...s, routine: s.routine.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),

      deleteRoutineBlock: (id) => setState((s) => ({ ...s, routine: s.routine.filter((b) => b.id !== id) })),

      duplicateRoutineBlock: (id) =>
        setState((s) => {
          const idx = s.routine.findIndex((b) => b.id === id)
          if (idx < 0) return s
          const copy: RoutineBlock = { ...s.routine[idx], id: 'rb-' + uid().slice(0, 8) }
          const routine = [...s.routine]
          routine.splice(idx + 1, 0, copy)
          return { ...s, routine }
        }),

      moveRoutineBlock: (id, dir) =>
        setState((s) => {
          const idx = s.routine.findIndex((b) => b.id === id)
          const to = idx + dir
          if (idx < 0 || to < 0 || to >= s.routine.length) return s
          const routine = [...s.routine]
          const [item] = routine.splice(idx, 1)
          routine.splice(to, 0, item)
          return { ...s, routine }
        }),

      reorderRoutine: (fromIdx, toIdx) =>
        setState((s) => {
          if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0 || fromIdx >= s.routine.length || toIdx >= s.routine.length) return s
          const routine = [...s.routine]
          const [item] = routine.splice(fromIdx, 1)
          routine.splice(toIdx, 0, item)
          return { ...s, routine }
        }),

      addWorkout: (w) => setState((s) => ({ ...s, workouts: [...s.workouts, { ...w, id: uid() }] })),
      deleteWorkout: (id) => setState((s) => ({ ...s, workouts: s.workouts.filter((w) => w.id !== id) })),

      addStudySession: (x) => setState((s) => ({ ...s, studySessions: [...s.studySessions, { ...x, id: uid() }] })),
      deleteStudySession: (id) => setState((s) => ({ ...s, studySessions: s.studySessions.filter((x) => x.id !== id) })),

      addExpense: (e) => setState((s) => ({ ...s, expenses: [...s.expenses, { ...e, id: uid() }] })),
      deleteExpense: (id) => setState((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) })),

      addWeightEntry: (e) =>
        setState((s) => ({ ...s, weightEntries: [...s.weightEntries.filter((w) => w.date !== e.date), e] })),
      deleteWeightEntry: (date) => setState((s) => ({ ...s, weightEntries: s.weightEntries.filter((w) => w.date !== date) })),

      updateSettings: (patch) => setState((s) => ({ ...s, settings: { ...s.settings, ...patch } })),

      setDisciplineReset: (date) => setState((s) => ({ ...s, disciplineResetDate: date })),

      exportJSON: () => {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `winter-arc-backup-${today}.json`
        a.click()
        URL.revokeObjectURL(url)
        notify('Backup downloaded')
      },

      importJSON: (file) => {
        const reader = new FileReader()
        reader.onload = () => {
          try {
            const parsed = JSON.parse(String(reader.result))
            const next = normalizeState(parsed)
            setState(next)
            notify('Data imported')
          } catch {
            notify('Import failed — invalid file', 'warn')
          }
        }
        reader.readAsText(file)
      },

      resetAll: () => {
        setState(normalizeState(undefined))
        notify('All data reset', 'warn')
      },
    }
  }, [state, today, toasts])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}
