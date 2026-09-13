import React, { useState } from 'react';
import { 
  Github, Linkedin, Globe, Sparkles, CheckCircle2, Copy, Check, 
  ExternalLink, ArrowRight, ShieldCheck, Flame, Trophy, Award, 
  FileText, Terminal, Code2, Layers, Star, Share2, BookOpen, UserCheck
} from 'lucide-react';

export default function FounderPresenceGuide({ currentUser }) {
  const [activePillar, setActivePillar] = useState('github'); // 'github' | 'linkedin' | 'portfolio'
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const founderName = currentUser?.name || 'Harshita Agarwal';
  const founderRole = 'AI Systems Architect & Full-Stack Founder';
  const founderHandle = '1997agarwal';

  // Sample Generated Assets
  const githubReadmeCode = `# Hey, I'm ${founderName} 👋
### ${founderRole} • Building Multi-Agent Systems & 4-File Parity Platforms

\`\`\`
  ┌────────────────────────────────────────────────────────────────────────┐
  │  FOUNDER SCORECARD                                                     │
  │  • 4-File Parity Governance: 100% Compliant across all repositories    │
  │  • Primary Stack: React 19, Vite, Node.js, FastAPI, pgvector, Gemini  │
  │  • Shipped: StartupOS, Trippy, ContextPrism, SpecForge, BusinessPay    │
  └────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

### 🚀 Flagship Shipped Platforms

| Project | What It Solves | Core Stack | Live Proof |
|:---|:---|:---|:---:|
| **[StartupOS](https://github.com/Builder-Tribe/StartupOS)** | 360° AI Founder Operating System (Ideate, Scaffold, Test, Ship, Scale) | React 19 • Node.js • 4-File Parity | [Live Demo](https://startupos.dev) |
| **[Trippy](https://github.com/1997agarwal/Trippy)** | Solo Traveler Matchmaking & DIY Itinerary Community Hub | React TS • SQLite • Express | [Live Demo](https://trippy.travel) |
| **[ContextPrism](https://github.com/1997agarwal/ContextPrism)** | AST-Driven LLM Token Pruner & Codebase Ingestion FinOps Gateway | Python • FastAPI • Tree-Sitter | [GitHub](https://github.com/1997agarwal/ContextPrism) |

---

### 🛡️ Constitutional Engineering Standards
Every repository I architect adheres to strict **4-File Parity Governance**:
- \`AGENTS.md\`: Operational constitution & tool-calling limits for AI assistants
- \`ROADMAP.md\`: Granular phase-by-phase tracking with 0-hallucination checklists
- \`CLAUDE.md\`: Exact zero-warning dev, test, and build commands
- \`CONTRIBUTING.md\`: Conventional Commits & atomic pre-flight QA gates

---

### 📬 Connect With Me
- **LinkedIn**: [linkedin.com/in/harshit-agarwal](https://linkedin.com)
- **Email**: harshita@vibe-coding.io
- **Status**: #OpenToCoFound (Technical Co-Founder / Systems Architect)`;

  const linkedinHeadline = `Building StartupOS (The AI Founder OS) • 100% 4-File Parity • React 19 + FastAPI • Shipped 5+ Production Platforms`;

  const linkedinAboutSection = `I build production-grade AI platforms that turn raw ideas into verified, shipping software.

Over the past year, I noticed that 90% of founders using AI coding agents hit a wall after 48 hours—their codebases drift into bloated spaghetti code, breaking changes get committed unchecked, and architectures become unmaintainable.

To solve this, I developed the **4-File Parity Governance Standard** (AGENTS.md, ROADMAP.md, CLAUDE.md, CONTRIBUTING.md) and architected:
• **StartupOS**: The all-in-one operating system for AI entrepreneurs (Learn, Build, Test, Ship, Scale).
• **Trippy**: Community-driven solo traveler companion matching platform.
• **ContextPrism**: High-throughput AST token pruner cutting LLM prompt costs by 65%.

🛠️ **Core Weapons**: React 19, TypeScript, Node.js, FastAPI, SQLite, pgvector, Autonomous Multi-Agent Orchestration (AntiGravity, Claude Code).

🤝 **Currently Seeking**: Energetic B2B GTM / Growth Co-Founders to scale autonomous developer tooling into enterprise incubators. Let's connect!`;

  const linkedinPostTemplate = `We just took StartupOS to 100% 4-File Parity across 45 production features. Here is what we learned building with autonomous AI agents: 🧵

Most founders think "vibe coding" means prompting ChatGPT until something works. 

In reality, that leads to:
❌ Hallucinated APIs that crash in production
❌ Untracked breaking changes that silently ruin databases
❌ Endless refactor loops that burn days of runway

Here is the exact 4-step framework we used to ship 5 production platforms without a single line of unverified code:

1️⃣ The 4-File Parity Rule:
Never start coding without AGENTS.md, ROADMAP.md, CLAUDE.md, and CONTRIBUTING.md. This anchors your AI coding agent (AntiGravity, Claude Code) with strict non-destructive covenants.

2️⃣ Decoupled GitHub Pointers:
Zero local cloning. Connect remote repositories via URL pointers and let an automated health check monitor constitutional drift in real time.

3️⃣ Real Pre-Flight Sandbox QA:
Don't trust UI checkboxes. Run genuine filesystem audits: bundle size telemetry, hardcoded secret scanners, and live API smoke tests before deploying.

4️⃣ 1-Click Cloud Shipping:
Pre-configured deployment recipes for Vercel and Railway with zero DevOps overhead.

What is your biggest pain point when building with AI agents? Drop a comment below or DM me if you're building in public—let's swap notes! 👇`;

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Top Banner: Founder Direction Playbook */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Founder Proof-of-Work Playbook</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            How to Enhance Your GitHub, LinkedIn & Portfolio
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl font-medium">
            A high-signal founder presence is your unfair advantage. It attracts elite co-founders, recruiter offers, 
            and angel investor DMs without sending a single cold outreach email. Follow the exact 3-pillar blueprint used to build StartupOS and Trippy.
          </p>

          {/* 3 Pillar Tabs */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => setActivePillar('github')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activePillar === 'github'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Github className="w-4 h-4" />
              <span>1. GitHub Profile & Hygiene</span>
            </button>

            <button
              onClick={() => setActivePillar('linkedin')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activePillar === 'linkedin'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Linkedin className="w-4 h-4" />
              <span>2. LinkedIn Authority Blueprint</span>
            </button>

            <button
              onClick={() => setActivePillar('portfolio')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activePillar === 'portfolio'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>3. Founder Proof-of-Work Portfolio</span>
            </button>
          </div>
        </div>
      </div>

      {/* PILLAR 1: GITHUB ENHANCEMENT BLUEPRINT */}
      {activePillar === 'github' && (
        <div className="space-y-6">
          {/* 4 Action Steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: '01', title: 'Create Special Repo', desc: 'Create a public repo named exactly your username (e.g. 1997agarwal/1997agarwal) with a README.md.' },
              { step: '02', title: 'Monochrome Theme', desc: 'Use high-contrast typography, ASCII tables, and clean dark-mode badges (#181717).' },
              { step: '03', title: '4-File Parity Seals', desc: 'Display compliance badges showing you enforce AGENTS.md, ROADMAP.md, CLAUDE.md across repos.' },
              { step: '04', title: 'Commit Streak Discipline', desc: 'Ship daily atomic Conventional Commits (feat:, fix:, docs:) rather than massive random pushes.' },
            ].map((card, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                <span className="text-xs font-black text-indigo-600 font-mono">{card.step}</span>
                <h4 className="text-sm font-bold text-slate-900">{card.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Interactive Generator & Preview */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-600" />
                  <span>Your Dark-Mode GitHub Profile README Generator</span>
                </h3>
                <p className="text-xs text-slate-500">Ready to copy and paste into your special profile repository.</p>
              </div>
              <button
                onClick={() => handleCopy('githubReadme', githubReadmeCode)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedKey === 'githubReadme' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'githubReadme' ? 'Copied to Clipboard!' : 'Copy Markdown'}</span>
              </button>
            </div>

            <div className="p-6 bg-slate-950 text-slate-200 overflow-x-auto max-h-[500px]">
              <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap selection:bg-indigo-600 selection:text-white">
                {githubReadmeCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 2: LINKEDIN AUTHORITY BLUEPRINT */}
      {activePillar === 'linkedin' && (
        <div className="space-y-6">
          {/* Strategy Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Formula 1: Headline
              </span>
              <h4 className="text-sm font-bold text-slate-900">The 4-Part Founder Headline</h4>
              <p className="text-xs text-slate-600">
                Formula: <strong className="text-slate-900">Building [Product] • [Key Moat / Parity] • [Core Stack] • [Impact/Ex-Role]</strong>.
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-medium">
                {linkedinHeadline}
              </div>
              <button
                onClick={() => handleCopy('headline', linkedinHeadline)}
                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                {copiedKey === 'headline' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'headline' ? 'Copied!' : 'Copy Headline'}</span>
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                Formula 2: The About Section
              </span>
              <h4 className="text-sm font-bold text-slate-900">Narrative Founder Storytelling</h4>
              <p className="text-xs text-slate-600">
                Start with the systemic problem you saw. Show the platforms you shipped to solve it. State clearly what co-founder you're seeking.
              </p>
              <button
                onClick={() => handleCopy('about', linkedinAboutSection)}
                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer mt-4"
              >
                {copiedKey === 'about' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'about' ? 'Copied Full About Section!' : 'Copy About Section'}</span>
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Formula 3: Build-in-Public Hook
              </span>
              <h4 className="text-sm font-bold text-slate-900">The 5-Part Viral Post</h4>
              <p className="text-xs text-slate-600">
                1. Counter-intuitive hook → 2. The painful problem → 3. What you built → 4. Metrics & proof → 5. Open question CTA.
              </p>
              <button
                onClick={() => handleCopy('post', linkedinPostTemplate)}
                className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer mt-4"
              >
                {copiedKey === 'post' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'post' ? 'Copied Post Blueprint!' : 'Copy Launch Post'}</span>
              </button>
            </div>
          </div>

          {/* Full Post Template Preview */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Linkedin className="w-4 h-4 text-blue-600" />
                <span>Sample Build-in-Public Launch Post Preview</span>
              </h3>
              <button
                onClick={() => handleCopy('post2', linkedinPostTemplate)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copiedKey === 'post2' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Post Template</span>
              </button>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap max-h-96 overflow-y-auto">
              {linkedinPostTemplate}
            </div>
          </div>
        </div>
      )}

      {/* PILLAR 3: FOUNDER PROOF-OF-WORK PORTFOLIO */}
      {activePillar === 'portfolio' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Your Live Proof-of-Work Showcase</h3>
                <p className="text-xs text-slate-500">Every project you scaffold, test, and ship on StartupOS forms your living portfolio.</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Parity Standard
              </span>
            </div>

            {/* Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">StartupOS</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Flagship Platform
                  </span>
                </div>
                <p className="text-xs text-slate-600">360° AI Founder Operating System powering idea intake, PRD generation, sandbox testing, and co-builder matching.</p>
                <div className="flex flex-wrap gap-1">
                  {['React 19', 'Node.js', 'Vite', '4-File Parity', 'Multi-Agent'].map((s, i) => (
                    <span key={i} className="text-[9px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 text-xs font-bold border-t border-slate-200/60">
                  <span className="text-emerald-600">100% 4-File Parity</span>
                  <a href="https://github.com/Builder-Tribe/StartupOS" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-1">
                    GitHub Repo <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">Trippy</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Production Venture
                  </span>
                </div>
                <p className="text-xs text-slate-600">Solo traveler companion matchmaking, hostel discovery, and DIY itinerary organizer with partner CRM.</p>
                <div className="flex flex-wrap gap-1">
                  {['React TS', 'Express', 'SQLite', 'Matching Engine', 'Trippy Design System'].map((s, i) => (
                    <span key={i} className="text-[9px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 text-xs font-bold border-t border-slate-200/60">
                  <span className="text-emerald-600">Shipped to Production</span>
                  <a href="https://github.com/1997agarwal/Trippy" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-1">
                    GitHub Repo <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
