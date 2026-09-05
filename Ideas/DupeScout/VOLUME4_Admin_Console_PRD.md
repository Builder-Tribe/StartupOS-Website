# DUPESCOUT — VOLUME 4
## Admin Console — Complete PRD

**Classification:** Confidential — Founding Document  
**Version:** 1.0 | **Date:** July 2026  
**Part of:** DupeScout Founder Blueprint (6-Volume Series)

---

# TABLE OF CONTENTS — VOLUME 4

1. Admin Console Philosophy
2. Role-Based Access Control (RBAC)
3. Admin Console Architecture
4. Seller Management
5. Catalog & Inventory Management
6. Order Management
7. Customer Management
8. Finance & Payments
9. Trust & Safety System
10. Fraud Detection
11. Dispute Resolution
12. AI Moderation System
13. Analytics & Growth Dashboards
14. Feature Flags & Experimentation
15. Content Management
16. Notifications & Communications
17. System Health & Monitoring
18. Data Models — Admin Domain
19. Admin API Specifications

---

# SECTION 1: ADMIN CONSOLE PHILOSOPHY

## Why the Admin Console Is a Strategic Asset

Most startups build admin consoles as an afterthought — a basic CRUD dashboard thrown together in a week. This is a massive mistake for a marketplace business.

At DupeScout, the admin console is the **nervous system of the business.** Every day, the operations team will:
- Review hundreds of new seller applications
- Moderate thousands of product listings
- Resolve disputes between buyers and sellers
- Monitor fraud signals in real-time
- Experiment with ranking algorithms
- Track growth metrics against weekly targets

An admin console that requires 10 clicks to do a 2-click job costs hours of team time daily. An admin console that doesn't surface the right signal at the right time creates blind spots that become business crises.

**Admin Console Design Principles:**

1. **Action-first:** Every screen should end in an action, not just information. Surface what needs to be done, not just what's happening.
2. **Confidence indicators:** Show team members how confident the AI is. A 94%-confidence fraud flag warrants immediate action. A 51%-confidence flag warrants more investigation.
3. **Audit trails everywhere:** Every admin action — approving a seller, removing a listing, issuing a refund — is logged with who did it, when, and why.
4. **Escalation paths:** When a frontline operations team member is unsure, the system should make escalation easy, with context preserved.
5. **Speed as respect for team time:** Admin teams process hundreds of items daily. Bulk actions, keyboard shortcuts, and batch processing are not nice-to-haves — they are core design requirements.

---

# SECTION 2: ROLE-BASED ACCESS CONTROL (RBAC)

## Admin Roles

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **Super Admin** | CTO/CEO access; full system control | All permissions; can create/modify other admin roles |
| **Operations Lead** | Manages daily operations team | Seller approval, catalog moderation, dispute resolution, reports |
| **Catalog Moderator** | Reviews product listings | Approve/reject listings, edit metadata, flag for review |
| **Seller Support** | Handles seller queries and issues | View seller data, process refunds, resolve disputes |
| **Customer Support** | Handles customer queries | View order data, initiate returns, contact sellers |
| **Trust & Safety** | Fraud detection and enforcement | View all flags, suspend/ban sellers, access fraud data |
| **Finance** | Payments and reconciliation | View payment data, initiate payouts, financial reports |
| **Growth / Product** | Analytics and experimentation | View all analytics, manage feature flags, A/B tests |
| **Engineering** | Technical operations | System health, API monitoring, database access (read-only) |

## Permission Matrix

| Permission | Super Admin | Ops Lead | Catalog Mod | Seller Support | Trust & Safety | Finance |
|-----------|-------------|----------|-------------|----------------|----------------|---------|
| Approve sellers | ✓ | ✓ | | | | |
| Suspend/ban sellers | ✓ | ✓ | | | ✓ | |
| Approve/reject listings | ✓ | ✓ | ✓ | | | |
| View seller financial data | ✓ | ✓ | | ✓ | | ✓ |
| Process refunds | ✓ | ✓ | | ✓ | | ✓ |
| Resolve disputes | ✓ | ✓ | | ✓ | ✓ | |
| Access fraud data | ✓ | ✓ | | | ✓ | |
| Manage feature flags | ✓ | | | | | |
| View all analytics | ✓ | ✓ | | | | |
| Edit user data | ✓ | | | | | |
| Create admin users | ✓ | | | | | |

---

# SECTION 3: ADMIN CONSOLE ARCHITECTURE

## Navigation Structure

```
ADMIN CONSOLE — PRIMARY NAVIGATION
─────────────────────────────────────────────────────────
📊  Overview         → Real-time business dashboard
🏪  Sellers          → Seller management + approvals
📦  Catalog          → Product moderation + management
🛒  Orders           → Order monitoring + intervention
👥  Customers        → User management
💰  Finance          → Payments + payouts + reconciliation
🛡️  Trust & Safety   → Fraud + moderation + disputes
📈  Analytics        → Growth + performance dashboards
⚗️  Experiments      → Feature flags + A/B tests
📢  Communications   → Notifications + email + push
⚙️  Settings         → System config + admin users
🔧  Engineering      → Health monitoring + logs
─────────────────────────────────────────────────────────
```

## Overview Dashboard — The Operations War Room

