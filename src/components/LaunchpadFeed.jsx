import React, { useState, useEffect } from 'react';
import { 
  ChevronUp, MessageSquare, ExternalLink, Sparkles, Trophy, 
  Flame, Calendar, Search, Tag, Eye, X, Send, Share2, Award
} from 'lucide-react';

export default function LaunchpadFeed({ currentUser, onOpenLaunchModal }) {
  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLaunch, setSelectedLaunch] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchLaunches = async () => {
    try {
      const res = await fetch('/api/launches');
      if (res.ok) {
        const data = await res.json();
        setLaunches(data);
      }
    } catch (e) {
      console.error('Failed to load launches:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaunches();
  }, []);

  const handleUpvote = async (launchId, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/launches/${launchId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (res.ok) {
        const updated = await res.json();
        setLaunches(launches.map(l => l.id === launchId ? updated : l));
        if (selectedLaunch && selectedLaunch.id === launchId) {
          setSelectedLaunch(updated);
        }
      }
    } catch (err) {
      console.error('Upvote failed:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim() || !selectedLaunch) return;
    try {
      const res = await fetch(`/api/launches/${selectedLaunch.id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: commentInput,
          author: currentUser.name,
          avatar: currentUser.avatar
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedLaunch(updated);
        setLaunches(launches.map(l => l.id === updated.id ? updated : l));
        setCommentInput('');
      }
    } catch (err) {
      console.error('Comment failed:', err);
    }
  };

  const categories = ['All', 'AI Vision', 'Solo Travel AI', 'B2B Fintech', 'Creator Marketplace', 'Developer Tool'];

  const filteredLaunches = launches.filter(l => {
    const matchesCat = activeCategory === 'All' || l.category === activeCategory;
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featuredProduct = launches[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Product Hunt Style Hero Header */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 overflow-hidden shadow-2xl border border-indigo-900/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>StartupOS AI Product Exchange</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Launch, Discover & Upvote Next-Gen AI Products.
          </h1>

          <p className="text-slate-300 text-base md:text-lg font-medium leading-relaxed">
            The community launchpad for AI startups built with AntiGravity, Replit, Emergent, and Claude. Vote for your favorites or launch your own product today.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenLaunchModal}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              Launch Your Product
            </button>
            <span className="text-xs text-slate-400">Join 1,200+ AI builders launching this week</span>
          </div>
        </div>
      </div>

      {/* Featured Banner (Product of the Day) */}
      {featuredProduct && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/40 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
                #1
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-widest bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Product of the Day
                  </span>
                  <span className="text-xs text-slate-500">• {featuredProduct.category}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{featuredProduct.title}</h3>
                <p className="text-sm text-slate-600 font-medium line-clamp-1">{featuredProduct.tagline}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={(e) => handleUpvote(featuredProduct.id, e)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border font-bold text-sm transition-all ${
                  featuredProduct.upvotedBy.includes(currentUser.id)
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                    : 'bg-white text-slate-800 border-slate-300 hover:border-indigo-500 hover:text-indigo-600'
                }`}
              >
                <ChevronUp className="w-5 h-5" />
                <span>UPVOTE</span>
                <span className="ml-1 font-mono text-xs px-2 py-0.5 rounded-lg bg-black/10">
                  {featuredProduct.upvotes}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search AI launches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Launches Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            Trending AI Launches
          </h2>
          <span className="text-xs font-semibold text-slate-500">{filteredLaunches.length} products listed</span>
        </div>

        {filteredLaunches.map((item, index) => {
          const isUpvoted = item.upvotedBy.includes(currentUser.id);

          return (
            <div
              key={item.id}
              onClick={() => setSelectedLaunch(item)}
              className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
            >
              {/* Left Info */}
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md shrink-0">
                  {item.title[0]}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {item.category}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 text-sm font-medium line-clamp-1">
                    {item.tagline}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-slate-500">
                      <span>{item.maker.avatar}</span> {item.maker.name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      {item.comments.length} comments
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action (Upvote Button) */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                {item.demoUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewUrl(item.demoUrl);
                    }}
                    className="p-3 rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-xs font-semibold flex items-center gap-1.5"
                    title="Live Preview"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden md:inline">Demo</span>
                  </button>
                )}

                <button
                  onClick={(e) => handleUpvote(item.id, e)}
                  className={`flex flex-col items-center justify-center px-4 py-2.5 rounded-2xl border font-bold text-xs transition-all min-w-[72px] ${
                    isUpvoted
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600'
                  }`}
                >
                  <ChevronUp className={`w-4 h-4 ${isUpvoted ? 'text-white' : 'text-slate-500'}`} />
                  <span className="text-sm font-extrabold mt-0.5">{item.upvotes}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Launch Details Modal */}
      {selectedLaunch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedLaunch(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg">
                {selectedLaunch.title[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {selectedLaunch.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">{selectedLaunch.title}</h2>
                <p className="text-sm text-slate-600 font-medium mt-0.5">{selectedLaunch.tagline}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About Product</h4>
              <p className="text-sm text-slate-800 leading-relaxed font-medium">{selectedLaunch.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedLaunch.tags.map((t, idx) => (
                <span key={idx} className="text-xs font-mono px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  #{t}
                </span>
              ))}
            </div>

            {/* Comments Discussion Board */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Maker Discussion ({selectedLaunch.comments.length})
              </h3>

              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask the maker a question or leave feedback..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 text-sm"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </form>

              <div className="space-y-3">
                {selectedLaunch.comments.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{c.avatar}</span> {c.author}
                      </span>
                      <span className="text-slate-400">{c.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium pl-6">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-sm">Live Product Demo Preview</span>
              </div>
              <button onClick={() => setPreviewUrl(null)} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <iframe src={previewUrl} className="w-full flex-1 border-0" title="Product Preview"></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
