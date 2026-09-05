import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Routes, Route, NavLink, Navigate, useLocation, useNavigate, Link } from 'react-router-dom'
import { aapi, getAdminToken, setAdminToken } from './adminApi'
import { Spinner } from './ui'
import './admin.css'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import Partners from './pages/Partners'
import PartnerDetail from './pages/PartnerDetail'
import Trips from './pages/Trips'
import TripDetail from './pages/TripDetail'
import Hostels from './pages/Hostels'
import HostelEditor from './pages/HostelEditor'
import HostelDetail from './pages/HostelDetail'
import Travellers from './pages/Travellers'
import TravellerDetail from './pages/TravellerDetail'
import AdminUsers from './pages/AdminUsers'
import RolesPage from './pages/Roles'
import AuditLogs from './pages/AuditLogs'

interface AdminCtx { admin: any; perms: string[]; refresh: () => Promise<void>; signIn: (t: string) => Promise<void>; signOut: () => void }
const Ctx = createContext<AdminCtx>(null!)
export const useAdmin = () => useContext(Ctx)
export const usePerms = () => useContext(Ctx)?.perms || []

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: 'squares-four', perm: 'dashboard.view', end: true },
  { to: '/admin/partners', label: 'Partners', icon: 'handshake', perm: 'partners.view' },
  { to: '/admin/trips', label: 'Trips', icon: 'path', perm: 'trips.view' },
  { to: '/admin/hostels', label: 'Hostels', icon: 'house-line', perm: 'hostels.view' },
  { to: '/admin/travellers', label: 'Travellers', icon: 'users', perm: 'travellers.view' },
]
const ADMIN_NAV = [
  { to: '/admin/admin-users', label: 'Admin Users', perm: 'admin_users.view' },
  { to: '/admin/roles', label: 'Roles & Permissions', perm: 'roles.view' },
  { to: '/admin/audit-logs', label: 'Audit Logs', perm: 'audit_logs.view' },
]

function GlobalSearch() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searched, setSearched] = useState(false)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const timer = useRef<any>()
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    clearTimeout(timer.current)
    if (q.trim().length < 2) { setResults([]); setSearched(false); return }
    timer.current = setTimeout(() => aapi.get(`/search?q=${encodeURIComponent(q)}`).then(d => { setResults(d.results); setSearched(true); setOpen(true) }).catch(() => {}), 250)
  }, [q])
  // Cmd/Ctrl+K focuses global search from anywhere in the console (UX audit P0).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); inputRef.current?.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const go = (r: any) => { setOpen(false); setQ(''); navigate(`/admin/${{ partner: 'partners', trip: 'trips', hostel: 'hostels', traveller: 'travellers' }[r.type as string]}/${r.id}`) }
  return (
    <div className="a-gsearch">
      <input ref={inputRef} className="a-input" placeholder="Search partners, trips, hostels, travellers… (⌘K)" value={q}
        onChange={e => setQ(e.target.value)} onFocus={() => searched && setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} />
      {open && searched && (
        <div className="a-gsearch-results">
          {results.map((r, i) => <button key={i} className="a-gsearch-item" onMouseDown={() => go(r)}><span className="a-gsearch-type">{r.type}</span><span>{r.label}</span><span className="a-muted a-small">{r.sub}</span></button>)}
          {results.length === 0 && <div className="a-gsearch-empty">No results for “{q}” — try a name, email or ID.</div>}
        </div>
      )}
    </div>
  )
}

