import { PageHeader, DataTable, StatusBadge, Can, type Column, type BulkAction } from '../ui'
import { usePerms } from '../AdminApp'
import { aapi, downloadCsv, bulkRun } from '../adminApi'
import { useSearchParams } from 'react-router-dom'

export default function Partners() {
  const [params] = useSearchParams()
  const perms = usePerms()
  // Bulk activate/suspend (UX audit P0) — permission-gated, audited per partner.
  const bulk: BulkAction[] = [
    perms.includes('partners.activate') && { key: 'activate', label: 'Activate', run: (ids: string[], reason: string) => bulkRun(ids, id => aapi.post(`/partners/${id}/status`, { action: 'activate', reason })) },
    perms.includes('partners.suspend') && { key: 'suspend', label: 'Suspend', danger: true, run: (ids: string[], reason: string) => bulkRun(ids, id => aapi.post(`/partners/${id}/status`, { action: 'suspend', reason })) },
  ].filter(Boolean) as BulkAction[]
  const columns: Column<any>[] = [
    { key: 'name', label: 'Partner', sortable: true, render: r => <span className="a-cell-strong">{r.logoEmoji} {r.name}</span> },
    { key: 'status', label: 'Status', sortable: true, render: r => <StatusBadge status={r.status} /> },
    { key: 'users', label: 'Users', render: r => r.users },
    { key: 'trips', label: 'Trips', render: r => r.trips },
    { key: 'published', label: 'Live', render: r => r.published },
    { key: 'drafts', label: 'Drafts', render: r => r.drafts },
    { key: 'website', label: 'Website', render: r => r.website ? <a className="a-link" href={r.website} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>link ↗</a> : '—' },
    { key: 'created', label: 'Onboarded', sortable: true, render: r => (r.createdAt || '').slice(0, 10) },
  ]
  return (
    <div className="a-page">
      <PageHeader title="Partners" subtitle="Travel communities and trip hosts." actions={
        <Can perm="partners.export"><button className="a-btn" onClick={() => downloadCsv(`/partners/export${window.location.search}`, 'partners.csv')}>Export CSV</button></Can>
      } />
      <DataTable
        endpoint="/partners"
        columns={columns}
        rowLink={r => `/admin/partners/${r.id}`}
        searchPlaceholder="Search partner name or ID…"
        filters={[{ key: 'status', label: 'Status', options: ['pending', 'active', 'suspended', 'offboarded'].map(v => ({ value: v, label: v })) }]}
        bulkActions={bulk}
        key={params.get('status') || 'all'}
      />
    </div>
  )
}
