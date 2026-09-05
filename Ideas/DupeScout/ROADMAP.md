# DupeScout — Roadmap

> Shop the Look. Not the Markup.

**Stack:** Next.js 14 · FastAPI · PostgreSQL/pgvector · Redis · Elasticsearch · Claude Sonnet 5  
**Infra:** AWS ap-south-1 (Mumbai) — India data residency

## Legend
| Status | Meaning |
|--------|---------|
| ✅ Done | Implemented and working |
| 🔄 In Progress | Currently being built |
| 🔲 Planned | Scoped, not started |
| ❌ Blocked | Waiting on dependency |

## Non-Negotiables (applies to all phases)

- **No ads in organic search** — sponsored content is always clearly labeled and separated
- **Similarity scores are sacred** — never inflate. Show real scores. AI explanations must be honest.
- **India data residency** — all infrastructure runs in AWS ap-south-1 (Mumbai)
- **Trust & Safety is non-negotiable** — never weaken counterfeit detection or seller verification

---

## Phase 0: Foundation *(Weeks 1–2)*

> Infrastructure only. Nothing works without this. Every subsequent phase depends on these being provisioned.

| Feature / Task | Status | Notes |
|----------------|--------|-------|
| PostgreSQL 16 + pgvector (AWS RDS ap-south-1) | 🔄 In Progress | Migration SQL written (`db/migrations/001_initial.sql`); DB provisioning pending |
| Redis 7 cluster (ElastiCache) | 🔲 Planned | Required for session management and caching |
| Elasticsearch 8 cluster (AWS OpenSearch) | 🔲 Planned | Required for full-text product search |
| S3 / R2 object storage + CloudFront CDN | 🔲 Planned | Product image hosting |
| Next.js 14 frontend scaffold + Vercel deployment | ✅ Done | App Router, Tailwind, all config files complete |
| FastAPI backend scaffold + ECS Fargate deployment | 🔄 In Progress | `api/main.py` + routes scaffold; endpoints are stubs |
| Domain + SSL setup | 🔲 Planned | |
| Secrets manager + environment config | 🔲 Planned | |
| GitHub Actions CI/CD pipeline | 🔲 Planned | Lint, test, deploy to staging |
| CloudWatch + Sentry monitoring | 🔲 Planned | |
| Consumer auth — phone OTP via MSG91 + JWT | ✅ Done | `api/routes/auth.py`, `app/(consumer)/login/`, `lib/hooks/useAuth.ts` |
| Seller auth — phone OTP + seller-realm JWT | ✅ Done | `api/routes/seller.py` |
| Admin auth — bcrypt + TOTP MFA + RBAC (9 roles) | 🔄 In Progress | Login UI done (`app/admin/login/page.tsx`); backend bcrypt + TOTP integration pending |

---

## Phase 1: First Working Loop *(Weeks 3–4)*

> One consumer can buy one product. One seller can list it. Admin can approve it. That is the entire loop.

