import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { clearSession, getSession } from '../auth/session'
import { settingsApi } from '../api/types'
import { LogoMark } from '../components/Logo'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/plans', label: 'Plans' },
  { to: '/trainers', label: 'Trainers' },
  { to: '/schedule', label: 'Schedule' },
  { to: '/signup', label: 'Signup' },
  { to: '/contact', label: 'Contact' },
]

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [session, setSession] = useState(getSession())
  const [gymName, setGymName] = useState('Gym Management System')
  const [contactEmail, setContactEmail] = useState('gym@example.com')
  const [contactPhone, setContactPhone] = useState('+1 (000) 000-0000')
  const location = useLocation()
  const navigate = useNavigate()

  const visibleNavItems = navItems.filter((item) => {
    if (item.to === '/signup' && session) return false
    return true
  })

  useEffect(() => {
    settingsApi
      .getPublic()
      .then((s) => {
        setGymName(s.gymName)
        setContactEmail(s.contactEmail)
        setContactPhone(s.contactPhone)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setSession(getSession())
  }, [location.pathname])

  function logout() {
    clearSession()
    setSession(null)
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <NavLink className="brand" to="/" aria-label="Go to home">
            <div className="brand-mark" aria-hidden="true">
              <LogoMark className="logo-mark" />
            </div>
            <div className="brand-text">
              <div className="brand-name">{gymName}</div>
              <div className="brand-tag">Train smart. Stay consistent.</div>
            </div>
          </NavLink>

          <nav className="nav desktop-only">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  ['nav-link', isActive ? 'active' : null].filter(Boolean).join(' ')
                }
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions desktop-only">
            {session?.role === 'admin' ? (
              <NavLink className="btn btn-primary" to="/admin">
                Admin
              </NavLink>
            ) : session?.role === 'member' ? (
              <NavLink className="btn btn-primary" to="/member">
                My account
              </NavLink>
            ) : (
              <>
                <NavLink className="btn btn-ghost" to="/login">
                  Login
                </NavLink>
                <NavLink className="btn btn-primary" to="/signup">
                  Sign up
                </NavLink>
              </>
            )}
            {session ? (
              <button className="btn btn-ghost" type="button" onClick={logout}>
                Log out
              </button>
            ) : null}
          </div>

          <div className="mobile-actions mobile-only">
            {session ? (
              <NavLink
                className="btn btn-primary"
                to={session.role === 'admin' ? '/admin' : '/member'}
              >
                {session.role === 'admin' ? 'Admin' : 'Account'}
              </NavLink>
            ) : (
              <NavLink className="btn btn-primary" to="/signup">
                Sign up
              </NavLink>
            )}
            <button
              type="button"
              className="btn btn-ghost icon-btn"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span aria-hidden="true">☰</span>
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="mobile-menu">
            <div className="container mobile-menu-inner">
              <div className="mobile-nav">
                {visibleNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      ['nav-link', 'mobile-nav-link', isActive ? 'active' : null]
                        .filter(Boolean)
                        .join(' ')
                    }
                    end={item.to === '/'}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
              <div className="mobile-cta">
                {session ? (
                  <>
                    <NavLink
                      className="btn btn-primary"
                      to={session.role === 'admin' ? '/admin' : '/member'}
                    >
                      {session.role === 'admin' ? 'Admin dashboard' : 'My account'}
                    </NavLink>
                    <button className="btn btn-ghost" type="button" onClick={logout}>
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink className="btn btn-ghost" to="/login">
                      Login
                    </NavLink>
                    <NavLink className="btn btn-primary" to="/signup">
                      Sign up
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <main className="site-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <div className="footer-title">{gymName}</div>
            <div className="footer-muted">© {new Date().getFullYear()} All rights reserved.</div>
          </div>
          <div className="footer-links">
            <a className="footer-link" href={`mailto:${contactEmail}`}>
              {contactEmail}
            </a>
            <span className="footer-dot" aria-hidden="true">
              •
            </span>
            <a className="footer-link" href={`tel:${contactPhone.replace(/\s/g, '')}`}>
              {contactPhone}
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
