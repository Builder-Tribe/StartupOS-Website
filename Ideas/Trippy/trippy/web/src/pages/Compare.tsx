import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, inr, fmtDate } from '../api'
import { useCompare } from '../CompareContext'
import { Spinner } from '../components'

function Md({ text }: { text: string }) {
  // Minimal markdown: **bold**, *italic*, line breaks → paragraphs
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []
  let buf: string[] = []
  const flush = () => {
    if (buf.length) {
      nodes.push(<p key={nodes.length}>{renderInline(buf.join(' '))}</p>)
      buf = []
    }
  }
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) { flush(); continue }
    if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
      flush()
      nodes.push(<h4 key={nodes.length} className="cmp-section-head">{trimmed.slice(2, -2)}</h4>)
    } else if (trimmed.startsWith('- ')) {
      flush()
      nodes.push(<li key={nodes.length}>{renderInline(trimmed.slice(2))}</li>)
    } else {
      buf.push(trimmed)
    }
  }
  flush()
  // Wrap consecutive <li> nodes in a <ul>
  const grouped: React.ReactNode[] = []
  let lis: React.ReactNode[] = []
  for (const n of nodes) {
    if ((n as any)?.type === 'li') { lis.push(n); continue }
    if (lis.length) { grouped.push(<ul key={grouped.length}>{lis}</ul>); lis = [] }
    grouped.push(n)
  }
  if (lis.length) grouped.push(<ul key={grouped.length}>{lis}</ul>)
  return <>{grouped}</>
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>
    if (p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>
    return p
  })
}

function DimRow({ label, values }: { label: string; values: (string | null | undefined)[] }) {
  return (
    <tr className="cmp-row">
      <td className="cmp-dim">{label}</td>
      {values.map((v, i) => <td key={i} className="cmp-cell">{v || <span className="faint">—</span>}</td>)}
    </tr>
  )
}

function AvailBadge({ avail }: { avail: any }) {
  if (avail?.full) return <span className="badge-warn">Full · waitlist</span>
  if (avail?.fillingFast) return <span className="badge-warn">🔥 Filling fast · {avail.seatsLeft} left</span>
  if (avail?.seatsLeft != null) return <span className="badge-open">{avail.seatsLeft} seats left</span>
  return <span className="badge-open">{avail?.label || 'Open'}</span>
}

function ItineraryPanel({ trips }: { trips: any[] }) {
  const maxDays = Math.max(...trips.map(t => t.itinerary?.length ?? 0))
  if (!maxDays) return null
  return (
    <div className="cmp-itin-wrap">
      <h3 className="cmp-section-title">Day-by-day itinerary</h3>
      <div className="cmp-itin-grid" style={{ gridTemplateColumns: `80px repeat(${trips.length}, 1fr)` }}>
        <div className="cmp-itin-hdr">Day</div>
        {trips.map(t => <div key={t.id} className="cmp-itin-hdr">{t.name}</div>)}
        {Array.from({ length: maxDays }, (_, i) => {
          const day = i + 1
          return [
            <div key={`d${day}`} className="cmp-itin-daycell">Day {day}</div>,
            ...trips.map(t => {
              const d = t.itinerary?.find((x: any) => x.day === day)
              return (
                <div key={`${t.id}-${day}`} className="cmp-itin-cell">
                  {d ? (
                    <>
                      <strong>{d.title}</strong>
                      {d.location && <span className="cmp-itin-loc">📍 {d.location}</span>}
                      {d.description && <p className="cmp-itin-desc">{d.description.slice(0, 200)}{d.description.length > 200 ? '…' : ''}</p>}
                      {d.activities?.length > 0 && <div className="cmp-itin-acts">{d.activities.map((a: string) => <span key={a} className="incl-chip">{a}</span>)}</div>}
                      {d.accommodation && <div className="cmp-itin-stay">🏠 {d.accommodation}</div>}
                      {d.meals?.length > 0 && <div className="cmp-itin-meals">🍽 {d.meals.join(', ')}</div>}
                    </>
                  ) : <span className="faint">—</span>}
                </div>
              )
            }),
          ]
        }).flat()}
      </div>
    </div>
  )
}

