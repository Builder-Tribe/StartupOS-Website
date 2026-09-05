import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader, DataTable, StatusBadge, Can, ConfirmDialog, EntityLink, Section, fmtDateTime, type Column, type BulkAction } from '../ui'
import { usePerms } from '../AdminApp'
import { aapi, downloadCsv, bulkRun } from '../adminApi'

const DOC_LABEL: Record<string, string> = { aadhaar: 'Aadhaar', passport: 'Passport', driving_licence: 'Driving licence', voter_id: 'Voter ID' }

// ID verification review queue (PRD 1.1.3) — approve grants the trust badge; reject requires a reason.
function VerificationQueue() {
  const [rows, setRows] = useState<any[] | null>(null)
  const [rejecting, setRejecting] = useState<any>(null)
  const load = () => aapi.get('/id-verifications?status=pending').then(d => setRows(d.rows))
  useEffect(() => { load() }, [])
  if (!rows) return null
  return (
    <Section title={`ID verifications pending review (${rows.length})`}>
      {rows.length === 0 && <p className="a-muted">Queue is clear — nothing waiting.</p>}
      {rows.map(v => (
        <div key={v.id} className="a-verify-row">
          <span className="a-avatar" style={{ background: v.avatarColor }}>{v.avatarEmoji}</span>
          <div className="a-verify-main">
            <EntityLink type="traveller" id={v.userId}>{v.name || v.email}</EntityLink>
            <span className="a-small a-muted">{DOC_LABEL[v.docType] || v.docType} ····{v.docLast4} · requested {fmtDateTime(v.createdAt)}</span>
          </div>
          <button className="a-btn a-btn-sm a-btn-primary" onClick={async () => { await aapi.post(`/id-verifications/${v.id}/decide`, { action: 'approve' }); load() }}>Approve</button>
          <button className="a-btn a-btn-sm a-btn-danger" onClick={() => setRejecting(v)}>Reject</button>
        </div>
      ))}
      {rejecting && (
        <ConfirmDialog
          title="Reject ID verification"
          danger requireReason
          confirmLabel="Reject request"
          message={<>Rejecting {rejecting.name || rejecting.email}'s {DOC_LABEL[rejecting.docType]} verification. The reason is shown to the traveller so they can retry correctly.</>}
          onConfirm={async reason => { await aapi.post(`/id-verifications/${rejecting.id}/decide`, { action: 'reject', reason }); setRejecting(null); load() }}
          onClose={() => setRejecting(null)}
        />
      )}
    </Section>
  )
}

export default function Travellers() {
  const [params] = useSearchParams()
  const perms = usePerms()
  // Bulk suspend/reactivate (UX audit P0) — permission-gated, audited per traveller.
  const bulk: BulkAction[] = [
    perms.includes('travellers.suspend') && { key: 'suspend', label: 'Suspend', danger: true, run: (ids: string[], reason: string) => bulkRun(ids, id => aapi.post(`/travellers/${id}/status`, { action: 'suspend', reason })) },
    perms.includes('travellers.suspend') && { key: 'reactivate', label: 'Reactivate', run: (ids: string[], reason: string) => bulkRun(ids, id => aapi.post(`/travellers/${id}/status`, { action: 'reactivate', reason })) },
  ].filter(Boolean) as BulkAction[]
  const columns: Column<any>[] = [
    { key: 'name', label: 'Traveller', sortable: true, render: r => <span className="a-cell-strong"><span className="a-avatar" style={{ background: r.avatarColor }}>{r.avatarEmoji}</span> {r.name || '—'}</span> },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone', render: r => r.phone || '—' },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'verified', label: 'Verified', render: r => `${r.emailVerified ? '✉︎' : ''}${r.phoneVerified ? '☎' : ''}` || '—' },
    { key: 'loginCount', label: 'Logins', render: r => r.loginCount },
    { key: 'lastLogin', label: 'Last login', sortable: true, render: r => (r.lastLoginAt || '').slice(0, 10) || '—' },
    { key: 'created', label: 'Registered', sortable: true, render: r => (r.createdAt || '').slice(0, 10) },
  ]
  return (
    <div className="a-page">
      <PageHeader title="Travellers" subtitle="Consumer app users." actions={
        <Can perm="travellers.export"><button className="a-btn" onClick={() => downloadCsv(`/travellers/export${window.location.search}`, 'travellers.csv')}>Export CSV</button></Can>
      } />
      {perms.includes('travellers.verify') && <VerificationQueue />}
      <DataTable
        endpoint="/travellers"
        columns={columns}
        rowLink={r => `/admin/travellers/${r.id}`}
        searchPlaceholder="Search name, email, phone, ID…"
        filters={[
          { key: 'status', label: 'Status', options: [{ value: 'active', label: 'active' }, { value: 'suspended', label: 'suspended' }] },
          { key: 'emailVerified', label: 'Email', options: [{ value: '1', label: 'verified' }] },
          { key: 'onboarded', label: 'Onboarded', options: [{ value: '1', label: 'yes' }] },
        ]}
        bulkActions={bulk}
        key={params.toString()}
      />
    </div>
  )
}
