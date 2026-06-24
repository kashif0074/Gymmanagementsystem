import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { contactApi, settingsApi } from '../api/types'
import { Card, Container, Field, PageTitle } from '../components/ui'

export function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [gymInfo, setGymInfo] = useState({
    address: '123 Fitness Street, City Center',
    email: 'gym@example.com',
    phone: '+1 (000) 000-0000',
    hours: 'Mon–Sat: 6am–10pm',
  })

  useEffect(() => {
    settingsApi.getPublic().then((s) => {
      setGymInfo({
        address: s.address,
        email: s.contactEmail,
        phone: s.contactPhone,
        hours: s.hours,
      })
    }).catch(() => {})
  }, [])

  const canSubmit = name.trim().length >= 2 && email.includes('@') && message.trim().length >= 10

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)

    try {
      await contactApi.submit({ name: name.trim(), email: email.trim(), message: message.trim() })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section">
      <Container>
        <PageTitle
          title="Contact Us"
          subtitle="Feedback / inquiry form plus basic gym contact details."
        />

        <div className="grid grid-2">
          <Card>
            <form className="form" onSubmit={handleSubmit}>
              <Field label="Your name">
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Fatima"
                />
              </Field>
              <Field label="Email">
                <input
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., you@example.com"
                  inputMode="email"
                  autoComplete="email"
                />
              </Field>
              <Field label="Message" hint="Minimum 10 characters.">
                <textarea
                  className="input textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your inquiry or feedback..."
                  rows={6}
                />
              </Field>

              <button className="btn btn-primary" type="submit" disabled={!canSubmit || loading}>
                {loading ? 'Sending…' : 'Send inquiry'}
              </button>

              {sent ? <div className="callout success">Message sent successfully.</div> : null}
              {error ? <div className="callout">{error}</div> : null}
            </form>
          </Card>

          <Card>
            <div className="card-title">Gym location</div>
            <div className="muted">{gymInfo.address}</div>
            <div className="divider" />

            <div className="kv">
              <div className="kv-k">Email</div>
              <div className="kv-v">{gymInfo.email}</div>
              <div className="kv-k">Phone</div>
              <div className="kv-v">{gymInfo.phone}</div>
              <div className="kv-k">Hours</div>
              <div className="kv-v">{gymInfo.hours}</div>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  )
}
