import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { StoreProvider, useStore } from './state/store'
import { Toaster } from './ui/toast'
import { TodayPage } from './pages/Today'
import { HabitsPage } from './pages/Habits'
import { FitnessPage } from './pages/Fitness'
import { WeightPage } from './pages/Weight'
import { StudyPage } from './pages/Study'
import { FinancePage } from './pages/Finance'
import { AnalyticsPage } from './pages/Analytics'
import { CalendarPage } from './pages/CalendarPage'
import { SettingsPage } from './pages/Settings'
import { fmtTime12 } from './utils'
import { streakOverall } from './state/stats'

const NAV = [
  { to: '/', label: 'Today', icon: '◎' },
  { to: '/habits', label: 'Habits', icon: '☰' },
  { to: '/fitness', label: 'Fitness', icon: '🏃' },
  { to: '/weight', label: 'Weight', icon: '⚖' },
  { to: '/study', label: 'Study', icon: '📚' },
  { to: '/finance', label: 'Finance', icon: '💰' },
  { to: '/analytics', label: 'Analytics', icon: '📊' },
  { to: '/calendar', label: 'Calendar', icon: '🗓' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
]

const MOBILE_NAV_PATHS = ['/', '/habits', '/fitness', '/analytics', '/calendar']

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </StoreProvider>
  )
}

function Shell() {
  const { state, today } = useStore()
  const location = useLocation()

  useEffect(() => {
    document.title = state.settings.name ? `WINTER ARC — ${state.settings.name}` : 'WINTER ARC'
  }, [state.settings.name])

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  // reminders (opt-in): poll every 15s, fire a notification when a reminder time matches
  useEffect(() => {
    if (!state.settings.remindersEnabled) return
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return
    const iv = window.setInterval(() => {
      const now = new Date()
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      for (const r of state.settings.reminders) {
        if (r === hhmm) {
          try {
            new Notification('Winter Arc reminder', { body: `It is ${fmtTime12(r)} — check your schedule.` })
          } catch {
            // ignore
          }
        }
      }
    }, 15000)
    return () => clearInterval(iv)
  }, [state.settings.remindersEnabled, state.settings.reminders])

  return (
    <div className="min-h-full">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-60 flex-col border-r border-base-border bg-base-card/60 p-4 md:flex">
        <div className="mb-8 px-2 pt-2">
          <div className="font-display text-xl font-bold tracking-wide text-shimmer">WINTER ARC</div>
          <div className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-slate-600">Discipline OS</div>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}>
              <span className="w-5 text-center" aria-hidden>
                {n.icon}
              </span>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="rounded-xl border border-base-border bg-base-card2 p-3">
          <div className="text-[11px] uppercase tracking-wider text-slate-600">STREAK</div>
          <div className="font-display text-lg font-bold text-amber-300">🔥 {streakOverall(state, today).current} days</div>
          <div className="mt-1 text-[11px] text-slate-500">Private · local-only data</div>
        </div>
        <div className="mt-3 px-2 text-[11px] text-slate-600">
          {state.settings.remindersEnabled ? '🔔 Reminders on' : '🔕 Reminders off'}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="glass sticky top-0 z-40 flex items-center justify-between border-b border-base-border px-4 py-3 md:hidden">
        <div>
          <div className="font-display text-base font-bold tracking-wide text-shimmer">WINTER ARC</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600">Discipline OS</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="chip">🔥 {streakOverall(state, today).current}d</span>
          <NavLink to="/settings" className="btn btn-ghost px-2 py-1" aria-label="Settings">
            ⚙️
          </NavLink>
        </div>
      </header>

      <div className="md:pl-60">
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 md:px-8 md:pb-12 md:pt-8">
          <Routes>
            <Route path="/" element={<TodayPage />} />
            <Route path="/habits" element={<HabitsPage />} />
            <Route path="/fitness" element={<FitnessPage />} />
            <Route path="/weight" element={<WeightPage />} />
            <Route path="/study" element={<StudyPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<TodayPage />} />
          </Routes>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="glass fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around border-t border-base-border px-1 py-1.5 md:hidden">
        {NAV.filter((n) => MOBILE_NAV_PATHS.includes(n.to)).map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] font-medium ${
                isActive ? 'text-cyan-300' : 'text-slate-500'
              }`
            }
          >
            <span className="text-lg leading-none" aria-hidden>
              {n.icon}
            </span>
            {n.label}
          </NavLink>
        ))}
      </nav>
      <Toaster />
    </div>
  )
}
