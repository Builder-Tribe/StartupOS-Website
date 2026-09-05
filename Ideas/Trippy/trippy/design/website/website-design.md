# Trippy Marketing Website — Design

> Source of truth: [`Trippy Homepage.dc.html`](./Trippy%20Homepage.dc.html) (Claude Design export, July 2026)
> Implemented at: [`trippy/website/`](../../website) — static Vite site, dev port **5174**

## Surface rules (from the Design System Foundation)

The marketing website is the one Trippy surface where display-size type (52–66px heroes at weight 800) and free use of blobs/decorative gradients are allowed. It uses the same v1.0 tokens (teal `#0e9f8f` primary, coral for partner/energy CTAs, ink `#14202a` dark sections) and Phosphor icons (`ph-bold`).

## Page structure (single-page homepage)

| Section | Content | Primary action |
|---|---|---|
| Nav (sticky, glassmorphic) | Logo · For travellers / For partners / How it works | **Open Trippy** → consumer app |
| Hero | "Going solo doesn't mean going *alone.*" + proof pills (travellers / destinations / trips) | Open Trippy on mobile |
| How it works | 3 steps: destination+dates → matches → travel together | — |
| Stats strip (ink bg) | 12,400+ travellers · 340+ trips · 47 destinations · ₹0 fees | — |
| Testimonials | 3 traveller cards with destination + match-score chips | — |
| Two ways to travel | DIY path (teal) vs Hosted trips (coral) mode cards | Start DIY / Browse trips → app |
| Hostel layer | Copy + live-style hostel mockup ("who's checking in") | — |
| For partners (ink banner) | 3-step onboarding, coral CTA | **List your first trip free** → partner CRM |
| Final CTA | Compass + headline + open-app button | Open Trippy |
| Footer (ink) | Brand, link columns (travellers / partners / company), socials | — |

## Link mapping (dev)

- "Open Trippy" / traveller CTAs → `http://localhost:5173/`
- Partner CTAs → `http://localhost:5173/partner`
- In production these map to the app + partner domains.

## Notes

- Stats/testimonials are aspirational marketing copy from the design, not live data.
- The design ships its own scoped CSS (marketing-only classes); it intentionally does not import the app's `styles.css`.
