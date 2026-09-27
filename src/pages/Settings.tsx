import { useRef, useState } from 'react'
import { useStore } from '../state/store'
import { Card, SectionTitle, Modal } from '../ui/primitives'
import { ConfirmDialog } from '../ui/confirm'
import { fmtTime12 } from '../utils'
import { DEFAULT_REMINDERS } from '../data/defaults'

export function SettingsPage() {
  const { state, updateSettings, exportJSON, importJSON, resetAll, notify } = useStore()
  const s = state.settings
  const fileRef = useRef<HTMLInputElement>(null)
  const [resetOpen, setResetOpen] = useState(false)

  const set = (patch: Partial<typeof s>) => updateSettings(patch)

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-shimmer">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Your arc, your rules — everything is stored locally</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle icon="🧍" title="Profile & arc" />
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <span className="label">Name (optional)</span>
              <input className="input" value={s.name} onChange={(e) => set({ name: e.target.value })} placeholder="What should we call you?" />
            </div>
            <div>
              <span className="label">Arc start date</span>
              <input type="date" className="input" value={s.arcStartDate} onChange={(e) => set({ arcStartDate: e.target.value })} />
            </div>
            <div>
              <span className="label">Arc length (days)</span>
              <input type="number" min="7" max="365" className="input" value={s.periodDays} onChange={(e) => set({ periodDays: Math.max(7, parseInt(e.target.value, 10) || 90) })} />
            </div>
            <div>
              <span className="label">Starting weight (kg)</span>
              <input type="number" step="0.1" className="input" value={s.startWeight} onChange={(e) => set({ startWeight: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <span className="label">Target weight (kg)</span>
              <input type="number" step="0.1" className="input" value={s.targetWeight} onChange={(e) => set({ targetWeight: parseFloat(e.target.value) || 0 })} />
            </div>
            <div className="col-span-2">
              <span className="label">Target date (optional — no forced deadline)</span>
              <input type="date" className="input" value={s.targetDate ?? ''} onChange={(e) => set({ targetDate: e.target.value || null })} />
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle icon="⏰" title="Times & goals" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="label">Wake-up target</span>
              <input type="time" className="input" value={s.wakeUpTarget} onChange={(e) => set({ wakeUpTarget: e.target.value })} />
            </div>
            <div>
              <span className="label">Sleep target</span>
              <input type="time" className="input" value={s.sleepTarget} onChange={(e) => set({ sleepTarget: e.target.value })} />
            </div>
            <div>
              <span className="label">School start</span>
              <input type="time" className="input" value={s.schoolStart} onChange={(e) => set({ schoolStart: e.target.value })} />
            </div>
            <div>
              <span className="label">School end</span>
              <input type="time" className="input" value={s.schoolEnd} onChange={(e) => set({ schoolEnd: e.target.value })} />
            </div>
            <div>
              <span className="label">Daily study goal (min)</span>
              <input type="number" min="0" className="input" value={s.studyGoalMin} onChange={(e) => set({ studyGoalMin: parseInt(e.target.value, 10) || 0 })} />
            </div>
            <div>
              <span className="label">Daily running goal (km)</span>
              <input type="number" min="0" step="0.1" className="input" value={s.runGoalKm} onChange={(e) => set({ runGoalKm: parseFloat(e.target.value) || 0 })} />
            </div>
            <div>
              <span className="label">Monthly budget</span>
              <input type="number" min="0" className="input" value={s.monthlyBudget} onChange={(e) => set({ monthlyBudget: parseInt(e.target.value, 10) || 0 })} />
            </div>
            <div>
              <span className="label">Currency symbol</span>
              <input className="input" value={s.currency} onChange={(e) => set({ currency: e.target.value })} maxLength={3} />
            </div>
          </div>
        </Card>

        <Card>
          <SectionTitle icon="🔔" title="Reminders" subtitle="Optional, customizable, disable-able" />
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              className="h-4 w-4 accent-cyan-400"
              checked={s.remindersEnabled}
              onChange={async (e) => {
                const on = e.target.checked
                if (on && 'Notification' in window && Notification.permission !== 'granted') {
                  try {
                    const res = await Notification.requestPermission()
                    if (res !== 'granted') {
                      notify('Notification permission denied', 'warn')
                      return
                    }
                  } catch {
                    notify('Notifications unavailable in this browser', 'warn')
                    return
                  }
                }
                set({ remindersEnabled: on })
              }}
            />
            Enable reminders (browser notifications)
          </label>
          <div className="mt-3 space-y-2">
            {s.reminders.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="time" className="input w-32" value={r} onChange={(e) => {
                  const next = [...s.reminders]
                  next[i] = e.target.value
                  set({ reminders: next })
                }} />
                <span className="text-xs text-slate-500">{fmtTime12(r)}</span>
                <button className="btn btn-ghost px-2 py-1 text-xs text-rose-300" onClick={() => set({ reminders: s.reminders.filter((_, j) => j !== i) })}>✕</button>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button className="btn" onClick={() => set({ reminders: [...s.reminders, '12:00'] })}>+ Add reminder</button>
            <button className="btn" onClick={() => set({ reminders: [...DEFAULT_REMINDERS] })}>Restore defaults</button>
          </div>
        </Card>

        <Card>
          <SectionTitle icon="💾" title="Data & privacy" subtitle="Everything lives in your browser — nothing leaves your device" />
          <div className="space-y-3 text-sm text-slate-400">
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary" onClick={exportJSON}>⬇ Export data (JSON)</button>
              <button className="btn" onClick={() => fileRef.current?.click()}>⬆ Import data</button>
              <button className="btn btn-danger" onClick={() => setResetOpen(true)}>Reset all data</button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) importJSON(f)
                  e.target.value = ''
                }}
              />
            </div>
            <ul className="list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-500">
              <li>No account needed. Data persists in this browser via localStorage.</li>
              <li>Export creates a full JSON backup you can re-import on any device.</li>
              <li>Reset wipes everything after an explicit confirmation.</li>
            </ul>
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle icon="❄" title="About Winter Arc" />
        <p className="max-w-2xl text-sm leading-relaxed text-slate-400">
          <span className="font-semibold text-slate-200">Track the process. Build the habit. Let the results follow.</span>{' '}
          This dashboard is a private, local-first command center for your Winter Arc — wake-ups, training, study, food, money and discipline in one place. It works fully offline, requires no account, and will never shame you for a missed day. Every streak is independent, so one slip never erases your progress.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="chip">v1.0</span>
          <span className="chip">Local-first</span>
          <span className="chip">Offline capable</span>
          <span className="chip">No tracking</span>
        </div>
      </Card>

      <ConfirmDialog
        open={resetOpen}
        title="Reset all data?"
        message="This permanently deletes every log, expense, workout, study session and setting in this browser. This cannot be undone — consider exporting a backup first."
        confirmLabel="Delete everything"
        danger
        onConfirm={resetAll}
        onClose={() => setResetOpen(false)}
      />
    </div>
  )
}
