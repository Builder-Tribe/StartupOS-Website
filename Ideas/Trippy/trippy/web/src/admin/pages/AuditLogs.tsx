import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader, DataTable, Can, fmtDateTime, type Column } from '../ui'
import { aapi, downloadCsv } from '../adminApi'

export default function AuditLogs() {
  const [params, setParams] = useSearchParams()
  const [facets, setFacets] = useState<{ actions: string[]; admins: { id: string; name: string }[] }>({ actions: [], admins: [] })
  useEffect(() => { aapi.get('/audit-log-facets').then(setFacets).catch(() => {}) }, [])
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    setParams(next, { replace: true })
  }
  const columns: Column<any>[] = [
    { key: 'created_at', label: 'When', render: r => fmtDateTime(r.created_at) },
    { key: 'admin_name', label: 'Admin', render: r => r.admin_name || 'system' },
    { key: 'action', label: 'Action', render: r => <code className="a-code">{r.action}</code> },
    { key: 'resource', label: 'Resource', render: r => r.resource_type ? `${r.resource_type}: ${r.resource_name || r.resource_id || ''}` : '—' },
    { key: 'reason', label: 'Reason', render: r => r.reason || '—' },
    { key: 'ip', label: 'IP', render: r => r.ip || '—' },
  ]
  return (
    <div className="a-page">
      <PageHeader title="Audit logs" subtitle="Immutable record of administrative actions. Cannot be edited or deleted." actions={
        <Can perm="audit_logs.view"><button className="a-btn" onClick={() => downloadCsv(`/audit-logs/export${window.location.search}`, 'audit-logs.csv')}>Export CSV</button></Can>
      } />
      <DataTable
        endpoint="/audit-logs"
        columns={columns}
        searchPlaceholder="Search action, resource, admin…"
        filters={[
          { key: 'action', label: 'Action', options: facets.actions.map(a => ({ value: a, label: a })) },
          { key: 'adminId', label: 'Admin', options: facets.admins.map(a => ({ value: a.id, label: a.name })) },
          { key: 'resourceType', label: 'Resource', options: ['partner', 'trip', 'hostel', 'traveller', 'admin_user', 'role'].map(v => ({ value: v, label: v })) },
        ]}
        extraParamKeys={['from', 'to']}
        extraControls={<>
          <label className="a-datelabel">From <input className="a-input a-date" type="date" value={params.get('from') || ''} onChange={e => setParam('from', e.target.value)} /></label>
          <label className="a-datelabel">To <input className="a-input a-date" type="date" value={params.get('to') || ''} onChange={e => setParam('to', e.target.value)} /></label>
        </>}
        key={params.toString()}
      />
    </div>
  )
}
