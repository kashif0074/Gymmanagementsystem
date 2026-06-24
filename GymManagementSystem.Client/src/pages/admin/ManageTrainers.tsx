import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { trainersApi, type Trainer } from '../../api/types'

interface TrainerFormState {
  name: string
  email: string
  phone: string
  specialty: string
  experienceYears: number
  status: string
  ratePerSession: number
  bio: string
  showOnPublicSite: boolean
}

function currencyPKR(value: number) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PKR' }).format(n)
}

export function ManageTrainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [specialtyFilter, setSpecialtyFilter] = useState('All')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<TrainerFormState>({
    name: '',
    email: '',
    phone: '',
    specialty: 'Strength',
    experienceYears: 1,
    status: 'Active',
    ratePerSession: 2000,
    bio: '',
    showOnPublicSite: true,
  })

  async function loadTrainers() {
    setLoading(true)
    setError(null)
    try {
      const data = await trainersApi.list()
      setTrainers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trainers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrainers()
  }, [])

  const specialties = useMemo(() => {
    const set = new Set(trainers.map((t) => t.specialty).filter(Boolean))
    return ['All', ...Array.from(set)]
  }, [trainers])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return trainers
      .filter((t) => (statusFilter === 'All' ? true : t.status === statusFilter))
      .filter((t) => (specialtyFilter === 'All' ? true : t.specialty === specialtyFilter))
      .filter((t) => {
        if (!q) return true
        return (
          t.name.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q) ||
          (t.phone ?? '').toLowerCase().includes(q) ||
          (t.specialty ?? '').toLowerCase().includes(q)
        )
      })
  }, [query, specialtyFilter, statusFilter, trainers])

  const kpis = useMemo(() => {
    const active = trainers.filter((t) => t.status === 'Active').length
    const inactive = trainers.length - active
    const avgRate =
      trainers.length === 0
        ? 0
        : Math.round(trainers.reduce((sum, t) => sum + Number(t.ratePerSession || 0), 0) / trainers.length)
    return { total: trainers.length, active, inactive, avgRate }
  }, [trainers])

  function resetForm() {
    setEditingId(null)
    setForm({
      name: '',
      email: '',
      phone: '',
      specialty: 'Strength',
      experienceYears: 1,
      status: 'Active',
      ratePerSession: 2000,
      bio: '',
      showOnPublicSite: true,
    })
  }

  function onEdit(t: Trainer) {
    setEditingId(t.id)
    setForm({
      name: t.name ?? '',
      email: t.email ?? '',
      phone: t.phone ?? '',
      specialty: t.specialty ?? 'Strength',
      experienceYears: Number(t.experienceYears ?? 1),
      status: t.status ?? 'Active',
      ratePerSession: Number(t.ratePerSession ?? 2000),
      bio: t.bio ?? '',
      showOnPublicSite: t.showOnPublicSite ?? t.status === 'Active',
    })
  }

  async function onDelete(id: string) {
    const trainer = trainers.find((t) => t.id === id)
    const ok = window.confirm(`Delete trainer “${trainer?.name ?? 'this trainer'}”?`)
    if (!ok) return

    try {
      await trainersApi.remove(id)
      setTrainers((prev) => prev.filter((t) => t.id !== id))
      if (editingId === id) resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete trainer.')
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const name = form.name.trim()
    const email = form.email.trim()
    if (!name || !email) return

    const payload = {
      name,
      email,
      phone: form.phone.trim(),
      specialty: form.specialty,
      experienceYears: Math.max(0, Number(form.experienceYears || 0)),
      status: form.status,
      ratePerSession: Math.max(0, Number(form.ratePerSession || 0)),
      bio: form.bio.trim(),
      showOnPublicSite: form.showOnPublicSite,
    }

    try {
      if (editingId) {
        const updated = await trainersApi.update(editingId, payload)
        setTrainers((prev) => prev.map((t) => (t.id === editingId ? updated : t)))
      } else {
        const created = await trainersApi.create(payload)
        setTrainers((prev) => [created, ...prev])
      }
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save trainer.')
    }
  }

  return (
    <div className="grid grid-2">
      <div className="grid grid-1">
        <div className="card">
          <div className="section-header">
            <div className="eyebrow">Management</div>
            <div>
              <div className="h2">Trainers</div>
              <div className="muted">Maintain trainer profiles, rates, and availability status.</div>
            </div>
          </div>

          {error ? <div className="callout">{error}</div> : null}
          {loading ? <div className="muted">Loading trainers…</div> : null}

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
                  <div className="kpi-value">{currencyPKR(kpis.avgRate)}</div>
                  <div className="kpi-label">Avg rate/session</div>
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
                placeholder="Name, email, phone, specialty..."
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
            <div className="field" style={{ minWidth: 180 }}>
              <div className="label">Specialty</div>
              <select
                className="input"
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
              >
                {specialties.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div className="h2" style={{ margin: 0 }}>
                Trainer list
              </div>
              <div className="muted">Showing {filtered.length} of {trainers.length}</div>
            </div>
            <button className="btn btn-ghost" type="button" onClick={loadTrainers}>
              Refresh
            </button>
          </div>

          <div style={{ height: 12 }} />

          <div className="table">
            <div
              className="table-row table-head"
              style={{ '--table-cols': '1.1fr 1.2fr 0.9fr 0.8fr 0.9fr 0.8fr' } as React.CSSProperties}
            >
              <div>Name</div>
              <div>Email</div>
              <div>Phone</div>
              <div>Specialty</div>
              <div>Rate</div>
              <div>Actions</div>
            </div>

            {filtered.map((t) => (
              <div
                key={t.id}
                className="table-row"
                style={{ '--table-cols': '1.1fr 1.2fr 0.9fr 0.8fr 0.9fr 0.8fr' } as React.CSSProperties}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>{t.name}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {t.status} • {t.experienceYears} yrs experience
                  </div>
                </div>
                <div style={{ wordBreak: 'break-word' }}>{t.email}</div>
                <div>{t.phone || '—'}</div>
                <div>{t.specialty || '—'}</div>
                <div>{currencyPKR(t.ratePerSession)}</div>
                <div className="row gap-12" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost" type="button" onClick={() => onEdit(t)}>
                    Edit
                  </button>
                  <button className="btn" type="button" onClick={() => onDelete(t.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && !loading ? (
              <div className="callout">No trainers match your filters. Try adjusting search/filters.</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div className="eyebrow">{editingId ? 'Edit trainer' : 'Add trainer'}</div>
          <div>
            <div className="h2">{editingId ? 'Update trainer' : 'New trainer'}</div>
            <div className="muted">Saved to the backend API.</div>
          </div>
        </div>

        <form className="form" onSubmit={onSubmit}>
          <div className="field">
            <div className="label">Full name *</div>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g., Ahmed Saeed"
              required
            />
          </div>

          <div className="field">
            <div className="label">Email *</div>
            <input
              className="input"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="e.g., trainer@example.com"
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
              <div className="label">Specialty</div>
              <select
                className="input"
                value={form.specialty}
                onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))}
              >
                <option>Strength</option>
                <option>Cardio</option>
                <option>Yoga</option>
                <option>CrossFit</option>
                <option>Nutrition</option>
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
              <div className="label">Experience (years)</div>
              <input
                className="input"
                value={String(form.experienceYears)}
                onChange={(e) =>
                  setForm((p) => ({ ...p, experienceYears: Number(e.target.value || 0) }))
                }
                type="number"
                min="0"
              />
            </div>
            <div className="field">
              <div className="label">Rate per session (PKR)</div>
              <input
                className="input"
                value={String(form.ratePerSession)}
                onChange={(e) => setForm((p) => ({ ...p, ratePerSession: Number(e.target.value || 0) }))}
                type="number"
                min="0"
              />
            </div>
          </div>

          <div className="field">
            <div className="label">Bio</div>
            <textarea
              className="input textarea"
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Short public bio shown on the trainers page"
              rows={4}
            />
          </div>

          <label className="row gap-12" style={{ alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={form.showOnPublicSite}
              onChange={(e) => setForm((p) => ({ ...p, showOnPublicSite: e.target.checked }))}
            />
            <span>Show on public trainers page</span>
          </label>

          <div className="row gap-12" style={{ justifyContent: 'flex-end' }}>
            {editingId ? (
              <button className="btn btn-ghost" type="button" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
            <button className="btn btn-primary" type="submit">
              {editingId ? 'Save changes' : 'Add trainer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
