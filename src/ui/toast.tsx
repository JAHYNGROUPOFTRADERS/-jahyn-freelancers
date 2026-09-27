import { useStore } from '../state/store'

export function Toaster() {
  const { toasts, dismissToast } = useStore()
  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 md:bottom-6">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismissToast(t.id)}
          className={`glass pointer-events-auto rounded-xl border px-4 py-2.5 text-left text-sm shadow-card fade-in ${
            t.kind === 'ok' ? 'border-emerald-400/30 text-emerald-200' : t.kind === 'warn' ? 'border-amber-400/30 text-amber-200' : 'border-base-border text-slate-200'
          }`}
        >
          {t.msg}
        </button>
      ))}
    </div>
  )
}
