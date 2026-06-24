import type { ReactNode } from 'react'

export function Marquee({
  children,
  speedSeconds = 18,
}: {
  children: ReactNode
  speedSeconds?: number
}) {
  return (
    <div className="marquee" style={{ ['--marquee-speed' as any]: `${speedSeconds}s` }}>
      <div className="marquee-track">
        <div className="marquee-item">{children}</div>
        <div className="marquee-item" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}