```
┌─────────────────────────────────────────────────────────────────┐
│  DUPESCOUT ADMIN — OVERVIEW                    Today: Jul 31    │
├─────────────────────────────────────────────────────────────────┤
│  LIVE PLATFORM STATUS                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ ORDERS   │ │ GMV      │ │ NEW      │ │ ACTIVE   │         │
│  │ Today    │ │ Today    │ │ USERS    │ │ SESSIONS │         │
│  │ 2,847    │ │ ₹58.4L   │ │ 1,204   │ │ 34,821   │         │
│  │ ↑ 12%    │ │ ↑ 18%    │ │ ↑ 8%    │ │ live     │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
├─────────────────────────────────────────────────────────────────┤
│  ACTION QUEUE — Needs Your Attention                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🔴 HIGH PRIORITY                                        │   │
│  │ • 3 fraud flags requiring manual review (>85% conf.)   │   │
│  │ • 2 disputes unresolved for >48 hours                  │   │
│  │ • 1 seller reported for counterfeit goods (verified)   │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ 🟡 MEDIUM PRIORITY                                      │   │
│  │ • 47 seller applications awaiting approval             │   │
│  │ • 124 listings in moderation queue (>24h)              │   │
│  │ • 18 return disputes open                              │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ 🟢 INFO                                                 │   │
│  │ • New feature flag "visual_search_v3" ready to deploy  │   │
│  │ • Week 31 growth report available                      │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  KEY METRICS (Last 7 Days)                                      │
│  [7-day line chart: GMV, Orders, New Users — overlaid]         │
│                                                                 │
│  Sellers approved:      84    Sellers suspended: 3             │
│  Listings approved:   3,201   Listings rejected: 47            │
│  Disputes resolved:     124   Avg resolution: 18h              │
│  Fraud blocks (auto):   312   False positive rate: 4.2%        │
├─────────────────────────────────────────────────────────────────┤
│  PLATFORM HEALTH                                                │
│  API Latency: 124ms ✓    Error Rate: 0.04% ✓    DB: OK ✓      │
│  AI Search: 1.8s avg ✓   Payment Success: 98.7% ✓             │
└─────────────────────────────────────────────────────────────────┘
```

---

# SECTION 4: SELLER MANAGEMENT

## Seller Approval Workflow

The most high-volume admin task in the early months. Process target: <24 hours for all seller applications.

