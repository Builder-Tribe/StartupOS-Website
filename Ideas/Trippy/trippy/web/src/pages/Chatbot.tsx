import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, fmtDate, inr } from '../api'
import { useAuth } from '../App'
import { BookModal } from '../BookModal'

// ── Quiz definition ────────────────────────────────────────────────────────
interface QuizOption { label: string; value: string; icon: string }
interface QuizStep { id: string; question: string; sub?: string; options: QuizOption[]; allowOther?: boolean }

const QUIZ_STEPS: QuizStep[] = [
  {
    id: 'vibe',
    question: "What's your travel vibe?",
    sub: 'Pick what best describes this trip',
    options: [
      { label: 'Adventure', value: 'adventure', icon: '⛰️' },
      { label: 'Beach & Chill', value: 'beach', icon: '🏖️' },
      { label: 'Party', value: 'party', icon: '🎉' },
      { label: 'Spiritual', value: 'spiritual', icon: '🧘' },
      { label: 'Cultural', value: 'cultural', icon: '🏛️' },
      { label: 'Backpacking', value: 'backpacking', icon: '🎒' },
    ],
  },
  {
    id: 'budget',
    question: "What's your budget per person?",
    sub: 'All-in including travel, stay & food',
    options: [
      { label: 'Under ₹5,000', value: 'under ₹5000', icon: '💸' },
      { label: '₹5k – ₹10k', value: 'under ₹10000', icon: '💰' },
      { label: '₹10k – ₹20k', value: 'under ₹20000', icon: '💳' },
      { label: '₹20k+', value: 'around ₹25000', icon: '✨' },
    ],
  },
  {
    id: 'days',
    question: 'How many days do you have?',
    options: [
      { label: 'Weekend (2–3d)', value: 'weekend', icon: '📅' },
      { label: 'Short trip (4–5d)', value: '5 days', icon: '🗓️' },
      { label: 'A week', value: 'a week', icon: '📆' },
      { label: '10+ days', value: '10 days', icon: '🌍' },
    ],
  },
  {
    id: 'city',
    question: 'Starting from?',
    options: [
      { label: 'Delhi', value: 'Delhi', icon: '🏙️' },
      { label: 'Mumbai', value: 'Mumbai', icon: '🌆' },
      { label: 'Bangalore', value: 'Bangalore', icon: '🌇' },
      { label: 'Pune', value: 'Pune', icon: '🏘️' },
      { label: 'Chennai', value: 'Chennai', icon: '🌃' },
      { label: 'Hyderabad', value: 'Hyderabad', icon: '🕌' },
      { label: 'Other', value: '__other__', icon: '📍' },
    ],
    allowOther: true,
  },
  {
    id: 'destination',
    question: 'Any destination in mind?',
    sub: 'Or let us surprise you',
    options: [
      { label: 'Manali', value: 'Manali', icon: '🏔️' },
      { label: 'Gokarna', value: 'Gokarna', icon: '🏖️' },
      { label: 'Spiti Valley', value: 'Spiti Valley', icon: '❄️' },
      { label: 'Rishikesh', value: 'Rishikesh', icon: '🛶' },
      { label: 'Kasol', value: 'Kasol', icon: '🏕️' },
      { label: 'Hampi', value: 'Hampi', icon: '🗿' },
      { label: 'Ladakh', value: 'Ladakh', icon: '🦅' },
      { label: 'Varanasi', value: 'Varanasi', icon: '🪔' },
      { label: 'Jaipur', value: 'Jaipur', icon: '🏯' },
      { label: 'Surprise me!', value: 'anywhere', icon: '🎲' },
    ],
  },
]

function compileQuizQuery(answers: Record<string, string>, otherCity: string): string {
  const parts: string[] = []
  if (answers.vibe) parts.push(answers.vibe)
  parts.push('trip')
  const dest = answers.destination || ''
  if (dest && dest !== 'anywhere') parts.push(`to ${dest}`)
  else if (dest === 'anywhere') parts.push('to anywhere')
  if (answers.budget) parts.push(answers.budget)
  if (answers.days) parts.push(`for ${answers.days}`)
  const rawCity = answers.city === '__other__' ? otherCity : (answers.city || '')
  if (rawCity) parts.push(`from ${rawCity}`)
  return parts.join(' ')
}