export default function AdminApp() {
  const [admin, setAdmin] = useState<any>(null)
  const [perms, setPerms] = useState<string[]>([])
  const [loading, setLoading] = useState(!!getAdminToken())
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  const refresh = async () => {
    try { const me = await aapi.get('/me'); setAdmin(me); setPerms(me.permissions || []) }
    catch { setAdminToken(null); setAdmin(null); setPerms([]) }
  }
  useEffect(() => { if (getAdminToken()) refresh().finally(() => setLoading(false)) }, [])
  const signIn = async (t: string) => { setAdminToken(t); await refresh() }
  const signOut = () => { aapi.post('/auth/logout').catch(() => {}); setAdminToken(null); setAdmin(null); setPerms([]) }

  if (loading) return <div className="a-login-wrap"><Spinner /></div>

  if (!admin) return (
    <Ctx.Provider value={{ admin, perms, refresh, signIn, signOut }}>
      <Routes><Route path="*" element={<AdminLogin />} /></Routes>
    </Ctx.Provider>
  )

  const can = (p: string) => perms.includes(p)
  return (
    <Ctx.Provider value={{ admin, perms, refresh, signIn, signOut }}>
      <div className={`a-shell ${collapsed ? 'a-collapsed' : ''}`}>
        <aside className="a-sidebar">
          <div className="a-sidebar-brand">
            <span className="a-logo"><i className="ph-bold ph-compass" /></span>
            {!collapsed && <span className="a-brand-text">Trippy<span className="a-brand-sub">Admin</span></span>}
          </div>
          <nav className="a-nav">
            {NAV.filter(n => can(n.perm)).map(n => (
              <NavLink key={n.to} to={n.to} end={n.end} className="a-nav-item" title={n.label}>
                <span className="a-nav-icon"><i className={`ph-bold ph-${n.icon}`} /></span>{!collapsed && <span>{n.label}</span>}
              </NavLink>
            ))}
            {ADMIN_NAV.some(n => can(n.perm)) && (
              <>
                {!collapsed && <div className="a-nav-group">Administration</div>}
                {ADMIN_NAV.filter(n => can(n.perm)).map(n => (
                  <NavLink key={n.to} to={n.to} className="a-nav-item" title={n.label}>
                    <span className="a-nav-icon"><i className="ph-bold ph-caret-right" style={{ fontSize: 12 }} /></span>{!collapsed && <span>{n.label}</span>}
                  </NavLink>
                ))}
              </>
            )}
          </nav>
          <button className="a-collapse-btn" onClick={() => setCollapsed(c => !c)}>{collapsed ? '»' : '« Collapse'}</button>
        </aside>

        <div className="a-main">
          <header className="a-topbar">
            {can('partners.view') || can('trips.view') || can('hostels.view') || can('travellers.view') ? <GlobalSearch /> : <div />}
            <div className="a-topbar-right">
              <a className="a-topbar-link" href="/" title="Open consumer site">Consumer ↗</a>
              <a className="a-topbar-link" href="/partner" title="Open partner CRM">Partner ↗</a>
              <div className="a-profile">
                <span className="a-profile-name">{admin.name || admin.email}</span>
                <span className="a-profile-role">{admin.roles?.map((r: any) => r.label).join(', ') || 'Admin'}</span>
              </div>
              <button className="a-btn a-btn-sm" onClick={signOut}>Log out</button>
            </div>
          </header>
          <main className="a-content" key={location.pathname}>
            <Routes>
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/partners" element={<Partners />} />
              <Route path="/admin/partners/:id" element={<PartnerDetail />} />
              <Route path="/admin/trips" element={<Trips />} />
              <Route path="/admin/trips/:id" element={<TripDetail />} />
              <Route path="/admin/hostels" element={<Hostels />} />
              <Route path="/admin/hostels/new" element={<HostelEditor />} />
              <Route path="/admin/hostels/:id" element={<HostelDetail />} />
              <Route path="/admin/hostels/:id/edit" element={<HostelEditor />} />
              <Route path="/admin/travellers" element={<Travellers />} />
              <Route path="/admin/travellers/:id" element={<TravellerDetail />} />
              <Route path="/admin/admin-users" element={<AdminUsers />} />
              <Route path="/admin/roles" element={<RolesPage />} />
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
              <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Ctx.Provider>
  )
}