### Seller Application Review Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  SELLER APPLICATION #SA-4821           Applied: Jul 31, 9:14 AM│
│  AI Assessment: ✅ LIKELY LEGITIMATE (87% confidence)           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  APPLICANT DETAILS                                              │
│  Business Name:    Malti Handicrafts                           │
│  Owner Name:       Malti Sharma                                │
│  Phone:            +91 98765 XXXXX (verified via OTP)          │
│  Location:         Jodhpur, Rajasthan                          │
│  Category:         Home & Decor                                │
│  GST:              08XXXXX3456F1Z5 (✓ GST API verified)       │
│  PAN:              ABCPS1234F (✓ Format valid)                 │
│  Bank:             HDFC ****4521 (✓ Penny drop verified)       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  DOCUMENTS UPLOADED                                             │
│  GST Certificate:   ✓ Valid  |  [View Document]                │
│  Aadhaar:           ✓ Valid  |  [View Document]                │
│  Sample Photos:     3 photos |  [View Photos]                  │
│                                                                 │
│  SAMPLE PRODUCT PHOTOS (AI Analysis)                           │
│  [Photo 1] [Photo 2] [Photo 3]                                 │
│  AI: "Handcrafted wooden furniture. Appears genuine handmade.  │
│       No brand logo or trademark issues detected. Quality      │
│       appears good from photos. Consistent with claimed        │
│       category."                                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  RISK SIGNALS                                                   │
│  ✓ GST address matches phone GPS location (Jodhpur)           │
│  ✓ No previous account with this phone/PAN                    │
│  ✓ Business age: GST registered 3 years ago (established)     │
│  ⚠ Phone number new to Jio network (<6 months) — low risk     │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  SIMILAR SELLERS FOR REFERENCE                                  │
│  3 approved sellers in Jodhpur Furniture category → view       │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  REVIEWER NOTES                                                 │
│  [Text field for reviewer notes — saved to audit log]          │
│                                                                 │
│  DECISION                                                       │
│  [✓ Approve]  [✗ Reject]  [? Send for More Info]  [⚑ Escalate]│
│                                                                 │
│  If rejecting, select reason:                                  │
│  ○ Invalid documents   ○ Suspicious activity                   │
│  ○ Prohibited category ○ Duplicate account                     │
│  ○ Incomplete info     ○ Other: [text field]                   │
└─────────────────────────────────────────────────────────────────┘
```

**FR-SA-001: Automated Pre-screening**
- Before reaching human reviewer, every application undergoes automated checks:
  - GST validation via GSTN API
  - PAN format validation
  - Phone number risk score (operator data, account age)
  - Address match between documents
  - Sample photo analysis for brand infringement
  - Duplicate account detection (same PAN, phone, or bank account)
- AI confidence score computed (0-100%)
- Applications >90% confidence: can be auto-approved (admin configures threshold)
- Applications <40% confidence: escalated to Trust & Safety

**FR-SA-002: Seller Status Management**

Admin can change seller status:

| Action | When Used | Effect |
|--------|----------|--------|
| Approve | Valid application | Seller can start listing |
| Reject | Invalid docs / policy violation | Seller notified with reason |
| Suspend | Policy violation (temporary) | All listings hidden; orders frozen |
| Reinstate | After suspension period | All listings restored |
| Permanent Ban | Severe / repeat violations | Account disabled; cannot re-apply |
| Flag for Review | Suspicious activity | Assigns to Trust & Safety team |

**FR-SA-003: Seller Communication**
- Approve: automatic WhatsApp + email "Welcome to DupeScout"
- Reject: message with specific reason and what to fix/resubmit
- Suspend: message with violation details and appeal process
- All status changes logged to seller's audit trail

---

# SECTION 5: CATALOG & INVENTORY MANAGEMENT

## Product Moderation Queue

Product moderation is the highest-volume repetitive task for catalog teams. The interface must be optimized for speed: keyboard shortcuts, bulk actions, AI-assisted review.

### Moderation Queue Interface

```
┌─────────────────────────────────────────────────────────────────┐
│  CATALOG MODERATION                [Pending: 124]  [Today: 47] │
│  Sort: Oldest first ▼   Filter: All categories ▼   [Bulk Mode] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PRODUCT #P-88241  [New Listing]           Submitted: 4h ago   │
│  Seller: Jodhpur Crafts Co. (⭐ Verified, 4.8★, 2,400 orders)  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Img 1]  [Img 2]  [Img 3]  [Img 4]  [Img 5]          │   │
│  │                                                          │   │
│  │  Handcrafted Brass Incense Holder — Set of 3            │   │
│  │  Category: Home Decor > Aromatherapy                    │   │
│  │  Price: ₹890                                            │   │
│  │  Material: Brass, Handcrafted                           │   │
│  │  Style Tags: Bohemian, Artisan, Wabi-sabi               │   │
│  │  Description: [Full text expanded]                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  AI MODERATION REPORT                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Overall: ✅ LIKELY COMPLIANT (91% confidence)           │   │
│  │                                                         │   │
│  │ Brand check:      ✓ No trademark detected               │   │
│  │ Image quality:    ✓ Good (5 clear photos)               │   │
│  │ Description:      ✓ Accurate to images                  │   │
│  │ Category match:   ✓ Correct category                    │   │
│  │ Price sanity:     ✓ Within normal range                 │   │
│  │ Restricted items: ✓ None detected                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [✓ Approve]  [✗ Reject]  [Edit & Approve]  [Flag: Trademark]  │
│  Keyboard: A = Approve, R = Reject, N = Next                   │
└─────────────────────────────────────────────────────────────────┘
```

**FR-CM-001: AI Auto-Approval**
- Products with AI confidence >92% and from sellers with >50 verified orders and >4.5 rating: auto-approved
- Products from new sellers always go through human review for first 30 listings
- Products with any trademark/brand flag always go to human review, regardless of seller history

**FR-CM-002: Bulk Moderation**
- Bulk approve: select multiple listings → approve all
- Bulk reject with reason: select multiple → choose rejection reason → reject all
- Batch review mode: reviewer goes through queue one-by-one, approving/rejecting with single keypress

**FR-CM-003: Rejection Reasons (Seller Communication)**
When rejecting, admin selects reason which auto-generates seller-facing message:

| Rejection Code | Seller Message |
|---------------|----------------|
| `brand_infringement` | "Your listing contains a brand name that appears to be a trademark. Remove the brand name from your title/description and resubmit." |
| `quality_low` | "The product photos don't meet our minimum quality standard. Please upload at least 5 clear, well-lit photos and resubmit." |
| `category_wrong` | "This product was submitted in the wrong category. Please resubmit in [correct category]." |
| `price_suspicious` | "The listed price appears inconsistent with the product. Please verify and resubmit with accurate pricing." |
| `description_inaccurate` | "The product description doesn't accurately reflect what's shown in the photos. Please update and resubmit." |
| `restricted_item` | "This product type is not currently permitted on DupeScout. See our restricted items policy." |
| `insufficient_info` | "Key product details are missing. Please add: [specific missing fields] and resubmit." |

**FR-CM-004: Catalog Search & Edit**
- Admin can search entire product catalog by: product name, seller, category, status, date range
- Admin can directly edit any product field (with audit trail)
- Admin can force-archive a product (completely hide from all surfaces)
- Admin can override similarity scores if AI error detected

---

# SECTION 6: ORDER MANAGEMENT

## Order Monitoring Dashboard

The operations team must be able to identify and intervene in problem orders quickly.

**Key monitoring views:**

**FR-OM-001: At-Risk Orders**
Orders flagged for potential problems:
- Not shipped 24h after acceptance
- Carrier shows "delivery exception" for >48h
- Buyer has complained
- Payment disputed

**FR-OM-002: Order Intervention**
Admin can:
- Force-cancel an order (with full refund)
- Force-approve a refund (without seller approval)
- Reassign order to alternative seller (extreme case)
- Manually update tracking information
- Contact buyer or seller directly from order page

**FR-OM-003: Order Analytics**
- Order volume by category, seller, time of day
- Shipping performance: on-time delivery rate by carrier
- Return rate trends: by category, seller, reason
- COD conversion rate (COD orders that actually get delivered vs. refused at door)

## High-Value Order Review

Orders above ₹25,000 are automatically flagged for admin review before processing:
- Verification that buyer account is not new (<48h old with high-value order = fraud signal)
- Verification that seller has capacity to fulfill the order
- Additional payment verification for card orders

---

# SECTION 7: CUSTOMER MANAGEMENT

## Customer Lookup

Admin can search for customers by: phone number, email, order ID, UPI ID.

Customer profile shows:
- Account details (registration date, verification status)
- Order history (all orders, amounts, statuses)
- Search history (last 30 days — visible to Trust & Safety for fraud investigation)
- Flagged activity
- Support ticket history
- Referral activity

**FR-CU-001: Customer Actions**
Admin can:
- Verify customer identity (for high-value disputes)
- Manually add DupeScout credits (for service recovery)
- Flag account for monitoring
- Suspend account (for abuse/fraud)
- Delete account data (GDPR/DPDP compliance request)

**FR-CU-002: Bulk Customer Operations**
- Export customer list by segment (for campaigns)
- Bulk credit application (for platform-wide service recovery)

---

# SECTION 8: FINANCE & PAYMENTS

## Finance Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  FINANCE — JULY 2026                                            │
├─────────────────────────────────────────────────────────────────┤
│  PLATFORM GMV                                                   │
│  July GMV:     ₹15.8 crore    ↑ 38% vs June                   │
│  MTD Revenue:  ₹1.58 crore    (10% take rate)                  │
│  Affiliate Rev: ₹8.4 lakh     (Amazon/Flipkart referrals)      │
│  Pro Subs:     ₹2.2 lakh      (2,200 Pro subscribers)          │
│  ──────────────────────────────────────────────────            │
│  Total Revenue: ₹1.88 crore                                     │
├─────────────────────────────────────────────────────────────────┤
│  PAYOUT STATUS                                                  │
│  Pending Payouts:    ₹12.4 crore (settlement in progress)      │
│  Payouts This Week:  ₹3.8 crore (362 sellers)                  │
│  Failed Payouts:     4 (UPI errors — in retry)                 │
│  Disputed Holds:     ₹4.2 lakh (27 disputed orders)           │
├─────────────────────────────────────────────────────────────────┤
│  PAYMENT GATEWAY                                                │
│  Payment Success Rate: 98.4%   UPI: 99.1%   Cards: 96.2%      │
│  Failed Payments:      1.6%    In retry: 0.8%  Final fail: 0.8%│
│  COD Success Rate:     84% (delivered + accepted)              │
├─────────────────────────────────────────────────────────────────┤
│  REFUNDS ISSUED THIS MONTH                                      │
│  Total Refunds: ₹89,400   Count: 214   Avg: ₹418              │
│  By Reason: Defective 41% | Not as described 28% | Changed mind 31%│
└─────────────────────────────────────────────────────────────────┘
```