// ── Quiz panel ─────────────────────────────────────────────────────────────
function QuizPanel({ onSend, onSkip }: { onSend: (q: string) => void; onSkip: () => void }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [otherCity, setOtherCity] = useState('')
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [dynamicDests, setDynamicDests] = useState<any[]>([])
  const otherInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get('/destinations').then((dests: any[]) => {
      if (Array.isArray(dests) && dests.length > 0) {
        setDynamicDests(dests)
      }
    }).catch(() => {})
  }, [])

  const currentStep = QUIZ_STEPS[step]
  const totalSteps = QUIZ_STEPS.length

  // Build dynamic options for destination step using real active trip data
  const stepOptions = useMemo(() => {
    if (currentStep.id !== 'destination') return currentStep.options
    if (!dynamicDests || dynamicDests.length === 0) return currentStep.options

    // Take top active destinations from database
    const topActive = [...dynamicDests]
      .sort((a, b) => (b.activeTripCount || 0) - (a.activeTripCount || 0))
      .slice(0, 8)
      .map(d => ({
        label: d.activeTripCount > 0 ? `${d.name}` : d.name,
        value: d.name,
        icon: d.emoji || '🎒'
      }))

    topActive.push({ label: 'Surprise me!', value: 'anywhere', icon: '🎲' })
    return topActive
  }, [currentStep, dynamicDests])

  const pick = (optValue: string) => {
    if (optValue === '__other__') {
      setShowOtherInput(true)
      setTimeout(() => otherInputRef.current?.focus(), 50)
      return
    }
    const newAnswers = { ...answers, [currentStep.id]: optValue }
    setAnswers(newAnswers)
    if (step < totalSteps - 1) { setStep(s => s + 1); setShowOtherInput(false) }
    else onSend(compileQuizQuery(newAnswers, otherCity))
  }

  const confirmOtherCity = () => {
    if (!otherCity.trim()) return
    const newAnswers = { ...answers, [currentStep.id]: '__other__' }
    setAnswers(newAnswers)
    setShowOtherInput(false)
    if (step < totalSteps - 1) setStep(s => s + 1)
    else onSend(compileQuizQuery(newAnswers, otherCity))
  }

  return (
    <div className="quiz-panel">
      <div className="quiz-progress">
        {QUIZ_STEPS.map((_, i) => (
          <span key={i} className={`quiz-dot ${i < step ? 'done' : i === step ? 'active' : ''}`} />
        ))}
      </div>
      <div className="quiz-question">{currentStep.question}</div>
      {currentStep.sub && <div className="quiz-sub">{currentStep.sub}</div>}
      <div className="quiz-options">
        {stepOptions.map((opt: any) => (
          <button
            key={opt.value}
            className={`quiz-option ${answers[currentStep.id] === opt.value ? 'selected' : ''}`}
            onClick={() => pick(opt.value)}
          >
            <span className="quiz-option-icon">{opt.icon}</span>
            <span className="quiz-option-label">{opt.label}</span>
          </button>
        ))}
      </div>
      {showOtherInput && (
        <div className="quiz-other-row">
          <input
            ref={otherInputRef}
            className="quiz-other-input"
            type="text"
            placeholder="Which city?"
            value={otherCity}
            onChange={e => setOtherCity(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && confirmOtherCity()}
          />
          <button className="quiz-other-confirm" onClick={confirmOtherCity} disabled={!otherCity.trim()}>Go →</button>
        </div>
      )}
      <button className="quiz-skip" onClick={onSkip}>Skip — I'll ask directly</button>
    </div>
  )
}

// ── Starters ───────────────────────────────────────────────────────────────
const STARTERS = [
  'Find me a Spiti Valley trip in September under ₹15,000',
  'Show me 5-day trekking trips from Delhi in August',
  'Cheapest Gokarna trips this weekend',
  'Manali group trips with good gender ratio',
]

