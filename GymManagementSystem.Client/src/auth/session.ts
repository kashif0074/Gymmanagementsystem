export type AuthRole = 'admin' | 'member'

export type AuthSession = {
  role: AuthRole
  username: string
  displayName: string
  token: string
}

const STORAGE_KEY = 'gym-auth'

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthSession
    if (!parsed?.role || !parsed?.username) return null
    return parsed
  } catch {
    return null
  }
}

export function saveSession(session: AuthSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
}

export function isAdmin() {
  return getSession()?.role === 'admin'
}

export function isMember() {
  return getSession()?.role === 'member'
}
