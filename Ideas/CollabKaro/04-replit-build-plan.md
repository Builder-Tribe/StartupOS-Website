# Replit Agent Build Plan — CollabKaro

**Idea Builder workspace:** `CollabKaro`

## How to use this file

Create one Replit project and upload/copy the `docs/` directory into its repository before starting. Ask Replit Agent to read every file under `docs/` before it plans or writes code. Build in phases and make a Replit Checkpoint after every passing phase. Replit’s official guidance recommends specific, staged requests, preview/testing, and checkpoints; this plan follows that approach. [Build with Agent](https://docs.replit.com/learn/build-with-agent)

## Initial prompt for Replit Agent

```text
You are building CollabKaro, a production-grade, full-stack marketplace and operating system for brands and content creators. Read every Markdown file under /docs before doing anything else. Treat docs/01-master-prd.md as the source of truth, docs/02-competitor-research.md as mandatory feature coverage, docs/03-technical-architecture.md as the implementation contract, and this file as the execution plan.

Do not build a mockup or front-end-only prototype. Create a working React + TypeScript frontend, Node + TypeScript backend API, PostgreSQL schema/migrations, persistent storage adapter, authentication, RBAC, real server-side validation, test suite, seed data, OpenAPI documentation and deployment configuration. Use a modular monolith. Start by presenting a phase-by-phase plan and an assumptions list. Do not implement payments, e-signatures, KYC, or social APIs with production calls until their secrets and sandbox credentials exist; create provider adapters and safe sandbox/mock implementations behind environment flags. Never use hard-coded secrets or fabricate third-party data.
```

## Phase 0 — foundation

**Ask Agent:**

```text
Implement Phase 0 only. Scaffold the TypeScript full-stack app and modular directory structure specified in docs/03-technical-architecture.md. Provision Postgres, add migrations and seeds, configure lint/typecheck/test/build scripts, create health endpoints, structured logging, error boundaries, environment validation, base design system and public marketing shell. Add a README describing local/Replit run commands. Do not build product screens beyond app shell. Run all checks and report files changed plus assumptions.
```

**Accept only if:** development starts, production build passes, database migration/seed passes, `/healthz` works and no secrets are committed.

## Phase 1 — identity, organizations and profiles

**Ask Agent:**

```text
Implement Phase 1 only from the PRD: authentication, sessions, role-based organizations/workspaces, brand onboarding, creator onboarding, creator profile, portfolio, service packages, rate cards, availability, and shareable media kit. Implement server authorization for every protected endpoint and responsive UI for creator and brand onboarding/dashboard. Use seeded demo users. Add integration tests proving one organization cannot read another organization's private data.
```

## Phase 2 — discovery, campaigns and applications

**Ask Agent:**

```text
Implement Phase 2 only: persistent creator search/filter/sort/pagination, saved lists, campaign draft/publish workflow, campaign assets, public campaign page, creator opportunity feed, application/pitch flow, brand applicant pipeline and direct creator offer. Enforce campaign/application state transitions server-side. Build empty/loading/error states and test the end-to-end path using seeded data.
```

## Phase 3 — deal room, terms, contracts and content

**Ask Agent:**

```text
Implement Phase 3 only: deal room, real-time or polling chat, versioned offers and terms, milestones, contract-template data model and sandbox signature-provider adapter, asset library, deliverables, versioned draft upload metadata, comments, revision workflow, approvals, content calendar and usage-rights ledger. Do not claim that a contract is legally signed without a configured signature provider. Add authorization and state-machine tests.
```

## Phase 4 — payments, payout, invoice, dispute and admin

**Ask Agent:**

```text
Implement Phase 4 only: provider-agnostic payment and payout adapters, sandbox checkout/webhook flow, immutable ledger, milestone release server checks, invoices, GST/TDS fields, refunds, disputes, payment holds, creator earnings dashboard, and admin review queues. Use protected milestone payment wording, not escrow. Implement webhook idempotency and tests that a payout cannot be released for a disputed or unfunded deal.
```

## Phase 5 — analytics, offline, quality and production readiness

**Ask Agent:**

```text
Implement Phase 5 only: analytics source/provenance model and dashboards, trackable links/codes data model, offline campaign/event and QR/OTP check-in, reviews, notifications, audit-log viewer, support tickets, content moderation flags, production error monitoring adapter, rate limits, backup/runbook documentation and end-to-end tests. Clearly label mock versus provider-verified metrics. Complete a security and accessibility pass.
```

## Phase 6 — integrations and intelligent features

Only start after MVP has passed manual testing and provider credentials/agreements are available. Implement official OAuth/API integrations, payment gateway production adapter, e-signature, communications, ecommerce/affiliate, shipping, permitted social metrics, AI recommendations and other Phase 2 features one integration at a time.

## Release prompt

```text
Prepare CollabKaro for production release. Audit every requirement in docs/01-master-prd.md and docs/03-technical-architecture.md. Produce a requirements traceability table marking implemented, partially implemented, deferred, or blocked by credentials/legal review. Run migrations, seeds, tests, typecheck, lint and production build. Verify the app listens on 0.0.0.0 using the configured port, has health/readiness endpoints, and documents all required Replit Secrets. Do not mark external integrations as live unless a verified sandbox/production test succeeded. Then give me a concise production deployment checklist.
```

## Replit publishing checklist

- Use Autoscale or Reserved VM deployment; do not use Static Deployment.
- Set production Secrets separately from development values.
- Use Replit Database/managed Postgres and object storage, not the deployment filesystem for user files.
- Configure custom domain, HTTPS, health checks and error monitoring.
- Execute migrations using a reviewed release step; take backup before schema changes.
- Verify payment and webhook callback URLs use the production domain.
- Run the full end-to-end test on the published URL.

Replit references: [Secrets](https://docs.replit.com/core-concepts/project-editor/app-setup/secrets), [Publishing](https://docs.replit.com/learn/projects-and-artifacts/replit-deployments), [Database](https://docs.replit.com/build/add-database).