// ── Types ──────────────────────────────────────────────────────────────────
interface TravelIntent {
  destination: string | null; maxBudget: number | null; month: number | null
  maxDurationDays: number | null; category: string | null; startCity: string | null; cheapFirst: boolean
}
interface AiTripOption {
  rank: number; destination: string; tagline: string; whyItFits: string[]
  quickPlan: { duration: string; highlights: string[] }
  budgetBreakdown: { travel: string; stay: string; food: string; activities: string; total: string }
  travelEffort: { distanceOrTime: string; ease: 'easy' | 'moderate' | 'tiring' }
  matchedTrip?: any
}
interface AiTripReply {
  summary: string; assumptions: string[]; options: AiTripOption[]; smartInsight: string
}
interface ChatMessage {
  role: 'user' | 'assistant'; text: string; results?: any[]; aiReply?: AiTripReply; loading?: boolean
}

// ── Platform trip card ─────────────────────────────────────────────────────
function ChatTripCard({ r, onBook }: { r: any; onBook?: (trip: any) => void }) {
  const t = r.trip
  const isHosted = r.kind === 'hosted'
  const avail = t.availability
  const full = avail?.full
  const seatsLeft = avail?.seatsLeft
  const availLabel = full ? 'Sold out' : seatsLeft != null && seatsLeft <= 3 ? `${seatsLeft} seats left` : 'Available'
  const availClass = full ? 'badge-closed' : seatsLeft != null && seatsLeft <= 3 ? 'badge-warn' : 'badge-open'

  return (
    <div className="chat-trip-card ctc-platform-match">
      <div className="ctc-platform-label">
        <i className="ph-bold ph-check-circle" /> Available on Trippy
      </div>
      <div className="ctc-top">
        <div className="ctc-meta">
          {isHosted
            ? <span className="ctc-host-chip">✦ {t.hostName || 'Trippy host'}</span>
            : <span className="ctc-op-chip">{t.operator}</span>}
          <span className={`badge ${availClass}`}>{availLabel}</span>
        </div>
        <div className="ctc-title">{t.name || t.title}</div>
        <div className="ctc-sub">
          {t.destination?.replace(/-/g, ' ')}
          {t.startDate ? ` · ${fmtDate(t.startDate)}` : ''}
          {t.durationDays ? ` · ${t.durationDays}d` : ''}
        </div>
      </div>
      <div className="ctc-foot">
        <span className="ctc-price">{t.price != null ? inr(t.price) : 'Price TBD'}</span>
        <div className="ctc-actions">
          {isHosted && t.slug
            ? <Link to={`/trip/${t.slug}`} className="btn btn-primary small">View trip →</Link>
            : onBook && !full
              ? <button className="btn btn-primary small" onClick={() => onBook(t)}>Book trip</button>
              : <span className="ctc-rating">{t.rating ? `⭐ ${t.rating}` : ''}</span>}
        </div>
      </div>
    </div>
  )
}

// ── Ease badge ─────────────────────────────────────────────────────────────
function EaseBadge({ ease }: { ease: 'easy' | 'moderate' | 'tiring' }) {
  const map = { easy: { label: 'Easy', cls: 'ease-easy' }, moderate: { label: 'Moderate', cls: 'ease-moderate' }, tiring: { label: 'Tiring', cls: 'ease-tiring' } }
  const { label, cls } = map[ease] || map.moderate
  return <span className={`ai-ease-badge ${cls}`}>{label}</span>
}

