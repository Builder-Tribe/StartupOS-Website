import { useEffect, useState } from 'react'
import { aapi } from '../adminApi'
import { PageHeader, Section, StatusBadge, Spinner, ErrorState, Can, fmtDate } from '../ui'
import { usePerms } from '../AdminApp'

const ALL_ROLES = ['SUPER_ADMIN', 'FOUNDER', 'OPERATIONS_ADMIN', 'PARTNER_MANAGER', 'TRIP_MANAGER', 'HOSTEL_MANAGER', 'CUSTOMER_SUPPORT', 'ANALYST', 'READ_ONLY_ADMIN']

export default function AdminUsers() {
  const perms = usePerms()
  const [rows, setRows] = useState<any[] | null>(null)
  const [error, setError] = useState('')
  const [inviting, setInviting] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', roles: [] as string[] })

  const load = () => { setError(''); aapi.get('/admin-users').then(d => setRows(d.rows)).catch(e => setError(e.message)) }
  useEffect(() => { load() }, [])
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!rows) return <Spinner />

  const toggleRole = (r: string, set: (rs: string[]) => void, current: string[]) => set(current.includes(r) ? current.filter(x => x !== r) : [...current, r])

  const invite = async () => {
    await aapi.post('/admin-users', form)
    setInviting(false); setForm({ name: '', email: '', password: '', roles: [] }); load()
  }
  const saveRoles = async () => { await aapi.post(`/admin-users/${editing.id}/roles`, { roles: editing.roles }); setEditing(null); load() }
  const toggleStatus = async (u: any) => { await aapi.post(`/admin-users/${u.id}/status`, { action: u.status === 'active' ? 'deactivate' : 'activate' }); load() }

  return (
    <div className="a-page">
      <PageHeader title="Admin users" subtitle="Internal Trippy team members with console access."
        actions={<Can perm="admin_users.invite"><button className="a-btn a-btn-primary" onClick={() => setInviting(true)}>+ Invite admin</button></Can>} />

      {inviting && (
        <Section title="Invite admin user">
          <div className="a-grid2">
            <input className="a-input" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <input className="a-input" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <input className="a-input" type="password" placeholder="Temporary password (8+ chars)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="a-role-picker">{ALL_ROLES.map(r => <button key={r} className={`a-chip ${form.roles.includes(r) ? 'a-chip-on' : ''}`} onClick={() => toggleRole(r, rs => setForm({ ...form, roles: rs }), form.roles)}>{r}</button>)}</div>
          <div className="a-modal-actions"><button className="a-btn" onClick={() => setInviting(false)}>Cancel</button><button className="a-btn a-btn-primary" disabled={!form.email || form.password.length < 8} onClick={invite}>Create admin</button></div>
        </Section>
      )}

      <div className="a-table-wrap">
        <table className="a-table">
          <thead><tr><th>Name</th><th>Email</th><th>Roles</th><th>Status</th><th>Last login</th><th></th></tr></thead>
          <tbody>
            {rows.map(u => (
              <tr key={u.id}>
                <td className="a-cell-strong">{u.name || '—'}</td><td>{u.email}</td>
                <td>{editing?.id === u.id
                  ? <div className="a-role-picker">{ALL_ROLES.map(r => <button key={r} className={`a-chip a-chip-sm ${editing.roles.includes(r) ? 'a-chip-on' : ''}`} onClick={() => setEditing({ ...editing, roles: editing.roles.includes(r) ? editing.roles.filter((x: string) => x !== r) : [...editing.roles, r] })}>{r}</button>)}</div>
                  : (u.roles.map((r: string) => <span key={r} className="a-badge a-badge-info a-role-tag">{r}</span>))}</td>
                <td><StatusBadge status={u.status} /></td>
                <td className="a-small">{fmtDate(u.lastLoginAt)}</td>
                <td className="a-row-actions">
                  {editing?.id === u.id
                    ? <><button className="a-btn a-btn-sm a-btn-primary" onClick={saveRoles}>Save</button><button className="a-btn a-btn-sm" onClick={() => setEditing(null)}>Cancel</button></>
                    : <>
                      <Can perm="admin_users.roles.manage"><button className="a-btn a-btn-sm" onClick={() => setEditing({ id: u.id, roles: [...u.roles] })}>Roles</button></Can>
                      <Can perm="admin_users.deactivate"><button className="a-btn a-btn-sm" onClick={() => toggleStatus(u)}>{u.status === 'active' ? 'Deactivate' : 'Activate'}</button></Can>
                    </>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!perms.includes('admin_users.roles.manage') && <p className="a-muted a-small">You can view admin users but not change roles.</p>}
    </div>
  )
}
