# DupeScout — AI Shopping OS for Gen Z

> **"Shop the Look. Not the Markup."**

DupeScout is an AI-first visual shopping intelligence platform. Users upload a photo, screenshot, or paste any link — the AI finds visually similar products across the internet and DupeScout's own marketplace, ranked by similarity score with honest price-quality explanations.

Built for Gen Z India. Expanding to Southeast Asia.

---

## Start here

| If you are… | Read |
|---|---|
| Anyone (human or AI) about to change code | [`AGENTS.md`](AGENTS.md) — the repository constitution |
| Looking for product requirements | [`VOLUME2_Consumer_PRD.md`](VOLUME2_Consumer_PRD.md) / [`VOLUME3_Vendor_Management_System.md`](VOLUME3_Vendor_Management_System.md) / [`VOLUME4_Admin_Console_PRD.md`](VOLUME4_Admin_Console_PRD.md) |
| Looking for AI + technical design | [`VOLUME5_AI_Architecture_Technical_Design.md`](VOLUME5_AI_Architecture_Technical_Design.md) |
| Looking for market research + strategy | [`VOLUME1_Vision_Market_Research.md`](VOLUME1_Vision_Market_Research.md) |
| Looking for GTM + roadmap + investor memo | [`VOLUME6_GTM_Growth_Monetization_Roadmap.md`](VOLUME6_GTM_Growth_Monetization_Roadmap.md) |
| Checking what's built vs. pending | [`FEATURE_CHECKLIST.md`](FEATURE_CHECKLIST.md) |
| Looking for architecture + API + DB depth | [`docs/README.md`](docs/README.md) |

---

## The Platform

Three surfaces, one API:

| Surface | Path | Who it's for |
|---|---|---|
| **Consumer App** | `/` | Gen Z shoppers — visual search, AI chat, buy |
| **Seller Portal** | `/seller` | Local sellers, D2C brands, artisans — list, manage, earn |
| **Admin Console** | `/admin` | DupeScout operations team — moderate, manage, monitor |

---

## GitHub

| Repo | Purpose | Status |
|---|---|---|
| **[1997agarwal/DupeScout](https://github.com/1997agarwal/DupeScout)** | **Parent monorepo — source of truth** | Active |

**Git identity for all commits:** `Harshit Agarwal <agarwal.harshit97@gmail.com>`

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend API | Python FastAPI |
| Database | PostgreSQL 16 + pgvector |
| Search | Elasticsearch 8 |
| Cache | Redis 7 |
| Analytics | ClickHouse |
| AI — LLM | Anthropic Claude Sonnet 5 |
| AI — Vision | CLIP + fine-tuned similarity model |
| Payments | Razorpay (UPI, cards, EMI, COD) |
| Logistics | Shiprocket + Delhivery |
| Hosting | AWS ap-south-1 (Mumbai) |

---

## Repo layout

```
DupeScout/
├── AGENTS.md                        ← Repository constitution (read this first)
├── CLAUDE.md                        ← Claude Code quick facts
├── FEATURE_CHECKLIST.md             ← Live feature status tracker
├── VOLUME1_Vision_Market_Research.md
├── VOLUME2_Consumer_PRD.md
├── VOLUME3_Vendor_Management_System.md
├── VOLUME4_Admin_Console_PRD.md
├── VOLUME5_AI_Architecture_Technical_Design.md
├── VOLUME6_GTM_Growth_Monetization_Roadmap.md
├── scripts/auto-backup.sh           ← Auto-backup on every Claude session end
├── .claude/settings.json            ← Claude Code hooks
├── docs/                            ← Engineering knowledge base
├── app/                             ← Next.js application (build phase)
├── api/                             ← FastAPI backend (build phase)
├── ai/                              ← AI service modules (build phase)
└── db/                              ← Database migrations (build phase)
```

---

## What's implemented

> **Status: Blueprint complete. Development starting.**  
> See [`FEATURE_CHECKLIST.md`](FEATURE_CHECKLIST.md) for the complete feature-by-feature status.

**Blueprint (complete):**
- Volume 1: Vision, market research, customer psychology, competitor analysis
- Volume 2: Consumer PRD — visual search, AI chat, product pages, checkout, collections, outfit builder, room lens, trend feed, Pro subscription
- Volume 3: Vendor Management System — seller onboarding, AI catalog creation, inventory, orders, payouts, analytics
- Volume 4: Admin Console — seller approval, catalog moderation, fraud detection, dispute resolution, experimentation
- Volume 5: AI architecture — Visual Similarity Engine, Product DNA Engine, Conversational AI, Recommendation Engine, full DB schema, API specs
- Volume 6: GTM strategy, growth loops, monetization, roadmap, investor memo

**Development (not started):**
- All code in `app/`, `api/`, `ai/`, `db/` directories (build phase begins with Volume 2 Consumer PRD)

---

## Auto-backup

A Claude Code Stop hook automatically commits and pushes all changes to GitHub after every session. See `scripts/auto-backup.sh` and `.claude/settings.json`.
