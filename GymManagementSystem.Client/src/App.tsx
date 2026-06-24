import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './components/RequireAuth'
import { dashboardApi, type DashboardStats } from './api/types'
import { AppLayout } from './layout/AppLayout'
import { HomePage } from './pages/HomePage'
import { RegisterPage } from './pages/RegisterPage'
import { SignupPage } from './pages/SignupPage'
import { LoginPage } from './pages/LoginPage'
import { MemberDashboard } from './pages/MemberDashboard'
import { PlansPage } from './pages/PlansPage'
import { TrainersPage } from './pages/TrainersPage'
import { SchedulePage } from './pages/SchedulePage'
import { ContactPage } from './pages/ContactPage'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { ManageMembers } from './pages/admin/ManageMembers'
import { ManageTrainers } from './pages/admin/ManageTrainers'
import { ManagePayments } from './pages/admin/ManagePayments'
import { AdminAttendance } from './pages/admin/AdminAttendance'
import { AdminSettings } from './pages/admin/AdminSettings'
import { AdminMessages } from './pages/admin/AdminMessages'
import { AdminSchedule } from './pages/admin/AdminSchedule'

function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    dashboardApi.stats().then(setStats).catch(() => {})
  }, [])

  return (
    <div className="grid grid-3">
      <div className="card">
        <div className="card-title">Members</div>
        <p className="muted">
          {stats ? `${stats.activeMembers} active / ${stats.totalMembers} total` : 'Add/edit members, manage plans and renewals.'}
        </p>
      </div>
      <div className="card">
        <div className="card-title">Payments</div>
        <p className="muted">
          {stats ? `${stats.pendingPayments} pending • PKR ${stats.totalRevenue.toLocaleString()} revenue` : 'Track revenue, pending payments, and history.'}
        </p>
      </div>
      <div className="card">
        <div className="card-title">Attendance</div>
        <p className="muted">
          {stats ? `${stats.todayAttendance} check-ins today` : 'Log check-ins/outs and daily activity.'}
        </p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/member"
          element={
            <RequireAuth role="member">
              <MemberDashboard />
            </RequireAuth>
          }
        />
        <Route path="/plans" element={<PlansPage />} />
        <Route path="/trainers" element={<TrainersPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route
          path="/admin"
          element={
            <RequireAuth role="admin">
              <AdminDashboard />
            </RequireAuth>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="members" element={<ManageMembers />} />
          <Route path="trainers" element={<ManageTrainers />} />
          <Route path="payments" element={<ManagePayments />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="schedule" element={<AdminSchedule />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
