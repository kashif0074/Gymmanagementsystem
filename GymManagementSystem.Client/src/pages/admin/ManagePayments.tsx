import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { paymentsApi, membersApi, type Payment, type Member } from '../../api/types'

interface PaymentFormState {
  memberId: string
  amount: number
  method: string
  status: string
  forPlan: string
  note: string
  createdAt: string
}

function currencyPKR(value: number) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'PKR' }).format(n)
}

function formatDateTime(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

export function ManagePayments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [methodFilter, setMethodFilter] = useState('All')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PaymentFormState>({
    memberId: '',
    amount: 5000,
    method: 'Cash',
    status: 'Paid',
    forPlan: 'Monthly',
    note: '',
    createdAt: '',
  })

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [paymentsData, membersData] = await Promise.all([
        paymentsApi.list(),
        membersApi.list(),
      ])
      setPayments(paymentsData)
      setMembers(membersData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const methods = useMemo(() => {
    const set = new Set(payments.map((p) => p.method).filter(Boolean))
    return ['All', ...Array.from(set)]
  }, [payments])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return payments
      .filter((p) => (statusFilter === 'All' ? true : p.status === statusFilter))
      .filter((p) => (methodFilter === 'All' ? true : p.method === methodFilter))
      .filter((p) => {
        if (!q) return true
        return (
          (p.memberName ?? '').toLowerCase().includes(q) ||
          (p.method ?? '').toLowerCase().includes(q) ||
          (p.forPlan ?? '').toLowerCase().includes(q) ||
          (p.note ?? '').toLowerCase().includes(q)
        )
      })
  }, [methodFilter, payments, query, statusFilter])

  const kpis = useMemo(() => {
    const paid = payments.filter((p) => p.status === 'Paid')
    const pending = payments.filter((p) => p.status === 'Pending').length
    const failed = payments.filter((p) => p.status === 'Failed').length
    const revenue = paid.reduce((sum, p) => sum + Number(p.amount || 0), 0)
    return { total: payments.length, pending, failed, revenue }
  }, [payments])

  function resetForm() {
    setEditingId(null)
    setForm({
      memberId: '',
      amount: 5000,
      method: 'Cash',
      status: 'Paid',
      forPlan: 'Monthly',
      note: '',
      createdAt: '',
    })
  }

  function onEdit(p: Payment) {
    setEditingId(p.id)
    setForm({
      memberId: p.memberId ?? '',
      amount: Number(p.amount ?? 0),
      method: p.method ?? 'Cash',
      status: p.status ?? 'Paid',
      forPlan: p.forPlan ?? 'Monthly',
      note: p.note ?? '',
      createdAt: p.createdAt ? p.createdAt.slice(0, 16) : '',
    })
  }

  async function onDelete(id: string) {
    const pay = payments.find((p) => p.id === id)
    const ok = window.confirm(`Delete payment for “${pay?.memberName ?? 'this member'}”?`)
    if (!ok) return

    try {
      await paymentsApi.remove(id)
      setPayments((prev) => prev.filter((p) => p.id !== id))
      if (editingId === id) resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment.')
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const memberId = form.memberId
    if (!memberId) {
      alert('Please select a member.')
      return
    }

    const createdAt = form.createdAt
      ? new Date(form.createdAt).toISOString()
      : new Date().toISOString()

    const payload = {
      memberId,
      memberName: members.find((m) => m.id === memberId)?.name ?? '',
      amount: Math.max(0, Number(form.amount || 0)),
      method: form.method,
      status: form.status,
      forPlan: form.forPlan,
      note: form.note.trim(),
      createdAt,
    }

    try {
      if (editingId) {
        const updated = await paymentsApi.update(editingId, payload)
        setPayments((prev) => prev.map((p) => (p.id === editingId ? updated : p)))
      } else {
        const created = await paymentsApi.create(payload)
        setPayments((prev) => [created, ...prev])
      }
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save payment.')
    }
  }

  return (
    <div className="grid grid-2">
      <div className="grid grid-1">
        <div className="card">
          <div className="section-header">
            <div className="eyebrow">Management</div>
            <div>
              <div className="h2">Payments</div>
              <div className="muted">Track revenue, pending dues, and payment status.</div>
            </div>
          </div>

          {error ? <div className="callout">{error}</div> : null}
          {loading ? <div className="muted">Loading payments…</div> : null}

          <div className="grid grid-4">
            <div className="card" style={{ boxShadow: 'none' }}>
              <div className="kpi">
                <div>
                  <div className="kpi-value">{payments.length}</div>
                  <div className="kpi-label">Transactions</div>
                </div>
              </div>
            </div>
            <div className="card" style={{ boxShadow: 'none' }}>
              <div className="kpi">
                <div>
                  <div className="kpi-value">{currencyPKR(kpis.revenue)}</div>
                  <div className="kpi-label">Revenue (Paid)</div>
                </div>
              </div>
            </div>
            <div className="card" style={{ boxShadow: 'none' }}>
              <div className="kpi">
                <div>
                  <div className="kpi-value">{kpis.pending}</div>
                  <div className="kpi-label">Pending</div>
                </div>
              </div>
            </div>
            <div className="card" style={{ boxShadow: 'none' }}>
              <div className="kpi">
                <div>
                  <div className="kpi-value">{kpis.failed}</div>
                  <div className="kpi-label">Failed</div>
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
                placeholder="Member, plan, method, note..."
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
                <option>Paid</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>
            </div>
            <div className="field" style={{ minWidth: 180 }}>
              <div className="label">Method</div>
              <select
                className="input"
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
              >
                {methods.map((m) => (
                  <option key={m} value={m}>
                    {m}
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
                Payment history
              </div>
              <div className="muted">Showing {filtered.length} of {payments.length}</div>
            </div>
            <button className="btn btn-ghost" type="button" onClick={loadData}>
              Refresh
            </button>
          </div>

          <div style={{ height: 12 }} />

          <div className="table">
            <div
              className="table-row table-head"
              style={{ '--table-cols': '1.1fr 0.8fr 0.8fr 0.9fr 1.2fr 0.8fr' } as React.CSSProperties}
            >
              <div>Member</div>
              <div>Amount</div>
              <div>Status</div>
              <div>Method</div>
              <div>When</div>
              <div>Actions</div>
            </div>

            {filtered.map((p) => (
              <div
                key={p.id}
                className="table-row"
                style={{ '--table-cols': '1.1fr 0.8fr 0.8fr 0.9fr 1.2fr 0.8fr' } as React.CSSProperties}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>{p.memberName}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {p.forPlan} {p.note ? `• ${p.note}` : ''}
                  </div>
                </div>
                <div>{currencyPKR(p.amount)}</div>
                <div>{p.status}</div>
                <div>{p.method}</div>
                <div>{formatDateTime(p.createdAt)}</div>
                <div className="row gap-12" style={{ justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost" type="button" onClick={() => onEdit(p)}>
                    Edit
                  </button>
                  <button className="btn" type="button" onClick={() => onDelete(p.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && !loading ? (
              <div className="callout">No payments match your filters. Try adjusting search/filters.</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div className="eyebrow">{editingId ? 'Edit payment' : 'Add payment'}</div>
          <div>
            <div className="h2">{editingId ? 'Update payment' : 'New payment'}</div>
            <div className="muted">Record a transaction and mark its status.</div>
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

          <div className="grid grid-2">
            <div className="field">
              <div className="label">Plan</div>
              <select
                className="input"
                value={form.forPlan}
                onChange={(e) => setForm((p) => ({ ...p, forPlan: e.target.value }))}
              >
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Yearly</option>
              </select>
            </div>
            <div className="field">
              <div className="label">Amount (PKR)</div>
              <input
                className="input"
                type="number"
                min="0"
                value={String(form.amount)}
                onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value || 0) }))}
              />
            </div>
          </div>

          <div className="grid grid-2">
            <div className="field">
              <div className="label">Method</div>
              <select
                className="input"
                value={form.method}
                onChange={(e) => setForm((p) => ({ ...p, method: e.target.value }))}
              >
                <option>Cash</option>
                <option>Card</option>
                <option>Bank transfer</option>
                <option>Mobile wallet</option>
              </select>
            </div>
            <div className="field">
              <div className="label">Status</div>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option>Paid</option>
                <option>Pending</option>
                <option>Failed</option>
              </select>
            </div>
          </div>

          <div className="field">
            <div className="label">Timestamp</div>
            <input
              className="input"
              type="datetime-local"
              value={form.createdAt}
              onChange={(e) => setForm((p) => ({ ...p, createdAt: e.target.value }))}
            />
            <div className="hint">Leave blank to use the current time.</div>
          </div>

          <div className="field">
            <div className="label">Note</div>
            <input
              className="input"
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              placeholder="e.g., receipt #123, online, etc."
            />
          </div>

          <div className="row gap-12" style={{ justifyContent: 'flex-end' }}>
            {editingId ? (
              <button className="btn btn-ghost" type="button" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
            <button className="btn btn-primary" type="submit">
              {editingId ? 'Save changes' : 'Add payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
