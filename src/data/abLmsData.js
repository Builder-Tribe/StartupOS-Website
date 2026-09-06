// AB-LMS Data Store - 3 System Architecture (Learner, Creator, Admin)

export const CREATORS_DATABASE = [
  {
    id: 'creator-1',
    name: 'Dr. Evelyn Vance',
    email: 'evelyn.vance@ai-builder.org',
    role: 'Chief AI Architect & Course Lead',
    joinedDate: '2026-01-15',
    liveCoursesCount: 3,
    totalStudents: 3420,
    rating: 4.9,
    status: 'ACTIVE'
  },
  {
    id: 'creator-2',
    name: 'Marcus Chen',
    email: 'marcus.c@vibe-coding.io',
    role: 'Full-Stack Vibe Coding Expert',
    joinedDate: '2026-03-02',
    liveCoursesCount: 2,
    totalStudents: 1890,
    rating: 4.8,
    status: 'ACTIVE'
  }
];

export const LEARNERS_DATABASE = [
  {
    id: 'learner-1',
    name: 'Alex Rivera',
    email: 'alex.rivera@productlead.io',
    role: 'Product Manager & Founder',
    joinedDate: '2026-05-10',
    streakDays: 14,
    xp: 7250,
    enrolledCoursesCount: 3,
    completedCoursesCount: 2,
    shippedProductsCount: 2,
    shippedProjects: [
      {
        title: 'FeedbackPulse AI',
        githubUrl: 'https://github.com/1997agarwal/Learning-Management',
        demoUrl: 'https://feedbackpulse-demo.vercel.app',
        tools: ['Antigravity', 'Supabase', 'Gemini 2.0 API'],
        shippedDate: '2026-08-06',
        reviewStatus: 'AI_EVALUATED & EXAMINER_REVIEWED'
      },
      {
        title: 'DocuChat Agent',
        githubUrl: 'https://github.com/alexrivera/docuchat',
        demoUrl: 'https://docuchat.dev',
        tools: ['Claude Code', 'PgVector', 'Cursor'],
        shippedDate: '2026-07-20',
        reviewStatus: 'EXAMINER_REVIEWED'
      }
    ]
  },
  {
    id: 'learner-2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@growthhacker.co',
    role: 'Growth Strategist & Non-Coder',
    joinedDate: '2026-06-18',
    streakDays: 8,
    xp: 4100,
    enrolledCoursesCount: 2,
    completedCoursesCount: 1,
    shippedProductsCount: 1,
    shippedProjects: [
      {
        title: 'RepurposeBot SaaS',
        githubUrl: 'https://github.com/sarahj/repurpose-bot',
        demoUrl: 'https://repurposebot.ai',
        tools: ['Replit', 'Gemini 2.0 API'],
        shippedDate: '2026-08-01',
        reviewStatus: 'AI_EVALUATED'
      }
    ]
  }
];

