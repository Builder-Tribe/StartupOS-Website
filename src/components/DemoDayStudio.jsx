import React, { useState, useEffect, useRef } from 'react';
import {
  Presentation, Users, Plus, Copy, Check, Sparkles, TrendingUp,
  DollarSign, Target, Globe, BarChart3, Shield, Lightbulb, Rocket,
  Award, Clock, CheckCircle2, Circle, AlertCircle, Edit3, Trash2,
  Star, Play, Pause, RotateCcw, FileText, Building2, X,
  ChevronDown, ChevronUp, Zap
} from 'lucide-react';

// ──────────────────────────────────────────────
// DATA
// ──────────────────────────────────────────────
const SLIDE_TEMPLATES = [
  { id: 'problem',       icon: AlertCircle, color: 'red',     label: '01 · Problem',           headline: 'The Problem We Solve',        prompt: 'Describe the painful problem your target customers face in 1–2 punchy sentences. Include market pain quantification.', placeholder: 'e.g. Founders waste 40% of their dev budget on misaligned AI prompts with no governance layer.', tips: ['Use a real customer story', 'Quantify the pain ($, hours, risk)', 'One problem per slide'] },
  { id: 'solution',      icon: Lightbulb,   color: 'amber',   label: '02 · Solution',           headline: 'Our Solution',                prompt: 'Explain your product in plain English. What does it do? Who is it for? What\'s the aha-moment?', placeholder: 'e.g. StartupOS is a 5-phase AI operating system that turns founders into shipping machines.', tips: ['Show, don\'t tell — describe the demo', 'Lead with the outcome, not the feature', 'One slide, one superpower'] },
  { id: 'market',        icon: Globe,       color: 'blue',    label: '03 · Market Size',         headline: 'Market Opportunity',          prompt: 'State your TAM, SAM, SOM. How big is the prize? Use credible third-party data.', placeholder: 'e.g. $4.2B TAM (AI DevTools 2025). SAM: $680M. SOM: $18M in 24 months.', tips: ['Bottom-up > top-down sizing', 'Name your source', 'Show your math in appendix'] },
  { id: 'product',       icon: Rocket,      color: 'indigo',  label: '04 · Product',             headline: 'Product Deep-Dive',           prompt: 'Walk through the key product screens or workflow. What makes it sticky? What\'s the magic moment?', placeholder: 'e.g. 5-phase builder: Ideate → Build → Test → Ship → Scale. Each phase unlocks the next.', tips: ['Use a product screenshot or workflow diagram', 'Highlight the "wow" moment', 'Show retention hooks'] },
  { id: 'traction',      icon: TrendingUp,  color: 'emerald', label: '05 · Traction',            headline: 'Traction & Validation',       prompt: 'Prove people want this. Revenue, users, MoM growth, LOIs, pilot customers, waitlist, press.', placeholder: 'e.g. 340 early access signups in 3 weeks. 3 pilot LOIs worth $240k ARR.', tips: ['Lead with the most impressive metric', 'Show growth curve, not just a number', 'Named customers > anonymous counts'] },
  { id: 'business_model',icon: DollarSign,  color: 'green',   label: '06 · Business Model',      headline: 'How We Make Money',           prompt: 'Explain your pricing, unit economics, and revenue streams. LTV, CAC, payback period.', placeholder: 'e.g. SaaS: $49/mo Starter, $149/mo Pro, $499/mo Team. LTV: $2,400. CAC: $180. Payback: 4 mo.', tips: ['Keep it to 2–3 tiers max', 'Show LTV:CAC ratio', 'Include expansion revenue path'] },
  { id: 'competition',   icon: Shield,      color: 'violet',  label: '07 · Competition',         headline: 'Competitive Landscape',       prompt: 'Show a 2x2 matrix or comparison table. Why do you win? What\'s your unfair advantage?', placeholder: 'e.g. GitHub Copilot solves autocomplete. Cursor solves IDE. We solve the full founder journey.', tips: ['Never say "no competition"', 'Name your moat (network, data, IP, team)', '2x2 chart is cleaner than a table'] },
  { id: 'gtm',           icon: Target,      color: 'orange',  label: '08 · Go-To-Market',        headline: 'Go-To-Market Strategy',       prompt: 'How will you acquire your first 1,000 customers? Channels, partnerships, playbook.', placeholder: 'e.g. Founder communities → Product Hunt → Dev influencers → Direct outbound to YC alumni.', tips: ['Be specific about channel 1', 'Show CAC by channel', 'Name 2 strategic partnerships'] },
  { id: 'financials',    icon: BarChart3,   color: 'teal',    label: '09 · Financials',          headline: '3-Year Financial Projections', prompt: '3-year P&L summary. Revenue, gross margin, burn rate, path to profitability. Key assumptions.', placeholder: 'e.g. Y1: $180k ARR. Y2: $1.2M ARR. Y3: $4.8M ARR. 72% GM. Profitable in Month 22.', tips: ['Bottom-up your revenue model', 'Show monthly burn clearly', 'Highlight key inflection points'] },
  { id: 'team',          icon: Users,       color: 'pink',    label: '10 · Team',                headline: 'The Dream Team',              prompt: 'Why are YOU the team to win this? Prior exits, domain expertise, technical edge.', placeholder: 'e.g. CEO: 8 yrs enterprise SaaS. CTO: Ex-Flipkart, built ML infra at scale. Advisors: 2 YC partners.', tips: ['Highlight unfair advantages', 'Show domain expertise + execution proof', 'Name advisors/investors if impressive'] },
  { id: 'ask',           icon: DollarSign,  color: 'indigo',  label: '11 · The Ask',             headline: 'We\'re Raising',              prompt: 'How much are you raising, at what terms, and what will you do with it? 18-month milestones.', placeholder: 'e.g. Raising $500k pre-seed. $200k product, $150k GTM, $100k ops, $50k reserve. 18-mo runway.', tips: ['Be specific about use of funds', 'Show 18-month milestones you\'ll hit', 'Include the lead investor if any'] },
  { id: 'vision',        icon: Star,        color: 'amber',   label: '12 · Vision',              headline: 'The Bigger Vision',           prompt: 'Paint the 5-year picture. What does the world look like when you win? Why does this matter?', placeholder: 'e.g. In 5 years, every solo founder has a full-stack AI co-builder team. We\'re the OS for that future.', tips: ['Make it inspiring, not grandiose', 'Connect to a macro trend', 'End on emotion, not numbers'] },
];

