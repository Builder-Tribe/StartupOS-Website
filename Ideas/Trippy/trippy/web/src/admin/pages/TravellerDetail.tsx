import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { aapi } from '../adminApi'
import { PageHeader, Section, KeyVal, StatusBadge, Spinner, ErrorState, Can, ConfirmDialog, InternalNotes, ActivityTimeline, fmtDate, fmtDateTime } from '../ui'

export default function TravellerDetail() {
  const { id } = useParams()
  const [u, setU] = useState<any>(null)
  const [error, setError] = useState('')
  const [dialog, setDialog] = useState<{ action: string; label: string; danger?: boolean; reason?: boolean } | null>(null)

  const load = () => { setError(''); aapi.get(`/travellers/${id}`).then(setU).catch(e => setError(e.message)) }
  useEffect(() => { setU(null); load() }, [id])
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!u) return <Spinner />

  const run = async (reason: string) => {
    if (dialog!.action === 'revoke') await aapi.post(`/travellers/${id}/revoke-sessions`)
    else await aapi.post(`/travellers/${id}/status`, { action: dialog!.action, reason })
    await load()
  }

  return (
    <div className="a-page">
      <PageHeader
        breadcrumbs={[{ label: 'Travellers', to: '/admin/travellers' }, { label: u.name || u.email || 'Traveller' }]}
        title={u.name || 'Traveller'} subtitle={u.email}
        actions={<>
          <StatusBadge status={u.status} />
          {u.status === 'active'
            ? <Can perm="travellers.suspend"><button className="a-btn a-btn-danger" onClick={() => setDialog({ action: 'suspend', label: 'Suspend traveller', danger: true, reason: true })}>Suspend</button></Can>
            : <Can perm="travellers.suspend"><button className="a-btn a-btn-primary" onClick={() => setDialog({ action: 'reactivate', label: 'Reactivate traveller' })}>Reactivate</button></Can>}
          <Can perm="travellers.sessions.revoke"><button className="a-btn" onClick={() => setDialog({ action: 'revoke', label: 'Revoke all sessions', danger: true })}>Revoke sessions</button></Can>
        </>}
      />

      <div className="a-detail-grid">
        <div>
          <Section title="Account">
            <KeyVal items={[
              ['Traveller ID', <code>{u.id}</code>], ['Name', u.name], ['Email', u.email], ['Phone', u.phone],
              ['City', u.city], ['Age', u.age], ['Status', <StatusBadge status={u.status} />],
              ['Auth provider', u.provider], ['Email verified', u.emailVerified ? 'Yes' : 'No'], ['Phone verified', u.phoneVerified ? 'Yes' : 'No'],
              ['Onboarded', u.onboarded ? 'Yes' : 'No'], ['Registered', fmtDate(u.createdAt)],
            ]} />
          </Section>

          <Section title="Login information">
            <KeyVal items={[
              ['Last login', fmtDateTime(u.lastLoginAt)], ['Total logins', u.loginCount],
              ['Active sessions', u.activeSessions ?? <span className="a-muted">(needs sessions.view)</span>],
            ]} />
            <p className="a-muted a-small">ⓘ Authentication secrets (passwords, hashes, tokens, OTPs) are never exposed here.</p>
          </Section>

          <Can perm="travellers.sessions.view">
            <Section title={`Sessions (${u.sessions.length})`}>
              <div className="a-table-wrap">
                <table className="a-table"><thead><tr><th>Device</th><th>Browser</th><th>OS</th><th>Created</th><th>Last seen</th><th>Status</th></tr></thead>
                  <tbody>{u.sessions.length === 0 ? <tr><td colSpan={6} className="a-muted">No sessions.</td></tr> : u.sessions.map((s: any) => (
                    <tr key={s.id}><td>{s.device}</td><td>{s.browser}</td><td>{s.os}</td><td className="a-small">{fmtDateTime(s.createdAt)}</td><td className="a-small">{fmtDateTime(s.lastSeenAt)}</td><td>{s.revoked ? <span className="a-badge a-badge-danger">revoked</span> : <span className="a-badge a-badge-ok">active</span>}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            </Section>
            <Section title="Recent login history">
              <div className="a-table-wrap">
                <table className="a-table"><thead><tr><th>When</th><th>Result</th><th>Device</th><th>Browser</th><th>OS</th></tr></thead>
                  <tbody>{u.logins.length === 0 ? <tr><td colSpan={5} className="a-muted">No login events.</td></tr> : u.logins.map((l: any) => (
                    <tr key={l.id}><td className="a-small">{fmtDateTime(l.created_at)}</td><td>{l.success ? <span className="a-badge a-badge-ok">success</span> : <span className="a-badge a-badge-danger">{l.failure_reason || 'failed'}</span>}</td><td>{l.device}</td><td>{l.browser}</td><td>{l.os}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            </Section>
          </Can>

          <Section title="Activity">
            <KeyVal items={[['Saved / upcoming trips', u.activity.savedTrips], ['Connections', u.activity.connections], ['Outbound booking clicks', u.activity.outboundClicks]]} />
          </Section>
        </div>

        <div>
          <InternalNotes entityType="traveller" entityId={u.id} notes={u.notes} perm="travellers.notes.manage" onChange={n => setU({ ...u, notes: n })} />
          <ActivityTimeline events={u.timeline} />
        </div>
      </div>

      {dialog && (
        <ConfirmDialog title={dialog.label} danger={dialog.danger} requireReason={dialog.reason} confirmLabel={dialog.label}
          message={dialog.action === 'suspend' ? 'The traveller will be logged out and blocked from signing in until reactivated.' : dialog.action === 'revoke' ? 'All active sessions will be ended; the traveller must sign in again.' : 'The traveller will regain access.'}
          onConfirm={run} onClose={() => setDialog(null)} />
      )}
    </div>
  )
}
