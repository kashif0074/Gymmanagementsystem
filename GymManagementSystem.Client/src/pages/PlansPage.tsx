import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSession } from '../auth/session'
import { plansApi, membersApi, type PublicPlan } from '../api/types'
import { Card, Container, Grid, PageTitle } from '../components/ui'

function planIdFromTitle(title: string): 'monthly' | 'quarterly' | 'yearly' {
  const lower = title.toLowerCase()
  if (lower.includes('quarterly')) return 'quarterly'
  if (lower.includes('yearly') || lower.includes('annual')) return 'yearly'
  return 'monthly'
}

export function PlansPage() {
  const navigate = useNavigate()
  const [plans, setPlans] = useState<PublicPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [enrolling, setEnrolling] = useState(false)

  const session = getSession()
  const isMember = session?.role === 'member'

  async function handleSelectPlan(planTitle: string) {
    setEnrolling(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await membersApi.selectPlan(planTitle)
      setSuccessMsg(`Successfully enrolled in ${planTitle}! Redirecting to dashboard…`)
      setTimeout(() => {
        navigate('/member')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select plan.')
    } finally {
      setEnrolling(false)
    }
  }

  useEffect(() => {
    plansApi
      .list()
      .then(setPlans)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load plans.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="section">
      <Container>
        <PageTitle
          title="Membership Plans"
          subtitle="Monthly, quarterly, and yearly packages with pricing cards."
          actions={
            <Link className="btn btn-primary" to="/signup">
              Sign up now
            </Link>
          }
        />

        {error ? <div className="callout">{error}</div> : null}
        {successMsg ? <div className="callout success">{successMsg}</div> : null}
        {loading ? <div className="muted">Loading plans…</div> : null}

        {!loading && plans.length === 0 && !error ? (
          <div className="callout">No membership plans are configured yet.</div>
        ) : null}

        <Grid cols={3}>
          {plans.map((p) => (
            <Card key={p.id} className={[p.highlight ? 'card-highlight' : null, 'plan-card'].filter(Boolean).join(' ')}>
              {p.highlight ? <div className="badge">Recommended</div> : null}
              <div className="plan-head">
                <div>
                  <div className="card-title">{p.title}</div>
                  <div className="muted">{p.note}</div>
                </div>
                <div className="price">{p.price}</div>
              </div>
              <div className="divider" />
              <ul className="list checklist">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <div className="divider" />
              {isMember ? (
                <button
                  className="btn btn-primary"
                  onClick={() => handleSelectPlan(p.title)}
                  disabled={enrolling}
                  type="button"
                >
                  {enrolling ? 'Enrolling…' : 'Select plan'}
                </button>
              ) : (
                <Link className="btn btn-ghost" to={`/signup?plan=${planIdFromTitle(p.title)}`}>
                  Select plan
                </Link>
              )}
            </Card>
          ))}
        </Grid>
      </Container>
    </section>
  )
}
