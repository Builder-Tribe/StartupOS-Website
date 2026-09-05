import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { aapi } from '../adminApi'
import { PageHeader, Section, KeyVal, StatusBadge, Spinner, ErrorState, Can, ConfirmDialog, EntityLink, InternalNotes, ActivityTimeline, fmtDate, fmtDateTime } from '../ui'
import { StarDisplay } from '../../components'

export default function TripDetail() {
  const { id } = useParams()
  const [t, setT] = useState<any>(null)
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState<{ action: string; label: string; danger?: boolean; reason?: boolean } | null>(null)
  const [reviews, setReviews] = useState<any>(null)

  const load = () => { setError(''); aapi.get(`/trips/${id}`).then(setT).catch(e => setError(e.message)) }
  const loadReviews = () => aapi.get(`/reviews?targetType=partner_trip&targetId=${id}`).then(setReviews).catch(() => {})
  useEffect(() => { setT(null); load(); loadReviews() }, [id])

  const deleteReview = async (reviewId: string) => {
    if (!confirm('Remove this review? This cannot be undone.')) return
    await aapi.del(`/reviews/${reviewId}`)
    loadReviews()
  }
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!t) return <Spinner />

  const act = async (reason: string) => { await aapi.post(`/trips/${id}/${dialog!.action}`, { reason }); await load() }
  const inr = (n: number) => '₹' + (n || 0).toLocaleString('en-IN')
  const blockers: string[] = t.publishBlockers || []

  return (
    <div className="a-page">
      <PageHeader
        breadcrumbs={[{ label: 'Trips', to: '/admin/trips' }, { label: t.name || 'Trip' }]}
        title={`${t.featured ? '★ ' : ''}${t.name || 'Untitled trip'}`}
        subtitle={t.shortDesc}
        actions={<>
          <StatusBadge status={t.status} />
          {t.status !== 'published' && <Can perm="trips.publish"><button className="a-btn a-btn-primary" disabled={blockers.length > 0} title={blockers.length ? 'Fix required fields first' : ''} onClick={() => setDialog({ action: 'publish', label: 'Publish trip' })}>Publish</button></Can>}
          {t.status === 'published' && <Can perm="trips.unpublish"><button className="a-btn" onClick={() => setDialog({ action: 'unpublish', label: 'Unpublish trip', reason: true })}>Unpublish</button></Can>}
          {t.status === 'suspended'
            ? <Can perm="trips.suspend"><button className="a-btn a-btn-primary" disabled={blockers.length > 0} onClick={() => setDialog({ action: 'restore', label: 'Restore trip' })}>Restore</button></Can>
            : <Can perm="trips.suspend"><button className="a-btn a-btn-danger" onClick={() => setDialog({ action: 'suspend', label: 'Suspend trip', danger: true, reason: true })}>Suspend</button></Can>}
          <Can perm="trips.feature"><button className="a-btn" onClick={() => setDialog({ action: t.featured ? 'unfeature' : 'feature', label: t.featured ? 'Unfeature trip' : 'Feature trip' })}>{t.featured ? 'Unfeature' : 'Feature'}</button></Can>
          <Can perm="trips.archive"><button className="a-btn" onClick={() => setDialog({ action: 'archive', label: 'Archive trip', danger: true, reason: true })}>Archive</button></Can>
        </>}
      />

      {blockers.length > 0 && (
        <div className="a-warn-box"><strong>Cannot publish — missing required information:</strong><ul>{blockers.map((b, i) => <li key={i}>{b}</li>)}</ul></div>
      )}

      <div className="a-detail-grid">
        <div>
          <Section title="Overview">
            <KeyVal items={[
              ['Trip ID', <code>{t.id}</code>], ['Partner', t.partner ? <EntityLink type="partner" id={t.partner.id}>{t.partner.name}</EntityLink> : '—'],
              ['Destination', t.destination], ['Starting location', t.startCity], ['Duration', t.durationDays ? `${t.durationDays} days` : '—'],
              ['Dates', `${fmtDate(t.startDate)} – ${fmtDate(t.endDate)}`], ['Group size', t.maxGroupSize], ['Difficulty', t.difficulty],
              ['Category', t.category], ['Status', <StatusBadge status={t.status} />], ['Featured', t.featured ? 'Yes' : 'No'],
              ['Created', fmtDate(t.createdAt)], ['Published', fmtDateTime(t.publishedAt)],
            ]} />
          </Section>

          {t.longDesc && <Section title="Description"><p>{t.longDesc}</p></Section>}

          {t.coverImage && <Section title="Media"><div className="a-cover" style={{ backgroundImage: `url(${t.coverImage})` }} />
            {t.media?.length > 0 && <div className="a-gallery">{t.media.map((m: any) => <div key={m.id} className="a-gallery-img" style={{ backgroundImage: `url(${m.url})` }} />)}</div>}
          </Section>}

          <Section title="Pricing & booking">
            <KeyVal items={[
              ['Price', inr(t.price)], ['Original price', t.originalPrice ? inr(t.originalPrice) : '—'], ['Currency', t.currency],
              ['Pricing notes', t.pricingNotes || '—'], ['Payment link', t.paymentUrl ? <a className="a-link" href={t.paymentUrl} target="_blank" rel="noreferrer">external ↗</a> : <span className="a-badge a-badge-warn">none</span>],
              ['Inclusions', (t.inclusions || []).join(', ') || '—'], ['Exclusions', (t.exclusions || []).join(', ') || '—'],
            ]} />
          </Section>

          <Section title={`Itinerary (${(t.itinerary || []).length} days)`}>
            {(t.itinerary || []).length === 0 ? <p className="a-muted">No itinerary.</p> : t.itinerary.map((d: any) => (
              <div key={d.id} className="a-itin-day">
                <div className="a-itin-num">Day {d.dayNumber}</div>
                <div><strong>{d.title || `Day ${d.dayNumber}`}</strong>{d.location && <span className="a-muted"> · {d.location}</span>}
                  {d.description && <p className="a-muted a-small">{d.description}</p>}
                  {(d.activities || []).length > 0 && <div className="a-small">Activities: {d.activities.join(', ')}</div>}
                  {(d.meals || []).length > 0 && <div className="a-small a-muted">Meals: {d.meals.join(', ')} · Stay: {d.accommodation || '—'}</div>}
                </div>
              </div>
            ))}
          </Section>

          <Section title="Performance">
            <KeyVal items={[['Outbound booking clicks', t.performance?.outboundClicks ?? 0]]} />
            <p className="a-muted a-small">ⓘ Impressions / detail views / saves are not yet instrumented.</p>
          </Section>

          <Section title={`Reviews${reviews ? ` (${reviews.count})` : ''}`}>
            {!reviews && <p className="a-muted a-small">Loading…</p>}
            {reviews && reviews.count === 0 && <p className="a-muted">No reviews yet.</p>}
            {reviews && reviews.count > 0 && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <StarDisplay rating={reviews.avgRating} count={reviews.count} />
                </div>
                <div className="a-review-list">
                  {reviews.reviews.map((rv: any) => (
                    <div key={rv.id} className="a-review-row">
                      <div className="a-review-header">
                        <span className="a-review-author">{rv.reviewer?.avatarEmoji || '👤'} {rv.reviewer?.name || 'Traveller'}</span>
                        <StarDisplay rating={rv.rating} />
                        <span className="a-muted a-small">{fmtDate(rv.createdAt)}</span>
                        <Can perm="trips.manage">
                          <button className="a-btn a-btn-danger a-btn-xs" onClick={() => deleteReview(rv.id)}>Remove</button>
                        </Can>
                      </div>
                      {rv.title && <div className="a-review-title">{rv.title}</div>}
                      {rv.body && <p className="a-review-body a-small">{rv.body}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </Section>
        </div>

        <div>
          <InternalNotes entityType="trip" entityId={t.id} notes={t.notes} perm="trips.notes.manage" onChange={n => setT({ ...t, notes: n })} />
          <ActivityTimeline events={t.activity} />
        </div>
      </div>

      {dialog && (
        <ConfirmDialog
          title={dialog.label} danger={dialog.danger} requireReason={dialog.reason} confirmLabel={dialog.label}
          message={<>This updates canonical trip data and reflects immediately in the consumer &amp; partner apps.</>}
          onConfirm={act} onClose={() => setDialog(null)}
        />
      )}
    </div>
  )
}
