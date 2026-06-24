import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSession } from '../auth/session'
import { trainersApi, membersApi, type Trainer } from '../api/types'
import { Card, Container, Grid, PageTitle, SectionHeader } from '../components/ui'
import { Reveal } from '../components/effects/Reveal'

const TRAINING_VIDEO_YOUTUBE_ID = '5xxJP1WNNZ0'

export function TrainersPage() {
  const navigate = useNavigate()
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)

  const session = getSession()
  const isMember = session?.role === 'member'

  async function handleJoinTrainer(trainerId: string, trainerName: string) {
    setJoining(true)
    setError(null)
    setSuccessMsg(null)
    try {
      await membersApi.joinTrainer(trainerId)
      setSuccessMsg(`Successfully joined ${trainerName}'s program! Redirecting to dashboard…`)
      setTimeout(() => {
        navigate('/member')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join program.')
    } finally {
      setJoining(false)
    }
  }

  useEffect(() => {
    trainersApi
      .list(true)
      .then(setTrainers)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load trainers.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="section">
      <Container>
        <PageTitle
          title="Meet Our Trainers"
          subtitle="Trainer profiles with specialization and experience details."
        />

        {error ? <div className="callout">{error}</div> : null}
        {successMsg ? <div className="callout success">{successMsg}</div> : null}
        {loading ? <div className="muted">Loading trainers…</div> : null}

        <Reveal>
          <div className="card trainer-video-block">
            <div className="trainer-video-copy">
              <SectionHeader
                eyebrow="Watch"
                title="How our trainers coach a session"
                subtitle="A short preview of form cues, pacing, and safe progression — the same standards our coaches use on the floor."
              />
            </div>
            <div className="trainer-video-frame">
              <iframe
                className="trainer-video-iframe"
                title="Trainer-led workout preview (YouTube)"
                src={`https://www.youtube-nocookie.com/embed/${TRAINING_VIDEO_YOUTUBE_ID}?rel=0&modestbranding=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        </Reveal>

        {!loading && trainers.length === 0 && !error ? (
          <div className="callout">No trainers are listed on the public site yet.</div>
        ) : null}

        <Grid cols={3}>
          {trainers.map((t) => (
            <Card key={t.id} className="trainer-card">
              <div className="trainer-top">
                <div className="avatar" aria-hidden="true">
                  {t.name
                    .split(' ')
                    .slice(0, 2)
                    .map((s) => s[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <div>
                  <div className="card-title">{t.name}</div>
                  <div className="muted">{t.specialty}</div>
                </div>
              </div>
              <div className="divider" />
              <div className="kv">
                <div className="kv-k">Experience</div>
                <div className="kv-v">{t.experienceYears} years</div>
                <div className="kv-k">Specialization</div>
                <div className="kv-v">{t.specialty}</div>
              </div>
              <div className="divider" />
              <div className="muted">{t.bio || 'No bio provided yet.'}</div>
              <div className="divider" />
              <div className="trainer-actions">
                <Link className="btn btn-ghost" to="/contact">
                  Contact
                </Link>
                {isMember ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleJoinTrainer(t.id, t.name)}
                    disabled={joining}
                    type="button"
                  >
                    {joining ? 'Joining…' : 'Join program'}
                  </button>
                ) : (
                  <Link className="btn btn-primary" to="/signup">
                    Join program
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </Grid>
      </Container>
    </section>
  )
}