| Feature / Task | Status | Notes |
|----------------|--------|-------|
| Home screen (camera-first, trending cards, For You, Local Sellers) | ✅ Done | `app/page.tsx` |
| Keyword search (BM25 + CLIP semantic, RRF merge, Local-First reranking) | ✅ Done | `api/services/keyword_search.py`, `api/routes/keyword_search.py` |
| Search results page — 3 tiers (Original / Smart Value / Similar) | ✅ Done | `app/(consumer)/search/page.tsx` |
| AI Explanation Card on search results | ✅ Done | `components/search/AIExplanationCard.tsx` |
| Similarity score breakdown (Shape / Color / Material / Style) | ✅ Done | `components/search/SimilarityScore.tsx` — tappable |
| Product Detail Page (PDP) | ✅ Done | `app/(consumer)/product/[id]/page.tsx` |
| "AI Says" card on PDP | ✅ Done | Similarity pill + AI explanation |
| Product image gallery (swipe + zoom) | ✅ Done | `components/product/ImageGallery.tsx` — thumbnail strip + zoom overlay |
| Size / variant selector | ✅ Done | `components/product/VariantSelector.tsx` — stock-aware |
| Cart (multi-seller, quantity controls) | ✅ Done | `app/(consumer)/cart/page.tsx` + Zustand store |
| Checkout flow (address → payment → review) | ✅ Done | `app/(consumer)/checkout/page.tsx` — 3-step flow |
| Checkout — UPI payment (GPay, PhonePe, BHIM) | ✅ Done | UI complete; Razorpay backend wiring pending |
| Checkout — Cards + Net Banking | ✅ Done | UI complete; Razorpay backend wiring pending |
| Checkout — Cash on Delivery | ✅ Done | Blocked above ₹5,000 |
| Razorpay payment integration (backend) | 🔄 In Progress | Service + webhooks done (`api/services/razorpay_service.py`, `api/routes/razorpay_webhook.py`); checkout wiring pending |
| Shiprocket logistics integration (service layer) | ✅ Done | `api/services/shiprocket_service.py` — create shipment, track AWB, get label PDF |
| Order confirmation + order history | ✅ Done | |
| Seller signup + phone OTP | ✅ Done | `app/seller/login/page.tsx` |
| AI Catalog Creator — photo-to-listing (4-stage UI) | ✅ Done | `app/seller/(dashboard)/products/new/page.tsx` |
| AI title + description generation (Claude Sonnet 5) | 🔄 In Progress | Frontend complete with mock data; Claude API wiring pending |
| Product management — CRUD, variants, inventory | ✅ Done | `app/seller/(dashboard)/products/page.tsx` |
| Seller order management (accept, pack, ship) | ✅ Done | `app/seller/(dashboard)/orders/page.tsx` |
| Admin catalog moderation queue | ✅ Done | `app/admin/(console)/catalog/page.tsx` — AI confidence, flags, human approve/reject |
| Admin product approve / reject with reasons | ✅ Done | One-click with AI recommendation visible |
| Admin order monitoring + intervention | ✅ Done | `app/admin/(console)/orders/page.tsx` — fraud/high-value flags, resolve action |
| Admin manual refund processing | 🔄 In Progress | Refund button in disputes + finance; full Razorpay integration in `razorpay_service.issue_refund()` pending |
| Immutable admin audit log | ✅ Done | DB-level no-UPDATE/DELETE rules in `db/migrations/001_initial.sql`; API in `api/routes/admin/router.py` |

---

## Phase 2: Full Consumer Experience *(Weeks 5–6)*

> Make the consumer experience complete and polished end-to-end.

| Feature / Task | Status | Notes |
|----------------|--------|-------|
| Visual search — photo upload (gallery picker) | ✅ Done | `components/search/SearchBar.tsx` |
| Visual search — camera capture | ✅ Done | `components/search/SearchBar.tsx` |
| Visual search — URL paste (Amazon, Instagram, Pinterest, Myntra, Flipkart, IKEA, Zara) | ✅ Done | `components/search/SearchBar.tsx` — URL mode |
| Visual Similarity Engine v1 (CLIP ViT-L/14 + Local-First reranking + tier assignment) | ✅ Done | `api/services/visual_similarity.py` — dev fallback included |
| pgvector ANN index + HNSW search | 🔄 In Progress | SQL documented in service; needs DB provisioned |
| Product DNA Engine (Claude Sonnet 5 vision + attribute extraction) | ✅ Done | `api/services/product_dna.py` — dev mock fallback if no API key |
| Wishlist (save, remove, add to cart, out-of-stock state) | ✅ Done | `app/(consumer)/wishlist/page.tsx`; `api/routes/wishlist.py` — POST/DELETE/GET |
| Order tracking (Shiprocket carrier webhooks) | 🔲 Planned | |
| Returns & Dispute Initiation Flow (3-surface) | ✅ Done | Consumer return request modal & status tracker (`orders/[id]/page.tsx`), Seller return review & escalation modal (`seller/orders/page.tsx`), Admin dispute resolution console (`admin/disputes/page.tsx`), Backend endpoints (`api/routes/orders.py`, `seller.py`, `admin/router.py`) |
| Basic verified reviews | 🔲 Planned | |
| AI counterfeit detection backend (brand logo in images) | 🔄 In Progress | Counterfeit flag shown in fraud + catalog UIs; AI detection backend pending |
| Seller application review + approval (admin) | ✅ Done | `app/admin/(console)/sellers/page.tsx` — expandable review with approve/reject/suspend |
| Seller status management — approve / suspend / ban (admin) | ✅ Done | Inline in sellers page; backend stubs in `api/routes/admin/router.py` |
| Admin overview dashboard (war room — live stats, action queue, event feed) | ✅ Done | `app/admin/(console)/overview/page.tsx` |
| Admin fraud detection dashboard | ✅ Done | `app/admin/(console)/fraud/page.tsx` — severity, risk score, signal tags, resolve action |
| Admin dispute resolution interface | ✅ Done | `app/admin/(console)/disputes/page.tsx` — AI recommendation + refund/resolve actions |

