# Trippy Design System — Foundation v1.0

> Last updated: July 2026  
> Fonts: Bricolage Grotesque (headings) + Hanken Grotesque (body)  
> Icons: Phosphor Icons v2 (`ph-bold` weight default)  
> Base unit: 4px grid

---

## Brand personality

| Adjective | Rationale |
|---|---|
| **Warmly adventurous** | Energy without arrogance — excited about where you're going, never intimidating |
| **Community-first** | People surface before places; faces + names get the best real estate |
| **Quietly trustworthy** | Trust earned structurally — verification badges are factual, not marketing |
| **India-native** | INR-first, Devanagari-ready, mid-range Android primary |
| **Decisively simple** | One clear primary action per screen; mixed digital literacy demands it |

**Core tension resolved:** Coral = excitement. Teal = safety. They never share the same button hierarchy.

---

## Color palette

### Primary — Trippy Teal (brand trust, navigation, CTAs)

| Token | Hex | Usage |
|---|---|---|
| `--teal-50` | `#e6f5f3` | Subtle bg — selected nav, chip hover, score-high bg |
| `--teal-100` | `#cceae6` | Stronger subtle bg |
| `--teal-500` | `#0e9f8f` | ★ Primary — buttons, links, active states |
| `--teal-600` | `#0b7a6c` | Hover states, prices, key values (6.2:1 contrast) |
| `--teal-700` | `#085f54` | Pressed / dark surfaces |

Alias: `--brand` → `--teal-500` · `--brand-dark` → `--teal-600` · `--brand-soft` → `--teal-50`

### Secondary — Sunset Coral (energy, DIY path, discovery)

| Token | Hex | Usage |
|---|---|---|
| `--coral-50` | `#fff3ee` | Subtle bg |
| `--coral-200` | `#ffc9ac` | Coral border / divider (`--diy-line`) |
| `--coral-500` | `#f2683c` | ★ DIY path, energy CTAs, discovery moments |
| `--coral-600` | `#c2410c` | Hover, dark text on coral surfaces |

Alias: `--diy` → `--coral-500` · `--diy-dark` → `--coral-600` · `--diy-softer` → `--coral-50`

### Accent — Community Indigo (AI match, operator chips)

| Token | Hex | Usage |
|---|---|---|
| `--indigo-50` | `#eef0ff` | Subtle bg |
| `--indigo-500` | `#6366f1` | ★ Match scores, operator chips, AI features |
| `--indigo-600` | `#4f46e5` | Hover |

Alias: `--indigo` → `--indigo-500` · `--indigo-soft` → `--indigo-50`

### Neutrals

| Token | Hex | Usage |
|---|---|---|
| `--neutral-bg` / `--bg` | `#fbfcfd` | Page background |
| `--neutral-card` / `--card` | `#ffffff` | Card / modal |
| `--neutral-line` / `--line` | `#e6ebee` | Default border |
| `--neutral-muted` / `--muted` | `#5d6b76` | Secondary text (6.8:1 on white ✓ AA) |
| `--neutral-faint` / `--faint` | `#8795a0` | Tertiary text, placeholders |
| `--neutral-ink` / `--ink` | `#14202a` | Primary text (18.4:1 on white ✓ AAA) |

### Semantic

| Role | Hex | Soft bg |
|---|---|---|
| Success | `#16a34a` | `#dcfce7` |
| Warning | `#d97706` | `#fffbeb` |
| Error / Danger | `#dc2626` | `#fee2e2` |
| Amber (accent) | `#f59e0b` | `#fffbeb` |

---

## Typography

### Font pairing
- **Bricolage Grotesque** — headings (variable 400–800). Expressive, personality-forward, Devanagari-system-fallback ready.
- **Hanken Grotesque** — body (400–700). Clean, geometric, crisp on mid-range Android screens.

### Type scale

| Token | Size | Mobile | Weight | Line-height | Usage |
|---|---|---|---|---|---|
| `display` | 52px | 36px | 800 | 1.0 | Marketing hero, onboarding splash |
| `h1` | 36px | 28px | 700 | 1.08 | Page titles |
| `h2` | 28px | 22px | 700 | 1.15 | Section headers |
| `h3` | 22px | 18px | 600 | 1.2 | Card headings, modal titles |
| `h4` | 18px | 16px | 600 | 1.3 | Subheadings |
| `body-lg` | 18px | 16px | 400 | 1.6 | Hero subtitles, trip lede |
| `body` | 16px | 15px | 400 | 1.55 | Default paragraphs, inputs |
| `body-sm` | 14px | 13px | 400 | 1.5 | Card metadata |
| `caption` | 12px | 11px | 500 | 1.4 | Timestamps, helper text |
| `label` | 11px | 11px | 700 | 1.3 | Form labels (uppercase, 0.07em tracking) |
| `overline` | 10px | 10px | 800 | 1.4 | Section eyebrows (uppercase, 0.1em tracking) |

