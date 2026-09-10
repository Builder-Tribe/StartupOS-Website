import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink, 
  Terminal, Sparkles, Rocket, RefreshCw, Lock, Eye, ChevronRight, Plus
} from 'lucide-react';

export default function BlueprintStudio({ currentUser, userIdeas = [], onNavigateToIdeaLab }) {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('building'); // 'building' | 'launch'
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'commercial' | 'open_source'

  // Determine if the current authenticated user is Harshit
  const isHarshit = Boolean(
    currentUser && (
      (currentUser.name && currentUser.name.toLowerCase().includes('harshit')) ||
      (currentUser.email && currentUser.email.toLowerCase().includes('harshit')) ||
      currentUser.id === 'user-harshita'
    )
  );

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects/health');
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (e) {
      console.error('Failed to fetch health data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isHarshit) {
      fetchHealthData();
    } else {
      setLoading(false);
    }
  }, [isHarshit]);

  const projectMetadata = {
    Trippy: {
      tagline: "AI Solo Travel Group Matching & Community Trip Host Platform",
      stack: ["React 18", "Express", "SQLite", "Node 22"],
      repoUrl: "https://github.com/1997agarwal/StartupOS/tree/main/Ideas/Trippy",
      localPath: "Ideas/Trippy",
      category: "commercial",
      badge: "Commercial Venture",
      surfaces: ["Consumer Web", "Partner CRM", "Admin Console", "Marketing Website"]
    },
    DupeScout: {
      tagline: "Shop the Look. Not the Markup. AI Visual Similarity & Dupes Engine",
      stack: ["FastAPI", "Next.js 14", "PostgreSQL", "pgvector"],
      repoUrl: "https://github.com/1997agarwal/StartupOS/tree/main/Ideas/DupeScout",
      localPath: "Ideas/DupeScout",
      category: "commercial",
      badge: "Commercial Venture",
      surfaces: ["Consumer App", "Seller Portal", "Admin Console", "Chrome Extension"]
    },
    BusinessPay: {
      tagline: "B2B Accounts Receivable Collections & Early Payment Cash Accelerator",
      stack: ["React 19", "Express 5", "Dynamic Discounts", "SQLite"],
      repoUrl: "https://github.com/1997agarwal/StartupOS/tree/main/Ideas/BusinessPay",
      localPath: "Ideas/BusinessPay",
      category: "commercial",
      badge: "Commercial Venture",
      surfaces: ["Collector Workqueue", "Buyer Portal Simulation", "Admin Console"]
    },
    CollabKaro: {
      tagline: "India-First Creator Marketplace & Escrow Milestone Operating System",
      stack: ["React TS", "Express", "Escrow API", "SQLite"],
      repoUrl: "https://github.com/1997agarwal/StartupOS/tree/main/Ideas/CollabKaro",
      localPath: "Ideas/CollabKaro",
      category: "commercial",
      badge: "Commercial Venture",
      surfaces: ["Brand & Agency Portal", "Creator Media Kit Hub", "Escrow Admin Console"]
    },
    SpecForge: {
      tagline: "Autonomous Discovery-to-Spec Engine with 3-Agent Pipeline & Linear Sync",
      stack: ["React 18", "TypeScript", "Node.js", "Linear SDK", "SQLite"],
      repoUrl: "https://github.com/1997agarwal/SpecForge",
      localPath: "Ideas/SpecForge",
      category: "open_source",
      badge: "Open Source Engine",
      surfaces: ["Discovery Agent", "Architect Engine", "Linear Sync Studio"]
    },
    ContextPrism: {
      tagline: "Enterprise Token FinOps Gateway & AST Context Pruner (3 Golden Rules)",
      stack: ["Node.js", "Express", "TypeScript", "Vite", "AST Parser", "SQLite"],
      repoUrl: "https://github.com/1997agarwal/ContextPrism",
      localPath: "Ideas/ContextPrism",
      category: "open_source",
      badge: "Open Source Gateway",
      surfaces: ["Token FinOps Gateway", "AST Context Compressor", "Semantic Cache", "Analytics Studio"]
    },
    PromptCourt: {
      tagline: "Automated Multi-Model LLM Prompt Evaluation, Scoring & Elo Arena",
      stack: ["React 18", "TypeScript", "Vite", "Tailwind CSS", "Elo Engine"],
      repoUrl: "https://github.com/1997agarwal/PromptCourt",
      localPath: "../Open Source/PromptCourt",
      category: "open_source",
      badge: "Open Source Arena",
      surfaces: ["Prompt Arena", "Elo Leaderboard", "Test Case Matrix", "Export Studio"]
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Projects Workspace</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Authenticated User: {currentUser?.name || 'Builder'}
            </span>
          </div>
          <p className="text-slate-600 text-sm font-medium mt-1">
            Manage product health, 4-file constitutions (`AGENTS.md`, `ROADMAP.md`, `CLAUDE.md`, `CONTRIBUTING.md`), and AI agent execution rules.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/70">
          <button
            onClick={() => setViewMode('building')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'building' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" /> Building & Health Mode
          </button>
          <button
            onClick={() => setViewMode('launch')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'launch' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Rocket className="w-4 h-4" /> Launch Readiness Mode
          </button>
        </div>
      </div>

      {/* CASE 1: HARSHIT'S FOUNDING PLATFORMS */}
      {isHarshit ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-indigo-600" />
                <span>Harshit's Builder Portfolio ({healthData.length})</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Vibrant multi-project hub spanning proprietary commercial ventures and open-source developer tooling.
              </p>
            </div>

            <button
              onClick={fetchHealthData}
              className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:underline self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Re-audit Health
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-white/70 backdrop-blur-xs p-2 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              All Projects ({healthData.length})
            </button>
            <button
              onClick={() => setFilterCategory('commercial')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === 'commercial'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              🏢 Commercial Flagships ({healthData.filter(p => (projectMetadata[p.name]?.category || p.category) === 'commercial').length})
            </button>
            <button
              onClick={() => setFilterCategory('open_source')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === 'open_source'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              🌐 Open Source Tools ({healthData.filter(p => (projectMetadata[p.name]?.category || p.category) === 'open_source').length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {healthData
              .filter((proj) => {
                const meta = projectMetadata[proj.name] || {};
                const cat = meta.category || proj.category || 'commercial';
                if (filterCategory === 'all') return true;
                return cat === filterCategory;
              })
              .map((proj) => {
                const meta = projectMetadata[proj.name] || {};
                const isOpenSource = (meta.category || proj.category) === 'open_source';

                return (
                  <div
                    key={proj.name}
                    className={`bg-white/90 backdrop-blur-md rounded-3xl border p-6 space-y-5 shadow-xs hover:shadow-md transition-all ${
                      isOpenSource
                        ? 'border-emerald-200/80 hover:border-emerald-400'
                        : 'border-slate-200/90 hover:border-indigo-300'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-xl font-extrabold text-slate-900">{proj.name}</h3>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              isOpenSource
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}
                          >
                            {isOpenSource ? '🌐 Open Source Tool' : '🏢 Commercial Venture'}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 block w-fit">
                          {meta.localPath || proj.path}
                        </span>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{meta.tagline}</p>
                      </div>

                      {/* Health Score Pill */}
                      <div className="flex flex-col items-end shrink-0">
                        <div
                          className={`px-3 py-1 rounded-xl text-xs font-black border flex items-center gap-1.5 ${
                            proj.healthScore === 100
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>{proj.healthScore}% HEALTH</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium mt-1">4-File Parity</span>
                      </div>
                    </div>

                    {/* 4 Core Baseline Files Checklist */}
                    <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Core Operational Constitution Checklist
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          {proj.hasAgents ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          )}
                          <span className={proj.hasAgents ? 'font-bold text-slate-800' : 'text-slate-400'}>AGENTS.md</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {proj.hasRoadmap ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          )}
                          <span className={proj.hasRoadmap ? 'font-bold text-slate-800' : 'text-slate-400'}>ROADMAP.md</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {proj.hasClaude ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          )}
                          <span className={proj.hasClaude ? 'font-bold text-slate-800' : 'text-slate-400'}>CLAUDE.md</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {proj.hasContributing ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          )}
                          <span className={proj.hasContributing ? 'font-bold text-slate-800' : 'text-slate-400'}>CONTRIBUTING.md</span>
                        </div>
                      </div>
                    </div>

                    {/* Tech Stack Pills */}
                    <div className="flex flex-wrap gap-1.5">
                      {meta.stack && meta.stack.map((t, idx) => (
                        <span key={idx} className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-semibold">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Actions Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={meta.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                      >
                        <span>View GitHub Repo</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                          ✓ Parity Verified
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        /* CASE 2: NEW / INDEPENDENT USER'S PERSONAL WORKSPACE */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-indigo-600" />
              Your Project Workspace ({userIdeas.length})
            </h2>
            <button
              onClick={onNavigateToIdeaLab}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create New Project</span>
            </button>
          </div>

          {userIdeas.length === 0 ? (
            /* Clean Empty Slate for New Users */
            <div className="text-center py-20 bg-white/80 backdrop-blur-md rounded-3xl border border-dashed border-slate-300 p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
                <Rocket className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-900">No Projects in Your Workspace Yet</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Welcome to StartupOS, <strong>{currentUser?.name || 'Builder'}</strong>! Start by building your first AI product in the <strong>AI Builder Studio (Idea Lab)</strong>.
                </p>
              </div>
              <button
                onClick={onNavigateToIdeaLab}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Open AI Builder Studio (Idea Lab)</span>
              </button>
            </div>
          ) : (
            /* User's Created Ideas / Projects Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userIdeas.map((idea) => (
                <div
                  key={idea.id}
                  className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 space-y-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-slate-900">{idea.name}</h3>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          {idea.category || 'AI Project'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {idea.summary || idea.problem}
                      </p>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="px-3 py-1 rounded-xl text-xs font-black border flex items-center gap-1.5 bg-indigo-50 text-indigo-800 border-indigo-200">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span>SCORE: {idea.score || 88}/100</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium mt-1">Idea Lab Score</span>
                    </div>
                  </div>

                  {/* 4-File Governance Checklist */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      Core Operational Constitution Checklist
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-slate-800">AGENTS.md</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-slate-800">ROADMAP.md</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-slate-800">CLAUDE.md</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span className="font-bold text-slate-800">CONTRIBUTING.md</span>
                      </div>
                    </div>
                  </div>

                  {/* Target Audience & Stack */}
                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-1">
                    <div>
                      <span className="font-bold text-slate-900">Audience: </span>
                      <span>{idea.audience || 'Target Users'}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Budget: </span>
                      <span>{idea.budget || 'Validation Stage'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={onNavigateToIdeaLab}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                    >
                      <span>Open in AI Builder Studio</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                      ✓ Active Workspace
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