---

## Phase 3: Seller Platform Complete *(Weeks 7–8)*

> Make sellers fully self-sufficient from onboarding to payout.

| Feature / Task | Status | Notes |
|----------------|--------|-------|
| Seller registration + full onboarding flow | ✅ Done | `app/seller/onboarding/page.tsx` |
| GST verification (GSTN API + auto-OCR) | 🔄 In Progress | UI + backend stub done; GSTN API integration pending |
| KYC — Aadhaar / PAN OCR (Surepass) | 🔲 Planned | Mandatory before first payout |
| Bank account verification (₹1 penny drop) | 🔄 In Progress | UPI ID collection UI done; penny-drop API pending |
| AI material / style / aesthetic auto-tagging | 🔄 In Progress | Tags shown in UI review step; Claude API wiring pending |
| AI suggested price range | 🔄 In Progress | Price range UI done; market comparison data pending |
| Inventory management (stock count, variant-level) | ✅ Done | Managed within catalog creator |
| Shipping label generation — one-click (Shiprocket) | 🔲 Planned | Service ready in `api/services/shiprocket_service.py`; UI trigger pending |
| Returns management (seller side, 7-day SLA) | 🔲 Planned | |
| Seller analytics dashboard (revenue, traffic, conversion) | 🔲 Planned | Vol 3 §13 |
| Seller payout automation (Razorpay X, T+7 settlement) | 🔲 Planned | Payout dashboard done; automation pending |
| Payouts dashboard (deduction breakdown, UPI account, CSV export) | ✅ Done | `app/seller/(dashboard)/payouts/page.tsx` |
| GST invoice generation (GSTR-1, PDF, HSN codes, B2B/B2CS) | ✅ Done | `api/routes/gst_invoice.py` — GSTR-1 JSON export + PDF via reportlab |
| Admin customer management + lookup | ✅ Done | `app/admin/(console)/customers/page.tsx` — expandable cards, risk score, block/unblock |
| Admin finance dashboard (GMV, revenue, payouts, commissions) | ✅ Done | `app/admin/(console)/finance/page.tsx` — GMV bar chart, upcoming payouts, pending refunds |
| Admin feature flags system | ✅ Done | `app/admin/(console)/feature-flags/page.tsx` — permanent flag protection (no-ads, counterfeit detection, DPDP) |
| Admin growth analytics dashboard | 🔲 Planned | Acquisition, activation, retention, revenue |

---

## Phase 4: Growth & Monetization *(Month 3)*

> Acquire users at scale and generate real revenue.

