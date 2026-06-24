import type { ButtonHTMLAttributes } from 'react'
import { useRef } from 'react'

export function RippleButton({
  className,
  children,
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const ref = useRef<HTMLButtonElement | null>(null)

  return (
    <button
      {...props}
      ref={ref}
      className={['btn', 'btn-ripple', className].filter(Boolean).join(' ')}
      onClick={(e) => {
        const btn = ref.current
        if (btn) {
          const rect = btn.getBoundingClientRect()
          btn.style.setProperty('--rx', `${e.clientX - rect.left}px`)
          btn.style.setProperty('--ry', `${e.clientY - rect.top}px`)
          btn.classList.remove('rippling')
          // force reflow
          void btn.offsetWidth
          btn.classList.add('rippling')
        }
        onClick?.(e)
      }}
    >
      {children}
    </button>
  )
}

