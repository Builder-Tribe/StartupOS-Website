import { PageHeader, DataTable, StatusBadge, Can, type Column, type BulkAction } from '../ui'
import { usePerms } from '../AdminApp'
import { aapi, downloadCsv, bulkRun } from '../adminApi'
import { useSearchParams } from 'react-router-dom'

export default function Trips() {
  const [params] = useSearchParams()
  const perms = usePerms()
  // Bulk lifecycle actions (UX audit P0) — permission-gated, audited per trip.
  const bulk: BulkAction[] = [
    perms.includes('trips.publish') && { key: 'publish', label: 'Publish', run: (ids: string[], reason: string) => bulkRun(ids, id => aapi.post(`/trips/${id}/publish`, { reason })) },
    perms.includes('trips.suspend') && { key: 'suspend', label: 'Suspend', danger: true, run: (ids: string[], reason: string) => bulkRun(ids, id => aapi.post(`/trips/${id}/suspend`, { reason })) },
    perms.includes('trips.feature') && { key: 'feature', label: 'Feature', run: (ids: string[], reason: string) => bulkRun(ids, id => aapi.post(`/trips/${id}/feature`, { reason })) },
    perms.includes('trips.archive') && { key: 'archive', label: 'Archive', danger: true, run: (ids: string[], reason: string) => bulkRun(ids, id => aapi.post(`/trips/${id}/archive`, { reason })) },
  ].filter(Boolean) as BulkAction[]
  const columns: Column<any>[] = [
    { key: 'name', label: 'Trip', sortable: true, render: r => <span className="a-cell-strong">{r.featured ? '★ ' : ''}{r.name}</span> },
    { key: 'partnerName', label: 'Partner' },
    { key: 'destination', label: 'Destination' },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'price', label: 'Price', sortable: true, render: r => r.price ? '₹' + r.price.toLocaleString('en-IN') : '—' },
    { key: 'start', label: 'Dates', sortable: true, render: r => (r.startDate || '—') + (r.endDate ? ` → ${r.endDate}` : '') },
    { key: 'hasPayment', label: 'Pay link', render: r => r.hasPayment ? '✓' : <span className="a-badge a-badge-warn">none</span> },
    { key: 'created', label: 'Created', sortable: true, render: r => (r.createdAt || '').slice(0, 10) },
  ]
  return (
    <div className="a-page">
      <PageHeader title="Trips" subtitle="Every trip created by partners, across the platform." actions={
        <Can perm="trips.export"><button className="a-btn" onClick={() => downloadCsv(`/trips/export${window.location.search}`, 'trips.csv')}>Export CSV</button></Can>
      } />
      <DataTable
        endpoint="/trips"
        columns={columns}
        rowLink={r => `/admin/trips/${r.id}`}
        searchPlaceholder="Search trip name, ID or slug…"
        filters={[
          { key: 'status', label: 'Status', options: ['draft', 'published', 'unpublished', 'suspended', 'archived'].map(v => ({ value: v, label: v })) },
          { key: 'hasPayment', label: 'Payment', options: [{ value: '1', label: 'has link' }, { value: '0', label: 'missing' }] },
          { key: 'featured', label: 'Featured', options: [{ value: '1', label: 'featured' }] },
        ]}
        bulkActions={bulk}
        key={params.toString()}
      />
    </div>
  )
}
