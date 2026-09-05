// LMS Courses and AI Product Development Tracks
export const LMS_COURSES = [
  {
    id: 'course-ai-products',
    title: 'Building AI Products from Idea to MVP (2026)',
    creator: 'Startup OS Academy',
    badge: 'Essential',
    category: 'Startup & AI',
    rating: 4.95,
    students: 18400,
    duration: '4 hrs',
    xpReward: 1500,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    description: 'Learn how to validate startup ideas, write AI-builder-ready PRDs, choose vector databases, and launch full-stack AI MVPs.',
    modules: [
      {
        id: 'mod-101',
        title: 'Module 1: Problem Discovery & Customer Viability',
        duration: '30 min',
        completed: true,
        xp: 300,
        summary: 'How to score startup concepts based on problem clarity, customer focus, differentiation, and market constraints.',
        keyTakeaways: [
          'Define one narrow target customer persona before expanding scope.',
          'Identify existing manual workarounds (spreadsheets, WhatsApp, agencies).',
          'Set explicit time and budget validation boundaries.'
        ],
        flashcards: [
          { q: 'What is a validation boundary?', a: 'A predefined limit on time and money spent testing an assumption before deciding whether to pivot or proceed.' },
          { q: 'Why is narrowing the target customer critical for early MVPs?', a: 'Focused customer segments provide clearer feedback and faster word-of-mouth adoption.' }
        ],
        quiz: [
          {
            question: 'What is the primary goal of the Idea Lab intake phase?',
            options: [
              'To write 10,000 lines of code immediately',
              'To evaluate assumption clarity, customer focus, and viability signals',
              'To raise venture capital funding',
              'To purchase domain names'
            ],
            answer: 1,
            explanation: 'Intake evaluates whether your problem definition and customer focus are specific enough to test.'
          }
        ]
      },
      {
        id: 'mod-102',
        title: 'Module 2: Writing PRDs for AI Coding Assistants',
        duration: '45 min',
        completed: false,
        xp: 400,
        summary: 'Craft structured PRDs and system prompts that AI agents (Antigravity, Replit Agent, Cursor) can implement without ambiguity.',
        keyTakeaways: [
          'Break down features into detailed user workflows and data schemas.',
          'Specify exact API contracts, error boundaries, and state management rules.',
          'Include explicit non-goals to prevent feature creep.'
        ],
        flashcards: [
          { q: 'What is an AI Build Prompt?', a: 'A structured specification giving an AI assistant context, database schema expectations, and feature requirements.' }
        ],
        quiz: [
          {
            question: 'Which element is essential in a prompt for AI code generators?',
            options: [
              'Vague marketing slogans',
              'Explicit data flow, user roles, and database persistence requirements',
              'Uncompressed images',
              'Random CSS colors'
            ],
            answer: 1,
            explanation: 'AI agents require deterministic specifications regarding data schemas and functional boundaries.'
          }
        ]
      },
      {
        id: 'mod-103',
        title: 'Module 3: Full-Stack AI Architecture & RAG Systems',
        duration: '50 min',
        completed: false,
        xp: 500,
        summary: 'Deep dive into combining LLM APIs, vector stores (Pinecone/Qdrant), embeddings, and persistent databases for production apps.',
        keyTakeaways: [
          'Vector databases store high-dimensional embeddings for semantic search.',
          'Structured outputs ensure reliable JSON communication between LLMs and backends.'
        ],
        flashcards: [
          { q: 'What does RAG stand for?', a: 'Retrieval-Augmented Generation, injecting relevant context into LLM prompts from a vector DB.' }
        ],
        quiz: [
          {
            question: 'What role does RAG play in AI startups?',
            options: [
              'Generates fake reviews',
              'Injects real-time or private custom knowledge into LLM prompts to eliminate hallucination',
              'Accelerates CSS animations',
              'Replaces HTML forms'
            ],
            answer: 1,
            explanation: 'RAG supplies accurate, domain-specific background context to the model at inference time.'
          }
        ]
      }
    ]
  },
  {
    id: 'course-vibe-coding',
    title: 'Vibe Coding & Rapid Prototyping Masterclass',
    creator: 'Elena Rostova (Lead Product Designer)',
    badge: 'Popular',
    category: 'Engineering & UX',
    rating: 4.88,
    students: 12100,
    duration: '3.5 hrs',
    xpReward: 1100,
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    description: 'Learn how to build sleek dark-mode glassmorphic UIs, interactive dashboards, and rapid micro-SaaS applications using React & Tailwind.',
    modules: [
      {
        id: 'mod-201',
        title: 'Module 1: Glassmorphism & Tokenized UI Systems',
        duration: '30 min',
        completed: true,
        xp: 300,
        summary: 'Design modern web interfaces using CSS backdrop-filter, crisp typography, and responsive grid layouts.',
        keyTakeaways: [
          'Backdrop-filter creates visual depth by blurring underlying background colors.',
          'Lucide icon sets provide consistent visual cues across feature cards.'
        ],
        flashcards: [
          { q: 'What is Glassmorphism?', a: 'A design trend using translucent blurred panels, subtle borders, and vivid background gradients.' }
        ],
        quiz: [
          {
            question: 'Which CSS utility creates the glass blur effect in modern UI frameworks?',
            options: [
              'backdrop-blur / backdrop-filter',
              'margin-auto',
              'box-sizing: border-box',
              'transform: rotate(45deg)'
            ],
            answer: 0,
            explanation: 'Backdrop-filter applies optical blur to elements rendered behind the panel.'
          }
        ]
      }
    ]
  }
];

export const BUILDER_TRACKS = [
  {
    id: 'track-1',
    title: 'Track 1: Idea to Scored Viability Signal',
    level: 'Beginner Founder',
    time: '15 mins',
    description: 'Enter your startup problem and audience into Idea Lab to get a directional 100-point viability score.',
    steps: [
      'Fill out the 6-field intake form in Idea Lab.',
      'Review your score breakdown across Problem, Audience, and Feasibility.',
      'Read the recommended validation steps.'
    ]
  },
  {
    id: 'track-2',
    title: 'Track 2: Generate Full AI Documentation Package',
    level: 'Intermediate Product Manager',
    time: '25 mins',
    description: 'Turn your scored idea into a complete 5-file PRD suite ready for AI code agents.',
    steps: [
      'Select your saved workspace in PRD Generator Studio.',
      'Review generated Competitor Analysis and Technical Architecture.',
      'Copy the structured AI build prompt for Antigravity or Replit Agent.'
    ]
  },
  {
    id: 'track-3',
    title: 'Track 3: Explore Showcase Product Blueprints',
    level: 'All Founders',
    time: '20 mins',
    description: 'Study real-world PRDs from top projects like DupeScout, Trippy, and CollabKaro.',
    steps: [
      'Navigate to Showcase Blueprints Studio.',
      'Inspect product requirements, system architectures, and market research.',
      'Fork or customize blueprint prompts for your own venture.'
    ]
  }
];
