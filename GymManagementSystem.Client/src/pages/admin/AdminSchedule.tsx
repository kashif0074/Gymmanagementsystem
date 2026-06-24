import { useEffect, useState } from 'react'
import { scheduleApi, type ScheduleEntry } from '../../api/types'

export function AdminSchedule() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState('')

  async function loadSchedule() {
    setLoading(true)
    setError(null)
    try {
      const data = await scheduleApi.list()
      setSchedule(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load schedule.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchedule()
  }, [])

  function updateRow(id: string, patch: Partial<ScheduleEntry>) {
    setSchedule((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  async function saveRow(row: ScheduleEntry) {
    setError(null)
    try {
      const updated = await scheduleApi.update(row.id, {
        day: row.day,
        morning: row.morning,
        evening: row.evening,
        sortOrder: row.sortOrder,
      })
      setSchedule((prev) => prev.map((r) => (r.id === row.id ? updated : r)))
      setSavedAt(new Date().toLocaleTimeString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedule row.')
    }
  }

  return (
    <div className="card">
      <div className="section-header">
        <div className="eyebrow">Content</div>
        <div>
          <div className="h2">Weekly schedule</div>
          <div className="muted">Edit class timings shown on the public schedule page.</div>
        </div>
      </div>

      {error ? <div className="callout">{error}</div> : null}
      {loading ? <div className="muted">Loading schedule…</div> : null}
      {savedAt ? <div className="callout success">Saved at {savedAt}</div> : null}

      <div className="table">
        <div className="table-row table-head">
          <div>Day</div>
          <div>Morning</div>
          <div>Evening</div>
          <div>Actions</div>
        </div>

        {schedule.map((row) => (
          <div key={row.id} className="table-row">
            <div>
              <input
                className="input"
                value={row.day}
                onChange={(e) => updateRow(row.id, { day: e.target.value })}
              />
            </div>
            <div>
              <input
                className="input"
                value={row.morning}
                onChange={(e) => updateRow(row.id, { morning: e.target.value })}
              />
            </div>
            <div>
              <input
                className="input"
                value={row.evening}
                onChange={(e) => updateRow(row.id, { evening: e.target.value })}
              />
            </div>
            <div>
              <button className="btn btn-primary" type="button" onClick={() => saveRow(row)}>
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
