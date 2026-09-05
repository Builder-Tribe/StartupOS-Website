# Trippy — AI-Powered Solo Travel Platform

## Project overview

Trippy is a full-stack monorepo for an Indian solo travel platform. It has three apps sharing one backend:

| App | URL | Who it's for |
|---|---|---|
| Consumer | http://localhost:5000 | Travellers — discovery, matching, AI trip finder |
| Partner CRM | http://localhost:5000/partner | Trip hosts — create and publish group trips |
| Admin Console | http://localhost:5000/admin | Platform team — RBAC, audit logs, management |

## Stack

- **Frontend**: React + Vite (port 5000)
- **Backend**: Node.js + Express + TypeScript (port 4000)
- **Database**: SQLite via `node:sqlite` (Node 22 required) — auto-seeds on first run
- **AI**: Anthropic Claude (optional — set `ANTHROPIC_API_KEY` for live AI; falls back to smart rule-based)

## How to run

The workflow "Start application" handles everything:
```
cd trippy && DATABASE_URL= npm run dev:server & cd trippy && npm run dev:web
```

`DATABASE_URL=` clears the Replit auto-attached PostgreSQL so the app uses its built-in SQLite.

To reset the database: `cd trippy && npm run reset-db`

## Demo logins (seeded automatically)

| Role | Email | Password |
|---|---|---|
| Consumer | traveller@trippy.test | Traveller@123 |
| Partner | admin@himalayanwolves.test | Trekking@123 |
| Admin (super) | super@trippy.test | Super@123 |

## Environment variables

| Key | Required | Notes |
|---|---|---|
| `JWT_SECRET` | Yes | Set as env var — auto-generated on setup |
| `ANTHROPIC_API_KEY` | Optional | Enables Claude AI in Trip Finder and Compare features |
| `DATABASE_URL` | Must be empty | Cleared in workflow command to force SQLite |

## Key files

- `trippy/web/src/pages/Chatbot.tsx` — AI Trip Finder UI
- `trippy/server/src/lib/discovery.ts` — Trip matching engine + AI reply builder
- `trippy/server/src/routes/chatbot.ts` — Chat endpoint (Claude + fallback)
- `trippy/server/src/db.ts` — SQLite/PostgreSQL dual-mode database layer

## User preferences

- Keep existing design system (teal brand `#0d9488`, indigo AI accents `#6366f1`)
- Do not touch screens other than the one being worked on
- Enhancements should feel native to the product, not bolted on
