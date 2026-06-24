import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearSession, getSession, saveSession } from '../auth/session'
import { membersApi, attendanceApi, type MemberProfile } from '../api/types'
import { Card, Container, PageTitle, Field } from '../components/ui'

function formatDate(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString()
}

export function MemberDashboard() {
  const navigate = useNavigate()
  const session = getSession()
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [profileMsg, setProfileMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Profile Edit State
  const [showSettings, setShowSettings] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editAge, setEditAge] = useState<number | ''>('')
  const [editGender, setEditGender] = useState('Male')
  const [editPassword, setEditPassword] = useState('')
  const [editConfirmPassword, setEditConfirmPassword] = useState('')
  const [updating, setUpdating] = useState(false)

  // Check-In State
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!session?.username) {
      setLoading(false)
      return
    }

    membersApi
      .profile(session.username)
      .then((data) => {
        setProfile(data)
        if (data?.member) {
          setEditName(data.member.name ?? '')
          setEditEmail(data.member.email ?? '')
          setEditPhone(data.member.phone ?? '')
          setEditAge(data.member.age ?? '')
          setEditGender(data.member.gender ?? 'Male')
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load profile.'))
      .finally(() => setLoading(false))
  }, [session?.username])

  function logout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  const member = profile?.member

  // Determine active check-in status (checked in today but has not checked out)
  const todayStr = new Date().toDateString()
  const activeRecord = profile?.attendance?.find((a) => {
    const recordDate = new Date(a.date).toDateString()
    return recordDate === todayStr && !a.checkOut
  })

  async function handleCheckIn() {
    setChecking(true)
    setError(null)
    setProfileMsg(null)
    try {
      await attendanceApi.checkin()
      const data = await membersApi.profile(session!.username)
      setProfile(data)
      setProfileMsg('Checked in successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check-in failed.')
    } finally {
      setChecking(false)
    }
  }

  async function handleCheckOut() {
    setChecking(true)
    setError(null)
    setProfileMsg(null)
    try {
      await attendanceApi.checkout()
      const data = await membersApi.profile(session!.username)
      setProfile(data)
      setProfileMsg('Checked out successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Check-out failed.')
    } finally {
      setChecking(false)
    }
  }

  const passMatch = editPassword === editConfirmPassword
  const canUpdate =
    editName.trim().length >= 2 &&
    editEmail.trim().length >= 5 &&
    editPhone.trim().length >= 7 &&
    (editPassword === '' || (editPassword.length >= 6 && passMatch))

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault()
    if (!canUpdate) return

    setUpdating(true)
    setError(null)
    setProfileMsg(null)

    try {
      const updated = await membersApi.updateProfile({
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        age: editAge === '' ? null : Number(editAge),
        gender: editGender,
        password: editPassword || undefined,
      })

      if (session) {
        saveSession({
          ...session,
          displayName: updated.name,
        })
      }

      setProfileMsg('Profile updated successfully!')
      setEditPassword('')
      setEditConfirmPassword('')
      setShowSettings(false)

      // Refresh view
      const data = await membersApi.profile(session!.username)
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile update failed.')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <section className="section">
      <Container>
        <PageTitle
          title="My Account"
          subtitle="View your membership details, payments, and log your gym visits."
          actions={
            <div className="row gap-12">
              <button className="btn btn-ghost" type="button" onClick={() => setShowSettings(!showSettings)}>
                {showSettings ? 'View Dashboard' : 'Profile Settings'}
              </button>
              <button className="btn btn-ghost" type="button" onClick={logout}>
                Log out
              </button>
            </div>
          }
        />

        {error ? <div className="callout">{error}</div> : null}
        {profileMsg ? <div className="callout success">{profileMsg}</div> : null}
        {loading ? <div className="muted">Loading your account…</div> : null}

        {showSettings ? (
          <div className="grid grid-2">
            <Card>
              <div className="card-title">Update Profile Details</div>
              <form className="form" onSubmit={handleUpdateProfile}>
                <Field label="Full name">
                  <input
                    className="input"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Email address">
                  <input
                    className="input"
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                </Field>
                <Field label="Phone number">
                  <input
                    className="input"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    required
                  />
                </Field>

                <div className="row gap-12">
                  <Field label="Age">
                    <input
                      className="input"
                      type="number"
                      value={editAge}
                      onChange={(e) => setEditAge(e.target.value === '' ? '' : Number(e.target.value))}
                      min={10}
                      max={100}
                    />
                  </Field>
                  <Field label="Gender">
                    <select
                      className="input"
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </Field>
                </div>

                <div className="divider" />
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Change Password (Optional)</div>

                <div className="row gap-12">
                  <Field label="New password">
                    <input
                      className="input"
                      type="password"
                      placeholder="At least 6 characters"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                    />
                  </Field>
                  <Field label="Confirm new password">
                    <input
                      className="input"
                      type="password"
                      placeholder="Repeat new password"
                      value={editConfirmPassword}
                      onChange={(e) => setEditConfirmPassword(e.target.value)}
                    />
                  </Field>
                </div>

                {!passMatch && editConfirmPassword.length > 0 ? (
                  <div className="callout" style={{ margin: '8px 0' }}>Passwords do not match.</div>
                ) : null}

                <div className="row gap-12" style={{ marginTop: 16 }}>
                  <button className="btn btn-primary" type="submit" disabled={!canUpdate || updating}>
                    {updating ? 'Saving changes…' : 'Save Changes'}
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={() => setShowSettings(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </Card>

            <Card>
              <div className="card-title">Security & Account Note</div>
              <p className="muted">
                Your profile updates are securely saved. Changing your password will invalidate your previous login session on other devices.
              </p>
              <div className="divider" />
              <div className="card-title">Profile Summary</div>
              <div className="kv">
                <div className="kv-k">Plan</div>
                <div className="kv-v">{member?.plan || '—'}</div>
                <div className="kv-k">Trainer</div>
                <div className="kv-v">{member?.trainerName || 'None'}</div>
                <div className="kv-k">Status</div>
                <div className="kv-v">{member?.status || '—'}</div>
                <div className="kv-k">Age</div>
                <div className="kv-v">{member?.age ?? '—'}</div>
                <div className="kv-k">Gender</div>
                <div className="kv-v">{member?.gender || '—'}</div>
              </div>
            </Card>
          </div>
        ) : (
          <>
            <div className="grid grid-3">
              <Card>
                <div className="card-title">Member Profile</div>
                <div className="kpi">
                  <div className="kpi-value" style={{ fontSize: 22 }}>
                    {session?.displayName ?? session?.username ?? 'Member'}
                  </div>
                  <div className="kpi-label">@{session?.username}</div>
                </div>
              </Card>

              <Card>
                <div className="card-title">Daily Attendance</div>
                <p className="muted">Check in when arriving and check out when leaving the gym.</p>
                <div style={{ height: 12 }} />
                {activeRecord ? (
                  <button
                    className="btn btn-primary"
                    style={{ background: '#f44336', color: '#fff' }}
                    onClick={handleCheckOut}
                    disabled={checking}
                  >
                    {checking ? 'Checking out…' : `Check Out (In since ${activeRecord.checkIn})`}
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={handleCheckIn}
                    disabled={checking}
                  >
                    {checking ? 'Checking in…' : 'Check In Now'}
                  </button>
                )}
              </Card>

              <Card>
                <div className="card-title">Membership</div>
                {member ? (
                  <div className="kv">
                    <div className="kv-k">Plan</div>
                    <div className="kv-v">{member.plan}</div>
                    <div className="kv-k">Trainer</div>
                    <div className="kv-v">{member.trainerName || 'None'}</div>
                    <div className="kv-k">Status</div>
                    <div className="kv-v">{member.status}</div>
                    <div className="kv-k">Renews</div>
                    <div className="kv-v">{formatDate(member.renewsAt)}</div>
                    <div className="kv-k">Joined</div>
                    <div className="kv-v">{formatDate(member.joinedAt)}</div>
                  </div>
                ) : (
                  <p className="muted">Membership details will appear after your profile loads.</p>
                )}
                <div style={{ height: 12 }} />
                <Link className="btn btn-ghost" to="/plans">
                  View plans
                </Link>
              </Card>
            </div>

            {profile ? (
              <>
                <div style={{ height: 14 }} />
                <div className="grid grid-2">
                  <Card>
                    <div className="card-title">Payment history</div>
                    {profile.payments.length === 0 ? (
                      <p className="muted">No payment records yet.</p>
                    ) : (
                      <div className="table">
                        <div className="table-row table-head">
                          <div>Date</div>
                          <div>Plan</div>
                          <div>Amount</div>
                          <div>Status</div>
                        </div>
                        {profile.payments.map((p) => (
                          <div key={p.id} className="table-row">
                            <div>{formatDate(p.createdAt)}</div>
                            <div>{p.forPlan}</div>
                            <div>PKR {p.amount.toLocaleString()}</div>
                            <div>{p.status}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  <Card>
                    <div className="card-title">Recent attendance</div>
                    {profile.attendance.length === 0 ? (
                      <p className="muted">No check-ins recorded yet.</p>
                    ) : (
                      <div className="table">
                        <div className="table-row table-head">
                          <div>Date</div>
                          <div>Check in</div>
                          <div>Check out</div>
                          <div>Source</div>
                        </div>
                        {profile.attendance.map((a) => (
                          <div key={a.id} className="table-row">
                            <div>{formatDate(a.date)}</div>
                            <div>{a.checkIn || '—'}</div>
                            <div>{a.checkOut || '—'}</div>
                            <div>{a.note || 'Admin'}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              </>
            ) : null}
          </>
        )}
      </Container>
    </section>
  )
}