**FR-FI-001: Manual Refund Processing**
- Admin can issue refund from any order detail page
- Refund options: to original payment method (3-5 days), to DupeScout Credits (instant)
- Refund exceeding ₹10,000 requires second-level approval
- All refunds logged with reason and approver

**FR-FI-002: Payout Management**
- View upcoming payouts and cancel/hold individual payouts
- Hold payout for seller under investigation
- Manual trigger payout for expedited payment
- Bulk payout approval (finance lead approves batch)

**FR-FI-003: Reconciliation**
- Daily reconciliation report: DupeScout system ↔ Razorpay ↔ bank
- Discrepancy alerts: if totals don't match, flags for investigation
- Monthly closing reconciliation
- Tax computation report (TDS, GST) for compliance

**FR-FI-004: Commission Override**
- Admin can set custom commission rates for individual sellers (for negotiated deals)
- Commission rate changes logged and effective from specified date
- Promotional commission rates: temporary reduced rate for seller acquisition campaigns

---

# SECTION 9: TRUST & SAFETY SYSTEM

## The Stakes

Trust & Safety is not a compliance function. It is an existential function.

One well-publicized case of a buyer receiving a counterfeit product can destroy a brand that took two years to build. Gen Z communities move fast — a Reddit thread about "DupeScout sold me a fake" can go viral in 2 hours.

**The Trust & Safety system must:**
- Detect fraud and counterfeits before they reach buyers
- Resolve disputes fairly and quickly
- Enforce policies consistently (no exceptions that can be exploited)
- Create a paper trail that can be used in legal proceedings

## Fraud Signals Framework

Every user action on DupeScout generates risk signals. The Trust & Safety system aggregates these into a risk score per seller, per buyer, per transaction.

**Seller Risk Signals:**

| Signal | Risk Weight | Description |
|--------|-------------|-------------|
| New account (<30 days) | Medium | Fraud rings often use new accounts |
| High-volume sudden orders | High | Account takeover or fraud ring test |
| Return rate >25% | High | Product quality issue or intentional fraud |
| Multiple accounts (same PAN/bank) | Critical | Policy violation; potential fraud |
| Reviews with identical text | High | Fake review generation |
| IP address mismatch with stated location | Medium | VPN use or location misrepresentation |
| Product images matching known counterfeit listings | Critical | Counterfeit signal |
| Price significantly below market | High | Possibly counterfeit or bait-and-switch |
| Multiple payment failure attempts | Medium | Card testing fraud |
| Bulk order from single buyer | Medium | Possible organized fraud |

**Buyer Risk Signals:**

| Signal | Risk Weight | Description |
|--------|-------------|-------------|
| Multiple high-value orders within 24h | High | Card fraud test pattern |
| New account + high AOV first order | High | Stolen card signal |
| Multiple delivery addresses in one session | Medium | Reshipping fraud |
| Multiple failed payment attempts | High | Stolen card testing |
| Order address = known fraud PIN codes | High | Maintained fraud PIN list |
| Chargebacks on previous orders | Critical | Repeat chargeback abuser |
| Account created within 1 hour of order | High | Disposable fraud account |

## Trust & Safety Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  TRUST & SAFETY                           [Jul 31, Live View]   │
├─────────────────────────────────────────────────────────────────┤
│  LIVE FRAUD ALERTS                                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 🚨 CRITICAL — Seller #4821                                │  │
│  │ 3 buyer reports of "fake brand goods" in last 2 hours    │  │
│  │ AI Image Analysis: 89% confidence logo is counterfeit    │  │
│  │ Action: Seller suspended pending review                   │  │
│  │ [Review Evidence]  [Confirm Suspension]  [Escalate]       │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ 🔴 HIGH — Transaction #T-9812                             │  │
│  │ ₹48,000 COD order from new account (created 2h ago)      │  │
│  │ Delivery to address flagged in fraud database             │  │
│  │ Risk Score: 84/100                                        │  │
│  │ [Block Order]  [Request Phone Verification]  [Allow]      │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  MODERATION QUEUE                                               │
│  Counterfeit reports:    8   (avg resolution: 4h)              │
│  Not-as-described:      34   (avg resolution: 18h)             │
│  Fake review reports:   12   (avg resolution: 6h)              │
│  Prohibited content:     3   (avg resolution: 1h)              │
├─────────────────────────────────────────────────────────────────┤
│  AUTO-BLOCKED TODAY                                             │
│  Transactions auto-blocked: 28  (review if needed)             │
│  Sellers auto-flagged:       4  (review required)              │
│  False positive rate:       4.1% (target: <5%)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# SECTION 10: FRAUD DETECTION

