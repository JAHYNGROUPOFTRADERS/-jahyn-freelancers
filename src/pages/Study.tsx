import { useEffect, useRef, useState } from 'react'
import { useStore } from '../state/store'
import { Card, SectionTitle, StatTile, EmptyState, Modal } from '../ui/primitives'
import { SimpleBarChart, TrendLineChart } from '../ui/charts'
import { dayMinutes, rangeMinutes, streakStudy } from '../state/stats'
import { addDays, fmtDate, fmtDuration, fmtHours, startOfWeek, sum, weekdayShort } from '../utils'

const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Maths', 'English', 'Other']

export function StudyPage() {
  const { state, today, addStudySession, deleteStudySession, notify } = useStore()
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ subject: 'Physics', minutes: 60, topic: '', questions: '', revised: false, date: today })

  // focus timer
  const [durMin, setDurMin] = useState(25)
  const [left, setLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const [customOpen, setCustomOpen] = useState(false)
  const [customMin, setCustomMin] = useState('40')
  const ivRef = useRef<number | null>(null)

  useEffect(() => {
    if (!running) return
    ivRef.current = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          window.clearInterval(ivRef.current!)
          setRunning(false)
          notify('🔔 Study session completed — log it below', 'info')
          return 0
        }
        return l - 1
      })
    }, 1000)
    return () => {
      if (ivRef.current) window.clearInterval(ivRef.current)
    }
  }, [running, notify])

  const pickPreset = (m: number) => {
    setDurMin(m)
    setLeft(m * 60)
    setRunning(false)
  }

  const timerDone = left === 0

  const weekStart = startOfWeek(today)
  const todayMin = dayMinutes(state, today)
  const weekMin = rangeMinutes(state, weekStart, today)
  const monthMin = rangeMinutes(state, today.slice(0, 7) + '-01', today)
  const totalMin = sum(state.studySessions.map((x) => x.minutes))
  const st = streakStudy(state, today)

  const subjects = SUBJECTS.filter((s) => state.studySessions.some((x) => x.subject === s) || s === SUBJECTS[0])
  const bySubject = subjects
    .map((s) => ({ subject: s, min: sum(state.studySessions.filter((x) => x.subject === s).map((x) => x.minutes)) }))
    .filter((r) => r.min > 0)

  const days14 = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13))
  const dailyData = days14.map((d) => ({ date: fmtDate(d), hours: Math.round((dayMinutes(state, d) / 60) * 10) / 10 }))

  const recent = [...state.studySessions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 10)

  const submit = () => {
    if (form.minutes <= 0) {
      notify('Enter minutes', 'warn')
      return
    }
    addStudySession({
      date: form.date,
      subject: form.subject,
      minutes: form.minutes,
      topic: form.topic,
      questions: form.questions ? parseInt(form.questions, 10) : null,
      revised: form.revised,
    })
    notify(`Logged ${fmtDuration(form.minutes)} of ${form.subject}`)
    setModal(false)
    setForm({ subject: 'Physics', minutes: 60, topic: '', questions: '', revised: false, date: today })
  }

  return (
    <div className="space-y-5 fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-shimmer">Study</h1>
        <p className="mt-1 text-sm text-slate-500">Deep work compounds — track every session</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon="📅" label="Today" value={fmtDuration(todayMin)} sub={`goal ${fmtDuration(state.settings.studyGoalMin)}`} tone={todayMin >= state.settings.studyGoalMin ? 'good' : 'default'} />
        <StatTile icon="🗓" label="This week" value={fmtDuration(weekMin)} />
        <StatTile icon="📆" label="This month" value={fmtHours(monthMin)} />
        <StatTile icon="🔥" label="Study streak" value={`${st.current}d`} sub={`best ${st.best}d`} tone="info" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <SectionTitle icon="⏱" title="Focus Timer" subtitle={running ? 'In progress…' : 'Choose a duration'} />
          <div className="flex flex-col items-center">
            <div className={`font-mono text-5xl font-bold tabular-nums ${timerDone ? 'text-emerald-300' : running ? 'text-cyan-300' : 'text-slate-200'}`}>
              {String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}
            </div>
            <div className="mt-1 text-xs text-slate-500">{timerDone ? 'Session complete — log it' : `${durMin} min session`}</div>
            <div className="mt-4 flex gap-2">
              {[25, 50, 90].map((m) => (
                <button key={m} className={`btn px-3 ${durMin === m && !running ? 'btn-primary' : ''}`} onClick={() => pickPreset(m)}>{m}m</button>
              ))}
              <button className="btn" onClick={() => setCustomOpen(true)}>Custom</button>
            </div>
            <div className="mt-4 flex gap-2">
              {!running && !timerDone && (
                <button className="btn btn-primary" onClick={() => setRunning(true)}>▶ Start</button>
              )}
              {running && (
                <button className="btn" onClick={() => setRunning(false)}>⏸ Pause</button>
              )}
              <button className="btn" onClick={() => { setRunning(false); setLeft(durMin * 60) }}>Reset</button>
              {timerDone && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setForm({ ...form, minutes: durMin, date: today })
                    setModal(true)
                  }}
                >
                  Log session
                </button>
              )}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle
            icon="📚"
            title="Sessions"
            subtitle="Log study time by subject"
            right={<button className="btn btn-primary" onClick={() => setModal(true)}>+ Log session</button>}
          />
          {bySubject.length === 0 ? (
            <EmptyState icon="📚" title="No sessions yet" hint="Start the focus timer or log a past session." />
          ) : (
            <SimpleBarChart data={bySubject} xKey="subject" yKey="min" name="minutes" color="#a78bfa" />
          )}
        </Card>
      </div>

      <Card>
        <SectionTitle icon="📈" title="Daily study time" subtitle="Hours per day — last 14 days" />
        <TrendLineChart data={dailyData} xKey="date" yKey="hours" name="hours" area color="#34d399" />
      </Card>

      <Card>
        <SectionTitle icon="🗒" title="Recent sessions" />
        {recent.length === 0 ? (
          <EmptyState icon="🗒" title="Nothing logged yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-base-border text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Subject</th>
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Topic</th>
                  <th className="py-2 pr-3">Questions</th>
                  <th className="py-2 pr-3">Revised</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {recent.map((x) => (
                  <tr key={x.id} className="border-b border-base-border/50">
                    <td className="py-2 pr-3 text-slate-300">{fmtDate(x.date)}</td>
                    <td className="py-2 pr-3 text-slate-200">{x.subject}</td>
                    <td className="py-2 pr-3 text-slate-200">{fmtDuration(x.minutes)}</td>
                    <td className="py-2 pr-3 text-slate-400">{x.topic || '—'}</td>
                    <td className="py-2 pr-3 text-slate-400">{x.questions ?? '—'}</td>
                    <td className="py-2 pr-3">{x.revised ? '✓' : '—'}</td>
                    <td className="py-2 text-right">
                      <button className="btn btn-ghost px-2 py-1 text-xs text-rose-300" onClick={() => deleteStudySession(x.id)}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modal} onClose={() => setModal(false)} title="Log study session">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="label">Date</span>
            <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <span className="label">Subject</span>
            <select className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="label">Minutes</span>
            <input type="number" min="1" className="input" value={form.minutes} onChange={(e) => setForm({ ...form, minutes: parseInt(e.target.value, 10) || 0 })} />
          </div>
          <div>
            <span className="label">Questions solved (opt.)</span>
            <input type="number" min="0" className="input" value={form.questions} onChange={(e) => setForm({ ...form, questions: e.target.value })} />
          </div>
          <div className="col-span-2">
            <span className="label">Topic (opt.)</span>
            <input className="input" placeholder="e.g. Rotational motion" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
          </div>
          <label className="col-span-2 flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={form.revised} onChange={(e) => setForm({ ...form, revised: e.target.checked })} className="h-4 w-4 accent-cyan-400" />
            Revision completed
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="btn" onClick={() => setModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>Save session</button>
        </div>
      </Modal>

      <Modal open={customOpen} onClose={() => setCustomOpen(false)} title="Custom timer">
        <div className="flex items-end gap-3">
          <div>
            <span className="label">Minutes</span>
            <input type="number" min="1" max="240" className="input w-32" value={customMin} onChange={(e) => setCustomMin(e.target.value)} />
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              const m = parseInt(customMin, 10)
              if (m > 0 && m <= 240) {
                pickPreset(m)
                setCustomOpen(false)
              }
            }}
          >
            Set
          </button>
        </div>
      </Modal>
    </div>
  )
}
