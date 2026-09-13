import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Trophy, Rocket, ShieldCheck, CheckCircle2, ArrowRight, 
  Terminal, Code2, Users, Flame, BookOpen, Layers, Cpu, Compass,
  UserCheck, LogIn, ChevronRight, ChevronDown, ChevronUp, HelpCircle,
  Archive, Download, Copy, Check, Sliders, ExternalLink, Zap, Clock,
  DollarSign, Award, Star, CheckCheck, PlayCircle, Folder, FileCode, CheckCircle,
  GraduationCap, Video, FileText, CheckSquare, GitBranch, Linkedin
} from 'lucide-react';

export default function MarketingLander({ onEnterPortal, onOpenAuthModal }) {
  // Interactive Showcase State
  const [activeDeliverableTab, setActiveDeliverableTab] = useState('constitution'); // 'constitution' | 'prd' | 'scaffold' | 'pipeline'
  const [previewStack, setPreviewStack] = useState('vite-react'); // 'vite-react' | 'nextjs' | 'fastapi'
  const [activeHowStep, setActiveHowStep] = useState(0); // 0 | 1 | 2 | 3
  const [activeCourseTab, setActiveCourseTab] = useState('course-branding'); // 'course-branding' | 'course-saas'
  const [calcHours, setCalcHours] = useState(25); // Hours spent per month on specs/prompts
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'
  const [openFaq, setOpenFaq] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeSection, setActiveSection] = useState('deliverables');

  // ScrollSpy to dynamically highlight the current section pill as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['deliverables', 'academy', 'how-it-works', 'pricing'];
      const scrollPosition = window.scrollY + 180;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Free AI Academy Highlight Courses Mock Data
  const academyCourses = {
    'course-branding': {
      id: 'course-branding',
      title: 'Developer Branding & GitHub Launchpad Masterclass',
      subtitle: 'Push Code, 4-File Parity & Catch Eyeballs on LinkedIn',
      instructor: 'Harshit Agarwal & Marcus Chen',
      duration: '45 mins • 4 Modules',
      enrolled: '2,840+ enrolled',
      level: 'All Levels (PMs & Founders)',
      badge: 'Bestseller • 100% Free',
      description: 'Master clean git hygiene, build an irresistible username/username GitHub Profile README with monochrome CTAs, establish 4-file parity governance, and use a 5-part LinkedIn Build-in-Public launch formula.',
      modules: [
        { title: 'Module 1: Git Push Workflows & 4-File Parity Standard', lessons: '2 step-by-step lessons with pre-flight hygiene scripts' },
        { title: 'Module 2: Building a Recruiter-Converting GitHub Profile', lessons: 'Irresistible README markdown with live badges & stats' },
        { title: 'Module 3: Catching Eyeballs on LinkedIn: Build-in-Public Launch Formula', lessons: '5-part post structure that generates recruiter DMs & cofounder reachouts' }
      ]
    },
    'course-saas': {
      id: 'course-saas',
      title: 'Build a Full-Stack AI SaaS in 60 Mins with AntiGravity & Supabase',
      subtitle: 'Turn a simple PRD into a production-ready AI product with zero manual boilerplate',
      instructor: 'Dr. Evelyn Vance',
      duration: '60 mins • 3 Modules',
      enrolled: '1,420+ enrolled',
      level: 'Beginner Non-Coder',
      badge: 'Zero-to-One • 100% Free',
      description: 'Learn how non-technical founders use AntiGravity, Claude Code, and Supabase to define deterministic schemas, generate additive PostgreSQL tables, wire auth, and ship live on Vercel.',
      modules: [
        { title: 'Module 1: Defining PRD & Database Schema', lessons: 'Deterministic prompting for Supabase migrations' },
        { title: 'Module 2: Tool-Calling Backend & Gemini Integration', lessons: 'Extracting pain points and sentiment with LLM functions' },
        { title: 'Module 3: Frontend Deployment & GitHub CI/CD', lessons: 'Connecting responsive UI to live database & Vercel' }
      ]
    }
  };

  // Deliverables Mock Data based on previewStack
  const stackLabels = {
    'vite-react': 'React 18 + Vite + Tailwind v4',
    'nextjs': 'Next.js 15 (App Router) + TS',
    'fastapi': 'FastAPI + Python 3.12 + Pydantic'
  };

  const deliverableContent = {
    constitution: {
      title: 'AGENTS.md — Repository Operational Constitution',
      desc: 'Enforces working agreements, non-destructive DB covenants, and Clean 2026 Light UI across all AI assistants.',
      code: `# AGENTS.md — Master Constitution of MyStartup

> Read this first. Mandatory rules for AntiGravity, Claude Code, Cursor, and Windsurf.

## 1. Product Vision & Architecture Scope
- Product: MyStartup
- Stack Preset: ${stackLabels[previewStack]}
- Standard: Clean 2026 Light Modern UI (zinc-50 canvas, crisp #ffffff cards)

## 2. Non-Destructive Database Covenant
- All migrations must be additive (CREATE TABLE IF NOT EXISTS, ADD COLUMN).
- Destructive DROPs, TRUNCATEs, or schema wipes REQUIRE explicit human approval.

## 3. 4-File Parity Governance Covenant
- Any pull request modifying business logic or API endpoints MUST synchronize:
  1. AGENTS.md (Constitutional tool execution limits)
  2. ROADMAP.md (Phase 1, 2, and 3 live status checklists)
  3. CLAUDE.md (Dev commands: dev, build, test, lint)
  4. CONTRIBUTING.md (Conventional Commits & QA gates)

## 4. Working Agreements for AI Coding Agents
- Small, contiguous diffs over speculative refactors.
- Verify production build & zero-warning lints before turn completion.`
    },
    prd: {
      title: '01-master-prd.md — 10-Part Production PRD Suite',
      desc: 'Investor-ready, engineer-trusted specifications complete with personas, non-goals, and Gherkin criteria.',
      code: `# 01 — Master Product Requirements Document (PRD v1.0)

## Product: MyStartup

### 1. Executive Summary & North Star Metric
- Thesis: Streamlined 0-to-1 incubator for AI builders with automated governance.
- North Star: Time-to-first-verified-scaffold (< 3 minutes).

### 2. User Persona & Psychological Pain Points
- Persona: Solo AI Founders & High-Velocity Vibe Coders.
- Critical Friction: Codebases devolving into broken architectures after 48 hours of AI pairing.

### 3. Scope Boundaries & Strict Non-Goals (MVP)
- IN-SCOPE: 8-document scaffold, 1-click ZIP export, 4-stage autonomous runbooks.
- OUT-OF-SCOPE: Native mobile apps (deferred to Phase 3 satellite repositories).

### 4. Functional Requirements (Gherkin Format)
- Scenario: Scaffolding a validated project
  Given a validated thesis score > 80 in Idea Lab
  When the builder clicks "Download Scaffold (.ZIP)"
  Then generate a zero-dependency PKZIP buffer with all 8 constitutional files.`
    },
    scaffold: {
      title: '<project>-scaffold.zip — 1-Click Zero-Dependency Scaffold',
      desc: 'Pre-packaged, production-ready directory structure bundled client-side with zero npm lag.',
      code: `my-startup-scaffold.zip
├── ⚖️ AGENTS.md                  # Constitutional AI boundaries & rules
├── 🗺️ ROADMAP.md                 # Live 3-Phase milestone checklist
├── ⚡ CLAUDE.md                  # Exact CLI dev, build, test scripts
├── 🤝 CONTRIBUTING.md            # Conventional Commits & QA standards
├── 📘 01-master-prd.md           # Executive PRD with user personas & non-goals
├── 🔬 02-competitor-research.md  # Market alternatives & unfair advantage
├── 📐 03-technical-architecture.md # Schemas, APIs, & directory layout
├── 🚀 04-build-plan.md           # Phased AI coding implementation prompts
└── 📁 src/                       # Baseline application skeleton`
    },
    sandbox: {
      title: 'Pre-Flight Sandbox QA & 100-Point Audit Engine',
      desc: 'Real automated verification running environment audits, bundle size checks, secret scans, and API smoke tests.',
      code: `[STARTUPOS PRE-FLIGHT SANDBOX v3.0]
Target Project: MyStartup (Node 20+ / ${stackLabels[previewStack]})

[SUITE 1/5] Environment & Package Manifest:
✓ package.json valid. .env.example present. (14ms)

[SUITE 2/5] Production Build Verification:
✓ Production build verified. JS bundle: 157.7 kB. CSS: present. (1,240ms)

[SUITE 3/5] 4-File Parity Constitution:
✓ AGENTS.md, ROADMAP.md, CLAUDE.md, CONTRIBUTING.md all present. (8ms)

[SUITE 4/5] Security & Token FinOps Scan:
✓ Zero hardcoded API keys, AWS tokens, or unescaped secrets detected. (22ms)

[SUITE 5/5] Backend API Health Smoke Tests:
✓ /api/health -> HTTP 200 OK (28ms)
✓ /api/ideas  -> HTTP 200 OK (35ms)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 ALL 5 SUITES PASSED! Readiness: 100% | Grade: A+
Verified Ready for 1-Click Cloud Deployment.`
    },
    demoday: {
      title: '12-Slide AI Pitch Deck & Investor Pipeline CRM',
      desc: 'Comprehensive fundraising package with structured slide narratives, investor stage tracking, and pitch countdown timer.',
      code: `# Pitch Deck — MyStartup
**Tagline:** The AI-First Platform for High-Velocity Founders
**Raising:** ₹1.5 Cr Seed Round | **Target:** Accelerate GTM & Enterprise Pipelines

## Slide 1: The Problem
Founders waste 60% of their early runway wrestling with broken AI-generated code, 
unstructured prompts, and missing technical co-founders.

## Slide 2: The Solution
An end-to-end founder operating system that turns ideas into 4-file parity architectures, 
verifies production readiness in an automated sandbox, and matches co-founders.

## Slide 3: Market Opportunity & TAM
- Total Addressable Market: $24B AI developer tooling & incubator software.
- 10M+ non-technical founders entering the vibe-coding ecosystem by 2027.

## Slide 4: Traction & Parity Moat
- 100% 4-File Constitutional Parity verified.
- 45+ Production features shipped with zero devops overhead.

## Slide 5: The Ask & Use of Funds
- Seeking ₹1.5 Cr for 18 months of runway.
- 60% Engineering & Agent FinOps | 30% Growth & Co-Builder Match | 10% Ops.`
    },
    pipeline: {
      title: 'Autonomous Vibe-Coding Prompt Runbook',
      desc: 'Sequential, hallucination-resistant execution prompts to build your MVP step-by-step.',
      code: `[STAGE 1: SCAFFOLDING & 4-FILE GOVERNANCE]
"You are an autonomous staff engineer pairing with a founder.
Task: Initialize repository layout for ${stackLabels[previewStack]}.
Ensure AGENTS.md, ROADMAP.md, CLAUDE.md, and CONTRIBUTING.md exist.
Verify dev server boots with 0 errors. Report back with dev URL."

[STAGE 2: ADDITIVE DATABASE SCHEMAS & REST APIS]
"Task: Implement non-destructive schemas and REST API endpoints.
All table creations must use CREATE TABLE IF NOT EXISTS.
Seed mock data representing realistic user workloads.
Verify endpoints via automated tests. Update ROADMAP.md milestone 2."

[STAGE 3: CLEAN 2026 LIGHT UI & EXPERIENCE]
"Task: Build responsive client surface adhering to 2026 Light UI standard.
Slate-50 canvas, #ffffff cards, high-contrast headings, and toast feedback.
Wire frontend state to backend REST APIs. Update ROADMAP.md milestone 3."

[STAGE 4: PRE-FLIGHT QA GATE & CLOUD DEPLOYMENT]
"Task: Run production build (0 warnings). Audit 4-file parity.
Format payload for StartupOS Launchpad and commit with Conventional Commits."`
    }
  };

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(deliverableContent[activeDeliverableTab].code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // ROI Calculator Calculations ($75/hr average builder/engineer rate)
  const hoursSaved = Math.round(calcHours * 0.82);
  const dollarSaved = Math.round(hoursSaved * 75);

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Ideate & Validate in Idea Lab',
      desc: 'Submit your 5-dimension canvas (audience, problem, advantage, constraints). Our AI engine scores market viability (0–100) and transforms your idea into a 6-part PRD and 4-file constitution.',
      badge: 'Ideate & Validate',
      color: 'from-indigo-600 to-indigo-700'
    },
    {
      step: '02',
      title: 'Build & Scaffold with 4-File Parity',
      desc: 'Connect your remote GitHub repository with zero local code cloning. Enforce mandatory constitutional governance (AGENTS.md, ROADMAP.md, CLAUDE.md, CONTRIBUTING.md) to keep AI agents on rails.',
      badge: 'Build & Scaffold',
      color: 'from-violet-600 to-purple-700'
    },
    {
      step: '03',
      title: 'Automated QA & Pre-Flight Sandbox',
      desc: 'Run genuine pre-flight sandbox tests: package manifest audits, production bundle size measurement, 4-file parity verification, hardcoded secret scanning, and live API smoke pings.',
      badge: 'Test & Pre-Flight QA',
      color: 'from-blue-600 to-cyan-700'
    },
    {
      step: '04',
      title: '1-Click Cloud Ship & Public Launchpad',
      desc: 'Follow verified deployment recipes for Vercel, Railway, Render, and Cloudflare. Launch to the StartupOS Product Hunt feed to gather upvotes, live demo feedback, and early traction.',
      badge: 'Ship & Deploy',
      color: 'from-emerald-600 to-teal-700'
    },
    {
      step: '05',
      title: 'Co-Builder Network & Demo Day Pipeline',
      desc: 'Match with technical or GTM co-founders through our LinkedIn-style professional network. Prepare a 12-slide AI pitch deck, manage an investor pipeline CRM, and practice with pitch timers.',
      badge: 'Co-Builders & Demo Day',
      color: 'from-amber-600 to-orange-700'
    }
  ];

  const faqs = [
    {
      q: 'Why do I need StartupOS instead of just asking ChatGPT or Claude for a PRD?',
      a: 'Generic LLM chats lack continuity, codebase awareness, and engineering discipline. They produce fragmented, non-executable text that drifts across conversations. StartupOS enforces the strict 4-File Parity standard (AGENTS.md, ROADMAP.md, CLAUDE.md, CONTRIBUTING.md), configures real dev commands for your chosen stack, bundles zero-dependency ZIP archives, and outputs sequential, battle-tested prompt runbooks designed specifically for autonomous coding agents.'
    },
    {
      q: 'Which AI coding assistants and IDEs does StartupOS support?',
      a: 'StartupOS is purposefully designed for the leading 2026 AI coding ecosystem: Google AntiGravity 2.0, Anthropic Claude Code CLI, Cursor, Windsurf, Replit Agent, and GitHub Copilot. The generated constitutions include specialized working agreements for each agent.'
    },
    {
      q: 'What exactly is the "4-File Parity Constitution"?',
      a: 'It is the proven governance blueprint developed across dozens of production AI applications: 1) AGENTS.md (master repo rules, safety policies, and UI standards), 2) ROADMAP.md (living 3-phase milestone tracker), 3) CLAUDE.md (lean CLI dev & build commands), and 4) CONTRIBUTING.md (Conventional Commits and quality gates). Maintaining parity across these 4 files prevents 95% of AI coding drift.'
    },
    {
      q: 'Is there any vendor lock-in with the downloaded code or specifications?',
      a: 'None whatsoever. Every deliverable generated by StartupOS is 100% open, standard Markdown (.md) and pure in-memory PKZIP (.zip) bundles that live directly inside your Git repository. You own 100% of your code, schemas, and intellectual property.'
    },
    {
      q: 'How does the StartupOS Launchpad help my product grow?',
      a: 'The Launchpad is a curated community product exchange visited by thousands of AI founders, vibe coders, and early adopters daily. Products with verified 4-file parity receive the exclusive 🏆 Certified Launch badge, earning higher visibility, upvotes, and honest feedback from fellow builders.'
    },
    {
      q: 'Is the AI Builder Academy really 100% free forever?',
      a: 'Yes! All core courses, including the Developer Branding & GitHub Launchpad Masterclass and Full-Stack AI SaaS in 60 Mins, are completely free to all builders with zero paywall or credit card required. We provide copyable prompt blueprints for Google AntiGravity, Claude Code, Cursor, Replit, and Emergent, plus an interactive AI tutor.'
    },
    {
      q: 'Can I cancel or change my subscription plan anytime?',
      a: 'Yes, absolutely. You can upgrade, downgrade, or cancel your Pro Builder or Studio subscription at any time with a single click. You retain permanent access to all downloaded scaffolds, PRDs, and constitutions.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/90 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white relative overflow-x-hidden">
      {/* Ambient Floating Background Mesh Orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="animate-orb-1 absolute -top-40 -left-20 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-200/40 to-violet-200/40 rounded-full blur-3xl opacity-70"></div>
        <div className="animate-orb-2 absolute top-1/3 -right-20 w-[650px] h-[650px] bg-gradient-to-br from-blue-200/30 to-sky-200/40 rounded-full blur-3xl opacity-60"></div>
        <div className="animate-orb-3 absolute -bottom-40 left-1/4 w-[550px] h-[550px] bg-gradient-to-tr from-purple-200/30 to-indigo-200/40 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="relative z-10">
        {/* STICKY 2026 LIGHT NAVBAR — CLEAN, FLOATING & SCROLL-AWARE */}
        <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
            {/* Brand Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => onEnterPortal('launchpad')}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-700 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-600/25 group-hover:scale-105 transition-transform">
                S
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">StartupOS</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/60 uppercase tracking-wider">
                  2026
                </span>
              </div>
            </div>

            {/* Streamlined Floating Pill Navigation (Max 4 clean choices with ScrollSpy) */}
            <nav className="hidden md:flex items-center p-1 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-inner text-xs font-bold">
              <a
                href="#deliverables"
                className={`px-4 py-1.5 rounded-full transition-all ${
                  activeSection === 'deliverables'
                    ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Deliverables
              </a>

              <a
                href="#academy"
                className={`px-4 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                  activeSection === 'academy'
                    ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                    : 'text-emerald-700 hover:text-emerald-800'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>AI Academy</span>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase ${
                  activeSection === 'academy' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  Free
                </span>
              </a>

              <a
                href="#how-it-works"
                className={`px-4 py-1.5 rounded-full transition-all ${
                  activeSection === 'how-it-works'
                    ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                How It Works
              </a>

              <a
                href="#pricing"
                className={`px-4 py-1.5 rounded-full transition-all ${
                  activeSection === 'pricing'
                    ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pricing
              </a>
            </nav>

            {/* Right Quick Actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={onOpenAuthModal}
                className="text-xs font-bold text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => onEnterPortal('launchpad')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Rocket className="w-3.5 h-3.5 text-amber-300" />
                <span>Launch Studio</span>
              </button>
            </div>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center space-y-8">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-indigo-200/80 shadow-xs text-xs font-bold text-indigo-700 backdrop-blur-md animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Built for AntiGravity, Claude Code, Cursor & Modern Vibe Coders</span>
          </div>

          {/* Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Turn Vibe Coding Into <br />
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Scalable Production Startups.
              </span>
            </h1>
            <p className="text-slate-600 text-base sm:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
              Stop wrestling with prompt drift, broken dev servers, and unstandardized architectures. 
              <strong> StartupOS</strong> delivers your <strong>4-file parity constitution</strong>, complete PRD suite, 
              1-click ZIP scaffold, and sequential agent execution runbooks in seconds.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onEnterPortal('launchpad')}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-extrabold text-sm px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2.5 active:scale-95 group cursor-pointer"
            >
              <Rocket className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span>Start Building Free in Studio</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onEnterPortal('academy')}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-sm px-7 py-4 rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 active:scale-95 group cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-emerald-200" />
              <span>Explore Free AI Academy</span>
              <span className="text-[10px] font-black bg-white/20 text-white px-2 py-0.5 rounded-full uppercase">
                100% Free
              </span>
            </button>

            <a
              href="#deliverables"
              className="w-full sm:w-auto bg-white/90 hover:bg-white text-slate-700 font-extrabold text-sm px-7 py-4 rounded-2xl border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileCode className="w-4 h-4 text-indigo-600" />
              <span>Inspect Deliverables</span>
            </a>
          </div>

          {/* Social Proof & Trust Metrics Ticker */}
          <div className="pt-8 border-t border-slate-200/70 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">1,400+</div>
              <div className="text-xs text-slate-500 font-semibold">AI Products Incubated</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">FREE</div>
              <div className="text-xs text-slate-500 font-semibold">AI Academy & Courses</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-indigo-600">100%</div>
              <div className="text-xs text-slate-500 font-semibold">4-File Parity Standard</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">82%</div>
              <div className="text-xs text-slate-500 font-semibold">Dev Time Saved</div>
            </div>
          </div>
        </section>

        {/* SECTION 1: INTERACTIVE DELIVERABLES INSPECTOR */}
        <section id="deliverables" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-xs font-bold uppercase tracking-wider">
              <Archive className="w-3.5 h-3.5 text-indigo-600" />
              <span>What You Receive</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              The StartupOS Deliverables Suite
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              Don't buy promises. Inspect the exact tangible production assets generated for every project in your workspace.
            </p>
          </div>

          {/* Interactive Deliverable Inspector Widget */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
            {/* Top Toolbar: Deliverable Tabs & Stack Preset Switcher */}
            <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Deliverable Type Tabs */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveDeliverableTab('constitution')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeDeliverableTab === 'constitution'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>1. 4-File Constitution</span>
                </button>

                <button
                  onClick={() => setActiveDeliverableTab('prd')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeDeliverableTab === 'prd'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>2. Production PRD Suite</span>
                </button>

                <button
                  onClick={() => setActiveDeliverableTab('scaffold')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeDeliverableTab === 'scaffold'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Archive className="w-4 h-4" />
                  <span>3. 1-Click .ZIP Scaffold</span>
                </button>

                <button
                  onClick={() => setActiveDeliverableTab('pipeline')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeDeliverableTab === 'pipeline'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  <span>4. Autonomous Runbook</span>
                </button>

                <button
                  onClick={() => setActiveDeliverableTab('sandbox')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeDeliverableTab === 'sandbox'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>5. Pre-Flight Sandbox QA</span>
                </button>

                <button
                  onClick={() => setActiveDeliverableTab('demoday')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeDeliverableTab === 'demoday'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Presentation className="w-4 h-4 text-amber-500" />
                  <span>6. Demo Day Pitch Deck</span>
                </button>
              </div>

              {/* Reactive Stack Preset Switcher */}
              <div className="flex items-center gap-2 self-start lg:self-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Test Reactive Stack:
                </span>
                <select
                  value={previewStack}
                  onChange={(e) => setPreviewStack(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-2xs"
                >
                  <option value="vite-react">React 18 + Vite + Tailwind</option>
                  <option value="nextjs">Next.js 15 (App Router)</option>
                  <option value="fastapi">FastAPI + Python 3.12</option>
                </select>
              </div>
            </div>

            {/* Inspector Body */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Explainer & Benefits */}
              <div className="lg:col-span-5 space-y-5">
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 uppercase tracking-widest">
                    Asset Overview
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                    {deliverableContent[activeDeliverableTab].title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {deliverableContent[activeDeliverableTab].desc}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-700">
                      Tailored dynamically to your configured tech stack: <strong>{stackLabels[previewStack]}</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-700">
                      Standardized formatting verified across AntiGravity, Claude Code, Cursor, and Windsurf.
                    </span>
                  </div>
                  <div className="flex items-start gap-3 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-700">
                      100% human-readable Markdown with zero opaque black-box abstractions.
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <button
                    onClick={onEnterPortal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <span>Generate Yours in Studio</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleCopyPreview}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-3 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Snippet'}</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Code / Tree Viewer */}
              <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-5 border border-slate-800 text-slate-200 shadow-2xl relative">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Generator Preview
                  </span>
                  <span>Stack: {previewStack}</span>
                </div>
                <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[440px] overflow-y-auto pt-4 selection:bg-indigo-600 selection:text-white">
                  {deliverableContent[activeDeliverableTab].code}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: WHY STARTUPOS & WHAT IT IS FOR */}
        <section id="why-startupos" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/60 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-purple-600" />
              <span>The Problem We Solve</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Why Vibe Coders Need StartupOS
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              Vibe coding without constitutional governance leads to architectural ruin. Here is what happens when you build with vs. without StartupOS.
            </p>
          </div>

          {/* Side-by-Side Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Without StartupOS Card */}
            <div className="bg-red-50/40 rounded-3xl border border-red-200 p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
                  ✕
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-red-900">Building Without StartupOS</h3>
                  <p className="text-xs text-red-600 font-medium">The Vibe-Coding Trap</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span><strong>Prompt Guessing:</strong> Wasting thousands of tokens re-explaining product context every single prompt.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span><strong>Architectural Drift:</strong> Agents arbitrarily replacing database libraries and breaking dev servers.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span><strong>Destructive Migrations:</strong> AI assistants dropping tables or running broad deletes without warning.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span><strong>Documentation Rot:</strong> Spec documents become outdated within 48 hours of starting the repo.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold">✕</span>
                  <span><strong>Zero Audience:</strong> Shipping code in private without an incubator community or launch distribution.</span>
                </li>
              </ul>
            </div>

            {/* With StartupOS Card */}
            <div className="bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 rounded-3xl border border-indigo-200 p-6 sm:p-8 space-y-6 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-600/30">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Building With StartupOS</h3>
                  <p className="text-xs text-indigo-600 font-bold">The Production Incubator Standard</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>4-File Parity Constitution:</strong> <code>AGENTS.md</code> locks in strict agent boundaries and Clean 2026 Light UI tokens.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Sequential Prompt Runbooks:</strong> Phase 1-4 autonomous prompts guide agents step-by-step with 0 hallucinations.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Non-Destructive Database Covenant:</strong> Enforces additive migrations and explicit approval gates.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>1-Click PKZIP Scaffolds:</strong> Instant client-side bundles pre-wired with selected dev commands.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span><strong>Verified Launchpad Community:</strong> Unlock 100-point 🏆 Certified Launch badges and gain real users.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 3: HOW IT WORKS (4-STAGE BUILDER WALKTHROUGH) */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span>How To Use It</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              From One-Sentence Idea to Certified Launch in 4 Steps
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              StartupOS provides an unbroken, deterministic workflow that eliminates friction at every milestone.
            </p>
          </div>

          {/* Interactive Step Navigator */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {howItWorksSteps.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setActiveHowStep(idx)}
                className={`p-6 rounded-3xl border transition-all text-left space-y-3 cursor-pointer ${
                  activeHowStep === idx
                    ? 'bg-white border-indigo-500 shadow-lg ring-2 ring-indigo-500/20'
                    : 'bg-white/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs text-white bg-gradient-to-r ${s.color}`}>
                    {s.step}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    {s.badge}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3">
                  {s.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Highlighted Step Feature Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                  STAGE {howItWorksSteps[activeHowStep].step}
                </span>
                <span className="text-xs font-bold text-slate-400">• {howItWorksSteps[activeHowStep].badge}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                {howItWorksSteps[activeHowStep].title}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
                {howItWorksSteps[activeHowStep].desc}
              </p>
              <div className="pt-2">
                <button
                  onClick={onEnterPortal}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  Enter Portal & Start Building <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 4: FREE AI ACADEMY & COURSES (THE FREE VALUE MAGNET) */}
        <section id="academy" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>100% Free Public Resource</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              The AI Builder Academy — <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Free Forever</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              We believe every builder deserves world-class AI engineering education. Explore complete masterclasses on 4-file parity, developer branding, and prompt architecture at zero cost.
            </p>
          </div>

          {/* Interactive Course Showcase Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
            {/* Course Selector Tabs */}
            <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCourseTab('course-branding')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeCourseTab === 'course-branding'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Developer Branding & GitHub Launchpad</span>
                  <span className="text-[9px] bg-white/20 text-white font-extrabold px-1.5 py-0.5 rounded-full">FREE</span>
                </button>

                <button
                  onClick={() => setActiveCourseTab('course-saas')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    activeCourseTab === 'course-saas'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Rocket className="w-4 h-4" />
                  <span>Build Full-Stack AI SaaS in 60 Mins</span>
                  <span className="text-[9px] bg-white/20 text-white font-extrabold px-1.5 py-0.5 rounded-full">FREE</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Over 4,200+ active learners enrolled</span>
              </div>
            </div>

            {/* Course Details & Interactive Module Inspector */}
            <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Course Overview */}
              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-widest">
                      {academyCourses[activeCourseTab].badge}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">• {academyCourses[activeCourseTab].duration}</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                    {academyCourses[activeCourseTab].title}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-emerald-700">
                    {academyCourses[activeCourseTab].subtitle}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {academyCourses[activeCourseTab].description}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Lead Instructor:</span>
                    <span className="font-extrabold text-slate-900">{academyCourses[activeCourseTab].instructor}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Target Audience:</span>
                    <span className="font-medium text-slate-600">{academyCourses[activeCourseTab].level}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-700">Tuition:</span>
                    <span className="font-black text-emerald-600 uppercase">$0 (Completely Free)</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => onEnterPortal('academy')}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Start Free Course in Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-[11px] text-slate-400 font-medium">
                    Instant access • No credit card required
                  </span>
                </div>
              </div>

              {/* Right Column: Interactive Curriculum Module Cards */}
              <div className="lg:col-span-6 space-y-4">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Curriculum Breakdown</span>
                </div>

                {academyCourses[activeCourseTab].modules.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 hover:border-emerald-300 transition-all shadow-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        {m.title}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        FREE
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium pl-6">
                      {m.lessons}
                    </p>
                  </div>
                ))}

                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/70 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-indigo-600 shrink-0" />
                  <p className="text-xs text-indigo-900 font-medium leading-relaxed">
                    <strong>Interactive AI Tutor Included:</strong> In-course AI assistant answers any questions, debugs your prompts, and scores your project submission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: INTERACTIVE BUILDER ROI CALCULATOR */}
        <section id="roi-calculator" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Interactive Calculator</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Calculate Your Monthly Time & Dollar ROI
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              See how much engineering time and capital you conserve by eliminating prompt re-explaining and architectural drift.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xl max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Slider Input Column */}
            <div className="md:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                  <span>Hours spent per month on specs, prompts & debugging drift:</span>
                  <span className="text-indigo-600 font-extrabold text-base px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200">
                    {calcHours} hrs/mo
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={calcHours}
                  onChange={(e) => setCalcHours(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                  <span>5 hrs (casual builder)</span>
                  <span>40 hrs (full-time dev)</span>
                  <span>80 hrs (hardcore founder)</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Based on benchmarked <strong>82% reduction</strong> in prompt engineering friction.</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <CheckCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Calculated at a standard <strong>$75/hour</strong> engineering & founder opportunity cost.</span>
                </div>
              </div>
            </div>

            {/* Metric Output Cards */}
            <div className="md:col-span-5 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/60 rounded-2xl border border-indigo-200/80 p-6 space-y-5 text-center shadow-xs">
              <div className="space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Time Reclaimed</div>
                <div className="text-4xl font-black text-indigo-600 tracking-tight">
                  ~{hoursSaved} hrs
                  <span className="text-xs font-bold text-slate-500 block">per month</span>
                </div>
              </div>

              <div className="border-t border-indigo-100 pt-4 space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Capital Saved</div>
                <div className="text-3xl font-black text-emerald-600 tracking-tight">
                  ${dollarSaved.toLocaleString()}
                  <span className="text-xs font-bold text-slate-500 block">per month</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onEnterPortal}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Reclaim Your Time Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: PRICING & TIERS (WHAT ARE THE PAID / PREMIUM FEATURES?) */}
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200/60 text-xs font-bold uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5 text-violet-600" />
              <span>Transparent Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Simple, Builder-Friendly Plans
            </h2>
            <p className="text-slate-600 text-sm sm:text-base font-medium">
              Start free in the Studio. Upgrade to Pro when you are ready for unlimited constitutional exports, private repos, and guaranteed Launchpad placement.
            </p>

            {/* Monthly / Annual Toggle */}
            <div className="pt-4 flex items-center justify-center gap-3">
              <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-400'}`}>
                Monthly Billing
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="w-12 h-6 rounded-full bg-indigo-600 p-1 transition-colors relative cursor-pointer"
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <div className="flex items-center gap-1.5">
                <span className={`text-xs font-bold ${billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-400'}`}>
                  Annual Billing
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                  Save 20%
                </span>
              </div>
            </div>
          </div>

          {/* 3 Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Free Tier */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 space-y-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">Hobby Builder</h3>
                  <p className="text-xs text-slate-500 font-medium">For curious builders and student explorers.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">$0</span>
                  <span className="text-xs text-slate-500 font-bold">/ month</span>
                </div>
                <div className="text-[11px] text-emerald-600 font-bold">Free forever • No credit card required</div>

                <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>100% Free AI Academy:</strong> Unlimited access to all masterclasses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>3 Scaffolds & PRD exports per month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Standard 4-File Parity constitutions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Public Idea Lab scoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Community Launchpad browsing</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-4 h-4 text-center font-bold">✕</span>
                    <span>1-Click PKZIP Scaffolds (Copy-paste only)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-4 h-4 text-center font-bold">✕</span>
                    <span>Certified Launchpad Placement badge</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onEnterPortal}
                className="w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-all cursor-pointer"
              >
                Start Free in Studio
              </button>
            </div>

            {/* Pro Builder Tier (Highlighted) */}
            <div className="bg-gradient-to-b from-indigo-50/60 via-white to-purple-50/40 rounded-3xl border-2 border-indigo-500 p-8 space-y-6 flex flex-col justify-between shadow-xl relative scale-105">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-[10px] uppercase tracking-widest px-3.5 py-1 rounded-full shadow-md">
                Most Popular
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>Pro Builder</span>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">For serious vibe coders and solo founders shipping MVPs.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">
                    ${billingCycle === 'annual' ? '24' : '29'}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">/ month</span>
                </div>
                <div className="text-[11px] text-indigo-600 font-bold">
                  {billingCycle === 'annual' ? 'Billed annually ($288/yr)' : 'Billed monthly'}
                </div>

                <div className="border-t border-indigo-100 pt-4 space-y-3 text-xs text-slate-700 font-semibold">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span><strong>Unlimited</strong> PRD & Constitution exports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span><strong>1-Click .ZIP Scaffolds:</strong> Pure client-side packaging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span><strong>4-Phase Autonomous Prompt Runbooks</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span><strong>100-Point Audit Engine</strong> with Auto-Fill</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span><strong>🏆 Certified Launchpad Badges</strong> on product feed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Priority community feedback & upvotes</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenAuthModal}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Get Pro Builder Pass</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Studio / Team Tier */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-8 space-y-6 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">Studio & Venture</h3>
                  <p className="text-xs text-slate-500 font-medium">For AI studios, incubators, and agencies launching 10+ projects.</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">
                    ${billingCycle === 'annual' ? '79' : '99'}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">/ month</span>
                </div>
                <div className="text-[11px] text-purple-600 font-bold">
                  {billingCycle === 'annual' ? 'Billed annually ($948/yr)' : 'Billed monthly'}
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Everything in Pro Builder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Up to 10 team seats with role permissions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Custom constitutional governance presets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>White-label PRD export & branding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Featured top-spot placement in Launchpad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Dedicated Slack / Discord channel support</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onOpenAuthModal}
                className="w-full py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-all cursor-pointer"
              >
                Contact Studio Sales
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 6: INTERACTIVE FAQ ACCORDION */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Got Questions? We Have Answers.
            </h2>
            <p className="text-slate-600 text-sm font-medium">
              Everything you need to know about the platform, our governance standards, and export ownership.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((f, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-extrabold text-sm sm:text-base text-slate-900 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <span>{f.q}</span>
                    <div className={`p-1 rounded-lg bg-slate-100 transition-transform ${isOpen ? 'rotate-180 bg-indigo-50 text-indigo-600' : 'text-slate-500'}`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-4 animate-fade-in">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 7: BOTTOM HIGH-CONVERTING CTA BANNER */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-900 via-slate-950 to-purple-950 rounded-3xl p-8 sm:p-14 text-white text-center space-y-6 relative overflow-hidden shadow-2xl border border-indigo-500/20">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-bold text-indigo-300">
                <Rocket className="w-3.5 h-3.5 text-amber-400" />
                <span>Ready to ship your next big thing?</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Stop Re-Prompting. <br />
                Start Architecting.
              </h2>

              <p className="text-slate-300 text-sm sm:text-base font-normal">
                Join over 1,400+ solo founders and vibe coders who use StartupOS to turn chaotic ideas into scalable production startups.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={onEnterPortal}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-extrabold text-sm px-8 py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Launch Live Studio Free</span>
                </button>

                <button
                  onClick={onOpenAuthModal}
                  className="w-full sm:w-auto bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-sm px-7 py-4 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-indigo-400" />
                  <span>Sign In to Your Workspace</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* STANDALONE WEBSITE FOOTER */}
        <footer className="border-t border-slate-800 py-10 text-center text-xs text-slate-500 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 space-y-3">
            <div className="flex items-center justify-center gap-3">
              <span className="font-extrabold text-sm text-slate-300">StartupOS 2026</span>
              <span>•</span>
              <span>Learn. Architect. Ship.</span>
            </div>
            <p className="text-slate-600">
              The 360° AI Product Creation Platform & Ecosystem. Built for founders, developers, and students.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