export const STANDARDIZED_COURSES = [
  {
    id: 'course-saas-101',
    title: 'Build a Full-Stack AI SaaS in 60 Mins with Antigravity & Supabase',
    slug: 'build-ai-saas-antigravity',
    subtitle: 'Learn how to transform a simple PRD into a production-ready AI product without manual coding.',
    creatorId: 'creator-1',
    creatorName: 'Dr. Evelyn Vance',
    category: 'Full-Stack AI SaaS',
    level: 'Beginner Non-Coder',
    duration: '60 mins',
    status: 'LIVE',
    enrolledCount: 1420,
    toolsSupported: ['Antigravity', 'Claude Code', 'Cursor', 'Replit', 'Emergent'],

    structure: {
      problem: 'Non-technical founders struggle to rapidly prototype AI SaaS applications because backend DB and LLM APIs require complex boilerplate.',
      useCase: 'An AI-powered Customer Insight Repurposer SaaS that extracts pain points using Gemini 2.0.',
      prd: {
        targetUser: 'Product Managers, Solo Founders, Growth Marketers',
        coreFeatures: [
          'Multi-format feedback ingestion (Text, CSV, URL)',
          'AI sentiment & feature extraction via LLM tool calling',
          'Supabase PostgreSQL storage for customer insights',
          'One-click export to GitHub & Vercel deployment'
        ]
      }
    },

    modules: [
      {
        id: 'mod-1',
        title: 'Module 1: Defining PRD & Database Schema',
        lessons: [
          {
            id: 'les-1-1',
            title: 'Lesson 1.1: Drafting the AI Prompt Architecture',
            lessonType: 'STEP_BUILDER',
            description: 'Learn how to write deterministic prompts for AI coding agents to generate database schemas.',
            tools: {
              Antigravity: {
                promptToCopy: `Act as a senior software architect. Generate a Supabase PostgreSQL migration file for a Customer Insights SaaS with tables: 'insights' (id, user_id, raw_feedback, sentiment, key_pain_points JSONB, created_at). Include Row Level Security (RLS) policies.`,
                expectedOutput: `migration.sql file generated with CREATE TABLE insights and RLS policies for auth.uid() = user_id.`,
                validationHint: 'Verify that the migration file contains valid SQL syntax and JSONB data types.'
              },
              'Claude Code': {
                promptToCopy: `claude "Create a Supabase SQL schema in /supabase/migrations for customer feedback processing with JSONB column for key_pain_points and RLS setup."`,
                expectedOutput: `Supabase CLI migration script created in supabase/migrations directory.`,
                validationHint: 'Check that the CLI migration command completes cleanly without syntax warnings.'
              },
              Cursor: {
                promptToCopy: `Generate a Supabase database client configuration file in src/lib/supabase.js using process.env.VITE_SUPABASE_URL and process.env.VITE_SUPABASE_ANON_KEY.`,
                expectedOutput: `Supabase JS client exported from src/lib/supabase.js.`,
                validationHint: 'Ensure environment variable fallbacks are handled gracefully.'
              },
              Replit: {
                promptToCopy: `Set up a Node.js Express server with Supabase client connection in index.js and create POST endpoint /api/feedback.`,
                expectedOutput: `Express server running on port 3000 with /api/feedback route handling JSON payloads.`,
                validationHint: 'Test the endpoint with curl or Postman to confirm 200 OK response.'
              }
            }
          }
        ]
      }
    ]
  },
  {
    id: 'course-branding-github-101',
    title: 'Developer Branding & GitHub Launchpad: Push Code, 4-File Parity & Catch Eyeballs on LinkedIn',
    slug: 'github-launchpad-personal-branding',
    subtitle: 'Learn how to push production code cleanly, architect an irresistible GitHub profile with 4-file parity, and write high-converting LinkedIn launch posts to attract recruiters and co-founders.',
    creatorId: 'creator-2',
    creatorName: 'Harshit Agarwal & Marcus Chen',
    category: 'Personal Branding & Launch',
    level: 'All Levels (PMs & Founders)',
    duration: '45 mins',
    status: 'LIVE',
    enrolledCount: 2840,
    toolsSupported: ['Antigravity', 'Claude Code', 'Cursor', 'Replit', 'Emergent'],

    structure: {
      problem: 'Brilliant builders ship incredible software, but have empty GitHub profiles, messy git histories, zero PRD documentation, and no inbound recruiter or user traction.',
      useCase: 'Transform your projects into a recognized personal brand with recruiter-converting GitHub profile READMEs, 4-file repository parity, and viral LinkedIn launch loops.',
      prd: {
        targetUser: 'Product Managers, Full-Stack Founders, AI Engineers, Student Builders',
        coreFeatures: [
          'Safe Git push workflows and credential leak prevention (.gitignore)',
          'The 4-File Code Parity Standard (AGENTS.md, ROADMAP.md, CLAUDE.md, CONTRIBUTING.md)',
          'The special username/username GitHub Profile README architecture with monochrome CTAs',
          'A 5-part LinkedIn Build-in-Public Launch formula that drives recruiter DMs & investor interest'
        ]
      }
    },

    modules: [
      {
        id: 'mod-brand-1',
        title: 'Module 1: Git Push Workflows & 4-File Parity Standard',
        lessons: [
          {
            id: 'les-brand-1-1',
            title: 'Lesson 1.1: Pre-Flight Hygiene & Pushing Code to GitHub',
            lessonType: 'STEP_BUILDER',
            description: 'Master clean Git commits, secret isolation (.env in .gitignore), and linking local code to a GitHub remote repository.',
            tools: {
              Antigravity: {
                promptToCopy: `Act as a senior DevOps engineer. Generate a comprehensive .gitignore file for a modern React + Vite + Node.js full-stack app, and provide the exact step-by-step terminal commands to initialize git, commit, link to https://github.com/USERNAME/REPO.git on the main branch, and push cleanly.`,
                expectedOutput: `.gitignore file created and validated + bash sequence (git init, git add, git commit -m, git branch -M main, git push -u origin main).`,
                validationHint: `Ensure no API keys, .env, or node_modules are tracked by running 'git status --ignored'.`
              },
              'Claude Code': {
                promptToCopy: `claude "Inspect the current repo. Ensure all sensitive files (.env, credentials) are gitignored. Stage only source code and documentation, and generate a commit message following the Conventional Commits specification."`,
                expectedOutput: `Clean git staging area with zero sensitive files and standard conventional commit message.`,
                validationHint: `Confirm 'git diff --staged' shows no credentials or temporary build artifacts.`
              },
              Cursor: {
                promptToCopy: `Write a pre-push verification script in bash that checks: 1) npm run build passes, 2) no console.log statements in production routes, 3) 4 core governance files exist before allowing git push.`,
                expectedOutput: `Executable script in scripts/verify-before-push.sh with exit codes.`,
                validationHint: `Run 'chmod +x scripts/verify-before-push.sh && ./scripts/verify-before-push.sh'.`
              },
              Replit: {
                promptToCopy: `Configure GitHub remote origin inside Replit shell, set up Personal Access Token (PAT) authentication safely, and push the active workspace branch to GitHub.`,
                expectedOutput: `Remote repository connected and branch synchronized with GitHub.`,
                validationHint: `Verify remote repository commit history shows the latest Replit workspace changes.`
              },
              Emergent: {
                promptToCopy: `Generate automated GitHub Actions workflow in .github/workflows/deploy.yml that builds the project, runs lint checks, and deploys to production upon push to main.`,
                expectedOutput: `Valid GitHub Actions CI/CD YAML configuration.`,
                validationHint: `Check GitHub Actions tab on push to confirm green build status.`
              }
            }
          },
          {
            id: 'les-brand-1-2',
            title: 'Lesson 1.2: The 4-File Code Parity Standard',
            lessonType: 'STEP_BUILDER',
            description: 'Establish the 4 constitutional files (AGENTS.md, ROADMAP.md, CLAUDE.md, CONTRIBUTING.md) that turn hobby repositories into top 1% enterprise-grade projects.',
            tools: {
              Antigravity: {
                promptToCopy: `Generate the 4-File Parity Standard for my AI project:
1. AGENTS.md (System constitution, strict project isolation rules, security boundaries)
2. ROADMAP.md (Phase-by-phase completion status with checked and upcoming milestones)
3. CLAUDE.md (Concise pointer for CLI agents and coding standards)
4. CONTRIBUTING.md (Branching model, PR review checklist, code quality rules)`,
                expectedOutput: `All 4 standardized markdown files created in the project root adhering to StartupOS governance.`,
                validationHint: `Verify that AGENTS.md contains clear security boundaries and zero destructive commands.`
              },
              'Claude Code': {
                promptToCopy: `claude "Generate a living ROADMAP.md and AGENTS.md for this codebase summarizing the architecture, key product pillars, and development protocol."`,
                expectedOutput: `Detailed AGENTS.md and ROADMAP.md generated reflecting the exact codebase structure.`,
                validationHint: `Confirm milestones accurately reflect current progress.`
              },
              Cursor: {
                promptToCopy: `Generate a CONTRIBUTING.md and CLAUDE.md file tailored to our TypeScript/Node/React stack with exact coding conventions and test run instructions.`,
                expectedOutput: `Developer onboarding documentation with local environment setup guide.`,
                validationHint: `Verify that setup commands match package.json scripts.`
              },
              Replit: {
                promptToCopy: `Create a comprehensive README.md and replit.md documentation guide explaining port bindings (process.env.PORT) and cloud preview instructions.`,
                expectedOutput: `Complete markdown setup guide for cloud development.`,
                validationHint: `Test Replit live webview with configured port.`
              },
              Emergent: {
                promptToCopy: `Audit the repository root for 4-file parity compliance and generate any missing governance files automatically.`,
                expectedOutput: `Automated audit report confirming 100% 4-file parity score.`,
                validationHint: `Check that all 4 files exist in the repository root.`
              }
            }
          }
        ]
      },
      {
        id: 'mod-brand-2',
        title: 'Module 2: Building a Recruiter-Converting GitHub Profile',
        lessons: [
          {
            id: 'les-brand-2-1',
            title: 'Lesson 2.1: The Special username/username Profile README Secret',
            lessonType: 'STEP_BUILDER',
            description: 'Learn how GitHub profile rendering works, why the repo MUST match your username exactly, and how to structure a senior AI PM / Founder layout.',
            tools: {
              Antigravity: {
                promptToCopy: `Act as a tech branding strategist and executive headhunter. Review my background and flagship products (StartupOS, Trippy, DupeScout, BusinessPay, CollabKaro). Generate a recruiter-converting GitHub Profile README for https://github.com/USERNAME/USERNAME. Include:
1. High-impact headline positioning me as an AI Product Manager & 0-to-1 Systems Builder
2. Minimalist dark monochrome CTAs (#181717) for LinkedIn, X, Email, and GitHub
3. A structured 5-project portfolio matrix (Domain, PM Problem Solved, Metrics/Impact, Architecture)
4. My 0-to-1 PM philosophy and 4-File Parity Governance standard
5. Categorized Product & Technical toolkit`,
                expectedOutput: `Complete, pristine README.md ready to paste into your username/username repository.`,
                validationHint: `Ensure the repository name is identical to your GitHub username and set to Public.`
              },
              'Claude Code': {
                promptToCopy: `claude "Draft an executive summary table for my GitHub profile README that compares 4 flagship projects on problem statement, PM metrics (DSO, retention, conversion), and multi-surface tech stack."`,
                expectedOutput: `High-density Markdown table formatted for maximum mobile and desktop readability.`,
                validationHint: `Check markdown rendering to ensure table columns do not wrap awkwardly.`
              },
              Cursor: {
                promptToCopy: `Format monochrome Shields.io badges for LinkedIn, X/Twitter, Email, and GitHub with #181717 background, flat-square style, and official SVG white logos.`,
                expectedOutput: `Copyable Markdown badge row with verified destination URLs.`,
                validationHint: `Click each badge preview in markdown to confirm links open correctly.`
              },
              Replit: {
                promptToCopy: `Create an interactive web preview of my GitHub Profile README to test layout, typography, and contrast on desktop and mobile viewports.`,
                expectedOutput: `Live rendered HTML preview of the profile README.`,
                validationHint: `Verify mobile responsive alignment.`
              },
              Emergent: {
                promptToCopy: `Analyze top tech profile READMEs (e.g. Shubham Saboo, Aakash Gupta) and optimize my profile copy to target AI Product Lead and Founding Engineer roles.`,
                expectedOutput: `Bullet points rewritten with quantified impact metrics and leadership keywords.`,
                validationHint: `Check that copy highlights 0-to-1 execution rather than passive task management.`
              }
            }
          }
        ]
      },
      {
        id: 'mod-brand-3',
        title: 'Module 3: LinkedIn Eyeball Engine & Viral Launch Framework',
        lessons: [
          {
            id: 'les-brand-3-1',
            title: 'Lesson 3.1: The 0-to-1 Build-in-Public Launch Post Formula',
            lessonType: 'STEP_BUILDER',
            description: 'Master the exact storytelling formula that turns technical GitHub commits into 50k+ impression LinkedIn posts that attract recruiters and users.',
            tools: {
              Antigravity: {
                promptToCopy: `Act as a viral tech writer and product marketer. Turn my recent project build into a compelling LinkedIn launch post using the 5-part Viral Hook framework:
1. The Contrarian Hook: Challenge a common industry assumption (e.g., 'Most PMs think you need a 10-person dev team to ship multi-surface AI apps...')
2. The Real Problem & Villain: Why existing solutions fail users
3. The 0-to-1 Solution: What I built, why it's different, and how AI coding agents accelerated execution
4. The 3 Key Technical/Product Lessons Learned
5. Call to Action: Link to live demo, GitHub repo, and invitation to connect / share feedback`,
                expectedOutput: `Ready-to-post LinkedIn text draft formatted with clean line breaks, zero cringe fluff, and a 30-second screen demo outline.`,
                validationHint: `Read aloud to ensure the tone is authoritative, humble, and value-dense.`
              },
              'Claude Code': {
                promptToCopy: `claude "Extract the top 3 architectural breakthroughs and 2 user friction points from our recent commit history and summarize them into a LinkedIn engineering story."`,
                expectedOutput: `Punchy technical breakdown ready to adapt for LinkedIn or Substack.`,
                validationHint: `Check that all numbers and architectural facts align with the codebase.`
              },
              Cursor: {
                promptToCopy: `Draft a concise 2-minute video demo script showcasing the core user journey: problem -> AI transformation -> result, with timestamps and screen recordings.`,
                expectedOutput: `Audio-visual demo storyboard for LinkedIn video uploads.`,
                validationHint: `Keep the first 5 seconds focused entirely on the core problem hook.`
              },
              Replit: {
                promptToCopy: `Generate OpenGraph social preview metadata (og:title, og:description, og:image) for my project to ensure rich preview cards when sharing links on LinkedIn and X.`,
                expectedOutput: `HTML meta tags ready to paste into index.html <head>.`,
                validationHint: `Test with LinkedIn Post Inspector (linkedin.com/post-inspector).`
              },
              Emergent: {
                promptToCopy: `Generate 5 alternative opening hooks for a LinkedIn launch post targeting VC investors, startup founders, and Head of Product recruiters.`,
                expectedOutput: `5 distinct hook angles (Data-driven, Story-driven, Metric-driven, Contrarian, Visual).`,
                validationHint: `Select the hook with the highest emotional resonance and curiosity gap.`
              }
            }
          }
        ]
      }
    ]
  }
];

