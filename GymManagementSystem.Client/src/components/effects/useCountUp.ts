import { useEffect, useMemo, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export function useCountUp({
  to,
  durationMs = 900,
  startWhen = true,
}: {
  to: number
  durationMs?: number
  startWhen?: boolean
}) {
  const reduced = usePrefersReducedMotion()
  const [value, setValue] = useState(0)

  const safeTo = useMemo(() => (Number.isFinite(to) ? Math.max(0, to) : 0), [to])

  useEffect(() => {
    if (!startWhen) return
    if (reduced) {
      setValue(safeTo)
      return
    }
    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * safeTo))
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [durationMs, reduced, safeTo, startWhen])

  return value
}

