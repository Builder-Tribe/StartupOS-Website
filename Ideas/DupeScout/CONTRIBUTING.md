# Contributing to DupeScout

This guide covers the human developer workflow. Engineering rules that govern *what* you build live
in [`AGENTS.md`](AGENTS.md) (read it first — it applies to people and AI tools alike). Deep
technical docs live in [`docs/`](docs/README.md).

---

## Setup

All source code lives in the `dupescout/` subfolder. Run everything from there unless noted.

### Prerequisites

- **Node.js 20+** — for the Next.js frontend
- **Python 3.11+** — for the FastAPI backend
- **PostgreSQL 16** with the `pgvector` extension
- **Redis 7**
- **Elasticsearch 8** (optional for keyword search in early dev)

The quickest way to get the backing services running locally is Docker:

```bash
docker run -d --name dupescout-pg \
  -e POSTGRES_USER=dupescout -e POSTGRES_PASSWORD=password -e POSTGRES_DB=dupescout \
  -p 5432:5432 ankane/pgvector

docker run -d --name dupescout-redis -p 6379:6379 redis:7-alpine

docker run -d --name dupescout-es \
  -e "discovery.type=single-node" -e "xpack.security.enabled=false" \
  -p 9200:9200 elasticsearch:8.14.0
```

### Frontend (Next.js)

```bash
cd dupescout
npm install
npm run dev          # http://localhost:3000
```

### Backend (FastAPI)

```bash
cd dupescout
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r api/requirements.txt
uvicorn api.main:app --reload --port 8000
```

API is live at **http://localhost:8000**.  
Interactive API docs (Swagger): **http://localhost:8000/api/docs**

### Environment variables

```bash
cp dupescout/.env.example dupescout/.env.local   # Next.js reads .env.local
cp dupescout/.env.example dupescout/api/.env      # FastAPI reads from working dir or env
```

Fill in real values for `ANTHROPIC_API_KEY`, `RAZORPAY_KEY_ID/SECRET`, and `SHIPROCKET_*`.
Leave `JWT_SECRET_KEY` as `changeme-...` for local dev — never commit a real secret.

---

## Git workflow

- **Small changes** (bug fixes, single-screen features) land directly on `main`.
- **Risky or multi-day work** goes on a feature branch with a PR. Never force-push `main`.
- **Sync before pushing:** `git fetch && git pull --rebase` if collaborators are active.
- **Commits:** imperative subject line (`Add seller payout endpoint`), body explains the *why*.
  One logical change per commit — docs must be in the same commit as the code they describe
  (see [AGENTS.md §4](AGENTS.md)).

---

## Definition of done

Every change must clear all of these before it is considered complete:

1. **TypeScript** — `cd dupescout && npx tsc --noEmit` exits clean.
2. **Lint** — `npm run lint` passes with no errors.
3. **Python types** — no new `Any` casts added without justification.
4. **Browser check** — UI changes verified in a browser; responsive changes also tested at ≤ 390px
   (mobile). Admin changes tested with a low-privilege account.
5. **Auth boundaries verified** — any new endpoint has its JWT realm check confirmed manually or
   via a test.
6. **Documentation updated in the same commit** — see the covenant in [AGENTS.md §4](AGENTS.md):
   `ROADMAP.md` status, and affected `docs/*` files. Skipping this makes the commit incomplete.
7. **Pushed to GitHub** — the remote is the canonical backup.

---

## Working with AI coding assistants

AI tools (Claude Code, Cursor, Copilot, Codex, …) are first-class contributors.
[`AGENTS.md`](AGENTS.md) is written for them. To get the best results:

- **Give context, not just the task.** "Read AGENTS.md and docs/api.md, then add wishlist
  endpoints to the consumer router" beats "add wishlist".
- **Scope prompts to one surface** (consumer / seller / admin / API) and name the closest
  existing feature to imitate.
- **Require the docs covenant in the prompt** (`"update ROADMAP.md and affected docs in the
  same change"`) until the tool does it unprompted.
- **Review AI diffs like any PR:** check for duplicated helpers, missing `seller_id` scoping,
  skipped permission gates, and absent audit log calls — these are where generated code most
  often drifts from the architecture.
- The Claude Code Stop hook auto-commits and pushes after every session
  (`scripts/auto-backup.sh`). Expect an `auto-backup:` commit after AI sessions.

---

## Reporting issues / decisions

- Bugs or inconsistencies you notice but don't fix: add a dated note in the relevant `docs/*`
  file — don't silently work around them.
- Any decision that shapes architecture or product direction gets a new entry in
  [`docs/decision-log.md`](docs/decision-log.md) (append-only — never edit old entries).
