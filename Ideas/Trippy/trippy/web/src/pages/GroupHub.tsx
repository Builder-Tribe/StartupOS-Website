import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { api, fmtDate, inr } from '../api'
import { useAuth } from '../App'
import { Avatar, Spinner, UserLink, useToast } from '../components'

// ---- Weather widget (PRD 3.5) ----
function WeatherWidget({ slug }: { slug: string }) {
  const [wx, setWx] = useState<any>(null)
  const [err, setErr] = useState(false)
  useEffect(() => {
    api.get(`/destinations/${slug}/weather`).then(setWx).catch(() => setErr(true))
  }, [slug])
  if (err || !wx) return null
  const c = wx.current
  return (
    <div className="weather-widget">
      <div className="wx-now">
        <span className="wx-emoji">{c.emoji}</span>
        <div>
          <span className="wx-temp">{c.temp}°C</span>
          <span className="wx-label">{c.label}</span>
          <span className="wx-meta">{c.humidity}% humidity · {c.windSpeed} km/h wind</span>
        </div>
      </div>
      <div className="wx-forecast">
        {wx.daily.slice(0, 4).map((d: any) => (
          <div key={d.date} className="wx-day">
            <span className="wx-day-label">{new Date(d.date + 'T12:00:00').toLocaleDateString('en-IN', { weekday: 'short' })}</span>
            <span className="wx-day-emoji">{d.emoji}</span>
            <span className="wx-day-temps">{d.max}° / {d.min}°</span>
            {d.precipitation > 0 && <span className="wx-rain">{d.precipitation}mm</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Document vault (PRD 3.4) ----
const DOC_TYPE_EMOJI: Record<string, string> = {
  'e-ticket': '🎫', 'hotel booking': '🏨', 'permit': '📋', 'flight': '✈️',
  'bus': '🚌', 'train': '🚆', 'visa': '🛂', 'insurance': '🛡️', 'other': '📎',
}
const DOC_TYPES = ['e-ticket', 'hotel booking', 'permit', 'flight', 'bus', 'train', 'visa', 'insurance', 'other']

function DocumentVault({ groupId, isLeader, userId }: { groupId: string; isLeader: boolean; userId: string }) {
  const [docs, setDocs] = useState<any[]>([])
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ docType: 'e-ticket', name: '', refNumber: '', date: '', url: '', notes: '' })
  const [toast, showToast] = useToast()

  const load = () => api.get(`/groups/${groupId}/documents`).then(setDocs).catch(() => {})
  useEffect(() => { load() }, [groupId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post(`/groups/${groupId}/documents`, form)
      setForm({ docType: 'e-ticket', name: '', refNumber: '', date: '', url: '', notes: '' })
      setAdding(false)
      load()
    } catch (err: any) { showToast(err.message) }
  }

  const del = async (docId: string) => {
    await api.del(`/groups/${groupId}/documents/${docId}`)
    load()
  }

  return (
    <div className="card">
      <div className="itin-head">
        <h3>📁 Documents</h3>
        {!adding && <button className="btn btn-secondary small" onClick={() => setAdding(true)}>+ Add document</button>}
        {adding && <button className="btn btn-ghost small" onClick={() => setAdding(false)}>Cancel</button>}
      </div>
      {docs.length === 0 && !adding && (
        <p className="muted small">No documents yet — add e-tickets, booking confirmations, permits, or any link the group needs.</p>
      )}
      {adding && (
        <form onSubmit={submit} className="doc-form">
          <div className="row2">
            <div>
              <label>Type</label>
              <select value={form.docType} onChange={e => setForm({ ...form, docType: e.target.value })}>
                {DOC_TYPES.map(t => <option key={t} value={t}>{DOC_TYPE_EMOJI[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label>Name *</label>
              <input required placeholder="e.g. Delhi–Manali bus ticket" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
          </div>
          <div className="row2">
            <div>
              <label>Reference / booking number</label>
              <input placeholder="e.g. PNR, booking ID" value={form.refNumber} onChange={e => setForm({ ...form, refNumber: e.target.value })} />
            </div>
            <div>
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <label>Link (Google Drive, IRCTC, booking site…)</label>
          <input type="url" placeholder="https://" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
          <label>Notes (optional)</label>
          <input placeholder="e.g. Pick-up at Gate 3, carry print-out" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <button className="btn btn-primary small" type="submit">Save document</button>
        </form>
      )}
      <div className="doc-list">
        {docs.map(doc => (
          <div key={doc.id} className="doc-row">
            <span className="doc-type-icon">{DOC_TYPE_EMOJI[doc.docType] || '📎'}</span>
            <div className="doc-main">
              <div className="doc-name">
                {doc.url
                  ? <a href={doc.url} target="_blank" rel="noopener noreferrer" className="doc-link">{doc.name}</a>
                  : <strong>{doc.name}</strong>}
                {doc.refNumber && <span className="doc-ref">#{doc.refNumber}</span>}
              </div>
              <div className="doc-meta muted small">
                {doc.docType} {doc.date && `· ${fmtDate(doc.date)}`} · added by {doc.addedBy?.name || 'member'}
              </div>
              {doc.notes && <p className="doc-notes tiny muted">{doc.notes}</p>}
            </div>
            {(doc.canDelete || isLeader) && (
              <button className="btn btn-ghost small" onClick={() => del(doc.id)}>✕</button>
            )}
          </div>
        ))}
      </div>
      {toast}
    </div>
  )
}

// ---- Trip photo gallery (PRD 3.11) — URL-based shared album ----
function PhotoGallery({ groupId, isLeader, userId }: { groupId: string; isLeader: boolean; userId: string }) {
  const [photos, setPhotos] = useState<any[]>([])
  const [adding, setAdding] = useState(false)
  const [lightbox, setLightbox] = useState<any>(null)
  const [form, setForm] = useState({ url: '', caption: '', takenAt: '' })
  const [toast, showToast] = useToast()

  const load = () => api.get(`/groups/${groupId}/photos`).then(setPhotos).catch(() => {})
  useEffect(() => { load() }, [groupId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post(`/groups/${groupId}/photos`, form)
      setForm({ url: '', caption: '', takenAt: '' })
      setAdding(false)
      load()
    } catch (err: any) { showToast(err.message) }
  }

  const del = async (photoId: string) => {
    await api.del(`/groups/${groupId}/photos/${photoId}`)
    load()
  }

  return (
    <div className="card">
      <div className="itin-head">
        <h3>📸 Photo Album</h3>
        {!adding && <button className="btn btn-secondary small" onClick={() => setAdding(true)}>+ Add photo</button>}
        {adding && <button className="btn btn-ghost small" onClick={() => setAdding(false)}>Cancel</button>}
      </div>
      {photos.length === 0 && !adding && (
        <p className="muted small">No photos yet — paste a link to any photo hosted on Google Photos, Dropbox, or anywhere on the web to build your shared trip album.</p>
      )}
      {adding && (
        <form onSubmit={submit} className="photo-form">
          <label>Photo URL *</label>
          <input required type="url" placeholder="https://photos.google.com/..." value={form.url}
            onChange={e => setForm({ ...form, url: e.target.value })} />
          <label>Caption (optional)</label>
          <input placeholder="e.g. Sunrise from the summit!" value={form.caption}
            onChange={e => setForm({ ...form, caption: e.target.value })} />
          <label>Date taken (optional)</label>
          <input type="date" value={form.takenAt} onChange={e => setForm({ ...form, takenAt: e.target.value })} />
          <button className="btn btn-primary small" type="submit">Add to album</button>
        </form>
      )}
      {photos.length > 0 && (
        <div className="photo-grid">
          {photos.map(p => (
            <div key={p.id} className="photo-thumb" onClick={() => setLightbox(p)}>
              <img src={p.url} alt={p.caption || 'Trip photo'} loading="lazy"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              {p.caption && <div className="photo-caption-overlay">{p.caption}</div>}
            </div>
          ))}
        </div>
      )}
      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.caption || 'Trip photo'} />
            {lightbox.caption && <p className="lightbox-caption">{lightbox.caption}</p>}
            <div className="lightbox-meta muted small">
              Added by {lightbox.addedBy?.name}{lightbox.takenAt ? ` · ${lightbox.takenAt}` : ''}
            </div>
            <div className="lightbox-actions">
              <a href={lightbox.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost small">↗ Open original</a>
              {(lightbox.canDelete || isLeader) && (
                <button className="btn btn-ghost small" onClick={() => { del(lightbox.id); setLightbox(null) }}>✕ Remove</button>
              )}
              <button className="btn btn-ghost small" onClick={() => setLightbox(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
      {toast}
    </div>
  )
}

// ---- AI Highlights Reel (PRD 3.12) + Social share (PRD 3.13) ----
function HighlightsReel({ groupId, groupName }: { groupId: string; groupName: string }) {
  const [reel, setReel] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [toast, showToast] = useToast()

  useEffect(() => {
    api.get(`/groups/${groupId}/highlights`).then(setReel).catch(() => {})
  }, [groupId])

  const generate = async () => {
    setLoading(true)
    try {
      const result = await api.post(`/groups/${groupId}/highlights`)
      setReel(result)
    } catch (err: any) { showToast(err.message || 'Failed to generate highlights') }
    finally { setLoading(false) }
  }

  const shareStory = async () => {
    if (!reel) return
    const text = `${reel.story}\n\n${reel.caption}`
    if (typeof navigator.share === 'function') {
      try { await navigator.share({ title: `${groupName} — Trip Highlights`, text, url: window.location.href }); return } catch {}
    }
    await navigator.clipboard.writeText(text)
    showToast('Copied! Paste into Instagram, WhatsApp, or Stories 📋')
  }

  return (
    <div className="card">
      <div className="itin-head">
        <h3>✨ Trip Story</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          {reel && <button className="btn btn-ghost small" onClick={shareStory}>↗ Share</button>}
          <button className="btn btn-secondary small" onClick={generate} disabled={loading}>
            {loading ? '…' : reel ? '↺ Regenerate' : '✨ Generate'}
          </button>
        </div>
      </div>
      {!reel && !loading && (
        <p className="muted small">Let AI write a shareable story of your trip — story, key moments, and an Instagram caption ready to post.</p>
      )}
      {loading && <p className="muted small" style={{ textAlign: 'center', padding: '20px 0' }}>✨ Writing your trip story…</p>}
      {reel && !loading && (
        <div className="highlights-reel">
          {reel.aiPowered && <span className="tiny faint" style={{ display: 'block', marginBottom: 8 }}>✨ AI-generated{reel.generatedAt ? ` · ${reel.generatedAt.slice(0, 10)}` : ''}</span>}
          <p className="highlights-story">{reel.story}</p>
          {(reel.moments || []).length > 0 && (
            <div className="highlights-moments">
              {reel.moments.map((m: string, i: number) => (
                <div key={i} className="highlights-moment">⭐ {m}</div>
              ))}
            </div>
          )}
          <div className="highlights-caption-box">
            <span className="tiny faint">Instagram caption</span>
            <p className="highlights-caption">{reel.caption}</p>
            <button className="btn btn-ghost small" onClick={async () => {
              await navigator.clipboard.writeText(reel.caption)
              showToast('Caption copied!')
            }}>Copy caption</button>
          </div>
        </div>
      )}
      {toast}
    </div>
  )
}

function inrFmt(n: number) { return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}` }

function exportExpensesPDF(group: any, expenses: any, me: any) {
  const CAT_LABEL: Record<string, string> = { food: 'Food & drink', transport: 'Transport', accommodation: 'Accommodation', activity: 'Activities', misc: 'Miscellaneous' }
  const byCategory: Record<string, any[]> = {}
  for (const e of expenses.expenses) {
    const cat = e.category || 'misc'
    ;(byCategory[cat] = byCategory[cat] || []).push(e)
  }

  const rows = Object.entries(byCategory).map(([cat, items]) => {
    const total = items.reduce((s: number, e: any) => s + e.amount, 0)
    return `
      <tr class="cat-head"><td colspan="3">${CAT_LABEL[cat] || cat} <span class="cat-total">${inrFmt(total)}</span></td></tr>
      ${items.map((e: any) => `
        <tr>
          <td>${e.description}</td>
          <td>Paid by ${e.paidBy?.name || '—'}</td>
          <td class="amount">${inrFmt(e.amount)}</td>
        </tr>
      `).join('')}
    `
  }).join('')

  const balanceRows = expenses.balances.length === 0
    ? '<tr><td colspan="3" class="settled">All settled up ✓</td></tr>'
    : expenses.balances.map((b: any) => `
        <tr><td colspan="2"><strong>${b.from?.name}</strong> owes <strong>${b.to?.name}</strong></td><td class="amount">${inrFmt(b.amount)}</td></tr>
      `).join('')

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Expenses – ${group.name}</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 640px; margin: 40px auto; color: #1a1a1a; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  .meta { color: #666; font-size: 13px; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  td { padding: 7px 10px; border-bottom: 1px solid #f0f0f0; }
  .cat-head td { background: #f7f7f7; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: #555; padding: 9px 10px 5px; }
  .cat-total { font-weight: 400; float: right; color: #0d9488; }
  .amount { text-align: right; font-variant-numeric: tabular-nums; }
  h2 { font-size: 14px; margin: 28px 0 8px; color: #444; }
  .settled { color: #0d9488; padding: 8px 10px; }
  .summary { display: flex; gap: 24px; margin: 28px 0 0; padding: 16px; background: #f9f9f9; border-radius: 8px; }
  .summary-item label { display: block; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: .05em; }
  .summary-item strong { font-size: 18px; }
  @media print { body { margin: 20px; } }
</style>
</head><body>
<h1>💸 ${group.name} — Expense Summary</h1>
<div class="meta">${group.destination?.replace(/-/g, ' ') || ''}${group.startDate ? ` · ${group.startDate} – ${group.endDate}` : ''} · ${expenses.expenses.length} expenses · Exported ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
<table>${rows}</table>
<h2>Settlement</h2>
<table>${balanceRows}</table>
<div class="summary">
  <div class="summary-item"><label>Total spent</label><strong>${inrFmt(expenses.totalSpend)}</strong></div>
  ${me ? `<div class="summary-item"><label>You paid</label><strong>${inrFmt(expenses.mySpend)}</strong></div>` : ''}
</div>
</body></html>`

  const w = window.open('', '_blank', 'width=700,height=800')
  if (!w) return
  w.document.write(html)
  w.document.close()
  w.onload = () => w.print()
}

export default function GroupHub() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const justCreated = params.get('new') === '1'
  const justJoined = params.get('joined') === '1'
  const { user } = useAuth()
  const [g, setG] = useState<any>(null)
  const [item, setItem] = useState({ day: 1, time: '', title: '', notes: '', cost: '' })
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<any[] | null>(null)
  const [suggestNote, setSuggestNote] = useState('')
  const [connections, setConnections] = useState<any[]>([])
  const [error, setError] = useState('')
  const [announce, setAnnounce] = useState('')
  const [poll, setPoll] = useState<{ question: string; options: string[] } | null>(null)
  const [copied, setCopied] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [showQr, setShowQr] = useState(false)
  const [busyInvite, setBusyInvite] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteFallbackUrl, setInviteFallbackUrl] = useState<string | null>(null)
  const [expenseError, setExpenseError] = useState('')
  const [expenses, setExpenses] = useState<any>(null)
  const [expView, setExpView] = useState<'list' | 'add' | 'settle'>('list')
  const [expForm, setExpForm] = useState({ description: '', amount: '', category: 'food', paidBy: '', splitAmong: [] as string[] })

  const load = () => api.get(`/groups/${id}`).then(setG)
  const loadExpenses = () => api.get(`/groups/${id}/expenses`).then(setExpenses).catch(() => {})
  useEffect(() => {
    load()
    api.get('/connections').then(d => setConnections(d.accepted))
    loadExpenses()
  }, [id])

  if (!g) return <Spinner />

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      // The same form adds new stops and saves edits (PRD 1.5.4: shared AND editable)
      if (editingItem) await api.put(`/groups/${id}/itinerary/${editingItem}`, { ...item, cost: Number(item.cost) || 0 })
      else await api.post(`/groups/${id}/itinerary`, { ...item, cost: Number(item.cost) || 0 })
      setEditingItem(null)
      setItem({ day: item.day, time: '', title: '', notes: '', cost: '' })
      await load()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const startEditItem = (it: any) => {
    setEditingItem(it.id)
    setItem({ day: it.day, time: it.time || '', title: it.title, notes: it.notes || '', cost: it.cost ? String(it.cost) : '' })
  }

  const removeItem = async (itemId: string) => {
    try {
      await api.del(`/groups/${id}/itinerary/${itemId}`)
      await load()
    } catch (err: any) {
      setError(err.message || 'Failed to remove item. Please try again.')
    }
  }

  const suggest = async () => {
    const res = await api.post(`/groups/${id}/suggest-itinerary`)
    setSuggestions(res.suggestions)
    setSuggestNote([res.note, res.budgetAware ? 'Cheapest picks first — most of the group travels on a budget.' : ''].filter(Boolean).join(' · '))
  }

  const acceptSuggestion = async (s: any) => {
    await api.post(`/groups/${id}/itinerary`, s)
    setSuggestions(prev => prev!.filter(x => x !== s))
    await load()
  }

  const addMember = async (userId: string) => {
    setInviteError('')
    setBusyInvite(true)
    try {
      await api.post(`/groups/${id}/members`, { userId })
      await load()
    } catch (err: any) {
      setInviteError(err.message || 'Failed to add member. Please try again.')
    } finally {
      setBusyInvite(false)
    }
  }

  const postAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!announce.trim()) return
    setG(await api.post(`/groups/${id}/announce`, { content: announce.trim() }))
    setAnnounce('')
  }

  const createPoll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!poll) return
    try {
      setG(await api.post(`/groups/${id}/polls`, { question: poll.question, options: poll.options }))
      setPoll(null)
    } catch (err: any) { setError(err.message) }
  }

  const vote = async (pollId: string, option: number) => setG(await api.post(`/groups/${id}/polls/${pollId}/vote`, { option }))
  const closePoll = async (pollId: string) => setG(await api.post(`/groups/${id}/polls/${pollId}/close`))

  const copyInvite = async () => {
    const { code } = await api.get(`/groups/${id}/invite`)
    const url = `${window.location.origin}/join/${code}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      setInviteFallbackUrl(null)
    } catch {
      // Clipboard unavailable (non-HTTPS or permission denied) — show manual copy fallback
      setInviteFallbackUrl(url)
    }
    try {
      const dataUrl = await QRCode.toDataURL(url, { width: 200, margin: 2, color: { dark: '#0d9488', light: '#ffffff' } })
      setQrDataUrl(dataUrl)
      setShowQr(true)
    } catch { /* QR generation failed silently — clipboard copy already done */ }
  }

  const submitExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    setExpenseError('')
    const among = expForm.splitAmong.length ? expForm.splitAmong : g.members.map((m: any) => m.id)
    try {
      await api.post(`/groups/${id}/expenses`, {
        description: expForm.description,
        amount: Number(expForm.amount),
        category: expForm.category,
        paidBy: expForm.paidBy || user?.id,
        splitAmong: among,
      })
      setExpForm({ description: '', amount: '', category: 'food', paidBy: '', splitAmong: [] })
      setExpView('list')
      loadExpenses()
    } catch (err: any) {
      setExpenseError(err.message || 'Failed to add expense. Please try again.')
    }
  }

  const deleteExpense = async (expId: string) => {
    await api.del(`/groups/${id}/expenses/${expId}`)
    loadExpenses()
  }

  const settle = async (fromUser: string, toUser: string, amount: number) => {
    await api.post(`/groups/${id}/expenses/settle`, { fromUser, toUser, amount })
    loadExpenses()
  }

  const CAT_EMOJI: Record<string, string> = { food: '🍽️', transport: '🚌', accommodation: '🏨', activity: '🎯', misc: '🛒' }

  const days: Record<number, any[]> = {}
  for (const it of g.itinerary) (days[it.day] ||= []).push(it)
  const totalCost = g.itinerary.reduce((s: number, it: any) => s + (it.cost || 0), 0)
  const memberIds = new Set(g.members.map((m: any) => m.id))
  const invitable = connections.filter((c: any) => !memberIds.has(c.user.id))
  // Compute trip duration for itinerary day selector. Fall back to 7 if dates are unavailable.
  const tripDays = g.durationDays
    ? g.durationDays
    : g.startDate && g.endDate
      ? Math.max(1, Math.round((Date.parse(g.endDate) - Date.parse(g.startDate)) / 86400000) + 1)
      : 7

  return (
    <div className="fade-up">
      {justCreated && (
        <div className="hub-banner">
          <div className="big-emoji">🎉</div>
          <h1>Your trip is live</h1>
          <p className="muted">You built a full {g.destination?.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())} trip from scratch. Your group now has everything a booked trip gets — chat, shared itinerary, and expense splitting.</p>
        </div>
      )}
      {justJoined && (
        <div className="hub-banner">
          <div className="big-emoji">🎒</div>
          <h1>You're in!</h1>
          <p className="muted">This is the travellers' hub for {g.name} — meet the group in chat, shape the plan, and vote on the calls that matter.</p>
        </div>
      )}
      <div className="group-head">
        <div>
          <h1>👥 {g.name}</h1>
          <p className="muted">
            {g.destination?.replace(/-/g, ' ')}{g.startDate ? ` · ${fmtDate(g.startDate)} – ${fmtDate(g.endDate)}` : ''}
            {g.sourceType && <span className={`hub-source hub-source-${g.sourceType}`}>{g.sourceType === 'partner' ? '✦ Hosted trip' : 'Operator trip'}</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={copyInvite}>{copied ? '✓ Link copied' : '🔗 Invite link'}</button>
          {qrDataUrl && (
            <button className="btn btn-ghost" onClick={() => setShowQr(v => !v)} title="Show QR code">
              {showQr ? 'Hide QR' : '⊞ QR code'}
            </button>
          )}
          <Link to={`/chats/${g.chatId}`} className="btn btn-primary">Group chat 💬</Link>
        </div>
      </div>
      {inviteFallbackUrl && (
        <div className="card" style={{ padding: '12px 16px' }}>
          <p className="small muted" style={{ margin: '0 0 6px' }}>Clipboard not available — copy the link below:</p>
          <input readOnly value={inviteFallbackUrl} onClick={e => (e.target as HTMLInputElement).select()} style={{ fontFamily: 'monospace', fontSize: 13 }} />
        </div>
      )}
      {showQr && qrDataUrl && (
        <div className="qr-invite-panel">
          <img src={qrDataUrl} alt="Invite QR code" width={160} height={160} />
          <div>
            <p className="small"><strong>Scan to join this trip</strong></p>
            <p className="tiny muted">Anyone with this QR code can join the hub — share it in your WhatsApp, stories, or print it for your notice board.</p>
            <button className="btn btn-ghost small" onClick={() => { const a = document.createElement('a'); a.href = qrDataUrl; a.download = `invite-${g.name}.png`; a.click() }}>
              ↓ Download QR
            </button>
          </div>
        </div>
      )}

      {/* Weather widget (PRD 3.5) — shown for trips with a known destination */}
      {g.destination && (
        <div className="card weather-card">
          <h3>🌤️ Weather in {g.destination?.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</h3>
          <WeatherWidget slug={g.destination} />
        </div>
      )}

      {(g.announcements.length > 0 || g.isLeader) && (
        <div className="card announce-card">
          <h3>📣 Announcements</h3>
          {g.announcements.length === 0 && <p className="muted small">Nothing yet — announcements you post land here and in the group chat, pinned.</p>}
          {g.announcements.map((a: any) => (
            <div key={a.id} className="announce-item">
              <div>{a.content}</div>
              <span className="tiny faint">{a.senderName} · {fmtDate(a.createdAt)}</span>
            </div>
          ))}
          {g.isLeader && (
            <form onSubmit={postAnnouncement} className="announce-form">
              <input placeholder="Post an announcement to the whole group…" value={announce} onChange={e => setAnnounce(e.target.value)} />
              <button className="btn btn-primary small">Post</button>
            </form>
          )}
        </div>
      )}

      <div className="card">
        <h3>Members ({g.members.length})</h3>
        <div className="member-row">
          {g.members.map((m: any) => (
            <UserLink key={m.id} user={m}>
              <div className="member-chip">
                <Avatar user={m} size={32} /> {m.name} {m.role === 'leader' && <span className="badge">leader</span>}
              </div>
            </UserLink>
          ))}
        </div>
        {invitable.length > 0 && (
          <>
            <label>Invite connected travelers</label>
            {inviteError && <p className="error small" style={{ margin: '4px 0' }}>{inviteError}</p>}
            <div className="member-picker">
              {invitable.map((c: any) => (
                <button key={c.user.id} className="member-pick" disabled={busyInvite} onClick={() => addMember(c.user.id)}>
                  <Avatar user={c.user} size={28} /> + {c.user.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Document vault (PRD 3.4) — per-hub storage of links, tickets, permits */}
      <DocumentVault groupId={id!} isLeader={g.isLeader} userId={user?.id || ''} />

      {/* Photo album (PRD 3.11) — shared, per-trip URL-based album */}
      <PhotoGallery groupId={id!} isLeader={g.isLeader} userId={user?.id || ''} />

      {/* AI Trip Story + social share (PRD 3.12 + 3.13) */}
      <HighlightsReel groupId={id!} groupName={g.name} />

      <div className="card">
        <div className="itin-head">
          <h3>🗳️ Polls</h3>
          {!poll && <button className="btn btn-secondary small" onClick={() => setPoll({ question: '', options: ['', ''] })}>+ New poll</button>}
        </div>
        {g.polls.length === 0 && !poll && <p className="muted small">Group decisions, settled fairly — "Which day for the trek?", "Hostel A or B?"</p>}
        {poll && (
          <form onSubmit={createPoll} className="poll-form">
            <input required placeholder="Ask the group something…" value={poll.question} onChange={e => setPoll({ ...poll, question: e.target.value })} />
            {poll.options.map((o, i) => (
              <input key={i} required placeholder={`Option ${i + 1}`} value={o}
                onChange={e => setPoll({ ...poll, options: poll.options.map((x, j) => j === i ? e.target.value : x) })} />
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              {poll.options.length < 6 && <button type="button" className="btn btn-ghost small" onClick={() => setPoll({ ...poll, options: [...poll.options, ''] })}>+ Option</button>}
              <button className="btn btn-primary small">Create poll</button>
              <button type="button" className="btn btn-ghost small" onClick={() => setPoll(null)}>Cancel</button>
            </div>
          </form>
        )}
        {g.polls.map((p: any) => (
          <div key={p.id} className={`poll ${p.closed ? 'poll-closed' : ''}`}>
            <div className="poll-q">
              <strong>{p.question}</strong>
              <span className="tiny faint">{p.totalVotes} vote{p.totalVotes === 1 ? '' : 's'}{p.closed ? ' · closed' : ''}</span>
            </div>
            {p.options.map((o: any, i: number) => {
              const pct = p.totalVotes ? Math.round(o.votes / p.totalVotes * 100) : 0
              return (
                <button key={i} className={`poll-opt ${p.myVote === i ? 'mine' : ''}`} disabled={p.closed} onClick={() => vote(p.id, i)}>
                  <span className="poll-bar" style={{ width: `${pct}%` }} />
                  <span className="poll-label">{p.myVote === i ? '● ' : ''}{o.label}</span>
                  <span className="poll-count">{o.votes}</span>
                </button>
              )
            })}
            {!p.closed && (g.isLeader || p.createdBy === user?.id) && (
              <button className="btn btn-ghost small" onClick={() => closePoll(p.id)}>Close poll</button>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="itin-head">
          <h3>💸 Expenses</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            {expView !== 'list' && <button className="btn btn-ghost small" onClick={() => setExpView('list')}>← Back</button>}
            {expView === 'list' && <button className="btn btn-secondary small" onClick={() => { setExpView('add'); setExpForm({ description: '', amount: '', category: 'food', paidBy: user?.id || '', splitAmong: g.members.map((m: any) => m.id) }) }}>+ Add expense</button>}
            {expView === 'list' && expenses?.balances?.length > 0 && <button className="btn btn-ghost small" onClick={() => setExpView('settle')}>Settle up</button>}
            {expView === 'list' && expenses?.expenses?.length > 0 && (
              <button className="btn btn-ghost small" onClick={() => exportExpensesPDF(g, expenses, user)}>↓ Export</button>
            )}
          </div>
        </div>

        {expView === 'list' && expenses && (
          <>
            {expenses.balances.length === 0 ? (
              <p className="muted small" style={{ marginBottom: 10 }}>You're all settled up ✓</p>
            ) : (
              <div className="exp-balances">
                {expenses.balances.map((b: any, i: number) => {
                  const isMyDebt = b.from?.id === user?.id
                  const isMyCredit = b.to?.id === user?.id
                  if (!isMyDebt && !isMyCredit) return null
                  return (
                    <span key={i} className={`exp-balance-chip ${isMyDebt ? 'exp-chip-owe' : 'exp-chip-owed'}`}>
                      {isMyDebt ? `You owe ${b.to?.name} ${inr(b.amount)}` : `${b.from?.name} owes you ${inr(b.amount)}`}
                    </span>
                  )
                })}
              </div>
            )}
            {expenses.expenses.length === 0 && <p className="muted small">No expenses logged yet. Add the first one to start tracking.</p>}
            <div className="exp-list">
              {expenses.expenses.map((e: any) => (
                <div key={e.id} className="exp-row">
                  <span className="exp-cat">{CAT_EMOJI[e.category] || '🛒'}</span>
                  <div className="exp-main">
                    <strong>{e.description}</strong>
                    <span className="muted small">Paid by {e.paidBy?.name} · {e.splitAmong.length} {e.splitAmong.length === 1 ? 'person' : 'people'} · {e.createdAt?.slice(0, 10)}</span>
                  </div>
                  <span className="exp-amount">{inr(e.amount)}</span>
                  {(e.paidBy?.id === user?.id || g.isLeader) && (
                    <button className="btn btn-ghost small" onClick={() => deleteExpense(e.id)}>✕</button>
                  )}
                </div>
              ))}
            </div>
            {expenses.totalSpend > 0 && (
              <div className="exp-summary">
                <span>Total spend: <strong>{inr(expenses.totalSpend)}</strong></span>
                <span>You paid: <strong>{inr(expenses.mySpend)}</strong></span>
                <span className={expenses.myOwed >= 0 ? 'exp-net-positive' : 'exp-net-negative'}>
                  {expenses.myOwed >= 0 ? `Net: you're owed ${inr(expenses.myOwed)}` : `Net: you owe ${inr(Math.abs(expenses.myOwed))}`}
                </span>
              </div>
            )}
          </>
        )}

        {expView === 'add' && (
          <form onSubmit={submitExpense} className="exp-form">
            <input required placeholder="What was this for?" value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} />
            <input required type="number" min="1" placeholder="Amount (₹)" value={expForm.amount} onChange={e => setExpForm({ ...expForm, amount: e.target.value })} />
            <select value={expForm.category} onChange={e => setExpForm({ ...expForm, category: e.target.value })}>
              <option value="food">🍽️ Food</option>
              <option value="transport">🚌 Transport</option>
              <option value="accommodation">🏨 Accommodation</option>
              <option value="activity">🎯 Activity</option>
              <option value="misc">🛒 Other</option>
            </select>
            <select value={expForm.paidBy} onChange={e => setExpForm({ ...expForm, paidBy: e.target.value })}>
              {g.members.map((m: any) => <option key={m.id} value={m.id}>{m.id === user?.id ? `You (${m.name})` : m.name}</option>)}
            </select>
            <div className="exp-split-label">Split among:</div>
            <div className="exp-split-checks">
              {g.members.map((m: any) => (
                <label key={m.id} className="exp-check-label">
                  <input type="checkbox" checked={expForm.splitAmong.includes(m.id)}
                    onChange={ev => setExpForm({ ...expForm, splitAmong: ev.target.checked ? [...expForm.splitAmong, m.id] : expForm.splitAmong.filter(x => x !== m.id) })} />
                  {m.id === user?.id ? `You (${m.name})` : m.name}
                </label>
              ))}
            </div>
            {expenseError && <p className="error small" style={{ marginTop: 4 }}>{expenseError}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button className="btn btn-primary small">Add expense</button>
              <button type="button" className="btn btn-ghost small" onClick={() => { setExpView('list'); setExpenseError('') }}>Cancel</button>
            </div>
          </form>
        )}

        {expView === 'settle' && expenses && (
          <div className="exp-settle-list">
            {expenses.balances.length === 0 && <p className="muted small">All settled up!</p>}
            {expenses.balances.map((b: any, i: number) => (
              <div key={i} className="exp-settle-row">
                <span><strong>{b.from?.name}</strong> owes <strong>{b.to?.name}</strong> <strong>{inr(b.amount)}</strong></span>
                {(b.from?.id === user?.id || b.to?.id === user?.id || g.isLeader) && (
                  <button className="btn btn-secondary small" onClick={() => settle(b.from?.id, b.to?.id, b.amount)}>Mark settled</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="itin-head">
          <h3>Shared itinerary {totalCost > 0 && <span className="muted small">· est. {inr(totalCost)}/person</span>}</h3>
          <button className="btn btn-secondary small" onClick={suggest}>✨ Suggest a plan</button>
        </div>

        {suggestions && suggestions.length === 0 && (
          <p className="muted small">Nothing new to suggest — your plan already covers the highlights here. 🎉</p>
        )}
        {suggestions && suggestions.length > 0 && (
          <div className="suggestions">
            <div className="overline">Suggestions — tap to add (never forced!)</div>
            {suggestNote && <p className="tiny muted" style={{ margin: '2px 0 6px' }}>💡 {suggestNote}</p>}
            {suggestions.map((s, i) => (
              <button key={i} className="suggestion" onClick={() => acceptSuggestion(s)}>
                + Day {s.day} {s.time && `· ${s.time}`} — {s.title} {s.cost ? `(${inr(s.cost)})` : '(free)'}
              </button>
            ))}
          </div>
        )}

        {Object.keys(days).length === 0 && <p className="muted">Nothing planned yet. Add your first stop below, or let AI suggest a starting plan.</p>}
        {Object.keys(days).sort((a, b) => Number(a) - Number(b)).map(day => (
          <div key={day} className="itin-day">
            <div className="itin-day-label">Day {day}</div>
            {days[Number(day)].map((it: any) => (
              <div key={it.id} className="itin-item">
                <span className="itin-time">{it.time || '—'}</span>
                <div className="itin-main">
                  <strong>{it.title}</strong>
                  {it.notes && <div className="muted small">{it.notes}</div>}
                </div>
                {it.cost > 0 && <span className="small">{inr(it.cost)}</span>}
                <button className="btn btn-ghost small" title="Edit" onClick={() => startEditItem(it)}>✎</button>
                <button className="btn btn-ghost small" onClick={() => removeItem(it.id)}>✕</button>
              </div>
            ))}
          </div>
        ))}

        <form onSubmit={addItem} className="itin-form">
          <select value={item.day} onChange={e => setItem({ ...item, day: Number(e.target.value) })}>
            {Array.from({ length: tripDays }, (_, i) => i + 1).map(n => <option key={n} value={n}>Day {n}</option>)}
          </select>
          <input type="time" value={item.time} onChange={e => setItem({ ...item, time: e.target.value })} />
          <input required placeholder="What's the plan?" value={item.title} onChange={e => setItem({ ...item, title: e.target.value })} />
          <input inputMode="numeric" placeholder="₹ cost" value={item.cost} onChange={e => setItem({ ...item, cost: e.target.value.replace(/\D/g, '') })} />
          <button className="btn btn-primary small">{editingItem ? 'Save' : 'Add'}</button>
          {editingItem && <button type="button" className="btn btn-ghost small" onClick={() => { setEditingItem(null); setItem({ day: 1, time: '', title: '', notes: '', cost: '' }) }}>Cancel</button>}
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}
