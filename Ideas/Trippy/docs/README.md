# Trippy Engineering Knowledge Base

This directory is the operating manual for the Trippy repository. It exists so that a new
engineer — human or AI — can understand, extend, and ship to this codebase without asking the
founders. Start with [`AGENTS.md`](../AGENTS.md) (the repository constitution), then come here
for depth.

## Document map

| Question | Document |
|---|---|
| What is the product, and what does it require? | [`SoloTravel_PRD.md`](../SoloTravel_PRD.md) — living PRD with versioned changelog |
| What's done, partial, or pending? | [`ROADMAP.md`](../ROADMAP.md) — live status tracker |
| How is the system put together? | [architecture.md](architecture.md) |
| What API endpoints exist and how do they behave? | [api.md](api.md) |
| What's in the database and how do migrations work? | [database.md](database.md) |
| How do login, tokens, RBAC, and audit logs work? | [auth.md](auth.md) |
| What frontend components/utilities must I reuse? | [frontend.md](frontend.md) |
| How do I run and write tests? | [testing.md](testing.md) |
| How do I run it locally / how does production deploy? | [deployment.md](deployment.md) |
| Why was X built this way? | [decision-log.md](decision-log.md) |
| Where is the product going, and where does code diverge from the PRD? | [roadmap.md](roadmap.md) |
| How will the mobile app be built? | [mobile-app.md](mobile-app.md) |
| How do I set up, branch, review, and contribute? | [`CONTRIBUTING.md`](../CONTRIBUTING.md) |
| What are the design tokens / visual rules? | [`trippy/design/design-system/`](../trippy/design/design-system/design-system.md) |
| What did the UX audits find and what shipped? | `trippy/design/{consumer-app,partner-crm,admin-console}/…-design.md` |

## Ground rules for this knowledge base

1. **Single source of truth.** Each fact lives in exactly one document; everything else links to
   it. Feature status lives in the checklist. Requirements live in the PRD. Design tokens live in
   `trippy/design/design-system/`. Don't copy — reference.
2. **Code wins.** If a document contradicts the code, the code is the truth: fix the document.
3. **Docs ship with code.** Every behaviour-changing commit updates the affected documents
   (see the covenant in [`AGENTS.md §4`](../AGENTS.md)).
4. **No ceremony.** A document exists only if it answers a real question. Improve existing
   documents instead of adding new ones; delete documents that stop earning their place.

## Intentionally *not* documented here

- **Per-screen product specs** — the PRD and the design audit status docs cover them.
- **Third-party API docs** — there are none; the platform is deliberately dependency-light.
- **A separate "AI agent guide"** — [`AGENTS.md`](../AGENTS.md) is that guide, for every vendor.
