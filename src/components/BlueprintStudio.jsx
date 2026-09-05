import React, { useState } from 'react';
import { SHOWCASE_BLUEPRINTS } from '../data/blueprints';
import { ShoppingBag, Compass, Users, GraduationCap, FolderKanban, FileText, Copy, Check, ExternalLink, Code2, Layers, Target, CheckCircle2, Plus, Sparkles } from './icons';

const iconMap = {
  ShoppingBag,
  Compass,
  Users,
  GraduationCap,
  FolderKanban,
  FileText
};

export default function BlueprintStudio({ currentUser, userIdeas, onNavigateToIdeaLab }) {
  // Combine mapped project blueprints matching currentUser.id + user's created ideas from Startup OS
  const mappedProjects = SHOWCASE_BLUEPRINTS.filter(
    (bp) => bp.ownerId === currentUser.id || bp.ownerId === 'user-harshita' && currentUser.id === 'user-harshita'
  );

  // Dynamically add ideas created by this user via Startup OS
  const createdProjectBlueprints = userIdeas.map((idea) => ({
    id: idea.id,
    ownerId: currentUser.id,
    ownerName: currentUser.name,
    title: idea.name,
    tagline: idea.summary,
    category: "Startup OS Built Product",
    status: idea.verdict || "Validated MVP",
    icon: "Code2",
    summary: idea.summary,
    targetAudience: idea.audience,
    keyFeatures: idea.nextSteps || ["AI Prompting", "Interactive Workflow"],
    prd: {
      overview: idea.summary,
      problem: idea.problem,
      solution: idea.advantage || "AI-powered product workflow.",
      competitorResearch: [
        idea.alternatives ? `Existing alternative: ${idea.alternatives}` : "Manual spreadsheets & legacy tools."
      ],
      technicalArchitecture: {
        frontend: "React / Vite / Tailwind CSS",
        backend: "Node.js REST API",
        database: "PostgreSQL / JSON Store"
      },
      buildPrompt: idea.buildPrompt
    }
  }));

  const userProjects = currentUser.id === 'user-harshita'
    ? [...mappedProjects, ...createdProjectBlueprints]
    : createdProjectBlueprints;

  const [selectedBlueprint, setSelectedBlueprint] = useState(userProjects[0] || SHOWCASE_BLUEPRINTS[0]);
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  const IconComponent = iconMap[selectedBlueprint?.icon] || Code2;

  const handleCopyPrompt = (promptText) => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Studio Header with User Auth Context */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-xs text-indigo-600 font-mono font-bold uppercase tracking-widest bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
            Phase 2: User-Authenticated Workspace
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 tracking-tight flex flex-wrap items-center gap-3">
            <span>My Projects</span>
            <span className="text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/90 px-3 py-1 rounded-full">
              {currentUser.avatar} Logged in as {currentUser.name}
            </span>
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            View, manage, and export PRD specifications for projects mapped to your account or created using Startup OS.
          </p>
        </div>

        <button
          onClick={onNavigateToIdeaLab}
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-700 hover:to-violet-800 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-2 transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" /> Create New Project via Startup OS
        </button>
      </div>

      {/* User Projects Grid */}
      {userProjects.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
          <div className="text-4xl">🚀</div>
          <h3 className="text-lg font-bold text-slate-900">No Projects Mapped Yet</h3>
          <p className="text-xs text-slate-600">
            You are logged in as <strong>{currentUser.name}</strong>. You haven't mapped existing projects or created a project using Startup OS yet.
          </p>
          <button
            onClick={onNavigateToIdeaLab}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md"
          >
            Start Idea Lab & Build First Project →
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {userProjects.map((bp) => {
              const Icon = iconMap[bp.icon] || Code2;
              const isSelected = selectedBlueprint?.id === bp.id;
              return (
                <button
                  key={bp.id}
                  onClick={() => {
                    setSelectedBlueprint(bp);
                    setActiveTab('overview');
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-500 shadow-md ring-1 ring-indigo-400'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
                      Mapped to {bp.ownerName || currentUser.name}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{bp.title}</h3>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{bp.category}</p>
                </button>
              );
            })}
          </div>

          {/* Selected Project Specification Detail Studio */}
          {selectedBlueprint && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 border-b border-slate-200 pb-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-600 shadow-xs">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{selectedBlueprint.title}</h2>
                      <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        {selectedBlueprint.status || 'Validated'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-indigo-700 mt-0.5">{selectedBlueprint.tagline}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopyPrompt(selectedBlueprint.prd?.buildPrompt || '')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied AI Prompt' : 'Copy AI Build Prompt'}
                  </button>
                </div>
              </div>

              {/* Inner Tabs */}
              <div className="flex border-b border-slate-200 gap-4 mb-6 overflow-x-auto pb-1">
                {[
                  { id: 'overview', label: 'Overview & Target Audience' },
                  { id: 'prd', label: 'PRD Specs' },
                  { id: 'competitors', label: 'Competitor Analysis' },
                  { id: 'architecture', label: 'Technical Architecture' },
                  { id: 'prompt', label: 'AI Builder Prompt' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content Rendering */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs uppercase font-mono text-slate-500 font-bold tracking-wider mb-2">Project Summary</h4>
                    <p className="text-sm text-slate-700 leading-relaxed">{selectedBlueprint.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-xs uppercase font-mono text-indigo-700 font-bold tracking-wider mb-2 flex items-center gap-1.5">
                        <Target className="w-4 h-4" /> Target Audience
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed">{selectedBlueprint.targetAudience}</p>
                    </div>
                    <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-xs uppercase font-mono text-indigo-700 font-bold tracking-wider mb-2 flex items-center gap-1.5">
                        <Layers className="w-4 h-4" /> Proposed Solution
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed">{selectedBlueprint.prd?.solution}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'prd' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs uppercase font-mono text-indigo-700 font-bold tracking-wider mb-2">Problem Statement</h4>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                      {selectedBlueprint.prd?.problem}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs uppercase font-mono text-indigo-700 font-bold tracking-wider mb-2">Product Solution</h4>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                      {selectedBlueprint.prd?.solution}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'competitors' && (
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-mono text-indigo-700 font-bold tracking-wider mb-2">Competitor Analysis</h4>
                  <div className="space-y-3">
                    {selectedBlueprint.prd?.competitorResearch?.map((comp, idx) => (
                      <div key={idx} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        {comp}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'architecture' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Object.entries(selectedBlueprint.prd?.technicalArchitecture || {}).map(([key, val]) => (
                    <div key={key} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                      <span className="text-xs font-mono uppercase text-indigo-700 font-bold">{key}</span>
                      <p className="text-xs text-slate-800 font-mono mt-2 leading-relaxed">{val}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'prompt' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-500 font-semibold">Structured AI Build Execution Prompt</span>
                    <button
                      onClick={() => handleCopyPrompt(selectedBlueprint.prd?.buildPrompt || '')}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy Prompt'}
                    </button>
                  </div>
                  <pre className="bg-slate-900 p-4 rounded-xl text-xs font-mono text-slate-200 border border-slate-800 whitespace-pre-wrap overflow-x-auto">
                    {selectedBlueprint.prd?.buildPrompt}
                  </pre>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
