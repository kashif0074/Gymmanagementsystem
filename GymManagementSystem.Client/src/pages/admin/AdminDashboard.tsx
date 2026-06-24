import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearSession } from '../../auth/session'

const adminNav = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/members', label: 'Members' },
  { to: '/admin/trainers', label: 'Trainers' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/attendance', label: 'Attendance' },
  { to: '/admin/schedule', label: 'Schedule' },
  { to: '/admin/messages', label: 'Messages' },
  { to: '/admin/settings', label: 'Settings' },
]

export function AdminDashboard() {
  const navigate = useNavigate()

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <section className="section">
      <div className="container">
        <div className="page-title">
          <div>
            <div className="eyebrow">Admin</div>
            <h1 className="h1">Dashboard</h1>
            <p className="muted max-720">
              Manage members, trainers, payments, attendance, and system settings.
            </p>
          </div>
          <div className="page-actions row gap-12">
            <NavLink className="btn btn-ghost" to="/">
              Back to site
            </NavLink>
            <button className="btn btn-ghost" type="button" onClick={logout}>
              Log out
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div className="row gap-12" style={{ flexWrap: 'wrap' }}>
            {adminNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  ['btn', isActive ? 'btn-primary' : 'btn-ghost'].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        <div style={{ height: 14 }} />

        <Outlet />
      </div>
    </section>
  )
}
