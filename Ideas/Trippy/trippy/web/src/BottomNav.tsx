import { useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { api } from './api'

// Mobile bottom nav (UX audit P0): 5 tabs, shown ≤760px via CSS; the desktop
// topnav is unchanged. The centre "+" opens an intuitive, compact quick-action grid.
export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [requestCount, setRequestCount] = useState(0)

  useEffect(() => {
    api.get('/home').then(d => setRequestCount(d.pendingIncoming || 0)).catch(() => {})
  }, [location.pathname])

  if (location.pathname.startsWith('/chats/')) return null

  const go = (to: string) => { setSheetOpen(false); navigate(to) }

  return (
    <>
      <nav className="bnav" aria-label="Primary">
        <NavLink to="/" end className="bnav-item">
          <i className="ph-bold ph-compass bnav-icon" />
          <span className="bnav-label">Discover</span>
        </NavLink>
        <NavLink to="/mytrips" className="bnav-item">
          <i className="ph-bold ph-suitcase-rolling bnav-icon" />
          <span className="bnav-label">My Trips</span>
        </NavLink>
        <button className="bnav-item bnav-fab-wrap" onClick={() => setSheetOpen(true)} aria-label="Quick actions">
          <span className="bnav-fab"><i className="ph-bold ph-plus" /></span>
        </button>
        <NavLink to="/chats" className="bnav-item">
          <i className="ph-bold ph-chat-circle bnav-icon" />
          <span className="bnav-label">Chats</span>
        </NavLink>
        <NavLink to="/profile" className="bnav-item">
          <i className="ph-bold ph-user-circle bnav-icon" />
          <span className="bnav-label">Profile</span>
        </NavLink>
      </nav>

      {sheetOpen && (
        <div className="sheet-backdrop" onClick={() => setSheetOpen(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <div className="sheet-header">
              <div className="sheet-handle" />
              <button className="sheet-close-btn" onClick={() => setSheetOpen(false)} aria-label="Close">✕</button>
            </div>
            <div className="sheet-title">Plan & Explore</div>

            {/* Intuitive 2x2 Action Grid */}
            <div className="sheet-grid">
              <button className="sheet-grid-card" onClick={() => go('/chat')}>
                <span className="sheet-grid-icon" style={{ background: 'var(--indigo-soft, #eef0ff)', color: 'var(--indigo-500, #6366f1)' }}>
                  <i className="ph-bold ph-sparkle" />
                </span>
                <span className="sheet-grid-label">AI Trip Finder</span>
                <span className="sheet-grid-sub">Ask AI for ideas</span>
              </button>

              <button className="sheet-grid-card" onClick={() => go('/adventures')}>
                <span className="sheet-grid-icon" style={{ background: 'var(--brand-soft)', color: 'var(--brand-dark)' }}>
                  <i className="ph-bold ph-motorcycle" />
                </span>
                <span className="sheet-grid-label">Bike & Road Trips</span>
                <span className="sheet-grid-sub">Rides & carpooling</span>
              </button>

              <button className="sheet-grid-card" onClick={() => go('/diy')}>
                <span className="sheet-grid-icon" style={{ background: 'var(--coral-soft, #fff0ed)', color: 'var(--coral, #e8603c)' }}>
                  <i className="ph-bold ph-path" />
                </span>
                <span className="sheet-grid-label">Build DIY Trip</span>
                <span className="sheet-grid-sub">Custom group trip</span>
              </button>

              <button className="sheet-grid-card" onClick={() => go('/')}>
                <span className="sheet-grid-icon" style={{ background: 'var(--brand-soft)', color: 'var(--brand-dark)' }}>
                  <i className="ph-bold ph-magnifying-glass" />
                </span>
                <span className="sheet-grid-label">Hosted Trips</span>
                <span className="sheet-grid-sub">Community trips</span>
              </button>
            </div>

            {/* Compact Secondary Quick Links */}
            <div className="sheet-section-title">Community & Discovery</div>
            <div className="sheet-quick-list">
              <button className="sheet-compact-item" onClick={() => go('/matches')}>
                <span className="sheet-compact-icon"><i className="ph-bold ph-users" /></span>
                <span>Companions</span>
                {requestCount > 0 && <span className="sheet-badge">{requestCount}</span>}
              </button>

              <button className="sheet-compact-item" onClick={() => go('/hostels')}>
                <span className="sheet-compact-icon"><i className="ph-bold ph-house-line" /></span>
                <span>Hostels</span>
              </button>

              <button className="sheet-compact-item" onClick={() => go('/stories')}>
                <span className="sheet-compact-icon"><i className="ph-bold ph-book-open" /></span>
                <span>Stories</span>
              </button>

              <button className="sheet-compact-item" onClick={() => go('/stories/new')}>
                <span className="sheet-compact-icon"><i className="ph-bold ph-pencil-line" /></span>
                <span>Write Story</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
