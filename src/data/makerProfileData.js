// src/data/makerProfileData.js
// Maker Profiles, Builder Rank Matrix & ATS/GitHub Portfolio Generators

export const BUILDER_RANKS = [
  {
    level: 1,
    name: 'Novice Builder',
    minXp: 0,
    maxXp: 1500,
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    description: 'First steps in AI prompt generation and PRD prototyping.'
  },
  {
    level: 2,
    name: 'Vibe Coder',
    minXp: 1501,
    maxXp: 4000,
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    description: 'Ships functional full-stack MVPs using Replit, Cursor, and Gemini APIs.'
  },
  {
    level: 3,
    name: 'AI Systems Architect',
    minXp: 4001,
    maxXp: 8000,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Builds multi-surface apps with pgvector, SQLite, and 4-File Parity.'
  },
  {
    level: 4,
    name: 'Founding Product Lead',
    minXp: 8001,
    maxXp: 15000,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    description: 'Executes master PRDs, unit economics, GTM distribution, and AI evaluations.'
  },
  {
    level: 5,
    name: 'Elite Fellow • 1% Maker',
    minXp: 15001,
    maxXp: 999999,
    badgeColor: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-400 shadow-sm',
    description: 'Top-tier 0-to-1 builder shipping multiple production-grade platforms.'
  }
];

export const VERIFIED_BADGES = [
  {
    id: 'parity-master',
    title: '4-File Parity Master',
    desc: 'Maintains AGENTS.md, ROADMAP.md, CLAUDE.md, CONTRIBUTING.md across all repositories.',
    icon: 'ShieldCheck',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    verifiedDate: '2026-08-15',
    hash: '0xPARITY-994A'
  },
  {
    id: 'multi-surface',
    title: 'Multi-Surface Systems Architect',
    desc: 'Shipped platforms spanning Consumer Web, Partner CRMs, Mobile & Chrome Extensions.',
    icon: 'Layers',
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    verifiedDate: '2026-08-20',
    hash: '0xSURFACE-812C'
  },
  {
    id: 'prd-master',
    title: 'Master PRD & Spec Strategist',
    desc: 'Authored complete 10-part product specs with edge-case handling and non-goals.',
    icon: 'FileCode',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    verifiedDate: '2026-08-28',
    hash: '0xPRD-770E'
  },
  {
    id: 'launchpad-winner',
    title: '#1 Product of the Day',
    desc: 'Achieved #1 upvoted product on the StartupOS community launchpad.',
    icon: 'Trophy',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    verifiedDate: '2026-09-02',
    hash: '0xLAUNCH-101F'
  }
];

