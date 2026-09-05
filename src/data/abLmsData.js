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
    author: 'Founders Studio',
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
    author: 'Solo Studio',
    tools: ['Antigravity', 'PostgreSQL', 'Gemini 2.0 API'],
    stars: 64,
    upvotes: 180,
    githubUrl: 'https://github.com/1997agarwal/Trippy',
    liveDemoUrl: 'https://trippy-demo.vercel.app'
  }
];
