import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getSession, type AuthRole } from '../auth/session'

type RequireAuthProps = {
  role?: AuthRole
  children: ReactNode
}

export function RequireAuth({ role, children }: RequireAuthProps) {
  const location = useLocation()
  const session = getSession()

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: 'Please log in to continue.',
        }}
      />
    )
  }

  if (role && session.role !== role) {
    return <Navigate to={session.role === 'admin' ? '/admin' : '/member'} replace />
  }

  return children
}
