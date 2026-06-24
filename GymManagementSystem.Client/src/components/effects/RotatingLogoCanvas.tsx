import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function RotatingLogoCanvas({
  className,
  size = 220,
}: {
  className?: string
  size?: number
}) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = Math.floor(size * dpr)
    canvas.height = Math.floor(size * dpr)
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const center = size / 2
    let raf = 0
    let mx = 0
    let my = 0

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      mx = clamp(x, -0.5, 0.5)
      my = clamp(y, -0.5, 0.5)
    }
    canvas.addEventListener('pointermove', onMove)

    const draw = (now: number) => {
      const spin = reduced ? 0 : now / 2200
      const rx = reduced ? 0 : -my * 0.55
      const ry = reduced ? 0 : mx * 0.75

      ctx.clearRect(0, 0, size, size)

      // glass plate
      ctx.save()
      ctx.translate(center, center)
      ctx.rotate(spin * 0.2)
      const bg = ctx.createRadialGradient(-40, -60, 10, 0, 0, center * 1.1)
      bg.addColorStop(0, 'rgba(45,226,230,0.22)')
      bg.addColorStop(0.45, 'rgba(154,252,76,0.16)')
      bg.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = bg
      ctx.beginPath()
      ctx.arc(0, 0, center - 6, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // pseudo-3D: scale circle into ellipse + offset highlights based on rx/ry
      ctx.save()
      ctx.translate(center, center)
      ctx.rotate(spin)
      ctx.scale(1, 0.82)

      // outer ring
      const ring = ctx.createLinearGradient(-center, -center, center, center)
      ring.addColorStop(0, 'rgba(154,252,76,0.9)')
      ring.addColorStop(1, 'rgba(45,226,230,0.9)')
      ctx.lineWidth = 10
      ctx.strokeStyle = ring
      ctx.beginPath()
      ctx.arc(0, 0, center - 20, 0, Math.PI * 2)
      ctx.stroke()

      // inner glass
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      ctx.beginPath()
      ctx.arc(0, 0, center - 30, 0, Math.PI * 2)
      ctx.fill()

      // highlight
      const hx = ry * 34
      const hy = rx * 26
      const hi = ctx.createRadialGradient(-30 + hx, -40 + hy, 8, -30 + hx, -40 + hy, center)
      hi.addColorStop(0, 'rgba(255,255,255,0.25)')
      hi.addColorStop(0.35, 'rgba(255,255,255,0.08)')
      hi.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = hi
      ctx.beginPath()
      ctx.arc(0, 0, center - 30, 0, Math.PI * 2)
      ctx.fill()

      // monogram "G"
      ctx.save()
      ctx.scale(1, 1.06)
      ctx.fillStyle = 'rgba(11,15,23,0.92)'
      ctx.beginPath()
      ctx.arc(-10, -4, 46, 0.15 * Math.PI, 1.85 * Math.PI, false)
      ctx.arc(-10, -4, 26, 1.85 * Math.PI, 0.15 * Math.PI, true)
      ctx.closePath()
      ctx.fill()

      ctx.fillStyle = 'rgba(11,15,23,0.92)'
      ctx.fillRect(6, -6, 34, 12)
      ctx.restore()

      ctx.restore()

      // subtle shadow
      ctx.save()
      ctx.globalAlpha = 0.32
      ctx.filter = 'blur(10px)'
      ctx.fillStyle = 'rgba(0,0,0,0.65)'
      ctx.beginPath()
      ctx.ellipse(center, center + 72, 70, 20, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointermove', onMove)
    }
  }, [reduced, size])

  return <canvas ref={ref} className={['rotating-logo-canvas', className].filter(Boolean).join(' ')} />
}