---

## Spacing (4px base)

`--space-1` = 4px · `--space-2` = 8px · `--space-3` = 12px · `--space-4` = 16px · `--space-5` = 20px · `--space-6` = 24px · `--space-8` = 32px · `--space-10` = 40px · `--space-12` = 48px · `--space-16` = 64px · `--space-24` = 96px

---

## Border radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 8px | Small chips, tags |
| `--radius-md` | 12px | Inputs, small cards |
| `--radius-lg` | 16px | Cards |
| `--radius-xl` | 20px | Large cards, modals |
| `--radius-full` | 9999px | Pills, avatars |
| `--radius` | 18px | Default card (backward compat) |

---

## Grid

| Breakpoint | Columns | Outer margin | Gap |
|---|---|---|---|
| Mobile ≤640px | 4 | 16px | 8px |
| Tablet 641–860px | 8 | 24px | 12px |
| Desktop >860px | 12 | 40px | 16px |

Max content width: **1140px** (consumer) · **1080px** (partner CRM).

Mobile bottom nav safe area: **83px** (iOS) / **48px** (Android).

---

## Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(20,32,42,.04), 0 1px 3px rgba(20,32,42,.06)` | Chips, dropdowns |
| `--shadow-card` | `0 1px 2px rgba(20,32,42,.04), 0 8px 22px rgba(20,32,42,.05)` | Default cards |
| `--shadow-lift` | `0 2px 4px rgba(20,32,42,.04), 0 20px 50px rgba(20,32,42,.09)` | Auth cards, popovers |
| `--shadow-lg` | `0 10px 15px rgba(20,32,42,.08), 0 4px 6px rgba(20,32,42,.04)` | Modals, bottom sheets |

---

## Motion

| Token | Value | Usage |
|---|---|---|
| `--transition-fast` | `100ms ease` | Button color shifts, micro-interactions |
| `--transition-base` | `150ms ease` | Card hover lift |
| `--transition-slow` | `250ms ease` | Page fade-up, modal enter |
| `--transition-slower` | `400ms ease` | Bottom sheet slide-up |

**3 principles:**
1. **Purposeful, never decorative** — every transition communicates state, not aesthetics
2. **Warmth through gentle easing** — ease-out only; no bounce, elastic spring, or rotation
3. **Instant feedback for trust** — optimistic UI; button press responds <100ms visually

---

## Iconography

- **Library:** Phosphor Icons v2 (`@phosphor-icons/web`)
- **Default weight:** `ph-bold` (2px stroke — crisp on low-DPI Android)
- **Filled weight:** `ph-fill` — status icons only (verified badge, active nav tab)
- **Sizes:** 16px (form fields) · 20px (nav, buttons) · 24px (empty states) · 32px (feature icons)
- **No emoji as icons.** No thin/regular weight in product UI.

---

## Surface adaptations

### Consumer app
- People before places in every card layout
- Bottom nav (5 tabs max); floating center CTA
- DIY path uses coral exclusively — signals a distinct building mode
- Ambient background blobs (low opacity) behind content
- Topbar: glassmorphic (`rgba(251,252,253,.72)` + `backdrop-filter: blur(10px)`)

### Partner CRM
- Opaque `#f7f8fa` background — no blobs, no gradients
- KPI tiles row always at top
- Multi-section scrolling editor with sticky bottom action bar
- Publish validation as pre-flight checklist (red, never silent)

### Admin console
- Dark sidebar (`#14202a`) immediately distinguishes from consumer app
- 13px body text; compact 40px table rows; monospace audit logs
- Destructive actions require 2-step confirmation
- RBAC role pills color-coded by permission tier

### Marketing website
- Display-size type (52–60px heroes at max weight)
- Blobs + decorative gradients used freely (only surface that allows this)
- Primary CTA: "Find your trip" (teal) · Secondary CTA: "List your trips" (coral)

---

## Design principles (QA filter)

1. **People over places** — every screen that surfaces travellers shows a face + name before a destination
2. **One clear next step** — no dead ends; no two primary actions competing in the same view
3. **Trust through transparency** — AI scores show reasoning; prices are complete; nothing safety/money-related is obscured
4. **Earned by 375px** — if it doesn't work on a Redmi Note at 375px, it doesn't work
