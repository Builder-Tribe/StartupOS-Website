# AGENTS.md — How to work in this repository

> **Read this first.** This file is the constitution of the DupeScout repository. It applies to
> every engineer and every AI coding assistant (Claude Code, Cursor, Copilot, Codex, Windsurf, or
> anything that comes later). If a tool only reads one file, it should be this one.

---

## 1. What DupeScout is

DupeScout is an AI-first shopping intelligence platform for Gen Z India. Users upload a photo,
screenshot, or paste any link — the AI finds visually similar products across the internet and
DupeScout's own marketplace, ranked by similarity score with honest price-quality explanations.

**Tagline:** "Shop the Look. Not the Markup."

The platform has three surfaces backed by one API:

| Surface | Path | Code | Users |
|---|---|---|---|
| Consumer App | `/` | `dupescout/app/(consumer)/` | Gen Z shoppers |
| Seller Portal | `/seller` | `dupescout/app/seller/` | Local sellers, D2C brands, artisans |
| Admin Console | `/admin` | `dupescout/app/admin/` | DupeScout operations team |

- **Vision & requirements:** The 6-volume [Founder Blueprint](VOLUME1_Vision_Market_Research.md) is the product authority.
- **Implementation status:** [`FEATURE_CHECKLIST.md`](FEATURE_CHECKLIST.md) — live done/pending tracker. Update it with every feature shipped.
- **Deep documentation:** [`docs/`](docs/README.md) — architecture, API, database, decisions.
- **Rule of interpretation:** the *implementation is the current truth*; the Blueprint is the intended
  vision. Where they differ, document the divergence in [`docs/decision-log.md`](docs/decision-log.md) — never silently "fix" code to match the spec without an explicit request.

---

## 2. The stack (do not replace without explicit approval)

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | Next.js 14 + TypeScript + Tailwind CSS | App Router; SSR for SEO |
| **Backend API** | Python FastAPI | Async; best AI/ML ecosystem |
| **Primary Database** | PostgreSQL 16 + pgvector extension | Transactions + vector search |
| **Full-text Search** | Elasticsearch 8 | Keyword + hybrid search |
| **Cache** | Redis 7 | Sessions, rate limiting, API response cache |
| **Analytics DB** | ClickHouse | Append-only event store |
| **Event Bus** | Apache Kafka | Async event streaming |
| **Object Storage** | AWS S3 / Cloudflare R2 | Product images, documents |
| **AI — LLM** | Anthropic Claude Sonnet 5 (via API) | Conversational AI, catalog generation |
| **AI — Vision** | CLIP + custom fine-tuned model | Visual similarity engine |
| **Mobile** | React Native | iOS + Android (Phase 2) |
| **Payments** | Razorpay | UPI, cards, EMI |
| **Logistics** | Shiprocket + Delhivery | Carrier aggregation |
| **Auth** | JWT (RS256) | Separate token realms: consumer / seller / admin |
| **Hosting** | AWS ap-south-1 (Mumbai) | All data stays in India (DPDP compliance) |

Everything above is a deliberate decision with a documented rationale in
[`docs/decision-log.md`](docs/decision-log.md). **Do not introduce stack replacements as a side
effect of another task** — propose the change explicitly and let the human decide.

---

## 3. Non-negotiable rules

1. **Analyze before coding.** Read the relevant files and matching docs before writing anything.
   The codebase solves most cross-cutting problems (auth, pagination, error handling, AI tool use)
   — find the existing solution before creating a new one.

2. **Reuse before generating.** Check [`docs/frontend.md`](docs/frontend.md) and
   [`docs/api.md`](docs/api.md) for existing components, hooks, and endpoints. Creating a parallel
   implementation of an existing helper is a defect, even if it works.

3. **Modify, don't rewrite.** Extend existing files and patterns. Never regenerate a working file
   from scratch when an edit will do.

4. **Preserve the architecture.**
   - Consumer pages → `dupescout/app/(consumer)/`
   - Seller pages → `dupescout/app/seller/`
   - Admin pages → `dupescout/app/admin/`
   - Shared components → `dupescout/components/`
   - API routes → `dupescout/api/routes/`
   - AI services → `dupescout/api/services/`
   - Database migrations → `dupescout/db/migrations/`

5. **Server-side enforcement is the security boundary.** Every admin endpoint requires admin JWT.
   Every seller endpoint scopes queries by `seller_id`. Every consumer endpoint requires consumer
   auth. Never expose sensitive fields (password hashes, raw bank details, admin tokens) in API responses.

