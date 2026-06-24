import { useEffect, useMemo, useRef } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  a: number
}

export function ParticlesCanvas({
  className,
  density = 0.00008,
}: {
  className?: string
  density?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const reduced = usePrefersReducedMotion()

  const seed = useMemo(() => Math.random(), [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (reduced) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const particles: Particle[] = []
    let raf = 0

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      const parent = canvas.parentElement
      const w = parent?.clientWidth ?? window.innerWidth
      const h = parent?.clientHeight ?? 260
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const target = Math.max(14, Math.min(90, Math.floor(w * h * density)))
      while (particles.length < target) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: 1 + Math.random() * 2.2,
          a: 0.18 + Math.random() * 0.28,
        })
      }
      while (particles.length > target) particles.pop()
    }

    const step = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight

      ctx.clearRect(0, 0, w, h)

      // soft vignette
      const grad = ctx.createRadialGradient(w * 0.5, h * 0.25, 10, w * 0.5, h * 0.4, Math.max(w, h))
      grad.addColorStop(0, 'rgba(45,226,230,0.08)')
      grad.addColorStop(0.6, 'rgba(154,252,76,0.05)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, w, h)

      // particles + links
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10

        ctx.beginPath()
        ctx.fillStyle = `rgba(255,255,255,${p.a})`
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      const linkDist = Math.min(140, Math.max(85, w * 0.12))
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d = Math.hypot(dx, dy)
          if (d < linkDist) {
            const alpha = (1 - d / linkDist) * 0.12
            ctx.strokeStyle = `rgba(154,252,76,${alpha})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      raf = requestAnimationFrame(step)
    }

    resize()
    raf = requestAnimationFrame(step)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [density, reduced, seed])

  return <canvas ref={canvasRef} className={['particles-canvas', className].filter(Boolean).join(' ')} />
}

