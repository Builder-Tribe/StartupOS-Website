import React, { useState, useEffect } from 'react';
import { 
  Users, Sparkles, Search, Filter, Plus, ExternalLink, Github, Linkedin, 
  Twitter, ShieldCheck, CheckCircle2, MessageSquare, Handshake, ArrowRight,
  Briefcase, Code2, Compass, Layers, Zap, X, Clock, Award, Star, Check
} from 'lucide-react';

export default function CoBuilderStudio({ currentUser, onNavigateToIdeaLab, onOpenSpecStudio }) {
  const [cobuilders, setCobuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [commitmentFilter, setCommitmentFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Interactive States
  const [showPostModal, setShowPostModal] = useState(false);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [pitchSuccess, setPitchSuccess] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [aiMatchActive, setAiMatchActive] = useState(false);
  const [mySkillNeed, setMySkillNeed] = useState('growth'); // 'technical' | 'growth' | 'design' | 'domain'

  // Post Listing Form State
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    avatar: currentUser?.avatar || '👩‍💻',
    role: 'AI Systems Architect & Full-Stack Engineer',
    category: 'technical',
    headline: '',
    bio: '',
    skills: '',
    primaryStack: 'AntiGravity / Claude Code / Next.js',
    seekingRole: 'B2B GTM & Sales Co-Founder',
    seekingDescription: '',
    commitment: 'full_time',
    stage: 'parity_verified',
    equityExpectation: 'Equal 50/50 Equity',
    location: 'Remote',
    githubUrl: '',
    linkedinUrl: '',
    twitterUrl: ''
  });

  // Pitch Connection Form State
  const [pitchForm, setPitchForm] = useState({
    projectName: '',
    roleOffered: 'Technical Co-Founder',
    equityOffered: 'Equal 50/50 Equity',
    projectUrl: '',
    pitchMessage: ''
  });

  const fetchCobuilders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cobuilders');
      if (res.ok) {
        const data = await res.json();
        setCobuilders(data);
      }
    } catch (err) {
      console.error('Failed to fetch co-builders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCobuilders();
  }, []);

  const handlePostListing = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.headline.trim()) {
      setErrorMsg('Name and headline are required.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/cobuilders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          id: currentUser?.id ? `cobuilder-${currentUser.id}` : undefined
        })
      });
      if (res.ok) {
        setPostSuccess(true);
        setTimeout(() => {
          setPostSuccess(false);
          setShowPostModal(false);
        }, 1200);
        await fetchCobuilders();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to publish listing.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error connecting to server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendPitch = async (e) => {
    e.preventDefault();
    if (!pitchForm.projectName.trim() || !pitchForm.pitchMessage.trim()) {
      setErrorMsg('Project name and pitch message are required.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/cobuilders/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientId: selectedBuilder.id,
          recipientName: selectedBuilder.name,
          senderId: currentUser?.id || 'guest',
          senderName: currentUser?.name || 'Vibe Builder',
          senderEmail: currentUser?.email || 'builder@startupos.dev',
          ...pitchForm
        })
      });

      if (res.ok) {
        setPitchSuccess(true);
        setTimeout(() => {
          setPitchSuccess(false);
          setShowPitchModal(false);
          setPitchForm({
            projectName: '',
            roleOffered: 'Technical Co-Founder',
            equityOffered: 'Equal 50/50 Equity',
            projectUrl: '',
            pitchMessage: ''
          });
        }, 1500);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to send pitch proposal.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCobuilders = cobuilders.filter((b) => {
    if (roleFilter !== 'all' && b.category !== roleFilter) return false;
    if (commitmentFilter !== 'all' && b.commitment !== commitmentFilter) return false;
    if (stageFilter !== 'all' && b.stage !== stageFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.name.toLowerCase().includes(q);
      const matchRole = b.role.toLowerCase().includes(q);
      const matchHeadline = b.headline.toLowerCase().includes(q);
      const matchSkills = b.skills && b.skills.some(s => s.toLowerCase().includes(q));
      if (!matchName && !matchRole && !matchHeadline && !matchSkills) return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header & Matchmaker Hero */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Users className="w-8 h-8 text-indigo-600" />
              <span>Founder & Co-Builder Match Directory</span>
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              PRD Phase 6
            </span>
          </div>
          <p className="text-slate-600 text-sm font-medium mt-1 max-w-3xl leading-relaxed">
            Connect with high-velocity AI builders, full-stack engineers, UI/UX architects, and GTM co-founders. Matched on 4-file constitution parity, complementary skills, and verified build velocity.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
          <button
            onClick={() => setAiMatchActive(!aiMatchActive)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs cursor-pointer ${
              aiMatchActive 
                ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400/30' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Matchmaker {aiMatchActive ? 'Active' : ''}</span>
          </button>
          <button
            onClick={() => setShowPostModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Post Co-Builder Listing</span>
          </button>
        </div>
      </div>

      {/* AI Compatibility Matchmaker Assistant Drawer */}
      {aiMatchActive && (
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 space-y-4 shadow-xl border border-indigo-500/30 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">AI Complementary Skill Matching Engine</h3>
            </div>
            <button 
              onClick={() => setAiMatchActive(false)}
              className="text-indigo-300 hover:text-white text-xs font-semibold cursor-pointer"
            >
              ✕ Close Assistant
            </button>
          </div>
          <p className="text-xs text-indigo-200 leading-relaxed max-w-2xl">
            Tell StartupOS what superpower you bring, and our algorithm will highlight the most complementary co-founders with <strong>high mutual parity scores</strong>:
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-indigo-300 mr-2">I am looking for:</span>
            {[
              { id: 'growth', label: '🚀 Growth & B2B GTM Lead' },
              { id: 'technical', label: '💻 AI Full-Stack Engineer' },
              { id: 'design', label: '🎨 UI/UX Design Architect' },
              { id: 'domain', label: '🧠 Domain & Industry Founder' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => {
                  setMySkillNeed(pill.id);
                  setRoleFilter(pill.id);
                }}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  mySkillNeed === pill.id
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md font-extrabold'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Matrix */}
      <div className="space-y-4">
        {/* Search Bar & Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search co-founders by skills (FastAPI, React 19, B2B), role, or name..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs text-slate-800"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={commitmentFilter}
              onChange={(e) => setCommitmentFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs cursor-pointer"
            >
              <option value="all">All Commitments (Full/Part)</option>
              <option value="full_time">Full-Time (40h/wk)</option>
              <option value="part_time">Part-Time (20h/wk)</option>
              <option value="hackathons">Nights & Weekends</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs cursor-pointer"
            >
              <option value="all">All Venture Stages</option>
              <option value="ideation">Early Ideation</option>
              <option value="prototype">Prototype / Validation</option>
              <option value="parity_verified">Parity-Verified MVP</option>
              <option value="scaling">Scaling / Revenue</option>
            </select>
          </div>
        </div>

        {/* Role Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 bg-white/70 backdrop-blur-xs p-2 rounded-2xl border border-slate-200/80">
          {[
            { id: 'all', label: 'All Roles', count: cobuilders.length },
            { id: 'technical', label: '💻 AI & Tech Engineers', count: cobuilders.filter(c => c.category === 'technical').length },
            { id: 'growth', label: '🚀 Product & GTM Leads', count: cobuilders.filter(c => c.category === 'growth').length },
            { id: 'design', label: '🎨 UI/UX Design Architects', count: cobuilders.filter(c => c.category === 'design').length },
            { id: 'domain', label: '🧠 Domain & Industry Founders', count: cobuilders.filter(c => c.category === 'domain').length }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setRoleFilter(item.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                roleFilter === item.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>
      </div>

      {/* Co-Builder Cards Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400 font-medium text-xs animate-pulse">
          Loading verified co-builder profiles...
        </div>
      ) : filteredCobuilders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto text-xl">
            <Users className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Co-Builders Match This Filter</h3>
            <p className="text-xs text-slate-500">Try adjusting your role or commitment filter, or be the first to post a listing!</p>
          </div>
          <button
            onClick={() => {
              setRoleFilter('all');
              setCommitmentFilter('all');
              setStageFilter('all');
              setSearchQuery('');
            }}
            className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCobuilders.map((builder) => (
            <div
              key={builder.id}
              className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 space-y-5 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-100 to-violet-100 border border-indigo-200/80 flex items-center justify-center text-2xl shadow-2xs">
                      {builder.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900">{builder.name}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> {builder.badge}
                        </span>
                      </div>
                      <p className="text-xs text-indigo-600 font-semibold">{builder.role}</p>
                      <span className="text-[10px] text-slate-400 font-medium">{builder.location}</span>
                    </div>
                  </div>

                  {/* Compatibility Score */}
                  <div className="flex flex-col items-end shrink-0">
                    <div className="px-2.5 py-1 rounded-xl text-xs font-black bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{builder.compatibilityScore || 95}% MATCH</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium mt-0.5">Complementary Fit</span>
                  </div>
                </div>

                {/* Headline & Bio */}
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-800 leading-snug">{builder.headline}</p>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{builder.bio}</p>
                </div>

                {/* Seeking Box (The Deal) */}
                <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Handshake className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Seeking:</span>
                      <strong className="text-indigo-900">{builder.seekingRole}</strong>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                      {builder.commitmentLabel}
                    </span>
                  </div>
                  {builder.seekingDescription && (
                    <p className="text-[11px] text-slate-600 leading-relaxed">{builder.seekingDescription}</p>
                  )}
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                    <span><strong>Stage:</strong> {builder.stageLabel}</span>
                    <span><strong>Split:</strong> {builder.equityExpectation}</span>
                  </div>
                </div>

                {/* Incubated Projects in StartupOS */}
                {builder.projects && builder.projects.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Incubated Products & Track Record
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {builder.projects.map((p, idx) => (
                        <a
                          key={idx}
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 transition-colors"
                        >
                          <span>{p.name}</span>
                          <span className="text-[9px] text-slate-500 font-normal">({p.role})</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {builder.skills && builder.skills.map((skill, sIdx) => (
                    <span key={sIdx} className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  {builder.githubUrl && (
                    <a href={builder.githubUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 transition-colors">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {builder.linkedinUrl && (
                    <a href={builder.linkedinUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-indigo-600 transition-colors">
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {builder.twitterUrl && (
                    <a href={builder.twitterUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-500 transition-colors">
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedBuilder(builder);
                    setShowPitchModal(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Pitch Co-Founder / Connect</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PITCH COLLABORATION MODAL */}
      {showPitchModal && selectedBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-xl">
                  {selectedBuilder.avatar}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pitch {selectedBuilder.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">Propose co-founder collaboration on your AI venture</p>
                </div>
              </div>
              <button
                onClick={() => setShowPitchModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendPitch} className="p-6 space-y-4">
              {pitchSuccess ? (
                <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200 animate-fade-in">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-900">Collaboration Pitch Sent!</h4>
                  <p className="text-xs text-emerald-700">
                    {selectedBuilder.name} has been notified of your co-founder proposal.
                  </p>
                </div>
              ) : (
                <>
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
                      {errorMsg}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Your Venture / Product Name *</label>
                    <input
                      type="text"
                      required
                      value={pitchForm.projectName}
                      onChange={(e) => setPitchForm({ ...pitchForm, projectName: e.target.value })}
                      placeholder="e.g. Acme AI, VocalFlow, AutoSpec"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Role Offered</label>
                      <input
                        type="text"
                        value={pitchForm.roleOffered}
                        onChange={(e) => setPitchForm({ ...pitchForm, roleOffered: e.target.value })}
                        placeholder="Technical Co-Founder"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Equity / Terms</label>
                      <input
                        type="text"
                        value={pitchForm.equityOffered}
                        onChange={(e) => setPitchForm({ ...pitchForm, equityOffered: e.target.value })}
                        placeholder="Equal 50/50 Equity"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">PRD / Demo / GitHub URL (Optional)</label>
                    <input
                      type="url"
                      value={pitchForm.projectUrl}
                      onChange={(e) => setPitchForm({ ...pitchForm, projectUrl: e.target.value })}
                      placeholder="https://github.com/my-project or demo link"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Personal Pitch Message *</label>
                    <textarea
                      required
                      rows={4}
                      value={pitchForm.pitchMessage}
                      onChange={(e) => setPitchForm({ ...pitchForm, pitchMessage: e.target.value })}
                      placeholder="Explain what problem you are solving, why your skillsets complement each other, and the next milestones..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPitchModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? 'Sending Pitch...' : 'Send Co-Founder Pitch →'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* POST CO-BUILDER LISTING MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Post Co-Builder Profile</h3>
                  <p className="text-xs text-slate-500 font-medium">List yourself in the StartupOS Co-Founder Match Directory</p>
                </div>
              </div>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePostListing} className="p-6 space-y-4 overflow-y-auto">
              {postSuccess ? (
                <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-900">Co-Builder Profile Published!</h4>
                  <p className="text-xs text-emerald-700">Your profile is now discoverable in the directory.</p>
                </div>
              ) : (
                <>
                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                      >
                        <option value="technical">💻 AI & Full-Stack Engineer</option>
                        <option value="growth">🚀 Product & GTM Lead</option>
                        <option value="design">🎨 UI/UX Design Architect</option>
                        <option value="domain">🧠 Domain & Industry Founder</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Role Title *</label>
                    <input
                      type="text"
                      required
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      placeholder="e.g. Lead AI Systems Engineer"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Elevator Headline *</label>
                    <input
                      type="text"
                      required
                      value={form.headline}
                      onChange={(e) => setForm({ ...form, headline: e.target.value })}
                      placeholder="Building autonomous agent reasoning & B2B developer tooling"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Bio & Track Record</label>
                    <textarea
                      rows={3}
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      placeholder="Tell potential co-founders about your technical strengths, previous launches, and work ethic..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Seeking Co-Founder Role</label>
                      <input
                        type="text"
                        value={form.seekingRole}
                        onChange={(e) => setForm({ ...form, seekingRole: e.target.value })}
                        placeholder="e.g. Product Co-Founder / GTM Lead"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Time Commitment</label>
                      <select
                        value={form.commitment}
                        onChange={(e) => setForm({ ...form, commitment: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                      >
                        <option value="full_time">Full-Time (40h/wk)</option>
                        <option value="part_time">Part-Time (20h/wk)</option>
                        <option value="hackathons">Nights & Weekends</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Top Skills (comma-separated)</label>
                    <input
                      type="text"
                      value={form.skills}
                      onChange={(e) => setForm({ ...form, skills: e.target.value })}
                      placeholder="FastAPI, React 19, B2B Sales, pgvector, Tailwind"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">GitHub Profile URL</label>
                      <input
                        type="url"
                        value={form.githubUrl}
                        onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                        placeholder="https://github.com/username"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        value={form.linkedinUrl}
                        onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPostModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? 'Publishing...' : 'Publish Listing →'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
