import type { HTMLAttributes } from 'react'

export function LogoMark(props: HTMLAttributes<SVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label="Gym logo"
      {...props}
    >
      <defs>
        <linearGradient id="gms_logo_a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(154,252,76,0.95)" />
          <stop offset="1" stopColor="rgba(45,226,230,0.95)" />
        </linearGradient>
        <radialGradient id="gms_logo_b" cx="0.25" cy="0.15" r="0.9">
          <stop offset="0" stopColor="rgba(255,255,255,0.32)" />
          <stop offset="1" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <filter id="gms_logo_shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="rgba(0,0,0,0.45)" />
        </filter>
      </defs>

      <g filter="url(#gms_logo_shadow)">
        <rect x="6" y="6" width="52" height="52" rx="16" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.16)" />
        <rect x="6" y="6" width="52" height="52" rx="16" fill="url(#gms_logo_b)" />
      </g>

      {/* Dumbbell + G monogram */}
      <g transform="translate(10 16)">
        <rect x="2" y="14" width="40" height="6" rx="3" fill="rgba(255,255,255,0.14)" />
        <rect x="0" y="10" width="8" height="14" rx="4" fill="url(#gms_logo_a)" />
        <rect x="36" y="10" width="8" height="14" rx="4" fill="url(#gms_logo_a)" />

        <path
          d="M25 4c-9 0-15 6.2-15 14.3C10 27 16.8 32 26 32c4.7 0 8.4-1.3 11.4-3.9v-9.2H25.4v5.1h6.2v2.1c-1.5.9-3.4 1.3-5.7 1.3-5.4 0-9.1-3.3-9.1-8.1 0-5 3.5-8.5 8.6-8.5 3 0 5.5 1 7.4 2.9l4-4C34.4 6 30.4 4 25 4z"
          fill="rgba(11,15,23,0.92)"
          opacity="0.9"
        />
      </g>
    </svg>
  )
}

