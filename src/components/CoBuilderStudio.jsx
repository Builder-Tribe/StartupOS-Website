import React, { useState, useEffect } from 'react';
import { 
  Users, Sparkles, Search, Plus, ExternalLink, Github, Linkedin, 
  Twitter, ShieldCheck, CheckCircle2, MessageSquare, Handshake,
  Briefcase, Check, Send, ThumbsUp, MessageCircle, Share2,
  ChevronDown, ChevronUp, UserPlus, X
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
          tags: ['#OpenToCoFound', '#StartupOS']
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
      {/* Clean Minimal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Co-Builder Network</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              #OpenToCoFound
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Connect with AI engineers, product architects, and GTM co-founders for your venture.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/70 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'directory' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Directory ({cobuilders.length})
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'feed' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Feed ({feedPosts.length})
            </button>
            <button
              onClick={() => setActiveTab('inbox')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'inbox' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pitches ({connections.length})
            </button>
          </div>

          <button
            onClick={() => setShowPostModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Profile</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CO-FOUNDER DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-5">
          {/* Clean Search & Filter Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, skill (FastAPI, React 19, B2B), or role..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 shadow-2xs"
              />
            </div>

            {/* Role Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All' },
                { id: 'technical', label: '💻 AI & Tech' },
                { id: 'growth', label: '🚀 Growth & GTM' },
                { id: 'design', label: '🎨 UI/UX' },
                { id: 'domain', label: '🧠 Domain' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setRoleFilter(p.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    roleFilter === p.id 
                      ? 'bg-slate-900 text-white font-bold shadow-xs' 
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-xs">Loading verified co-builder profiles...</div>
          ) : filteredCobuilders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 space-y-2">
              <p className="text-sm font-bold text-slate-800">No Co-Builders Match This Filter</p>
              <p className="text-xs text-slate-500">Try adjusting your search query or clear the filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCobuilders.map((builder) => {
                const isPitched = pitchedIds.has(builder.id);
                return (
                  <div
                    key={builder.id}
                    className="bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 p-5 space-y-3.5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Header Row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xl shrink-0">
                            {builder.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-bold text-slate-900">{builder.name}</h3>
                              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{builder.role}</p>
                            <span className="text-[10px] text-slate-400">{builder.location}</span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                          {builder.compatibilityScore || 95}% Match
                        </span>
                      </div>

                      {/* Headline */}
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {builder.headline}
                      </p>

                      {/* Seeking Info Strip */}
                      <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 text-xs text-slate-600 space-y-1">
                        <div className="flex items-center justify-between font-medium">
                          <span>Seeking: <strong className="text-slate-900">{builder.seekingRole}</strong></span>
                          <span className="text-[10px] text-slate-500">{builder.commitmentLabel}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Split: {builder.equityExpectation}</span>
                          <span>Stage: {builder.stageLabel}</span>
                        </div>
                      </div>

                      {/* Incubated Products */}
                      {builder.projects && builder.projects.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Products:</span>
                          {builder.projects.map((p, idx) => (
                            <a
                              key={idx}
                              href={p.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 hover:underline flex items-center gap-1"
                            >
                              <span>{p.name}</span>
                              <ExternalLink className="w-2.5 h-2.5 text-indigo-400" />
                            </a>
                          ))}
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
                    </div>

                    {/* Card Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {builder.githubUrl && (
                          <a href={builder.githubUrl} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors">
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {builder.linkedinUrl && (
                          <a href={builder.linkedinUrl} target="_blank" rel="noreferrer" className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors">
                            <Linkedin className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setActiveChatBuilder(builder);
                            setMessagingOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Message
                        </button>
                        <button
                          disabled={isPitched}
                          onClick={() => {
                            setSelectedBuilder(builder);
                            setShowPitchModal(true);
                          }}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            isPitched
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:scale-95'
                          }`}
                        >
                          {isPitched ? <><Check className="w-3 h-3" /> Pitched</> : 'Connect / Pitch'}
                        </button>
                      </div>
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
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Post Creation Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-base shrink-0">
                {currentUser?.avatar || '👩‍💻'}
              </div>
              <input
                type="text"
                value={newPostText}
                onFocus={() => setShowCreatePost(true)}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="Share a milestone, parity achievement, or co-founder search..."
                className="flex-1 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 transition-colors cursor-text"
              />
            </div>

            {showCreatePost && (
              <form onSubmit={handleCreateFeedPost} className="pt-2 border-t border-slate-100 space-y-2.5 animate-fade-in">
                <textarea
                  rows={3}
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="What are you building? Mention your target co-founder role, commitment, and parity progress..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreatePost(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={postSubmitting || !newPostText.trim()}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {postSubmitting ? 'Posting...' : 'Post Update'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Posts Stream */}
          <div className="space-y-3.5">
            {feedPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3 shadow-xs">
                {/* Author Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg shrink-0">
                      {post.authorAvatar}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                        <span>{post.authorName}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700">
                          {post.authorBadge}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">{post.authorRole} • {post.timeAgo}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedBuilder({ id: post.authorId, name: post.authorName, avatar: post.authorAvatar, role: post.authorRole });
                      setShowPitchModal(true);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    + Pitch
                  </button>
                </div>

                {/* Content */}
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                  {post.content}
                </p>

                {/* Project Mention Box */}
                {post.projectMention && (
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-slate-900 block font-bold">{post.projectMention.name}</strong>
                      <span className="text-[11px] text-slate-500">{post.projectMention.tagline}</span>
                    </div>
                    <a
                      href={post.projectMention.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-indigo-600 font-bold rounded-lg border border-slate-200 flex items-center gap-1 text-[11px]"
                    >
                      <span>Repo</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}

                {/* Post Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{post.likes || 12} Likes</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBuilder({ id: post.authorId, name: post.authorName, avatar: post.authorAvatar, role: post.authorRole });
                      setShowPitchModal(true);
                    }}
                    className="flex items-center gap-1.5 text-indigo-600 font-bold hover:underline cursor-pointer"
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
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Co-Founder Proposals</h3>
              <p className="text-xs text-slate-500">Review pitches and collaboration requests from builders</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
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
                <div key={c.id} className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/60 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <strong className="text-xs font-bold text-slate-900">{c.senderName}</strong>
                      <p className="text-xs text-indigo-700 font-semibold">{c.projectName} ({c.roleOffered})</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {c.equityOffered}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                    "{c.pitchMessage}"
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        setActiveChatBuilder({ name: c.senderName, role: c.roleOffered });
                        setMessagingOpen(true);
                      }}
                      className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Chat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SLEEK FLOATING MESSAGING PILL (Bottom Right) */}
      <div className="fixed bottom-0 right-6 z-40 w-72 shadow-xl rounded-t-2xl border border-slate-200 bg-white overflow-hidden transition-all">
        <div 
          onClick={() => setMessagingOpen(!messagingOpen)}
          className="p-3 bg-white border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
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
                      ? 'bg-indigo-600 text-white ml-auto rounded-tr-none'
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
                className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!newMsgText.trim()}
                className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-40 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* PITCH MODAL */}
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
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                      className="w-full p-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-xs"
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

      {/* POST PROFILE MODAL */}
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
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg shadow-xs"
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