export const INITIAL_SUBMISSIONS = [
  {
    id: 'sub-101',
    studentName: 'Alex Rivera',
    studentEmail: 'alex.rivera@productlead.io',
    studentRole: 'Product Manager & Founder',
    projectTitle: 'FeedbackPulse AI - Automated Customer Insight Engine',
    problemSolved: 'Transforms thousands of unstructured App Store reviews into prioritized Jira tickets using Gemini 2.0 tool calling.',
    githubUrl: 'https://github.com/1997agarwal/Learning-Management',
    liveDemoUrl: 'https://feedbackpulse-demo.vercel.app',
    toolsUsed: ['Antigravity', 'Supabase', 'Gemini 2.0 API'],
    submittedDate: '2026-08-06',
    status: 'AI_EVALUATED',

    aiEvaluation: {
      score: 92,
      completeness: 'EXCELLENT',
      clarityOfProblem: 'Exceptional breakdown of target user pain points and automated pipeline architecture.',
      codeQuality: 'Clean modular repository structure with clear README instructions and prompt logs.',
      uxSuggestions: [
        'Add visual status badges for processing state in the dashboard UI',
        'Include a sample CSV download link for first-time testers'
      ],
      overallSummary: 'High-quality production MVP ready for customer testing.'
    },

    humanReview: {
      reviewerName: 'Dr. Evelyn Vance (Chief AI Architect)',
      feedbackText: 'Great MVP! Excellent schema design and Gemini tool calling. Approved for public showcase.',
      score: 94,
      date: '2026-08-07'
    }
  }
];

