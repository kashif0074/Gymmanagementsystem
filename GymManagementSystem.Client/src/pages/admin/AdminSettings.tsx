import { useEffect, useMemo, useState } from 'react'
import { settingsApi, type GymSettings } from '../../api/types'

function defaultSettings(): GymSettings {
  return {
    gymName: 'Gym Management System',
    contactEmail: 'gym@example.com',
    contactPhone: '+1 (000) 000-0000',
    address: '123 Fitness Street, City Center',
    hours: 'Mon–Sat: 6am–10pm',
    currency: 'PKR',
    notifications: {
      expiringMemberships: true,
      paymentPending: true,
    },
    access: {
      adminPinEnabled: false,
      adminPin: '',
    },
    membershipPlans: [
      { name: 'Monthly', price: 5000 },
      { name: 'Quarterly', price: 12000 },
      { name: 'Yearly', price: 20000 },
    ],
  }
}

export function AdminSettings() {
  const [settings, setSettings] = useState<GymSettings>(defaultSettings())
  const [savedAt, setSavedAt] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    settingsApi
      .get()
      .then(setSettings)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load settings.'))
      .finally(() => setLoading(false))
  }, [])

  const planTotal = useMemo(() => {
    return (settings.membershipPlans || []).reduce((sum, p) => sum + Number(p.price || 0), 0)
  }, [settings.membershipPlans])

  async function save() {
    setError(null)
    try {
      const updated = await settingsApi.update(settings)
      setSettings(updated)
      setSavedAt(new Date().toLocaleTimeString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings.')
    }
  }

  function resetToDefaults() {
    const ok = window.confirm('Reset all settings to defaults?')
    if (!ok) return
    setSettings(defaultSettings())
    setSavedAt('')
  }

  function updatePlan(idx: number, patch: Partial<{ name: string; price: number }>) {
    setSettings((prev) => {
      const plans = [...(prev.membershipPlans || [])]
      plans[idx] = { ...plans[idx], ...patch }
      return { ...prev, membershipPlans: plans }
    })
  }

  function addPlan() {
    setSettings((prev) => ({
      ...prev,
      membershipPlans: [...(prev.membershipPlans || []), { name: 'New plan', price: 0 }],
    }))
  }

  function removePlan(idx: number) {
    setSettings((prev) => ({
      ...prev,
      membershipPlans: (prev.membershipPlans || []).filter((_, i) => i !== idx),
    }))
  }

  return (
    <div className="grid grid-2">
      <div className="card">
        <div className="section-header">
          <div className="eyebrow">System</div>
          <div>
            <div className="h2">Settings</div>
            <div className="muted">Configure gym profile, plans, notifications, and basic access.</div>
          </div>
        </div>

        {error ? <div className="callout">{error}</div> : null}
        {loading ? <div className="muted">Loading settings…</div> : null}

        <div className="form">
          <div className="field">
            <div className="label">Gym name</div>
            <input
              className="input"
              value={settings.gymName}
              onChange={(e) => setSettings((p) => ({ ...p, gymName: e.target.value }))}
              placeholder="Your gym name"
            />
          </div>

          <div className="grid grid-2">
            <div className="field">
              <div className="label">Contact email</div>
              <input
                className="input"
                value={settings.contactEmail}
                onChange={(e) => setSettings((p) => ({ ...p, contactEmail: e.target.value }))}
                type="email"
              />
            </div>
            <div className="field">
              <div className="label">Contact phone</div>
              <input
                className="input"
                value={settings.contactPhone}
                onChange={(e) => setSettings((p) => ({ ...p, contactPhone: e.target.value }))}
              />
            </div>
          </div>

          <div className="field">
            <div className="label">Address</div>
            <input
              className="input"
              value={settings.address}
              onChange={(e) => setSettings((p) => ({ ...p, address: e.target.value }))}
            />
          </div>

          <div className="field">
            <div className="label">Hours</div>
            <input
              className="input"
              value={settings.hours}
              onChange={(e) => setSettings((p) => ({ ...p, hours: e.target.value }))}
            />
          </div>

          <div className="field">
            <div className="label">Currency</div>
            <select
              className="input"
              value={settings.currency}
              onChange={(e) => setSettings((p) => ({ ...p, currency: e.target.value }))}
            >
              <option value="PKR">PKR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>

          <div className="divider" />

          <div className="field">
            <div className="label">Notifications</div>
            <label className="row gap-12" style={{ alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={!!settings.notifications?.expiringMemberships}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    notifications: { ...(p.notifications || {}), expiringMemberships: e.target.checked },
                  }))
                }
              />
              <span>Expiring memberships</span>
            </label>
            <label className="row gap-12" style={{ alignItems: 'center', marginTop: 8 }}>
              <input
                type="checkbox"
                checked={!!settings.notifications?.paymentPending}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    notifications: { ...(p.notifications || {}), paymentPending: e.target.checked },
                  }))
                }
              />
              <span>Pending payments</span>
            </label>
          </div>

          <div className="divider" />

          <div className="field">
            <div className="label">Admin access (optional)</div>
            <label className="row gap-12" style={{ alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={!!settings.access?.adminPinEnabled}
                onChange={(e) =>
                  setSettings((p) => ({
                    ...p,
                    access: { ...(p.access || {}), adminPinEnabled: e.target.checked },
                  }))
                }
              />
              <span>Enable admin PIN</span>
            </label>
            <div style={{ height: 8 }} />
            <input
              className="input"
              value={settings.access?.adminPin ?? ''}
              onChange={(e) =>
                setSettings((p) => ({ ...p, access: { ...(p.access || {}), adminPin: e.target.value } }))
              }
              type="password"
              placeholder="PIN"
              disabled={!settings.access?.adminPinEnabled}
            />
          </div>

          <div className="row gap-12" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" type="button" onClick={resetToDefaults}>
              Reset defaults
            </button>
            <button className="btn btn-primary" type="button" onClick={save}>
              Save settings
            </button>
          </div>
          {savedAt ? <div className="note">Saved at {savedAt}</div> : null}
        </div>
      </div>

      <div className="card">
        <div className="section-header">
          <div className="eyebrow">Plans</div>
          <div>
            <div className="h2">Membership plans</div>
            <div className="muted">
              Edit plan names and prices. Total of all plan prices: {planTotal}.
            </div>
          </div>
        </div>

        <div className="table">
          <div className="table-row table-head" style={{ '--table-cols': '1.2fr 0.8fr 0.8fr' } as React.CSSProperties}>
            <div>Plan</div>
            <div>Price</div>
            <div>Actions</div>
          </div>

          {(settings.membershipPlans || []).map((p, idx) => (
            <div
              key={`${p.name}-${idx}`}
              className="table-row"
              style={{ '--table-cols': '1.2fr 0.8fr 0.8fr' } as React.CSSProperties}
            >
              <div>
                <input
                  className="input"
                  value={p.name}
                  onChange={(e) => updatePlan(idx, { name: e.target.value })}
                />
              </div>
              <div>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={String(p.price)}
                  onChange={(e) => updatePlan(idx, { price: Number(e.target.value || 0) })}
                />
              </div>
              <div className="row gap-12" style={{ justifyContent: 'flex-end' }}>
                <button className="btn" type="button" onClick={() => removePlan(idx)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 12 }} />

        <div className="row gap-12" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" type="button" onClick={addPlan}>
            Add plan
          </button>
        </div>
      </div>
    </div>
  )
}
