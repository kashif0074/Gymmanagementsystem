import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { membersApi, type Member } from '../../api/types'

interface MemberFormState {
  name: string
  username: string
  email: string
  phone: string
  plan: string
  status: string
  renewsAt: string
  age: string
  gender: string
}

function formatDate(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString()
}

export function ManageMembers() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [planFilter, setPlanFilter] = useState('All')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<MemberFormState>({
    name: '',
    username: '',
    email: '',
    phone: '',
    plan: 'Monthly',
    status: 'Active',
    renewsAt: '',
    age: '',
    gender: '',
  })

  async function loadMembers() {
    setLoading(true)
    setError(null)
    try {
      const data = await membersApi.list()
      setMembers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return members
      .filter((m) => (statusFilter === 'All' ? true : m.status === statusFilter))
      .filter((m) => (planFilter === 'All' ? true : m.plan === planFilter))
      .filter((m) => {
        if (!q) return true
        return (
          m.name.toLowerCase().includes(q) ||
          (m.username ?? '').toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.phone ?? '').toLowerCase().includes(q)
        )
      })
  }, [members, planFilter, query, statusFilter])

  const kpis = useMemo(() => {
    const active = members.filter((m) => m.status === 'Active').length
    const inactive = members.length - active
    const expiringSoon = members.filter((m) => {
      if (!m.renewsAt) return false
      const dt = new Date(m.renewsAt).getTime()
      if (Number.isNaN(dt)) return false
      const days = Math.ceil((dt - Date.now()) / (1000 * 60 * 60 * 24))
      return days >= 0 && days <= 7
    }).length
    return { total: members.length, active, inactive, expiringSoon }
  }, [members])

  function resetForm() {
    setEditingId(null)
    setForm({
      name: '',
      username: '',
      email: '',
      phone: '',
      plan: 'Monthly',
      status: 'Active',
      renewsAt: '',
      age: '',
      gender: '',
    })
  }

  function onEdit(member: Member) {
    setEditingId(member.id)
    setForm({
      name: member.name ?? '',
      username: member.username ?? '',
      email: member.email ?? '',
      phone: member.phone ?? '',
      plan: member.plan ?? 'Monthly',
      status: member.status ?? 'Active',
      renewsAt: member.renewsAt ? member.renewsAt.slice(0, 10) : '',
      age: member.age != null ? String(member.age) : '',
      gender: member.gender ?? '',
    })
  }

  async function onDelete(id: string) {
    const member = members.find((m) => m.id === id)
    const ok = window.confirm(`Delete member “${member?.name ?? 'this member'}”?`)
    if (!ok) return

    try {
      await membersApi.remove(id)
      setMembers((prev) => prev.filter((m) => m.id !== id))
      if (editingId === id) resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete member.')
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()

    const name = form.name.trim()
    const email = form.email.trim()
    if (!name || !email) return

    const renewsAt = form.renewsAt ? `${form.renewsAt}T00:00:00.000Z` : null
    const payload = {
      name,
      username: form.username.trim(),
      email,
      phone: form.phone.trim(),
      plan: form.plan,
      status: form.status,
      renewsAt,
      age: form.age !== '' ? Number(form.age) : null,
      gender: form.gender || null,
    }

    try {
      if (editingId) {
        const updated = await membersApi.update(editingId, payload)
        setMembers((prev) => prev.map((m) => (m.id === editingId ? updated : m)))
      } else {
        const created = await membersApi.create(payload)
        setMembers((prev) => [created, ...prev])
      }
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save member.')
    }
  }

  return (
    <div className="grid grid-2">
      <div className="grid grid-1">
        <div className="card">
          <div className="section-header">
            <div className="eyebrow">Management</div>
            <div>
              <div className="h2">Members</div>
              <div className="muted">Search, add, edit, deactivate, and renew memberships.</div>
            </div>
          </div>

          {error ? <div className="callout">{error}</div> : null}
          {loading ? <div className="muted">Loading members…</div> : null}

          <div className="grid grid-4">
            <div className="card" style={{ boxShadow: 'none' }}>
              <div className="kpi">
                <div>
                  <div className="kpi-value">{kpis.total}</div>
                  <div className="kpi-label">Total</div>
                </div>
              </div>
            </div>
            <div className="card" style={{ boxShadow: 'none' }}>
              <div className="kpi">
                <div>
                  <div className="kpi-value">{kpis.active}</div>
                  <div className="kpi-label">Active</div>
                </div>
              </div>
            </div>
            <div className="card" style={{ boxShadow: 'none' }}>
              <div className="kpi">
                <div>
                  <div className="kpi-value">{kpis.inactive}</div>
                  <div className="kpi-label">Inactive</div>
                </div>
              </div>
            </div>
            <div className="card" style={{ boxShadow: 'none' }}>
              <div className="kpi">
                <div>
                  <div className="kpi-value">{kpis.expiringSoon}</div>
                  <div className="kpi-label">Renew in 7 days</div>
                </div>
              </div>
            </div>
          </div>

          <div className="divider" />

          <div className="row gap-12" style={{ alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="field" style={{ flex: 1, minWidth: 220 }}>
              <div className="label">Search</div>
              <input
                className="input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, email, phone..."
              />
            </div>
            <div className="field" style={{ minWidth: 160 }}>
              <div className="label">Status</div>
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="field" style={{ minWidth: 160 }}>
              <div className="label">Plan</div>
              <select
                className="input"
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
              >
                <option>All</option>
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Yearly</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div className="h2" style={{ margin: 0 }}>
                Member list
              </div>
              <div className="muted">Showing {filtered.length} of {members.length}</div>
            </div>
            <button className="btn btn-ghost" type="button" onClick={loadMembers}>
              Refresh
            </button>
          </div>

          <div style={{ height: 12 }} />

          <div className="table">
            <div
              className="table-row table-head"
              style={{ '--table-cols': '1.2fr 1.2fr 0.9fr 0.8fr 0.9fr 0.8fr' } as React.CSSProperties}
            >
              <div>Name</div>
              <div>Email</div>
              <div>Phone</div>
              <div>Plan</div>
              <div>Renews</div>
              <div>Actions</div>
            </div>

            {filtered.map((m) => (
              <div
                key={m.id}
                className="table-row"
                style={{ '--table-cols': '1.2fr 1.2fr 0.9fr 0.8fr 0.9fr 0.8fr' } as React.CSSProperties}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>{m.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {m.status} • {m.username ? `@${m.username}` : 'No login'} • Joined {formatDate(m.joinedAt)}
                  </div>
                </div>
                <div style={{ wordBreak: 'break-word' }}>{m.email}</div>
                <div>{m.phone || '—'}</div>
                <div>{m.plan}</div>
                <div>{formatDate(m.renewsAt)}</div>
                <div className="row gap-12" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost" type="button" onClick={() => onEdit(m)}>
                    Edit
                  </button>
                  <button className="btn" type="button" onClick={() => onDelete(m.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && !loading ? (
              <div className="callout">
                No members match your filters. Try clearing search or switching filters.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div className="eyebrow">{editingId ? 'Edit member' : 'Add member'}</div>
          <div>
            <div className="h2">{editingId ? 'Update member' : 'New member'}</div>
            <div className="muted">Changes are saved to the backend API.</div>
          </div>
        </div>

        <form className="form" onSubmit={onSubmit}>
          <div className="field">
            <div className="label">Full name *</div>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g., Ayesha Noor"
              required
            />
          </div>

          <div className="field">
            <div className="label">Username</div>
            <input
              className="input"
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
              placeholder="Login username (optional for walk-in members)"
            />
          </div>

          <div className="field">
            <div className="label">Email *</div>
            <input
              className="input"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="e.g., member@example.com"
              type="email"
              required
            />
          </div>

          <div className="field">
            <div className="label">Phone</div>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="e.g., +92 3xx xxxxxxx"
            />
          </div>

          <div className="grid grid-2">
            <div className="field">
              <div className="label">Plan</div>
              <select
                className="input"
                value={form.plan}
                onChange={(e) => setForm((p) => ({ ...p, plan: e.target.value }))}
              >
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Yearly</option>
              </select>
            </div>
            <div className="field">
              <div className="label">Status</div>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-2">
            <div className="field">
              <div className="label">Age</div>
              <input
                className="input"
                value={form.age}
                onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                type="number"
                min="0"
                placeholder="Optional"
              />
            </div>
            <div className="field">
              <div className="label">Gender</div>
              <select
                className="input"
                value={form.gender}
                onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
              >
                <option value="">—</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="field">
            <div className="label">Renewal date</div>
            <input
              className="input"
              value={form.renewsAt}
              onChange={(e) => setForm((p) => ({ ...p, renewsAt: e.target.value }))}
              type="date"
            />
            <div className="hint">Optional: set when membership needs renewal.</div>
          </div>

          <div className="row gap-12" style={{ justifyContent: 'flex-end' }}>
            {editingId ? (
              <button className="btn btn-ghost" type="button" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
            <button className="btn btn-primary" type="submit">
              {editingId ? 'Save changes' : 'Add member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
