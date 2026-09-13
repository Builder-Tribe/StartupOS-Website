import React, { useState, useEffect } from 'react';
import { 
  Users, Sparkles, Search, Plus, ExternalLink, Github, Linkedin, 
  Twitter, ShieldCheck, CheckCircle2, MessageSquare, Handshake,
  Briefcase, Check, Send, ThumbsUp, MessageCircle, Share2,
  ChevronDown, ChevronUp, UserPlus, X, FileText, TrendingUp,
  Award, Globe, ArrowRight, Flame, Target, MapPin, Mail
} from 'lucide-react';

export default function CoBuilderStudio({ currentUser }) {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'inbox' | 'feed'
  const [cobuilders, setCobuilders] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [commitmentFilter, setCommitmentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [pitchSuccess, setPitchSuccess] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Post in Feed state
  const [newPostText, setNewPostText] = useState('');
  const [postingFeed, setPostingFeed] = useState(false);

  // Profile Form
  const [form, setForm] = useState({
    name: currentUser?.name || 'Harshita Agarwal',
    avatar: currentUser?.avatar || '👩‍💻',
    role: 'AI Systems Architect & Full-Stack Founder',
    category: 'technical',
    headline: 'Building multi-agent reasoning systems & 4-file parity platforms',
    bio: 'Founding engineer experienced in React 19, Node.js, FastAPI, pgvector, and autonomous agent workflows. Architected StartupOS, SpecForge, and ContextPrism.',
    skills: 'React 19, Node.js, FastAPI, Vector DB, TypeScript, LLM Workflows',
    seekingRole: 'B2B GTM & Enterprise Growth Co-Founder',
    seekingDescription: 'Looking for a seasoned B2B sales co-founder to lead customer acquisition with enterprise incubators and AI teams.',
    commitment: 'full_time',
    stage: 'parity_verified',
    equityExpectation: 'Equal 50/50 Equity',
    location: 'Bengaluru, India / Remote',
    githubUrl: 'https://github.com/1997agarwal',
    linkedinUrl: 'https://linkedin.com'
  });

  // Pitch Form
  const [pitchForm, setPitchForm] = useState({
    projectName: 'StartupOS Incubator',
    roleOffered: 'Growth & GTM Co-Founder',
    equityOffered: 'Equal 50/50 Equity',
    projectUrl: 'https://startupos.dev',
    pitchMessage: ''
  });

  const [pitchedIds, setPitchedIds] = useState(new Set());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, fRes, cRes] = await Promise.all([
        fetch('/api/cobuilders').then(r => r.json()).catch(() => []),
        fetch('/api/cobuilders/feed').then(r => r.json()).catch(() => []),
        fetch('/api/cobuilders/connections').then(r => r.json()).catch(() => [])
      ]);
      setCobuilders(Array.isArray(bRes) ? bRes : []);
      setFeedPosts(Array.isArray(fRes) ? fRes : []);
      setConnections(Array.isArray(cRes) ? cRes : []);
    } catch (err) {
      console.error('Failed to fetch cobuilder data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveProfile = async (e) => {
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
        setProfileSuccess(true);
        setTimeout(() => {
          setProfileSuccess(false);
          setShowProfileModal(false);
        }, 1000);
        await fetchData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to save profile.');
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
      setErrorMsg('Project name and pitch proposal message are required.');
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
          senderId: currentUser?.id || 'user-harshita',
          senderName: currentUser?.name || 'Harshita Agarwal',
          senderEmail: currentUser?.email || 'harshita@vibe-coding.io',
          ...pitchForm
        })
      });

      if (res.ok) {
        setPitchedIds(new Set([...pitchedIds, selectedBuilder.id]));
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
        }, 1200);
        await fetchData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to send pitch.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error sending pitch.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered directory builders
  const filteredBuilders = cobuilders.filter((b) => {
    const matchesRole = roleFilter === 'all' || b.category === roleFilter;
    const matchesCommitment = commitmentFilter === 'all' || b.commitment === commitmentFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      (b.name || '').toLowerCase().includes(q) ||
      (b.role || '').toLowerCase().includes(q) ||
      (b.skills || []).some(s => String(s).toLowerCase().includes(q)) ||
      (b.seekingRole || '').toLowerCase().includes(q);
    return matchesRole && matchesCommitment && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Co-Builder Match & Founder Network
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Connect with vetted technical and GTM co-founders, exchange pitch proposals, and share build milestones.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button & Stats */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowProfileModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Edit My Founder Profile</span>
          </button>
        </div>
      </div>

      {/* Modern Sub-Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-2 shadow-xs flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Co-Founder Directory ({cobuilders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'inbox'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Pitch Inbox ({connections.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Milestone Feed</span>
          </button>
        </div>

        <span className="hidden md:inline-block text-[11px] font-bold text-slate-500 pr-3">
          100% 4-File Parity Verified Network
        </span>
      </div>

      {/* TAB 1: CO-FOUNDER DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-6">
          {/* Search & Quick Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by skill (React 19, FastAPI, pgvector), name, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              {/* Commitment Filter */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <span className="text-xs text-slate-400 font-bold font-mono uppercase text-[10px] shrink-0">Commitment:</span>
                <select
                  value={commitmentFilter}
                  onChange={(e) => setCommitmentFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Commitments</option>
                  <option value="full_time">Full-Time (40h/wk)</option>
                  <option value="part_time">Part-Time / Evenings</option>
                </select>
              </div>
            </div>

            {/* Role Filter Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
              {[
                { id: 'all', label: 'All Specialties' },
                { id: 'technical', label: '💻 AI Systems & Full-Stack' },
                { id: 'growth', label: '🚀 Growth & B2B Sales' },
                { id: 'design', label: '🎨 UI/UX & Product Design' },
                { id: 'domain', label: '🧠 Domain Specialists' }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setRoleFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    roleFilter === pill.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Builder Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredBuilders.map((builder) => {
              const isPitched = pitchedIds.has(builder.id);
              return (
                <div 
                  key={builder.id} 
                  className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Top Row: Avatar, Identity, Badges */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl shrink-0">
                          {builder.avatar || '👨‍💻'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-slate-900">{builder.name}</h3>
                            {builder.verifiedParity && (
                              <ShieldCheck className="w-4 h-4 text-indigo-600" title="100% 4-File Parity Verified" />
                            )}
                          </div>
                          <p className="text-xs text-indigo-600 font-semibold mt-0.5">{builder.role}</p>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {builder.location || 'Remote'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 font-mono">
                        {builder.commitmentLabel || 'Full-Time'}
                      </span>
                    </div>

                    {/* Headline & Bio */}
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {builder.headline || builder.bio}
                    </p>

                    {/* What They Are Seeking */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Looking For
                      </span>
                      <p className="text-xs text-slate-800 font-semibold">
                        {builder.seekingRole || 'Co-Founder'}
                      </p>
                      {builder.seekingDescription && (
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {builder.seekingDescription}
                        </p>
                      )}
                    </div>

                    {/* Verified Skills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(builder.skills || []).map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="text-[10px] font-medium bg-white border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-lg"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {builder.githubUrl && (
                        <a 
                          href={builder.githubUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="GitHub Profile"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {builder.linkedinUrl && (
                        <a 
                          href={builder.linkedinUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                          title="LinkedIn Profile"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      <span className="text-[11px] font-mono text-slate-500 font-bold pl-1">
                        {builder.equityExpectation || '50/50 Equity'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedBuilder(builder);
                        setShowPitchModal(true);
                      }}
                      disabled={isPitched}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                        isPitched
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isPitched ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{isPitched ? 'Pitch Sent' : 'Pitch Collaboration'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PITCH INBOX */}
      {activeTab === 'inbox' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Co-Founder Pitch Proposals</h2>
              <p className="text-xs text-slate-500">Review collaboration proposals sent and received across the network.</p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
              {connections.length} Proposals Logged
            </span>
          </div>

          {connections.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs space-y-2">
              <Send className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">No Pitches Exchanged Yet</p>
              <p className="text-slate-500">Go to the Co-Founder Directory to pitch collaboration to fellow builders.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {connections.map((conn) => (
                <div key={conn.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{conn.senderName}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-bold text-indigo-600">{conn.recipientName}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                        Project: <strong>{conn.projectName}</strong> • Role Offered: <strong>{conn.roleOffered}</strong>
                      </span>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono">
                      {conn.equityOffered}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans">
                    "{conn.pitchMessage}"
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Contact: <strong className="text-slate-700">{conn.senderEmail}</strong></span>
                    <span className="font-mono text-slate-400">{new Date(conn.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: FOUNDER MILESTONE STREAM */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Share What You Built Today</h3>
            <textarea
              rows={3}
              placeholder="What milestone did you ship? (e.g. Just verified 100% 4-file parity on my FastAPI backend, seeking feedback)..."
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (!newPostText.trim()) return;
                  setFeedPosts([
                    {
                      id: `post-${Date.now()}`,
                      author: { name: currentUser?.name || 'Harshita Agarwal', role: 'AI Systems Architect', avatar: '👩‍💻' },
                      content: newPostText,
                      time: 'Just now',
                      likes: 1
                    },
                    ...feedPosts
                  ]);
                  setNewPostText('');
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Milestone</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {feedPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{post.author?.avatar || '👨‍💻'}</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{post.author?.name}</h4>
                    <p className="text-[11px] text-slate-400">{post.author?.role} • {post.time || 'Today'}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-xs text-slate-500 font-bold">
                  <button className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-pointer">
                    <ThumbsUp className="w-3.5 h-3.5" /> {post.likes || 12}
                  </button>
                  <button className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-pointer">
                    <MessageCircle className="w-3.5 h-3.5" /> {post.comments || 3} Comments
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PITCH PROPOSAL MODAL */}
      {showPitchModal && selectedBuilder && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Co-Founder Pitch
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Pitch Collaboration to {selectedBuilder.name}
                </h3>
              </div>
              <button 
                onClick={() => setShowPitchModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
                {errorMsg}
              </div>
            )}

            {pitchSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pitch proposal sent successfully to {selectedBuilder.name}!</span>
              </div>
            )}

            <form onSubmit={handleSendPitch} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Your Project Name *</label>
                <input
                  type="text"
                  required
                  value={pitchForm.projectName}
                  onChange={(e) => setPitchForm({ ...pitchForm, projectName: e.target.value })}
                  placeholder="e.g. StartupOS, Trippy, ContextPrism"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Offered *</label>
                  <select
                    value={pitchForm.roleOffered}
                    onChange={(e) => setPitchForm({ ...pitchForm, roleOffered: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  >
                    <option value="Technical Co-Founder">Technical Co-Founder</option>
                    <option value="Growth & GTM Co-Founder">Growth & GTM Co-Founder</option>
                    <option value="Product Lead">Product Lead</option>
                    <option value="Founding Designer">Founding Designer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Equity Split Offered *</label>
                  <select
                    value={pitchForm.equityOffered}
                    onChange={(e) => setPitchForm({ ...pitchForm, equityOffered: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  >
                    <option value="Equal 50/50 Equity">Equal 50/50 Equity</option>
                    <option value="30% - 40% Equity">30% - 40% Equity</option>
                    <option value="15% - 25% Equity">15% - 25% Equity</option>
                    <option value="Advisory / Equity Pool">Advisory / Pool</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pitch Message (Why We Should Team Up) *</label>
                <textarea
                  rows={4}
                  required
                  value={pitchForm.pitchMessage}
                  onChange={(e) => setPitchForm({ ...pitchForm, pitchMessage: e.target.value })}
                  placeholder="Hey, saw your background in FastAPI and multi-agent reasoning. We're building StartupOS and need someone with your depth to own backend infrastructure..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPitchModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Sending...' : 'Send Pitch Proposal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT FOUNDER PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Profile Editor
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Edit Your Co-Builder Profile
                </h3>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Founder profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Headline / Specialty *</label>
                  <input
                    type="text"
                    required
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Short Pitch / One-Line Bio *</label>
                <textarea
                  rows={2}
                  required
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Seeking Role *</label>
                  <input
                    type="text"
                    required
                    value={form.seekingRole}
                    onChange={(e) => setForm({ ...form, seekingRole: e.target.value })}
                    placeholder="e.g. B2B GTM Lead"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Commitment *</label>
                  <select
                    value={form.commitment}
                    onChange={(e) => setForm({ ...form, commitment: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none"
                  >
                    <option value="full_time">Full-Time (40h/wk)</option>
                    <option value="part_time">Part-Time / Evenings</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Skills (Comma Separated) *</label>
                <input
                  type="text"
                  required
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">GitHub Profile URL</label>
                  <input
                    type="text"
                    value={form.githubUrl}
                    onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    value={form.linkedinUrl}
                    onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
