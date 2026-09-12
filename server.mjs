import { createServer } from "node:http";
import { mkdir, readFile, writeFile, stat } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { extname, join, normalize } from "node:path";

const port = Number(process.env.PORT || 8081);
const root = process.cwd();
const dataDirectory = join(root, "data");
const databaseFile = join(dataDirectory, "ideas.json");
const launchesFile = join(dataDirectory, "launches.json");
const usersFile = join(dataDirectory, "users.json");
const auditsFile = join(dataDirectory, "audits.json");
const projectsFile = join(dataDirectory, "registered_projects.json");
const cobuildersFile = join(dataDirectory, "cobuilders.json");
const connectionsFile = join(dataDirectory, "cobuilder_connections.json");
const feedFile = join(dataDirectory, "cobuilder_feed.json");

const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8" };
const json = (res, status, body) => { res.writeHead(status, { "content-type": "application/json; charset=utf-8" }); res.end(JSON.stringify(body)); };

const INITIAL_FEED_POSTS = [
  {
    id: "post-1",
    authorId: "cobuilder-harshita",
    authorName: "Harshita Agarwal",
    authorAvatar: "👩‍💻",
    authorRole: "AI Systems Architect & Full-Stack Engineer",
    authorBadge: "1% Elite Maker",
    timeAgo: "2 hours ago",
    content: "🚀 Thrilled to announce that ContextPrism just achieved 100% 4-File Constitution Parity on StartupOS!\n\nBy implementing AST tree-shaking and dynamic semantic caching, we're cutting enterprise LLM inference tokens by 62% without losing context.\n\nNow actively looking for a B2B GTM / Enterprise Sales Co-Founder to help lead customer development with AI engineering teams. 50/50 Equity split. Pitch me directly through my profile below!",
    projectMention: {
      name: "ContextPrism",
      tagline: "Enterprise Token FinOps Gateway & AST Pruner",
      url: "https://github.com/1997agarwal/ContextPrism",
      parityScore: 100
    },
    likes: 24,
    likedBy: [],
    comments: [
      { id: "c-1", author: "Arjun Mehta", avatar: "🚀", text: "Huge milestone Harshita! The AST token pruner solves a massive pain point for high-volume agent pipelines.", time: "1h ago" }
    ],
    shares: 6,
    tags: ["#OpenToCoFound", "#TokenFinOps", "#AgenticAI", "#B2BGrowth"],
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: "post-2",
    authorId: "cobuilder-arjun",
    authorName: "Arjun Mehta",
    authorAvatar: "🚀",
    authorRole: "B2B SaaS Growth & Enterprise GTM Lead",
    authorBadge: "Verified Founder",
    timeAgo: "5 hours ago",
    content: "B2B Accounts Receivable collections is ready for an agentic AI overhaul. Invoices take 45+ days to settle, costing suppliers millions in trapped working capital.\n\nWe built BusinessPay to automate early payment discounts and reconciliation. Validated with 8 mid-market distributors.\n\nSeeking a Technical Co-Founder / Lead AI Engineer (FastAPI + React 19) to lead the core platform. Equal equity. Let's talk!",
    projectMention: {
      name: "BusinessPay",
      tagline: "B2B AR Collections & Dynamic Discounting Engine",
      url: "https://github.com/Business-Tribe/BusinessPay",
      parityScore: 100
    },
    likes: 19,
    likedBy: [],
    comments: [],
    shares: 4,
    tags: ["#CoFounderSearch", "#FinTech", "#FastAPI", "#B2BEnterprise"],
    createdAt: new Date(Date.now() - 18000000).toISOString()
  },
  {
    id: "post-3",
    authorId: "cobuilder-sophia",
    authorName: "Sophia Chen",
    authorAvatar: "🎨",
    authorRole: "Senior AI UX Architect & Product Designer",
    authorBadge: "Design Fellow",
    timeAgo: "1 day ago",
    content: "Design systems in 2026 must be built for human-in-the-loop AI workflows. Excited to unveil the visual architecture tokens for Trippy & DupeScout on StartupOS.\n\nAvailable for part-time / equity co-founder collaboration on consumer AI apps, visual similarity engines, or creator platforms. Send me a pitch!",
    projectMention: {
      name: "Trippy",
      tagline: "AI Solo Travel Group Matching & Host Platform",
      url: "https://github.com/1997agarwal/Trippy",
      parityScore: 100
    },
    likes: 31,
    likedBy: [],
    comments: [
      { id: "c-2", author: "Rohan Varma", avatar: "🧠", text: "The glassmorphism cards and token typography look stunning Sophia!", time: "18h ago" }
    ],
    shares: 9,
    tags: ["#DesignSystems", "#AIUX", "#Glassmorphism", "#OpenToCoFound"],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const INITIAL_COBUILDERS = [
  {
    id: "cobuilder-harshita",
    name: "Harshita Agarwal",
    avatar: "👩‍💻",
    role: "AI Systems Architect & Full-Stack Engineer",
    category: "technical",
    headline: "Building multi-agent reasoning systems & 4-file parity governance platforms",
    bio: "Founding engineer experienced in React 19, Node.js, FastAPI, and autonomous agent workflows. Architected StartupOS, SpecForge, and ContextPrism.",
    skills: ["React 19", "Node.js", "FastAPI", "Vector DB", "LLM Workflows", "TypeScript"],
    primaryStack: "AntiGravity / Claude Code",
    seekingRole: "Product Co-Founder / B2B GTM Lead",
    seekingDescription: "Looking for an energetic growth and enterprise sales co-founder to scale autonomous developer tooling and enterprise token finops gateways.",
    commitment: "full_time",
    commitmentLabel: "Full-Time (40h/wk)",
    stage: "parity_verified",
    stageLabel: "Parity-Verified MVP",
    projects: [
      { name: "ContextPrism", role: "Architect", url: "https://github.com/1997agarwal/ContextPrism" },
      { name: "SpecForge", role: "Creator", url: "https://github.com/1997agarwal/SpecForge" }
    ],
    equityExpectation: "Equal 50/50 Equity",
    location: "Bengaluru, India / Remote",
    githubUrl: "https://github.com/1997agarwal",
    linkedinUrl: "https://linkedin.com/in/harshit-agarwal",
    twitterUrl: "https://x.com/harshit_builds",
    badge: "1% Elite Maker",
    verifiedParity: true,
    compatibilityScore: 98,
    createdAt: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "cobuilder-arjun",
    name: "Arjun Mehta",
    avatar: "🚀",
    role: "B2B SaaS Growth & Enterprise GTM Lead",
    category: "growth",
    headline: "Ex-FinTech VP Sales | 0 to $2M ARR Specialist seeking Technical Co-Founder",
    bio: "Scaled two B2B SaaS ventures across SEA and US markets. Passionate about automated collections, cash flow accelerators, and agentic workflows for CFOs.",
    skills: ["B2B Enterprise Sales", "GTM Playbooks", "Product-Led Growth", "FinTech Regulation", "Pitch Decks"],
    primaryStack: "HubSpot / Linear / Stripe",
    seekingRole: "Technical AI Co-Founder / Lead Agent Architect",
    seekingDescription: "Need a high-velocity full-stack AI builder to build an autonomous accounts receivable collections platform with voice agents.",
    commitment: "full_time",
    commitmentLabel: "Full-Time (40h/wk)",
    stage: "prototype",
    stageLabel: "Prototype / Customer Validation",
    projects: [
      { name: "BusinessPay", role: "GTM Lead", url: "https://github.com/Business-Tribe/BusinessPay" }
    ],
    equityExpectation: "40-50% Co-Founder Equity",
    location: "Mumbai, India / Remote",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    twitterUrl: "https://x.com",
    badge: "Verified Founder",
    verifiedParity: true,
    compatibilityScore: 96,
    createdAt: "2026-09-02T00:00:00.000Z"
  },
  {
    id: "cobuilder-sophia",
    name: "Sophia Chen",
    avatar: "🎨",
    role: "Senior AI UX Architect & Product Designer",
    category: "design",
    headline: "Design Systems & Glassmorphism Specialist. Crafting high-converting 2026 Web UIs",
    bio: "10+ years designing consumer and developer tooling. Obsessed with micro-interactions, responsive CSS, design tokens, and human-in-the-loop AI interfaces.",
    skills: ["Figma Design Systems", "Tailwind CSS", "Design Tokens", "User Research", "Prototyping"],
    primaryStack: "Figma / React / Framer",
    seekingRole: "AI Engineer / Full-Stack Co-Founder",
    seekingDescription: "Partnering with technical builders creating solo travel AI matching, social commerce, or visual search tools.",
    commitment: "part_time",
    commitmentLabel: "Part-Time (20h/wk)",
    stage: "ideation",
    stageLabel: "Early Ideation & Concept",
    projects: [
      { name: "Trippy", role: "Design Lead", url: "https://github.com/1997agarwal/Trippy" },
      { name: "DupeScout", role: "UX Designer", url: "https://github.com/1997agarwal/DupeScout" }
    ],
    equityExpectation: "20-30% Co-Founder Equity",
    location: "Singapore / Remote",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    twitterUrl: "https://x.com",
    badge: "Design Fellow",
    verifiedParity: true,
    compatibilityScore: 94,
    createdAt: "2026-09-03T00:00:00.000Z"
  },
  {
    id: "cobuilder-rohan",
    name: "Rohan Varma",
    avatar: "🧠",
    role: "Creator Economy & Marketplace Operator",
    category: "domain",
    headline: "Founder with access to 4,000+ Indian creators and agency networks",
    bio: "Spent 6 years managing top tier YouTube and Instagram creators. Deep domain expertise in brand deal negotiations, escrow milestones, and influencer payments.",
    skills: ["Creator Economy", "Brand Partnerships", "Escrow Logistics", "Operations", "Contracts"],
    primaryStack: "Notion / WhatsApp API / Stripe",
    seekingRole: "Full-Stack AI Builder (React TS + Express)",
    seekingDescription: "Looking for a full-stack engineer to build India's premier creator escrow and media kit operating system with instant milestone payouts.",
    commitment: "full_time",
    commitmentLabel: "Full-Time (40h/wk)",
    stage: "scaling",
    stageLabel: "Scaling / Live with Users",
    projects: [
      { name: "CollabKaro", role: "Co-Founder", url: "https://github.com/Collab-Tribe/CollabKaro" }
    ],
    equityExpectation: "Equal 50/50 Equity",
    location: "Delhi NCR / Remote",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    twitterUrl: "https://x.com",
    badge: "Domain Expert",
    verifiedParity: true,
    compatibilityScore: 95,
    createdAt: "2026-09-04T00:00:00.000Z"
  },
  {
    id: "cobuilder-elena",
    name: "Elena Rostova",
    avatar: "⚡",
    role: "LLM Evaluation & NLP Research Engineer",
    category: "technical",
    headline: "Building multi-model LLM benchmark arenas and automated evaluation rubrics",
    bio: "M.S. in Machine Learning. Passionate about automated prompt testing, Elo ranking arenas, and eliminating hallucinations in production agents.",
    skills: ["Python", "PyTorch", "Prompt Engineering", "Elo Systems", "FastAPI", "Docker"],
    primaryStack: "Cursor / Python / LangChain",
    seekingRole: "Product Manager / Frontend Engineer",
    seekingDescription: "Seeking a product-minded engineer or PM to turn our open-source prompt court engine into an enterprise prompt evaluation SaaS.",
    commitment: "part_time",
    commitmentLabel: "Nights & Weekends (15h/wk)",
    stage: "parity_verified",
    stageLabel: "Parity-Verified Open Source",
    projects: [
      { name: "PromptCourt", role: "ML Engineer", url: "https://github.com/1997agarwal/PromptCourt" }
    ],
    equityExpectation: "Equal Co-Founder Split",
    location: "Berlin, Germany / Remote",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    twitterUrl: "https://x.com",
    badge: "Verified AI Engineer",
    verifiedParity: true,
    compatibilityScore: 92,
    createdAt: "2026-09-05T00:00:00.000Z"
  }
];

const INITIAL_PROJECTS = [
  {
    id: "proj-collabkaro",
    name: "CollabKaro",
    tagline: "India-First Creator Marketplace & Escrow Milestone Operating System",
    category: "commercial",
    badge: "Commercial Venture",
    sourceType: "github_connected",
    repoUrl: "https://github.com/Collab-Tribe/CollabKaro",
    demoUrl: "https://collabkaro.in",
    stack: ["React TS", "Express", "Escrow API", "SQLite"],
    surfaces: ["Brand & Agency Portal", "Creator Media Kit Hub", "Escrow Admin Console"],
    readinessScore: 100,
    hasAgents: true,
    hasRoadmap: true,
    hasClaude: true,
    hasContributing: true,
    parityScore: 100,
    isFeatured: true,
    createdAt: "2026-09-01T00:00:00.000Z"
  },
  {
    id: "proj-businesspay",
    name: "BusinessPay",
    tagline: "B2B Accounts Receivable Collections & Early Payment Cash Accelerator",
    category: "commercial",
    badge: "Commercial Venture",
    sourceType: "github_connected",
    repoUrl: "https://github.com/Business-Tribe/BusinessPay",
    demoUrl: "https://businesspay.fintech",
    stack: ["React 19", "Express 5", "Dynamic Discounts", "SQLite"],
    surfaces: ["Collector Workqueue", "Buyer Portal Simulation", "Admin Console"],
    readinessScore: 94,
    hasAgents: true,
    hasRoadmap: true,
    hasClaude: true,
    hasContributing: true,
    parityScore: 100,
    isFeatured: false,
    createdAt: "2026-09-02T00:00:00.000Z"
  },
  {
    id: "proj-dupescout",
    name: "DupeScout",
    tagline: "Shop the Look. Not the Markup. AI Visual Similarity & Dupes Engine",
    category: "commercial",
    badge: "Commercial Venture",
    sourceType: "github_connected",
    repoUrl: "https://github.com/1997agarwal/DupeScout",
    demoUrl: "https://dupescout.shop",
    stack: ["FastAPI", "Next.js 14", "PostgreSQL", "pgvector"],
    surfaces: ["Consumer App", "Seller Portal", "Admin Console", "Chrome Extension"],
    readinessScore: 98,
    hasAgents: true,
    hasRoadmap: true,
    hasClaude: true,
    hasContributing: true,
    parityScore: 100,
    isFeatured: true,
    createdAt: "2026-09-03T00:00:00.000Z"
  },
  {
    id: "proj-trippy",
    name: "Trippy",
    tagline: "AI Solo Travel Group Matching & Community Trip Host Platform",
    category: "commercial",
    badge: "Commercial Venture",
    sourceType: "github_connected",
    repoUrl: "https://github.com/1997agarwal/Trippy",
    demoUrl: "https://trippy-travel.dev",
    stack: ["React 18", "Express", "SQLite", "Node 22"],
    surfaces: ["Consumer Web", "Partner CRM", "Admin Console", "Marketing Website"],
    readinessScore: 95,
    hasAgents: true,
    hasRoadmap: true,
    hasClaude: true,
    hasContributing: true,
    parityScore: 100,
    isFeatured: false,
    createdAt: "2026-09-04T00:00:00.000Z"
  },
  {
    id: "proj-specforge",
    name: "SpecForge",
    tagline: "Autonomous Discovery-to-Spec Engine with 3-Agent Pipeline & Linear Sync",
    category: "open_source",
    badge: "Open Source Engine",
    sourceType: "github_connected",
    repoUrl: "https://github.com/1997agarwal/SpecForge",
    demoUrl: "https://github.com/1997agarwal/SpecForge",
    stack: ["React 18", "TypeScript", "Node.js", "Linear SDK", "SQLite"],
    surfaces: ["Discovery Agent", "Architect Engine", "Linear Sync Studio"],
    readinessScore: 92,
    hasAgents: true,
    hasRoadmap: true,
    hasClaude: true,
    hasContributing: true,
    parityScore: 100,
    isFeatured: false,
    createdAt: "2026-09-05T00:00:00.000Z"
  },
  {
    id: "proj-contextprism",
    name: "ContextPrism",
    tagline: "Enterprise Token FinOps Gateway & AST Context Pruner (3 Golden Rules)",
    category: "open_source",
    badge: "Open Source Gateway",
    sourceType: "github_connected",
    repoUrl: "https://github.com/1997agarwal/ContextPrism",
    demoUrl: "https://github.com/1997agarwal/ContextPrism",
    stack: ["Node.js", "Express", "TypeScript", "Vite", "AST Parser", "SQLite"],
    surfaces: ["Token FinOps Gateway", "AST Context Compressor", "Semantic Cache", "Analytics Studio"],
    readinessScore: 90,
    hasAgents: true,
    hasRoadmap: true,
    hasClaude: true,
    hasContributing: true,
    parityScore: 100,
    isFeatured: false,
    createdAt: "2026-09-06T00:00:00.000Z"
  },
  {
    id: "proj-promptcourt",
    name: "PromptCourt",
    tagline: "Automated Multi-Model LLM Prompt Evaluation, Scoring & Elo Arena",
    category: "open_source",
    badge: "Open Source Arena",
    sourceType: "github_connected",
    repoUrl: "https://github.com/1997agarwal/PromptCourt",
    demoUrl: "https://github.com/1997agarwal/PromptCourt",
    stack: ["React 18", "TypeScript", "Vite", "Tailwind CSS", "Elo Engine"],
    surfaces: ["Prompt Arena", "Elo Leaderboard", "Test Case Matrix", "Export Studio"],
    readinessScore: 88,
    hasAgents: true,
    hasRoadmap: true,
    hasClaude: true,
    hasContributing: true,
    parityScore: 100,
    isFeatured: false,
    createdAt: "2026-09-07T00:00:00.000Z"
  }
];

const INITIAL_USERS = [
  {
    id: "user-harshita",
    name: "Harshita G",
    email: "harshita@vibe-coding.io",
    role: "user",
    persona: "founder",
    workspaceName: "Harshita's Studio",
    avatar: "👩‍💻",
    badge: "Pro Builder",
    token: "token-harshita-12345",
    createdAt: new Date().toISOString()
  },
  {
    id: "user-admin",
    name: "Platform Admin Ops",
    email: "admin@startupos.io",
    role: "admin",
    persona: "admin",
    workspaceName: "StartupOS Ops",
    avatar: "👑",
    badge: "Super Admin",
    token: "token-admin-99999",
    createdAt: new Date().toISOString()
  }
];

const INITIAL_LAUNCHES = [
  {
    id: "launch-dupescout",
    title: "DupeScout",
    tagline: "Shop the Look. Not the Markup. AI Visual Similarity & Dupes Engine.",
    description: "Upload any photo or paste a link — AI finds visually similar fashion products across the internet ranked by similarity score with price-quality explanations.",
    category: "AI Vision",
    status: "approved",
    isFeatured: true,
    upvotes: 342,
    upvotedBy: ["user-harshita"],
    maker: { name: "Harshita G", avatar: "👩‍💻", title: "Founder" },
    demoUrl: "https://dupescout.shop",
    tags: ["CLIP Vision", "FastAPI", "Next.js 14", "pgvector"],
    readinessScore: 100,
    isCertified: true,
    comments: [
      { id: "c1", author: "Aman Gupta", avatar: "👨‍💼", text: "Incredible visual search accuracy! Perfect for Gen Z shoppers.", timestamp: "2 hours ago" },
      { id: "c2", author: "Priya Sharma", avatar: "👩‍🎨", text: "Love the honest similarity percentage scores.", timestamp: "5 hours ago" }
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "launch-trippy",
    title: "Trippy",
    tagline: "AI Solo-Travel Group Matching & Community Trip Host Platform.",
    description: "Connect with compatible solo travelers on overlapping dates, build group itineraries, and book hosted trips directly from travel communities.",
    category: "Solo Travel AI",
    status: "approved",
    isFeatured: false,
    upvotes: 289,
    upvotedBy: [],
    maker: { name: "Harshita G", avatar: "👩‍💻", title: "Founder" },
    demoUrl: "https://trippy-travel.dev",
    tags: ["React 18", "Express", "SQLite", "Node 22"],
    readinessScore: 100,
    isCertified: true,
    comments: [
      { id: "c3", author: "Rohan V", avatar: "🎒", text: "Finally an app that makes solo travel group matching safe and easy!", timestamp: "1 day ago" }
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "launch-businesspay",
    title: "BusinessPay",
    tagline: "B2B Accounts Receivable Collections & Early Payment Cash Accelerator.",
    description: "Reduce DSO and accelerate cash flow with dynamic discounting, collector workqueues, buyer portal simulation, and dispute SLA tracking.",
    category: "B2B Fintech",
    status: "approved",
    isFeatured: false,
    upvotes: 215,
    upvotedBy: [],
    maker: { name: "Harshita G", avatar: "👩‍💻", title: "Founder" },
    demoUrl: "https://businesspay.fintech",
    tags: ["React 19", "Express 5", "Dynamic Discounts", "SQLite"],
    readinessScore: 100,
    isCertified: true,
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: "launch-collabkaro",
    title: "CollabKaro",
    tagline: "India-First Creator Marketplace & Escrow Milestone Operating System.",
    description: "Connect brands with influencers and UGC creators using secure milestone escrow funding, campaign briefs, and proof-of-delivery payouts.",
    category: "Creator Marketplace",
    status: "approved",
    isFeatured: false,
    upvotes: 198,
    upvotedBy: [],
    maker: { name: "Harshita G", avatar: "👩‍💻", title: "Founder" },
    demoUrl: "https://collabkaro.in",
    tags: ["React TS", "Escrow API", "UGC Media Kit", "SQLite"],
    readinessScore: 100,
    isCertified: true,
    comments: [],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

const INITIAL_AUDITS = [
  {
    id: "audit-dupescout",
    projectName: "DupeScout",
    builderName: "Harshita G",
    persona: "founder",
    githubUrl: "https://github.com/1997agarwal/DupeScout",
    hasAgents: true,
    hasRoadmap: true,
    hasClaude: true,
    hasContributing: true,
    score: 98,
    status: "verified",
    examinerFeedback: "100% 4-File Parity score achieved. Clean modular FastAPI/Next.js visual similarity architecture.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "audit-trippy",
    projectName: "Trippy",
    builderName: "Harshita G",
    persona: "founder",
    githubUrl: "https://github.com/1997agarwal/Trippy",
    hasAgents: true,
    hasRoadmap: true,
    hasClaude: true,
    hasContributing: true,
    score: 95,
    status: "verified",
    examinerFeedback: "Full 4-File Parity compliance. Great solo-travel group matching schema.",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "audit-businesspay",
    projectName: "BusinessPay",
    builderName: "Harshita G",
    persona: "founder",
    githubUrl: "https://github.com/Business-Tribe/BusinessPay",
    hasAgents: true,
    hasRoadmap: true,
    hasClaude: true,
    hasContributing: true,
    score: 94,
    status: "pending",
    examinerFeedback: "Audit requested by founder. Pending final code quality & dynamic discounting SLA verification.",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

const backupFile = join(dataDirectory, "backup_sync.json");

async function writeAutoBackup() {
  try {
    const ideas = await readIdeas().catch(() => []);
    const launches = await readLaunches().catch(() => []);
    const users = await readUsers().catch(() => []);
    const audits = await readAudits().catch(() => []);
    const projects = await readProjects().catch(() => []);
    const backupData = {
      lastSyncedAt: new Date().toISOString(),
      counts: { ideas: ideas.length, launches: launches.length, users: users.length, audits: audits.length, projects: projects.length },
      ideas, launches, users, audits, projects
    };
    await writeFile(backupFile, `${JSON.stringify(backupData, null, 2)}\n`, "utf8");
  } catch (err) {
    console.error("Auto backup update failed:", err);
  }
}

async function initializeDatabase() {
  await mkdir(dataDirectory, { recursive: true });
  try { await readFile(databaseFile, "utf8"); } catch { await writeFile(databaseFile, "[]\n", "utf8"); }
  try { await readFile(launchesFile, "utf8"); } catch { await writeFile(launchesFile, `${JSON.stringify(INITIAL_LAUNCHES, null, 2)}\n`, "utf8"); }
  try { await readFile(usersFile, "utf8"); } catch { await writeFile(usersFile, `${JSON.stringify(INITIAL_USERS, null, 2)}\n`, "utf8"); }
  try { await readFile(auditsFile, "utf8"); } catch { await writeFile(auditsFile, `${JSON.stringify(INITIAL_AUDITS, null, 2)}\n`, "utf8"); }
  try { await readFile(projectsFile, "utf8"); } catch { await writeFile(projectsFile, `${JSON.stringify(INITIAL_PROJECTS, null, 2)}\n`, "utf8"); }
  try { await readFile(cobuildersFile, "utf8"); } catch { await writeFile(cobuildersFile, `${JSON.stringify(INITIAL_COBUILDERS, null, 2)}\n`, "utf8"); }
  try { await readFile(connectionsFile, "utf8"); } catch { await writeFile(connectionsFile, "[]\n", "utf8"); }
  try { await readFile(feedFile, "utf8"); } catch { await writeFile(feedFile, `${JSON.stringify(INITIAL_FEED_POSTS, null, 2)}\n`, "utf8"); }
  await writeAutoBackup();
}

async function readIdeas() { return JSON.parse(await readFile(databaseFile, "utf8")); }
async function writeIdeas(ideas) { 
  await writeFile(databaseFile, `${JSON.stringify(ideas, null, 2)}\n`, "utf8");
  await writeAutoBackup();
}

async function readLaunches() { return JSON.parse(await readFile(launchesFile, "utf8")); }
async function writeLaunches(launches) { 
  await writeFile(launchesFile, `${JSON.stringify(launches, null, 2)}\n`, "utf8");
  await writeAutoBackup();
}

async function readUsers() { return JSON.parse(await readFile(usersFile, "utf8")); }
async function writeUsers(users) { 
  await writeFile(usersFile, `${JSON.stringify(users, null, 2)}\n`, "utf8");
  await writeAutoBackup();
}

async function readAudits() { return JSON.parse(await readFile(auditsFile, "utf8")); }
async function writeAudits(audits) { 
  await writeFile(auditsFile, `${JSON.stringify(audits, null, 2)}\n`, "utf8");
  await writeAutoBackup();
}

async function readProjects() { return JSON.parse(await readFile(projectsFile, "utf8")); }
async function writeProjects(projects) { 
  await writeFile(projectsFile, `${JSON.stringify(projects, null, 2)}\n`, "utf8");
  await writeAutoBackup();
}

async function readCobuilders() { return JSON.parse(await readFile(cobuildersFile, "utf8")); }
async function writeCobuilders(cobuilders) { 
  await writeFile(cobuildersFile, `${JSON.stringify(cobuilders, null, 2)}\n`, "utf8");
  await writeAutoBackup();
}

async function readFeed() { return JSON.parse(await readFile(feedFile, "utf8")); }
async function writeFeed(feed) { 
  await writeFile(feedFile, `${JSON.stringify(feed, null, 2)}\n`, "utf8");
  await writeAutoBackup();
}

async function readConnections() { return JSON.parse(await readFile(connectionsFile, "utf8")); }
async function writeConnections(connections) { 
  await writeFile(connectionsFile, `${JSON.stringify(connections, null, 2)}\n`, "utf8");
  await writeAutoBackup();
}

const clean = (value, limit = 1200) => String(value || "").trim().slice(0, limit);

async function checkProjectHealth(proj) {
  const projName = typeof proj === "string" ? proj : proj.name;
  const category = typeof proj === "object" ? (proj.category || "commercial") : "commercial";
  let projPath = typeof proj === "object" && proj.path ? proj.path : join(root, "Ideas", projName);
  try {
    await stat(projPath);
  } catch {
    const candidatePaths = [
      join(root, "..", "Open Source", projName),
      join(root, "..", projName),
      join(root, "..", "Projects", "Open Source", projName),
      join(root, "..", "Projects", projName),
      join(root, "Ideas", projName)
    ];
    for (const cp of candidatePaths) {
      try {
        await stat(cp);
        projPath = cp;
        break;
      } catch {}
    }
  }
  try {
    await stat(projPath);
    const files = ["AGENTS.md", "ROADMAP.md", "CLAUDE.md", "CONTRIBUTING.md"];
    const checkFile = async (f) => {
      try { await stat(join(projPath, f)); return true; } catch { return false; }
    };
    const results = await Promise.all(files.map(checkFile));
    const presentCount = results.filter(Boolean).length;
    const score = Math.round((presentCount / 4) * 100);
    return {
      name: projName,
      category,
      path: projPath,
      healthScore: score,
      hasAgents: results[0],
      hasRoadmap: results[1],
      hasClaude: results[2],
      hasContributing: results[3]
    };
  } catch {
    return { name: projName, category, path: projPath, healthScore: 0, error: "Directory not found" };
  }
}

async function body(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 50_000) throw new Error("Request is too large.");
  }
  return JSON.parse(raw || "{}");
}

await initializeDatabase();

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === "GET" && url.pathname === "/api/health") return json(res, 200, { status: "ok" });

    // AUTH APIs
    if (req.method === "POST" && url.pathname === "/api/auth/login") {
      const { email, role = "user" } = await body(req);
      const users = await readUsers();
      let user = users.find(u => u.email.toLowerCase() === (email || "").toLowerCase());
      if (!user && role) {
        user = users.find(u => u.role === role);
      }
      if (!user) {
        user = {
          id: "user-" + randomUUID().slice(0, 8),
          name: email ? email.split("@")[0] : "Builder User",
          email: email || "builder@startupos.io",
          role: role,
          persona: "founder",
          workspaceName: "My AI Workspace",
          avatar: role === 'admin' ? "👑" : "👩‍💻",
          badge: role === 'admin' ? "Super Admin" : "Pro Builder",
          token: "token-" + randomUUID().slice(0, 10),
          createdAt: new Date().toISOString()
        };
        users.push(user);
        await writeUsers(users);
      }
      return json(res, 200, user);
    }

    if (req.method === "POST" && url.pathname === "/api/auth/register") {
      const { name, email, persona = "founder", workspaceName = "My Studio" } = await body(req);
      if (!name || !email) return json(res, 400, { error: "Name and email are required." });
      
      const users = await readUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (existing) return json(res, 400, { error: "An account with this email already exists." });

      const personaAvatars = { student: "🎓", founder: "🚀", developer: "💻", admin: "👑" };
      const personaBadges = { student: "Student Builder", founder: "Startup Founder", developer: "Full-Stack Dev", admin: "Super Admin" };

      const newUser = {
        id: "user-" + randomUUID().slice(0, 8),
        name: clean(name),
        email: clean(email).toLowerCase(),
        role: persona === "admin" ? "admin" : "user",
        persona: persona,
        workspaceName: clean(workspaceName),
        avatar: personaAvatars[persona] || "👩‍💻",
        badge: personaBadges[persona] || "Pro Builder",
        token: "token-" + randomUUID().slice(0, 10),
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      await writeUsers(users);
      return json(res, 201, newUser);
    }

    if (req.method === "GET" && url.pathname === "/api/auth/users") {
      const users = await readUsers();
      return json(res, 200, users);
    }
    
    // IDEAS API
    if (req.method === "GET" && url.pathname === "/api/ideas") {
      const ideas = await readIdeas();
      return json(res, 200, ideas);
    }
    if (req.method === "POST" && url.pathname === "/api/ideas") {
      const input = await body(req);
      const now = new Date().toISOString();
      const record = { id: randomUUID(), ...input, createdAt: now, updatedAt: now };
      const ideas = await readIdeas();
      ideas.unshift(record);
      await writeIdeas(ideas);
      return json(res, 201, record);
    }

    // LAUNCHES API (Product Hunt Feed)
    if (req.method === "GET" && url.pathname === "/api/launches") {
      const launches = await readLaunches();
      launches.sort((a, b) => b.upvotes - a.upvotes);
      return json(res, 200, launches);
    }

    if (req.method === "POST" && url.pathname === "/api/launches") {
      const input = await body(req);
      if (!input.title || !input.tagline) return json(res, 400, { error: "Title and tagline are required." });
      const launches = await readLaunches();
      const newLaunch = {
        id: "launch-" + randomUUID().slice(0, 8),
        title: clean(input.title),
        tagline: clean(input.tagline),
        description: clean(input.description || input.tagline),
        category: input.category || "AI Startup",
        status: "approved",
        isFeatured: false,
        upvotes: 1,
        upvotedBy: [input.userId || "user-harshita"],
        maker: input.maker || { name: "Harshita G", avatar: "👩‍💻", title: "Maker" },
        demoUrl: input.demoUrl || "",
        tags: input.tags || ["AI", "StartupOS"],
        readinessScore: Number(input.readinessScore) || 100,
        isCertified: input.isCertified !== undefined ? Boolean(input.isCertified) : (Number(input.readinessScore) === 100),
        comments: [],
        createdAt: new Date().toISOString()
      };
      launches.unshift(newLaunch);
      await writeLaunches(launches);
      return json(res, 201, newLaunch);
    }

    const upvoteMatch = url.pathname.match(/^\/api\/launches\/([a-z0-9-]+)\/upvote$/i);
    if (req.method === "POST" && upvoteMatch) {
      const launchId = upvoteMatch[1];
      const { userId = "user-harshita" } = await body(req);
      const launches = await readLaunches();
      const launch = launches.find(l => l.id === launchId);
      if (!launch) return json(res, 404, { error: "Launch not found." });
      
      const idx = launch.upvotedBy.indexOf(userId);
      if (idx >= 0) {
        launch.upvotedBy.splice(idx, 1);
        launch.upvotes = Math.max(0, launch.upvotes - 1);
      } else {
        launch.upvotedBy.push(userId);
        launch.upvotes += 1;
      }
      await writeLaunches(launches);
      return json(res, 200, launch);
    }

    const commentMatch = url.pathname.match(/^\/api\/launches\/([a-z0-9-]+)\/comment$/i);
    if (req.method === "POST" && commentMatch) {
      const launchId = commentMatch[1];
      const { text, author = "Harshita G", avatar = "👩‍💻" } = await body(req);
      if (!text) return json(res, 400, { error: "Comment text required." });
      const launches = await readLaunches();
      const launch = launches.find(l => l.id === launchId);
      if (!launch) return json(res, 404, { error: "Launch not found." });

      const newComment = { id: "c-" + Date.now(), author, avatar, text: clean(text), timestamp: "Just now" };
      launch.comments.push(newComment);
      await writeLaunches(launches);
      return json(res, 201, launch);
    }

    // ADMIN CONSOLE APIs
    const adminActionMatch = url.pathname.match(/^\/api\/admin\/launches\/([a-z0-9-]+)\/(feature|delete|approve)$/i);
    if (req.method === "POST" && adminActionMatch) {
      const launchId = adminActionMatch[1];
      const action = adminActionMatch[2];
      let launches = await readLaunches();
      
      if (action === "delete") {
        launches = launches.filter(l => l.id !== launchId);
      } else if (action === "feature") {
        launches.forEach(l => l.isFeatured = (l.id === launchId ? !l.isFeatured : false));
      } else if (action === "approve") {
        const l = launches.find(item => item.id === launchId);
        if (l) l.status = "approved";
      }
      await writeLaunches(launches);
      return json(res, 200, { success: true, launches });
    }

    const roleMatch = url.pathname.match(/^\/api\/admin\/users\/([a-z0-9-]+)\/role$/i);
    if (req.method === "POST" && roleMatch) {
      const targetUserId = roleMatch[1];
      const { role, badge } = await body(req);
      const users = await readUsers();
      const targetUser = users.find(u => u.id === targetUserId);
      if (!targetUser) return json(res, 404, { error: "User not found." });

      targetUser.role = role || targetUser.role;
      targetUser.badge = badge || (role === 'admin' ? 'Super Admin' : 'Pro Builder');
      await writeUsers(users);
      return json(res, 200, { success: true, user: targetUser });
    }

    // ADMIN AUDITS API
    if (req.method === "GET" && url.pathname === "/api/admin/audits") {
      const audits = await readAudits();
      return json(res, 200, audits);
    }

    const auditReviewMatch = url.pathname.match(/^\/api\/admin\/audits\/([a-z0-9-]+)\/review$/i);
    if (req.method === "POST" && auditReviewMatch) {
      const auditId = auditReviewMatch[1];
      const { score, status = "verified", examinerFeedback } = await body(req);
      const audits = await readAudits();
      const audit = audits.find(a => a.id === auditId);
      if (!audit) return json(res, 404, { error: "Audit record not found." });

      audit.score = Number(score || audit.score);
      audit.status = status;
      audit.examinerFeedback = clean(examinerFeedback || audit.examinerFeedback);
      await writeAudits(audits);
      return json(res, 200, { success: true, audit });
    }

    // REGISTERED PROJECTS REST API
    if (req.method === "GET" && url.pathname === "/api/projects") {
      const projects = await readProjects();
      return json(res, 200, projects);
    }

    if (req.method === "POST" && url.pathname === "/api/projects") {
      const payload = await body(req);
      const name = clean(payload.name, 100);
      if (!name) return json(res, 400, { error: "Project name is required." });

      const projects = await readProjects();
      const newProject = {
        id: `proj-${Date.now()}`,
        name,
        tagline: clean(payload.tagline || `${name} application`, 200),
        category: payload.category || "commercial",
        badge: payload.category === "open_source" ? "Open Source Engine" : "Commercial Venture",
        sourceType: payload.sourceType || "manual_import",
        repoUrl: clean(payload.repoUrl || "", 300),
        demoUrl: clean(payload.demoUrl || "", 300),
        stack: Array.isArray(payload.stack) ? payload.stack : (payload.stack ? String(payload.stack).split(",").map(s => s.trim()).filter(Boolean) : ["React", "Node.js"]),
        surfaces: Array.isArray(payload.surfaces) ? payload.surfaces : ["Web Application", "Admin Console"],
        readinessScore: Number(payload.readinessScore) || 75,
        hasAgents: Boolean(payload.hasAgents ?? false),
        hasRoadmap: Boolean(payload.hasRoadmap ?? false),
        hasClaude: Boolean(payload.hasClaude ?? false),
        hasContributing: Boolean(payload.hasContributing ?? false),
        parityScore: 0,
        isFeatured: false,
        createdAt: new Date().toISOString()
      };

      const checks = [newProject.hasAgents, newProject.hasRoadmap, newProject.hasClaude, newProject.hasContributing];
      newProject.parityScore = Math.round((checks.filter(Boolean).length / 4) * 100);

      projects.unshift(newProject);
      await writeProjects(projects);
      return json(res, 201, newProject);
    }

    // PROJECTS HEALTH API (Audits registered projects from self-contained registry)
    if (req.method === "GET" && url.pathname === "/api/projects/health") {
      const registered = await readProjects();
      const auditedProjects = registered.map((proj) => {
        const checks = [proj.hasAgents, proj.hasRoadmap, proj.hasClaude, proj.hasContributing];
        const compliantCount = checks.filter(Boolean).length;
        const score = Math.round((compliantCount / 4) * 100);
        return {
          ...proj,
          path: proj.repoUrl || "Decoupled Repository",
          healthScore: score || proj.parityScore || 100
        };
      });

      return json(res, 200, auditedProjects);
    }

        // CO-BUILDER FEED REST APIS
    if (req.method === "GET" && url.pathname === "/api/cobuilders/feed") {
      const feed = await readFeed();
      return json(res, 200, feed);
    }

    if (req.method === "POST" && url.pathname === "/api/cobuilders/feed") {
      const payload = await body(req);
      const content = clean(payload.content, 2000);
      if (!content) return json(res, 400, { error: "Post content is required." });

      const feed = await readFeed();
      const newPost = {
        id: `post-${Date.now()}`,
        authorId: clean(payload.authorId || "user-harshita", 100),
        authorName: clean(payload.authorName || "Harshita Agarwal", 100),
        authorAvatar: payload.authorAvatar || "👩‍💻",
        authorRole: clean(payload.authorRole || "AI Systems Architect", 120),
        authorBadge: clean(payload.authorBadge || "Pro Builder", 50),
        timeAgo: "Just now",
        content,
        projectMention: payload.projectMention || null,
        likes: 1,
        likedBy: [payload.authorId || "user-harshita"],
        comments: [],
        shares: 0,
        tags: Array.isArray(payload.tags) ? payload.tags : ["#OpenToCoFound", "#AIBuilder"],
        createdAt: new Date().toISOString()
      };

      feed.unshift(newPost);
      await writeFeed(feed);
      return json(res, 201, newPost);
    }

    const feedLikeMatch = url.pathname.match(/^\/api\/cobuilders\/feed\/([a-z0-9-]+)\/like$/i);
    if (req.method === "POST" && feedLikeMatch) {
      const postId = feedLikeMatch[1];
      const { userId = "user-harshita" } = await body(req);
      const feed = await readFeed();
      const post = feed.find(p => p.id === postId);
      if (!post) return json(res, 404, { error: "Post not found." });

      post.likedBy = post.likedBy || [];
      const idx = post.likedBy.indexOf(userId);
      if (idx >= 0) {
        post.likedBy.splice(idx, 1);
        post.likes = Math.max(0, (post.likes || 1) - 1);
      } else {
        post.likedBy.push(userId);
        post.likes = (post.likes || 0) + 1;
      }
      await writeFeed(feed);
      return json(res, 200, post);
    }

    const feedCommentMatch = url.pathname.match(/^\/api\/cobuilders\/feed\/([a-z0-9-]+)\/comment$/i);
    if (req.method === "POST" && feedCommentMatch) {
      const postId = feedCommentMatch[1];
      const { text, author = "Harshita Agarwal", avatar = "👩‍💻" } = await body(req);
      if (!text) return json(res, 400, { error: "Comment text required." });

      const feed = await readFeed();
      const post = feed.find(p => p.id === postId);
      if (!post) return json(res, 404, { error: "Post not found." });

      post.comments = post.comments || [];
      const comment = {
        id: `c-${Date.now()}`,
        author: clean(author, 100),
        avatar,
        text: clean(text, 500),
        time: "Just now"
      };
      post.comments.push(comment);
      await writeFeed(feed);
      return json(res, 201, comment);
    }

    // CO-BUILDER MATCH DIRECTORY REST APIS
    if (req.method === "GET" && url.pathname === "/api/cobuilders") {
      const cobuilders = await readCobuilders();
      const roleFilter = url.searchParams.get("role");
      const searchQuery = (url.searchParams.get("q") || "").toLowerCase().trim();

      let filtered = cobuilders;
      if (roleFilter && roleFilter !== "all") {
        filtered = filtered.filter(c => c.category === roleFilter);
      }
      if (searchQuery) {
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(searchQuery) ||
          c.role.toLowerCase().includes(searchQuery) ||
          c.headline.toLowerCase().includes(searchQuery) ||
          (c.skills && c.skills.some(s => s.toLowerCase().includes(searchQuery)))
        );
      }
      return json(res, 200, filtered);
    }

    if (req.method === "POST" && url.pathname === "/api/cobuilders") {
      const payload = await body(req);
      const name = clean(payload.name, 100);
      if (!name) return json(res, 400, { error: "Name is required." });

      const cobuilders = await readCobuilders();
      const existingIdx = cobuilders.findIndex(c => c.id === payload.id || (payload.email && c.email === payload.email));

      const entry = {
        id: payload.id || `cobuilder-${Date.now()}`,
        name,
        avatar: payload.avatar || "👩‍💻",
        role: clean(payload.role || "AI Product Builder", 120),
        category: payload.category || "technical",
        headline: clean(payload.headline || "Building next-generation AI products", 250),
        bio: clean(payload.bio || "", 1000),
        skills: Array.isArray(payload.skills) ? payload.skills : (payload.skills ? String(payload.skills).split(",").map(s => s.trim()).filter(Boolean) : ["React", "FastAPI"]),
        primaryStack: clean(payload.primaryStack || "AntiGravity / Claude Code", 100),
        seekingRole: clean(payload.seekingRole || "Co-Founder", 150),
        seekingDescription: clean(payload.seekingDescription || "", 500),
        commitment: payload.commitment || "full_time",
        commitmentLabel: payload.commitment === "part_time" ? "Part-Time (20h/wk)" : (payload.commitment === "hackathons" ? "Nights & Weekends" : "Full-Time (40h/wk)"),
        stage: payload.stage || "parity_verified",
        stageLabel: payload.stage === "ideation" ? "Early Ideation" : (payload.stage === "prototype" ? "Prototype" : "Parity-Verified MVP"),
        projects: Array.isArray(payload.projects) ? payload.projects : [],
        equityExpectation: clean(payload.equityExpectation || "Equal Split / Negotiable", 100),
        location: clean(payload.location || "Remote", 100),
        githubUrl: clean(payload.githubUrl || "", 200),
        linkedinUrl: clean(payload.linkedinUrl || "", 200),
        twitterUrl: clean(payload.twitterUrl || "", 200),
        badge: payload.badge || "Verified Builder",
        verifiedParity: Boolean(payload.verifiedParity ?? true),
        compatibilityScore: Number(payload.compatibilityScore) || 95,
        updatedAt: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        cobuilders[existingIdx] = { ...cobuilders[existingIdx], ...entry };
      } else {
        entry.createdAt = new Date().toISOString();
        cobuilders.unshift(entry);
      }

      await writeCobuilders(cobuilders);
      return json(res, 201, entry);
    }

    if (req.method === "POST" && url.pathname === "/api/cobuilders/connect") {
      const payload = await body(req);
      const recipientId = clean(payload.recipientId, 100);
      const senderName = clean(payload.senderName, 100);
      if (!recipientId || !senderName) {
        return json(res, 400, { error: "Recipient ID and sender name are required." });
      }

      const connections = await readConnections();
      const proposal = {
        id: `conn-${Date.now()}`,
        recipientId,
        recipientName: clean(payload.recipientName, 100),
        senderId: clean(payload.senderId || "user-guest", 100),
        senderName,
        senderEmail: clean(payload.senderEmail || "", 150),
        projectName: clean(payload.projectName || "New AI Venture", 120),
        roleOffered: clean(payload.roleOffered || "Technical Co-Founder", 100),
        equityOffered: clean(payload.equityOffered || "Equal 50/50 Equity", 80),
        pitchMessage: clean(payload.pitchMessage || "", 1000),
        projectUrl: clean(payload.projectUrl || "", 200),
        status: "pending",
        createdAt: new Date().toISOString()
      };

      connections.unshift(proposal);
      await writeConnections(connections);
      return json(res, 201, { success: true, proposal });
    }

    if (req.method === "GET" && url.pathname === "/api/cobuilders/connections") {
      const connections = await readConnections();
      return json(res, 200, connections);
    }

    // STATIC FILE SERVING
    if (req.method === "GET" || req.method === "HEAD") {
      const distDir = join(root, "dist");
      let file = url.pathname === "/" ? join(distDir, "index.html") : normalize(join(distDir, url.pathname));
      if (!file.startsWith(distDir)) file = join(distDir, "index.html");
      try {
        const content = await readFile(file);
        res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" });
        return res.end(content);
      } catch {
        const fallback = await readFile(join(root, "index.html"));
        res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        return res.end(fallback);
      }
    }

    return json(res, 404, { error: "Not found." });
  } catch (error) {
    console.error(error);
    return json(res, 404, { error: error.message || "Unexpected server error." });
  }
}

function startServer(p) {
  const server = createServer(handleRequest);
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${p} in use, trying ${p + 1}...`);
      startServer(p + 1);
    } else {
      console.error(err);
    }
  });
  server.listen(p, "0.0.0.0", () => {
    console.log(`StartupOS Hub running on http://localhost:${p}`);
  });
}

startServer(port);