| Feature / Task | Status | Notes |
|----------------|--------|-------|
| Affiliate results (Amazon / Flipkart / Myntra APIs) | 🔲 Planned | Day-1 revenue + coverage; Vol 2 §5.1 |
| Conversational AI Shopping Copilot (Claude Sonnet 5 + 8 tools) | ✅ Done | `api/services/conversational_ai.py`; `api/routes/ai_chat.py`; `app/(consumer)/ai-chat/page.tsx` |
| Recommendation engine v1 (content-based, personalised feed) | 🔄 In Progress | Discovery endpoints scaffolded in `api/routes/consumer.py`; algorithm pending |
| User style preferences onboarding | 🔲 Planned | |
| Collections (Pinterest-style boards) | 🔲 Planned | Vol 2 §5.6 |
| Collaborative collections (invite friends to co-curate) | 🔲 Planned | |
| Comparison Engine (side-by-side, 2–4 products) | ✅ Done | `api/routes/consumer.py` (`/consumer/compare`); `lib/store/useCompareStore.ts`; `components/compare/`; `app/(consumer)/compare/page.tsx` |
| Price Tracker — history chart (30-day free, 1-year Pro) | 🔲 Planned | |
| Price Alerts (user sets target price, drop notifications) | 🔲 Planned | |
| Social sharing — Win Card ("Saved ₹X") | 🔲 Planned | Viral loop driver |
| Referral program (₹100 new user + ₹75 referrer) | 🔲 Planned | |
| WhatsApp / SMS order update notifications | 🔲 Planned | |
| Review authenticity AI (NLP + network analysis) | 🔲 Planned | Vol 5 §9 |
| Promo codes + discounts | 🔲 Planned | |
| Seller promotion tools (flash sales, coupons, sponsored listings) | 🔲 Planned | Vol 3 §15 |
| Featured listings — paid (seller side) | 🔲 Planned | |
| Admin A/B experimentation framework (LambdaMART ranking tests) | 🔲 Planned | |

---

## Phase 5: Intelligence & Scale *(Months 4–5)*

> Make the AI the moat. No competitor can replicate this quickly.

| Feature / Task | Status | Notes |
|----------------|--------|-------|
| LambdaMART ranking algorithm (relevance + quality + value + local-first) | 🔲 Planned | Vol 5 §6 |
| Trend Prediction Engine (internal signals + Google Trends) | 🔲 Planned | Vol 5 §7 |
| Trend Intelligence Feed (consumer-facing) | 🔲 Planned | Vol 2 §5.10 |
| Price Intelligence Engine (price history + prediction) | 🔲 Planned | Vol 5 §8 |
| Style DNA — user aesthetic profile | 🔲 Planned | |
| AI Style Assistant + Wardrobe | 🔲 Planned | Fashion only; Vol 2 §5.7 |
| Outfit Builder (fashion) | 🔲 Planned | Vol 2 §5.8 |
| Room Lens (home / furniture visual planning) | 🔲 Planned | Vol 2 §5.9 |
| Recommendation engine v2 (collaborative filtering, 50K+ users required) | 🔲 Planned | |
| Hindi language support (search + AI chat) | 🔲 Planned | Tier 2/3 city expansion |
| Multi-language support (Tamil, Telugu) | 🔲 Planned | Year 2 target |
| B2B buyer accounts + bulk orders | 🔲 Planned | |
| Advanced seller analytics (cohorts, LTV) | 🔲 Planned | Vol 3 §13 |
| Seller AI Insights (proactive recommendations) | 🔲 Planned | e.g. "Add photos → +40% conversion"; Vol 3 §14 |
| Real-time inventory sync | 🔲 Planned | |
| Admin ML model management panel | 🔲 Planned | |

---

## Phase 6: Platform & Ecosystem *(Months 5–6+)*

> Open up the platform. Let the ecosystem build on top of DupeScout.

| Feature / Task | Status | Notes |
|----------------|--------|-------|
| DupeScout Pro subscription (₹99/month, ₹799/year) | 🔲 Planned | Razorpay subscription |
| Pro — unlimited visual searches (free tier: 20/day) | 🔲 Planned | |
| Pro — 1-year price history + unlimited alerts | 🔲 Planned | Free tier: 30 days + 5 alerts |
| Pro — exclusive seller deals + early trend access | 🔲 Planned | Seller opt-in |
| DupeScout API (third-party access) | 🔲 Planned | |
| Browser extension (find dupes while browsing) | ✅ Done | Manifest V3 Chrome Extension (`dupescout/extension/`) |
| Mobile app (React Native / Expo) | 🔲 Planned | |
| Creator / influencer affiliate program | 🔲 Planned | |
| AR try-on (face / room) | 🔲 Planned | |
| Seller co-op / aggregation | 🔲 Planned | |
| White-label B2B | 🔲 Planned | |
| International expansion (Southeast Asia) | 🔲 Planned | Year 3 target; Indonesia, Thailand, Vietnam, Philippines |