## Multi-Layer Fraud Detection Architecture

```
LAYER 1: REAL-TIME TRANSACTION SCREENING (100ms latency required)
  → Check buyer/seller risk scores
  → Check transaction against velocity rules
  → Check payment method risk signals
  → AUTO-BLOCK if risk score > 90
  → AUTO-FLAG if risk score 60-90
  → ALLOW if risk score < 60

LAYER 2: ASYNC DEEP ANALYSIS (runs in background post-order)
  → Network analysis: is buyer connected to known fraud accounts?
  → Behavioral analysis: does this session look bot-like?
  → Device fingerprint: has this device been used in fraud before?
  → AI image analysis on new listings: counterfeit detection

LAYER 3: PATTERN DETECTION (runs hourly on batch data)
  → Seller review velocity anomaly detection
  → Return rate statistical anomaly detection
  → Price manipulation detection (seller artificially inflates then discounts)
  → Geographic clustering analysis

LAYER 4: HUMAN REVIEW (for 60-90 range flags)
  → Trust & Safety team reviews flagged items
  → Decision recorded for model training
```

## Counterfeit Detection System

The counterfeit detection system is critical to DupeScout's integrity. Visual AI can detect when a seller's product photos show unauthorized brand logos.

**FR-FD-001: Brand Logo Detection**
- Computer vision model trained on logos of 5,000+ brands
- Runs on every product image at listing time
- Flags if known brand logo detected in image
- Confidence threshold for flag: 70% (human review required above this)
- Confidence threshold for auto-block: 95%

**FR-FD-002: Title/Description Brand Mention Analysis**
- NLP model detects when a listing description implies brand affiliation without authorization
- Examples: "Gucci style bag" is acceptable; "Gucci bag" from non-Gucci seller is not
- Detect misleading language: "Same as [brand]", "Original [brand]", "Authentic [brand]"

**FR-FD-003: Visual Similarity to Known Counterfeit Products**
- Maintain a database of known counterfeit product images (from buyer reports, proactive research)
- New listings compared against this database
- Match above 85% visual similarity → immediate flag for human review

---

# SECTION 11: DISPUTE RESOLUTION

## Dispute Lifecycle

```
DISPUTE INITIATED
(by buyer via "Report a Problem" on order page)
    ↓
AUTOMATED CATEGORIZATION
  → Category: Not received | Defective | Not as described | 
    Counterfeit | Wrong item | Other
    ↓
SELLER NOTIFIED
  → 24-hour window to respond
    ↓
SELLER RESPONDS
  ┌── SELLER ACCEPTS + RESOLVES: Refund issued; dispute closed
  ├── SELLER DISPUTES BUYER'S CLAIM: Goes to human mediation
  └── SELLER DOESN'T RESPOND (>24h): Auto-escalated to admin
    ↓
HUMAN MEDIATION
  → Admin reviews: order history, product listing, photos, 
    messages between buyer and seller, tracking data
  → Admin decision: in favor of buyer / seller / split
  → Decision communicated to both parties with explanation
  → Binding; no appeal except in exceptional circumstances
    ↓
RESOLUTION
  → Refund issued if in buyer's favor
  → Seller record updated
  → Repeat violations trigger enhanced review / suspension
```

## Dispute Resolution Interface

```
┌─────────────────────────────────────────────────────────────────┐
│  DISPUTE #D-1847                        Opened: Jul 28          │
│  Status: AWAITING ADMIN RESOLUTION      SLA: Jul 30 (OVERDUE)  │
├─────────────────────────────────────────────────────────────────┤
│  PARTIES                                                        │
│  Buyer: Priya Sharma (#U-8821) — 4 previous orders, 0 disputes │
│  Seller: Rajasthan Textiles (#S-4821) — 4.6★, 2,847 orders     │
├─────────────────────────────────────────────────────────────────┤
│  THE DISPUTE                                                    │
│  Buyer says: "Product is completely different color than photo. │
│  The listing shows dark blue but I received turquoise/teal.    │
│  Photos attached."                                              │
│                                                                 │
│  Buyer Photos:  [Photo 1 — received product, clearly teal]     │
│                                                                 │
│  Seller says: "This is how the product looks in different       │
│  lighting. The color is the same."                              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  EVIDENCE REVIEW                                                │
│  Product Listing Photo: [Dark blue]    Buyer's Photo: [Teal]   │
│  AI Color Analysis:                                             │
│  → Listing: #1B2A72 (Dark Navy Blue)                           │
│  → Received: #008B8B (Teal/Cyan)                               │
│  → Difference: Significant — different color family            │
│  AI Recommendation: In favor of buyer (94% confidence)         │
│                                                                 │
│  Tracking: Delivered July 25 ✓                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  RESOLUTION                                                     │
│  [✓ In favor of BUYER — full refund, buyer keeps item]         │
│  [✓ In favor of BUYER — full refund, return required]          │
│  [○ In favor of SELLER — dispute dismissed]                    │
│  [○ Partial resolution — ___% refund]                          │
│                                                                 │
│  Message to buyer: [pre-filled based on selection, editable]   │
│  Message to seller: [pre-filled, includes warning]             │
│                                                                 │
│  [Issue Resolution]                                             │
└─────────────────────────────────────────────────────────────────┘
```

