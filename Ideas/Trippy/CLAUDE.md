# CLAUDE.md

Read [`AGENTS.md`](AGENTS.md) — it is the constitution of this repository and applies in full to
Claude Code. Deep documentation index: [`docs/README.md`](docs/README.md).

Repo-specific quick facts for Claude Code sessions:

- Dev servers are defined in `.claude/launch.json` (trippy-api :4000, trippy-web :5173,
  trippy-website :5174) — prefer the preview tools over raw shell servers.
- Verification bar before finishing: `npx tsc --noEmit` (web + server), `npm test -w server`,
  and browser-check UI changes.
- Documentation covenant (AGENTS.md §4) is mandatory: PRD changelog + **ROADMAP.md** +
  affected `docs/*` update in the same change set as the code.
- **ROADMAP.md is the single source of truth for feature status.** Whenever a feature is
  completed, started, blocked, or re-scoped, update its status row in `ROADMAP.md` in the
  same commit. Update the Summary table counts and `_Last updated_` date too.
- The dev SQLite DB holds real user accounts — never reset or delete it without explicit consent.
- Git remote is `https://github.com/1997agarwal/Trippy.git` (redirects to `Nomad-Tribe/Trippy`). Do not change it.
- Git identity: `Harshit Agarwal <agarwal.harshit97@gmail.com>` — set in local `.git/config`, do not override.
- Organisation: all Trippy repos live under `Nomad-Tribe`. This repo (`Trippy`) is the parent monorepo and source of truth. Satellite repos: `trippy-website`, `trippy-mobile`, `trippy-data`, `trippy-infra` — see `AGENTS.md §8`.