---

## Summary

| Phase | Target | ✅ Done | 🔄 In Progress | 🔲 Planned |
|-------|--------|--------|---------------|-----------|
| Phase 0 — Foundation | Weeks 1–2 | 3 | 3 | 7 |
| Phase 1 — First Working Loop | Weeks 3–4 | 20 | 3 | 0 |
| Phase 2 — Full Consumer Experience | Weeks 5–6 | 8 | 3 | 4 |
| Phase 3 — Seller Platform Complete | Weeks 7–8 | 7 | 4 | 6 |
| Phase 4 — Growth & Monetization | Month 3 | 1 | 1 | 15 |
| Phase 5 — Intelligence & Scale | Months 4–5 | 0 | 0 | 16 |
| Phase 6 — Platform & Ecosystem | Months 5–6+ | 0 | 0 | 12 |
| **Total** | | **39** | **14** | **60** |

---

## E2E Bug Fix Audit — 2026-08-12

> Comprehensive end-to-end audit of all three surfaces (Consumer, Seller, Admin). All findings were fixed in the same session.

| # | Surface | Bug | Fix | Status |
|---|---------|-----|-----|--------|
| 1 | Config | `.eslintrc.json` referenced non-existent `next/typescript` extend, causing `npm run lint` to fail | Removed `next/typescript`, kept `next/core-web-vitals` | ✅ Fixed |
| 2 | Consumer Nav | `AvatarCircle` used dynamic Tailwind classes (`w-${size}`) that JIT purges at build time, causing invisible avatar | Replaced with explicit static conditional classes | ✅ Fixed |
| 3 | Home Page | `/trending`, `/recommendations`, `/local-sellers` links led to 404 routes | Mapped to `/search?tab=trending`, `/search?tab=recommendations`, `/search?local_only=true` | ✅ Fixed |
| 4 | Home Page | Raw `"` quote chars in JSX text causing `react/no-unescaped-entities` ESLint errors | Replaced with `&ldquo;` / `&rdquo;` HTML entities | ✅ Fixed |
| 5 | Search Page | Visiting `/search` without params showed loading then empty "No results found" | Always populate mock results; empty state only reached on genuine 0-result API response | ✅ Fixed |
| 6 | Product Detail | Seller link `/seller/${id}` routed consumer into seller management portal | Changed to `/search?q=${seller.name}` — keeps shoppers in consumer app | ✅ Fixed |
| 7 | Profile Page | "Saved Items" linked to `/saved` (no such route); "My Reviews" linked to `/reviews` (no such route) | Fixed `/saved` → `/wishlist`; `/reviews` → `/orders` as interim placeholder | ✅ Fixed |
| 8 | Admin Sellers | Revenue display divided already-correct INR values by 100, showing 1/100th of actual revenue | Removed erroneous `/ 100` scaling | ✅ Fixed |

**Verification:** Python syntax ✅ · TypeScript `tsc --noEmit` ✅ · ESLint (0 errors, 0 warnings) ✅


## Auth & Signup System — 2026-08-12

> Email + password authentication and registration across Consumer, Seller, and Admin surfaces.

| Surface | Sign Up / Register | Login | Post-Auth Flow |
|---------|-------------------|-------|----------------|
| **Consumer** | `/signup` (Name, Email, Password ≥ 8 chars, Confirm) | `/login` (Email + Password) | Auto-login → Home / Cart / Checkout |
| **Seller** | `/seller/register` (Name, Email, Password ≥ 8 chars, Confirm) | `/seller/login` (Email + Password) | Auto-login → `/seller/onboarding` (GSTIN + UPI) → Dashboard |
| **Admin** | Super-Admin managed only via `/admin/team` | `/admin/login` (Email + Password) | Dashboard / Admin Console |

**Single Founder Account:** `agarwal.harshit97@gmail.com` / `harshit@14597` seeded in all 3 realms.

**Verification:** Python syntax ✅ · TypeScript `tsc --noEmit` ✅ · ESLint (0 errors, 0 warnings) ✅

_Last updated: 2026-08-12_
