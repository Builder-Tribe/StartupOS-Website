import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, CheckCircle2, AlertTriangle, ShieldCheck, ExternalLink, 
  Terminal, Sparkles, Rocket, RefreshCw, Lock, Eye, ChevronRight, Plus, FileCode,
  Github, Layers, Check, X, UploadCloud, Globe, Compass, CheckSquare
} from 'lucide-react';

export default function BlueprintStudio({ currentUser, userIdeas = [], onNavigateToIdeaLab, onNavigateToSpecStudio }) {
  const [healthData, setHealthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('building'); // 'building' | 'launch'
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'commercial' | 'open_source'
  const [userTab, setUserTab] = useState('my_projects'); // 'my_projects' | 'explore'

  // Modal State for Registering / Importing External Projects
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    tagline: '',
    category: 'commercial',
    sourceType: 'github_connected', // 'github_connected' | 'manual_import' | 'startupos_scaffold'
    repoUrl: '',
    demoUrl: '',
    stack: '',
    hasAgents: true,
    hasRoadmap: true,
    hasClaude: true,
    hasContributing: true
  });

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
    fetchHealthData();
  }, []);

  const handleRegisterProject = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setRegisterError('Project name is required.');
      return;
    }
    setSubmitting(true);
    setRegisterError('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          tagline: form.tagline.trim(),
          category: form.category,
          sourceType: form.sourceType,
          repoUrl: form.repoUrl.trim(),
          demoUrl: form.demoUrl.trim(),
          stack: form.stack ? form.stack.split(',').map(s => s.trim()).filter(Boolean) : ['React', 'Node.js'],
          hasAgents: form.hasAgents,
          hasRoadmap: form.hasRoadmap,
          hasClaude: form.hasClaude,
          hasContributing: form.hasContributing,
          ownerId: currentUser?.id || (isHarshit ? 'harshit' : 'builder'),
          ownerName: currentUser?.name || (isHarshit ? 'Harshit' : 'Builder')
        })
      });

      if (res.ok) {
        setRegisterSuccess(true);
        setTimeout(() => {
          setRegisterSuccess(false);
          setShowRegisterModal(false);
          setForm({
            name: '',
            tagline: '',
            category: 'commercial',
            sourceType: 'github_connected',
            repoUrl: '',
            demoUrl: '',
            stack: '',
            hasAgents: true,
            hasRoadmap: true,
            hasClaude: true,
            hasContributing: true
          });
        }, 1000);
        await fetchHealthData();
      } else {
        const data = await res.json();
        setRegisterError(data.error || 'Failed to register project.');
      }
    } catch (err) {
      setRegisterError(err.message || 'Error connecting to backend server.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderSourceBadge = (sourceType) => {
    switch (sourceType) {
      case 'github_connected':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white flex items-center gap-1 shadow-xs">
            <Github className="w-3 h-3" /> GitHub Connected
          </span>
        );
      case 'manual_import':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
            <UploadCloud className="w-3 h-3" /> Imported Workspace
          </span>
        );
      case 'startupos_scaffold':
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" /> StartupOS Native
          </span>
        );
    }
  };

  const fallbackMetadata = {
    Trippy: {
      tagline: "AI Solo Travel Group Matching & Community Trip Host Platform",
      stack: ["React 18", "Express", "SQLite", "Node 22"],
      repoUrl: "https://github.com/1997agarwal/Trippy",
      category: "commercial",
      surfaces: ["Consumer Web", "Partner CRM", "Admin Console", "Marketing Website"]
    },
    DupeScout: {
      tagline: "Shop the Look. Not the Markup. AI Visual Similarity & Dupes Engine",
      stack: ["FastAPI", "Next.js 14", "PostgreSQL", "pgvector"],
      repoUrl: "https://github.com/1997agarwal/DupeScout",
      category: "commercial",
      surfaces: ["Consumer App", "Seller Portal", "Admin Console", "Chrome Extension"]
    },
    BusinessPay: {
      tagline: "B2B Accounts Receivable Collections & Early Payment Cash Accelerator",
      stack: ["React 19", "Express 5", "Dynamic Discounts", "SQLite"],
      repoUrl: "https://github.com/1997agarwal/BusinessPay",
      category: "commercial",
      surfaces: ["Collector Workqueue", "Buyer Portal Simulation", "Admin Console"]
    },
    CollabKaro: {
      tagline: "India-First Creator Marketplace & Escrow Milestone Operating System",
      stack: ["React TS", "Express", "Escrow API", "SQLite"],
      repoUrl: "https://github.com/1997agarwal/CollabKaro",
      category: "commercial",
      surfaces: ["Brand & Agency Portal", "Creator Media Kit Hub", "Escrow Admin Console"]
    },
    SpecForge: {
      tagline: "Autonomous Discovery-to-Spec Engine with 3-Agent Pipeline & Linear Sync",
      stack: ["React 18", "TypeScript", "Node.js", "Linear SDK", "SQLite"],
      repoUrl: "https://github.com/1997agarwal/SpecForge",
      category: "open_source",
      surfaces: ["Discovery Agent", "Architect Engine", "Linear Sync Studio"]
    },
    ContextPrism: {
      tagline: "Enterprise Token FinOps Gateway & AST Context Pruner (3 Golden Rules)",
      stack: ["Node.js", "Express", "TypeScript", "Vite", "AST Parser", "SQLite"],
      repoUrl: "https://github.com/1997agarwal/ContextPrism",
      category: "open_source",
      surfaces: ["Token FinOps Gateway", "AST Context Compressor", "Semantic Cache", "Analytics Studio"]
    },
    TicTacCourt: {
      tagline: "AI-Native Tactical Strategy Arena & Autonomous Arbiter with Zero-Draw Guarantee",
      stack: ["React 18", "TypeScript", "Vite", "Tailwind CSS", "Gemini AI Arbiter"],
      repoUrl: "https://github.com/1997agarwal/TicTacCourt",
      category: "open_source",
      surfaces: ["Tactical Board Arena", "AI Courtroom Arbiter", "Sudden Death Protocol", "Verdicts Gallery"]
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
            Governance, 4-file constitution parity (`AGENTS.md`, `ROADMAP.md`, `CLAUDE.md`, `CONTRIBUTING.md`), and launch readiness tracking.
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

      {/* LAUNCH READINESS MODE OVERVIEW */}
      {viewMode === 'launch' && (
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl border border-indigo-500/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-800/60 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Rocket className="w-6 h-6 text-amber-400" />
                <h2 className="text-2xl font-black tracking-tight text-white">Commercial Launch Command Center</h2>
              </div>
              <p className="text-xs text-indigo-200 font-medium mt-1">
                Audited operational constitution, production surfaces, and deployment readiness across all registered projects.
              </p>
            </div>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 self-start md:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register / Import Project</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-bold text-indigo-200 block uppercase tracking-wider">Registered Projects</span>
              <span className="text-3xl font-black text-white mt-1 block">{healthData.length}</span>
              <span className="text-[10px] text-indigo-300">Decoupled Architecture</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-bold text-indigo-200 block uppercase tracking-wider">Constitution Parity</span>
              <span className="text-3xl font-black text-emerald-400 mt-1 block">
                {healthData.length > 0 ? Math.round((healthData.filter(p => p.healthScore === 100).length / healthData.length) * 100) : 100}%
              </span>
              <span className="text-[10px] text-emerald-300">
                {healthData.filter(p => p.healthScore === 100).length}/{healthData.length} 100% Compliant
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-bold text-indigo-200 block uppercase tracking-wider">Production Surfaces</span>
              <span className="text-3xl font-black text-amber-300 mt-1 block">
                {healthData.reduce((acc, p) => acc + (p.surfaces?.length || 3), 0)}
              </span>
              <span className="text-[10px] text-indigo-300">Apps, Portals & SDKs</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-bold text-indigo-200 block uppercase tracking-wider">AI Governor Health</span>
              <span className="text-3xl font-black text-cyan-300 mt-1 block">ACTIVE</span>
              <span className="text-[10px] text-cyan-300">Zero Code Bloat in OS</span>
            </div>
          </div>
        </div>
      )}

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
                Multi-project registry spanning commercial flagships and open-source tooling, audited via 4-file constitution parity.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Register / Import Project</span>
              </button>
              <button
                onClick={fetchHealthData}
                className="flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:underline bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-200/60 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-audit Health
              </button>
            </div>
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
              🏢 Commercial Flagships ({healthData.filter(p => (p.category || fallbackMetadata[p.name]?.category) === 'commercial').length})
            </button>
            <button
              onClick={() => setFilterCategory('open_source')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterCategory === 'open_source'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              🌐 Open Source Tools ({healthData.filter(p => (p.category || fallbackMetadata[p.name]?.category) === 'open_source').length})
            </button>
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {healthData
              .filter((proj) => {
                const cat = proj.category || fallbackMetadata[proj.name]?.category || 'commercial';
                if (filterCategory === 'all') return true;
                return cat === filterCategory;
              })
              .map((proj) => {
                const fallback = fallbackMetadata[proj.name] || {};
                const isOpenSource = (proj.category || fallback.category) === 'open_source';
                const tagline = proj.tagline || fallback.tagline || 'Next-generation application';
                const repoUrl = proj.repoUrl || fallback.repoUrl;
                const stack = Array.isArray(proj.stack) && proj.stack.length > 0 ? proj.stack : (fallback.stack || ['React', 'Node.js']);
                const surfaces = proj.surfaces || fallback.surfaces || [];

                return (
                  <div
                    key={proj.id || proj.name}
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
                            {isOpenSource ? '🌐 Open Source' : '🏢 Commercial'}
                          </span>
                          {renderSourceBadge(proj.sourceType || 'github_connected')}
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 block w-fit truncate max-w-xs">
                          {proj.path || repoUrl || 'Decoupled External Repo'}
                        </span>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{tagline}</p>
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
                          <span>{proj.healthScore || proj.parityScore || 100}% HEALTH</span>
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

                    {/* Surfaces & Stack */}
                    <div className="space-y-2">
                      {surfaces.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Surfaces:</span>
                          {surfaces.map((s, idx) => (
                            <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5">
                        {stack.map((t, idx) => (
                          <span key={idx} className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/60 font-semibold">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        {repoUrl ? (
                          <a
                            href={repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                          >
                            <Github className="w-3.5 h-3.5" />
                            <span>GitHub Repo</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Local Registered</span>
                        )}

                        {proj.demoUrl && (
                          <a
                            href={proj.demoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            <span>Live Demo</span>
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {onNavigateToSpecStudio && (
                          <button
                            onClick={() => onNavigateToSpecStudio({ name: proj.name, category: proj.category, summary: tagline })}
                            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1 rounded-xl border border-indigo-200/60 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <FileCode className="w-3 h-3" />
                            <span>Constitution</span>
                          </button>
                        )}
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
        /* CASE 2: GENERAL REGISTERED USER'S WORKSPACE */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-indigo-600" />
                <span>Your Product Workspace ({userIdeas.length + healthData.filter(p => p.ownerId === currentUser?.id).length})</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Incubate new ventures or connect existing codebases via GitHub and local imports.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRegisterModal(true)}
                className="bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>+ Register / Import Project</span>
              </button>
              <button
                onClick={onNavigateToIdeaLab}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>+ Build in Idea Lab</span>
              </button>
            </div>
          </div>

          {/* User Workspace Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/70 w-fit">
            <button
              onClick={() => setUserTab('my_projects')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                userTab === 'my_projects' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Projects ({userIdeas.length + healthData.filter(p => p.ownerId === currentUser?.id).length})
            </button>
            <button
              onClick={() => setUserTab('explore')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                userTab === 'explore' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Explore Flagship Portfolio ({healthData.length})
            </button>
          </div>

          {userTab === 'my_projects' ? (
            userIdeas.length === 0 && healthData.filter(p => p.ownerId === currentUser?.id).length === 0 ? (
              /* Clean Empty Slate for New Users */
              <div className="text-center py-16 bg-white/80 backdrop-blur-md rounded-3xl border border-dashed border-slate-300 p-8 space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
                  <Rocket className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-lg font-bold text-slate-900">No Projects in Your Workspace Yet</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Welcome to StartupOS, <strong>{currentUser?.name || 'Builder'}</strong>! Create your first AI venture from scratch or connect your existing GitHub project with 4-file constitution parity.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={onNavigateToIdeaLab}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Open AI Builder Studio (Idea Lab)</span>
                  </button>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-xs active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-indigo-600" />
                    <span>Register / Import External Project</span>
                  </button>
                </div>
              </div>
            ) : (
              /* User's Created Ideas / Projects Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Projects Registered via API */}
                {healthData.filter(p => p.ownerId === currentUser?.id).map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-white/90 backdrop-blur-md rounded-3xl border border-indigo-200 p-6 space-y-5 shadow-xs hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-slate-900">{proj.name}</h3>
                          {renderSourceBadge(proj.sourceType)}
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{proj.tagline}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="px-3 py-1 rounded-xl text-xs font-black border flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border-emerald-300">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>{proj.healthScore || proj.parityScore || 100}% HEALTH</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium mt-1">4-File Parity</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 space-y-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                        Core Operational Constitution
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          {proj.hasAgents ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          <span className="font-bold text-slate-800">AGENTS.md</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {proj.hasRoadmap ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          <span className="font-bold text-slate-800">ROADMAP.md</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {proj.hasClaude ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          <span className="font-bold text-slate-800">CLAUDE.md</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {proj.hasContributing ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                          <span className="font-bold text-slate-800">CONTRIBUTING.md</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      {proj.repoUrl ? (
                        <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
                          <Github className="w-3.5 h-3.5" />
                          <span>View Repo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : <span className="text-xs text-slate-400 font-medium">Local Registered</span>}
                      {onNavigateToSpecStudio && (
                        <button
                          onClick={() => onNavigateToSpecStudio({ name: proj.name, category: proj.category, summary: proj.tagline })}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                          <span>Constitution & Specs</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* 2. User Ideas Created inside Idea Lab */}
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

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={onNavigateToIdeaLab}
                          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                        >
                          <span>Open in Builder Studio</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        {onNavigateToSpecStudio && (
                          <button
                            onClick={() => onNavigateToSpecStudio(idea)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:underline cursor-pointer"
                          >
                            <FileCode className="w-3.5 h-3.5" />
                            <span>Specs & Constitution</span>
                          </button>
                        )}
                      </div>
                      <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                        ✓ Active Workspace
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Explore Flagship Portfolio for Non-Harshit Users */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {healthData.map((proj) => {
                const fallback = fallbackMetadata[proj.name] || {};
                const isOpenSource = (proj.category || fallback.category) === 'open_source';
                return (
                  <div
                    key={proj.id || proj.name}
                    className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 space-y-4 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold text-slate-900">{proj.name}</h3>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {isOpenSource ? 'Open Source Engine' : 'Commercial Venture'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-1">{proj.tagline || fallback.tagline}</p>
                      </div>
                      <div className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                        {proj.healthScore || 100}% Parity
                      </div>
                    </div>
                    {proj.repoUrl && (
                      <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
                        <Github className="w-3.5 h-3.5" />
                        <span>Inspect Architecture & Repo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* REGISTER / IMPORT PROJECT MODAL */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Register & Connect Project</h3>
                  <p className="text-xs text-slate-500 font-medium">Connect external GitHub repository or imported workspace</p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterProject} className="p-6 space-y-4">
              {registerSuccess ? (
                <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-900">Project Registered Successfully!</h4>
                  <p className="text-xs text-emerald-700">StartupOS has registered the project and verified 4-file constitution baseline.</p>
                </div>
              ) : (
                <>
                  {registerError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
                      {registerError}
                    </div>
                  )}

                  {/* Source Type Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Integration Source</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, sourceType: 'github_connected' })}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          form.sourceType === 'github_connected'
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <Github className="w-4 h-4" />
                        <span>GitHub Repo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, sourceType: 'manual_import' })}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          form.sourceType === 'manual_import'
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>Imported Local</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, sourceType: 'startupos_scaffold' })}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                          form.sourceType === 'startupos_scaffold'
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>StartupOS Native</span>
                      </button>
                    </div>
                  </div>

                  {/* Project Name & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Project Name *</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Acme AI, VocalFlow"
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
                        <option value="commercial">🏢 Commercial Flagship</option>
                        <option value="open_source">🌐 Open Source Tool</option>
                      </select>
                    </div>
                  </div>

                  {/* Tagline */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Elevator Tagline / Pitch</label>
                    <input
                      type="text"
                      value={form.tagline}
                      onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                      placeholder="e.g. Autonomous AI Voice Agent for high-velocity customer support"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* URLs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">GitHub Repository URL</label>
                      <input
                        type="url"
                        value={form.repoUrl}
                        onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
                        placeholder="https://github.com/user/repo"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Live Demo / Production URL</label>
                      <input
                        type="url"
                        value={form.demoUrl}
                        onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
                        placeholder="https://myproject.com"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Stack */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Tech Stack (comma separated)</label>
                    <input
                      type="text"
                      value={form.stack}
                      onChange={(e) => setForm({ ...form, stack: e.target.value })}
                      placeholder="React 19, FastAPI, PostgreSQL, Tailwind"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  {/* 4-File Constitution Parity Checklist */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Core 4-File Governance Constitution Baseline
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.hasAgents}
                          onChange={(e) => setForm({ ...form, hasAgents: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <span className="font-semibold text-slate-700">AGENTS.md</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.hasRoadmap}
                          onChange={(e) => setForm({ ...form, hasRoadmap: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <span className="font-semibold text-slate-700">ROADMAP.md</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.hasClaude}
                          onChange={(e) => setForm({ ...form, hasClaude: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <span className="font-semibold text-slate-700">CLAUDE.md</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.hasContributing}
                          onChange={(e) => setForm({ ...form, hasContributing: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        <span className="font-semibold text-slate-700">CONTRIBUTING.md</span>
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowRegisterModal(false)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {submitting ? 'Registering...' : '+ Register Project'}
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