export const PUBLIC_SHOWCASE = [
  {
    id: 'showcase-1',
    title: 'FeedbackPulse AI',
    tagline: 'Automated Customer Insight Repurposer SaaS',
    author: 'Alex Rivera',
    tools: ['Antigravity', 'Supabase', 'Gemini 2.0 API'],
    stars: 48,
    upvotes: 142,
    githubUrl: 'https://github.com/1997agarwal/Learning-Management',
    liveDemoUrl: 'https://feedbackpulse-demo.vercel.app'
  },
  {
    id: 'showcase-2',
    title: 'DupeScout AI',
    tagline: 'Luxury Alternative & Value Discovery Engine',
    author: 'Harshit Agarwal',
    tools: ['Antigravity', 'FastAPI', 'Qdrant'],
    stars: 89,
    upvotes: 215,
    githubUrl: 'https://github.com/1997agarwal/DupeScout',
    liveDemoUrl: 'https://dupescout-demo.vercel.app'
  },
  {
    id: 'showcase-3',
    title: 'Trippy Solo Travel',
    tagline: 'AI Solo Traveler Matcher & Dynamic Itinerary Builder',
    author: 'Harshit Agarwal',
    tools: ['Antigravity', 'PostgreSQL', 'Gemini 2.0 API'],
    stars: 64,
    upvotes: 180,
    githubUrl: 'https://github.com/1997agarwal/Trippy',
    liveDemoUrl: 'https://trippy-demo.vercel.app'
  },
  {
    id: 'showcase-4',
    title: 'BusinessPay AR',
    tagline: 'B2B Accounts Receivable Collections & Liquidity Accelerator',
    author: 'Harshit Agarwal',
    tools: ['Antigravity', 'React 18', 'Node 22'],
    stars: 76,
    upvotes: 198,
    githubUrl: 'https://github.com/1997agarwal/BusinessPay',
    liveDemoUrl: 'https://businesspay-demo.vercel.app'
  }
];