export default function Compare() {
  const { selected, clear } = useCompare()
  const navigate = useNavigate()
  const [data, setData] = useState<{ trips: any[]; aiNarrative: string; aiPowered: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selected.length) return
    setLoading(true); setError(null); setData(null)
    api.post('/discover/compare', { tripIds: selected.map(t => t.id) })
      .then(setData)
      .catch(e => setError(e.message || 'Could not load comparison'))
      .finally(() => setLoading(false))
  }, [selected.map(t => t.id).join(',')])

  if (!selected.length) {
    return (
      <div className="fade-up" style={{ paddingTop: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>⚖️</div>
        <h2 style={{ marginBottom: 8 }}>Nothing selected to compare</h2>
        <p className="muted">Browse trips and click <strong>+ Compare</strong> on up to 3 trips.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>Browse trips</Link>
      </div>
    )
  }

  return (
    <div className="fade-up compare-page">
      <div className="compare-page-head">
        <button className="back-link" onClick={() => navigate(-1)}>← Back</button>
        <h1>Trip Comparison</h1>
        <button className="compare-bar-clear" onClick={() => { clear(); navigate('/') }}>Clear &amp; start over</button>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: 40 }}><Spinner /></div>}
      {error && <div className="empty-trips" style={{ color: 'var(--coral)' }}>⚠️ {error}</div>}

      {data && (
        <>
          {/* Side-by-side structured table */}
          <div className="cmp-table-wrap">
            <table className="cmp-table">
              <thead>
                <tr>
                  <th className="cmp-dim-hdr">Dimension</th>
                  {data.trips.map(t => (
                    <th key={t.id} className="cmp-trip-hdr">
                      <span className="cmp-trip-kind">{t.kind === 'hosted' ? '✦ Hosted' : 'Operator'}</span>
                      <strong>{t.name}</strong>
                      <span className="cmp-trip-host">{t.operator}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <DimRow label="💰 Price" values={data.trips.map(t => t.price ? inr(t.price) + ' /person' : '—')} />
                <DimRow label="📍 Destination" values={data.trips.map(t => t.destination)} />
                <DimRow label="🗓️ Departure" values={data.trips.map(t => t.startDate ? fmtDate(t.startDate) : 'Flexible')} />
                <DimRow label="⏱ Duration" values={data.trips.map(t => t.durationDays ? `${t.durationDays} days` : '—')} />
                <DimRow label="🚌 Starts from" values={data.trips.map(t => t.startCity || '—')} />
                <DimRow label="🏔️ Difficulty" values={data.trips.map(t => t.difficulty || '—')} />
                <DimRow label="🏷️ Category" values={data.trips.map(t => t.category || t.tags?.join(', ') || '—')} />
                <DimRow label="👥 Group size" values={data.trips.map(t =>
                  t.groupSizeMax ? `Max ${t.groupSizeMax}${t.groupSizeCurrent != null ? ` (${t.groupSizeCurrent} joined)` : ''}` : '—'
                )} />
                <DimRow label="⚧️ Gender mix" values={data.trips.map(t => t.genderRatio || '—')} />
                <DimRow label="⭐ Rating" values={data.trips.map(t => t.rating ? `${t.rating}/5 (${t.reviewCount} reviews)` : 'No ratings')} />
                <tr className="cmp-row">
                  <td className="cmp-dim">🎟️ Availability</td>
                  {data.trips.map(t => (
                    <td key={t.id} className="cmp-cell"><AvailBadge avail={t.availability} /></td>
                  ))}
                </tr>
                <tr className="cmp-row cmp-row-list">
                  <td className="cmp-dim">✅ Inclusions</td>
                  {data.trips.map(t => (
                    <td key={t.id} className="cmp-cell">
                      {t.inclusions?.length ? (
                        <ul className="cmp-incl-list">{t.inclusions.map((x: string) => <li key={x}>{x}</li>)}</ul>
                      ) : <span className="faint">Not listed</span>}
                    </td>
                  ))}
                </tr>
                <tr className="cmp-row cmp-row-list">
                  <td className="cmp-dim">❌ Exclusions</td>
                  {data.trips.map(t => (
                    <td key={t.id} className="cmp-cell">
                      {t.exclusions?.length ? (
                        <ul className="cmp-incl-list cmp-excl">{t.exclusions.map((x: string) => <li key={x}>{x}</li>)}</ul>
                      ) : <span className="faint">Not listed</span>}
                    </td>
                  ))}
                </tr>
                <DimRow label="📋 Cancellation" values={data.trips.map(t => t.cancellationPolicy || '—')} />
              </tbody>
            </table>
          </div>

          {/* Itinerary comparison */}
          <ItineraryPanel trips={data.trips} />

          {/* AI narrative */}
          <div className={`cmp-ai-wrap ${data.aiPowered ? 'cmp-ai-live' : ''}`}>
            <div className="cmp-ai-header">
              <span className="cmp-ai-badge">
                <i className="ph-bold ph-sparkle" />
                {data.aiPowered ? 'AI Analysis by Claude' : 'Quick Summary'}
              </span>
              {!data.aiPowered && (
                <span className="cmp-ai-hint">Set ANTHROPIC_API_KEY for full AI analysis</span>
              )}
            </div>
            <div className="cmp-ai-body">
              <Md text={data.aiNarrative} />
            </div>
          </div>

          {/* Individual trip links */}
          <div className="cmp-trip-links">
            {data.trips.map(t => t.kind === 'hosted' && (
              <Link key={t.id} to={`/trip/${t.id}`} className="btn btn-outline small">
                View {t.name} →
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
