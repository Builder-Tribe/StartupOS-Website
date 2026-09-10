# StartupOS Website (`StartupOS-Website`)

> **Public showcase landing website & interactive product suite** for [StartupOS](https://github.com/Builder-Tribe/StartupOS) — The AI Product Operating System & Incubator.

This repository contains the standalone **public marketing website** for StartupOS, showcasing:
- **Interactive Deliverables Inspector**: Live unboxing of the 4-file constitution (`AGENTS.md`), production PRD suite, 1-click `.ZIP` scaffold, and 4-phase autonomous prompt runbooks.
- **Free AI Builder Academy**: Complete curriculum showcase for Developer Branding, GitHub Launchpad, and 60-minute full-stack AI SaaS creation.
- **Side-by-Side Comparison**: "Building Without StartupOS" vs. "Building With StartupOS".
- **4-Stage How It Works Walkthrough**: Ideate & Score → Configure Scaffold → Run Agent Prompts → 100-Point Audit.
- **Interactive Builder ROI Calculator**: Real-time slider calculating hours and capital reclaimed.
- **Transparent Pricing Plans**: Hobby Builder ($0/mo), Pro Builder ($29/mo), and Studio ($99/mo).
- **Interactive FAQ & 4-Pill Scroll Navigation**.

---

## 🌐 Related Repositories

| Repo | Description |
|---|---|
| [StartupOS (Monorepo)](https://github.com/Builder-Tribe/StartupOS) | Full product monorepo — API server, Idea Lab, PRD Generator, Prompt Vault, AI Academy & Launchpad |
| **StartupOS-Website** (this repo) | Public marketing website only |

---

## 🛠️ Tech Stack

- **React 18** + **Vite 6**
- **Tailwind CSS v4** + Clean 2026 Light Modern UI
- **Lucide React** for icons
- Pure client-side interactions with zero backend lock-in

---

## 🚀 Development

```bash
# Install dependencies
npm install

# Run local development server (port 3100)
npm run dev

# Build production bundle (outputs to dist/)
npm run build

# Preview production build
npm run preview
```

---

## 🚢 Deployment

Builds to a static `dist/` directory, ready to deploy to Vercel, Netlify, Cloudflare Pages, or GitHub Pages.

Configure the link out to the full StartupOS application portal via `.env`:
```bash
cp .env.example .env
# Edit VITE_APP_URL to point to your deployed StartupOS app
```

---

## 🏛️ Organization

Part of the [Builder-Tribe GitHub organization](https://github.com/Builder-Tribe).