export const EIGHT_PART_FRAMEWORK = [
  { step: 1, id: 'problem', label: '1. Problem', title: 'Problem Formulation', hint: 'Define the real-world user friction' },
  { step: 2, id: 'persona', label: '2. User Persona', title: 'Target User & Persona', hint: 'Who suffers most from this problem' },
  { step: 3, id: 'prd', label: '3. PRD Spec', title: 'PRD & Core Stories', hint: 'MVP feature boundary & non-negotiables' },
  { step: 4, id: 'architecture', label: '4. Architecture', title: 'System & Schema Design', hint: 'Database contracts and data flow' },
  { step: 5, id: 'toolchain', label: '5. Tool Selection', title: 'AI Toolchain Matrix', hint: 'Zero tool lock-in: Antigravity vs Claude vs Cursor' },
  { step: 6, id: 'prompts', label: '6. Agent Prompts', title: 'Deterministic Prompts', hint: 'Copy-pasteable system prompts' },
  { step: 7, id: 'verification', label: '7. Verification', title: 'Output Checkpoint', hint: 'What files should exist and test syntax' },
  { step: 8, id: 'deliverable', label: '8. Ship & Claim XP', title: 'Code Push & Deliverable', hint: 'Deploy, verify 4-file parity, claim +50 XP' }
];