const INVESTOR_STAGES = ['prospect', 'contacted', 'meeting_scheduled', 'dd_started', 'term_sheet', 'closed', 'passed'];
const STAGE_COLORS = {
  prospect: 'bg-slate-100 text-slate-700 border-slate-200',
  contacted: 'bg-blue-50 text-blue-700 border-blue-200',
  meeting_scheduled: 'bg-amber-50 text-amber-700 border-amber-200',
  dd_started: 'bg-violet-50 text-violet-700 border-violet-200',
  term_sheet: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-green-100 text-green-800 border-green-300',
  passed: 'bg-red-50 text-red-600 border-red-200',
};
const STAGE_LABELS = {
  prospect: 'Prospect', contacted: 'Contacted', meeting_scheduled: 'Meeting Scheduled',
  dd_started: 'DD Started', term_sheet: 'Term Sheet', closed: '✅ Closed', passed: 'Passed',
};

const PREP_CHECKLIST = [
  { id: 'deck',       label: 'Pitch deck finalised (PDF + Google Slides)', category: 'Deck' },
  { id: 'metrics',    label: 'All metrics double-checked & sourced', category: 'Deck' },
  { id: 'demo',       label: 'Live demo rehearsed ×10 with no crashes', category: 'Demo' },
  { id: 'one_pager',  label: '1-page executive summary printed', category: 'Materials' },
  { id: 'fin_xls',    label: 'Financial model Excel ready to share', category: 'Materials' },
  { id: 'timer',      label: 'Timed full-run: under 7 minutes pitch + 3 min buffer', category: 'Rehearsal' },
  { id: 'qa',         label: 'Top 20 investor Q&As rehearsed aloud', category: 'Rehearsal' },
  { id: 'backup',     label: 'Offline backup of deck on USB + local device', category: 'Logistics' },
  { id: 'linkedin',   label: 'LinkedIn profiles of all founders updated', category: 'Logistics' },
  { id: 'follow_up',  label: 'Follow-up email template drafted & ready', category: 'Logistics' },
  { id: 'cap_table',  label: 'Cap table & SAFE/equity terms confirmed with legal', category: 'Legal' },
  { id: 'nda',        label: 'NDA ready if investor requests', category: 'Legal' },
];