**FR-DR-001: Resolution SLAs**
- Buyer report → Seller response: 24 hours
- Seller response → Admin decision: 48 hours
- Total dispute resolution: <72 hours
- Complex cases (legal involvement): <7 days

**FR-DR-002: Dispute Analytics**
- Top dispute reasons by category → informs policy and seller guidance
- Sellers with recurring disputes → trigger performance review
- Resolution time tracking → identifies bottlenecks in process
- "Not as described" disputes by product category → signals where better listing guidance is needed

---

# SECTION 12: AI MODERATION SYSTEM

## AI Moderation at Scale

At scale (10M+ products), human moderation of every listing is impractical. The AI moderation system handles 80%+ of cases automatically, with humans reviewing only edge cases and high-confidence flags.

## AI Moderation Capabilities

**FR-AM-001: New Listing Moderation**
- Runs within 60 seconds of submission
- Checks: brand trademark, content appropriateness, description accuracy, image quality, category correctness, price reasonableness
- Output: Approve / Flag / Auto-reject with reason

**FR-AM-002: Review Authenticity Detection**
- Automated detection of fake reviews
- Signals: review text similarity to other reviews, reviewer account age, reviewer purchase history, IP clustering
- Flagged reviews removed from display, shown to admin for confirmation

**FR-AM-003: Dynamic Re-Moderation**
- When AI models update, existing listings can be re-scanned in batch
- When new brand trademark is added to database, all listings re-scanned for that brand
- Price change monitoring: if seller changes price >40% suddenly, flag for review

**FR-AM-004: AI Moderation Explainability**
- Every AI decision comes with an explanation: "Flagged because detected brand logo 'X' in image 3 with 87% confidence"
- Admin can see exactly what triggered the flag
- Admin override (approve despite flag) is possible with mandatory note
- Override patterns fed back to improve model

---

# SECTION 13: ANALYTICS & GROWTH DASHBOARDS

## Business Intelligence Overview

```
ANALYTICS — GROWTH DASHBOARD

ACQUISITION
  ┌────────────────────────────────────────────────────────────┐
  │ New Users (Daily)  [7-day chart]                           │
  │ Today: 1,204   7-day avg: 1,087   vs. last week: +11%     │
  │                                                            │
  │ Acquisition Channels:                                      │
  │ Organic (ASO/SEO): 34%     Referral: 28%                  │
  │ Influencer:        22%     Paid (Meta): 12%               │
  │ Direct/Other:       4%                                     │
  │                                                            │
  │ CAC today: ₹142 (all channels weighted)                   │
  │ Paid CAC: ₹380   Organic CAC: ₹0   Referral CAC: ₹75     │
  └────────────────────────────────────────────────────────────┘

ACTIVATION
  ┌────────────────────────────────────────────────────────────┐
  │ D1 Retention: 52%   D7: 34%   D30: 22%                   │
  │ Time to first visual search: avg 2m 14s                   │
  │ Time to first purchase: avg 4.2 sessions                  │
  │ Style quiz completion: 64%                                 │
  └────────────────────────────────────────────────────────────┘

RETENTION
  ┌────────────────────────────────────────────────────────────┐
  │ W1 Retention: 41%   W4: 28%   M3: 18%                    │
  │ Monthly Active Rate: 62%                                   │
  │ Avg sessions/MAU/month: 8.4                               │
  │ Pro subscriber retention (monthly): 89%                   │
  └────────────────────────────────────────────────────────────┘

REVENUE
  ┌────────────────────────────────────────────────────────────┐
  │ GMV this month: ₹15.8 crore   ↑ 38% MoM                  │
  │ Revenue: ₹1.88 crore          ↑ 41% MoM                  │
  │ ARPU (MAU): ₹295/month                                    │
  │ LTV/CAC: 14.8x                                            │
  └────────────────────────────────────────────────────────────┘
```

## North Star Metric Tracking

DupeScout's North Star Metric: **Monthly Visual Shopping Sessions** (distinct sessions where a user initiates a visual search or AI chat and views at least 3 products)

This metric captures:
- Platform usage depth (not just logins)
- Core product behavior (visual discovery, not just checkout)
- Predictive of GMV and retention

**Supporting metrics (leading indicators of NSM):**

| Metric | Current | Target (M6) | Status |
|--------|---------|-------------|--------|
| Visual sessions/MAU | 4.2 | 6.0 | 🟡 On track |
| Visual search to PDP click-through | 67% | 72% | 🟡 |
| AI chat to purchase conversion | 8.4% | 12% | 🔴 Below target |
| Avg similarity score satisfaction | 4.1/5 | 4.4/5 | 🟡 |
| Collections created/MAU | 1.8 | 2.5 | 🟡 |

---

# SECTION 14: FEATURE FLAGS & EXPERIMENTATION

## Experimentation Framework

DupeScout ships new features behind feature flags — controlled rollouts that allow safe testing without full deployment risk.

**FR-FF-001: Feature Flag System**

Every feature that affects user experience should be behind a flag:

```
Feature Flag Example:
  flag_id: "visual_search_v3"
  description: "New visual search with aesthetic code understanding"
  status: enabled
  rollout: {
    percentage: 10,  // 10% of users see this
    segments: ["android", "age_18_25"],  // specific segments
    override_users: ["user_id_1", "user_id_2"]  // specific users always see
  }
  kill_switch: true  // can be disabled instantly if issues found
```