export const HARSHIT_FLAGSHIP_PROJECTS = [
  {
    id: 'startup-os',
    name: 'StartupOS',
    tagline: '360° AI Product Incubator & Operating System',
    problem: 'Democratizes product building for founders & students. Features a Product Hunt-style feed, Tool Matrix, AI Prompt Vault, and LMS.',
    stack: ['React 18', 'Vite', 'Node.js', 'AntiGravity Agentic Orchestration', '4-File Parity'],
    impact: 'Unified incubator powering 5 flagship platforms with 100% parity governance.',
    repoUrl: 'https://github.com/1997agarwal/StartupOS',
    demoUrl: 'http://localhost:3000',
    badge: 'Incubator OS',
    source: 'native'
  },
  {
    id: 'trippy',
    name: 'Trippy',
    tagline: 'AI Solo Travel & Community Ecosystem',
    problem: '"Travel solo, never alone." Solves solo traveler safety, group matching, and community host monetization across 4 dedicated surfaces.',
    stack: ['React 18', 'Node Express', 'SQLite', 'Matching Engine'],
    impact: 'Multi-surface ecosystem spanning Consumer Web, Partner CRM, and Admin Console.',
    repoUrl: 'https://github.com/1997agarwal/StartupOS/tree/main/Ideas/Trippy',
    demoUrl: 'https://trippy-travel.dev',
    badge: 'Solo Travel AI',
    source: 'native'
  },
  {
    id: 'dupe-scout',
    name: 'DupeScout',
    tagline: 'AI Shopping OS for Gen Z',
    problem: '"Shop the Look. Not the Markup." Multimodal visual search discovering affordable fashion alternatives with transparent quality scores.',
    stack: ['FastAPI', 'Next.js 14', 'PostgreSQL', 'pgvector', 'Chrome Extension'],
    impact: 'Multimodal Vision RAG search engine with sub-second vector cosine similarity.',
    repoUrl: 'https://github.com/1997agarwal/StartupOS/tree/main/Ideas/DupeScout',
    demoUrl: 'https://dupescout.shop',
    badge: 'AI Vision',
    source: 'native'
  },
  {
    id: 'business-pay',
    name: 'BusinessPay',
    tagline: 'B2B Accounts Receivable Collections Accelerator',
    problem: 'Compresses Days Sales Outstanding (DSO) and accelerates cash flow via dynamic delinquency discounting and Promise to Pay (PTP) workflows.',
    stack: ['React 19', 'Express 5', 'Dynamic Discounts', 'SQLite'],
    impact: 'Automated dispute resolution SLAs and collections workqueue simulation.',
    repoUrl: 'https://github.com/1997agarwal/StartupOS/tree/main/Ideas/BusinessPay',
    demoUrl: 'https://businesspay.fintech',
    badge: 'B2B Fintech',
    source: 'native'
  },
  {
    id: 'collab-karo',
    name: 'CollabKaro',
    tagline: 'Creator Economy & Influencer Marketplace',
    problem: 'India-first two-sided marketplace streamlining deal discovery, brief delivery, creator verification, and escrow payouts.',
    stack: ['React TS', 'React Native (Expo)', 'Node 22 API', 'Escrow System'],
    impact: 'Two-sided ecosystem powering brand briefs, creator media kits, and milestone escrow.',
    repoUrl: 'https://github.com/1997agarwal/StartupOS/tree/main/Ideas/CollabKaro',
    demoUrl: 'https://collabkaro.in',
    badge: 'Creator Marketplace',
    category: 'commercial',
    source: 'native'
  },
  {
    id: 'spec-forge',
    name: 'SpecForge',
    tagline: 'Autonomous Discovery-to-Spec Engine with 3-Agent Pipeline & Linear Sync',
    problem: 'Converts unstructured discovery calls and voice transcripts into production PRDs, technical architectural RFCs, and bidirectional Linear tickets.',
    stack: ['React 18', 'TypeScript', 'Node.js', 'Linear SDK', 'SQLite', 'Agentic Pipeline'],
    impact: '3-stage agent pipeline automating 8+ hours of technical PM discovery-to-spec drafting per sprint.',
    repoUrl: 'https://github.com/1997agarwal/SpecForge',
    demoUrl: 'https://github.com/1997agarwal/SpecForge',
    badge: 'Open Source Engine',
    category: 'open_source',
    source: 'native'
  },
  {
    id: 'context-prism',
    name: 'ContextPrism',
    tagline: 'Enterprise Token FinOps Gateway & AST Context Pruner (3 Golden Rules)',
    problem: 'Cuts LLM API token costs by up to 90% via task-aware dynamic routing, zero-cost semantic embedding cache, and AST context pruning.',
    stack: ['Node.js', 'Express', 'TypeScript', 'Vite', 'AST Parser', 'SQLite'],
    impact: 'Drop-in OpenAI/Anthropic FinOps reverse proxy with budget circuit breaker and real-time savings studio.',
    repoUrl: 'https://github.com/1997agarwal/ContextPrism',
    demoUrl: 'https://github.com/1997agarwal/ContextPrism',
    badge: 'Open Source Gateway',
    category: 'open_source',
    source: 'native'
  }
];

