import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { getSession } from '../auth/session'
import { registrationsApi } from '../api/types'
import { Card, Container, Field, PageTitle } from '../components/ui'

type Gender = 'Male' | 'Female' | 'Other'
type PlanId = 'monthly' | 'quarterly' | 'yearly'

export function SignupPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialPlan = searchParams.get('plan')

  useEffect(() => {
    const session = getSession()
    if (session) {
      navigate(session.role === 'admin' ? '/admin' : '/member', { replace: true })
    }
  }, [navigate])
  const planOptions = useMemo(
    () => [
      { id: 'monthly' as const, label: 'Monthly' },
      { id: 'quarterly' as const, label: 'Quarterly' },
      { id: 'yearly' as const, label: 'Yearly' },
    ],
    [],
  )

  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [gender, setGender] = useState<Gender>('Male')
  const [phone, setPhone] = useState('')
  const [plan, setPlan] = useState<PlanId>(() => {
    if (initialPlan === 'monthly' || initialPlan === 'quarterly' || initialPlan === 'yearly')
      return initialPlan
    return 'monthly'
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const passwordsMatch = password === confirmPassword

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading || submitted) return

    setLoading(true)
    setError(null)

    // Form Validation Checks
    if (name.trim().length < 2) {
      setError('Full name must be at least 2 characters.')
      setLoading(false)
      return
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.')
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }
    if (age === '' || typeof age !== 'number' || age < 10 || age > 100) {
      setError('Please enter a valid age between 10 and 100.')
      setLoading(false)
      return
    }
    if (phone.trim().length < 7) {
      setError('Phone number must be at least 7 characters.')
      setLoading(false)
      return
    }

    try {
      await registrationsApi.submit({
        name: name.trim(),
        username: username.trim(),
        password,
        age,
        gender,
        phone: phone.trim(),
        plan,
      })
      setSubmitted(true)
      setTimeout(() => {
        navigate('/login', {
          state: {
            username: username.trim(),
            mode: 'member' as const,
            message: 'Account created. Log in with your username and password.',
          },
        })
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section signup-page">
      <Container>
        <PageTitle
          title="Sign Up"
          subtitle="Create your member account, then log in with the username and password you choose here."
          actions={
            <Link className="btn btn-ghost" to="/login">
              Already have an account? Log in
            </Link>
          }
        />

        <div className="grid grid-2">
          <Card>
            <div className="card-title">Create account</div>
            <form className="form" onSubmit={handleSubmit}>
              <Field label="Full name">
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Ali Khan"
                  autoComplete="name"
                />
              </Field>

              <Field label="Username" hint="You will use this to log in.">
                <input
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g., alikhan"
                  autoComplete="username"
                />
              </Field>

              <div className="row gap-12">
                <Field label="Password">
                  <input
                    className="input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                </Field>
                <Field label="Confirm password">
                  <input
                    className="input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type="password"
                    placeholder="Repeat password"
                    autoComplete="new-password"
                  />
                </Field>
              </div>

              {!passwordsMatch && confirmPassword.length > 0 ? (
                <div className="callout">Passwords do not match.</div>
              ) : null}

              <div className="row gap-12">
                <Field label="Age">
                  <input
                    className="input"
                    value={age}
                    onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                    type="number"
                    min={10}
                    max={100}
                    placeholder="18"
                  />
                </Field>
                <Field label="Gender">
                  <select
                    className="input"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </Field>
              </div>

              <Field label="Phone number">
                <input
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g., 03xx1234567"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </Field>

              <Field label="Membership plan">
                <select
                  className="input"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value as PlanId)}
                >
                  {planOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>

              <button className="btn btn-primary" type="submit" disabled={loading || submitted}>
                {loading ? 'Creating account…' : submitted ? 'Account created' : 'Sign up'}
              </button>

              {error ? <div className="callout">{error}</div> : null}
              {submitted ? (
                <div className="callout success">Success! Redirecting you to login…</div>
              ) : null}
            </form>
          </Card>

          <Card>
            <div className="card-title">How it works</div>
            <ol className="list signup-steps">
              <li>Fill in your details and choose a username and password.</li>
              <li>Pick a membership plan — a pending payment record is created automatically.</li>
              <li>Go to the login page and sign in with your new credentials.</li>
            </ol>

            <div className="divider" />

            <div className="card-title">Preview</div>
            <div className="kv">
              <div className="kv-k">Name</div>
              <div className="kv-v">{name || '—'}</div>
              <div className="kv-k">Username</div>
              <div className="kv-v">{username || '—'}</div>
              <div className="kv-k">Phone</div>
              <div className="kv-v">{phone || '—'}</div>
              <div className="kv-k">Plan</div>
              <div className="kv-v">{plan}</div>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  )
}
