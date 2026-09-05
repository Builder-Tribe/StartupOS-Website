import React, { useState } from 'react';
import { Lightbulb, CheckCircle2, ArrowRight, Copy, Check, Plus, AlertCircle, Sparkles } from './icons';

export default function IdeaLab({ ideas, activeIdea, setActiveIdea, onSaveIdea, onNewIdea }) {
  const [formData, setFormData] = useState({
    idea: '',
    audience: '',
    budget: '',
    problem: '',
    alternatives: '',
    advantage: ''
  });
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSaveIdea(formData);
      setFormData({ idea: '', audience: '', budget: '', problem: '', alternatives: '', advantage: '' });
    } catch (err) {
      alert(err.message || 'Error saving idea');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPrompt = (promptText) => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar - Saved Ideas Library */}
      <aside className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col h-fit shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Idea Library
          </h2>
          <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2.5 py-0.5 rounded-full font-mono font-semibold">
            {ideas.length} Saved
          </span>
        </div>

        <button
          onClick={onNewIdea}
          className="w-full mb-4 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 active:scale-98"
        >
          <Plus className="w-4 h-4" /> + Create New Workspace
        </button>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
          {ideas.length === 0 ? (
            <p className="text-slate-400 text-xs italic text-center py-6">
              No saved ideas yet. Fill out the intake form to score your first idea!
            </p>
          ) : (
            ideas.map((item) => {
              const isSelected = activeIdea?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveIdea(item)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-500 shadow-sm ring-1 ring-indigo-400'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900 text-xs line-clamp-1">{item.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono ${
                        item.score >= 70
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.score}/100
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{item.summary}</p>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:col-span-8">
        {!activeIdea ? (
          /* Intake Form */
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <span className="text-xs text-indigo-600 uppercase tracking-widest font-mono font-bold bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                Phase 1: Idea Intake & Viability Engine
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
                What startup concept do you want to build?
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Answer 6 core questions to get a 100-point directional viability score, custom validation steps, and an AI-builder prompt.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                  Describe the core product idea <span className="text-indigo-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.idea}
                  onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
                  placeholder="e.g. An AI-powered platform that matches solo travelers based on travel vibe and budget"
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                    Who has this problem? <span className="text-indigo-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    placeholder="e.g. Gen Z solo backpackers & digital nomads"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                    Test budget / timeframe
                  </label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="e.g. ₹25,000 or 2 weeks bootstrapped"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                  What painful problem does it solve? <span className="text-indigo-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.problem}
                  onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                  placeholder="What is costly, frustrating, slow, or unsafe about how people solve this today?"
                  className="w-full bg-white border border-slate-200 rounded-xl p-3.5 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                    What existing workarounds do they use?
                  </label>
                  <input
                    type="text"
                    value={formData.alternatives}
                    onChange={(e) => setFormData({ ...formData, alternatives: e.target.value })}
                    placeholder="e.g. Instagram groups, WhatsApp, spreadsheets"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 font-mono">
                    What is your key differentiator?
                  </label>
                  <input
                    type="text"
                    value={formData.advantage}
                    onChange={(e) => setFormData({ ...formData, advantage: e.target.value })}
                    placeholder="e.g. AI vibe matching & identity safety check"
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                {isSubmitting ? (
                  'Calculating Score & Generating Prompt…'
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Calculate Viability & Create Workspace <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Active Idea Workspace View */
          <div className="space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs text-indigo-600 font-mono font-bold uppercase tracking-widest bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                    Active Idea Workspace
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{activeIdea.name}</h1>
                </div>
                <button
                  onClick={onNewIdea}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-xl font-semibold border border-slate-200 transition-all"
                >
                  + New Idea
                </button>
              </div>

              {/* Viability Score Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 p-6 rounded-2xl border border-slate-200/90 mb-6 shadow-xs">
                <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-6">
                  <div className="text-4xl font-extrabold text-slate-900 flex items-center justify-center md:justify-start gap-2">
                    <span className={activeIdea.score >= 70 ? 'text-emerald-600' : 'text-amber-600'}>
                      {activeIdea.score}
                    </span>
                    <span className="text-xl text-slate-400">/ 100</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-mono uppercase font-semibold">Viability Score Signal</p>
                </div>
                <div className="md:col-span-8">
                  <p className="text-sm font-bold text-indigo-700 mb-1">{activeIdea.verdict}</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{activeIdea.summary}</p>
                </div>
              </div>

              {/* Score Breakdown Cards */}
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 font-mono">Score Breakdown (5 Criteria)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {activeIdea.scoreBreakdown?.map((card, idx) => (
                  <div key={idx} className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-800">{card.label}</span>
                      <span className="text-xs font-bold text-indigo-600 font-mono">{card.score}/20</span>
                    </div>
                    <p className="text-xs text-slate-600">{card.reason}</p>
                  </div>
                ))}
              </div>

              {/* Next Steps */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Recommended Validation Steps
                </h3>
                <ul className="space-y-2">
                  {activeIdea.nextSteps?.map((step, idx) => (
                    <li key={idx} className="text-xs text-slate-700 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 flex items-start gap-2">
                      <span className="text-indigo-600 font-mono font-bold">{idx + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI Build Prompt */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-600" /> Generated AI Builder Prompt
                  </h3>
                  <button
                    onClick={() => handleCopyPrompt(activeIdea.buildPrompt)}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied Prompt' : 'Copy Prompt'}
                  </button>
                </div>
                <pre className="bg-slate-900 p-4 rounded-xl text-xs font-mono text-slate-200 border border-slate-800 whitespace-pre-wrap overflow-x-auto">
                  {activeIdea.buildPrompt}
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
