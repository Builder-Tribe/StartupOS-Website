# Frontend Guide & Reuse Catalogue

> Truth source: `dupescout/app/`, `dupescout/components/`, `dupescout/lib/`. This is the "reuse
> before generating" reference — check here before writing any new component, hook, or utility.
> Update it when shared code is added or changed.

## Three surfaces, one Next.js app

The App Router hosts three distinct surfaces. Never import components across surfaces except
from the shared files listed below.

| Surface | Route prefix | App dir | Users |
|---|---|---|---|
| Consumer | `/` | `app/(consumer)/` | Gen Z shoppers |
| Focused flows | (no nav) | `app/(focused)/` | Checkout, login |
| Seller portal | `/seller` | `app/seller/` | Merchants |
| Admin console | `/admin` | `app/admin/` | Ops team |

## Shared library files

Check these before creating anything new:

| File | Exports | Use for |
|---|---|---|
| `lib/types.ts` | All domain types (`Product`, `Seller`, `User`, `ApiResponse<T>`, etc.) | **Single source of truth for types** — never redefine inline |
| `lib/api.ts` | `visualSearch`, `getProduct`, `sendOtp`, `verifyOtp`, `getMe`, `getTrending`, `getRecommendations`, `fileToBase64` | All consumer HTTP calls; axios client with JWT interceptor |
| `lib/store.ts` | Zustand store — cart, wishlist, search state | Client-side state |
| `lib/hooks/useAuth.ts` | `useAuth()` — current user, login/logout, auth state | Consumer auth in any component |
| `lib/cn.ts` | `cn(...classes)` — Tailwind class merging (clsx + tailwind-merge) | Conditional class composition everywhere |
| `lib/nav.ts` | Consumer and seller nav config | Nav components |
| `lib/mock-data.ts` | Dev-only mock products/sellers | Local development without API |

## Component catalogue

Shared components in `components/`. Check here before writing a new one.

### `components/ui/` — primitive building blocks
| Component | Use for |
|---|---|
| `Button` | All buttons — variant props: `primary`, `secondary`, `ghost`, `destructive` |
| `Badge` | Status labels (similarity tier, seller type, verified) |

### `components/search/`
| Component | Use for |
|---|---|
| `SearchBar` | Primary search input with image upload, URL paste, text query |
| `ProductCard` | Search result card — similarity score, price, seller info |
| `SimilarityScore` | Score ring + tier label — **never inflate or fake values** |
| `AIExplanationCard` | AI verdict card with what-matches / what-differs |

### `components/product/`
| Component | Use for |
|---|---|
| `ImageGallery` | Product image carousel |
| `VariantSelector` | Size / colour picker |
| `SellerCard` | Seller trust panel with local/verified badges |
| `ReviewSummary` | Rating summary with authenticity signals |

### `components/layout/`
| Component | Use for |
|---|---|
| `Header` | Consumer app top bar |
| `ConsumerNav` | Desktop consumer navigation |
| `BottomNav` | Mobile bottom navigation (≤768px) — extend tabs here, never add a second nav |
| `Footer` | Consumer app footer |

### `components/seller/` · `components/admin/`
`SellerNav` and `AdminNav` — surface-specific navs; do not import into consumer pages.

## Design system

Tailwind is the styling layer. Design tokens are in `tailwind.config.ts`.

- **Colors:** Use semantic class names, not raw hex. Hard-coded hex in component JSX is a defect.
- **Spacing/type:** Use Tailwind scale exclusively.
- **Mobile-first:** Consumer surface is mobile-first (≤390px baseline). Seller and admin are
  desktop-first.

## Routing conventions (Next.js App Router)

- `(consumer)` and `(focused)` are route groups — the parentheses don't appear in the URL.
- Every route segment is a folder with a `page.tsx`.
- Layouts (`layout.tsx`) compose auth guards, nav, and providers.
- Never use `useRouter().push` for auth redirects — handle in middleware or in the layout.

---

*Reuse catalogue is updated in the same commit as any new shared component or utility.
See the documentation covenant in [AGENTS.md §4](../AGENTS.md).*
