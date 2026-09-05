# CollabKaro — Master Product Requirements Document (PRD)

> **Living Document & Source of Truth for Product Requirements.** Any changes to features, scope, or user journeys must be recorded in this document along with an entry in the Revision History below.

---

## Revision History

| Version | Date | Author | Description of Changes |
|---|---|---|---|
| 1.0 | 2026-09-05 | Harshit Agarwal | Initial Master PRD & core marketplace business requirements |
| 1.1 | 2026-09-05 | Harshit Agarwal | Enhanced PRD with competitor feature parity (GRIN, Insense, Modash, Qoruz), India-first financial compliance (TDS/GST/UPI), regional language support, WhatsApp inbound conversion, and React Native mobile app scope alignment. |

---

## 1. Product Decision & Vision

Build **CollabKaro**, a production-grade, India-first, two-sided marketplace and operating system for brands, agencies, influencers, UGC creators, affiliate partners, and offline event hosts. It governs the end-to-end campaign lifecycle:

`discover → attract → qualify → negotiate → contract → fund → create → approve → publish/deliver → measure → pay → retain`

The product powers inbound marketplace matches, external social outreach, customer-to-creator conversions, agency program management, and offline brand activations. It is a full-stack web application and mobile application backed by a server-side REST API, dual-mode relational database (SQLite/Postgres), escrow-style protected payments, and an administrator console.

---

## 2. Users and Jobs to Be Done

| User Persona | Key Jobs to Be Done |
|---|---|
| **Brand Owner / Marketer** | Find verified creators who fit campaign specs, negotiate transparent rates, control content quality/claims, fund protected milestones, and measure ROI/conversions. |
| **Agency Account Manager** | Manage multi-client brand workspaces with strict data isolation, source creators in bulk, route deliverables for client review, and generate white-label reports. |
| **Influencer / Creator** | Showcase a public, shareable media kit with live stats and transparent rate cards, receive direct brand offers, pitch custom counter-rates, submit content, and get paid instantly via UPI. |
| **UGC Creator** | Sell high-converting ad video assets to brands without needing an existing social media audience. |
| **Offline / Event Host** | Discover local store launches, event appearances, and campus ambassador gigs; check in via GPS/QR code and receive instant travel/participation payouts. |
| **Finance / Legal Counsel** | Approve standard contracts, verify brand GSTIN/PAN and creator bank/UPI details, manage TDS (194J/194O) withholding, generate e-invoices, and audit payment trails. |
| **Platform Administrator** | Verify brand businesses and creator credentials, flag anomalous engagement/fake followers, moderate campaign briefs, and resolve deal room disputes. |

---

## 3. Key Market Differentiators & Competitor Coverage

CollabKaro absorbs the strongest capabilities from global market leaders (**GRIN, Insense, Modash, Aspire, CreatorIQ, impact.com**) while solving major gaps in the Indian market (**Qoruz, Hypee, GoodCreator**):

1. **India-First Financial & Tax Operations**:
   - Automated **TDS Deduction (Section 194J for professional services / 194O for e-commerce)** calculation and quarterly Form 26AS reporting export.
   - **GST E-Invoicing & B2B Compliance**: Automated tax invoice generation with GSTIN validation for registered creators and brands.
   - **Instant UPI & Bank Payouts**: Integration with Indian payout gateways (Razorpay Route / Cashfree) for instant 24/7 payouts upon milestone approval.
2. **Vernacular & Regional Language Intelligence**:
   - Campaign briefs, application pitches, and media kits available in 8 regional Indian languages (Hindi, Hinglish, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati).
   - City and tier-2/tier-3 regional audience reach filtering.
3. **WhatsApp & Social Inbound Deal Room Conversion**:
   - Public creator media kits and brand call pages generate deep links and WhatsApp inquiry conversion widgets, turning informal WhatsApp DMs into governed CollabKaro deals.
4. **Meta Partnership Ads & Whitelisting Authorization**:
   - Built-in management for Meta Partnership Ad codes, TikTok Spark Ad codes, and YouTube BrandConnect authorization right inside the Deal Room.
5. **Product Seeding & Barter Logistics**:
   - E-commerce integration (Shopify / Shiprocket) allowing brands to send product samples for seeding/barter campaigns with automated courier tracking and delivery confirmation.

---

## 4. Required Product Modules

### 4.1 Identity, Onboarding and Verification
- Dual authentication: Email/password, Mobile SMS OTP (Indian gateways), and Google OAuth.
- Distinct onboarding paths for Creators, Brands, Agencies, and Talent Managers.
- Creator social account verification via official OAuth APIs (Instagram Graph API, YouTube Data API, LinkedIn).
- Brand business verification: Business email domain, GSTIN/PAN check, CIN documents, and manual admin verification badge.
- Role-Based Access Control (RBAC): Creator, Brand Owner, Marketer, Agency Admin, Finance Manager, Super Admin.

