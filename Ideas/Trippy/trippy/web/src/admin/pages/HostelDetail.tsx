import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { aapi } from '../adminApi'
import { PageHeader, Section, KeyVal, StatusBadge, Spinner, ErrorState, Can, ConfirmDialog, HighRiskDialog, InternalNotes, ActivityTimeline, fmtDate, fmtDateTime } from '../ui'

export default function HostelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [h, setH] = useState<any>(null)
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState<{ action: string; label: string; danger?: boolean; reason?: boolean; highRisk?: boolean } | null>(null)

  const load = () => { setError(''); aapi.get(`/hostels/${id}`).then(setH).catch(e => setError(e.message)) }
  useEffect(() => { setH(null); load() }, [id])
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!h) return <Spinner />

  const act = async (reason: string) => { await aapi.post(`/hostels/${id}/${dialog!.action}`, { reason }); await load() }
  const blockers: string[] = h.publishBlockers || []

  return (
    <div className="a-page">
      <PageHeader
        breadcrumbs={[{ label: 'Hostels', to: '/admin/hostels' }, { label: h.name }]}
        title={`${h.featured ? '★ ' : ''}${h.name}`}
        subtitle={h.shortDesc}
        actions={<>
          <StatusBadge status={h.status} />
          <Can perm="hostels.edit"><button className="a-btn" onClick={() => navigate(`/admin/hostels/${id}/edit`)}>Edit</button></Can>
          {h.status !== 'published' && <Can perm="hostels.publish"><button className="a-btn a-btn-primary" disabled={blockers.length > 0} onClick={() => setDialog({ action: 'publish', label: 'Publish hostel' })}>Publish</button></Can>}
          {h.status === 'published' && <Can perm="hostels.unpublish"><button className="a-btn" onClick={() => setDialog({ action: 'unpublish', label: 'Unpublish hostel', reason: true })}>Unpublish</button></Can>}
          {h.status === 'suspended'
            ? <Can perm="hostels.suspend"><button className="a-btn a-btn-primary" disabled={blockers.length > 0} onClick={() => setDialog({ action: 'restore', label: 'Restore hostel' })}>Restore</button></Can>
            : <Can perm="hostels.suspend"><button className="a-btn a-btn-danger" onClick={() => setDialog({ action: 'suspend', label: 'Suspend hostel', danger: true, reason: true })}>Suspend</button></Can>}
          <Can perm="hostels.feature"><button className="a-btn" onClick={() => setDialog({ action: h.featured ? 'unfeature' : 'feature', label: h.featured ? 'Unfeature' : 'Feature' })}>{h.featured ? 'Unfeature' : 'Feature'}</button></Can>
          <Can perm="hostels.archive"><button className="a-btn a-btn-danger" onClick={() => setDialog({ action: 'close', label: 'Mark permanently closed', highRisk: true })}>Mark closed</button></Can>
        </>}
      />
      {blockers.length > 0 && <div className="a-warn-box"><strong>Cannot publish — missing:</strong><ul>{blockers.map((b, i) => <li key={i}>{b}</li>)}</ul></div>}

      <div className="a-detail-grid">
        <div>
          {h.coverImage && <div className="a-cover" style={{ backgroundImage: `url(${h.coverImage})` }} />}
          <Section title="Overview">
            <KeyVal items={[
              ['Hostel ID', <code>{h.id}</code>], ['Type', h.propertyType], ['Status', <StatusBadge status={h.status} />], ['Featured', h.featured ? 'Yes' : 'No'],
              ['Source', h.source], ['Slug', h.slug], ['Price/night', h.pricePerNight ? '₹' + h.pricePerNight : '—'], ['Rating', h.rating ?? '—'],
            ]} />
          </Section>
          <Section title="Location">
            <KeyVal items={[['City', h.city], ['State', h.state], ['Country', h.country], ['Destination', h.destination], ['Address', h.address], ['Coordinates', h.latitude ? `${h.latitude}, ${h.longitude}` : '—']]} />
          </Section>
          <Section title="Contact & details">
            <KeyVal items={[['Email', h.email], ['Phone', h.phone], ['Website', h.website ? <a className="a-link" href={h.website} target="_blank" rel="noreferrer">link ↗</a> : '—'], ['Check-in / out', `${h.checkinTime || '—'} / ${h.checkoutTime || '—'}`], ['Amenities', (h.amenities || []).join(', ') || '—'], ['Booking URL', h.bookingUrl ? <a className="a-link" href={h.bookingUrl} target="_blank" rel="noreferrer">link ↗</a> : '—']]} />
          </Section>
          {h.gallery?.length > 0 && <Section title="Gallery"><div className="a-gallery">{h.gallery.map((u: string, i: number) => <div key={i} className="a-gallery-img" style={{ backgroundImage: `url(${u})` }} />)}</div></Section>}
          <Section title="Administrative">
            <KeyVal items={[['Created', fmtDate(h.createdAt)], ['Updated', fmtDateTime(h.updatedAt)], ['Published', fmtDateTime(h.publishedAt)], ['Last verified', fmtDate(h.lastVerifiedAt)], ['External ref', h.externalRef]]} />
          </Section>
        </div>
        <div>
          <InternalNotes entityType="hostel" entityId={h.id} notes={h.notes} perm="hostels.notes.manage" onChange={n => setH({ ...h, notes: n })} />
          <ActivityTimeline events={h.activity} />
        </div>
      </div>

      {dialog && !dialog.highRisk && (
        <ConfirmDialog title={dialog.label} danger={dialog.danger} requireReason={dialog.reason} confirmLabel={dialog.label}
          message="Only published hostels appear on the consumer app. This updates canonical data." onConfirm={act} onClose={() => setDialog(null)} />
      )}
      {dialog?.highRisk && (
        <HighRiskDialog title={dialog.label} entityName={h.name} confirmLabel="Mark permanently closed"
          message="This marks the hostel permanently closed and removes it from the consumer app. This is a high-impact action." onConfirm={act} onClose={() => setDialog(null)} />
      )}
    </div>
  )
}
