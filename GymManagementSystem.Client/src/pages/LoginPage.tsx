import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { saveSession, getSession, type AuthRole } from '../auth/session'
import { authApi } from '../api/types'
import { Card, Container, Field, PageTitle } from '../components/ui'

type Mode = 'member' | 'admin'

type LoginLocationState = {
  username?: string
  message?: string
  from?: string
  mode?: Mode
}

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginState = (location.state as LoginLocationState | null) ?? null
  const queryMode = new URLSearchParams(location.search).get('mode')

  const [mode, setMode] = useState<Mode>(
    loginState?.mode ?? (queryMode === 'admin' ? 'admin' : 'member'),
  )
  const [username, setUsername] = useState(loginState?.username ?? '')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(loginState?.message ?? null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const session = getSession()
    if (session) {
      navigate(session.role === 'admin' ? '/admin' : '/member', { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    if (loginState?.username) setUsername(loginState.username)
    if (loginState?.message) setMessage(loginState.message)
    if (loginState?.mode) setMode(loginState.mode)
  }, [loginState?.message, loginState?.mode, loginState?.username])

  const canSubmit = username.trim().length >= 3 && password.trim().length >= 3

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const result = await authApi.login(username.trim(), password, mode)
      if (!result.success || !result.role) {
        setError(result.message ?? 'Login failed.')
        return
      }

      saveSession({
        role: result.role as AuthRole,
        username: username.trim(),
        displayName: result.displayName ?? username.trim(),
        token: result.token ?? '',
      })

      setMessage(result.message ?? `Logged in as ${result.displayName ?? mode}.`)

      const redirectTo =
        loginState?.from &&
        ((result.role === 'admin' && loginState.from.startsWith('/admin')) ||
          (result.role === 'member' && loginState.from.startsWith('/member')))
          ? loginState.from
          : result.role === 'admin'
            ? '/admin'
            : '/member'

      setTimeout(() => navigate(redirectTo, { replace: true }), 400)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section">
      <Container>
        <PageTitle
          title="Login"
          subtitle="Members log in with signup credentials. Admins use the admin tab."
          actions={
            <Link className="btn btn-ghost" to="/signup">
              Need an account? Sign up
            </Link>
          }
        />

        <div className="grid grid-2">
          <Card>
            <div className="tabs">
              <button
                className={['tab', mode === 'member' ? 'active' : null].filter(Boolean).join(' ')}
                type="button"
                onClick={() => setMode('member')}
              >
                Member login
              </button>
              <button
                className={['tab', mode === 'admin' ? 'active' : null].filter(Boolean).join(' ')}
                type="button"
                onClick={() => setMode('admin')}
              >
                Admin login
              </button>
            </div>

            <form className="form" onSubmit={handleSubmit}>
              <Field label="Username">
                <input
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={mode === 'admin' ? 'admin' : 'Your signup username'}
                  autoComplete="username"
                />
              </Field>
              <Field label="Password">
                <input
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder={mode === 'admin' ? 'admin123 or admin PIN' : '••••••••'}
                  autoComplete="current-password"
                />
              </Field>

              <button className="btn btn-primary" type="submit" disabled={!canSubmit || loading}>
                {loading ? 'Logging in…' : 'Login'}
              </button>

              {message ? <div className="callout success">{message}</div> : null}
              {error ? <div className="callout">{error}</div> : null}
            </form>

            <div className="divider" />

            <div className="muted">
              New here?{' '}
              <Link to="/signup" className="footer-link">
                Create an account on the signup page
              </Link>
              .
            </div>
          </Card>

          <Card>
            <div className="card-title">How to sign in</div>
            <ul className="list">
              <li>
                <strong>Members:</strong> sign up first, then log in with your username and password.
              </li>
              <li>
                <strong>Admin:</strong> username <code>admin</code> with password <code>admin123</code>, or your admin PIN if enabled in settings.
              </li>
            </ul>
          </Card>
        </div>
      </Container>
    </section>
  )
}
