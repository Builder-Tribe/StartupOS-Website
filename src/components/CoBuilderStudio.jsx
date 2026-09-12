import React, { useState, useEffect } from 'react';
import { 
  Users, Sparkles, Search, Plus, ExternalLink, Github, Linkedin, 
  Twitter, ShieldCheck, CheckCircle2, MessageSquare, Handshake,
  Briefcase, Check, Send, ThumbsUp, MessageCircle, Share2,
  ChevronDown, ChevronUp, UserPlus, X, FileText, TrendingUp,
  Award, Globe, ArrowRight, Flame
} from 'lucide-react';

export default function CoBuilderStudio({ currentUser }) {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'feed' | 'inbox'
  const [cobuilders, setCobuilders] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & State
  const [showPostModal, setShowPostModal] = useState(false);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [pitchSuccess, setPitchSuccess] = useState(false);
  const [postSuccess, setPostSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Floating Messaging Drawer
  const [messagingOpen, setMessagingOpen] = useState(false);
  const [activeChatBuilder, setActiveChatBuilder] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 'm1', sender: 'Arjun Mehta', text: 'Hey Harshita! Saw ContextPrism on the launchpad. The AST token pruner is super sharp. Would love to discuss a B2B GTM partnership.', time: '10:14 AM' }
  ]);
  const [newMsgText, setNewMsgText] = useState('');

  // Feed post state
  const [newPostText, setNewPostText] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postSubmitting, setPostSubmitting] = useState(false);

  // Profile Form
  const [form, setForm] = useState({
    name: currentUser?.name || 'Harshita Agarwal',
    avatar: currentUser?.avatar || '👩‍💻',
    role: 'AI Systems Architect & Full-Stack Engineer',
    category: 'technical',
    headline: 'AI Systems Architect @ StartupOS | React 19 • FastAPI • Multi-Agent Workflows',
    bio: 'Founding engineer experienced in building autonomous developer platforms, 4-file parity governance, and token FinOps gateways.',
    skills: 'React 19, Node.js, FastAPI, Vector DB, TypeScript, LLM Workflows',
    seekingRole: 'B2B GTM & Enterprise Sales Co-Founder',
    seekingDescription: 'Looking for a seasoned B2B sales co-founder to lead customer development with AI teams.',
    commitment: 'full_time',
    stage: 'parity_verified',
    equityExpectation: 'Equal 50/50 Equity',
    location: 'Bengaluru, India / Remote',
    githubUrl: 'https://github.com/1997agarwal',
    linkedinUrl: 'https://linkedin.com'
  });

  // Pitch Form
  const [pitchForm, setPitchForm] = useState({
    projectName: '',
    roleOffered: 'Technical Co-Founder',
    equityOffered: 'Equal 50/50 Equity',
    projectUrl: '',
    pitchMessage: ''
  });

  const [pitchedIds, setPitchedIds] = useState(new Set());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, fRes, cRes] = await Promise.all([
        fetch('/api/cobuilders'),
        fetch('/api/cobuilders/feed'),
        fetch('/api/cobuilders/connections')
      ]);
      if (bRes.ok) setCobuilders(await bRes.json());
      if (fRes.ok) setFeedPosts(await fRes.json());
      if (cRes.ok) setConnections(await cRes.json());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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
      setErrorMsg('Project name and pitch note are required.');
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
          senderEmail: currentUser?.email || 'harshita@startupos.dev',
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
        }, 1400);
        await fetchData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || 'Failed to send pitch.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateFeedPost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    setPostSubmitting(true);
    try {
      const res = await fetch('/api/cobuilders/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: currentUser?.id || 'user-harshita',
          authorName: currentUser?.name || 'Harshita Agarwal',
          authorAvatar: currentUser?.avatar || '👩‍💻',
          authorRole: 'AI Systems Architect & Full-Stack Engineer',
          content: newPostText.trim(),
          tags: ['#OpenToCoFound', '#StartupOS', '#AIBuilders']
        })
      });
      if (res.ok) {
        const created = await res.json();
        setFeedPosts([created, ...feedPosts]);
        setNewPostText('');
        setShowCreatePost(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const res = await fetch(`/api/cobuilders/feed/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id || 'user-harshita' })
      });
      if (res.ok) {
        const updated = await res.json();
        setFeedPosts(feedPosts.map(p => p.id === postId ? updated : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMsgText.trim()) return;
    setChatMessages([
      ...chatMessages,
      { id: `msg-${Date.now()}`, sender: currentUser?.name || 'You', text: newMsgText.trim(), time: 'Just now' }
    ]);
    setNewMsgText('');
  };

  const filteredCobuilders = cobuilders.filter((b) => {
    if (roleFilter !== 'all' && b.category !== roleFilter) return false;
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
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-6 space-y-6 animate-fade-in">
      {/* Top Clean Sub-Bar (LinkedIn-Inspired Network Header) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0a66c2] via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs font-black text-xl">
            in
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">Co-Builder Professional Network</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                #OpenToCoFound
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Match with vetted AI engineers, GTM leaders, and product architects for your venture.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/80 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'directory' ? 'bg-white text-[#0a66c2] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Co-Founder Directory</span>
          </button>
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'feed' ? 'bg-white text-[#0a66c2] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Builder Feed ({feedPosts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'inbox' ? 'bg-white text-[#0a66c2] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Pitches & Inquiries ({connections.length})</span>
          </button>
        </div>
      </div>

      {/* Clean 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ============================================================ */}
        {/* LEFT RAIL (3 cols): Professional Identity Card & Trending Tags */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 space-y-4">
          {/* Profile Identity Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Clean Mini Cover */}
            <div className="h-16 bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950 relative">
              <div className="absolute -bottom-6 left-4">
                <div className="relative">
                  <div className="w-13 h-13 rounded-2xl bg-white p-0.5 shadow-md border-2 border-white">
                    <div className="w-full h-full rounded-xl bg-indigo-50 flex items-center justify-center text-2xl border border-indigo-100">
                      {currentUser?.avatar || '👩‍💻'}
                    </div>
                  </div>
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" title="Open To Co-Found"></span>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-8 p-4 space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1">
                  <span>{currentUser?.name || 'Harshita Agarwal'}</span>
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </h3>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                  AI Systems Architect @ StartupOS | Full-Stack
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  #OpenToCoFound: Full-Time
                </span>
              </div>

              {/* LinkedIn Stats Bar */}
              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Profile impressions</span>
                  <strong className="text-[#0a66c2] font-bold">142</strong>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Co-founder pitches</span>
                  <strong className="text-[#0a66c2] font-bold">{connections.length + 8}</strong>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Parity compliance</span>
                  <strong className="text-emerald-600 font-bold">100% Verified</strong>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => setShowPostModal(true)}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>Edit Co-Founder Profile</span>
              </button>
            </div>
          </div>

          {/* Trending Stacks & Filters */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Trending Co-Founder Stacks
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['#FastAPI', '#ClaudeCode', '#React19', '#NextJS15', '#pgvector', '#B2BGTM', '#TokenFinOps'].map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchQuery(tag.replace('#', ''))}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200/70 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CENTER COLUMN (6 cols): Directory | Feed | Inquiries */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* TAB 1: CO-FOUNDER DIRECTORY */}
          {activeTab === 'directory' && (
            <div className="space-y-4">
              {/* Search & Category Filter Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, skill (FastAPI, React 19, B2B), or role..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2] text-slate-800"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'All Roles', count: cobuilders.length },
                    { id: 'technical', label: '💻 AI & Tech', count: cobuilders.filter(c => c.category === 'technical').length },
                    { id: 'growth', label: '🚀 Growth & GTM', count: cobuilders.filter(c => c.category === 'growth').length },
                    { id: 'design', label: '🎨 UI/UX Design', count: cobuilders.filter(c => c.category === 'design').length },
                    { id: 'domain', label: '🧠 Domain & Ops', count: cobuilders.filter(c => c.category === 'domain').length }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setRoleFilter(p.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        roleFilter === p.id 
                          ? 'bg-[#0a66c2] text-white shadow-xs' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {p.label} ({p.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Co-Builder List Cards */}
              {loading ? (
                <div className="text-center py-16 text-slate-400 text-xs">Loading verified co-builder profiles...</div>
              ) : filteredCobuilders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 space-y-2">
                  <p className="text-sm font-bold text-slate-800">No Co-Builders Match This Filter</p>
                  <p className="text-xs text-slate-500">Try adjusting your search query or clear the filter.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCobuilders.map((builder) => {
                    const isPitched = pitchedIds.has(builder.id);
                    return (
                      <div
                        key={builder.id}
                        className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all p-5 space-y-3.5"
                      >
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                              {builder.avatar}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-sm font-bold text-slate-900">{builder.name}</h3>
                                <ShieldCheck className="w-4 h-4 text-blue-600" />
                              </div>
                              <p className="text-xs text-slate-600 font-medium">{builder.role}</p>
                              <span className="text-[10px] text-slate-400">{builder.location}</span>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0a66c2] border border-blue-200 shrink-0">
                            {builder.compatibilityScore || 95}% Match
                          </span>
                        </div>

                        {/* Headline */}
                        <p className="text-xs text-slate-800 font-medium leading-relaxed">
                          {builder.headline}
                        </p>

                        {/* Seeking Box */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70 space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center justify-between font-semibold text-slate-800">
                            <span className="flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-[#0a66c2]" />
                              <span>Seeking: <strong>{builder.seekingRole}</strong></span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                              {builder.commitmentLabel}
                            </span>
                          </div>
                          {builder.seekingDescription && (
                            <p className="text-[11px] text-slate-600">{builder.seekingDescription}</p>
                          )}
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                            <span>Stage: <strong>{builder.stageLabel}</strong></span>
                            <span>Split: <strong>{builder.equityExpectation}</strong></span>
                          </div>
                        </div>

                        {/* Incubated Products */}
                        {builder.projects && builder.projects.length > 0 && (
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Products:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {builder.projects.map((p, idx) => (
                                <a
                                  key={idx}
                                  href={p.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/70 hover:underline flex items-center gap-1"
                                >
                                  <span>{p.name}</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1">
                          {builder.skills && builder.skills.map((s, idx) => (
                            <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {s}
                            </span>
                          ))}
                        </div>

                        {/* Card Action Bar */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {builder.githubUrl && (
                              <a href={builder.githubUrl} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
                                <Github className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {builder.linkedinUrl && (
                              <a href={builder.linkedinUrl} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-[#0a66c2] rounded-lg hover:bg-slate-100 transition-colors">
                                <Linkedin className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              onClick={() => {
                                setActiveChatBuilder(builder);
                                setMessagingOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Message</span>
                            </button>
                          </div>

                          <button
                            disabled={isPitched}
                            onClick={() => {
                              setSelectedBuilder(builder);
                              setShowPitchModal(true);
                            }}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                              isPitched
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                                : 'bg-[#0a66c2] hover:bg-[#004182] text-white shadow-xs active:scale-95'
                            }`}
                          >
                            {isPitched ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Pitched</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Connect / Pitch</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BUILDER NETWORK FEED */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              {/* LinkedIn "Start a Post" Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shrink-0">
                    {currentUser?.avatar || '👩‍💻'}
                  </div>
                  <input
                    type="text"
                    value={newPostText}
                    onFocus={() => setShowCreatePost(true)}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="Share a launch milestone, parity achievement, or co-founder opening..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 text-slate-800 transition-colors cursor-text"
                  />
                </div>

                {showCreatePost && (
                  <form onSubmit={handleCreateFeedPost} className="pt-2 border-t border-slate-100 space-y-3 animate-fade-in">
                    <textarea
                      rows={3}
                      value={newPostText}
                      onChange={(e) => setNewPostText(e.target.value)}
                      placeholder="What are you building? Mention your target co-founder role, commitment, and parity progress..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20 text-slate-800"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-bold">
                        <span>Tag: #OpenToCoFound</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCreatePost(false)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={postSubmitting || !newPostText.trim()}
                          className="px-4 py-1.5 bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold rounded-lg transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                          {postSubmitting ? 'Posting...' : 'Post Update'}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Feed Posts List */}
              <div className="space-y-4">
                {feedPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3.5">
                    {/* Post Author Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-lg shrink-0">
                          {post.authorAvatar}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{post.authorName}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {post.authorBadge}
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-tight">{post.authorRole}</p>
                          <span className="text-[10px] text-slate-400">{post.timeAgo} • 🌐 Public</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedBuilder({ id: post.authorId, name: post.authorName, avatar: post.authorAvatar, role: post.authorRole });
                          setShowPitchModal(true);
                        }}
                        className="text-xs font-bold text-[#0a66c2] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>Pitch</span>
                      </button>
                    </div>

                    {/* Post Body Content */}
                    <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                      {post.content}
                    </p>

                    {/* Project Snapshot Card */}
                    {post.projectMention && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Incubated Venture</span>
                          <h5 className="text-xs font-bold text-slate-900">{post.projectMention.name}</h5>
                          <p className="text-[11px] text-slate-600">{post.projectMention.tagline}</p>
                        </div>
                        <a
                          href={post.projectMention.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1 bg-white hover:bg-slate-100 text-indigo-600 text-xs font-bold rounded-lg border border-slate-200 flex items-center gap-1"
                        >
                          <span>View Repo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Likes & Comments Counter */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px]">👍</span>
                        <span>{post.likes || 12}</span>
                      </span>
                      <span>{post.comments ? post.comments.length : 0} comments • {post.shares || 3} shares</span>
                    </div>

                    {/* Action Bar (Like, Comment, Share, Pitch) */}
                    <div className="pt-2 border-t border-slate-100 grid grid-cols-4 gap-1 text-center">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className="py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Like</span>
                      </button>
                      <button className="py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Comment</span>
                      </button>
                      <button className="py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Repost</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBuilder({ id: post.authorId, name: post.authorName, avatar: post.authorAvatar, role: post.authorRole });
                          setShowPitchModal(true);
                        }}
                        className="py-1.5 rounded-lg text-xs font-bold text-[#0a66c2] hover:bg-blue-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Pitch</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: INBOX & CONNECTION PITCHES */}
          {activeTab === 'inbox' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Co-Founder Proposals</h3>
                  <p className="text-xs text-slate-500">Review pitches and collaboration requests from builders</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-[#0a66c2] border border-blue-200">
                  {connections.length} Proposals
                </span>
              </div>

              {connections.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No pitches in your inbox yet. Send a co-founder pitch from the directory!
                </div>
              ) : (
                <div className="space-y-3">
                  {connections.map((c) => (
                    <div key={c.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <strong className="text-xs font-bold text-slate-900">{c.senderName}</strong>
                          <p className="text-xs text-[#0a66c2] font-semibold">{c.projectName} ({c.roleOffered})</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {c.equityOffered}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200/70">
                        "{c.pitchMessage}"
                      </p>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => {
                            setActiveChatBuilder({ name: c.senderName, role: c.roleOffered });
                            setMessagingOpen(true);
                          }}
                          className="px-3.5 py-1.5 bg-[#0a66c2] text-white text-xs font-bold rounded-lg hover:bg-[#004182] transition-colors"
                        >
                          Chat Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* RIGHT RAIL (3 cols): AI Match Recommendations & Network News */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 space-y-4">
          {/* AI Match Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>AI Matched For You</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Mutual fit</span>
            </div>

            <div className="space-y-3">
              {cobuilders.slice(0, 3).map((b) => (
                <div key={b.id} className="flex items-start justify-between gap-2 pt-2 border-t border-slate-100 first:border-0 first:pt-0">
                  <div className="flex items-start gap-2">
                    <span className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm shrink-0">
                      {b.avatar}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-tight">{b.name}</h4>
                      <p className="text-[10px] text-slate-500 leading-tight line-clamp-1">{b.role}</p>
                      <span className="text-[9px] text-[#0a66c2] font-bold">{b.compatibilityScore}% Compatibility</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBuilder(b);
                      setShowPitchModal(true);
                    }}
                    className="text-[11px] font-bold text-[#0a66c2] hover:bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 transition-colors shrink-0 cursor-pointer"
                  >
                    + Pitch
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* StartupOS Network News & Trends */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>StartupOS Network Radar</span>
            </span>
            <div className="space-y-2">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block">Demoday Batch Q3 Live</span>
                <p className="text-[10px] text-slate-500">Top 5% parity-verified AI projects qualify for direct venture capital introductions.</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                <span className="text-xs font-bold text-slate-800 block">Co-Founder Parity Standard</span>
                <p className="text-[10px] text-slate-500">93.3% of co-founder pairings require 4-file constitution parity across both repositories.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SLEEK FLOATING MESSAGING PILL (Bottom Right) */}
      {/* ============================================================ */}
      <div className="fixed bottom-0 right-6 z-40 w-72 shadow-xl rounded-t-2xl border border-slate-200 bg-white overflow-hidden transition-all">
        <div 
          onClick={() => setMessagingOpen(!messagingOpen)}
          className="p-3 bg-white border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-800">
              Messages {activeChatBuilder ? `(${activeChatBuilder.name})` : ''}
            </span>
          </div>
          <button className="text-slate-400 p-0.5">
            {messagingOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {messagingOpen && (
          <div className="h-64 flex flex-col justify-between bg-slate-50/60 p-3 space-y-2">
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {chatMessages.map((m) => (
                <div 
                  key={m.id} 
                  className={`text-xs p-2 rounded-xl max-w-[85%] leading-relaxed ${
                    m.sender === (currentUser?.name || 'You')
                      ? 'bg-[#0a66c2] text-white ml-auto rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 mr-auto rounded-tl-none'
                  }`}
                >
                  <p className="font-bold text-[9px] opacity-75">{m.sender}</p>
                  <p>{m.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 pt-2 border-t border-slate-200">
              <input
                type="text"
                value={newMsgText}
                onChange={(e) => setNewMsgText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
              <button
                type="submit"
                disabled={!newMsgText.trim()}
                className="p-1.5 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* PITCH MODAL */}
      {/* ============================================================ */}
      {showPitchModal && selectedBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Pitch Co-Founder: {selectedBuilder.name}</h3>
                <p className="text-[11px] text-slate-500">{selectedBuilder.role}</p>
              </div>
              <button onClick={() => setShowPitchModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendPitch} className="p-5 space-y-3">
              {pitchSuccess ? (
                <div className="p-6 text-center space-y-1 bg-emerald-50 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900">Pitch Delivered!</h4>
                </div>
              ) : (
                <>
                  {errorMsg && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-700">
                      {errorMsg}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Venture Name *</label>
                    <input
                      type="text"
                      required
                      value={pitchForm.projectName}
                      onChange={(e) => setPitchForm({ ...pitchForm, projectName: e.target.value })}
                      placeholder="e.g. ContextPrism, BusinessPay"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">Role Offered</label>
                      <input
                        type="text"
                        value={pitchForm.roleOffered}
                        onChange={(e) => setPitchForm({ ...pitchForm, roleOffered: e.target.value })}
                        placeholder="Technical Co-Founder"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">Equity / Terms</label>
                      <input
                        type="text"
                        value={pitchForm.equityOffered}
                        onChange={(e) => setPitchForm({ ...pitchForm, equityOffered: e.target.value })}
                        placeholder="Equal 50/50"
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Personal Note *</label>
                    <textarea
                      required
                      rows={3}
                      value={pitchForm.pitchMessage}
                      onChange={(e) => setPitchForm({ ...pitchForm, pitchMessage: e.target.value })}
                      placeholder="Why would you be great co-founders together?"
                      className="w-full p-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0a66c2]/20"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPitchModal(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-xs"
                    >
                      {submitting ? 'Sending...' : 'Send Pitch'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* POST PROFILE MODAL */}
      {/* ============================================================ */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Co-Builder Profile</h3>
                <p className="text-[11px] text-slate-500">Update your co-founder seeking criteria</p>
              </div>
              <button onClick={() => setShowPostModal(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostListing} className="p-5 space-y-3 overflow-y-auto">
              {postSuccess ? (
                <div className="p-6 text-center space-y-1 bg-emerald-50 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900">Profile Saved!</h4>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">Category</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="technical">💻 AI & Tech</option>
                        <option value="growth">🚀 Growth & GTM</option>
                        <option value="design">🎨 UI/UX Design</option>
                        <option value="domain">🧠 Domain & Ops</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Headline *</label>
                    <input
                      type="text"
                      required
                      value={form.headline}
                      onChange={(e) => setForm({ ...form, headline: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">Seeking Role</label>
                      <input
                        type="text"
                        value={form.seekingRole}
                        onChange={(e) => setForm({ ...form, seekingRole: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 block">Commitment</label>
                      <select
                        value={form.commitment}
                        onChange={(e) => setForm({ ...form, commitment: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="full_time">Full-Time (40h/wk)</option>
                        <option value="part_time">Part-Time (20h/wk)</option>
                        <option value="hackathons">Nights & Weekends</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 block">Top Skills (comma-separated)</label>
                    <input
                      type="text"
                      value={form.skills}
                      onChange={(e) => setForm({ ...form, skills: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPostModal(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-xs"
                    >
                      {submitting ? 'Saving...' : 'Save Profile'}
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