export const PRIMARY_MAKER_PROFILE = {
  id: 'user-harshit',
  username: '1997agarwal',
  name: 'Harshit Agarwal',
  title: 'AI Product Manager & 0-to-1 Systems Builder',
  avatar: '👨‍💻',
  bio: 'Building and shipping production-grade AI platforms, multi-agent workflows, and venture products from scratch. Combining rigorous product strategy (master PRDs, GTM, unit economics) with high-velocity full-stack AI engineering.',
  location: 'Bangalore, India • Global Remote',
  email: 'agarwal.harshit97@gmail.com',
  github: 'https://github.com/1997agarwal',
  linkedin: 'https://www.linkedin.com/in/1997agarwal',
  x: 'https://x.com/1997agarwal',
  xp: 18450,
  rankLevel: 5,
  streakDays: 42,
  shippedCount: 5,
  communityUpvotes: 840,
  parityScore: '100%',
  flagshipProducts: HARSHIT_FLAGSHIP_PROJECTS
};

// DYNAMIC MAKER BUILDER: Synthesizes a real, reactive profile for any logged in user
export function buildDynamicMakerProfile(currentUser, userIdeas = [], externalProjects = []) {
  if (!currentUser) return PRIMARY_MAKER_PROFILE;

  const isHarshit = (currentUser.name && currentUser.name.toLowerCase().includes('harshit')) ||
                    (currentUser.email && currentUser.email.toLowerCase().includes('harshit')) ||
                    (currentUser.id === 'user-harshita');

  // Convert user-created ideas into shipped/incubating projects
  const ideaProjects = (userIdeas || []).map(idea => ({
    id: `idea-${idea.id}`,
    name: idea.name,
    tagline: idea.summary || `${idea.name} — AI Solution for ${idea.audience || 'Users'}`,
    problem: idea.problem || 'Solving user workflow friction with automated intelligence.',
    stack: ['React 18', 'Vite', 'Node.js', 'SQLite', 'AntiGravity AI'],
    impact: `Validated concept with Score: ${idea.score || 85}/100 in StartupOS Idea Lab.`,
    repoUrl: `https://github.com/${currentUser.username || 'builder'}/${idea.name.toLowerCase().replace(/\s+/g, '-')}`,
    demoUrl: `http://localhost:3000?idea=${idea.id}`,
    badge: idea.category || 'AI Startup',
    source: 'incubator'
  }));

  // Combine native flagship projects (if Harshit) + user created ideas + externally added projects
  const baseProjects = isHarshit ? [...HARSHIT_FLAGSHIP_PROJECTS] : [];
  const allProjects = [...baseProjects, ...ideaProjects, ...externalProjects];

  // Dynamic Rank & XP Calculation
  const calculatedXp = isHarshit 
    ? 18450 + (allProjects.length - 5) * 500
    : Math.max(750, allProjects.length * 1500 + (currentUser.role === 'admin' ? 3000 : 500));

  let rankLevel = 1;
  if (calculatedXp > 15000) rankLevel = 5;
  else if (calculatedXp > 8000) rankLevel = 4;
  else if (calculatedXp > 4000) rankLevel = 3;
  else if (calculatedXp > 1500) rankLevel = 2;

  const username = currentUser.username || (currentUser.email ? currentUser.email.split('@')[0] : 'builder');

  return {
    id: currentUser.id || 'user-custom',
    username: username,
    name: currentUser.name || 'AI Product Builder',
    title: isHarshit 
      ? 'AI Product Manager & 0-to-1 Systems Builder' 
      : `${currentUser.persona === 'student' ? 'AI Student Builder' : currentUser.persona === 'developer' ? 'Full-Stack AI Architect' : '0-to-1 AI Founder'} & Systems Builder`,
    avatar: currentUser.avatar || '🚀',
    bio: isHarshit
      ? PRIMARY_MAKER_PROFILE.bio
      : `Building AI-first products and platforms. Designed with master PRD rigor, multi-surface architecture, and constitutional 4-File Parity governance.`,
    location: isHarshit ? PRIMARY_MAKER_PROFILE.location : 'Global Remote',
    email: currentUser.email || 'builder@startupos.io',
    github: `https://github.com/${username}`,
    linkedin: `https://www.linkedin.com/in/${username}`,
    x: `https://x.com/${username}`,
    xp: calculatedXp,
    rankLevel: rankLevel,
    streakDays: isHarshit ? 42 : Math.max(3, allProjects.length * 4),
    shippedCount: allProjects.length,
    communityUpvotes: isHarshit ? 840 : allProjects.length * 45,
    parityScore: allProjects.length > 0 ? '100%' : '50%',
    flagshipProducts: allProjects
  };
}

