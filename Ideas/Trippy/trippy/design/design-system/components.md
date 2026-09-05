# Trippy Design System — Component Library v1.0

> All components use CSS custom properties from `styles.css`. Min touch target: **44px** on mobile. Focus ring: `2px solid var(--brand)` offset `2px`.

---

## Buttons

| Class | Background | Text | Usage |
|---|---|---|---|
| `.btn-primary` | `--brand` (#0e9f8f) | white | Primary CTA — one per view max |
| `.btn-secondary` | `--brand-soft` | `--brand-dark` | Secondary / confirm |
| `.btn-ghost` | transparent | `--muted` | Tertiary, cancel |
| `.btn-diy` | `--diy` (#f2683c) | white | DIY path + discovery CTAs only |
| `.btn-diy-soft` | `--diy-softer` | `--diy-dark` | DIY secondary |
| `.btn-dark` | `--ink` | white | Dark surface CTAs |
| `.btn-danger` | `#fee2e2` | `--danger` | Destructive — always requires confirmation |

**Modifiers:** `.btn.small` (32px height) · `.btn-block` (full width)  
**States:** hover `filter: brightness(0.95)` · disabled `opacity: 0.5, cursor: not-allowed`  
**Never:** two `.btn-primary` in the same view · `.btn-diy` as primary on non-DIY screens

---

## Inputs

```
Default  → border: 1.5px solid var(--line); border-radius: 12px
Focus    → border-color: var(--brand); (no outline)
Error    → border-color: var(--danger); helper text in var(--danger)
Disabled → background: var(--line-softer); color: var(--faint); cursor: not-allowed
```

Label style: `11px / 700 / uppercase / 0.07em tracking / color: var(--faint)`

---

## Cards

### Base card
```css
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: var(--radius); /* 18px */
  padding: 18px;
  box-shadow: var(--shadow-card);
}
.card-dim { opacity: 0.75; } /* unverified profiles */
```

### Traveller profile card (`.match-card`)
Structure: Avatar → Name + verification badge → Score pill → Personality tags → AI reasons pill → Travel dates → Trust stars → CTA button  
Score pill classes: `.score-high` (teal, ≥70%) · `.score-mid` (amber, 40–69%) · `.score-low` (gray, <40%)

### Hosted trip card (`.ptrip-card`)
Structure: Cover image (140px) → Category chip → Host name → Trip name → Destination + dates → Price + original price  
Cover fallback: `linear-gradient(135deg, var(--teal-50), var(--indigo-50))`

### Hostel card (`.hostel-card` / `.hostel-pick`)
Structure: Name + price/night → Description → Feature chips → Rating + CTA  
Selected state: `border-color: var(--diy); box-shadow: 0 8px 22px rgba(242,104,60,.14)`

### DIY rail (`.diy-rail`)
Sticky sidebar for DIY path. Background: `linear-gradient(160deg, #fff, #fff6f2)`. Border: `var(--diy-line)`. Coral-tinted shadow.

---

## Badges & chips

### Compatibility score
```css
.score      { font-weight: 700; font-size: 13px; padding: 5px 10px; border-radius: 99px; }
.score-high { background: var(--brand-soft); color: var(--brand-dark); }  /* ≥70 */
.score-mid  { background: #fef3c7; color: #92400e; }                      /* 40–69 */
.score-low  { background: var(--line-softer); color: var(--faint); }      /* <40 */
```

### Verification badge
```css
.badge-ok { background: var(--brand-soft); color: var(--brand-dark); }
```
Show only positive trust signals — never "Unverified" as a negative flag. Unverified profiles get `opacity: 0.75` on the card.

### Status badges — trip lifecycle
| State | Class | Colors |
|---|---|---|
| Draft | `.crm-status-draft` | `--line-softer` / `--faint` |
| Live/Published | `.crm-status-published` | `#dcfce7` / `#15803d` |
| Upcoming | `.crm-status-completed` (repurpose) | `--indigo-50` / `--indigo-600` |
| Completed | `--line-soft` / `--muted` | — |

### Availability chips
| State | Background | Text |
|---|---|---|
| Open | `#dcfce7` | `#15803d` |
| Filling fast | `#fef3c7` | `#92400e` |
| Full | `var(--red-50)` | `var(--red-600)` |
| Waitlist | `var(--line-softer)` | `var(--faint)` |

### Interest / feature chips
```css
.chip       { border: 1.5px solid var(--line); background: #fff; }
.chip-active { background: var(--brand); border-color: var(--brand); color: #fff; }
.chip-mini  { background: var(--indigo-soft); color: var(--indigo); border: none; }
.chip-alt   { background: var(--line-softer); color: var(--muted); border: none; }
```

---

## Bottom navigation (mobile)

5 tabs maximum. Structure per tab: icon (20px bold) + label (10px / 700).  
Active tab: `background: var(--brand-soft); color: var(--brand-dark)`  
Center tab: floating gradient pill `linear-gradient(135deg, var(--brand), var(--diy))` — primary action.  
Safe area padding: `padding-bottom: 83px` (iOS) / `48px` (Android).

Tabs (in order):
1. Discover (`ph-compass`)
2. Matches (`ph-users`)
3. [Floating CTA — `ph-plus`]
4. Chats (`ph-chat-circle`)
5. Profile (`ph-user-circle`)

---

## Empty states

Always include:
1. Illustration emoji (48px — exception to no-emoji rule; empty states are content, not UI)
2. Heading (h3, 18px)
3. Helpful hint (body-sm, muted)
4. One action button (primary or secondary)

Tone: **curious, never defeated.** "You're early!" not "Sorry, no results."

```jsx
<Empty emoji="🔭" title="No travellers yet"
  hint="You're early! Check back closer to your dates, or try flexible dates."
  action={<button className="btn btn-primary">Try flexible dates</button>} />
```

---

## Skeleton / loading states

- **Card grids** → skeleton cards with shimmer (never a spinner)
- **Full-page data loads** → `.spinner` (teal `border-top`, 750ms rotation)
- Shimmer: `linear-gradient(90deg, #eef1f3 25%, #f4f6f8 50%, #eef1f3 75%)` animated at 1.4s linear
- Show skeleton only if load takes >200ms (prevents flash)

---

## Toast

```css
.toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  background: var(--ink); color: #fff; padding: 13px 22px; border-radius: 13px;
  font-size: 14px; font-weight: 500; animation: toastIn .3s ease;
}
```
Auto-dismiss after 2600ms. Use for: successful actions, confirmations, non-blocking errors.

---

## Bottom sheet / modal

- Overlay: `rgba(20,32,42,.48)` — no backdrop blur (performance on mid-range Android)
- Sheet enter: `translateY(100%) → translateY(0)`, 320ms ease-out
- Border-radius top: `var(--radius-xl)` (20px)
- Always has a drag handle (32×4px, `var(--line)`, `border-radius: 2px`) and a close ×

---

## Match / connection request card

States and their UI:
| State | UI |
|---|---|
| No connection | `.btn-primary` "Send travel request" |
| Pending outgoing | `.badge` "Request sent ✓" |
| Pending incoming | `.btn-primary` "Accept request" + `.btn-ghost` "Decline" |
| Accepted | `.btn-secondary` "Open chat 💬" |
| Declined | `.muted.small` "Request declined" |

AI reasons pill: `background: var(--brand-soft); color: var(--brand-dark); border-radius: 10px; padding: 7px 10px`

---

## Partner CRM — specific components

### KPI tiles (`.crm-tile`)
5-column grid. Value: `font-family: var(--font-head); font-weight: 700; font-size: 28px`.  
Color variants: `.crm-tile-published` (teal-dark) · `.crm-tile-draft` (faint) · `.crm-tile-upcoming` (indigo)

### Trip table (`.crm-table`)
- Header: `11px / 700 / uppercase / 0.05em tracking / --faint`
- Row height: `padding: 12px 14px`
- Action buttons: `.crm-act` (gray) · `.crm-act-primary` (teal-soft) · `.crm-act-danger` (red-soft)

### Sticky action bar (`.crm-actionbar`)
`position: sticky; bottom: 0` — always visible during editor scroll.  
Background: white with top shadow: `0 -4px 16px rgba(20,32,42,.06)`

---

## Admin console — specific components

### Role pills
9 roles, color-coded by permission tier:
- Super Admin, Founder → `background: var(--ink); color: #fff`
- Partner Manager, Ops → `background: var(--indigo-soft); color: var(--indigo-600)`
- Support, Analyst → `background: var(--brand-soft); color: var(--brand-dark)`
- Read-only → `background: var(--line-softer); color: var(--faint)`

### Audit log rows
- Background: `var(--line-softer)` (distinguishes from editable rows)
- Font: monospace for IDs + timestamps
- No edit affordances visible on immutable rows

### Verify banner (`.verify-banner`)
`background: #fffbeb; border: 1px solid #fde68a; color: #92400e`  
Shown when phone/ID not verified. Sticky below topbar.