6. **Audit everything administrative.** Any admin action that changes platform state must be logged
   to the audit table. Audit logs are immutable — no update or delete paths, ever.

7. **Trust & Safety is non-negotiable.** Never ship a change that weakens:
   - Counterfeit product detection
   - Seller identity verification
   - Review authenticity checks
   - Fraud detection signals
   A platform that lets through one well-publicised counterfeit can lose years of brand equity.

8. **Similarity scores must be honest.** Never inflate similarity scores to improve conversion.
   Show 62% as 62%. The AI explanation must accurately describe what is different between products.
   This is a core trust contract with users.

9. **No ads in organic search results.** Sponsored listings are always clearly labeled and kept in
   a separate `sponsored` section. Mixing paid and organic search results is permanently forbidden —
   it is the single fastest way to destroy user trust.

10. **Verify before declaring done.** Every feature or fix MUST undergo a mandatory 3-step verification before committing, pushing, or declaring done:
    - **Backend check:** Run `python3 -m py_compile` on all modified Python files to ensure 0 syntax errors.
    - **Frontend check:** Run `npx tsc --noEmit` inside `dupescout/` to ensure 0 TypeScript compilation errors.
    - **Live browser flow:** Verify the full user interaction flow in a live browser. A change that compiles but breaks a user flow is NOT done.

---

## 4. Documentation covenant

**Every change that alters scope, behaviour, API, schema, or architecture must update
documentation in the same commit set.**

| You changed… | You must update… |
|---|---|
| Product features / scope | [`FEATURE_CHECKLIST.md`](FEATURE_CHECKLIST.md) (status rows) |
| API endpoints | [`docs/api.md`](docs/api.md) |
| Database schema | [`docs/database.md`](docs/database.md) |
| Auth / permissions | [`docs/auth.md`](docs/auth.md) |
| Shared components / utilities | [`docs/frontend.md`](docs/frontend.md) reuse catalogue |
| Architecture / stack decisions | [`docs/decision-log.md`](docs/decision-log.md) (new entry; never edit old ones) |
| AI model or prompt changes | [`docs/ai.md`](docs/ai.md) |
| Anything user-visible | Root `README.md` if the "What's implemented" section is affected |

A commit that changes behaviour without touching relevant docs is incomplete.

---

## 5. Never do (without explicit human instruction)

- Never commit `.env` files, secrets, API keys, or database credentials.
- Never expose seller bank account details, buyer phone numbers, or admin tokens in API responses.
- Never delete or mutate audit-log rows.
- Never change the git remote.
- Never weaken seller `seller_id` scoping in API routes.
- Never inflate similarity scores or AI confidence values.
- Never mix sponsored results into organic search rankings.
- Never approve a seller application programmatically without the documented verification checks.
- Never add npm/pip dependencies casually — the stack is intentionally controlled; every new
  package needs an explicit reason it is better than the existing solution.
- Never run destructive database migrations without explicit consent and a confirmed backup.

---

## 6. How to add a feature (the golden path)

1. **Check the checklist** ([`FEATURE_CHECKLIST.md`](FEATURE_CHECKLIST.md)) to confirm the feature is scoped and prioritised.
2. **Read the Blueprint** — the relevant section of Volume 2, 3, 4, or 5 describes the exact requirements.
3. **Design the API first** — define the endpoint shape, auth requirement, and response schema before writing any frontend.
4. **Build the data layer** — write the migration, then the repository function, then the API route.
5. **Build the UI** — use existing components from the reuse catalogue; never hard-code colors (use Tailwind tokens from the design system).
6. **Write or extend tests** — auth boundaries, seller isolation, and admin permission gates are the highest-value test assertions.
7. **Update docs** per §4. **Verify** per §3.10. Commit with a descriptive message.
8. **Update the checklist** — mark the feature as complete and push.

---

## 7. AI-specific rules

- The Visual Similarity Engine's similarity scores come from the AI model — never override or adjust
  them manually in the application layer to improve conversion metrics.
- Every AI-generated product listing (title, description, tags) must be reviewed by the seller
  before going live. The AI is an assistant, not an autonomous publisher.
- The Conversational AI (Claude) must use only real, in-stock products from the DupeScout catalog
  as tool results. Never fabricate product specifications or prices.
- AI moderation decisions (approve/reject/flag) are advisory. Human review is required for:
  - Any seller suspension or ban
  - Any listing flagged as potential counterfeit (confidence > 70%)
  - Any dispute resolution
