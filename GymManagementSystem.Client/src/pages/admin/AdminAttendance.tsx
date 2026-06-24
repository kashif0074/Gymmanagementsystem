import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { attendanceApi, membersApi, type AttendanceRecord, type Member } from '../../api/types'

interface AttendanceFormState {
  memberId: string
  date: string
  checkIn: string
  checkOut: string
  note: string
}

function formatDate(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString()
}

function minutesBetween(start?: string | null, end?: string | null) {
  if (!start || !end) return null
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  if (![sh, sm, eh, em].every(Number.isFinite)) return null
  return eh * 60 + em - (sh * 60 + sm)
}

export function AdminAttendance() {
  const [rows, setRows] = useState<AttendanceRecord[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AttendanceFormState>({
    memberId: '',
    date: '',
    checkIn: '',
    checkOut: '',
    note: '',
  })

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [attendanceData, membersData] = await Promise.all([
        attendanceApi.list(),
        membersApi.list(),
      ])
      setRows(attendanceData)
      setMembers(membersData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attendance.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows
      .filter((r) => {
        if (!dateFilter) return true
        return (r.date ?? '').slice(0, 10) === dateFilter
      })
      .filter((r) => {
        if (!q) return true
        return (
          (r.memberName ?? '').toLowerCase().includes(q) ||
          (r.note ?? '').toLowerCase().includes(q)
        )
      })
  }, [dateFilter, query, rows])

  const kpis = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const todayCount = rows.filter((r) => (r.date ?? '').slice(0, 10) === today).length
    const avgMinutes = (() => {
      const mins = rows
        .map((r) => minutesBetween(r.checkIn, r.checkOut))
        .filter((m): m is number => typeof m === 'number' && m >= 0)
      if (mins.length === 0) return 0
      return Math.round(mins.reduce((a, b) => a + b, 0) / mins.length)
    })()
    return { total: rows.length, todayCount, avgMinutes }
  }, [rows])

  function resetForm() {
    setEditingId(null)
    setForm({ memberId: '', date: '', checkIn: '', checkOut: '', note: '' })
  }

  function onEdit(r: AttendanceRecord) {
    setEditingId(r.id)
    setForm({
      memberId: r.memberId ?? '',
      date: r.date ? r.date.slice(0, 10) : '',
      checkIn: r.checkIn ?? '',
      checkOut: r.checkOut ?? '',
      note: r.note ?? '',
    })
  }

  async function onDelete(id: string) {
    const row = rows.find((r) => r.id === id)
    const ok = window.confirm(`Delete attendance for “${row?.memberName ?? 'this member'}”?`)
    if (!ok) return

    try {
      await attendanceApi.remove(id)
      setRows((prev) => prev.filter((r) => r.id !== id))
      if (editingId === id) resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record.')
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const memberId = form.memberId
    const dateIso = form.date ? `${form.date}T00:00:00.000Z` : ''
    if (!memberId || !dateIso) {
      alert('Please select a member and a date.')
      return
    }

    const payload = {
      memberId,
      memberName: members.find((m) => m.id === memberId)?.name ?? '',
      date: dateIso,
      checkIn: form.checkIn.trim(),
      checkOut: form.checkOut.trim(),
      note: form.note.trim(),
    }

    try {
      if (editingId) {
        const updated = await attendanceApi.update(editingId, payload)
        setRows((prev) => prev.map((r) => (r.id === editingId ? updated : r)))
      } else {
        const created = await attendanceApi.create(payload)
        setRows((prev) => [created, ...prev])
      }
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save record.')
    }
  }

  return (
    <div className="grid grid-2">
      <div className="grid grid-1">
        <div className="card">
          <div className="section-header">
            <div className="eyebrow">Management</div>
            <div>
              <div className="h2">Attendance</div>
              <div className="muted">Record check-ins/outs and monitor daily gym traffic.</div>
            </div>
          </div>

          {error ? <div className="callout">{error}</div> : null}
          {loading ? <div className="muted">Loading attendance…</div> : null}

          <div className="grid grid-3">
            <div className="card" style={{ boxShadow: 'none' }}>
              <div className="kpi">
                <div>
                  <div className="kpi-value">{kpis.total}</div>
                  <div className="kpi-label">Records</div>
                </div>
              </div>
            </div>
            <div className="card" style={{ boxShadow: 'none' }}>
              <div className="kpi">
                <div>
                  <div className="kpi-value">{kpis.todayCount}</div>
                  <div className="kpi-label">Today</div>
                </div>
              </div>
            </div>
            <div className="card" style={{ boxShadow: 'none' }}>
              <div className="kpi">
                <div>
                  <div className="kpi-value">{kpis.avgMinutes}m</div>
                  <div className="kpi-label">Avg session</div>
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
                placeholder="Member name, note..."
              />
            </div>
            <div className="field" style={{ minWidth: 180 }}>
              <div className="label">Date</div>
              <input
                className="input"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            <button className="btn btn-ghost" type="button" onClick={() => setDateFilter('')}>
              Clear
            </button>
          </div>
        </div>

        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div className="h2" style={{ margin: 0 }}>
                Attendance log
              </div>
              <div className="muted">Showing {filtered.length} of {rows.length}</div>
            </div>
            <button className="btn btn-ghost" type="button" onClick={loadData}>
              Refresh
            </button>
          </div>

          <div style={{ height: 12 }} />

          <div className="table">
            <div
              className="table-row table-head"
              style={{ '--table-cols': '1.1fr 0.8fr 0.7fr 0.7fr 1.1fr 0.8fr' } as React.CSSProperties}
            >
              <div>Member</div>
              <div>Date</div>
              <div>In</div>
              <div>Out</div>
              <div>Note</div>
              <div>Actions</div>
            </div>

            {filtered.map((r) => (
              <div
                key={r.id}
                className="table-row"
                style={{ '--table-cols': '1.1fr 0.8fr 0.7fr 0.7fr 1.1fr 0.8fr' } as React.CSSProperties}
              >
                <div style={{ fontWeight: 800 }}>{r.memberName}</div>
                <div>{formatDate(r.date)}</div>
                <div>{r.checkIn || '—'}</div>
                <div>{r.checkOut || '—'}</div>
                <div style={{ color: 'rgba(255,255,255,0.75)' }}>{r.note || '—'}</div>
                <div className="row gap-12" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost" type="button" onClick={() => onEdit(r)}>
                    Edit
                  </button>
                  <button className="btn" type="button" onClick={() => onDelete(r.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && !loading ? (
              <div className="callout">No attendance records match your filters.</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div className="eyebrow">{editingId ? 'Edit record' : 'Add record'}</div>
          <div>
            <div className="h2">{editingId ? 'Update attendance' : 'New attendance'}</div>
            <div className="muted">Saved to the backend API.</div>
          </div>
        </div>

        <form className="form" onSubmit={onSubmit}>
          <div className="field">
            <div className="label">Member *</div>
            <select
              className="input"
              value={form.memberId}
              onChange={(e) => setForm((p) => ({ ...p, memberId: e.target.value }))}
              required
            >
              <option value="">-- Select Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (@{m.username})
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <div className="label">Date *</div>
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-2">
            <div className="field">
              <div className="label">Check-in</div>
              <input
                className="input"
                type="time"
                value={form.checkIn}
                onChange={(e) => setForm((p) => ({ ...p, checkIn: e.target.value }))}
              />
            </div>
            <div className="field">
              <div className="label">Check-out</div>
              <input
                className="input"
                type="time"
                value={form.checkOut}
                onChange={(e) => setForm((p) => ({ ...p, checkOut: e.target.value }))}
              />
            </div>
          </div>

          <div className="field">
            <div className="label">Note</div>
            <input
              className="input"
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              placeholder="e.g., PT session, guest pass, etc."
            />
          </div>

          <div className="row gap-12" style={{ justifyContent: 'flex-end' }}>
            {editingId ? (
              <button className="btn btn-ghost" type="button" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
            <button className="btn btn-primary" type="submit">
              {editingId ? 'Save changes' : 'Add record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