const QA_BANK = [
  { q: 'Why now? What\'s changed in the market?', category: 'Market', difficulty: 'medium' },
  { q: 'What\'s your biggest risk and how do you mitigate it?', category: 'Risk', difficulty: 'hard' },
  { q: 'How will you defend against Google / OpenAI entering this space?', category: 'Competition', difficulty: 'hard' },
  { q: 'What does your CAC look like by channel?', category: 'Financials', difficulty: 'medium' },
  { q: 'What happens if your top 3 customers churn?', category: 'Risk', difficulty: 'hard' },
  { q: 'What\'s your monthly burn and runway post-raise?', category: 'Financials', difficulty: 'easy' },
  { q: 'Why are you the right team to build this?', category: 'Team', difficulty: 'easy' },
  { q: 'What does your path to Series A look like?', category: 'Financials', difficulty: 'medium' },
  { q: 'How do you retain users past month 3?', category: 'Product', difficulty: 'medium' },
  { q: 'Who are your reference customers I can call right now?', category: 'Traction', difficulty: 'easy' },
  { q: 'What\'s your gross margin at scale?', category: 'Financials', difficulty: 'medium' },
  { q: 'Have you considered strategic vs. financial investors?', category: 'Fundraising', difficulty: 'medium' },
  { q: 'What IP or data moat do you have?', category: 'Competition', difficulty: 'hard' },
  { q: 'What\'s the single biggest thing that could kill this company?', category: 'Risk', difficulty: 'hard' },
  { q: 'Why raise this much and not more or less?', category: 'Fundraising', difficulty: 'medium' },
];

const colorMap = {
  red:    { bg: 'bg-red-50',    border: 'border-red-200',    icon: 'text-red-500',    badge: 'bg-red-100 text-red-700' },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-200',  icon: 'text-amber-500',  badge: 'bg-amber-100 text-amber-700' },
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   icon: 'text-blue-500',   badge: 'bg-blue-100 text-blue-700' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-500', badge: 'bg-indigo-100 text-indigo-700' },
  emerald:{ bg: 'bg-emerald-50',border: 'border-emerald-200',icon: 'text-emerald-500',badge: 'bg-emerald-100 text-emerald-700' },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  icon: 'text-green-500',  badge: 'bg-green-100 text-green-700' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-500', badge: 'bg-violet-100 text-violet-700' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-500', badge: 'bg-orange-100 text-orange-700' },
  teal:   { bg: 'bg-teal-50',   border: 'border-teal-200',   icon: 'text-teal-500',   badge: 'bg-teal-100 text-teal-700' },
  pink:   { bg: 'bg-pink-50',   border: 'border-pink-200',   icon: 'text-pink-500',   badge: 'bg-pink-100 text-pink-700' },
};

