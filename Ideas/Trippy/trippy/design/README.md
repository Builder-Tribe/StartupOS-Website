# trippy/design — Design Sources & Status

Design system specs, Claude Design exports (`*.dc.html`), and per-surface audit/implementation
status. Engineering rules for *using* the design system are in
[`docs/frontend.md`](../../docs/frontend.md); this directory is the design source of truth.

| Directory | Contents | Status doc |
|---|---|---|
| `design-system/` | **Design System Foundation v1.0** — `tokens.json`, `design-system.md`, `components.md` + export | the specs themselves |
| `consumer-app/` | Consumer UX Audit + Redesign exports | [`consumer-design.md`](consumer-app/consumer-design.md) — P0 status |
| `partner-crm/` | Partner CRM UX Audit + Redesign exports | [`partner-design.md`](partner-crm/partner-design.md) — P0 status |
| `admin-console/` | Admin Console UX Audit + Redesign exports | [`admin-design.md`](admin-console/admin-design.md) — P0 status |
| `website/` | Marketing homepage design export | [`website-design.md`](website/website-design.md) |
| `mobile-app/` | *(placeholder)* future traveller mobile app designs | scope contract: [`docs/mobile-app.md`](../../docs/mobile-app.md) |
| `qa/` | *(placeholder)* design QA notes | — |

## Workflow

1. Designs are produced in **Claude Design** and exported here as `.dc.html` (self-contained;
   extract copy/specs by stripping tags).
2. When a design is implemented, its status doc gets a ✅/⏳ table mapping audit items → code
   (see `consumer-design.md` for the format).
3. `figma-link.md` files are placeholders for future Figma sources — empty until one exists.
4. Pending: a designed pass on the v3.5 date-first search flow (see
   [`docs/roadmap.md`](../../docs/roadmap.md)); drop exports into `consumer-app/` when ready.