**FR-FF-002: A/B Test Framework**
- Define experiment: name, hypothesis, variants (A = control, B = test)
- Set traffic split: 50/50 by default; can be 90/10 for high-risk tests
- Define success metric: conversion rate, session length, GMV per session
- Statistical significance calculation: auto-calculated; experiment ends when 95% significance reached
- Results dashboard: shows performance difference with confidence intervals

**FR-FF-003: Experiment Governance**
- Experiments require: hypothesis, success metric, minimum sample size, maximum duration
- Overlapping experiments flagged: two experiments on the same surface must be reviewed for interaction effects
- Results archive: all past experiments with outcomes — learnings preserved

## Feature Flag Categories

| Category | Examples | Who Controls |
|----------|---------|--------------|
| Product features | Visual search v3, AI chat v2 | Product + Engineering |
| Pricing experiments | Commission rate tests | Finance + Product |
| UI experiments | New home screen layout | Design + Product |
| AI model updates | New similarity model | ML team |
| Geographic rollout | "enable in Bengaluru first" | Operations |
| Emergency kill switches | "disable COD payments" | Ops + Engineering |

---

# SECTION 15: CONTENT MANAGEMENT

## Editorial Content (Trend Intelligence)

The Trend Intelligence Feed (consumer product) requires editorial content management. While the feed is primarily AI-driven, there is editorial oversight needed.

**FR-CT-001: Trend Content Management**
- Admin can manually feature/hide specific trends
- Add editorial descriptions to trend categories
- Curate "Staff Picks" collections (max 5 active at a time)
- Schedule seasonal content: "Festival Season" category, "Monsoon Home" collections

**FR-CT-002: Push Notification Composer**
- Create and schedule push notifications
- Segmentation: all users / fashion users / home users / Pro subscribers / new users / inactive users
- Preview: see how notification will look on Android/iOS
- A/B test notification copy

**FR-CT-003: In-App Banner Management**
- Non-search surfaces (home screen "Trending" section) can feature editorial banners
- Admin creates banners with image + headline + CTA link
- Schedule start/end dates
- Click-through tracking

---

# SECTION 16: SYSTEM HEALTH & MONITORING

## Engineering Dashboard

```
SYSTEM HEALTH — LIVE
─────────────────────────────────────────────────────────────────

API PERFORMANCE
  Visual Search API:    avg 1.84s  p95: 2.12s   p99: 2.89s  ✓
  Product Search API:   avg 0.12s  p95: 0.21s   p99: 0.34s  ✓
  AI Chat API:          avg 0.72s  p95: 1.21s   p99: 1.84s  ✓
  Payment API:          avg 0.34s  p95: 0.71s   p99: 1.12s  ✓

ERROR RATES (last 1 hour)
  4xx errors:  0.34%  (client errors — normal)
  5xx errors:  0.021% (server errors — below 0.1% target ✓)
  Payment fails: 1.8% (within acceptable range)

INFRASTRUCTURE
  Database (Postgres):    CPU 34%  Memory 67%  Connections 842/2000  ✓
  Redis Cache:            Hit rate 94%  Memory 41%  ✓
  Vector DB (pgvector):   Query p95: 180ms  ✓
  Object Storage (S3):    Inbound: 2.4GB/hr  ✓
  AI Inference:           Queue depth: 12  Latency: 1.2s avg  ✓

EXTERNAL SERVICES
  Razorpay:   ✓ Operational
  Shiprocket: ✓ Operational
  AWS:        ✓ All regions green
  Twilio SMS: ✓ Operational
  GST API:    ✓ Operational
```

**FR-SH-001: Alerting System**
- PagerDuty integration for on-call alerts
- Alert thresholds:
  - API error rate >0.5% → P2 alert
  - API error rate >2% → P1 alert (on-call)
  - Payment failure >5% → P1 alert
  - Visual search p99 >5s → P2 alert
  - Database CPU >80% → P2 alert

**FR-SH-002: Incident Management**
- Incident log in admin console
- Post-mortem template with root cause, timeline, action items
- Status page (public) automatically updated for major incidents

---

# SECTION 17: DATA MODELS — ADMIN DOMAIN

```
TABLE: admin_users
─────────────────────────────────────────────────────
admin_id        UUID PRIMARY KEY
email           VARCHAR(255) UNIQUE NOT NULL
name            VARCHAR(200)
role            ENUM (super_admin, ops_lead, catalog_mod, seller_support, 
                       customer_support, trust_safety, finance, growth, engineering)
permissions     JSONB  -- specific permission overrides
is_active       BOOLEAN DEFAULT true
last_login      TIMESTAMP
created_by      UUID  -- which admin created this account
mfa_enabled     BOOLEAN DEFAULT true
```

```
TABLE: admin_audit_log
─────────────────────────────────────────────────────
log_id          UUID PRIMARY KEY
admin_id        UUID FOREIGN KEY → admin_users
action          VARCHAR(200)  -- e.g., "seller_approved", "listing_rejected"
entity_type     VARCHAR(50)   -- e.g., "seller", "product", "order"
entity_id       UUID
before_state    JSONB  -- state before action
after_state     JSONB  -- state after action
reason          TEXT  -- required for significant actions
ip_address      VARCHAR(45)
created_at      TIMESTAMP NOT NULL

INDEX: entity_type, entity_id (for quick lookup of all actions on a specific entity)
INDEX: admin_id, created_at (for admin activity reports)
```

