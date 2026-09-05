import { useEffect, useState } from 'react'
import { aapi } from '../adminApi'
import { PageHeader, Section, Spinner, ErrorState, Can, ConfirmDialog } from '../ui'

export default function RolesPage() {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const load = () => { setError(''); aapi.get('/roles').then(setData).catch(e => setError(e.message)) }
  useEffect(() => { load() }, [])
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!data) return <Spinner />

  const groups = [...new Set(data.permissions.map((p: any) => p.grp))] as string[]
  const startEdit = (role: any) => { setEditing(role.key); setDraft(new Set(role.permissions)) }
  const toggle = (p: string) => { const n = new Set(draft); n.has(p) ? n.delete(p) : n.add(p); setDraft(n) }
  const save = async () => { setBusy(true); try { await aapi.put(`/roles/${editing}/permissions`, { permissions: [...draft] }); setEditing(null); load() } finally { setBusy(false) } }
  const editingRole = editing ? data.roles.find((r: any) => r.key === editing) : null

  return (
    <div className="a-page">
      <PageHeader title="Roles & permissions" subtitle="Configurable RBAC — permissions are enforced server-side. SUPER_ADMIN always has all." />
      {data.roles.map((role: any) => {
        const isEditing = editing === role.key
        const perms = isEditing ? draft : new Set<string>(role.permissions)
        const isSuper = role.key === 'SUPER_ADMIN'
        return (
          <Section key={role.key} title={`${role.label} · ${role.key}`} actions={
            <Can perm="roles.manage">{!isSuper && (isEditing
              ? <><button className="a-btn a-btn-sm a-btn-primary" disabled={busy} onClick={() => setConfirming(true)}>Save</button><button className="a-btn a-btn-sm" onClick={() => setEditing(null)}>Cancel</button></>
              : <button className="a-btn a-btn-sm" onClick={() => startEdit(role)}>Edit permissions</button>)}</Can>
          }>
            <p className="a-muted a-small">{role.description} · {role.userCount} user(s) · {isSuper ? 'all permissions' : `${role.permissions.length} permissions`}</p>
            <div className="a-perm-grid">
              {groups.map(g => (
                <div key={g} className="a-perm-group">
                  <div className="a-perm-group-title">{g}</div>
                  {data.permissions.filter((p: any) => p.grp === g).map((p: any) => {
                    const on = isSuper || perms.has(p.key)
                    return (
                      <label key={p.key} className={`a-perm ${on ? 'a-perm-on' : ''}`}>
                        <input type="checkbox" disabled={!isEditing || isSuper} checked={on} onChange={() => toggle(p.key)} />
                        <span>{p.label}</span>
                      </label>
                    )
                  })}
                </div>
              ))}
            </div>
          </Section>
        )
      })}
      {confirming && editingRole && (
        <ConfirmDialog
          title="Update role permissions"
          message={`Changing permissions for ${editingRole.label} takes effect immediately for ${editingRole.userCount} admin user(s) with this role.`}
          confirmLabel="Save changes"
          danger
          onConfirm={async () => { setConfirming(false); await save() }}
          onClose={() => setConfirming(false)}
        />
      )}
    </div>
  )
}
