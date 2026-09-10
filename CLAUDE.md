# CLAUDE.md

Read [`AGENTS.md`](AGENTS.md) — it is the constitution of this repository and applies in full to
Claude Code, AntiGravity, and all AI tools.

Quick operational facts for StartupOS sessions:

- **Stack:** React 18, Vite 6, Tailwind CSS 4, Node.js (`server.mjs`).
- **Dev Servers:**
  - Frontend: `npm run dev` (Vite dev server)
  - Backend API: `npm run server` (Node.js API, port 8081)
  - Full start: `node server.mjs`
- **Verification Bar:**
  - Build check: `npm run build` must complete cleanly without syntax errors.
  - Browser-check UI flows and responsive cards before finishing.
- **Documentation Covenant:**
  - `ROADMAP.md` is the single source of truth for feature delivery.
  - When starting, progressing, or completing features in Launchpad, Blueprint Studio, IdeaLab, or LMS Hub, update `ROADMAP.md` in the same changeset.
- **Isolation Rule (AGENTS.md §2):**
  - StartupOS is an independent platform. Never modify individual project repositories or nested `Ideas/*` folders without explicit, written confirmation.
- **Git Identity & Remote:**
  - Identity: `Harshit Agarwal <agarwal.harshit97@gmail.com>`
  - GitHub Remote: `https://github.com/Builder-Tribe/StartupOS.git`
  - All changes land on `main` via clean, conventional commits (`feat:`, `fix:`, `docs:`, `chore:`).
