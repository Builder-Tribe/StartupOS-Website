# CollabKaro — Master Product Requirements Document

**Idea Builder workspace:** `CollabKaro`

## 1. Product decision

Build **CollabKaro**, a production-grade, India-first, two-sided marketplace and operating system for brands, agencies, influencers, UGC creators, affiliate partners and offline creators. It must support the full lifecycle:

`discover → attract → qualify → negotiate → contract → fund → create → approve → publish/deliver → measure → pay → retain`

The product must work for inbound marketplace matches, external social-media outreach, referrals, agencies and offline activations. It is a real web application with a server-side API, relational database, persistent storage, payment workflow, integration boundaries and an administrator console.

## 2. Users and jobs to be done

| User | Jobs |
|---|---|
| Brand owner / marketer | Find creators who meet precise campaign needs, contract them, control budget/content, and prove results. |
| Agency | Run segregated client programs, source/manage creators and report outcomes. |
| Creator / influencer | Be discoverable, present a credible media kit, find paid work, agree scope fairly, deliver content and get paid. |
| UGC creator | Sell ad-ready assets without needing audience reach. |
| Offline creator | Find local store, campus, launch and event activations. |
| Finance/legal | Approve contracts, payments, tax documents and audit trails. |
| Administrator | Verify users, moderate listings, resolve disputes and manage platform risk. |

## 3. Objectives and success criteria

Primary: a brand can post or send a requirement, and relevant creators can discover or be invited to it; both can complete a governed collaboration and payment in the platform.

Launch success measures: qualified applications per campaign; brand-to-hire conversion; creator response rate; time to first shortlisted creator; on-time delivery; funded-deal rate; payout time; repeat brand/creator rate; dispute rate; GMV; verified creator coverage.

## 4. Personas, segments and supported collaboration types

Creator tiers: nano, micro, mid-tier, macro, celebrity. Segments: influencer, UGC creator, affiliate, campus ambassador, event host, photographer/videographer, regional-language/local creator, podcaster/blogger and talent manager.

Campaign types: sponsored post, Instagram Reel/story/carousel, YouTube integration/Short/video, UGC ad asset, review, unboxing, product seeding, affiliate, gifting/barter, paid-plus-commission, brand ambassador, livestream, event appearance, retail/store visit, campus activation, photoshoot, referral and whitelisted/partnership ad.

## 5. Required product modules

### 5.1 Identity, onboarding and verification

- Email/password, mobile OTP, Google sign-in; optional social sign-in.
- Separate creator, brand, agency and manager onboarding paths.
- Creator profile validation, social-account connection through official OAuth/API where available, bank/UPI payout setup and consent capture.
- Brand verification: business email/domain, GSTIN/PAN/CIN fields, documents and manual approval workflow.
- Account status: draft, submitted, verified, rejected, restricted, suspended.
- MFA for finance admins and payout-detail changes.
- Terms, privacy, data-connection and marketing-consent records versioned and auditable.

### 5.2 Creator profile, portfolio, media kit and services

- Bio, photo, city/state, travel availability, languages, pronouns optional, niches and sub-niches.
- Connected platforms and channel-level metrics; public, private and self-reported data visually distinguished.
- Audience geography/demographics/interests, engagement, average views, growth, posting frequency and quality/safety score when data is available.
- Portfolio links/files/case studies, past collaborations, testimonials and credentials.
- Service catalogue: platform, format, quantity, base price, turnaround, revisions, audience posting versus UGC-only, included usage rights and add-ons.
- Rate cards: public, “from” price, invite-only or quote required.
- Availability calendar and work-status toggle.
- Public, shareable, SEO-safe media kit with inquiry form, QR code and source attribution.
- Creator dashboard: profile completion, views, invites, applications, deal status, earnings, content tasks, performance and reviews.

### 5.3 Brand and agency workspaces

- Brand profile, category, website/social links, target customer, locations, tone, restricted claims, brand guidelines and approval owners.
- Agency has client workspaces with strict data isolation, client roles, campaign permissions and report export.
- Organization member invites and RBAC: owner, marketer, campaign manager, finance, legal, analyst, viewer.
- Brand dashboard: campaign funnel, outstanding approvals, deadlines, spend, creator performance, messages and payment actions.

### 5.4 Discovery, intelligence, lists and matching

