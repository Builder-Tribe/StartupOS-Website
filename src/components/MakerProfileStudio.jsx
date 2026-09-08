import React, { useState, useEffect } from 'react';
import { 
  BUILDER_RANKS, VERIFIED_BADGES, COMMUNITY_MAKERS,
  buildDynamicMakerProfile, simulateImportFromGithub, simulateImportFromLinkedin,
  generateAtsResumeBullets, generateGithubProfileReadmeSnippet, generateLinkedinAboutSection 
} from '../data/makerProfileData';
import { 
  Trophy, Award, ShieldCheck, Layers, FileCode, Check, Copy, ExternalLink, 
  Sparkles, Star, Github, Linkedin, Mail, Flame, Rocket, Download, UserCheck,
  Plus, RefreshCw, X, FolderGit2
} from 'lucide-react';

export default function MakerProfileStudio({ currentUser, ideas = [] }) {
  // Tabs: 'PROFILE' | 'EXPORT_STUDIO' | 'LEADERBOARD'
  const [activeTab, setActiveTab] = useState('PROFILE');
  // Export Sub-Tabs: 'RESUME' | 'GITHUB_README' | 'LINKEDIN'
  const [exportFormat, setExportFormat] = useState('RESUME');

  // External projects added manually or fetched from GitHub/LinkedIn
  const [externalProjects, setExternalProjects] = useState([]);
  
  // Modals for adding projects
  const [showAddModal, setShowAddModal] = useState(false);
  const [addSourceTab, setAddSourceTab] = useState('MANUAL'); // 'MANUAL' | 'GITHUB' | 'LINKEDIN'
  
  // Manual project form state
  const [manualForm, setManualForm] = useState({
    name: '',
    tagline: '',
    problem: '',
    stack: 'React 18, Vite, Node.js',
    impact: 'Shipped to production with 100% 4-File Parity.',
    demoUrl: '',
    repoUrl: '',
    badge: 'Custom Project'
  });

  // Import handle inputs
  const [githubInput, setGithubInput] = useState('');
  const [linkedinInput, setLinkedinInput] = useState('');
  const [importing, setImporting] = useState(false);

  // Compute the live dynamic maker profile based on currentUser, their created ideas, and external projects
  const maker = buildDynamicMakerProfile(currentUser, ideas, externalProjects);
  const currentRank = BUILDER_RANKS.find(r => r.level === maker.rankLevel) || BUILDER_RANKS[0];

  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Add Manual Project
  const handleAddManualProject = (e) => {
    e.preventDefault();
    if (!manualForm.name.trim()) return;

    const newProj = {
      id: `manual-${Date.now()}`,
      name: manualForm.name,
      tagline: manualForm.tagline || `${manualForm.name} — AI System`,
      problem: manualForm.problem || 'Solves specific operational friction.',
      stack: manualForm.stack.split(',').map(s => s.trim()),
      impact: manualForm.impact,
      demoUrl: manualForm.demoUrl || 'https://demo.vercel.app',
      repoUrl: manualForm.repoUrl || 'https://github.com/maker/project',
      badge: manualForm.badge || 'Custom Project',
      source: 'manual'
    };

    setExternalProjects(prev => [newProj, ...prev]);
    setManualForm({
      name: '',
      tagline: '',
      problem: '',
      stack: 'React 18, Vite, Node.js',
      impact: 'Shipped to production with 100% 4-File Parity.',
      demoUrl: '',
      repoUrl: '',
      badge: 'Custom Project'
    });
    setShowAddModal(false);
  };

  // Import from GitHub
  const handleImportGithub = () => {
    if (!githubInput.trim()) return;
    setImporting(true);
    setTimeout(() => {
      const imported = simulateImportFromGithub(githubInput);
      setExternalProjects(prev => [...imported, ...prev]);
      setImporting(false);
      setGithubInput('');
      setShowAddModal(false);
    }, 600);
  };

  // Import from LinkedIn
  const handleImportLinkedin = () => {
    if (!linkedinInput.trim()) return;
    setImporting(true);
    setTimeout(() => {
      const imported = simulateImportFromLinkedin(linkedinInput);
      setExternalProjects(prev => [...imported, ...prev]);
      setImporting(false);
      setLinkedinInput('');
      setShowAddModal(false);
    }, 600);
  };

  const atsResumeContent = generateAtsResumeBullets(maker);
  const githubReadmeContent = generateGithubProfileReadmeSnippet(maker);
  const linkedinContent = generateLinkedinAboutSection(maker);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 border border-slate-800 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5" />
            Phase 3 • Builder Credentials & Talent Launchpad
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Maker Profile, Builder Rank & Portfolio Exporter
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Your dynamic proof of work. Automatically generated for your account, combining your built StartupOS ideas, 
            imported repositories from GitHub or LinkedIn, and custom projects into a recruiter-grade portfolio.
          </p>

          {/* Sub Navigation & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveTab('PROFILE')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'PROFILE'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                1. Verified Maker Profile
              </button>
              <button
                onClick={() => setActiveTab('EXPORT_STUDIO')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'EXPORT_STUDIO'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                2. 1-Click Resume & Portfolio Exporter
              </button>
              <button
                onClick={() => setActiveTab('LEADERBOARD')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'LEADERBOARD'
                    ? 'bg-white text-slate-900 shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-indigo-600" />
                3. Community Leaderboard
              </button>
            </div>

            {/* Quick Action: Add Project from GitHub, LinkedIn or Manual */}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add / Import Projects</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: MAKER PROFILE VIEW */}
      {activeTab === 'PROFILE' && (
        <div className="space-y-8">
          {/* Identity & Social Badges Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-md shrink-0">
                  {maker.avatar}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-black text-slate-900">{maker.name}</h2>
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${currentRank.badgeColor}`}>
                      ★ {currentRank.name}
                    </span>
                    <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold px-2.5 py-0.5 rounded-full">
                      Level {maker.rankLevel}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm font-semibold mt-1">{maker.title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{maker.location} • @{maker.username}</p>
                </div>
              </div>

              {/* Monochrome Dark CTAs (#181717) matching user preference */}
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={maker.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#181717] hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shadow-xs"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
                <a
                  href={maker.x}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#181717] hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shadow-xs"
                >
                  <span className="font-bold">𝕏</span>
                  <span>Follow</span>
                </a>
                <a
                  href={maker.github}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#181717] hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shadow-xs"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub</span>
                </a>
                <a
                  href={`mailto:${maker.email}`}
                  className="bg-[#181717] hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </a>
              </div>
            </div>

            <p className="text-slate-700 text-sm leading-relaxed border-t border-slate-100 pt-4 max-w-4xl font-normal">
              "{maker.bio}"
            </p>

            {/* 4-Metric Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-center">
                <div className="text-2xl font-black text-indigo-700">{maker.xp.toLocaleString()}</div>
                <div className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider mt-1">
                  Total Builder XP
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 text-center">
                <div className="text-2xl font-black text-amber-700 flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
                  {maker.streakDays} Days
                </div>
                <div className="text-[10px] uppercase font-bold text-amber-600 tracking-wider mt-1">
                  Active Streak
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
                <div className="text-2xl font-black text-emerald-700">{maker.shippedCount} Platforms</div>
                <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider mt-1">
                  Shipped Projects
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-center">
                <div className="text-2xl font-black text-purple-700">{maker.parityScore}</div>
                <div className="text-[10px] uppercase font-bold text-purple-600 tracking-wider mt-1">
                  4-File Parity Governance
                </div>
              </div>
            </div>
          </div>

          {/* Verified Badges & Accreditations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Verified Accreditations & Badges
              </h3>
              <span className="text-xs text-slate-500 font-medium">Cryptographically Audited</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {VERIFIED_BADGES.map((b) => (
                <div key={b.id} className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${b.color}`}>
                      Verified
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {b.hash}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{b.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{b.desc}</p>
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
                    Unlocked on {b.verifiedDate}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipped Flagship Products Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Rocket className="w-5 h-5 text-indigo-600" />
                Shipped & Incubated Projects ({maker.flagshipProducts.length})
              </h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Project
              </button>
            </div>

            {maker.flagshipProducts.length === 0 ? (
              <div className="text-center py-16 bg-white border border-dashed border-slate-300 rounded-3xl p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
                  <Rocket className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="text-base font-bold text-slate-900">Your Portfolio is Ready to Launch</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You haven't added any projects yet. Create an idea in <strong>Idea Lab</strong>, fetch your existing repositories from <strong>GitHub</strong>, or click below to enter manually!
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Your First Project</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {maker.flagshipProducts.map((prod) => (
                  <div key={prod.id} className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {prod.badge}
                        </span>
                        {prod.source && (
                          <span className="text-[9px] font-mono text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded">
                            {prod.source}
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-black text-slate-900">{prod.name}</h4>
                      <p className="text-xs text-indigo-600 font-bold">{prod.tagline}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{prod.problem}</p>
                      
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-700">
                        <span className="font-bold text-slate-900 block mb-0.5">Impact:</span>
                        {prod.impact}
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {(prod.stack || []).map((s, idx) => (
                          <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold">
                      <a
                        href={prod.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <span>Live Demo</span> <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={prod.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-600 hover:text-slate-900 flex items-center gap-1"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>Code Repository</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: EXPORT STUDIO */}
      {activeTab === 'EXPORT_STUDIO' && (
        <div className="space-y-6">
          {/* Format Selector Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExportFormat('RESUME')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  exportFormat === 'RESUME'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                1. ATS-Compliant Resume Bullets
              </button>
              <button
                onClick={() => setExportFormat('GITHUB_README')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  exportFormat === 'GITHUB_README'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                2. GitHub Profile README (Monochrome CTAs)
              </button>
              <button
                onClick={() => setExportFormat('LINKEDIN')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  exportFormat === 'LINKEDIN'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                3. LinkedIn About Pitch
              </button>
            </div>

            <button
              onClick={() => {
                const textToCopy = exportFormat === 'RESUME' 
                  ? atsResumeContent 
                  : exportFormat === 'GITHUB_README' 
                    ? githubReadmeContent 
                    : linkedinContent;
                handleCopy('active-export', textToCopy);
              }}
              className="bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              {copiedKey === 'active-export' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Current Output</span>
            </button>
          </div>

          {/* Export Code Viewer */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-lg border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-indigo-400 font-mono">
                {exportFormat === 'RESUME' && 'ATS_RESUME_EXPERIENCE.md (Ready to copy into Word, Google Docs or LaTeX)'}
                {exportFormat === 'GITHUB_README' && `README.md (For ${maker.username}/${maker.username} Profile Repository)`}
                {exportFormat === 'LINKEDIN' && 'LINKEDIN_ABOUT_SECTION.txt'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Recruiter Optimized
              </span>
            </div>

            <pre className="text-xs font-mono text-slate-200 bg-slate-950 p-5 rounded-2xl overflow-x-auto leading-relaxed border border-slate-800 max-h-[500px] whitespace-pre-wrap selection:bg-indigo-600 selection:text-white">
              {exportFormat === 'RESUME' && atsResumeContent}
              {exportFormat === 'GITHUB_README' && githubReadmeContent}
              {exportFormat === 'LINKEDIN' && linkedinContent}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: COMMUNITY LEADERBOARD */}
      {activeTab === 'LEADERBOARD' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Live Standings
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">StartupOS Maker Leaderboard</h2>
            <p className="text-slate-500 text-xs">Ranked by Builder XP, active building streak, and verified product launches.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Maker</th>
                  <th className="py-3 px-4">Role & Status</th>
                  <th className="py-3 px-4">Streak</th>
                  <th className="py-3 px-4">Shipped</th>
                  <th className="py-3 px-4 text-right">Builder XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMMUNITY_MAKERS.map((m) => (
                  <tr key={m.username} className={`hover:bg-slate-50/80 transition-colors ${m.rank === 1 ? 'bg-amber-50/40 font-semibold' : ''}`}>
                    <td className="py-4 px-4 font-black text-slate-900">
                      {m.rank === 1 ? '🥇 #1' : m.rank === 2 ? '🥈 #2' : m.rank === 3 ? '🥉 #3' : `#${m.rank}`}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">@{m.username}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-slate-700">{m.role}</div>
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 mt-0.5">
                        {m.badge}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-amber-600">
                      🔥 {m.streak}d
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-700">
                      {m.shipped} Apps
                    </td>
                    <td className="py-4 px-4 text-right font-black text-indigo-600 text-sm">
                      {m.xp.toLocaleString()} XP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD / IMPORT PROJECTS (MANUAL, GITHUB, LINKEDIN) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                Portfolio Builder
              </span>
              <h3 className="text-xl font-black text-slate-900 mt-1">
                Add Projects to Your Maker Profile
              </h3>
              <p className="text-xs text-slate-500">
                Choose how you want to add projects: import from GitHub, LinkedIn, or enter manually.
              </p>
            </div>

            {/* Source Tab Switcher */}
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
              <button
                onClick={() => setAddSourceTab('MANUAL')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  addSourceTab === 'MANUAL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Manual Entry
              </button>
              <button
                onClick={() => setAddSourceTab('GITHUB')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  addSourceTab === 'GITHUB' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Github className="w-3.5 h-3.5" />
                <span>Fetch from GitHub</span>
              </button>
              <button
                onClick={() => setAddSourceTab('LINKEDIN')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  addSourceTab === 'LINKEDIN' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>Fetch from LinkedIn</span>
              </button>
            </div>

            {/* SUB-VIEW 1: MANUAL FORM */}
            {addSourceTab === 'MANUAL' && (
              <form onSubmit={handleAddManualProject} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PromptPilot AI"
                    value={manualForm.name}
                    onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tagline / One-liner</label>
                  <input
                    type="text"
                    placeholder="e.g. AI System for automating client reporting"
                    value={manualForm.tagline}
                    onChange={(e) => setManualForm({ ...manualForm, tagline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Problem Solved</label>
                  <textarea
                    rows={2}
                    placeholder="What specific friction does this solve?"
                    value={manualForm.problem}
                    onChange={(e) => setManualForm({ ...manualForm, problem: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tech Stack (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="React, FastAPI, SQLite"
                      value={manualForm.stack}
                      onChange={(e) => setManualForm({ ...manualForm, stack: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category Badge</label>
                    <input
                      type="text"
                      placeholder="e.g. Developer Tool"
                      value={manualForm.badge}
                      onChange={(e) => setManualForm({ ...manualForm, badge: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Demo URL</label>
                    <input
                      type="url"
                      placeholder="https://yourdemo.app"
                      value={manualForm.demoUrl}
                      onChange={(e) => setManualForm({ ...manualForm, demoUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">GitHub Repo URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com/..."
                      value={manualForm.repoUrl}
                      onChange={(e) => setManualForm({ ...manualForm, repoUrl: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all pt-3"
                >
                  + Add Project to Profile (+1,500 XP)
                </button>
              </form>
            )}

            {/* SUB-VIEW 2: GITHUB IMPORTER */}
            {addSourceTab === 'GITHUB' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                    <Github className="w-4 h-4" /> Fetch Repositories Automatically
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    Enter your GitHub username or repository organization. StartupOS will automatically import your pinned and public repositories, evaluate their README and 4-file parity, and add them to your portfolio.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">GitHub Username or Org *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 1997agarwal or octocat"
                      value={githubInput}
                      onChange={(e) => setGithubInput(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleImportGithub}
                      disabled={importing || !githubInput.trim()}
                      className="bg-[#181717] hover:bg-black text-white px-4 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
                      <span>Fetch Repos</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW 3: LINKEDIN IMPORTER */}
            {addSourceTab === 'LINKEDIN' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                    <Linkedin className="w-4 h-4 text-sky-600" /> Fetch Featured Projects from LinkedIn
                  </span>
                  <p className="text-slate-600 leading-relaxed">
                    Enter your LinkedIn profile handle. StartupOS will import your featured projects, accomplishments, and startup ventures directly into your verified portfolio.
                  </p>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">LinkedIn Profile Handle or URL *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 1997agarwal or https://linkedin.com/in/..."
                      value={linkedinInput}
                      onChange={(e) => setLinkedinInput(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleImportLinkedin}
                      disabled={importing || !linkedinInput.trim()}
                      className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {importing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Linkedin className="w-4 h-4" />}
                      <span>Fetch Projects</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
