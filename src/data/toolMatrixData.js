// src/data/toolMatrixData.js
// 2026 AI Tool Selection Matrix & Architecture Templates Library

export const AI_TOOLS = [
  {
    id: 'antigravity',
    name: 'Google AntiGravity',
    tagline: 'Lead architectural design, deep reasoning, pair programming & multi-agent orchestration.',
    category: 'Full Agent IDE',
    pricing: 'Included with Pro / API Tier',
    skillLevel: ['Beginner', 'Product Manager', 'Full-Stack Dev'],
    idealProjectTypes: ['Solo SaaS', 'Full-Stack Web', 'Enterprise System', 'Student Portfolio'],
    environment: 'Local IDE + Hybrid Cloud',
    strengths: [
      'Built-in subagents & asynchronous task coordination',
      'Native terminal sandbox & automatic verification loops',
      'Zero-drift file editing with line-indexed diff replacements',
      'Automatic constitution enforcement (AGENTS.md)'
    ],
    weaknesses: [
      'Requires modern workstation for best local responsiveness'
    ],
    configFileName: 'AGENTS.md',
    configSnippet: `# AGENTS.md — Constitution for AntiGravity\n- Maintain strict 4-File Parity: AGENTS.md, ROADMAP.md, CLAUDE.md, CONTRIBUTING.md\n- Verify runtime on localhost before declaring completion\n- Prefer minimal, high-confidence diffs over speculative rewrites`,
    rating: {
      speed: 9.4,
      contextCapacity: 9.8,
      autonomy: 9.7,
      multiFileEditing: 9.6
    }
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    tagline: 'Terminal-native agentic CLI for rapid CLI workflows, refactors and git automation.',
    category: 'Terminal CLI Agent',
    pricing: 'Pay-as-you-go API ($20/mo Anthropic Pro)',
    skillLevel: ['Product Manager', 'Full-Stack Dev'],
    idealProjectTypes: ['CLI Tools', 'Codebase Refactors', 'API Backends', 'Solo SaaS'],
    environment: 'Terminal / CLI',
    strengths: [
      'Unmatched raw architectural reasoning on complex codebases',
      'Fast CLI command execution and git status tracking',
      'Minimal UI overhead — works seamlessly over SSH'
    ],
    weaknesses: [
      'Requires comfortable terminal proficiency',
      'No visual WYSIWYG or canvas view'
    ],
    configFileName: 'CLAUDE.md',
    configSnippet: `# CLAUDE.md — Agent Guidelines\n## Build & Test Commands\n- Build: npm run build\n- Test: npm test\n- Run: node server.mjs\n\n## Architecture Standards\n- Keep controllers decoupled from database drivers\n- Never commit unencrypted secrets`,
    rating: {
      speed: 9.1,
      contextCapacity: 9.9,
      autonomy: 9.3,
      multiFileEditing: 9.5
    }
  },
  {
    id: 'cursor',
    name: 'Cursor',
    tagline: 'AI-first VS Code fork with deep semantic indexing, Composer, and inline completions.',
    category: 'AI Code Editor',
    pricing: '$20/mo Pro',
    skillLevel: ['Product Manager', 'Full-Stack Dev'],
    idealProjectTypes: ['Full-Stack Web', 'Solo SaaS', 'Mobile App', 'Student Portfolio'],
    environment: 'Desktop Editor (VS Code fork)',
    strengths: [
      'Instant code indexing and multi-file semantic search',
      'Composer agent mode with visual diffs',
      'Drop-in compatibility with all VS Code extensions'
    ],
    weaknesses: [
      'Frequent context limits on long multi-agent chains without Pro credits'
    ],
    configFileName: '.cursorrules',
    configSnippet: `# .cursorrules\n- Always enforce 2026 Light modern UI tokens (ambient blur + glassmorphism)\n- Write clean, type-safe React 18 / 19 components\n- Never delete comments unless explicitly instructed`,
    rating: {
      speed: 9.5,
      contextCapacity: 8.8,
      autonomy: 8.9,
      multiFileEditing: 9.1
    }
  },
  {
    id: 'replit',
    name: 'Replit Agent',
    tagline: 'Zero-setup browser prototyping, live instant cloud dev server & dynamic ports.',
    category: 'Cloud IDE & Host',
    pricing: 'Free Tier / $25/mo Core',
    skillLevel: ['Beginner', 'Student', 'Product Manager'],
    idealProjectTypes: ['Student Portfolio', 'Rapid Prototypes', 'Hackathon Demos'],
    environment: 'Web Browser / Cloud VM',
    strengths: [
      'Zero installation — works on Chromebook, iPad, or browser',
      'Instant public URL generation for sharing with teammates',
      'Managed cloud Postgres database included'
    ],
    weaknesses: [
      'Slower on heavy builds compared to native Apple Silicon',
      'Limited custom local toolchains'
    ],
    configFileName: '.replit',
    configSnippet: `run = "npm run dev"\nentrypoint = "index.html"\nhidden = [".git"]\n\n[env]\nPORT = "8080"\nVITE_PORT = "3000"`,
    rating: {
      speed: 8.4,
      contextCapacity: 8.6,
      autonomy: 8.7,
      multiFileEditing: 8.4
    }
  },
  {
    id: 'emergent',
    name: 'Emergent',
    tagline: 'Autonomous full-stack scaffolding respecting design systems and component re-use.',
    category: 'Autonomous Agent',
    pricing: 'Free Beta / Credits',
    skillLevel: ['Beginner', 'Product Manager', 'Full-Stack Dev'],
    idealProjectTypes: ['Solo SaaS', 'Internal Tool', 'Dashboard Apps'],
    environment: 'Cloud Sandbox',
    strengths: [
      'Autonomous end-to-end full-stack generation from prompt',
      'Pre-built component reuse awareness',
      'Clean separation between frontend views and backend mocks'
    ],
    weaknesses: [
      'Best for 0-to-1 rather than deep legacy refactoring'
    ],
    configFileName: 'emergent.config.json',
    configSnippet: `{\n  "designSystem": "tailwind-v4",\n  "theme": "modern-light",\n  "strictParity": true\n}`,
    rating: {
      speed: 8.8,
      contextCapacity: 8.9,
      autonomy: 9.1,
      multiFileEditing: 8.8
    }
  },
  {
    id: 'windsurf',
    name: 'Windsurf (Codeium)',
    tagline: 'Flow-based IDE pairing intelligent code cascades with deep codebase indexing.',
    category: 'AI Code Editor',
    pricing: 'Free Tier / $15/mo Pro',
    skillLevel: ['Product Manager', 'Full-Stack Dev'],
    idealProjectTypes: ['Full-Stack Web', 'Solo SaaS', 'Student Portfolio'],
    environment: 'Desktop Editor',
    strengths: [
      'Cascade flow mode follows mental thought process smoothly',
      'Fast local indexing with high speed autocompletion',
      'Generous free usage tier'
    ],
    weaknesses: [
      'Smaller ecosystem than VS Code market plugins'
    ],
    configFileName: '.windsurfrules',
    configSnippet: `# .windsurfrules\n- Target modern ES modules\n- Check package.json before suggesting new packages`,
    rating: {
      speed: 9.3,
      contextCapacity: 8.7,
      autonomy: 8.6,
      multiFileEditing: 8.8
    }
  }
];

