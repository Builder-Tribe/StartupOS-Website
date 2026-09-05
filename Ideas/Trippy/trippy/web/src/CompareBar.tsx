import { useNavigate } from 'react-router-dom'
import { useCompare } from './CompareContext'
import { inr } from './api'

export default function CompareBar() {
  const { selected, remove, clear } = useCompare()
  const navigate = useNavigate()
  if (!selected.length) return null

  return (
    <div className="compare-bar">
      <div className="compare-bar-slots">
        {selected.map(t => (
          <div key={t.id} className="compare-bar-chip">
            <span className="compare-bar-name">{t.name}</span>
            {t.price != null && <span className="compare-bar-price">{inr(t.price)}</span>}
            <button className="compare-bar-x" onClick={() => remove(t.id)} aria-label={`Remove ${t.name}`}>×</button>
          </div>
        ))}
        {selected.length < 3 && (
          <div className="compare-bar-empty">
            <span>+{3 - selected.length} more</span>
          </div>
        )}
      </div>
      <div className="compare-bar-actions">
        {selected.length >= 2 ? (
          <button className="btn btn-primary small" onClick={() => navigate('/compare')}>
            <i className="ph-bold ph-arrows-left-right" /> Compare {selected.length} trips
          </button>
        ) : (
          <span className="compare-bar-hint">Select 2–3 trips</span>
        )}
        <button className="compare-bar-clear" onClick={clear} title="Clear all">Clear</button>
      </div>
    </div>
  )
}
