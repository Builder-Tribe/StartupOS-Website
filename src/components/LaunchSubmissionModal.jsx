import React, { useState } from 'react';
import { X, Sparkles, Rocket, CheckCircle2, ShieldCheck, Award, Layers, Zap } from 'lucide-react';

export default function LaunchSubmissionModal({ isOpen, onClose, onLaunchSubmitted, currentUser, ideas = [] }) {
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    category: 'AI Vision',
    demoUrl: '',
    tags: 'React, AI, Express'
  });

  const [checklist, setChecklist] = useState({
    hasParity: true,
    hasPersona: true,
    hasDemo: true,
    hasLightUI: true
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const readinessScore = (
    (checklist.hasParity ? 25 : 0) +
    (checklist.hasPersona ? 25 : 0) +
    (checklist.hasDemo ? 25 : 0) +
    (checklist.hasLightUI ? 25 : 0)
  );
  const isCertified = readinessScore === 100;

  const handleAutoFill = (ideaId) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;
    setFormData({
      title: idea.name || '',
      tagline: idea.advantage || idea.summary || `AI-powered solution for ${idea.audience}`,
      description: idea.problem ? `${idea.problem}\n\nTarget Audience: ${idea.audience}` : '',
      category: idea.category || 'Developer Tool',
      demoUrl: idea.demoUrl || 'https://github.com/Builder-Tribe/StartupOS',
      tags: 'React 18, Vite, Tailwind v4, AI Agent'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/launches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          tagline: formData.tagline,
          description: formData.description || formData.tagline,
          category: formData.category,
          demoUrl: formData.demoUrl,
          tags: formData.tags.split(',').map(t => t.trim()),
          readinessScore,
          isCertified,
          maker: { name: currentUser.name, avatar: currentUser.avatar, title: 'Maker' }
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to launch product');
      }

      const launched = await res.json();
      onLaunchSubmitted(launched);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/80">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Launch Product on StartupOS</h2>
            <p className="text-xs text-slate-500 font-medium">Showcase your product to the AI founder community</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        {/* 1-Click Workspace Auto-Fill */}
        {ideas.length > 0 && (
          <div className="bg-indigo-50/70 border border-indigo-200/80 p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-900">Auto-Fill from Workspace:</span>
            </div>
            <select
              onChange={(e) => handleAutoFill(e.target.value)}
              className="bg-white border border-indigo-300 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>Select workspace project...</option>
              {ideas.map((idea) => (
                <option key={idea.id} value={idea.id}>
                  {idea.name} ({idea.score || 85} pts)
                </option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Product Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. DupeScout"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Short Tagline</label>
            <input
              type="text"
              required
              value={formData.tagline}
              onChange={(e) => setFormData({...formData, tagline: e.target.value})}
              placeholder="e.g. Shop the Look. Not the Markup. AI Visual Similarity."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>AI Vision</option>
                <option>Solo Travel AI</option>
                <option>B2B Fintech</option>
                <option>Creator Marketplace</option>
                <option>Developer Tool</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Demo / GitHub Link</label>
              <input
                type="url"
                value={formData.demoUrl}
                onChange={(e) => setFormData({...formData, demoUrl: e.target.value})}
                placeholder="https://..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Detailed Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your product value proposition, features, and target audience..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Tech Stack Tags (Comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="React, Express, SQLite, pgvector"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* 100-Point Launch Readiness & Parity Checklist */}
          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Launch Readiness Audit
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                  isCertified 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-amber-50 text-amber-700 border-amber-300'
                }`}>
                  {readinessScore}/100 PTS
                </span>
                {isCertified && (
                  <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                    🏆 Certified
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.hasParity}
                  onChange={(e) => setChecklist({...checklist, hasParity: e.target.checked})}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-slate-700">
                  4-File Parity Constitution (`AGENTS.md`, `ROADMAP.md`, `CLAUDE.md`, `CONTRIBUTING.md`) (+25 pts)
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.hasPersona}
                  onChange={(e) => setChecklist({...checklist, hasPersona: e.target.checked})}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-slate-700">
                  Validated User Persona, Pain Point & Value Proposition (+25 pts)
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.hasDemo}
                  onChange={(e) => setChecklist({...checklist, hasDemo: e.target.checked})}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-slate-700">
                  Live Working Demo or Public GitHub Codebase URL (+25 pts)
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checklist.hasLightUI}
                  onChange={(e) => setChecklist({...checklist, hasLightUI: e.target.checked})}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span className="font-semibold text-slate-700">
                  Clean 2026 Light UI Standard & Responsive Viewports (+25 pts)
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {submitting ? 'Launching...' : 'Submit Launch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
