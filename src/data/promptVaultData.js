// src/data/promptVaultData.js
// Battle-Tested AI Prompt Vault & Dynamic Spec Generator

export const PROMPT_CATEGORIES = [
  { id: 'all', label: 'All Prompts', count: 16 },
  { id: 'autonomous-pipeline', label: '🚀 Autonomous 0-to-1 Pipeline', count: 4 },
  { id: 'prd', label: '01. PRD & Ideation', count: 3 },
  { id: 'architecture', label: '02. Architecture & DB', count: 3 },
  { id: 'agent-coding', label: '03. Agent Code Generation', count: 2 },
  { id: 'security-qa', label: '04. Security, QA & Auditing', count: 2 },
  { id: 'gtm-branding', label: '05. GTM & Personal Branding', count: 2 }
];

export const PROMPT_TEMPLATES = [
  {
    id: 'auto-01-scaffold',
    title: 'Phase 1: Constitutional Scaffolding & Clean Dev Server',
    category: 'autonomous-pipeline',
    stepNumber: 1,
    targetTools: ['AntiGravity', 'Claude Code', 'Cursor'],
    badge: 'Step 1 of 4',
    description: 'Initializes repository structure, establishes 4-file parity constitution, installs dependencies, and boots clean dev server.',
    template: `You are an autonomous AI staff engineer pairing with a founder to build "{{PRODUCT_NAME}}".

PRODUCT BRIEF:
- Product: {{PRODUCT_NAME}}
- Audience: {{TARGET_AUDIENCE}}
- Core Problem: {{CORE_PROBLEM}}
- Unfair Advantage: {{CORE_ADVANTAGE}}
- Tech Stack: {{TECH_STACK}}

TASK: Phase 1 — Project Scaffolding & 4-File Parity Governance
1. Create the repository root directory structure for {{TECH_STACK}}.
2. Ensure the 4 core baseline constitutional files exist in repository root:
   - AGENTS.md (Rules for AI coding agents, sandbox policy, and Clean 2026 Light UI standards)
   - ROADMAP.md (Phase 1, 2, and 3 milestone tracker with active checklist)
   - CLAUDE.md (Dev commands: start dev server, build, lint, and test)
   - CONTRIBUTING.md (Conventional Commits, branch conventions, and documentation covenants)
3. Initialize the package manifest, dev server, and Tailwind CSS configuration.
4. Verify the dev server boots cleanly with zero console errors or warnings.

DO NOT write backend endpoints or database queries yet. Keep this commit strictly focused on scaffolding and governance parity. Report back with the exact commands run and the live dev server URL.`,
    tags: ['Autonomous Pipeline', 'Scaffolding', 'AGENTS.md', 'Vite', 'Dev Server']
  },
  {
    id: 'auto-02-backend',
    title: 'Phase 2: Additive Database Schemas & REST APIs',
    category: 'autonomous-pipeline',
    stepNumber: 2,
    targetTools: ['AntiGravity', 'Claude Code', 'Cursor'],
    badge: 'Step 2 of 4',
    description: 'Implements non-destructive database schemas, seed data, and robust CRUD REST API endpoints with request validation.',
    template: `You are continuing development on "{{PRODUCT_NAME}}". Phase 1 (scaffolding and constitutional governance) is complete.

PRODUCT CONTEXT:
- Product: {{PRODUCT_NAME}}
- Problem to Solve: {{CORE_PROBLEM}}
- Tech Stack: {{TECH_STACK}}

TASK: Phase 2 — Database Architecture, Migrations & REST API Layer
1. Adhere strictly to the Non-Destructive Database Covenant in AGENTS.md:
   - All migrations must be additive (use CREATE TABLE IF NOT EXISTS, ALTER TABLE ADD COLUMN).
   - Never run destructive DROPs or TRUNCATEs.
2. Define the core entity schema for {{PRODUCT_NAME}} to handle:
   - User identity / workspace context
   - Primary data entities needed to solve: {{CORE_PROBLEM}}
3. Implement structured REST API endpoints:
   - GET /api/health (Service status and version check)
   - GET /api/items (List with filtering/sorting)
   - POST /api/items (Create with strict input validation)
   - GET /api/items/:id (Single entity detail)
4. Seed mock data representing realistic {{TARGET_AUDIENCE}} workloads.
5. Verify all endpoints via automated tests or curl assertions. Update ROADMAP.md checking off Milestone 2.`,
    tags: ['Autonomous Pipeline', 'Backend', 'REST API', 'Database', 'Migrations']
  },
  {
    id: 'auto-03-frontend',
    title: 'Phase 3: Clean 2026 Light UI & Interactive Experience',
    category: 'autonomous-pipeline',
    stepNumber: 3,
    targetTools: ['AntiGravity', 'Claude Code', 'Cursor'],
    badge: 'Step 3 of 4',
    description: 'Builds high-contrast, responsive 2026 Light Modern UI components, user flows, error boundaries, and state management.',
    template: `You are continuing development on "{{PRODUCT_NAME}}". Phases 1 & 2 are complete and verified.

PRODUCT CONTEXT:
- Product: {{PRODUCT_NAME}}
- Target Persona: {{TARGET_AUDIENCE}}
- Core Value Proposition: {{CORE_ADVANTAGE}}
- Tech Stack: {{TECH_STACK}}

TASK: Phase 3 — 2026 Light Modern User Experience & Frontend Surface
1. Adhere strictly to the Clean 2026 Light UI Standard:
   - Canvas: zinc-50 or slate-50 background (NOT dark/pitch-black).
   - Surfaces: Crisp #ffffff cards with subtle border (border-slate-200/80) and soft drop shadows (shadow-xs/shadow-sm).
   - Typography: High-contrast slate-900 / slate-800 headings with clear typographic hierarchy.
   - Accents: Purposeful brand color tokens with soft pill badges.
2. Build the primary user interface surfaces:
   - Intake / configuration form with client-side validation and helpful error feedback.
   - Interactive dashboard displaying real-time outputs and metrics.
   - Empty-slate states with clear CTAs for first-time builders.
3. Wire frontend state to the Phase 2 backend REST API.
4. Add loading states, toast feedback, and responsive layout for mobile and desktop viewports.
5. Update ROADMAP.md checking off Milestone 3.`,
    tags: ['Autonomous Pipeline', 'Frontend', '2026 Light UI', 'React', 'Tailwind']
  },
  {
    id: 'auto-04-qa-launch',
    title: 'Phase 4: QA Gate, Parity Verification & Launchpad Entry',
    category: 'autonomous-pipeline',
    stepNumber: 4,
    targetTools: ['AntiGravity', 'Claude Code', 'Cursor'],
    badge: 'Step 4 of 4',
    description: 'Executes production build, enforces 0-warning lint/typecheck, audits 4-file parity, and formats public Launchpad payload.',
    template: `You are finalizing "{{PRODUCT_NAME}}" for production release and public launch on StartupOS Launchpad.

TASK: Phase 4 — Quality Gate Hardening, Parity Audit & Launch Submission
1. Verification Checks:
   - Run production build command: verify 0 errors.
   - Run linter / typecheck: verify 0 warnings and 0 errors.
   - Run test suites: verify 100% passing rate.
2. 4-File Parity Audit:
   - Confirm AGENTS.md, ROADMAP.md, CLAUDE.md, and CONTRIBUTING.md all reflect the current v1.0 release.
   - Ensure all completed items in ROADMAP.md are checked [x].
3. Prepare StartupOS Launchpad Payload:
   - Product Name: {{PRODUCT_NAME}}
   - Tagline: (1-line punchy value proposition for {{TARGET_AUDIENCE}})
   - Category: (Select: Developer Tools, AI / Automation, SaaS, Open Source)
   - Key Features: (Bullet list of 3-4 validated capabilities)
   - Tech Stack: {{TECH_STACK}}
   - GitHub Repository URL & Live Demo Link
4. Commit all changes with Conventional Commits: 'feat(core): complete v1.0 MVP build and launch preparation'.`,
    tags: ['Autonomous Pipeline', 'QA Gate', 'Audit', 'Launchpad', 'Parity']
  },
  {
    id: 'prd-master-generator',
    title: '1-Sentence Idea to 10-Part Production PRD',
    category: 'prd',
    targetTools: ['AntiGravity', 'Claude Code', 'ChatGPT'],
    badge: 'Flagship PRD',
    description: 'Generates an exhaustive, investor-grade Product Requirements Document complete with user personas, edge cases, non-goals, and measurable success metrics.',
    template: `You are an elite Principal Product Manager at a high-velocity AI incubator. 

Analyze this product idea and generate an exhaustive, battle-tested Product Requirements Document (PRD v1.0).

---
## PRODUCT CONTEXT
- Product Name: {{PRODUCT_NAME}}
- Target Audience: {{TARGET_AUDIENCE}}
- Core Pain Point: {{CORE_PROBLEM}}
- Unfair Advantage / Key Differentiator: {{CORE_ADVANTAGE}}
- Target Tech Stack: {{TECH_STACK}}
---

Structure the PRD into these mandatory 10 sections:

1. EXECUTIVE SUMMARY & NORTH STAR METRIC
   - 1-sentence product thesis
   - Primary metric (e.g. 7-day retention, time-to-first-workflow-completion)
   - Secondary guardrail metrics

2. USER PERSONA & PAIN STATEMENT
   - Deep psychological persona breakdown: Motivations, daily workflows, frustration points with legacy tools.
   - 3 specific 'Jobs-to-be-Done' (JTBD) statements.

3. COMPETITIVE MATRIX & UNFAIR ADVANTAGE
   - Breakdown of legacy workarounds vs {{PRODUCT_NAME}}.
   - Why incumbents cannot easily replicate this workflow without cannibalizing existing revenue.

4. SCOPE BOUNDARIES & STRICT NON-GOALS (MVP)
   - In-Scope (Must Have for v1.0 Launch)
   - Out-of-Scope / Non-Goals (Explicitly what we are NOT building in v1 to avoid scope creep).

5. USER JOURNEY & STEP-BY-STEP WORKFLOW
   - End-to-end journey from Landing Page -> Frictionless Onboarding -> Aha Moment -> Persistent Output.

6. CORE FUNCTIONAL REQUIREMENTS (With Acceptance Criteria)
   - Write requirements in Gherkin format:
     Given [context], When [action], Then [expected deterministic outcome].

7. DATA CONTRACTS & JSON SCHEMAS
   - Complete TypeScript interfaces or JSON entities for all primary models.

8. EDGE CASES, ERROR STATES & FALLBACKS
   - Network failure behavior, quota exhaustion, AI hallucination guardrails, empty state UX.

9. 4-FILE PARITY & GOVERNANCE REQUIREMENTS
   - Rules for AGENTS.md, ROADMAP.md, CLAUDE.md, and CONTRIBUTING.md.

10. LAUNCH & VERIFICATION CHECKLIST
    - Definition of Done (DoD) before opening to public launchpad upvoting.

Format output in crisp, professional GitHub Markdown. Avoid vague placeholders or ellipses.`,
    tags: ['PRD', 'Product Management', 'Spec Writing', 'Scope Definition']
  },
  {
    id: 'prd-competitive-moat',
    title: 'Defensibility & Moat Analysis Stress-Test',
    category: 'prd',
    targetTools: ['AntiGravity', 'Claude Code'],
    badge: 'Moat Analysis',
    description: 'Stress-tests your product concept against platform risk, wrapper syndrome, and incumbent copying.',
    template: `Act as a cynical venture partner specializing in AI-native platforms.

Critically audit the defensibility and unit economics of:
- Product Name: {{PRODUCT_NAME}}
- Audience: {{TARGET_AUDIENCE}}
- Core Workflow: {{CORE_PROBLEM}}
- Proposed Moat: {{CORE_ADVANTAGE}}

Execute a brutal defensibility audit:
1. WRAPPER RISK: How easily could OpenAI, Google, or Apple ship this as an OS-level feature within 6 months?
2. WORKFLOW LOCK-IN: What proprietary data, graph network, or compliance wedge prevents user churn?
3. COLD-START PROBLEM: How does {{PRODUCT_NAME}} deliver 10x value to user #1 before any network effects kick in?
4. UNIT ECONOMICS: Calculate estimated token inference costs per active user vs realistic subscription pricing.
5. STRATEGIC RECOMMENDATIONS: Provide 3 non-obvious product pivots to build a durable 5-year moat.`,
    tags: ['Moat', 'VC Audit', 'Strategy', 'Unit Economics']
  },
  {
    id: 'prd-pricing-monetization',
    title: 'Dynamic Pricing & Paywall Architecture Spec',
    category: 'prd',
    targetTools: ['AntiGravity', 'ChatGPT'],
    badge: 'Monetization',
    description: 'Designs a tiered monetization model (Free / Pro / Team) with hard limits, usage metering, and Stripe checkout specs.',
    template: `You are a Monetization Architect for high-growth SaaS.

Design a comprehensive monetization architecture for {{PRODUCT_NAME}} targeting {{TARGET_AUDIENCE}}:

1. THREE-TIER PRICING MATRIX:
   - Free / Explorer Tier: Hard limits, watermarks, community features.
   - Pro Builder Tier ($15 - $29/mo): Uncapped execution, custom domains, high-priority AI inference.
   - Studio / Team Tier ($79 - $149/mo): Multi-seat workspace, centralized billing, audit logs.

2. METRIC MONETIZED:
   - Identify whether billing should be seat-based, credit-based, or outcome-based. Explain why.

3. UPSELL TRIGGERS & PAYWALL PSYCHOLOGY:
   - 3 high-intent moments in the user journey where the upgrade modal should trigger organically without feeling predatory.

4. DATABASE DATA CONTRACT:
   - Write a JSON schema representing the User Subscription state (stripeCustomerId, planTier, creditsRemaining, billingCycleEnd).`,
    tags: ['Pricing', 'Stripe', 'Paywall', 'Economics']
  },
  {
    id: 'arch-database-schema',
    title: 'Zero-Overhead Relational Schema & Migration Spec',
    category: 'architecture',
    targetTools: ['AntiGravity', 'Claude Code', 'Cursor'],
    badge: 'DB Architecture',
    description: 'Generates clean, normalized SQLite / PostgreSQL schemas with foreign keys, indexes, and non-destructive migration scripts.',
    template: `You are a Principal Database Architect.

Design the database persistence layer for:
- Product: {{PRODUCT_NAME}}
- Primary Entities: Core entities solving {{CORE_PROBLEM}}
- Stack: {{TECH_STACK}}

Provide:
1. SCHEMA DEFINITION (SQL DDL):
   - Table definitions with UUID primary keys, created_at, updated_at timestamps.
   - Strict foreign key constraints with ON DELETE CASCADE where appropriate.
   - High-performance B-tree indexes for all foreign keys and frequently filtered query columns.

2. SAMPLE SEED DATA:
   - Provide 3 realistic seed records per table demonstrating representative production state.

3. REPOSITORY QUERY LAYER (ES Modules / TypeScript):
   - Clean async repository functions with parameterized queries to prevent SQL injection:
     - createWorkspace()
     - getEntityById()
     - listEntitiesByAudience()
     - updateStatus()

4. NON-DESTRUCTIVE MIGRATION PLAYBOOK:
   - Rules for running safe schema updates in production without dropping user tables.`,
    tags: ['SQLite', 'PostgreSQL', 'Database Schema', 'SQL']
  },
  {
    id: 'arch-api-contracts',
    title: 'REST API & Zod Validation Contract Suite',
    category: 'architecture',
    targetTools: ['AntiGravity', 'Cursor', 'Claude Code'],
    badge: 'API Contracts',
    description: 'Defines end-to-end REST endpoints with input sanitization, Zod schemas, HTTP status codes, and error payloads.',
    template: `You are an API Architect designing contracts for {{PRODUCT_NAME}}.

Target Stack: {{TECH_STACK}}
Core Objective: Resolve {{CORE_PROBLEM}} for {{TARGET_AUDIENCE}}.

Generate a production-ready REST API specification:

1. ENDPOINT MATRIX:
   - POST   /api/v1/workspaces          (Create new session/workspace)
   - GET    /api/v1/workspaces/:id      (Fetch workspace state)
   - POST   /api/v1/actions/execute     (Trigger core AI workflow)
   - GET    /api/v1/analytics/overview  (Fetch builder telemetry)

2. REQUEST / RESPONSE SPECIFICATIONS:
   - Complete JSON request payloads and 200 OK responses for each endpoint.
   - Standardized 400 Bad Request and 500 Internal Error envelopes:
     { "success": false, "error": { "code": "VALIDATION_FAILED", "message": "...", "details": [] } }

3. INPUT VALIDATION (Zod Schemas):
   - Write exhaustive TypeScript Zod schemas enforcing strict string lengths, email formatting, and enum constraints.`,
    tags: ['REST API', 'Zod', 'Express', 'FastAPI']
  },
  {
    id: 'arch-multi-surface-bridge',
    title: 'Multi-Surface Chrome Extension & Webhook Bridge',
    category: 'architecture',
    targetTools: ['AntiGravity', 'Claude Code'],
    badge: 'Multi-Surface',
    description: 'Architects seamless cross-surface synchronization between a web application and a Chrome Extension (Manifest V3).',
    template: `You are an IoT and Multi-Surface Systems Architect.

Architect the cross-surface synchronization protocol for {{PRODUCT_NAME}} across Web App and Chrome Extension (Manifest V3):

1. CLIENT ROLES:
   - Surface A: Web Dashboard (React / Vite)
   - Surface B: Browser Extension Content Script & Background Service Worker

2. AUTHENTICATION HANDOFF:
   - How the extension securely inherits user authentication tokens from the web domain without exposing cookies or tokens to third-party scripts.

3. MESSAGE PASSING PROTOCOL:
   - Chrome runtime.sendMessage specification with typed event payloads:
     - 'DOM_INSPECT_REQUEST'
     - 'FEATURE_EXTRACTED_SUCCESS'
     - 'SYNC_TO_BACKEND'

4. BACKGROUND RESILIENCE:
   - Handling MV3 service worker dormancy and keeping pending task queues synchronized.`,
    tags: ['Chrome Extension', 'Manifest V3', 'Multi-Surface', 'Webhooks']
  },
  {
    id: 'agent-lead-architect',
    title: 'AntiGravity / Claude Code Constitution & Lead Architect Prompt',
    category: 'agent-coding',
    targetTools: ['AntiGravity', 'Claude Code'],
    badge: 'Agent Constitution',
    description: 'The master constitution system prompt that forces AI coding agents to write clean, non-destructive, 4-File Parity compliant code.',
    template: `You are the Lead Autonomous Systems Architect for {{PRODUCT_NAME}}.

CONSTITUTION & GOVERNANCE RULES:
1. 4-FILE PARITY IS MANDATORY:
   - Every module must align with AGENTS.md, ROADMAP.md, CLAUDE.md, and CONTRIBUTING.md.
2. ZERO SPECULATIVE REWRITES:
   - Prefer small, high-confidence, line-indexed diffs. Never overwrite entire existing files when editing specific functions.
3. PRESERVE COMMENTS & DOCSTRINGS:
   - Maintain documentation integrity across all existing code.
4. VERIFY LOCALLY BEFORE DECLARING DONE:
   - Run build and test checks (npm run build / node server.mjs) before reporting task completion.
5. NO PLACEHOLDER ELLIPSES:
   - Never output '// ... existing code ...'. Always provide fully functional, compilable code.

CURRENT OBJECTIVE:
Implement the core module resolving: {{CORE_PROBLEM}}
Using Stack: {{TECH_STACK}}
Tailored For: {{TARGET_AUDIENCE}}

Begin by outputting your implementation plan, then proceed methodically step-by-step.`,
    tags: ['AntiGravity', 'Claude Code', 'Constitution', 'Agentic Coding']
  },
  {
    id: 'agent-deterministic-diff',
    title: 'Zero-Drift Surgical Code Refactoring Prompt',
    category: 'agent-coding',
    targetTools: ['AntiGravity', 'Cursor', 'Claude Code'],
    badge: 'Code Refactor',
    description: 'Prevents agent hallucinations during refactors by restricting edits to contiguous, verifiable line chunks.',
    template: `You are performing a surgical refactor on {{PRODUCT_NAME}}.

STRICT EXECUTION PROTOCOL:
1. Do NOT delete or rewrite unrelated functions in the target file.
2. Ensure all newly introduced imports match the package.json dependencies exactly.
3. Adhere to the existing code style:
   - 2-space indentation
   - Modern ES Modules (import / export)
   - 2026 Light modern UI design system tokens (ambient blur + glassmorphism)
4. Verify that no existing routes, tests, or mock datasets are broken by this diff.

Refactor target: Optimize the execution speed and error handling of {{CORE_ADVANTAGE}}.`,
    tags: ['Refactoring', 'Zero-Drift', 'Clean Code', 'TypeScript']
  },
  {
    id: 'sec-red-team-audit',
    title: 'OWASP Top 10 & AI Prompt Injection Red Team Audit',
    category: 'security-qa',
    targetTools: ['AntiGravity', 'Claude Code'],
    badge: 'Security Audit',
    description: 'Thoroughly reviews your codebase for prompt injection, CORS leaks, insecure JWT handling, and SQL injection.',
    template: `You are an aggressive Red Team Security Engineer auditing {{PRODUCT_NAME}}.

Perform an exhaustive vulnerability assessment on the application:

1. PROMPT INJECTION & JAILBREAKS:
   - How can malicious actors bypass system prompts via user inputs in {{CORE_PROBLEM}} workflows?
   - Propose an input sanitization and delimiter sandwich strategy to neutralize jailbreak attempts.

2. AUTHENTICATION & SESSION HYGIENE:
   - Audit JWT expiration, refresh token rotation, and HttpOnly cookie flags.
   - Verify rate-limiting on all public endpoints (e.g. 100 requests per 15 minutes per IP).

3. DATABASE & SSRF VULNERABILITIES:
   - Verify that all database queries use parameterized placeholders.
   - If user-provided URLs are scraped, verify protections against Server-Side Request Forgery (SSRF) targeting 127.0.0.1 or cloud metadata endpoints (169.254.169.254).

4. REMEDIATION CODE SNIPPETS:
   - Provide drop-in Express / Node middleware to patch each identified vulnerability immediately.`,
    tags: ['Security', 'OWASP', 'Prompt Injection', 'Penetration Testing']
  },
  {
    id: 'sec-qa-stress-test',
    title: 'Concurrency, Race Conditions & Edge Case Test Suite',
    category: 'security-qa',
    targetTools: ['AntiGravity', 'Cursor'],
    badge: 'QA & Edge Cases',
    description: 'Generates automated test suites (Vitest / Jest) covering concurrency bugs, race conditions, and network dropouts.',
    template: `You are a Principal Software Quality Engineer.

Generate a comprehensive automated test suite for {{PRODUCT_NAME}} targeting the core workflow: {{CORE_ADVANTAGE}}.

Deliverables:
1. UNIT TESTS:
   - 5 tests covering happy path inputs.
   - 5 tests verifying handling of null, undefined, malformed strings, and 50MB payload limits.

2. CONCURRENCY & RACE CONDITIONS:
   - A test simulating 20 simultaneous requests mutating the same record simultaneously to ensure atomicity.

3. AI FAILURE SIMULATION:
   - Test verifying UI behavior when the LLM returns 429 Too Many Requests or 503 Overloaded. Ensure fallback cache triggers gracefully.

Format tests using standard Vitest / Jest syntax with clear descriptive assertion blocks.`,
    tags: ['Vitest', 'Jest', 'Edge Cases', 'QA Testing']
  },
  {
    id: 'gtm-viral-linkedin',
    title: '5-Part Viral LinkedIn "Build in Public" Hook Formula',
    category: 'gtm-branding',
    targetTools: ['AntiGravity', 'ChatGPT'],
    badge: 'Social Launch',
    description: 'Generates high-converting LinkedIn build-in-public posts that catch eyeballs from recruiters, builders, and investors.',
    template: `You are a Viral Tech Growth Strategist specializing in AI launches on LinkedIn.

Write 3 distinct high-converting LinkedIn posts announcing {{PRODUCT_NAME}} to {{TARGET_AUDIENCE}}:

POST 1: THE VULNERABLE 0-TO-1 BUILDER STORY
- Hook (Lines 1-2): A counter-intuitive revelation about building with AI agents.
- The Struggle: Why traditional workarounds failed (resolving {{CORE_PROBLEM}}).
- The Breakthrough: How we shipped {{PRODUCT_NAME}} in days using 4-File Parity and {{TECH_STACK}}.
- Proof of Work: Short video/GIF cue + GitHub repository link.
- CTA: Ask an open-ended technical question in line 1 of the comments to trigger algorithmic reach.

POST 2: THE RECRUITER & INVESTOR EYE-CATCHER
- Focus on engineering discipline, architecture decisions, and real user validation.
- Metrics achieved and link to the live demo.

POST 3: THE TECHNICAL BREAKDOWN / LESSONS LEARNED
- "5 things I learned building {{PRODUCT_NAME}} that nobody talks about."
- High value takeaway for junior builders and PMs.`,
    tags: ['LinkedIn', 'Build in Public', 'Growth', 'Eyeballs']
  },
  {
    id: 'gtm-product-hunt-maker',
    title: 'Product Hunt & StartupOS Launchpad Maker Pitch',
    category: 'gtm-branding',
    targetTools: ['AntiGravity', 'ChatGPT'],
    badge: 'Launchpad Pitch',
    description: 'Crafts the perfect #1 Product of the Day tagline, maker intro comment, and community engagement response templates.',
    template: `You are a Launchpad Specialist who has helped 20+ startups achieve Product of the Day.

Craft the complete launch kit for {{PRODUCT_NAME}}:

1. PUNCHY TAGLINE (Max 55 characters):
   - Example: "AI Solo Travel Matching" -> 3 high-converting variations.

2. MAKER FIRST COMMENT (The authentic story that drives upvotes):
   - Who I am: Passionate builder / AI Product Manager.
   - Why I built this: The personal frustration that sparked {{PRODUCT_NAME}}.
   - What makes it different: Our core advantage: {{CORE_ADVANTAGE}}.
   - Exclusive community offer: Free lifetime access for early community testers.
   - The Ask: "We'd love your brutal feedback on our onboarding workflow!"

3. COMMUNITY FAQ CHEAT SHEET:
   - 3 prepared responses for skeptical comments (e.g. data privacy, API pricing, roadmap).`,
    tags: ['Product Hunt', 'Launchpad', 'Pitch', 'Community']
  }
];

