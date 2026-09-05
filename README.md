# Chief prototype

A local, dependency-free prototype for a sellable startup-builder agent. It guides a user through Scout → Forge → Muse → Closer and requires an explicit click before each phase.

## Run

```bash
npm start
```

Open `http://localhost:3000`.

## What is live today

- Responsive standalone product UI
- Idea, target-user, and budget intake
- Four gated workflow phases
- Structured startup briefs tailored to the supplied details
- Explicit no-send policy in the Closer phase

## Before charging customers

The response generator deliberately runs in **prototype mode** so it needs no API key and makes no hidden external calls. Replace `demoReply()` in `server.mjs` with a server-side model call, then add a search/research provider and citations. Keep API keys only in environment variables; never expose them to the browser.