- Search filters: platform, service type, niche, keywords, hashtags, content language, creator city/radius, audience city/state/country, follower/subscriber range, average views, engagement, price, availability, tier, verified status, audience demographics, safety score, UGC-only, event availability, barter acceptance and prior industry experience.
- Search results with filters, sort, map/list options, compare view, saved searches and export.
- Creator detail: content, audience, rate, availability, posts, history, score explanation, ratings and brand-conflict indicator.
- Creator lists, tags, private team notes and pipeline stages.
- Matching score must be explainable: eligibility, audience fit, topic fit, location/language, budget, format, availability and quality. A score must never auto-contract a creator.
- Similar creator/lookalike suggestions in Phase 2.
- Brand mention, trend and competitor watchlists in Phase 2 using lawful public/authorized data.

### 5.5 Campaign briefs, public calls and applications

- Templates by objective and campaign type.
- Fields: objective/KPI, product, audience, campaign location, creator eligibility, total/individual budget, compensation type, content deliverables, dates, milestones, required and prohibited claims, hashtags, CTA, disclosure, links/codes, asset pack, usage rights, exclusions, review count, team approvals, cancellation policy.
- Visibility: public, creator-segment, invite-only, private direct offer.
- Branded public campaign page, share link, QR code, UTM/referral source tracking and application form.
- Creator feed with match reasons, filters, save/hide campaign, question submission and application/pitch/counter-rate.
- Brand applicant funnel: invited, applied, incomplete, shortlisted, interview, offer, accepted, rejected, withdrawn, contracted, delivered and paid.
- Bulk invite/reject, message templates, due-date reminders, internal notes and export.

### 5.6 External online and offline acquisition

- Creator media-kit inquiry form turns Instagram/YouTube/LinkedIn/email/WhatsApp/referral inbound into a platform lead/deal.
- Brand campaign page turns social posts, website embeds, QR codes, WhatsApp and offline event promotion into attributable applications.
- Lead CRM records source, consent, owner, stage and follow-up task.
- CSV import only for consented contacts; do-not-contact and unsubscribe controls.
- Offline campaigns include date/time, venue, city/radius, check-in method, travel/reimbursement, physical deliverables, event host contact and proof requirements.
- QR/OTP check-in with creator consent; manual organizer override with audit log.

### 5.7 Deal room, negotiation, contract and compliance

- Each accepted match has one Deal Room that contains chat, offers, deal terms, assets, deliverables, approval history, payments, contract, and event stream.
- Chat supports text, attachments, replies, reactions and system status messages. Messages are immutable except policy-compliant redaction.
- Offer/counter-offer fields: fees, tax treatment, barter value, commission, deliverables, timeline, milestone payout, revision count, travel, exclusivity, cancellation and late-delivery terms.
- Versioned immutable terms; users can compare versions before accepting.
- Contract templates with populated deal data and e-signature provider integration.
- Usage-rights ledger per deliverable: owner, channels, territory, start/end dates, organic/paid usage, exclusivity, renewal price and revocation status.
- Disclosure checklist for sponsored content and restricted-category review queue.

### 5.8 Asset, content and publishing workflow

- Brand Asset Library: files, links, logos, product images, inspiration, approved claims, forbidden claims, brand guidelines, music rules, caption/CTA and expiry.
- Deliverable states: not started, in progress, submitted, changes requested, approved, scheduled, published/delivered, rejected, overdue.
- Upload source files or submit hosted/post URL; asynchronous malware scan and video processing.
- Version history, side-by-side comparison, timestamped comments and asset annotations.
- Revision counter, SLA, approval deadline and escalation/reminder rules.
- Content calendar and creator task view.
- Capture public post URL, date, disclosure, screenshots/archival evidence and approved ad authorization IDs where applicable.
- Phase 2: automatic permitted post collection, searchable content library and rights-expiry alerts.

### 5.9 Payments, tax, payout, refund and disputes

- Quote/offer → invoice/payment request → funding authorization → milestone release → creator payout → invoice/statement lifecycle.
- INR-only MVP: UPI, cards, net banking, bank transfer; save no card data.
- Payment types: fixed, barter, commission, hybrid and performance bonus.
- Deal ledger with immutable entries, idempotent payment webhooks and reconciliation status.
- Creator payout preferences: verified bank account and/or supported UPI; changes require re-verification.
- GST invoice fields, TDS metadata/withholding support, credit notes and downloadable statements. Tax computation requires professional validation.
- Refunding: full, partial, cancellation and dispute-hold flows with both-party evidence and admin decision audit.
- Payment release must require the agreed condition, authorized approver and verified payment provider event.
- Never call a payment flow “escrow” unless a regulated/contracted provider and legal structure allow it. Use “protected milestone payment” otherwise.

### 5.10 Affiliate, ecommerce and attribution

- Promo code, tracked-link and commission-rule generation.
- Link/coupon usage, click, order, return/cancellation and commission ledger via ecommerce webhooks/imports.
- Attribution model visible per campaign (last click, code attribution, assisted; exact method specified in agreement).
- Shopify integration first; commerce connectors Phase 2.