// SIMULATE IMPORTING PROJECTS FROM GITHUB
export function simulateImportFromGithub(githubUsername) {
  const cleanUsername = (githubUsername || '').replace(/^@/, '').trim();
  if (!cleanUsername) return [];

  return [
    {
      id: `gh-${Date.now()}-1`,
      name: `${cleanUsername}-agent-core`,
      tagline: 'Autonomous multi-surface agent orchestration engine with task trees',
      problem: 'Complex asynchronous multi-agent coordination without drift or infinite loops.',
      stack: ['TypeScript', 'Node.js', 'AntiGravity', 'WebSockets'],
      impact: 'Imported from GitHub • 24 Stars • 4-File Parity verified',
      repoUrl: `https://github.com/${cleanUsername}/${cleanUsername}-agent-core`,
      demoUrl: `https://${cleanUsername}-agent-core.vercel.app`,
      badge: 'GitHub Repo',
      source: 'github'
    },
    {
      id: `gh-${Date.now()}-2`,
      name: `${cleanUsername}-ai-copilot`,
      tagline: 'Contextual code intelligence and PRD documentation synthesizer',
      problem: 'Synthesizing messy PRD requirements into executable schema migrations.',
      stack: ['React 18', 'Tailwind CSS', 'Gemini 2.0 API'],
      impact: 'Imported from GitHub • 18 Stars • Production Verified',
      repoUrl: `https://github.com/${cleanUsername}/${cleanUsername}-ai-copilot`,
      demoUrl: `https://${cleanUsername}-copilot.dev`,
      badge: 'GitHub Repo',
      source: 'github'
    }
  ];
}