export const ARCHITECTURE_PRESETS = [
  {
    id: 'solo-saas',
    name: '1. Single-Tenant Solo SaaS (Lean 2026)',
    tagline: 'The fastest, lowest-maintenance stack to build, validate, and launch profitable AI products.',
    bestFor: 'Solo founders, indie hackers, PM validation, and student capstone projects',
    monthlyCostEst: '$0 - $15/mo',
    layers: [
      {
        tier: 'Frontend Web & UI',
        tech: 'React 18/19 + Vite + Tailwind CSS',
        role: 'Client-side SPA with zero cold-starts, OpenAI Astra ambient glow tokens & Razorpay glassmorphism.',
        ports: 'Port 3000 / 5173'
      },
      {
        tier: 'Backend & Orchestration API',
        tech: 'Node.js Express / Fastify (ES Modules)',
        role: 'Lightweight REST server handling auth JWT, rate limiting, and agent prompt dispatching.',
        ports: 'Port 8081 / 8080'
      },
      {
        tier: 'Database & Persistence',
        tech: 'SQLite (better-sqlite3) or JSON File Store',
        role: 'Zero-overhead persistent storage without external cloud database provisioning friction.',
        ports: 'Local file persistence'
      },
      {
        tier: 'AI Model Integration',
        tech: 'Google Gemini 2.0 Flash / OpenAI GPT-4o-mini',
        role: 'Ultra-fast sub-second responses with low inference cost ($0.10/1M tokens).',
        ports: 'HTTPS API'
      }
    ],
    mermaidDiagram: `graph TD
  User([End User / Student]) -->|HTTPS| UI[React 18 + Vite SPA]
  UI -->|REST / JWT| API[Node.js Express Server]
  API -->|Read/Write| DB[(SQLite / JSON DB)]
  API -->|Inference Stream| AI[Gemini 2.0 Flash API]
  API -->|Launch Webhook| Launchpad[StartupOS Launchpad Feed]

  style UI fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px
  style API fill:#f3e8ff,stroke:#9333ea,stroke-width:2px
  style DB fill:#fef3c7,stroke:#d97706,stroke-width:2px
  style AI fill:#dcfce7,stroke:#16a34a,stroke-width:2px`,
    asciiDiagram: `+-------------------------------------------------------------+
|                     End User / Browser                      |
+------------------------------+------------------------------+
                               | HTTPS
                               v
+-------------------------------------------------------------+
|             Frontend: React 18 + Vite (Port 3000)           |
|      OpenAI Astra Ambient Blur + Razorpay Glassmorphism     |
+------------------------------+------------------------------+
                               | REST API (JWT Authenticated)
                               v
+-------------------------------------------------------------+
|           Backend Server: Node.js Express (Port 8081)       |
|     + Rate Limiting  + Prompt Injection Guard  + Auth JWT   |
+--------------+-------------------------------+--------------+
               |                               |
               v                               v
+-----------------------------+ +-----------------------------+
|      Local Persistence      | |    AI Inference Pipeline    |
|   SQLite / data/*.json DB   | |    Google Gemini 2.0 Flash  |
+-----------------------------+ +-----------------------------+`
  },
  {
    id: 'multi-surface',
    name: '2. Multi-Surface AI App (Web + Chrome Ext + API)',
    tagline: 'Ideal for shopping assistants, duplicate scouts, travel platforms, and creator marketplaces.',
    bestFor: 'Products requiring browser extensions, partner portals, and high-volume data matching',
    monthlyCostEst: '$20 - $50/mo',
    layers: [
      {
        tier: 'Multi-Surface Clients',
        tech: 'Next.js 15 Web + Chrome Extension (Manifest V3)',
        role: 'Omnipresent access: users browse on web or trigger contextual agent actions directly on any website.',
        ports: 'Web & Extension background worker'
      },
      {
        tier: 'Backend & Background Workers',
        tech: 'Python FastAPI / Node.js + BullMQ Redis Queue',
        role: 'Asynchronous task processing for visual parsing, scraping, and embedding calculation.',
        ports: 'Port 8000 / Redis 6379'
      },
      {
        tier: 'Vector Store & Relational DB',
        tech: 'PostgreSQL 16 + pgvector',
        role: 'Stores relational entities (users, orders) alongside high-dimensional cosine similarity embeddings.',
        ports: 'Port 5432'
      },
      {
        tier: 'Multimodal AI Engine',
        tech: 'Gemini 2.0 Flash Thinking + CLIP / ViT Embeddings',
        role: 'Processes images, documents, and product catalogs in parallel.',
        ports: 'Cloud API'
      }
    ],
    mermaidDiagram: `graph TD
  Web[Web Consumer App] -->|HTTPS| GW[API Gateway / Auth]
  Ext[Chrome Extension MV3] -->|Authenticated REST| GW
  GW --> Core[FastAPI / Node Backend]
  Core --> Queue[Redis Task Queue]
  Queue --> Worker[Worker: Visual Matching]
  Core --> PG[(Postgres + pgvector)]
  Worker --> PG
  Worker --> AI[Multimodal Gemini Vision]

  style Web fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px
  style Ext fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px
  style GW fill:#f3e8ff,stroke:#9333ea,stroke-width:2px
  style PG fill:#fef3c7,stroke:#d97706,stroke-width:2px
  style AI fill:#dcfce7,stroke:#16a34a,stroke-width:2px`,
    asciiDiagram: `+-----------------------+     +-------------------------------+
|   Web Consumer App    |     |  Chrome Extension (Manifest 3)|
+-----------+-----------+     +---------------+---------------+
            |                                 |
            +----------------+----------------+
                             | HTTPS / JWT
                             v
+-------------------------------------------------------------+
|             API Gateway / Rate Limiting / Auth              |
+----------------------------+--------------------------------+
                             |
                             v
+-------------------------------------------------------------+
|           FastAPI / Express Core Execution Backend          |
+--------------+-------------------------------+--------------+
               |                               |
               v (Async Tasks)                 v
+-----------------------------+ +-----------------------------+
|     Redis + Worker Pool     | |   PostgreSQL 16 + pgvector  |
|  - Image feature extraction | |  - Relational Data & Users  |
|  - Batch price scrapers     | |  - 768-dim Vector Index     |
+--------------+--------------+ +-----------------------------+
               |
               v
+-------------------------------------------------------------+
|       Multimodal AI: Gemini Vision & Embedding Engine       |
+-------------------------------------------------------------+`
  },
  {
    id: 'voice-agent',
    name: '3. Realtime Voice & Multimodal Assistant',
    tagline: 'Ultra-low latency conversational agents for customer support, coaching, and language learning.',
    bestFor: 'Voice bots, automated phone agents, mock interviewers, interactive tutors',
    monthlyCostEst: '$30 - $70/mo',
    layers: [
      {
        tier: 'Audio Input & Client Capture',
        tech: 'WebRTC / AudioWorklet (Browser)',
        role: 'Captures raw 16kHz PCM audio stream with noise suppression and echo cancellation.',
        ports: 'Browser AudioWorklet'
      },
      {
        tier: 'Realtime Bi-directional Gateway',
        tech: 'Node.js WebSocket Gateway',
        role: 'Manages low-latency audio packet streaming between client and AI voice provider.',
        ports: 'WebSocket wss://'
      },
      {
        tier: 'Fast Memory Cache',
        tech: 'Redis (In-Memory Session Context)',
        role: 'Maintains live conversational state, interruption triggers, and persona rules.',
        ports: 'Port 6379'
      },
      {
        tier: 'Voice AI Engine',
        tech: 'OpenAI Realtime API / Gemini 2.0 Multimodal Live API',
        role: 'Speech-to-Speech sub-500ms voice generation with native emotion and interruption handling.',
        ports: 'WebSockets API'
      }
    ],
    mermaidDiagram: `graph LR
  User([User Microphone]) <-->|AudioWorklet PCM| WS[Node WebSocket Gateway]
  WS <-->|Fast State| Redis[(Redis Live Memory)]
  WS <-->|Bidirectional Stream| VoiceAI[Gemini Live / OpenAI Realtime]
  VoiceAI -->|Audio Packets| WS
  WS -->|PCM Output| Speaker([Browser Speaker])

  style WS fill:#e0e7ff,stroke:#4f46e5,stroke-width:2px
  style Redis fill:#fef3c7,stroke:#d97706,stroke-width:2px
  style VoiceAI fill:#dcfce7,stroke:#16a34a,stroke-width:2px`,
    asciiDiagram: `[User Mic] <===(AudioWorklet PCM)===> [WebSocket Server]
                                              ||
                                       (Live State Cache)
                                              ||
                                              v
                                     [Redis In-Memory Session]
                                              ||
                                    (Bi-directional Stream)
                                              ||
                                              v
                         [Gemini Live API / OpenAI Realtime]
                                              ||
                                        (Audio Packets)
                                              ||
                                              v
                                       [Browser Speaker]`
  }
];