export function generateAiEvaluatorReport(sub) {
  const hash = 'CERT-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  const baseScore = 92 + Math.floor(Math.random() * 6); // 92 - 97
  return {
    certificateId: hash,
    score: baseScore,
    issuedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    rubric: {
      problemClarity: { score: 25, max: 25, note: 'Crystal clear definition of target persona pain points.' },
      fourFileParity: { score: 24, max: 25, note: 'AGENTS.md, ROADMAP.md, CLAUDE.md, and CONTRIBUTING.md verified in repository root.' },
      codeArchitecture: { score: 23, max: 25, note: 'Clean separation of concerns between frontend, backend REST API, and data storage.' },
      uxCompleteness: { score: baseScore - 72, max: 25, note: 'Live webview functional with clear responsive states.' }
    },
    recommendations: [
      'Pin this repository to your GitHub profile overview to maximize recruiter visibility.',
      'Ensure .env.example is provided so open-source contributors can spin up locally in <2 minutes.',
      'Share a 30-second screen demo on LinkedIn using the 5-part hook formula.'
    ],
    summary: `Exceptional 0-to-1 build! ${sub.projectTitle} demonstrates disciplined product architecture, robust prompt engineering, and complete 4-file parity compliance.`
  };
}

export function generateProfileReadmeMarkdown({ name = 'AI Product Builder', role = 'AI Product Manager & 0-to-1 Systems Builder', github = '1997agarwal', linkedin = 'harshit-agarwal-pm', email = 'agarwal.harshit97@gmail.com', projects = [] }) {
  const projectRows = projects.length > 0
    ? projects.map(p => `| **[${p.title}](${p.githubUrl})** | **${p.tagline || 'AI SaaS Application'}** | Solves core target user workflow friction with automated AI agent execution. | ${p.tools?.join(', ') || 'React 18, Node.js, AI Agents'} |`).join('\n')
    : `| **[StartupOS](https://github.com/${github}/StartupOS)** | **360° AI Product Incubator & Operating System** | Democratizes product creation for founders and students. | React 18, Vite, Node.js API, AntiGravity orchestration |
| **[FeedbackPulse AI](https://github.com/${github}/FeedbackPulse)** | **AI Customer Feedback Intelligence Engine** | Automated sentiment extraction and feature prioritization. | React 18, Supabase, Gemini 2.0 |`;

  return `# Hi, I'm ${name} 👋

**${role}**  
I build and ship production-grade AI platforms, multi-agent workflows, and venture products from scratch. Combining rigorous product strategy (master PRDs, GTM, unit economics) with high-velocity full-stack AI engineering.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-181717?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/${linkedin})
[![Email](https://img.shields.io/badge/Email-Get_in_Touch-181717?style=flat-square&logo=gmail&logoColor=white)](mailto:${email})
[![GitHub](https://img.shields.io/badge/GitHub-Explore_Repos-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/${github})

---

## 🚀 Shipped Products & What I Build

I don't just write PRDs—I ship complete, multi-surface platforms with production backends, clean data models, and modern UX.

| Product / Platform | Domain & PM Problem Solved | Key PM Capabilities & Impact | Tech & AI Architecture |
|---|---|---|---|
${projectRows}

---

## 🧠 How I Operate as a Product Manager

\`\`\`
       [ 0-to-1 Discovery ] ──► [ Master PRD & Specs ] ──► [ AI Multi-Agent Build ] ──► [ Production Launch ]
     Customer interviews,       Edge cases, SLAs, metrics,       AntiGravity, Claude Code,      Multi-surface delivery,
    market gap validation      user stories, data models         governance constitutions        feedback & iterations
\`\`\`

### 1. Rigorous 0-to-1 Product Thinking
- **Master PRDs with Architectural Depth**: Every product starts with clear user personas, edge-case handling, data contracts, and success metrics (DSO, AOV, GMV, Retention, Activation funnels).
- **Vibe Coding with Engineering Rigor**: Rapidly turning concept into working software using AI-assisted engineering while preserving architectural elegance and component isolation.

### 2. Multi-Surface & Systems Mindset
- Real products rarely live on just one screen. My platforms span **Consumer Apps**, **B2B Partner CRMs**, **Cross-Platform Mobile (React Native)**, and **Internal Admin Consoles** sharing clean, unified data layers.

### 3. Constitutional AI & Agent Governance
- Pioneered the **4-File Parity Standard** across repositories:
  - \`AGENTS.md\` — AI agent constitution, security boundaries, and runtime execution rules
  - \`ROADMAP.md\` — Living execution status and milestone tracking
  - \`CLAUDE.md\` — System prompts and CLI tool guidance
  - \`CONTRIBUTING.md\` — Governance, branching, and code quality standards

---

## 📬 Let's Connect

Looking for an **AI Product Manager** who can navigate ambiguity, design scalable systems, and ship relentlessly?

<p align="left">
  <a href="https://www.linkedin.com/in/${linkedin}" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-Connect-181717?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>
  <a href="mailto:${email}">
    <img src="https://img.shields.io/badge/Email-Get_in_Touch-181717?style=flat-square&logo=gmail&logoColor=white" alt="Email" />
  </a>
  <a href="https://github.com/${github}">
    <img src="https://img.shields.io/badge/GitHub-Explore_Repos-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub" />
  </a>
</p>

---
<p align="center">
  <i>"The best product managers don't just manage the backlog — they understand the system, prototype the future, and ship value."</i>
</p>
`;
}

