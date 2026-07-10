import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { dashboardApi, settingsApi } from '../api/types'
import { Card, Container, Grid, PageTitle, SectionHeader, TiltCard } from '../components/ui'
import { Marquee } from '../components/effects/Marquee'
import { Reveal } from '../components/effects/Reveal'
import { RotatingLogoCanvas } from '../components/effects/RotatingLogoCanvas'
import { useCountUp } from '../components/effects/useCountUp'

export function HomePage() {
  const [gymName, setGymName] = useState('Gym Management System')
  const [memberTotal, setMemberTotal] = useState(0)
  const [trainerTotal, setTrainerTotal] = useState(0)

  useEffect(() => {
    dashboardApi
      .publicStats()
      .then((stats) => {
        setMemberTotal(stats.totalMembers)
        setTrainerTotal(stats.totalTrainers)
      })
      .catch(() => {})

    settingsApi.getPublic()
      .then((s) => setGymName(s.gymName))
      .catch(() => {})
  }, [])

  const cTrainers = useCountUp({ to: trainerTotal, durationMs: 850, startWhen: true })
  const cMembers = useCountUp({ to: memberTotal, durationMs: 1100, startWhen: true })

  return (
    <>
      <Marquee speedSeconds={16}>
        <span>New member onboarding</span>
        <span aria-hidden="true">•</span>
        <span>PT sessions</span>
        <span aria-hidden="true">•</span>
        <span>Flexible plans</span>
        <span aria-hidden="true">•</span>
        <span>Admin dashboard</span>
        <span aria-hidden="true">•</span>
        <span>Modern UI</span>
      </Marquee>

      <section className="hero-section">
        <Container>
          <div className="hero-grid">
            <div>
              <PageTitle
                title={`Welcome to ${gymName}`}
                subtitle="A simple, modern frontend for gym members, plans, trainers, schedules, and inquiries."
                actions={
                  <div className="row gap-12">
                    <Link className="btn btn-primary btn-glow" to="/signup">
                      Sign up
                    </Link>
                    <Link className="btn btn-ghost btn-ripple" to="/plans">
                      View plans
                    </Link>
                  </div>
                }
              />
              <div className="pill-row">
                <span className="pill">Modern equipment</span>
                <span className="pill">Certified trainers</span>
                <span className="pill">Flexible timings</span>
              </div>
            </div>

            <Card className="hero-card">
              <div className="kpi">
                <div className="kpi-value">24/7</div>
                <div className="kpi-label">Access (select plans)</div>
              </div>
              <div className="divider" />
              <div className="kpi">
                <div className="kpi-value">{cTrainers}</div>
                <div className="kpi-label">Certified trainers</div>
              </div>
              <div className="divider" />
              <div className="kpi">
                <div className="kpi-value">{cMembers}</div>
                <div className="kpi-label">Active members</div>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <Reveal>
            <SectionHeader
              eyebrow="About"
              title="A gym experience built for consistency"
              subtitle="We help members build strength, improve endurance, and stay consistent with guided programs, friendly coaching, and a weekly schedule that fits both morning and evening routines."
            />
          </Reveal>

          <div className="grid grid-2" style={{ alignItems: 'center' }}>
            <Reveal delayMs={120}>
              <div className="card">
                <div className="card-title">Our Brand</div>
                <p className="muted">
                  Our dynamic brand emblem reacts to your mouse movements, symbolizing movement and constant improvement.
                </p>
                <div className="divider" />
                <div className="row gap-12" style={{ flexWrap: 'wrap' }}>
                  <Link className="btn btn-primary btn-glow" to="/login?mode=admin">
                    Admin login
                  </Link>
                  <Link className="btn btn-ghost btn-ripple" to="/plans">
                    Browse plans
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal delayMs={180}>
              <div className="row" style={{ justifyContent: 'center' }}>
                <RotatingLogoCanvas size={150} />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <Reveal>
            <SectionHeader
              eyebrow="Highlights"
              title="Everything you need to stay on track"
              subtitle="Clear plans, trainer expertise, a weekly timetable, and simple member onboarding — designed for a clean demo and a realistic gym workflow."
            />
          </Reveal>
          <Grid cols={3}>
            <Reveal delayMs={0}>
              <TiltCard>
                <div className="feature">
                  <div className="feature-icon" aria-hidden="true">
                    🧭
                  </div>
                  <div className="feature-body">
                    <div className="card-title">Personalized guidance</div>
                    <div className="muted">Choose a plan and get trainer recommendations.</div>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
            <Reveal delayMs={80}>
              <TiltCard>
                <div className="feature">
                  <div className="feature-icon" aria-hidden="true">
                    💳
                  </div>
                  <div className="feature-body">
                    <div className="card-title">Clear pricing cards</div>
                    <div className="muted">Monthly, quarterly, yearly packages with highlights.</div>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
            <Reveal delayMs={160}>
              <TiltCard>
                <div className="feature">
                  <div className="feature-icon" aria-hidden="true">
                    🗓️
                  </div>
                  <div className="feature-body">
                    <div className="card-title">Weekly schedule</div>
                    <div className="muted">Morning and evening sessions for popular classes.</div>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          </Grid>

          <Reveal>
            <div className="card">
              <div className="row" style={{ justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div className="card-title">Gym Moments</div>
                  <div className="muted">Explore our state-of-the-art facilities and training zones.</div>
                </div>
                <div className="muted">Members: {cMembers}+</div>
              </div>

              <div style={{ height: 12 }} />

              <div className="gallery">
                {[
                  {
                    title: 'Strength zone',
                    url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=70',
                  },
                  {
                    title: 'Cardio session',
                    url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=1200&q=70',
                  },
                  {
                    title: 'Mobility & yoga',
                    url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=70',
                  },
                ].map((img) => (
                  <div className="gallery-item" key={img.title}>
                    <img className="gallery-img" src={img.url} alt={img.title} loading="lazy" />
                    <div className="gallery-cap">
                      <div className="card-title">{img.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="section-cta">
            <Reveal>
              <div className="parallax">
                <div className="parallax-bg" aria-hidden="true" />
                <div className="parallax-inner">
                  <div className="row" style={{ justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <div className="card-title">Ready to join?</div>
                      <div className="muted">Sign up in under a minute and choose your plan.</div>
                    </div>
                    <div className="row gap-12">
                      <Link className="btn btn-primary btn-glow" to="/signup">
                        Sign up
                      </Link>
                      <Link className="btn btn-ghost btn-ripple" to="/login">
                        Login
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>
    </>
  )
}

