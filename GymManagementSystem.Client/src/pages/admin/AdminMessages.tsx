import { useEffect, useState } from 'react'
import { contactApi, type ContactMessage } from '../../api/types'

function formatDateTime(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

export function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadMessages() {
    setLoading(true)
    setError(null)
    try {
      const data = await contactApi.list()
      setMessages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  return (
    <div className="card">
      <div className="section-header">
        <div className="eyebrow">Inbox</div>
        <div>
          <div className="h2">Contact messages</div>
          <div className="muted">Inquiries submitted from the public contact form.</div>
        </div>
      </div>

      {error ? <div className="callout">{error}</div> : null}
      {loading ? <div className="muted">Loading messages…</div> : null}

      <div className="row gap-12" style={{ justifyContent: 'flex-end', marginBottom: 12 }}>
        <button className="btn btn-ghost" type="button" onClick={loadMessages}>
          Refresh
        </button>
      </div>

      {!loading && messages.length === 0 && !error ? (
        <div className="callout">No contact messages yet.</div>
      ) : null}

      <div className="grid grid-1">
        {messages.map((m) => (
          <div key={m.id} className="card" style={{ boxShadow: 'none' }}>
            <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 800 }}>{m.name}</div>
                <div className="muted">{m.email}</div>
              </div>
              <div className="muted">{formatDateTime(m.createdAt)}</div>
            </div>
            <div className="divider" />
            <div>{m.message}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