```
TABLE: fraud_flags
─────────────────────────────────────────────────────
flag_id         UUID PRIMARY KEY
entity_type     ENUM (seller, buyer, transaction, product)
entity_id       UUID
flag_type       VARCHAR(100)  -- e.g., "counterfeit_suspected", "review_fraud"
confidence      DECIMAL(5,4)  -- 0.0000 to 1.0000
evidence        JSONB  -- specific evidence that triggered flag
auto_action     VARCHAR(100)  -- action taken automatically (if any)
status          ENUM (open, investigating, resolved_action, resolved_no_action, false_positive)
assigned_to     UUID FOREIGN KEY → admin_users (nullable)
resolved_by     UUID FOREIGN KEY → admin_users (nullable)
resolution_note TEXT
created_at      TIMESTAMP
resolved_at     TIMESTAMP
```

```
TABLE: disputes
─────────────────────────────────────────────────────
dispute_id      UUID PRIMARY KEY
order_id        UUID
buyer_id        UUID
seller_id       UUID
dispute_type    ENUM (not_received, defective, not_as_described, counterfeit, wrong_item, other)
buyer_message   TEXT
buyer_evidence  JSONB  -- photo URLs, etc.
seller_message  TEXT
seller_evidence JSONB
ai_recommendation VARCHAR(50)  -- buyer_favor | seller_favor | insufficient_evidence
ai_confidence   DECIMAL(5,4)
assigned_to     UUID FOREIGN KEY → admin_users
status          ENUM (open, seller_responded, under_review, resolved_buyer, resolved_seller, resolved_partial)
resolution_note TEXT
refund_amount   DECIMAL(10,2)
resolved_by     UUID FOREIGN KEY → admin_users
created_at      TIMESTAMP
seller_response_deadline TIMESTAMP
resolved_at     TIMESTAMP
```

```
TABLE: feature_flags
─────────────────────────────────────────────────────
flag_id         VARCHAR(100) PRIMARY KEY
name            VARCHAR(200)
description     TEXT
is_enabled      BOOLEAN DEFAULT false
rollout_config  JSONB  -- { percentage: 10, segments: [], override_user_ids: [] }
created_by      UUID FOREIGN KEY → admin_users
created_at      TIMESTAMP
updated_at      TIMESTAMP
last_changed_by UUID FOREIGN KEY → admin_users
```

```
TABLE: experiments
─────────────────────────────────────────────────────
experiment_id   UUID PRIMARY KEY
name            VARCHAR(200)
hypothesis      TEXT
variants        JSONB  -- [{ id: 'control', description: '...', traffic_pct: 50 }]
success_metric  VARCHAR(200)
target_sample   INTEGER  -- minimum sample per variant
status          ENUM (draft, running, paused, completed, archived)
results         JSONB  -- updated as experiment runs
statistical_significance DECIMAL(5,4)
winner          VARCHAR(100)  -- variant ID of winner, if determined
started_at      TIMESTAMP
ended_at        TIMESTAMP
created_by      UUID FOREIGN KEY → admin_users
```

---

# SECTION 18: ADMIN API SPECIFICATIONS

## Admin Authentication

All admin APIs require:
- JWT with `admin` scope
- Admin role encoded in JWT claims
- MFA verification for sensitive operations (payout approval, account bans)
- IP allowlisting for production admin API access

## Core Admin APIs

```
GET /admin/api/v1/dashboard/overview
Auth: Admin JWT
Response: Overview metrics including GMV, orders, user counts, action queue items

GET /admin/api/v1/sellers
Params: status, verification_status, category, date_from, date_to, search, page, limit
Response: Paginated seller list with summary info

PUT /admin/api/v1/sellers/{seller_id}/status
Body: { "status": "approved|suspended|banned", "reason": "string", "note": "string" }
Audit: Logs to admin_audit_log
Response: Updated seller object

GET /admin/api/v1/catalog/moderation-queue
Params: status (pending|flagged), category, page, limit
Response: Paginated listing queue with AI assessment per item

PUT /admin/api/v1/catalog/products/{product_id}/moderate
Body: { "decision": "approve|reject|edit_approve", "rejection_reason": "string?", "edits": {} }
Audit: Logs decision with admin ID
Response: Updated product status

GET /admin/api/v1/fraud/flags
Params: status, entity_type, confidence_min, date_from, page, limit
Response: Paginated fraud flag list

PUT /admin/api/v1/fraud/flags/{flag_id}/resolve
Body: { "resolution": "action_taken|false_positive|no_action", "note": "string" }
Response: Updated flag

GET /admin/api/v1/disputes
Params: status, date_from, date_to, page, limit
Response: Paginated dispute list

PUT /admin/api/v1/disputes/{dispute_id}/resolve
Body: { "resolution": "buyer_favor|seller_favor|partial", "refund_amount": number?, "note": "string" }
Requires: Admin with ops_lead or customer_support role
Audit: Full state logged

GET /admin/api/v1/analytics/summary
Params: date_from, date_to, granularity
Response: Full analytics summary object

POST /admin/api/v1/feature-flags
Body: { "flag_id": "string", "name": "string", "rollout_config": {} }
Requires: Super admin or ops_lead role

PATCH /admin/api/v1/feature-flags/{flag_id}
Body: Partial feature flag update
Response: Updated flag

GET /admin/api/v1/experiments
Response: All active and completed experiments

POST /admin/api/v1/experiments
Body: Experiment definition
Response: Created experiment

PUT /admin/api/v1/experiments/{experiment_id}/status
Body: { "status": "running|paused|completed" }
Response: Updated experiment
```

---

*End of Volume 4.*

**Next: Volume 5 — AI Architecture, Similarity Engine, Recommendation Engine & Technical Design**

---

*DupeScout Founder Blueprint — Volume 4 of 6*  
*Confidential. Not for distribution.*