// ── Single AI option card ──────────────────────────────────────────────────
function AiOptionCard({ opt, onBook }: { opt: AiTripOption; onBook?: (trip: any) => void }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="ai-option-card">
      <div className="ai-option-header">
        <span className="ai-option-rank">#{opt.rank}</span>
        <div className="ai-option-header-text">
          <div className="ai-option-dest">{opt.destination}</div>
          <div className="ai-option-tagline">{opt.tagline}</div>
        </div>
      </div>
      <div className="ai-why-row">
        {opt.whyItFits.map((w, i) => (
          <span key={i} className="ai-why-chip"><i className="ph-bold ph-check" /> {w}</span>
        ))}
      </div>
      <div className="ai-section">
        <div className="ai-section-label">
          <i className="ph-bold ph-map-trifold" /> Quick Plan · <span className="ai-plan-duration">{opt.quickPlan.duration}</span>
        </div>
        <ul className="ai-highlights-list">
          {opt.quickPlan.highlights.map((h, i) => <li key={i}>{h}</li>)}
        </ul>
      </div>
      <button className="ai-budget-toggle" onClick={() => setExpanded(e => !e)} aria-expanded={expanded}>
        <span className="ai-budget-toggle-left"><i className="ph-bold ph-currency-inr" /> Budget breakdown</span>
        <span className="ai-budget-total-preview">{opt.budgetBreakdown.total}</span>
        <i className={`ph-bold ${expanded ? 'ph-caret-up' : 'ph-caret-down'} ai-budget-caret`} />
      </button>
      {expanded && (
        <div className="ai-budget-grid">
          {[['✈️ Travel', opt.budgetBreakdown.travel], ['🏠 Stay', opt.budgetBreakdown.stay], ['🍽️ Food', opt.budgetBreakdown.food], ['🎯 Activities', opt.budgetBreakdown.activities]].map(([label, val]) => (
            <div key={label} className="ai-budget-row">
              <span className="ai-budget-label">{label}</span>
              <span className="ai-budget-val">{val}</span>
            </div>
          ))}
          <div className="ai-budget-row ai-budget-total-row">
            <span className="ai-budget-label">Total estimate</span>
            <span className="ai-budget-val ai-budget-total-num">{opt.budgetBreakdown.total}</span>
          </div>
        </div>
      )}
      <div className="ai-effort-row">
        <i className="ph-bold ph-clock" />
        <span className="ai-effort-text">{opt.travelEffort.distanceOrTime}</span>
        <EaseBadge ease={opt.travelEffort.ease} />
      </div>
      {opt.matchedTrip && (
        <div className="ai-matched-trip">
          <ChatTripCard r={opt.matchedTrip} onBook={onBook} />
        </div>
      )}
    </div>
  )
}

// ── Full AI recommendation panel ───────────────────────────────────────────
function AiRecommendationPanel({ aiReply, onBook }: { aiReply: AiTripReply; onBook?: (trip: any) => void }) {
  return (
    <div className="ai-reply-panel">
      {aiReply.assumptions.length > 0 && (
        <div className="ai-assumptions-row">
          <i className="ph-bold ph-info" />
          <span>Assuming: {aiReply.assumptions.join(' · ')}</span>
        </div>
      )}
      <div className="ai-options-list">
        {aiReply.options.map((opt, i) => <AiOptionCard key={i} opt={opt} onBook={onBook} />)}
      </div>
      {aiReply.smartInsight && (
        <div className="ai-smart-insight">
          <div className="ai-insight-header"><i className="ph-bold ph-lightbulb" /><span>Smart insight</span></div>
          <p className="ai-insight-text">{aiReply.smartInsight}</p>
        </div>
      )}
    </div>
  )
}

// ── Assistant bubble ───────────────────────────────────────────────────────
function AssistantBubble({ msg, onBook }: { msg: ChatMessage; onBook?: (trip: any) => void }) {
  return (
    <div className="chat-msg assistant">
      <div className="chat-avatar-ai"><i className="ph-bold ph-sparkle" /></div>
      <div className="chat-content">
        {msg.loading
          ? <div className="chat-bubble loading"><span /><span /><span /></div>
          : <>
              <div className="chat-bubble">{msg.text}</div>
              {msg.aiReply && <AiRecommendationPanel aiReply={msg.aiReply} onBook={onBook} />}
              {!msg.aiReply && msg.results && msg.results.length > 0 && (
                <div className="chat-trip-scroll">
                  {msg.results.map((r: any, i: number) => <ChatTripCard key={i} r={r} onBook={onBook} />)}
                </div>
              )}
            </>
        }
      </div>
    </div>
  )
}

