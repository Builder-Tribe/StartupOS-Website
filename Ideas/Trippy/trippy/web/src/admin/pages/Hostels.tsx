import { useNavigate, useSearchParams } from 'react-router-dom'
import { PageHeader, DataTable, StatusBadge, Can, type Column } from '../ui'
import { downloadCsv } from '../adminApi'

export default function Hostels() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const columns: Column<any>[] = [
    { key: 'name', label: 'Hostel', sortable: true, render: r => <span className="a-cell-strong">{r.featured ? '★ ' : ''}{r.name}</span> },
    { key: 'city', label: 'City', sortable: true },
    { key: 'destination', label: 'Destination' },
    { key: 'status', label: 'Status', sortable: true, render: r => <StatusBadge status={r.status} /> },
    { key: 'source', label: 'Source' },
    { key: 'hasBooking', label: 'Booking', render: r => r.hasBooking ? '✓' : '—' },
    { key: 'created', label: 'Created', sortable: true, render: r => (r.createdAt || '').slice(0, 10) },
  ]
  return (
    <div className="a-page">
      <PageHeader title="Hostels" subtitle="Canonical property listings shown on the consumer app (published only)." actions={<>
        <Can perm="hostels.export"><button className="a-btn" onClick={() => downloadCsv(`/hostels/export${window.location.search}`, 'hostels.csv')}>Export CSV</button></Can>
        <Can perm="hostels.create"><button className="a-btn a-btn-primary" onClick={() => navigate('/admin/hostels/new')}>+ Add hostel</button></Can>
      </>} />
      <DataTable
        endpoint="/hostels"
        columns={columns}
        rowLink={r => `/admin/hostels/${r.id}`}
        searchPlaceholder="Search hostel name, city, ID…"
        filters={[
          { key: 'status', label: 'Status', options: ['draft', 'published', 'unpublished', 'suspended', 'permanently_closed', 'archived'].map(v => ({ value: v, label: v.replace(/_/g, ' ') })) },
          { key: 'source', label: 'Source', options: ['admin', 'seed', 'scraped', 'api'].map(v => ({ value: v, label: v })) },
          { key: 'featured', label: 'Featured', options: [{ value: '1', label: 'featured' }] },
          { key: 'hasBooking', label: 'Booking', options: [{ value: '1', label: 'has link' }] },
        ]}
        key={params.toString()}
      />
    </div>
  )
}
