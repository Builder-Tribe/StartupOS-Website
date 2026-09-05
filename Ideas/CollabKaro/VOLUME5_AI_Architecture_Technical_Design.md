# Volume 5: AI Architecture & Technical Design — CollabKaro

## 1. System Architecture
```
[ React 18 SPA Frontend ]
          │ (REST API)
          ▼
[ Express API Server (server/index.js) ]
   ├── Creator Search & Matching Engine
   ├── Escrow & Milestone Manager
   └── Verification Service
          │ (Parameterized SQL)
          ▼
[ SQLite Database (data/collabkaro.db) ]
```

## 2. Database Schema
- `users`: id, name, email, role (brand, creator, admin), avatar, verified.
- `creators`: id, user_id, niche, bio, instagram_handle, followers, engagement_rate, rate_per_reel, city.
- `campaigns`: id, brand_id, title, category, budget, deliverable_type, status, created_at.
- `proposals`: id, campaign_id, creator_id, pitch, price_quote, status.
- `milestones`: id, proposal_id, title, amount, status (pending, funded, submitted, approved, paid).
- `audit_logs`: id, actor_id, action, details, timestamp.
