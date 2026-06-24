import { useEffect, useState } from 'react'
import { scheduleApi, type ScheduleEntry } from '../api/types'
import { Card, Container, PageTitle } from '../components/ui'

export function SchedulePage() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    scheduleApi
      .list()
      .then(setSchedule)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load schedule.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="section">
      <Container>
        <PageTitle
          title="Gym Schedule"
          subtitle="Workout timings with a weekly class schedule (morning and evening sessions)."
        />

        {error ? <div className="callout">{error}</div> : null}
        {loading ? <div className="muted">Loading schedule…</div> : null}

        {!loading && schedule.length === 0 && !error ? (
          <div className="callout">No schedule entries are configured yet.</div>
        ) : null}

        <Card>
          <div className="table">
            <div className="table-row table-head">
              <div>Day</div>
              <div>Morning session</div>
              <div>Evening session</div>
            </div>
            {schedule.map((row) => (
              <div key={row.id} className="table-row">
                <div className="table-day">{row.day}</div>
                <div>{row.morning}</div>
                <div>{row.evening}</div>
              </div>
            ))}
          </div>
        </Card>
      </Container>
    </section>
  )
}
