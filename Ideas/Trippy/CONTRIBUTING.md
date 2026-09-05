# Contributing to Trippy

This guide covers the human workflow. The engineering rules that govern *what* you build live in
[`AGENTS.md`](AGENTS.md) (read it first — it applies to people, not just AI tools). Deep technical
docs live in [`docs/`](docs/README.md).

## Setup

```bash
cd trippy
npm install          # Node 22+ required (node:sqlite)
npm run dev          # server :4000, web :5173, website :5174
```

Demo logins are in the [README](README.md). The DB auto-seeds on first boot.
Machine-specific notes (founder's laptop): Node lives at
`~/.local/node/node-v22.17.0-darwin-arm64/bin` (export onto PATH), and if `npmjs.org` is blocked
use `npm install --registry=https://registry.npmmirror.com`.

## Workflow

- **Branch:** small changes land on `main`; anything risky or multi-day goes on a feature branch
  with a PR. Never force-push or rewrite history on `main`.
- **Sync before pushing:** collaborators and web-UI uploads land on `main` too —
  `git fetch` → `git pull --rebase` → push.
- **Commits:** imperative summary line; body explains the why. One logical change per commit,
  docs included (see below).
- **The dev database is not disposable** — it can hold real accounts. Never run
  `npm run reset-db` or delete `trippy/server/data/` without asking.

## Definition of done (every change)

1. `npx tsc --noEmit` clean in `trippy/web` and `trippy/server`.
2. `npm test -w server` — all tests pass; new server behaviour has new tests
   (see [docs/testing.md](docs/testing.md) for patterns).
3. UI changes exercised in the browser (consumer changes also at ≤760px; admin changes also with
   a low-privilege demo admin).
4. **Documentation updated in the same commit** per the covenant in [`AGENTS.md §4`](AGENTS.md):
   PRD changelog + sections for scope changes, `ROADMAP.md` status rows
   (+ recomputed Summary), and the affected `docs/*` files.
5. Pushed to GitHub (the repo is the canonical backup).

## Working with AI coding assistants

AI tools (Claude Code, Cursor, Copilot, Codex, Windsurf, …) are first-class contributors here,
and [`AGENTS.md`](AGENTS.md) is written for them. To get good results:

- **Point them at context, not just the task:** "Read AGENTS.md and docs/api.md, then add X to
  the partner router" beats "add X".
- **Scope prompts to a surface** (consumer / partner / admin / server) and name the files or the
  closest existing feature to imitate.
- **Ask for non-breaking, incremental changes** explicitly when touching live flows.
- **Require the docs covenant in the prompt** ("update the PRD changelog, checklist, and affected
  docs in the same change") until the tool does it unprompted.
- Review AI diffs like any other PR: check reuse (did it duplicate an existing helper?),
  permission gates, org scoping, and audit calls — these are where generated code most often
  drifts from the architecture.

## Reporting issues / decisions

- Bugs or architectural inconsistencies you notice but don't fix: leave a dated note in the
  relevant `docs/*` file or open an issue — don't silently work around them.
- Any decision that shapes architecture or product direction gets an entry in
  [docs/decision-log.md](docs/decision-log.md) (append-only).
