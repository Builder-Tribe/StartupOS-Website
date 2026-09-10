# Contributing to StartupOS

This guide covers the human and AI workflow. The engineering constitution that governs architecture and boundaries lives in [`AGENTS.md`](AGENTS.md).

## Setup & Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run backend server (Port 8081)
npm run server

# 3. In another terminal, run frontend
npm run dev
```

The server stores launches, upvotes, and idea drafts in persistent storage. Never delete persistent data stores without explicit consent.

## Git & PR Workflow

- **Branch Strategy:** Small, verified changes land directly on `main`. Risky or multi-day refactors go on feature branches with pull requests.
- **Conventional Commits:**
  - `feat:` for new capabilities (Launchpad filters, IdeaLab validation, LMS modules)
  - `fix:` for bug fixes
  - `docs:` for documentation updates
  - `chore:` for dependencies, formatting, and housekeeping
- **Pre-Commit Verification:** Always run `npm run build` locally before pushing to `main`.
- **4-File Parity Covenant:** Update `ROADMAP.md` in the same commit whenever feature milestones change.

## Entity Isolation Rule

StartupOS is the universal platform. Do **NOT** edit, modify, or commit files into individual project repositories or nested `Ideas/*` folders from StartupOS sessions. Each commercial venture (`Trippy`, `DupeScout`, `BusinessPay`, `CollabKaro`) operates as an independent, isolated monorepo under its respective GitHub organization.