export function interpolatePrompt(templateText, context = {}) {
  const defaults = {
    PRODUCT_NAME: 'NextGen AI Workspace',
    TARGET_AUDIENCE: 'Solo Founders, Product Managers & Student Builders',
    CORE_PROBLEM: 'Slow manual product development, messy architecture, and lack of reproducible agent governance',
    CORE_ADVANTAGE: 'Instant 0-to-1 PRD generation, 4-File Parity governance, and automated AI evaluation',
    TECH_STACK: 'React 18 + Vite + Node.js Express + SQLite / PostgreSQL'
  };

  const merged = { ...defaults, ...context };

  return templateText
    .replace(/\{\{PRODUCT_NAME\}\}/g, merged.PRODUCT_NAME || defaults.PRODUCT_NAME)
    .replace(/\{\{TARGET_AUDIENCE\}\}/g, merged.TARGET_AUDIENCE || defaults.TARGET_AUDIENCE)
    .replace(/\{\{CORE_PROBLEM\}\}/g, merged.CORE_PROBLEM || defaults.CORE_PROBLEM)
    .replace(/\{\{CORE_ADVANTAGE\}\}/g, merged.CORE_ADVANTAGE || defaults.CORE_ADVANTAGE)
    .replace(/\{\{TECH_STACK\}\}/g, merged.TECH_STACK || defaults.TECH_STACK);
}