export function recommendToolchain({ projectType, skillLevel, environment, budget }) {
  let primaryTool = 'antigravity';
  let secondaryTool = 'claude-code';
  let recommendedArch = 'solo-saas';
  let rationale = '';

  if (skillLevel === 'Beginner' && environment === 'Cloud Browser') {
    primaryTool = 'replit';
    secondaryTool = 'emergent';
    rationale = 'As a beginner preferring a browser-only setup, Replit removes all terminal friction and provides instant hosting with zero local environment setup.';
  } else if (projectType === 'Voice AI' || projectType === 'High-Scale Fintech') {
    primaryTool = 'antigravity';
    secondaryTool = 'claude-code';
    recommendedArch = projectType === 'Voice AI' ? 'voice-agent' : 'multi-surface';
    rationale = 'For real-time or high-scale systems, AntiGravity offers superior multi-agent orchestration, sandboxed terminal validation, and strict 4-File Parity governance.';
  } else if (skillLevel === 'Product Manager') {
    primaryTool = 'antigravity';
    secondaryTool = 'cursor';
    recommendedArch = 'solo-saas';
    rationale = 'Product Managers benefit from AntiGravity paired with Cursor: deep reasoning to write robust PRDs and specs, combined with lightning-fast UI iterations.';
  } else {
    primaryTool = 'antigravity';
    secondaryTool = 'claude-code';
    recommendedArch = 'solo-saas';
    rationale = 'The combination of AntiGravity for lead architecture and Claude Code for terminal automation provides the highest build speed and lowest code drift.';
  }

  return {
    primaryTool: AI_TOOLS.find(t => t.id === primaryTool) || AI_TOOLS[0],
    secondaryTool: AI_TOOLS.find(t => t.id === secondaryTool) || AI_TOOLS[1],
    architecture: ARCHITECTURE_PRESETS.find(a => a.id === recommendedArch) || ARCHITECTURE_PRESETS[0],
    rationale
  };
}