// ── Main chatbot page ──────────────────────────────────────────────────────
export default function Chatbot() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    text: "Hi! Tell me what kind of trip you're looking for — or answer a few quick questions and I'll find the perfect options for you.",
  }])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [intent, setIntent] = useState<TravelIntent | null>(null)
  const [quizDone, setQuizDone] = useState(false)
  const [bookingTrip, setBookingTrip] = useState<any>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || busy) return
    setQuizDone(true)
    setInput('')
    setMessages(prev => [
      ...prev,
      { role: 'user', text: q },
      { role: 'assistant', text: '', loading: true },
    ])
    setBusy(true)
    try {
      const data = await api.post('/discover/chat', { message: q, context: intent ?? undefined })
      setIntent(data.intent)
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', text: data.reply, results: data.results, aiReply: data.aiReply ?? undefined },
      ])
    } catch {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', text: 'Sorry, something went wrong. Try rephrasing your query.' },
      ])
    } finally {
      setBusy(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      text: "Hi! Tell me what kind of trip you're looking for — or answer a few quick questions and I'll find the perfect options for you.",
    }])
    setIntent(null)
    setInput('')
    setQuizDone(false)
  }

  // Called from BookModal after booking — joins the operator trip's group hub.
  const joinHub = async (t: any): Promise<void> => {
    const res = await api.post(`/grouptrips/${t.id}/join`)
    navigate(`/groups/${res.id}?joined=1`)
  }

  // Opens the booking modal; guests are redirected to sign up first.
  const openBook = (t: any) => {
    if (!user) { navigate('/login?mode=signup'); return }
    setBookingTrip(t)
  }

  const showQuiz = messages.length === 1 && !quizDone

  return (
    <div className="chatbot-page">
      <div className="chatbot-header">
        <div className="chatbot-header-left">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">
            <i className="ph-bold ph-arrow-left" />
          </button>
          <div className="chatbot-header-title">
            <span className="chatbot-title-icon"><i className="ph-bold ph-sparkle" /></span>
            <div>
              <div className="chatbot-title">AI Trip Finder</div>
              <div className="chatbot-subtitle">Powered by Trippy Discovery</div>
            </div>
          </div>
        </div>
        <button className="chatbot-clear" onClick={clearChat} title="Start over">
          <i className="ph-bold ph-arrow-counter-clockwise" />
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) =>
          msg.role === 'user' ? (
            <div key={i} className="chat-msg user">
              <div className="chat-bubble">{msg.text}</div>
            </div>
          ) : (
            <AssistantBubble key={i} msg={msg} onBook={openBook} />
          )
        )}

        {showQuiz && (
          <QuizPanel
            onSend={send}
            onSkip={() => {
              setQuizDone(true)
              setTimeout(() => inputRef.current?.focus(), 50)
            }}
          />
        )}

        {!showQuiz && messages.length === 1 && quizDone && (
          <div className="chat-starters">
            <div className="chat-starters-label">Try asking:</div>
            {STARTERS.map((s, i) => (
              <button key={i} className="chat-starter-chip" onClick={() => send(s)}>{s}</button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form className="chat-input-bar" onSubmit={e => { e.preventDefault(); send(input) }}>
        <input
          ref={inputRef}
          className="chat-input"
          type="text"
          placeholder="Ask anything — destination, budget, dates, vibe…"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={busy}
        />
        <button className="chat-send-btn" type="submit" disabled={busy || !input.trim()} aria-label="Send">
          {busy ? <span className="chat-send-busy" /> : <i className="ph-bold ph-paper-plane-tilt" />}
        </button>
      </form>

      {bookingTrip && (
        <BookModal
          trip={bookingTrip}
          user={user}
          onClose={() => setBookingTrip(null)}
          onJoinHub={joinHub}
        />
      )}
    </div>
  )
}