// SIMULATE IMPORTING PROJECTS FROM LINKEDIN
export function simulateImportFromLinkedin(linkedinHandle) {
  const cleanHandle = (linkedinHandle || '').replace(/.*in\//, '').replace(/\//g, '').trim();
  if (!cleanHandle) return [];

  return [
    {
      id: `li-${Date.now()}-1`,
      name: `GrowthEngine AI`,
      tagline: 'B2B Pipeline & Account-Based Intelligence Platform',
      problem: 'Automates account discovery, persona enrichment, and personalized outbound hooks.',
      stack: ['Next.js 14', 'FastAPI', 'PostgreSQL', 'pgvector'],
      impact: 'Featured on LinkedIn Experience • $120k ARR pipeline generated',
      repoUrl: `https://github.com/${cleanHandle}/growthengine-ai`,
      demoUrl: `https://growthengine.preview.app`,
      badge: 'LinkedIn Project',
      source: 'linkedin'
    }
  ];
}

// COMMUNITY LEADERBOARD MAKERS
export const COMMUNITY_MAKERS = [
  {
    rank: 1,
    name: 'Harshit Agarwal',
    username: '1997agarwal',
    role: 'AI Product Manager',
    xp: 18450,
    shipped: 5,
    streak: 42,
    badge: 'Elite Fellow'
  },
  {
    rank: 2,
    name: 'Alex Rivera',
    username: 'alexrivera',
    role: 'Product Lead & Founder',
    xp: 7250,
    shipped: 2,
    streak: 14,
    badge: 'AI Systems Architect'
  },
  {
    rank: 3,
    name: 'Sarah Jenkins',
    username: 'sarahj',
    role: 'Growth Strategist & Non-Coder',
    xp: 4100,
    shipped: 1,
    streak: 8,
    badge: 'AI Systems Architect'
  },
  {
    rank: 4,
    name: 'Marcus Chen',
    username: 'marcusc',
    role: 'Full-Stack Vibe Coder',
    xp: 3800,
    shipped: 1,
    streak: 5,
    badge: 'Vibe Coder'
  }
];

export function generateAtsResumeBullets(maker = PRIMARY_MAKER_PROFILE) {
  let output = `## AI PRODUCT MANAGEMENT & SYSTEMS BUILDING EXPERIENCE\n\n`;
  output += `**${maker.name}** — ${maker.title}\n`;
  output += `${maker.location} • ${maker.email} • ${maker.linkedin} • ${maker.github}\n\n`;
  output += `### Flagship AI Products Delivered & Technical Leadership\n\n`;

  (maker.flagshipProducts || []).forEach((p) => {
    output += `**${p.name}** | ${p.tagline}\n`;
    output += `- Designed and shipped the 0-to-1 product strategy, authoring master PRD specifications covering user personas, edge cases, data contracts, and non-goals.\n`;
    output += `- Spearheaded architecture using ${(p.stack || []).join(', ')}, solving: ${p.problem}\n`;
    output += `- Impact & Delivery: ${p.impact}\n`;
    output += `- Enforced constitutional AI governance (4-File Parity: AGENTS.md, ROADMAP.md, CLAUDE.md, CONTRIBUTING.md) achieving zero drift and reproducible sandbox execution.\n\n`;
  });

  return output;
}

export function generateGithubProfileReadmeSnippet(maker = PRIMARY_MAKER_PROFILE) {
  let md = `# Hi, I'm ${maker.name} 👋\n\n`;
  md += `**${maker.title}**  \n${maker.bio}\n\n`;
  md += `[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-181717?style=flat-square&logo=linkedin&logoColor=white)](${maker.linkedin})\n`;
  md += `[![X](https://img.shields.io/badge/X-Follow-181717?style=flat-square&logo=x&logoColor=white)](${maker.x})\n`;
  md += `[![Email](https://img.shields.io/badge/Email-Get_in_Touch-181717?style=flat-square&logo=gmail&logoColor=white)](mailto:${maker.email})\n`;
  md += `[![GitHub](https://img.shields.io/badge/GitHub-Explore_Repos-181717?style=flat-square&logo=github&logoColor=white)](${maker.github})\n\n`;
  md += `---\n\n## 🚀 Shipped Flagship Products\n\n`;
  md += `| Product | Tagline & Problem Solved | Tech Stack | Impact & Live Links |\n`;
  md += `|---|---|---|---|\n`;

  (maker.flagshipProducts || []).forEach((p) => {
    md += `| **[${p.name}](${p.repoUrl})** | ${p.tagline} — *${(p.problem || '').slice(0, 70)}...* | ${(p.stack || []).slice(0, 3).join(', ')} | [Live Demo](${p.demoUrl}) • [Code](${p.repoUrl}) |\n`;
  });

  md += `\n---\n\n### 🛡️ Constitutional AI & 4-File Parity Standard\n`;
  md += `All repositories strictly adhere to the 4-File Governance Standard:\n`;
  md += `- \`AGENTS.md\` — Constitution & execution boundaries\n`;
  md += `- \`ROADMAP.md\` — Milestone tracking\n`;
  md += `- \`CLAUDE.md\` — CLI runner pointers\n`;
  md += `- \`CONTRIBUTING.md\` — PR safety checks\n`;

  return md;
}

export function generateLinkedinAboutSection(maker = PRIMARY_MAKER_PROFILE) {
  const productsList = (maker.flagshipProducts || []).slice(0, 5).map((p, i) => `${i + 1}. ${p.name} — ${p.tagline}`).join('\n');

  return `I'm an ${maker.title}.

I don't just write PRDs—I ship complete, multi-surface platforms with production backends, clean data models, and modern UX.

Shipped AI Platforms & Systems:
${productsList}

My PM Philosophy:
1. Rigorous Master PRDs with Architectural Depth
2. Multi-Surface Systems Mindset (Web + Mobile + Chrome Extension)
3. Constitutional AI Governance (Pioneered the 4-File Parity Standard)

Let's connect: ${maker.linkedin} | ${maker.github}`;
}
