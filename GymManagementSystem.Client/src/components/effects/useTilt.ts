import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type TiltOptions = {
  maxDeg?: number
  perspective?: number
  scale?: number
}

export function useTilt<T extends HTMLElement>(options: TiltOptions = {}) {
  const ref = useRef<T | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reducedMotion) return

    const maxDeg = options.maxDeg ?? 10
    const perspective = options.perspective ?? 900
    const scale = options.scale ?? 1.02

    let raf = 0
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      const rx = (0.5 - y) * maxDeg
      const ry = (x - 0.5) * maxDeg
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px) scale(${scale})`
      })
    }

    const reset = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.transform = ''
      })
    }

    el.style.willChange = 'transform'
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', reset)
    el.addEventListener('pointercancel', reset)

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', reset)
      el.removeEventListener('pointercancel', reset)
      el.style.willChange = ''
      el.style.transform = ''
    }
  }, [options.maxDeg, options.perspective, options.scale, reducedMotion])

  return ref
}

