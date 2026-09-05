import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { aapi, qs } from './adminApi'
import { usePerms } from './AdminApp'

// ---------- primitives ----------
export function Spinner() { return <div className="a-spinner" aria-label="Loading" /> }

export function PageHeader({ title, subtitle, actions, breadcrumbs }: { title: string; subtitle?: string; actions?: React.ReactNode; breadcrumbs?: { label: string; to?: string }[] }) {
  return (
    <div className="a-pagehead">
      {breadcrumbs && (
        <div className="a-crumbs">
          {breadcrumbs.map((b, i) => (
            <span key={i}>{b.to ? <Link to={b.to}>{b.label}</Link> : b.label}{i < breadcrumbs.length - 1 && <span className="a-crumb-sep">/</span>}</span>
          ))}
        </div>
      )}
      <div className="a-pagehead-row">
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="a-muted">{subtitle}</p>}
        </div>
        {actions && <div className="a-pagehead-actions">{actions}</div>}
      </div>
    </div>
  )
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return <div className="a-empty"><div className="a-empty-icon">∅</div><strong>{title}</strong>{hint && <p className="a-muted">{hint}</p>}</div>
}
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="a-error-state"><strong>Something went wrong</strong><p className="a-muted">{message}</p>{onRetry && <button className="a-btn" onClick={onRetry}>Retry</button>}</div>
}

const STATUS_TONE: Record<string, string> = {
  active: 'ok', published: 'ok', ACTIVE: 'ok',
  draft: 'muted', unpublished: 'muted', pending: 'warn', deactivated: 'muted',
  suspended: 'danger', offboarded: 'danger', permanently_closed: 'danger', archived: 'muted', completed: 'info',
}
export function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONE[status] || 'muted'
  return <span className={`a-badge a-badge-${tone}`}>{String(status).replace(/_/g, ' ')}</span>
}

export function MetricCard({ label, value, tone, to }: { label: string; value: React.ReactNode; tone?: string; to?: string }) {
  const inner = <><div className={`a-metric-value ${tone ? 'a-metric-' + tone : ''}`}>{value}</div><div className="a-metric-label">{label}</div></>
  return to ? <Link to={to} className="a-metric a-metric-link">{inner}</Link> : <div className="a-metric">{inner}</div>
}