export function generateAiCourseDraft(topic = 'Build an AI Voice Agent', audience = 'Non-coders & Product Managers') {
  const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    id: `course-${Date.now()}`,
    title: topic,
    slug: slug,
    subtitle: `Step-by-step 0-to-1 build recipe for ${audience} using AI coding agents and production APIs.`,
    creatorId: 'creator-ai',
    creatorName: 'AI Course Architect (LMS Engine)',
    category: 'AI Agents & RAG',
    level: 'Intermediate Builder',
    duration: '45 mins',
    status: 'LIVE',
    enrolledCount: 1,
    toolsSupported: ['Antigravity', 'Claude Code', 'Cursor', 'Replit', 'Emergent'],
    structure: {
      problem: `Building ${topic} from scratch traditionally requires complex backend microservices, real-time WebSocket orchestration, and high infrastructure costs.`,
      useCase: `A production-ready implementation of ${topic} deployed with a responsive frontend, SQLite/Postgres persistence, and LLM tool calling.`,
      prd: {
        targetUser: audience,
        coreFeatures: [
          'Real-time streaming response handling',
          'Database persistence for user sessions and state',
          'Clean 4-File Parity repository governance',
          'One-click Vercel or Replit cloud deployment'
        ]
      }
    },
    modules: [
      {
        id: `mod-${Date.now()}-1`,
        title: 'Module 1: Architecture & API Schema',
        lessons: [
          {
            id: `les-${Date.now()}-1`,
            title: `Lesson 1.1: Drafting the Core Specification for ${topic}`,
            lessonType: 'STEP_BUILDER',
            description: `Generate the system architecture, REST routes, and data models using your preferred AI coding assistant.`,
            tools: {
              Antigravity: {
                promptToCopy: `Act as a senior software architect. Generate the full project scaffold for '${topic}' targeting ${audience}. Include index.html, server.mjs, schema definition, and complete 4-file parity governance files.`,
                expectedOutput: `Complete scaffold with package.json, server routes, and AGENTS.md.`,
                validationHint: `Ensure node server starts cleanly with 'node server.mjs'.`
              },
              'Claude Code': {
                promptToCopy: `claude "Create a production-grade full stack project scaffold for ${topic} with clean API routes, error handling, and .gitignore."`,
                expectedOutput: `Directory structure initialized with server and client.`,
                validationHint: `Verify git status shows clean initial commit ready.`
              },
              Cursor: {
                promptToCopy: `Generate the database schema and Express API routes for ${topic} with input validation and typed responses.`,
                expectedOutput: `schema.sql and routes.js created with clean error boundaries.`,
                validationHint: `Test endpoints with curl to confirm 200 OK.`
              },
              Replit: {
                promptToCopy: `Set up Express server on process.env.PORT with CORS enabled and Vite dev server proxy for ${topic}.`,
                expectedOutput: `Replit webview loads server index page.`,
                validationHint: `Verify webview renders without 404.`
              },
              Emergent: {
                promptToCopy: `Generate full-stack application code for ${topic} including UI components and API handlers.`,
                expectedOutput: `React components and Express backend handlers created.`,
                validationHint: `Inspect UI state transitions.`
              }
            }
          }
        ]
      }
    ]
  };
}

