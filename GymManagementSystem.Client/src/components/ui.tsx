import type { ReactNode } from 'react'
import { useTilt } from './effects/useTilt'

export function Container({ children }: { children: ReactNode }) {
  return <div className="container">{children}</div>
}

export function SectionHeader({
  id,
  eyebrow,
  title,
  subtitle,
}: {
  id?: string
  eyebrow?: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="section-header">
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      <h2 className="h2" id={id}>
        {title}
      </h2>
      {subtitle ? <p className="muted max-720">{subtitle}</p> : null}
    </div>
  )
}

export function PageTitle({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="page-title">
      <div>
        <h1 className="h1">{title}</h1>
        {subtitle ? <p className="muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </div>
  )
}

export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={['card', className].filter(Boolean).join(' ')}>{children}</div>
}

export function TiltCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useTilt<HTMLDivElement>({ maxDeg: 9, perspective: 900, scale: 1.02 })
  return (
    <div ref={ref} className={['card', 'tilt-card', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}

export function Grid({
  children,
  cols = 3,
}: {
  children: ReactNode
  cols?: 1 | 2 | 3 | 4
}) {
  return <div className={`grid grid-${cols}`}>{children}</div>
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  return (
    <label className="field">
      <div className="label">{label}</div>
      {children}
      {hint ? <div className="hint">{hint}</div> : null}
    </label>
  )
}

