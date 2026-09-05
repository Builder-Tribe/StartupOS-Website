# CLAUDE.md

Read [`AGENTS.md`](AGENTS.md) — it is the constitution of this repository and applies in full to
Claude Code. Deep documentation index: [`docs/README.md`](docs/README.md).

Repo-specific quick facts for Claude Code sessions:

- **What we're building:** DupeScout — AI Shopping OS for Gen Z India. Tagline: "Shop the Look. Not the Markup."
- **Blueprint:** All product requirements are in the 6-volume Founder Blueprint (`VOLUME1_` through `VOLUME6_`). Read the relevant volume before building any feature.
- **Roadmap & feature status:** [`ROADMAP.md`](ROADMAP.md) is the single source of truth for feature status. **Agents must update ROADMAP.md in the same commit as any code change that: (a) completes a feature (change status to ✅ Done), (b) starts work on a new feature (change status to 🔄 In Progress), or (c) changes the scope or priority of any item.** Never leave ROADMAP.md out of sync with the codebase.
- **Code location:** All source code lives in [`dupescout/`](dupescout/) — Next.js frontend (`dupescout/app/`, `dupescout/components/`, `dupescout/lib/`), FastAPI backend (`dupescout/api/`), and DB migrations (`dupescout/db/`). Run `npm install` inside `dupescout/` before starting the dev server.
- **Dev servers** are defined in `.claude/launch.json` (`dupescout-web :3000`, `dupescout-api :8000`) — prefer the preview tools over raw shell commands.
- **Verification bar before finishing:** `npx tsc --noEmit` (frontend) + `npm run lint` + browser-check UI changes.
- **Tech stack:** Next.js 14 + FastAPI (Python) + PostgreSQL/pgvector + Redis + Elasticsearch + Anthropic Claude Sonnet 5. Full stack documented in `AGENTS.md §2` and [`docs/architecture.md`](docs/architecture.md).
- **Git remote:** `https://github.com/1997agarwal/DupeScout.git` — do not change it.
- **Auto-backup:** A Stop hook in `.claude/settings.json` runs `scripts/auto-backup.sh` after every session — commits and pushes all changes automatically.
- **Documentation covenant** (AGENTS.md §4) is mandatory: `ROADMAP.md` + affected `docs/*` must be updated in the same commit as code changes.
- **Trust & Safety is non-negotiable:** never weaken counterfeit detection, seller verification, or review authenticity checks.
- **Similarity scores are sacred:** never inflate them. Show the real score. The AI explanation must be honest about differences.
- **No ads in organic search:** sponsored content is always clearly labeled and separated from organic results. This is a hard, permanent rule.
- **India data residency:** all infrastructure runs in AWS ap-south-1 (Mumbai). Never route user data outside India.
