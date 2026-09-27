import { useEffect, useState } from 'react'

/** Re-renders every `ms` so relative UI (current time blocks, greeting) stays fresh. */
export function useNow(ms = 30000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const iv = window.setInterval(() => setNow(new Date()), ms)
    return () => clearInterval(iv)
  }, [ms])
  return now
}
