import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { aapi } from '../adminApi'
import { PageHeader, Section, KeyVal, StatusBadge, Spinner, ErrorState, Can, ConfirmDialog, HighRiskDialog, InternalNotes, ActivityTimeline, fmtDate, fmtDateTime } from '../ui'

export default function PartnerDetail() {
  const { id } = useParams()
  const [p, setP] = useState<any>(null)
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState<{ action: string; label: string; danger?: boolean } | null>(null)
  const [userDialog, setUserDialog] = useState<{ userId: string; action: string; name: string } | null>(null)

  const load = () => { setError(''); aapi.get(`/partners/${id}`).then(setP).catch(e => setError(e.message)) }
  useEffect(() => { setP(null); load() }, [id])

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!p) return <Spinner />

  const act = async (reason: string) => { await aapi.post(`/partners/${id}/status`, { action: dialog!.action, reason }); await load() }
  const userAction = async (userId: string, action: string) => { await aapi.post(`/partners/${id}/users/${userId}/status`, { action }); await load() }

  return (
    <div className="a-page">
      <PageHeader
        breadcrumbs={[{ label: 'Partners', to: '/admin/partners' }, { label: p.name }]}
        title={`${p.logoEmoji} ${p.name}`}
        subtitle={p.about}
        actions={<>
          <StatusBadge status={p.status} />
          {p.status !== 'active' && <Can perm="partners.activate"><button className="a-btn a-btn-primary" onClick={() => setDialog({ action: p.status === 'pending' ? 'activate' : 'reactivate', label: 'Activate partner' })}>Activate</button></Can>}
          {p.status === 'active' && <Can perm="partners.suspend"><button className="a-btn a-btn-danger" onClick={() => setDialog({ action: 'suspend', label: 'Suspend partner', danger: true })}>Suspend</button></Can>}
          <Can perm="partners.suspend"><button className="a-btn" onClick={() => setDialog({ action: 'offboard', label: 'Offboard partner', danger: true })}>Offboard</button></Can>
        </>}
      />

      <div className="a-detail-grid">
        <div>
          <Section title="Overview">
            <KeyVal items={[
              ['Partner ID', <code>{p.id}</code>], ['Organization', p.name], ['Slug', p.slug],
              ['Website', p.website ? <a className="a-link" href={p.website} target="_blank" rel="noreferrer">{p.website}</a> : '—'],
              ['Status', <StatusBadge status={p.status} />],
              ['Total trips', p.counts.trips], ['Published', p.counts.published], ['Drafts', p.counts.drafts],
              ['Outbound booking clicks', p.performance.outboundClicks],
              ['Onboarded', fmtDate(p.createdAt)], ['Last updated', fmtDateTime(p.updatedAt)],
            ]} />
          </Section>

          <Section title={`Partner users (${p.users.length})`}>
            <div className="a-table-wrap">
              <table className="a-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Verified</th><th>Last login</th><th></th></tr></thead>
                <tbody>
                  {p.users.map((u: any) => (
                    <tr key={u.id}>
                      <td>{u.name || '—'}</td><td>{u.email}</td><td>{u.role}</td>
                      <td><StatusBadge status={u.status} /></td>
                      <td>{u.emailVerified ? '✓' : '—'}</td><td className="a-small">{fmtDate(u.lastLoginAt)}</td>
                      <td><Can perm="partners.users.manage"><button className="a-btn a-btn-sm" onClick={() => u.status === 'active' ? setUserDialog({ userId: u.id, action: 'deactivate', name: u.name || u.email }) : userAction(u.id, 'activate')}>{u.status === 'active' ? 'Deactivate' : 'Activate'}</button></Can></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title={`Trips created (${p.trips.length})`}>
            <div className="a-table-wrap">
              <table className="a-table">
                <thead><tr><th>Trip</th><th>Destination</th><th>Status</th><th>Price</th><th>Dates</th></tr></thead>
                <tbody>
                  {p.trips.map((t: any) => (
                    <tr key={t.id} className="a-row-link" onClick={() => { window.location.assign(`/admin/trips/${t.id}`) }}>
                      <td className="a-cell-strong">{t.name}</td><td>{t.destination}</td><td><StatusBadge status={t.status} /></td>
                      <td>{t.price ? '₹' + t.price.toLocaleString('en-IN') : '—'}</td><td className="a-small">{fmtDate(t.startDate)} – {fmtDate(t.endDate)}</td>
                    </tr>
                  ))}
                  {p.trips.length === 0 && <tr><td colSpan={5} className="a-muted">No trips yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </Section>
        </div>

        <div>
          <InternalNotes entityType="partner" entityId={p.id} notes={p.notes} perm="partners.notes.manage" onChange={n => setP({ ...p, notes: n })} />
          <ActivityTimeline events={p.activity} />
        </div>
      </div>

      {dialog && dialog.action === 'offboard' && (
        <HighRiskDialog
          title={dialog.label}
          entityName={p.name}
          confirmLabel={dialog.label}
          message={<>Offboarding removes this partner from the platform: their team loses access and their trips are taken off the consumer app. This is a high-risk action.</>}
          onConfirm={act}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog && dialog.action !== 'offboard' && (
        <ConfirmDialog
          title={dialog.label}
          danger={dialog.danger}
          requireReason={dialog.danger}
          confirmLabel={dialog.label}
          message={<>This changes the partner's status on the canonical platform data. {dialog.action === 'suspend' && 'Suspended partners cannot operate until reactivated.'}</>}
          onConfirm={act}
          onClose={() => setDialog(null)}
        />
      )}
      {userDialog && (
        <ConfirmDialog
          title="Deactivate partner user"
          danger
          confirmLabel="Deactivate"
          message={<>{userDialog.name} will immediately lose access to the Partner CRM for {p.name}. You can reactivate them later.</>}
          onConfirm={() => userAction(userDialog.userId, userDialog.action)}
          onClose={() => setUserDialog(null)}
        />
      )}
    </div>
  )
}
