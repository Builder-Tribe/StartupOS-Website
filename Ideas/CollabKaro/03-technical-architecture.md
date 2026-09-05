# CollabKaro — Technical Architecture and Delivery Specification

**Idea Builder workspace:** `CollabKaro`

## 1. Required architecture

Build a modular monolith first: one deployable web/API application with explicitly separated domain modules and background workers. It is simpler for Replit development and can later split into services without rewriting the product.

### Recommended stack

- **Frontend:** React + TypeScript + Vite; Tailwind CSS + accessible component primitives; TanStack Query; React Hook Form + Zod.
- **Backend:** Node.js + TypeScript + Express or Fastify; REST API under `/api/v1`; WebSocket/SSE for chat and notifications.
- **Database:** PostgreSQL (Replit Database/Neon for development and production); Drizzle ORM or Prisma with migrations.
- **Search:** PostgreSQL full text/filtering in MVP; PostgreSQL `pgvector` for similarity later; dedicated OpenSearch only when scale justifies it.
- **Cache/jobs:** Redis-compatible queue in production for email, metrics sync, video processing and payment retry. For initial Replit beta, use a durable database job table with worker process if Redis is unavailable.
- **File storage:** S3-compatible object storage, with signed uploads/downloads. Do not store large files in the application filesystem.
- **Observability:** structured logs, error tracking, uptime probe, health endpoint, audit logs and metrics.

## 2. Domain modules

`auth`, `organizations`, `creators`, `brands`, `social-accounts`, `discovery`, `campaigns`, `applications`, `deals`, `contracts`, `messaging`, `assets`, `deliverables`, `payments`, `payouts`, `invoices`, `affiliate`, `analytics`, `offline-events`, `notifications`, `reviews`, `disputes`, `moderation`, `admin`, `audit`.

Every module must have route handlers, server-side authorization, validation schemas, service layer, database repository and tests.

## 3. Minimum database model

Use UUID primary keys, `created_at`, `updated_at`, soft-delete where business retention requires it, and organization/workspace scoping.

Core tables: `users`, `sessions`, `organizations`, `organization_members`, `roles`, `creator_profiles`, `brand_profiles`, `agency_profiles`, `social_accounts`, `creator_metrics_snapshots`, `portfolios`, `service_packages`, `rate_cards`, `media_kit_links`, `campaigns`, `campaign_eligibility_rules`, `campaign_assets`, `campaign_invites`, `applications`, `creator_lists`, `creator_list_items`, `deals`, `deal_term_versions`, `deal_milestones`, `contracts`, `contract_signatures`, `messages`, `attachments`, `deliverables`, `deliverable_versions`, `content_comments`, `usage_rights`, `payment_intents`, `ledger_entries`, `payouts`, `invoices`, `tax_documents`, `refunds`, `disputes`, `reviews`, `offline_events`, `event_checkins`, `tracking_links`, `promo_codes`, `attribution_events`, `notifications`, `support_tickets`, `fraud_flags`, `admin_actions`, `audit_logs`, `outreach_leads`, `outreach_activities`, `jobs`.

Required constraints: unique organization membership; campaign workspace ownership; deal links one campaign/application or direct offer; monotonically increasing term version per deal; one active payout per milestone; immutable balanced ledger entries; idempotency key unique per payment-provider event; one review per rater/subject/deal.

## 4. API contract requirements

Use OpenAPI documentation generated from route schemas. All non-public routes require session authentication and server-side authorization.

Key endpoint groups:

- `/auth/*`: sign-up, sign-in, OTP, password reset, logout, MFA.
- `/me`, `/organizations`, `/members`, `/roles`.
- `/creators`, `/creator-profiles`, `/media-kits`, `/services`, `/portfolios`, `/social-accounts`.
- `/discovery/creators`, `/creator-lists`, `/recommendations`.
- `/campaigns`, `/campaigns/:id/publish`, `/campaigns/:id/applications`, `/campaigns/:id/invites`.
- `/applications`, `/deals`, `/deals/:id/offers`, `/deals/:id/terms`, `/deals/:id/contract`.
- `/deals/:id/messages`, `/assets`, `/deliverables`, `/comments`, `/usage-rights`.
- `/payments`, `/payment-webhooks`, `/payouts`, `/invoices`, `/refunds`.
- `/analytics`, `/tracking-links`, `/promo-codes`, `/offline-events`, `/checkins`.
- `/admin/*`, `/disputes`, `/support`, `/audit-logs`.

