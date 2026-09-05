# DupeScout — Engineering Knowledge Base

> This directory is the living engineering reference. Product requirements live in the Volume docs at the repo root. This directory is for implementation-level decisions that engineers and AI assistants need to build confidently.

---

## Index

| Document | What it covers |
|----------|---------------|
| [architecture.md](architecture.md) | System architecture — services, data flow, deployment topology |
| [decision-log.md](decision-log.md) | Stack and design decisions — immutable record, newest first |
| [api.md](api.md) | API conventions, envelope format, auth headers, pagination |
| [database.md](database.md) | Schema reference, migration conventions, pgvector index guide |
| [auth.md](auth.md) | JWT realms, token lifecycle, permission matrix |
| [frontend.md](frontend.md) | Component reuse catalogue, design system tokens, routing |
| [ai.md](ai.md) | AI service contracts, prompt versions, similarity engine details |
| [testing.md](testing.md) | Test strategy, verification bar, high-value test targets |
| [deployment.md](deployment.md) | Environment config, CI/CD, Docker, AWS infrastructure |

---

## How to use this directory

**Before building a feature:** Read the relevant doc(s) above so you don't reinvent something that already exists.

**After building a feature:** Update the relevant doc(s) and `FEATURE_CHECKLIST.md` in the same commit.

**When you make a technology decision:** Add an entry to `decision-log.md`. Never edit old entries.

---

## Key constraints (repeat from AGENTS.md)

- All infrastructure must run in **AWS ap-south-1 (Mumbai)** — India data residency is mandatory.
- **Similarity scores are never inflated** — the AI model score is the displayed score.
- **No ads in organic search** — sponsored and organic results are permanently separated.
- **Trust & Safety checks are non-negotiable** — never weaken counterfeit detection or seller verification.

---

*Files in this directory are created as each layer is built. Stubs above will be populated during the build phase.*
