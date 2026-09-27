import { useState } from 'react'
import type { RoutineBlock } from '../types'
import { fmtTime12, minutesToTime, timeToMinutes } from '../utils'
import { useStore } from '../state/store'
import { SectionTitle } from './primitives'

export function RoutineEditor({ date }: { date: string }) {
  const { state, toggleRoutineBlock, updateRoutineBlock, deleteRoutineBlock, duplicateRoutineBlock, moveRoutineBlock, addRoutineBlock, resetRoutineDone } = useStore()
  const [adding, setAdding] = useState(false)
  const [nTime, setNTime] = useState('06:00')
  const [nTitle, setNTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [eTime, setETime] = useState('06:00')
  const [eTitle, setETitle] = useState('')

  const log = state.dailyLogs[date]
  const routine = state.routine
  const sorted = [...routine].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))

  const startAdd = () => {
    setAdding(true)
    setNTime('06:00')
    setNTitle('')
  }

  return (
    <div className="card p-5">
      <SectionTitle
        icon="⏱"
        title="Daily Timetable"
        subtitle="Editable routine — tap a block to complete it"
        right={
          <div className="flex gap-2">
            <button className="btn" onClick={() => resetRoutineDone(date)}>
              Reset checks
            </button>
            <button className="btn btn-primary" onClick={startAdd}>
              + Add block
            </button>
          </div>
        }
      />
      <div className="space-y-2">
        {sorted.map((b: RoutineBlock) => {
          const done = !!log?.routineDone[b.id]
          return (
            <div key={b.id} className={`group flex items-center gap-2 rounded-xl border p-2.5 transition-colors ${done ? 'border-cyan-400/25 bg-cyan-400/5' : 'border-base-border bg-base-card2/50'}`}>
              <button
                className={`flex w-14 shrink-0 justify-center rounded-lg px-1 py-1 font-mono text-xs font-semibold ${done ? 'text-cyan-300' : 'text-slate-300'}`}
                onClick={() => setEditingId(editingId === b.id ? null : b.id)}
                title="Edit this block"
              >
                {fmtTime12(b.time)}
              </button>
              <button
                className={`flex-1 text-left text-sm ${done ? 'text-slate-500 line-through' : 'text-slate-200'}`}
                onClick={() => toggleRoutineBlock(date, b.id)}
              >
                {b.title}
              </button>
              <button
                className={`shrink-0 rounded-lg border px-2 py-1 text-[11px] font-medium transition-all ${done ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-300' : 'border-base-border text-slate-500 hover:text-slate-300'}`}
                onClick={() => toggleRoutineBlock(date, b.id)}
              >
                {done ? '✓ Done' : 'Mark'}
              </button>
              <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 max-md:opacity-100">
                <button className="btn btn-ghost px-1.5 py-1 text-xs" title="Move up" onClick={() => moveRoutineBlock(b.id, -1)}>↑</button>
                <button className="btn btn-ghost px-1.5 py-1 text-xs" title="Move down" onClick={() => moveRoutineBlock(b.id, 1)}>↓</button>
                <button className="btn btn-ghost px-1.5 py-1 text-xs" title="Duplicate" onClick={() => duplicateRoutineBlock(b.id)}>⧉</button>
                <button className="btn btn-ghost px-1.5 py-1 text-xs text-rose-300" title="Delete" onClick={() => deleteRoutineBlock(b.id)}>✕</button>
                <button className="btn btn-ghost px-1.5 py-1 text-xs" title="Edit" onClick={() => { setEditingId(b.id); setETime(b.time); setETitle(b.title) }}>✎</button>
              </div>
            </div>
          )
        })}
      </div>
      {adding && (
        <div className="mt-3 flex flex-wrap items-end gap-2 rounded-xl border border-base-border bg-base-card2 p-3">
          <div>
            <span className="label">Time</span>
            <input type="time" className="input w-28" value={nTime} onChange={(e) => setNTime(e.target.value)} />
          </div>
          <div className="flex-1 min-w-40">
            <span className="label">Title</span>
            <input className="input" placeholder="e.g. Read 10 pages" value={nTitle} onChange={(e) => setNTitle(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button className="btn" onClick={() => setAdding(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={() => {
                if (!nTitle.trim()) return
                addRoutineBlock({ time: nTime, title: nTitle.trim() })
                setAdding(false)
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}
      {editingId && (() => {
        const b = routine.find((x) => x.id === editingId)
        if (!b) return null
        return (
          <div className="mt-3 rounded-xl border border-cyan-400/30 bg-cyan-400/5 p-3">
            <div className="mb-2 text-sm font-medium text-cyan-200">Edit block</div>
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <span className="label">Time</span>
                <input type="time" className="input w-28" value={eTime} onChange={(e) => setETime(e.target.value)} />
              </div>
              <div className="flex-1 min-w-40">
                <span className="label">Title</span>
                <input className="input" value={eTitle} onChange={(e) => setETitle(e.target.value)} />
              </div>
              <button className="btn" onClick={() => setEditingId(null)}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  updateRoutineBlock(editingId, { time: eTime, title: eTitle.trim() || b.title })
                  setEditingId(null)
                }}
              >
                Save
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
