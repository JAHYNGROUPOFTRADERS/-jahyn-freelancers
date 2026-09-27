import React from 'react'
import { Tilt3D, useTiltDisabled } from './tilt'

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`card p-5 ${className}`}>{children}</div>
}

export function SectionTitle({
  icon,
  title,
  subtitle,
  right,
}: {
  icon?: string
  title: string
  subtitle?: string
  right?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-slate-100">
          {icon && <span aria-hidden>{icon}</span>}
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  wide?: boolean
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`card fade-in relative z-10 max-h-[85vh] w-full overflow-y-auto p-6 ${wide ? 'max-w-2xl' : 'max-w-md'}`}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="font-display text-lg font-semibold text-slate-100">{title}</h3>
          <button className="btn btn-ghost px-2 py-1" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function StatTile({
  icon,
  label,
  value,
  sub,
  tone = 'default',
}: {
  icon: string
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  tone?: 'default' | 'good' | 'warn' | 'info'
}) {
  const toneCls = {
    default: 'text-slate-100',
    good: 'text-emerald-300',
    warn: 'text-amber-300',
    info: 'text-cyan-300',
  }[tone]
  const tiltOff = useTiltDisabled()
  return (
    <Tilt3D className="card p-4" max={7} flat={tiltOff}>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
        <span aria-hidden>{icon}</span>
        {label}
      </div>
      <div className={`mt-2 font-display text-2xl font-bold ${toneCls}`} style={{ transform: 'translateZ(24px)' }}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </Tilt3D>
  )
}

export function EmptyState({ icon, title, hint }: { icon: string; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-base-border px-6 py-10 text-center">
      <div className="text-3xl" aria-hidden>
        {icon}
      </div>
      <div className="font-medium text-slate-300">{title}</div>
      {hint && <div className="text-sm text-slate-500">{hint}</div>}
    </div>
  )
}

export function Pill({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'ok' | 'warn' }) {
  const cls = { default: '', ok: 'chip-ok', warn: 'chip-warn' }[tone]
  return <span className={`chip ${cls}`}>{children}</span>
}