### 5.11 Reporting, measurement and intelligence

- Campaign/creator/program reporting: planned vs actual spend, deliverables, reach, impressions, views, engagement, engagement rate, clicks, conversions, revenue, CPE, CPM, CPC, CPA, ROAS, code sales and payout.
- Metrics show source and update time: first-party verified, authorized provider, self-reported, or manually evidenced.
- Creator scorecard, content scorecard, budget pacing, top-performing creator/content and audience breakdown.
- Export CSV/PDF; scheduled report in Phase 2.
- Analytics must not fabricate unavailable platform data.

### 5.12 Trust, safety, reviews and support

- Creator and brand verification badges with explicit status/reason—not a vague “verified”.
- Quality flags: suspicious growth/engagement, repeated portfolio asset, failed KYC, payment failure, prohibited category and policy reports.
- Flag is not a guilt determination; it requires human review, supporting evidence and appeals process.
- Two-sided post-deal ratings: communication, scope clarity, timely delivery/payment, content quality and professionalism.
- Report/block user, support ticket, dispute case, evidence upload, case SLA and admin decision workflow.
- Admin console for KYC/brand review, campaign moderation, content report, payments, fees, disputes, fraud signals, support, configuration and audit logs.

### 5.13 AI assistant: guarded, not autonomous

- Phase 2 assistant can draft campaign briefs, identify missing brief fields, recommend matches, draft outreach, summarize applications, suggest prices, tag content and draft reports.
- It must label generated output and cite the workspace data used.
- It may propose actions but cannot message externally, change binding terms, approve content, release funds, or sign contracts without an explicit human confirmation per action.

## 6. UX requirements

Public: landing page, creator directory, campaign directory, creator kit, campaign call, pricing, safety, help and authentication.

Creator app: overview, profile/media kit, opportunities, applications, deals, content tasks, calendar, earnings/invoices, analytics, reviews and settings.

Brand app: overview, creator discovery, saved lists, campaigns, applicants, deals, asset library, content approvals, payments, analytics, team and settings.

Admin app: queues, cases, users, campaigns, payment ledger, dispute center, moderation, reports, configuration and audit.

Design: mobile-first responsive, WCAG-conscious, clear status systems, empty/error/loading states, keyboard support, English/Hindi MVP and localization-ready design.

## 7. Business rules

1. Campaign may be published only after required brief, brand verification status and policy checks pass.
2. An offer binds only after both parties accept the same terms version and any required contract is completed.
3. A payout is not released on a front-end click alone; server validates role, state, milestone, dispute status and payment-provider state.
4. Creator contact details remain private until allowed by user settings or deal policy.
5. Creator social data is shown only with consent and source provenance.
6. Deleted content must follow retention and legal-hold policy; audit entries remain protected.
7. External platform policy and local legal/tax requirements override product defaults.

## 8. Release plan

### MVP (production beta)

Identity/RBAC; verified brand/creator profiles; media kits; search and lists; campaign brief/public calls; applications/direct offers; deal room/chat; versioned terms; contract integration; assets/content revisions/approval; protected milestone payments; basic invoice/ledger; UPI/bank payout integration; offline campaign basics; reporting core; reviews/disputes/admin; responsive web; deployment and monitoring.

### Phase 2

Affiliate and Shopify; product seeding/shipping; lookalikes; AI assistant; social listening; competitor intelligence; automated permitted post capture; ad-authorization workflows; agency workspace; outbound sequences; Hindi/local-language UI; content rights library; advanced fraud/data provider.

### Phase 3

Native apps; enterprise SSO/SCIM; multi-country payments; advanced attribution; CRM/API; white-label agency; complex workflow automation and predictive models.

## 9. Acceptance tests

1. A verified brand creates a public campaign with all required terms and assets.
2. An eligible creator finds it, applies with a pitch and negotiates a revised rate.
3. Both view and accept an identical versioned deal; contract record is stored.
4. Brand funds a milestone; system records provider event idempotently.
5. Creator uploads a draft; brand comments, asks for revision and approves a new version.
6. Creator submits live-post proof or UGC final asset; analytics display data provenance.
7. Authorized finance user releases payout; creator sees ledger and invoice/statement.
8. A disputed deal blocks payment release and produces an admin case with complete audit history.
9. An offline creator checks into an event using authorized QR/OTP; event proof is recorded.
10. Brand/agency/team permissions prevent cross-workspace data access.

## 10. Out of scope for MVP

Native mobile applications, non-INR settlement, unapproved social automation, raw payment-card storage, unlicensed escrow claims, automated legal/tax advice, and any social scraping that violates platform terms.