- Prompt changes to the Conversational AI system prompt must be documented in [`docs/ai.md`](docs/ai.md)
  and treated as code changes — version controlled, reviewed, tested.

---

## 8. Repository map

```
DupeScout/                          ← git root → github.com/1997agarwal/DupeScout
├── AGENTS.md                       ← you are here (the constitution)
├── CLAUDE.md                       ← thin pointer for Claude Code sessions
├── README.md                       ← product summary, quickstart, what's implemented
├── ROADMAP.md                      ← live feature status tracker
├── FEATURE_CHECKLIST.md            ← feature completion checklist
├── VOLUME1_Vision_Market_Research.md
├── VOLUME2_Consumer_PRD.md         ← consumer product requirements (source of truth)
├── VOLUME3_Vendor_Management_System.md
├── VOLUME4_Admin_Console_PRD.md
├── VOLUME5_AI_Architecture_Technical_Design.md
├── VOLUME6_GTM_Growth_Monetization_Roadmap.md
├── scripts/
│   └── auto-backup.sh              ← Stop hook: commit + push on every Claude session end
├── .claude/
│   └── settings.json               ← Claude Code hooks (Stop → auto-backup)
├── docs/                           ← engineering knowledge base
│   ├── README.md
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   ├── auth.md
│   ├── frontend.md
│   ├── ai.md
│   └── decision-log.md
└── dupescout/                      ← all source code lives here
    ├── app/                        ← Next.js application
    │   ├── (consumer)/             ← consumer-facing pages (home, search, product, cart, orders)
    │   ├── (focused)/              ← focused flows with no nav (checkout, login)
    │   ├── seller/                 ← seller portal (dashboard, products, orders, payouts)
    │   └── admin/                  ← admin console (overview, catalog, sellers, finance)
    ├── components/                 ← shared React components
    │   ├── layout/                 ← nav, header, footer
    │   ├── search/                 ← search bar, product cards, similarity score
    │   ├── product/                ← image gallery, variant selector, seller card
    │   ├── seller/                 ← seller nav
    │   ├── admin/                  ← admin nav
    │   └── ui/                     ← primitive UI components (button, badge)
    ├── lib/                        ← frontend utilities, types, store, hooks
    ├── api/                        ← FastAPI backend
    │   ├── main.py                 ← app entry point
    │   ├── routes/                 ← route handlers per domain
    │   ├── services/               ← AI services, payment, logistics
    │   └── lib/                    ← auth, database, response helpers
    ├── db/                         ← database migrations
    │   └── migrations/
    ├── next.config.js
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── package.json
```

---

## 9. GitHub organisation structure

All repos live under **[Trend-Tribe](https://github.com/Trend-Tribe)** (org owner: `1997agarwal`, `harshitag@tekion.com`). All repos are private.

| Repo | Role |
|---|---|
| **Trend-Tribe/DupeScout** | **Parent monorepo — single source of truth.** Contains every surface: Next.js frontend, FastAPI backend, DB migrations, and all docs. |
| Trend-Tribe/dupescout-mobile | React Native iOS + Android app (planned — Phase 2). |
| Trend-Tribe/dupescout-website | Marketing/landing website for independent deployment (planned). |
| Trend-Tribe/dupescout-data | ML training pipelines, CLIP fine-tuning, product catalog aggregation (planned). |
| Trend-Tribe/dupescout-infra | Terraform, AWS infra-as-code, CI/CD, Docker configs (planned). |

**Satellite repo rule:** `Trend-Tribe/DupeScout` always contains the authoritative code. Satellite repos are activated when a segment needs independent deployment or a separate team. Code added to a satellite must be back-ported to `DupeScout` — never the other way round.

**Git remote:** `https://github.com/Trend-Tribe/DupeScout.git`. Do not change this remote.

---

## 10. Working agreements for AI assistants

- Prefer **small, focused diffs** over broad speculative refactors.
- When a task is ambiguous, state your interpretation and proceed on the smallest reasonable scope;
  list bigger options for the human to choose.
- When you find a bug outside your task, report it — don't silently fix unrelated code.
- When implementation and documentation disagree, trust the code, then fix the documentation.
- Match the surrounding code style exactly: consistent naming conventions, minimal comments (only
  for non-obvious constraints), no commented-out dead code.
- Leave the repository better documented than you found it — but never duplicate content across
  documents; link to the single source of truth.
- After completing any substantive task, update [`FEATURE_CHECKLIST.md`](FEATURE_CHECKLIST.md) and
  commit the change together with the code.