### 4.2 Creator Profile, Portfolio and Media Kit
- Profile details: Bio, photos, city/state, travel availability, languages, niches, and self-reported vs verified stats.
- Packaged Service Catalogue: Fixed-rate service cards (e.g., 1x IG Reel, 1x UGC Video, 1x Story post) with turnaround times and usage rights included.
- Rate Cards: Public "starting at" prices, invite-only pricing, or custom quote requests.
- Shareable Media Kit: Public, mobile-optimized web page (`collabkaro.com/c/:handle`) with live follower metrics, top posts, service rate cards, inquiry form, and QR code.

### 4.3 Brand Workspaces and Campaign Brief Builder
- Multi-client Agency workspaces with isolated client data boundaries.
- Campaign Brief Builder: Objective selection, target audience specs, creator eligibility filters, total/per-creator budget, deliverable specs, mandatory/forbidden claims, hashtags, CTAs, usage rights duration, and approval SLA.
- Brief Visibility: Public marketplace call, creator segment invite, or private direct offer.
- Applicant Funnel: `Invited → Applied → Shortlisted → Offer Sent → Contracted → Delivered → Paid`.

### 4.4 Discovery, Matching and Intelligence
- Multi-parametric search: Platform, niche, city/radius, language, follower range, engagement rate, average views, service rate, barter acceptance, and safety score.
- Explainable AI Match Score: Clear breakdown showing why a creator matches a campaign brief (topic fit, audience demographic fit, budget alignment, availability).

### 4.5 Deal Room, Negotiation and Contracts
- One unified **Deal Room** per active match containing real-time chat, versioned offer terms, media file attachments, contract e-signatures, and payment milestone trackers.
- Counter-offer negotiation: Fees, barter product value, deliverable revisions, exclusivity periods, usage rights, and cancellation terms.
- Automated Standard Collaboration Contract generation with versioned, immutable agreement audit trails.
- Usage Rights Ledger: Track channel, territory, organic vs paid usage, start/end dates, and renewal fees for every delivered asset.

### 4.6 Deliverable Approval & Asset Library
- Content Deliverable Lifecycle: `Not Started → In Progress → Draft Submitted → Revisions Requested → Approved → Published → Paid`.
- Version control for video/image drafts with side-by-side comparison and timestamped comments.
- Published Post Tracking: Submit live Instagram Reel / YouTube video URL; system archives post evidence and validates FTC/ASCI compliance disclosures.

### 4.7 Payments, Escrow & Financial Ledger
- **Protected Milestone Payments**: Brand funds campaign milestone prior to content creation; funds are held in protected ledger and released to creator upon deliverable approval.
- Payment Methods: UPI, Net Banking, Credit/Debit Cards, Corporate Netbanking (INR settlement).
- Automated TDS Deduction (194J/194O) and downloadable quarterly tax statements.
- Two-way dispute resolution workflow with admin evidence review and hold overrides.

### 4.8 Offline Events & Local Activation
- Local store launch, campus ambassador, and offline event campaign briefs.
- Geofenced venue check-in via GPS and organizer QR/OTP code scan.
- Travel reimbursement and physical attendance verification.

### 4.9 Creator Mobile Application (iOS & Android)
- Built with **React Native & Expo** (spec defined in [`MOBILE_APP_PRD.md`](MOBILE_APP_PRD.md)).
- On-the-go campaign discovery, one-tap pitching, mobile Deal Room chat, instant push notifications, video proof uploader, and instant UPI earnings withdrawal.

---

## 5. Business Rules & Security Boundaries

1. **Security Gate**: Server-side permission check is mandatory on every API route. Client UI check is UX only.
2. **Brand Scoping**: All brand database queries must include `WHERE org_id = :org_id`.
3. **Immutable Audit Trails**: All finance releases, contract approvals, user suspensions, and dispute resolutions write unalterable rows to `audit_logs`.
4. **Data Isolation**: Never expose hashed passwords, OTP secrets, or internal payment credentials in API responses.

---

## 6. Release Plan

- **Phase 1 (Core Web Marketplace MVP)**: Auth & RBAC, Creator Profiles & Media Kits, Brand Brief Builder, Applicant Funnel, Deal Room Chat, Contract Generation, Protected Milestone Payments, Admin Verification Console.
- **Phase 2 (Mobile App & Integrations)**: React Native Creator Mobile App, Push Notifications, Shopify / Shiprocket Product Seeding, Meta Partnership Ad Code Authorization, Vernacular Briefing (8 Indian Languages).
- **Phase 3 (Enterprise & AI)**: Advanced AI Content Verification, Agency White-Labeling, Competitor Watchlists, Multi-Country Settlement.
