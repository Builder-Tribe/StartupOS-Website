// Showcase Startup Blueprints & User Project Data
export const SHOWCASE_BLUEPRINTS = [
  {
    id: "dupescout",
    ownerId: "user-harshita",
    ownerName: "Harshita G",
    title: "DupeScout (Duke Scout)",
    tagline: "AI-Powered Luxury Dupe & Value Finder Platform",
    category: "AI E-Commerce & Consumer SaaS",
    status: "Production Ready / Fully Documented",
    icon: "ShoppingBag",
    summary: "DupeScout scans global marketplaces to discover high-quality, ethically-sourced alternatives ('dupes') to luxury fashion, beauty, and lifestyle products using visual AI embeddings and price intelligence.",
    targetAudience: "Gen Z & Millennial value-conscious luxury shoppers, fashion enthusiasts, and deal creators",
    keyFeatures: [
      "Visual Search Engine & Embedding Matching for dupes",
      "Multi-volume PRDs covering Consumer UI, Vendor System, Admin & AI Architecture",
      "Vendor Management System for verified ethical manufacturers",
      "GTM, Growth & Monetization strategy documentation"
    ],
    prd: {
      overview: "DupeScout is an AI-first visual discovery engine that matches high-ticket luxury products with verified high-quality alternatives, enabling consumers to shop smarter.",
      problem: "Luxury consumers want premium design and craftsmanship without paying 10x brand markups, but manual search across Instagram/TikTok/AliExpress is noisy, unverified, and risky.",
      solution: "An end-to-end platform featuring instant image/URL search, fabric/material composition comparison, community verification, and vendor quality scores.",
      competitorResearch: [
        "Google Lens: Excellent broad visual search, lacks curation for quality/dupes.",
        "Lyst / ShopStyle: Aggregates full-price brand items, no focus on value alternatives.",
        "TikTok/Reddit Communities: High intent dupe discovery, completely manual and unorganized."
      ],
      technicalArchitecture: {
        frontend: "React / Vite / Tailwind CSS / Chrome Extension MVP",
        backend: "Node.js / Python FastAPI for Vector Embeddings (CLIP / ResNet)",
        database: "PostgreSQL (Metadata & Users) + Qdrant / Pinecone (Visual Vectors)",
        aiServices: "OpenAI Vision API + Custom Visual Similarity Model"
      },
      buildPrompt: `Build a full-stack MVP for DupeScout:

Core Concept: AI-powered luxury alternative & dupe finder.
Target Users: Value-conscious shoppers seeking high-quality alternatives to luxury fashion & lifestyle items.
Key Workflows:
1. Visual / Link Search: User inputs luxury item URL or image, backend generates visual embedding.
2. Similarity Ranking: Query vector DB to return top 5 alternative products with price delta and material specs.
3. Vendor Trust Index: Display community reviews, seller verification badges, and price history graphs.
4. Saved Collections: User can create mood boards and price-alert tracking.

Tech Specs: Next.js/React, Tailwind CSS, Python FastAPI vector search backend, PostgreSQL database.`
    }
  },
  {
    id: "trippy",
    ownerId: "user-harshita",
    ownerName: "Harshita G",
    title: "Trippy (Tripe)",
    tagline: "AI Solo Travel Companion & Matchmaking Platform",
    category: "AI Travel & Social Matching",
    status: "Production Ready / Fully Documented",
    icon: "Compass",
    summary: "Trippy solves solo travel safety and isolation by matching solo travelers based on travel vibe, shared itineraries, budget constraints, and real-time safety verification.",
    targetAudience: "Solo travelers, digital nomads, backpackers, and group trip organizers",
    keyFeatures: [
      "Vibe-based traveler matchmaking algorithm",
      "AI itinerary builder customized by budget and pace",
      "Verified travel buddy network with identity checks",
      "96KB Master PRD & deployment configuration"
    ],
    prd: {
      overview: "Trippy brings safety, connection, and effortless planning to solo travelers worldwide through AI matching and dynamic itinerary generation.",
      problem: "Solo travel offers freedom, but 72% of solo travelers experience safety anxiety, logistics fatigue, or social isolation during trips.",
      solution: "A mobile-first web app that generates hyper-personalized itineraries and pairs solo travelers going to the same destination during matching date windows.",
      competitorResearch: [
        "Hostelworld / Hostel Chat: Great for hostel stays, lacks structured itinerary matching.",
        "JoinMyTrip: Focused on paid group travel leaders, not spontaneous solo travelers.",
        "TripIt: Excellent itinerary aggregator, zero social/buddy discovery."
      ],
      technicalArchitecture: {
        frontend: "React / Vite / Progressive Web App (PWA)",
        backend: "Node.js Express / Python Geolocation & Recommendation Engine",
        database: "PostgreSQL / Redis for real-time location & active trip sessions",
        aiServices: "Gemini / OpenAI API for itinerary synthesis & vibe scoring"
      },
      buildPrompt: `Build a full-stack MVP for Trippy:

Core Concept: AI solo travel companion & travel buddy matcher.
Target Users: Solo travelers seeking safe companion matching and dynamic trip planning.
Key Workflows:
1. Trip Intake: Destination, dates, budget level, vibe preferences (e.g. Adventure, Foodie, Relaxed).
2. AI Itinerary Engine: Generate day-by-day plan with local hidden gems and budget breakdown.
3. Traveler Matcher: Recommend verified solo travelers visiting the same location with overlapping dates.
4. Chat & Meetup Workspace: In-app chat with safety verification and shared itinerary planning.

Tech Specs: React, Tailwind, Node.js API, PostgreSQL, Maps API integration.`
    }
  },
  {
    id: "collabkaro",
    ownerId: "user-harshita",
    ownerName: "Harshita G",
    title: "CollabKaro (Let's Collab)",
    tagline: "Creator & Brand Collaboration Management System",
    category: "Creator Economy & Marketplace",
    status: "Fully Documented / Architecture Complete",
    icon: "Users",
    summary: "CollabKaro streamlines creator-brand sponsorships by replacing manual DMs with AI campaign matching, milestone-based escrow payments, and content approval workflows.",
    targetAudience: "D2C brands, marketing agencies, micro-creators, and influencers",
    keyFeatures: [
      "AI Creator-Brand Matchmaking",
      "Milestone-based deliverable tracking & contract generator",
      "Protected payments & escrow workflow",
      "Full documentation suite (PRD, Competitor Research, Architecture, Build Plan)"
    ],
    prd: {
      overview: "CollabKaro is an end-to-end operating system for creator marketing campaigns, ensuring brands get ROI and creators get paid on time.",
      problem: "D2C brands spend 30+ hours per campaign sending cold DMs on Instagram/WhatsApp with no payment security, while creators suffer from delayed payments and ghosting.",
      solution: "A central platform providing transparent creator rate cards, contract auto-generation, AI campaign briefs, and automated milestone payouts.",
      competitorResearch: [
        "Phyllo / Aspire: Enterprise creator tools cost $1,000+/mo, excluding micro-brands.",
        "Instagram DMs / Spreadsheets: Free but zero payment security, contract management, or tracking.",
        "Upwork / Fiverr: Generalist freelance platforms lacking creator-specific deliverable workflows."
      ],
      technicalArchitecture: {
        frontend: "React / Vite / Tailwind CSS UI Studio",
        backend: "Node.js REST API / Stripe & Razorpay Escrow Integration",
        database: "PostgreSQL with Prisma ORM",
        aiServices: "AI Content Brief Generator & Creator Analytics Scraper"
      },
      buildPrompt: `Build a full-stack MVP for CollabKaro:

Core Concept: Creator & Brand Collaboration Management Marketplace.
Target Users: D2C brand marketers and content creators/influencers.
Key Workflows:
1. Brand Campaign Builder: Create campaign brief (budget, deliverable type, niche, deadlines).
2. AI Creator Matcher: Match campaign briefs with creator profiles based on audience demography.
3. Deal Workspace: Contract creation, asset upload/approval workflow, and milestone tracking.
4. Payment Escrow: Secure deposit release upon milestone approval.

Tech Specs: React, Node.js, Express, PostgreSQL, Stripe/Razorpay payments API.`
    }
  },
  {
    id: "businesspay",
    ownerId: "user-harshita",
    ownerName: "Harshita G",
    title: "BusinessPay",
    tagline: "B2B Payment Operations & Escrow Infrastructure Platform",
    category: "FinTech & B2B Payments",
    status: "Production Ready / Fully Documented",
    icon: "FolderKanban",
    summary: "BusinessPay provides automated B2B milestone escrow, invoicing, and payout management for enterprises, brands, agencies, and creator networks.",
    targetAudience: "B2B merchants, agencies, platforms, and freelance networks",
    keyFeatures: [
      "Milestone Escrow & Smart Payout Contracts",
      "Automated Invoice Generation & Tax Compliance",
      "Multi-currency Settlement & Vendor Dashboards",
      "Stripe Connect & Razorpay B2B API Integrations"
    ],
    prd: {
      overview: "BusinessPay is a modern payment operations platform designed to secure high-value B2B transactions with milestone-based escrow and real-time payout tracking.",
      problem: "Businesses lose thousands of dollars to delayed B2B payments, manual invoice tracking, and lack of milestone deposit protection.",
      solution: "A unified payment portal providing protected deposit holding, milestone verification, and instant automated vendor payouts.",
      competitorResearch: [
        "Escrow.com: Legacy design, slow verification, high fees for digital services.",
        "Stripe Invoicing: Excellent payments API, lacks milestone escrow and multi-party approval flows.",
        "Bill.com: Focused on traditional accounts payable, complex for modern digital platforms."
      ],
      technicalArchitecture: {
        frontend: "React / Vite / Tailwind CSS UI Studio",
        backend: "Node.js REST API / Stripe Connect & Webhooks Engine",
        database: "PostgreSQL with Prisma ORM",
        security: "PCI-DSS Compliant Payment Tokenization & Encryption"
      },
      buildPrompt: `Build a full-stack MVP for BusinessPay:

Core Concept: B2B Payment Operations & Escrow Infrastructure Platform.
Target Users: B2B merchants, agencies, platforms, and freelance networks.
Key Workflows:
1. Invoice & Escrow Deal Creation: Define payment milestones, deposit requirements, and completion terms.
2. Protected Deposit Vault: Buyer deposits funds into secure escrow account.
3. Deliverable Verification: Seller submits proof of work for buyer or automated AI verification.
4. Instant Payout Settlement: Funds automatically release to seller upon milestone sign-off.

Tech Specs: React, Node.js, Express, PostgreSQL, Stripe Connect API.`
    }
  }
];