// ──────────────────────────────────────────────
// PITCH DECK BUILDER
// ──────────────────────────────────────────────
function PitchDeckBuilder() {
  const [slides, setSlides] = useState(() =>
    SLIDE_TEMPLATES.reduce((acc, s) => ({ ...acc, [s.id]: '' }), {})
  );
  const [activeSlide, setActiveSlide] = useState('problem');
  const [copied, setCopied] = useState(false);
  const [expandedTips, setExpandedTips] = useState({});

  const current = SLIDE_TEMPLATES.find(s => s.id === activeSlide);
  const filledCount = Object.values(slides).filter(v => v.trim().length > 0).length;
  const progress = Math.round((filledCount / SLIDE_TEMPLATES.length) * 100);

  const handleCopyAll = () => {
    const text = SLIDE_TEMPLATES
      .map(s => `## ${s.label}: ${s.headline}\n${slides[s.id] || '[Empty]'}`)
      .join('\n\n---\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-5 min-h-[600px]">
      {/* Slide Navigator */}
      <div className="w-52 shrink-0 space-y-1">
        <div className="bg-white border border-slate-200 rounded-2xl p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deck Progress</span>
            <span className="text-xs font-black text-indigo-600">{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] text-slate-500 mt-2">{filledCount} of {SLIDE_TEMPLATES.length} slides filled</p>
        </div>
        {SLIDE_TEMPLATES.map(s => {
          const Icon = s.icon;
          const isFilled = slides[s.id]?.trim().length > 0;
          const isActive = activeSlide === s.id;
          const c = colorMap[s.color] || colorMap.indigo;
          return (
            <button key={s.id} onClick={() => setActiveSlide(s.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer ${isActive ? `${c.bg} ${c.border} border shadow-xs` : 'text-slate-600 hover:bg-slate-50 border border-transparent'}`}>
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? c.icon : 'text-slate-400'}`} />
              <span className={isActive ? 'text-slate-900' : ''}>{s.label}</span>
              {isFilled && <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-auto shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Slide Editor */}
      <div className="flex-1 space-y-4">
        {current && (() => {
          const c = colorMap[current.color] || colorMap.indigo;
          const Icon = current.icon;
          return (
            <>
              <div className={`bg-white border ${c.border} rounded-2xl p-5 flex items-start justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${c.icon}`} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">{current.headline}</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.badge} border ${c.border}`}>{current.label}</span>
                  </div>
                </div>
                <button onClick={handleCopyAll}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Deck</>}
                </button>
              </div>

              <div className={`${c.bg} border ${c.border} rounded-xl p-4`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className={`w-3.5 h-3.5 ${c.icon}`} />
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">AI Prompt Guide</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{current.prompt}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Your Content</label>
                <textarea rows={6} value={slides[current.id]}
                  onChange={e => setSlides(prev => ({ ...prev, [current.id]: e.target.value }))}
                  placeholder={current.placeholder}
                  className="w-full text-sm text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white resize-none transition-all placeholder:text-slate-400" />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-400">{slides[current.id]?.length || 0} characters</span>
                  {slides[current.id]?.trim().length > 0 && (
                    <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Slide filled</span>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4">
                <button onClick={() => setExpandedTips(p => ({ ...p, [current.id]: !p[current.id] }))}
                  className="w-full flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider cursor-pointer">
                  <span className="flex items-center gap-2"><Award className="w-3.5 h-3.5 text-amber-500" /> Investor Tips</span>
                  {expandedTips[current.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {expandedTips[current.id] && (
                  <ul className="mt-3 space-y-2">
                    {current.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{i + 1}</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => { const idx = SLIDE_TEMPLATES.findIndex(s => s.id === current.id); if (idx > 0) setActiveSlide(SLIDE_TEMPLATES[idx - 1].id); }}
                  disabled={SLIDE_TEMPLATES[0].id === current.id}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  ← Previous
                </button>
                <span className="text-xs text-slate-400">{SLIDE_TEMPLATES.findIndex(s => s.id === current.id) + 1} / {SLIDE_TEMPLATES.length}</span>
                <button onClick={() => { const idx = SLIDE_TEMPLATES.findIndex(s => s.id === current.id); if (idx < SLIDE_TEMPLATES.length - 1) setActiveSlide(SLIDE_TEMPLATES[idx + 1].id); }}
                  disabled={SLIDE_TEMPLATES[SLIDE_TEMPLATES.length - 1].id === current.id}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-4 py-2 rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                  Next →
                </button>
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// INVESTOR CRM
// ──────────────────────────────────────────────
function InvestorCRM() {
  const [investors, setInvestors] = useState([
    { id: 1, name: 'Arjun Kapoor', firm: 'Blume Ventures', stage: 'meeting_scheduled', amount: '₹50L', type: 'VC', email: 'arjun@blume.vc', notes: 'Warm intro via Prashant. Interested in AI DevTools.', lastContact: '2026-09-10' },
    { id: 2, name: 'Priya Sharma', firm: 'Angel — Ex-Flipkart CPO', stage: 'contacted', amount: '₹25L', type: 'Angel', email: 'priya.sharma@gmail.com', notes: 'Met at Nasscom Summit. Loves the 4-file governance angle.', lastContact: '2026-09-08' },
    { id: 3, name: 'Rahul Mathur', firm: 'Sequoia Surge', stage: 'prospect', amount: '$250K', type: 'VC', email: 'rahul@surge.vc', notes: 'Cold outreach. Need warm intro via Aniket.', lastContact: '—' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', firm: '', stage: 'prospect', amount: '', type: 'VC', email: '', notes: '', lastContact: '' });

  const resetForm = () => setForm({ name: '', firm: '', stage: 'prospect', amount: '', type: 'VC', email: '', notes: '', lastContact: '' });
  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editId !== null) { setInvestors(prev => prev.map(i => i.id === editId ? { ...form, id: editId } : i)); setEditId(null); }
    else { setInvestors(prev => [...prev, { ...form, id: Date.now() }]); }
    resetForm(); setShowForm(false);
  };
  const handleEdit = (inv) => { setForm(inv); setEditId(inv.id); setShowForm(true); };
  const handleDelete = (id) => setInvestors(prev => prev.filter(i => i.id !== id));
  const handleStageChange = (id, stage) => setInvestors(prev => prev.map(i => i.id === id ? { ...i, stage } : i));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Pipeline', value: investors.length, color: 'text-slate-700', bg: 'bg-white' },
          { label: 'In Progress', value: investors.filter(i => !['prospect','passed','closed'].includes(i.stage)).length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Closed', value: investors.filter(i => i.stage === 'closed').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Passed', value: investors.filter(i => i.stage === 'passed').length, color: 'text-red-500', bg: 'bg-red-50' },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} border border-slate-200 rounded-2xl p-4`}>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900">Investor Pipeline</h3>
        <button onClick={() => { resetForm(); setEditId(null); setShowForm(true); }}
          className="flex items-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl shadow-xs transition-all">
          <Plus className="w-3.5 h-3.5" /> Add Investor
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-indigo-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">{editId !== null ? 'Edit Investor' : 'Add Investor'}</h4>
            <button onClick={() => { setShowForm(false); resetForm(); setEditId(null); }} className="text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'name', label: 'Name', placeholder: 'Arjun Kapoor' },
              { key: 'firm', label: 'Firm / Background', placeholder: 'Blume Ventures' },
              { key: 'email', label: 'Email', placeholder: 'arjun@blume.vc' },
              { key: 'amount', label: 'Expected Check', placeholder: '₹50L / $100K' },
              { key: 'lastContact', label: 'Last Contact', placeholder: '2026-09-13', type: 'date' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{f.label}</label>
                <input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder}
                  className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white transition-all" />
              </div>
            ))}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all">
                {['VC', 'Angel', 'Family Office', 'Corporate VC', 'Govt / Grant'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Stage</label>
            <div className="flex flex-wrap gap-2">
              {INVESTOR_STAGES.map(s => (
                <button key={s} onClick={() => setForm(p => ({ ...p, stage: s }))}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${form.stage === s ? STAGE_COLORS[s] + ' ring-2 ring-offset-1 ring-indigo-400' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {STAGE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any context, mutual connections, prior conversations..."
              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white resize-none transition-all" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setShowForm(false); resetForm(); }} className="text-xs font-semibold text-slate-600 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">Cancel</button>
            <button onClick={handleSave} className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-all">Save</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <span className="col-span-3">Investor</span><span className="col-span-2">Stage</span>
          <span className="col-span-2">Check Size</span><span className="col-span-2">Last Contact</span>
          <span className="col-span-2">Notes</span><span className="col-span-1 text-right">Actions</span>
        </div>
        {investors.length === 0 && <div className="py-12 text-center text-slate-400 text-sm">No investors yet. Add your first one.</div>}
        {investors.map(inv => (
          <div key={inv.id} className="grid grid-cols-12 gap-3 px-4 py-3.5 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors items-start">
            <div className="col-span-3">
              <p className="text-xs font-bold text-slate-900">{inv.name}</p>
              <p className="text-[10px] text-slate-500">{inv.firm}</p>
              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{inv.type}</span>
            </div>
            <div className="col-span-2">
              <select value={inv.stage} onChange={e => handleStageChange(inv.id, e.target.value)}
                className={`text-[10px] font-bold px-2 py-1 rounded-full border cursor-pointer focus:outline-none ${STAGE_COLORS[inv.stage]}`}>
                {INVESTOR_STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="col-span-2 text-xs font-semibold text-slate-700">{inv.amount || '—'}</div>
            <div className="col-span-2 text-[11px] text-slate-500">{inv.lastContact || '—'}</div>
            <div className="col-span-2 text-[10px] text-slate-500 truncate" title={inv.notes}>{inv.notes || '—'}</div>
            <div className="col-span-1 flex items-center justify-end gap-1.5">
              <button onClick={() => handleEdit(inv)} className="text-slate-400 hover:text-indigo-600 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => handleDelete(inv.id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// DEMO DAY PREP
// ──────────────────────────────────────────────
function DemoDayPrep() {
  const [checked, setChecked] = useState({});
  const [timerSeconds, setTimerSeconds] = useState(7 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerInput, setTimerInput] = useState(7);
  const [qaFilter, setQaFilter] = useState('All');
  const [expandedQA, setExpandedQA] = useState({});
  const [qaAnswers, setQaAnswers] = useState({});
  const intervalRef = useRef(null);

  useEffect(() => {
    if (timerRunning) {
      intervalRef.current = setInterval(() => {
        setTimerSeconds(prev => { if (prev <= 1) { clearInterval(intervalRef.current); setTimerRunning(false); return 0; } return prev - 1; });
      }, 1000);
    } else { clearInterval(intervalRef.current); }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning]);

  const resetTimer = () => { clearInterval(intervalRef.current); setTimerRunning(false); setTimerSeconds(timerInput * 60); };
  const completedCount = Object.values(checked).filter(Boolean).length;
  const mins = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
  const secs = (timerSeconds % 60).toString().padStart(2, '0');
  const timerColor = timerSeconds < 60 ? 'text-red-500' : timerSeconds < 120 ? 'text-amber-500' : 'text-emerald-500';
  const categories = ['All', ...Array.from(new Set(QA_BANK.map(q => q.category)))];
  const filteredQA = qaFilter === 'All' ? QA_BANK : QA_BANK.filter(q => q.category === qaFilter);
  const diffColor = { easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' };

  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900">Pre-Demo Day Checklist</h3>
            <span className="text-xs font-black text-indigo-600">{completedCount}/{PREP_CHECKLIST.length}</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${Math.round((completedCount / PREP_CHECKLIST.length) * 100)}%` }} />
          </div>
          {['Deck', 'Demo', 'Materials', 'Rehearsal', 'Logistics', 'Legal'].map(cat => (
            <div key={cat} className="mb-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{cat}</p>
              {PREP_CHECKLIST.filter(c => c.category === cat).map(item => (
                <button key={item.id} onClick={() => setChecked(p => ({ ...p, [item.id]: !p[item.id] }))}
                  className="w-full flex items-start gap-3 py-2 px-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-left group">
                  {checked[item.id] ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> : <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5 group-hover:text-slate-400 transition-colors" />}
                  <span className={`text-xs leading-snug ${checked[item.id] ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-sm font-black text-slate-900 mb-4">Pitch Timer</h3>
          <div className={`text-6xl font-black tabular-nums tracking-tight text-center mb-4 ${timerColor}`}>{mins}:{secs}</div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <button onClick={() => setTimerRunning(r => !r)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${timerRunning ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}>
              {timerRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Start</>}
            </button>
            <button onClick={resetTimer} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Set minutes:</span>
            <input type="number" min={1} max={30} value={timerInput}
              onChange={e => { const v = parseInt(e.target.value) || 1; setTimerInput(v); if (!timerRunning) setTimerSeconds(v * 60); }}
              className="w-16 text-xs font-bold text-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
          </div>
          <p className="text-[10px] text-slate-400 mt-3">💡 YC Demo Day = 2 min · Standard pitch = 7 min · Panel = 15 min</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <h3 className="text-sm font-black text-slate-900 mb-3">Investor Q&A Bank</h3>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {categories.map(cat => (
              <button key={cat} onClick={() => setQaFilter(cat)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${qaFilter === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                {cat}
              </button>
            ))}
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredQA.map((item, i) => (
              <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
                <button onClick={() => setExpandedQA(p => ({ ...p, [i]: !p[i] }))}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer text-left">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full shrink-0 ${diffColor[item.difficulty]}`}>{item.difficulty}</span>
                    <span className="text-xs font-semibold text-slate-800 leading-snug">{item.q}</span>
                  </div>
                  {expandedQA[i] ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />}
                </button>
                {expandedQA[i] && (
                  <div className="px-3.5 pb-3 bg-slate-50 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 font-semibold mt-2 mb-1">Your Answer:</p>
                    <textarea rows={3} value={qaAnswers[i] || ''} onChange={e => setQaAnswers(p => ({ ...p, [i]: e.target.value }))}
                      placeholder="Write your prepared answer here..."
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none text-slate-700 transition-all" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// MAIN EXPORT
// ──────────────────────────────────────────────
export default function DemoDayStudio({ currentUser }) {
  const [activeTab, setActiveTab] = useState('deck');

  const tabs = [
    { id: 'deck', label: '🎯 Pitch Deck Builder', subtitle: '12 AI-guided slides' },
    { id: 'crm',  label: '💼 Investor CRM',        subtitle: 'Track your pipeline' },
    { id: 'prep', label: '🕐 Demo Day Prep',        subtitle: 'Checklist + Timer + Q&A' },
  ];

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-sm">
              <Presentation className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-black text-slate-900">Demo Day Studio</h1>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full uppercase tracking-wider">Investor Deck & CRM</span>
          </div>
          <p className="text-xs text-slate-500 ml-11">Build your pitch deck, manage your investor pipeline, and crush demo day.</p>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Raising</p>
            <p className="text-lg font-black text-emerald-600">₹1.5 Cr</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Round</p>
            <p className="text-lg font-black text-slate-900">Pre-Seed</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-2 flex items-center gap-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
              activeTab === tab.id ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}>
            <span>{tab.label}</span>
            <span className={`text-[9px] font-semibold ${activeTab === tab.id ? 'text-amber-100' : 'text-slate-400'}`}>{tab.subtitle}</span>
          </button>
        ))}
      </div>

      {activeTab === 'deck' && <PitchDeckBuilder />}
      {activeTab === 'crm'  && <InvestorCRM />}
      {activeTab === 'prep' && <DemoDayPrep />}
    </div>
  );
}