export function KeyVal({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <div className="a-kv">
      {items.map(([k, v], i) => <div key={i} className="a-kv-row"><span className="a-kv-k">{k}</span><span className="a-kv-v">{v ?? <span className="a-muted">—</span>}</span></div>)}
    </div>
  )
}
export function Section({ title, actions, children }: { title: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return <div className="a-section"><div className="a-section-head"><h3>{title}</h3>{actions}</div>{children}</div>
}

// Permission-gated render + action button.
export function Can({ perm, children }: { perm: string; children: React.ReactNode }) {
  const perms = usePerms()
  return perms.includes(perm) ? <>{children}</> : null
}

export function EntityLink({ type, id, children }: { type: 'partner' | 'trip' | 'hostel' | 'traveller'; id: string; children: React.ReactNode }) {
  const path = { partner: 'partners', trip: 'trips', hostel: 'hostels', traveller: 'travellers' }[type]
  return <Link className="a-link" to={`/admin/${path}/${id}`}>{children}</Link>
}

// ---------- confirmation dialogs ----------
export function ConfirmDialog({ title, message, confirmLabel = 'Confirm', danger, requireReason, onConfirm, onClose }: {
  title: string; message: React.ReactNode; confirmLabel?: string; danger?: boolean; requireReason?: boolean
  onConfirm: (reason: string) => Promise<void> | void; onClose: () => void
}) {
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const go = async () => {
    setBusy(true); setErr('')
    try { await onConfirm(reason); onClose() }
    catch (e: any) { setErr(e.errors?.[0] || e.message); setBusy(false) }
  }
  return (
    <div className="a-modal-backdrop" onClick={onClose}>
      <div className="a-modal" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <div className="a-muted a-modal-body">{message}</div>
        {requireReason && <><label className="a-label">Reason</label><textarea className="a-input" rows={2} value={reason} onChange={e => setReason(e.target.value)} placeholder="Recorded in the audit log" /></>}
        {err && <p className="a-error">{err}</p>}
        <div className="a-modal-actions">
          <button className="a-btn" onClick={onClose} disabled={busy}>Cancel</button>
          <button className={`a-btn ${danger ? 'a-btn-danger' : 'a-btn-primary'}`} disabled={busy || (!!requireReason && !reason.trim())} onClick={go}>{busy ? 'Working…' : confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

// High-risk: must type the entity name to enable confirm.
export function HighRiskDialog({ title, entityName, message, confirmLabel = 'Confirm', onConfirm, onClose }: {
  title: string; entityName: string; message: React.ReactNode; confirmLabel?: string
  onConfirm: (reason: string) => Promise<void> | void; onClose: () => void
}) {
  const [typed, setTyped] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const go = async () => {
    setBusy(true); setErr('')
    try { await onConfirm(reason); onClose() }
    catch (e: any) { setErr(e.errors?.[0] || e.message); setBusy(false) }
  }
  return (
    <div className="a-modal-backdrop" onClick={onClose}>
      <div className="a-modal" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        <div className="a-muted a-modal-body">{message}</div>
        <label className="a-label">Type <strong>{entityName}</strong> to confirm</label>
        <input className="a-input" value={typed} onChange={e => setTyped(e.target.value)} />
        <label className="a-label">Reason</label>
        <textarea className="a-input" rows={2} value={reason} onChange={e => setReason(e.target.value)} placeholder="Recorded in the audit log" />
        {err && <p className="a-error">{err}</p>}
        <div className="a-modal-actions">
          <button className="a-btn" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="a-btn a-btn-danger" disabled={busy || typed !== entityName || !reason.trim()} onClick={go}>{busy ? 'Working…' : confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

// ---------- internal notes ----------
export function InternalNotes({ entityType, entityId, notes, perm, onChange }: { entityType: string; entityId: string; notes: any[]; perm: string; onChange: (notes: any[]) => void }) {
  const perms = usePerms()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const add = async () => {
    if (!text.trim()) return
    setBusy(true)
    try { const r = await aapi.post('/notes', { entityType, entityId, content: text }); onChange(r.notes); setText('') }
    finally { setBusy(false) }
  }
  return (
    <Section title="Internal notes">
      {perms.includes(perm) && (
        <div className="a-note-add">
          <textarea className="a-input" rows={2} value={text} onChange={e => setText(e.target.value)} placeholder="Add an internal note (never shown to travellers or partners)" />
          <button className="a-btn a-btn-primary" disabled={busy || !text.trim()} onClick={add}>Add note</button>
        </div>
      )}
      {notes.length === 0 ? <p className="a-muted">No notes yet.</p> : notes.map(n => (
        <div key={n.id} className="a-note"><p>{n.content}</p><div className="a-note-meta a-muted">{n.author || 'Admin'} · {fmtDateTime(n.createdAt)}{n.edited ? ' · edited' : ''}</div></div>
      ))}
    </Section>
  )
}

// ---------- activity timeline ----------
export function ActivityTimeline({ events }: { events: any[] }) {
  return (
    <Section title="Activity & audit history">
      {(!events || events.length === 0) ? <p className="a-muted">No recorded activity yet.</p> : (
        <div className="a-timeline">
          {events.map((e, i) => (
            <div key={i} className="a-tl-item">
              <div className="a-tl-dot" />
              <div className="a-tl-body">
                <strong>{e.label}</strong>
                <span className="a-muted"> · {e.actor || 'system'}</span>
                {e.detail && <div className="a-muted a-small">{e.detail}</div>}
                <div className="a-tl-time a-muted">{fmtDateTime(e.at)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

// ---------- server-side data table with URL-persisted filters ----------
export interface Column<T> { key: string; label: string; sortable?: boolean; render?: (row: T) => React.ReactNode }
// Bulk action applied to the selected row ids (UX audit P0: bulk actions on all lists).
export interface BulkAction { key: string; label: string; danger?: boolean; run: (ids: string[], reason: string) => Promise<void> }
export function DataTable<T extends { id: string }>({ endpoint, columns, filters, rowLink, actions, searchPlaceholder = 'Search…', extraControls, bulkActions, extraParamKeys }: {
  endpoint: string
  columns: Column<T>[]
  filters?: { key: string; label: string; options: { value: string; label: string }[] }[]
  rowLink?: (row: T) => string
  actions?: React.ReactNode
  searchPlaceholder?: string
  extraControls?: React.ReactNode
  bulkActions?: BulkAction[]
  extraParamKeys?: string[]   // extra URL params (e.g. from/to dates) forwarded to the endpoint
}) {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [pendingBulk, setPendingBulk] = useState<BulkAction | null>(null)
  const page = parseInt(params.get('page') || '1')
  const q = params.get('q') || ''
  const sort = params.get('sort') || ''
  const dir = params.get('dir') || 'desc'

  const query = useMemo(() => {
    const o: Record<string, any> = { page, q, sort, dir, pageSize: 20 }
    filters?.forEach(f => { const v = params.get(f.key); if (v) o[f.key] = v })
    extraParamKeys?.forEach(k => { const v = params.get(k); if (v) o[k] = v })
    return qs(o)
  }, [params.toString()])

  const load = () => {
    setLoading(true); setError('')
    aapi.get(`${endpoint}${query}`).then(d => { setData(d); setLoading(false); setSelected(new Set()) }).catch(e => { setError(e.message); setLoading(false) })
  }
  useEffect(() => { load() }, [query])

  const toggleRow = (id: string) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const togglePage = () => setSelected(s => {
    const ids: string[] = (data?.rows || []).map((r: T) => r.id)
    return ids.every(id => s.has(id)) ? new Set() : new Set(ids)
  })
  const hasBulk = !!bulkActions?.length

  const setParam = (k: string, v: string) => { const p = new URLSearchParams(params); v ? p.set(k, v) : p.delete(k); if (k !== 'page') p.delete('page'); setParams(p) }
  const toggleSort = (col: string) => { const p = new URLSearchParams(params); p.set('sort', col); p.set('dir', sort === col && dir === 'desc' ? 'asc' : 'desc'); setParams(p) }

  const activeFilters = filters?.filter(f => params.get(f.key)) || []

  return (
    <div className="a-table-wrap-outer">
      <div className="a-table-controls">
        <input className="a-input a-search" placeholder={searchPlaceholder} defaultValue={q} onKeyDown={e => { if (e.key === 'Enter') setParam('q', (e.target as HTMLInputElement).value) }} />
        {filters?.map(f => (
          <select key={f.key} className="a-input a-filter" value={params.get(f.key) || ''} onChange={e => setParam(f.key, e.target.value)}>
            <option value="">{f.label}: all</option>
            {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
        {extraControls}
        <div className="a-table-controls-right">{actions}</div>
      </div>
      {activeFilters.length > 0 && (
        <div className="a-chips">
          {activeFilters.map(f => <button key={f.key} className="a-chip" onClick={() => setParam(f.key, '')}>{f.label}: {params.get(f.key)} ✕</button>)}
          {q && <button className="a-chip" onClick={() => setParam('q', '')}>“{q}” ✕</button>}
        </div>
      )}

      {hasBulk && selected.size > 0 && (
        <div className="a-bulkbar">
          <strong>{selected.size} selected</strong>
          {bulkActions!.map(a => (
            <button key={a.key} className={`a-btn a-btn-sm ${a.danger ? 'a-btn-danger' : 'a-btn-primary'}`} onClick={() => setPendingBulk(a)}>{a.label}</button>
          ))}
          <button className="a-btn a-btn-sm" onClick={() => setSelected(new Set())}>Clear</button>
        </div>
      )}

      {error ? <ErrorState message={error} onRetry={load} /> : (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                {hasBulk && (
                  <th className="a-check-col">
                    <input type="checkbox" checked={!!data?.rows?.length && data.rows.every((r: T) => selected.has(r.id))} onChange={togglePage} />
                  </th>
                )}
                {columns.map(c => (
                  <th key={c.key} className={c.sortable ? 'a-sortable' : ''} onClick={c.sortable ? () => toggleSort(c.key) : undefined}>
                    {c.label}{c.sortable && sort === c.key && (dir === 'desc' ? ' ↓' : ' ↑')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={columns.length + (hasBulk ? 1 : 0)}><Spinner /></td></tr>
                : data?.rows?.length === 0 ? <tr><td colSpan={columns.length + (hasBulk ? 1 : 0)}><Empty title="Nothing here yet" hint="Try clearing filters." /></td></tr>
                  : data?.rows?.map((row: T) => (
                    <tr key={row.id} className={rowLink ? 'a-row-link' : ''} onClick={rowLink ? () => navigate(rowLink(row)) : undefined}>
                      {hasBulk && (
                        <td className="a-check-col" onClick={e => e.stopPropagation()}>
                          <input type="checkbox" checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} />
                        </td>
                      )}
                      {columns.map(c => <td key={c.key}>{c.render ? c.render(row) : (row as any)[c.key]}</td>)}
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}

      {pendingBulk && (
        <ConfirmDialog
          title={`${pendingBulk.label} — ${selected.size} item${selected.size > 1 ? 's' : ''}`}
          danger={pendingBulk.danger}
          requireReason={pendingBulk.danger}
          confirmLabel={pendingBulk.label}
          message={<>This will apply <strong>{pendingBulk.label.toLowerCase()}</strong> to {selected.size} item{selected.size > 1 ? 's' : ''}. Each change is recorded individually in the audit log.</>}
          onConfirm={async reason => { await pendingBulk.run([...selected], reason); load() }}
          onClose={() => setPendingBulk(null)}
        />
      )}
      {data && data.pages > 1 && (
        <div className="a-pager">
          <button className="a-btn" disabled={page <= 1} onClick={() => setParam('page', String(page - 1))}>← Prev</button>
          <span className="a-muted">Page {data.page} of {data.pages} · {data.total} total</span>
          <button className="a-btn" disabled={page >= data.pages} onClick={() => setParam('page', String(page + 1))}>Next →</button>
        </div>
      )}
    </div>
  )
}

// ---------- date helpers ----------
export function fmtDateTime(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso.replace(' ', 'T') + (iso.endsWith('Z') ? '' : 'Z'))
  return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
export function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso.length === 10 ? iso + 'T00:00:00' : iso.replace(' ', 'T') + (iso.endsWith('Z') ? '' : 'Z'))
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