All list endpoints use cursor pagination, stable sorting and input validation. Do not expose a raw database query endpoint.

## 5. State machines

### Campaign
`draft → pending_review → published → paused → closed → archived`; cancellation allowed after publication with policy checks.

### Application
`draft → submitted → shortlisted → interview → offer_sent → accepted | rejected | withdrawn | expired`.

### Deal
`draft → proposed → negotiating → accepted → contract_pending → funded → active → delivery_review → completed`; alternate states `cancelled`, `disputed`, `expired`.

### Deliverable
`not_started → in_progress → submitted → changes_requested → approved → scheduled → published`; alternates `rejected`, `overdue`.

### Payment milestone
`unfunded → payment_pending → funded → eligible_for_release → payout_pending → paid`; alternates `failed`, `held_for_dispute`, `refunded`.

No state transition may be client-only; transition server enforces actor role, predecessor state, audit entry and notifications.

## 6. External integration boundaries

Use provider adapter interfaces. No provider implementation should leak across domain logic.

- `PaymentProvider`: create checkout, verify webhook, create recipient, payout, refund, transaction lookup.
- `SignatureProvider`: create envelope, get status, webhook validation.
- `SocialProvider`: OAuth, account metadata, permitted metrics, disconnect, webhook.
- `StorageProvider`: signed upload/download, delete, scan status.
- `EmailProvider`, `SmsProvider`, `WhatsAppProvider`, `KycProvider`, `CourierProvider`, `EcommerceProvider`.

Use sandbox/test credentials in development. Webhook handlers need signature verification, event store, idempotency, retry-safe processing and alerting on failures.

## 7. Security and compliance requirements

- OWASP-aligned validation, output encoding, CSRF/XSS protections, secure cookies, HTTPS and rate limiting.
- Hash passwords with Argon2/bcrypt; never log passwords, tokens, PAN, bank account data or full KYC documents.
- Encrypt sensitive values at rest when database/provider does not do it; signed URLs expire quickly.
- Every resource query must apply workspace/organization scope in the repository layer.
- RBAC permissions enforced on API, not only UI.
- Audit: actor, action, target, before/after safe diff, timestamp, request id and IP/device metadata where lawful.
- Daily backups, migration rollback plan, incident runbook and retention/deletion policy.
- Payment gateway handles cards; application only stores provider references.
- Obtain legal, tax and payment-provider review before launch in India, especially marketplace fund flow, GST/TDS, KYC and data handling.

## 8. Replit deployment design

Use a **full-stack Autoscale or Reserved VM deployment**, not Static Deployment, because the product has authentication, API routes, database calls, webhooks and background work. Replit’s documentation explicitly notes that server-side applications are unsuitable for Static Deployments. Use Replit Database/managed Postgres and object storage; production app filesystem is not durable.

Environment variables (stored as Replit Secrets; never commit):

`DATABASE_URL`, `SESSION_SECRET`, `APP_BASE_URL`, `STORAGE_*`, `PAYMENT_*`, `SIGNATURE_*`, `EMAIL_*`, `SMS_*`, `WHATSAPP_*`, `META_*`, `YOUTUBE_*`, `SENTRY_DSN`, `ADMIN_BOOTSTRAP_EMAIL`.

Implement `/healthz` and `/readyz`; listen on `0.0.0.0` and configured `PORT`; keep server process long-running; separate scheduled/worker tasks from HTTP handler when possible.

## 9. Quality gates

- Typecheck, lint, unit tests, integration tests and production build on every change.
- Tests for role boundaries, state transitions, payment webhook idempotency, ledger balance, refund/dispute payout block, and workspace isolation.
- Seed script creates demo brand, agency, creator, campaign, application, deal and content review without production secrets.
- E2E test: sign up → campaign → application → negotiated deal → funded test payment → draft/revision → approval → simulated payout → report.
- No action labelled complete until it passes UI and server tests.
