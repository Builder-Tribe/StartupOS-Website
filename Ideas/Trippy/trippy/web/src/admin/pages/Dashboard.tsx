import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { aapi } from '../adminApi'
import { PageHeader, MetricCard, Section, Spinner, ErrorState, fmtDateTime } from '../ui'

// Tiny inline sparkline (no chart dependency) for growth series.
function Spark({ data }: { data: { date: string; count: number }[] }) {
  if (!data?.length) return null
  const max = Math.max(1, ...data.map(d => d.count))
  const w = 160, h = 36, step = w / (data.length - 1 || 1)
  const pts = data.map((d, i) => `${(i * step).toFixed(1)},${(h - (d.count / max) * h).toFixed(1)}`).join(' ')
  const total = data.reduce((s, d) => s + d.count, 0)
  return (
    <div className="a-spark">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none"><polyline points={pts} fill="none" stroke="#0d9488" strokeWidth="2" /></svg>
      <span className="a-muted a-small">{total} in range</span>
    </div>
  )
}

export default function Dashboard() {
  const [d, setD] = useState<any>(null)
  const [error, setError] = useState('')
  const [range, setRange] = useState(30)
  const load = () => { setError(''); aapi.get(`/dashboard?range=${range}`).then(setD).catch(e => setError(e.message)) }
  useEffect(() => { setD(null); load() }, [range])

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!d) return <Spinner />
  const o = d.overview
  const ar = d.actionRequired

  return (
    <div className="a-page">
      <PageHeader title="Platform overview" subtitle="The operational home of Trippy — live data across the platform." actions={
        <select className="a-input" value={range} onChange={e => setRange(Number(e.target.value))}>
          <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option>
        </select>
      } />

      <Section title="Travellers">
        <div className="a-metrics">
          <MetricCard label="Total" value={o.travellers.total} to="/admin/travellers" />
          <MetricCard label="New today" value={o.travellers.today} />
          <MetricCard label="New this week" value={o.travellers.week} />
          <MetricCard label="New this month" value={o.travellers.month} />
          <MetricCard label="Active (30d)" value={o.travellers.active} tone="ok" />
          <MetricCard label="Suspended" value={o.travellers.suspended} tone={o.travellers.suspended ? 'danger' : undefined} to="/admin/travellers?status=suspended" />
        </div>
      </Section>

      <div className="a-cols">
        <Section title="Partners">
          <div className="a-metrics">
            <MetricCard label="Total" value={o.partners.total} to="/admin/partners" />
            <MetricCard label="Active" value={o.partners.active} tone="ok" to="/admin/partners?status=active" />
            <MetricCard label="Pending" value={o.partners.pending} tone={o.partners.pending ? 'warn' : undefined} to="/admin/partners?status=pending" />
            <MetricCard label="Suspended" value={o.partners.suspended} tone={o.partners.suspended ? 'danger' : undefined} />
          </div>
        </Section>
        <Section title="Hostels">
          <div className="a-metrics">
            <MetricCard label="Total" value={o.hostels.total} to="/admin/hostels" />
            <MetricCard label="Published" value={o.hostels.published} tone="ok" to="/admin/hostels?status=published" />
          </div>
        </Section>
      </div>

      <Section title="Trips">
        <div className="a-metrics">
          <MetricCard label="Total" value={o.trips.total} to="/admin/trips" />
          <MetricCard label="Draft" value={o.trips.draft} to="/admin/trips?status=draft" />
          <MetricCard label="Live" value={o.trips.published} tone="ok" to="/admin/trips?status=published" />
          <MetricCard label="Completed" value={o.trips.completed} tone="info" />
          <MetricCard label="Suspended" value={o.trips.suspended} tone={o.trips.suspended ? 'danger' : undefined} to="/admin/trips?status=suspended" />
          <MetricCard label="Archived" value={o.trips.archived} to="/admin/trips?status=archived" />
        </div>
      </Section>

      <Section title="Growth">
        <div className="a-growth">
          {[['Traveller registrations', d.growth.travellers], ['Partner onboarding', d.growth.partners], ['Trips created', d.growth.tripsCreated], ['Trips published', d.growth.tripsPublished], ['Hostels added', d.growth.hostelsAdded]].map(([label, series]: any) => (
            <div key={label} className="a-growth-card"><div className="a-growth-label">{label}</div><Spark data={series} /></div>
          ))}
        </div>
      </Section>

      <div className="a-cols">
        <Section title="Action required">
          <div className="a-queue">
            <Link to="/admin/travellers?verifications=1" className="a-queue-item"><span>ID verifications to review</span><b>{ar.idVerificationsPending ?? 0}</b></Link>
            <Link to="/admin/partners?status=pending" className="a-queue-item"><span>Partners pending activation</span><b>{ar.partnersPending}</b></Link>
            <Link to="/admin/trips?hasPayment=0" className="a-queue-item"><span>Trips without a payment link</span><b>{ar.tripsMissingPayment}</b></Link>
            <Link to="/admin/trips?status=draft" className="a-queue-item"><span>Stale draft trips (7+ days)</span><b>{ar.draftTripsStale}</b></Link>
            <Link to="/admin/hostels?status=draft" className="a-queue-item"><span>Draft hostels</span><b>{ar.hostelsDraft}</b></Link>
            <Link to="/admin/travellers?status=suspended" className="a-queue-item"><span>Suspended travellers</span><b>{ar.suspendedTravellers}</b></Link>
            <Link to="/admin/partners?status=suspended" className="a-queue-item"><span>Suspended partners</span><b>{ar.suspendedPartners}</b></Link>
          </div>
        </Section>
        <Section title="Recent activity">
          <div className="a-activity">
            {d.activity.slice(0, 12).map((e: any, i: number) => (
              <div key={i} className="a-activity-item"><span className="a-activity-label">{e.label}</span><span className="a-muted a-small">{e.actor || ''} · {fmtDateTime(e.at)}</span></div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="Top performing">
        <div className="a-cols3">
          <div><div className="a-top-title">Trips by booking clicks</div>{d.topPerforming.topTripsByClicks.length ? d.topPerforming.topTripsByClicks.map((t: any) => <Link key={t.id} to={`/admin/trips/${t.id}`} className="a-top-row"><span>{t.name}</span><b>{t.clicks}</b></Link>) : <p className="a-muted a-small">No clicks yet.</p>}</div>
          <div><div className="a-top-title">Partners by published trips</div>{d.topPerforming.topPartnersByTrips.length ? d.topPerforming.topPartnersByTrips.map((p: any) => <Link key={p.id} to={`/admin/partners/${p.id}`} className="a-top-row"><span>{p.name}</span><b>{p.published}</b></Link>) : <p className="a-muted a-small">—</p>}</div>
          <div><div className="a-top-title">Partners by booking clicks</div>{d.topPerforming.topPartnersByClicks.length ? d.topPerforming.topPartnersByClicks.map((p: any) => <Link key={p.id} to={`/admin/partners/${p.id}`} className="a-top-row"><span>{p.name}</span><b>{p.clicks}</b></Link>) : <p className="a-muted a-small">No clicks yet.</p>}</div>
        </div>
        <p className="a-muted a-small a-note">ⓘ {d.analyticsNote}</p>
      </Section>
    </div>
  )
}
