# DUPESCOUT — VOLUME 3
## Vendor Management System (VMS) — Complete PRD

**Classification:** Confidential — Founding Document  
**Version:** 1.0 | **Date:** July 2026  
**Part of:** DupeScout Founder Blueprint (6-Volume Series)

---

# TABLE OF CONTENTS — VOLUME 3

1. Seller Strategy & Philosophy
2. Seller Personas
3. Seller Journey (End-to-End)
4. Seller Portal Architecture
5. Onboarding & Verification
6. Store Management
7. AI-Assisted Catalog Creation
8. Inventory Management
9. Order Management
10. Returns & Refunds (Seller Side)
11. Shipping & Logistics
12. Payments & Payouts
13. Analytics & Performance Dashboard
14. AI Insights & Recommendations
15. Promotion Tools
16. Seller Communication & Support
17. Seller Ratings & Reviews
18. Compliance & Policy
19. Data Models — Seller Domain
20. API Specifications — Seller APIs

---

# SECTION 1: SELLER STRATEGY & PHILOSOPHY

## Why the Seller Side Is as Important as the Consumer Side

DupeScout's value to consumers depends entirely on the quality and diversity of its seller catalog. Without a deep, authentic catalog of local and independent sellers offering genuine alternatives to premium products, the platform is just another search engine pointing to Amazon.

The seller side is where DupeScout's **moat is actually built.**

Every unique product from a Rajasthan artisan that is not available on any other ecommerce platform is a reason for users to come to DupeScout specifically. Every local seller who depends on DupeScout for the majority of their business is a retention mechanism that no competitor can easily disrupt.

**The Seller Value Proposition:**

| What Sellers Get on DupeScout | What They Get on Amazon/Flipkart |
|------------------------------|----------------------------------|
| Discovery based on visual similarity — relevant buyers come to you | Keyword search — you must win on keywords or ads |
| AI finds buyers looking for products like yours from day one | New sellers are invisible without ad spend |
| AI-generated catalog: upload photos, AI writes the listing | Manual listing creation; 4-hour average for a new product |
| Fair commission with transparent payout | Complex fee structure; surprise deductions |
| Performance insights in plain language | Metrics dashboards that require expertise to interpret |
| Buyer is already looking for what you make | Buyer is searching for a product; you compete against 500 others |
| Your story matters: local, artisan, D2C | Amazon anonymizes all sellers |

## Target Seller Segments

| Segment | Description | Size in India | Typical Products |
|---------|-------------|--------------|-----------------|
| Local Artisans | Individual craftspeople; handmade products | 2M+ | Pottery, textiles, jewelry, decor |
| MSME Manufacturers | Small factories making category goods | 500K+ | Furniture, garments, leather goods |
| D2C Brands | Direct-to-consumer brands with own manufacturing | 100K+ | Fashion, home, beauty |
| Boutique Retailers | Curated retail stores; may carry multiple brands | 200K+ | Fashion, accessories, lifestyle |
| Home-Based Businesses | Individual resellers, Instapreneurs | 5M+ | Fashion, beauty, home goods |
| Regional Distributors | Distributors for regional brands | 50K+ | FMCG, lifestyle, appliances |

**MVP target:** 2,000 sellers at launch — primarily local artisans, MSME manufacturers, and D2C brands in fashion and home categories.

## Seller Onboarding Philosophy

**Speed is the activation metric.** Every hour of delay between "I want to sell" and "my first product is live" is an activation metric failure. Targets:

- Signup to first product live: **<30 minutes**
- Document verification: **<24 hours**
- First sale: **<7 days** (assisted by DupeScout team for first 100 sellers)

---

# SECTION 2: SELLER PERSONAS

## Seller Persona 1: Artisan Malti

**"My sofas are better than IKEA. Nobody outside Jodhpur knows I exist."**

| Attribute | Detail |
|-----------|--------|
| Age | 34 |
| Location | Jodhpur, Rajasthan |
| Business | 3-person furniture workshop |
| Products | Handcrafted wooden furniture, ₹8,000-45,000 |
| Current channels | Local customers, WhatsApp, occasional Flipkart (poor results) |
| Digital sophistication | Moderate — uses smartphone, WhatsApp, basic Google |
| Pain points | Cannot get discovered online; Amazon listings get no traffic; ad budget unavailable |
| Goals | 10-15 orders/month online; fair price; buyers who appreciate craft |

**What she needs from DupeScout VMS:**
- Simple, phone-first interface (not desktop-heavy)
- Minimal text data entry — just photos and basic details
- Hindi language support
- WhatsApp integration for order alerts
- Simple payouts via UPI

---

## Seller Persona 2: D2C Brand Vikram

**"We have a great product and zero marketing budget. We need organic discovery."**

| Attribute | Detail |
|-----------|--------|
| Age | 29 |
| Location | Bengaluru |
| Business | D2C fashion label (2 years old, 5-person team) |
| Products | Sustainable women's wear, ₹1,500-6,000 |
| Current channels | Instagram (10K followers), Myntra (tier 2 visibility), own website |
| Digital sophistication | High — full team comfortable with analytics and tools |
| Pain points | Myntra takes 25% commission + requires heavy discounting in sales; Instagram reach declining; website traffic is high-CAC |
| Goals | 500+ orders/month; lower commission structure; buyers who value sustainability |

**What he needs from DupeScout VMS:**
- Full API integration with his Shopify store (inventory sync)
- Advanced analytics and conversion data
- Competitor benchmarking
- Promotional tools for launches
- Low commission structure vs. Myntra

---

## Seller Persona 3: Home-Based Priyanka

**"I curate and resell. I just need the orders to come in."**

| Attribute | Detail |
|-----------|--------|
| Age | 26 |
| Location | Pune |
| Business | Instagram home décor reseller (side income) |
| Products | Sourced from Saharanpur/Jodhpur, marked up 30-40% |
| Current channels | Instagram (5K followers), WhatsApp |
| Digital sophistication | Good — digital native |
| Pain points | Manual order management over WhatsApp is chaotic; payments via bank transfer are risky; no professional storefront |
| Goals | Clean storefront, automated payments, easy inventory tracking |

---

# SECTION 3: SELLER JOURNEY (END-TO-END)

## Pre-Signup Discovery

Sellers discover DupeScout through:
1. DupeScout seller outreach teams at trade fairs (Dilli Haat, India International Furniture Fair)
2. Seller referral program ("Invite a seller, earn ₹500 when they make their first 10 sales")
3. WhatsApp/Instagram seller communities
4. Google search ("best platform for artisan sellers India")
5. MSME government partnerships

## Full Seller Journey

```
STAGE 1: DISCOVERY
  Seller hears about DupeScout
  Visits seller.dupescout.com or scans QR at trade fair
  
STAGE 2: SIGNUP (Target: 5 minutes)
  → Phone number + OTP
  → Business name
  → Category (Fashion / Home / Beauty / Other)
  → PIN code (for shipping setup)
  → UPI ID for payouts
  
  Account created. Verification in progress.

STAGE 3: VERIFICATION (Target: <24 hours)
  → Upload GST Certificate (auto-extracted via AI)
  → Upload Aadhaar/PAN for KYC
  → Upload 1-2 product photos as sample
  → Bank account verification (₹1 test transfer)
  
  Status: Pending Verification → Verified

STAGE 4: STORE SETUP (Target: 15 minutes)
  → Store name + tagline
  → Store banner photo (AI suggests based on product category)
  → Store bio (AI drafts from product category + location)
  → Return policy (choose from templates)
  → Shipping zones (default: pan-India; can restrict)

STAGE 5: CATALOG CREATION (Target: 15 minutes for first 5 products)
  → "Add your first product"
  → Upload 3-10 photos
  → AI auto-generates:
      - Product title
      - Description (150-200 words)
      - Category classification
      - Material tags
      - Style/aesthetic tags
      - Similarity tags
      - Suggested price (based on market comparables)
  → Seller reviews, edits if needed, publishes
  
  Product is live.

STAGE 6: FIRST SALE (Target: 7 days)
  → AI matches seller's products to visual search queries immediately
  → Seller receives WhatsApp + app notification for first order
  → Seller packs and ships via Shiprocket integration
  → Payment released within 7 days of delivery confirmation

STAGE 7: GROWTH (Ongoing)
  → Analytics dashboard shows performance
  → AI recommendations: "Listings with 5+ photos get 40% more clicks — add photos to these 3 products"
  → Promotional tools: run a flash sale, create a coupon
  → Performance reviews: monthly seller scorecard
```

---

# SECTION 4: SELLER PORTAL ARCHITECTURE

## Navigation Structure

```
SELLER PORTAL — TOP-LEVEL NAVIGATION
─────────────────────────────────────────────────────────
📊  Dashboard         → Overview of orders, revenue, performance
📦  Catalog           → Products: add, edit, manage inventory
🛒  Orders            → New orders, in-progress, completed, returns
💰  Payments          → Earnings, payouts, transaction history
📈  Analytics         → Traffic, conversion, customer data, trends
🤖  AI Insights       → AI-powered recommendations and analysis
📣  Promotions        → Sales, coupons, sponsored placement
📋  Returns           → Return requests, resolution
⚙️  Settings          → Store profile, shipping, policies, account
💬  Support           → Tickets, chat with DupeScout team
─────────────────────────────────────────────────────────
```

## Dashboard — First Screen After Login

```
┌─────────────────────────────────────────────────────────────────┐
│  Good morning, Malti's Jodhpur Furniture  ●  VERIFIED SELLER   │
│  Today: Thursday, July 31, 2026                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TODAY'S SNAPSHOT                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  ┌────────┐ │
│  │ Orders      │  │ Revenue     │  │ Views      │  │ Conv % │ │
│  │ 12          │  │ ₹18,400     │  │ 847        │  │ 1.42%  │ │
│  │ ↑ 3 from   │  │ ↑ 12% vs   │  │ ↑ 23%      │  │        │ │
│  │ yesterday   │  │ last week   │  │ vs avg     │  │        │ │
│  └─────────────┘  └─────────────┘  └────────────┘  └────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  ORDERS NEEDING ATTENTION                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ● 3 new orders — ready to pack                             │ │
│  │ ● 1 return request — review needed                         │ │
│  │ ● 1 order delayed — customer notified, action needed       │ │
│  └────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  AI RECOMMENDATIONS                                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🤖 Your "Sheesham Side Table" is getting 120 views/day    │ │
│  │    but only 0.6% conversion. 92% of similar products with │ │
│  │    5+ photos convert at 1.8%+. Add photos? [Do it now]    │ │
│  └────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  THIS WEEK'S PERFORMANCE                                        │
│  [Mini line chart: daily orders this week vs last week]        │
│                                                                 │
│  Revenue this week: ₹94,200 (↑ 18% vs last week)              │
│  Top product: Brass Planter Stand (34 sold)                    │
│  New followers: 28 shoppers saved your store                   │
├─────────────────────────────────────────────────────────────────┤
│  PAYOUT STATUS                                                  │
│  Next payout: ₹76,400 on August 3 (Monday)                    │
│  Funds pending settlement: ₹18,200                             │
└─────────────────────────────────────────────────────────────────┘
```

---

# SECTION 5: ONBOARDING & VERIFICATION

## Signup Flow — Technical Requirements

**FR-SO-001: Phone Number Registration**
- Primary identifier: Indian mobile number
- OTP via SMS; fallback to voice call OTP after 60s
- WhatsApp OTP option (preferred by many MSME sellers)
- Duplicate number prevention: check against existing accounts

**FR-SO-002: Basic Business Information**
- Business name (shown on storefront)
- Category selection (multi-select from: Fashion, Home & Decor, Beauty, Electronics, Sports, Other)
- PIN code (determines shipping availability)
- UPI ID (for payouts — validated with ₹1 test transfer)

**FR-SO-003: Verification Documents (for transaction-enabling)**
- **Required before selling:** GST Certificate (auto-OCR to extract GSTIN, business name, address)
- **Required before selling:** Identity: Aadhaar card OR PAN card (OCR extraction)
- **Required before first payout:** Bank account: account number + IFSC (validated via NACH)
- **Optional:** MSME Udyam Registration (grants "Verified MSME" badge)
- **Optional:** FSSAI License for food-related products

**FR-SO-004: OCR & Verification Automation**
- GST document: AI OCR extracts GSTIN, validates against GST API, returns business details
- PAN: AI OCR extracts PAN number, validates format, matches name against GST data
- Aadhaar: masked Aadhaar verification via UIDAI API
- Bank account: validation via Razorpay NACH (₹1 penny drop)
- Target: 80% of verifications completed automatically within 1 hour

**FR-SO-005: Verification Status System**

| Status | What Seller Can Do |
|--------|-------------------|
| Registered (unverified) | View portal, set up store, create draft listings |
| GST Verified | Publish listings, receive orders |
| KYC Verified | Receive payouts to bank account |
| Bank Verified | Full platform access |
| Suspended | Cannot sell; support ticket required |
| Permanently Banned | No access; all listings removed |

---

# SECTION 6: STORE MANAGEMENT

## Store Profile

**FR-SM-001: Store Identity**
- Store name (shown to customers)
- Store tagline (max 80 characters)
- Store banner image (recommended 1500×400px; AI generates one from product category if not provided)
- Store profile photo (seller's workshop / brand logo)
- Store bio (max 300 characters; AI-generated draft from category + location + product style)
- Location display: City + State (not full address)
- "Shop our story" section: up to 500-word story about the seller (optional; increases trust signals significantly)

**FR-SM-002: Return Policy Configuration**
- Pre-defined templates: 
  - "7-day returns accepted" 
  - "No returns — final sale"
  - "Defective items only"
  - Custom (free text, max 200 characters)
- Policy shown prominently on all product listings and at checkout
- Platform minimum: at least "defective items only" returns must be accepted by all sellers

**FR-SM-003: Shipping Policy**
- Shipping zones: pan-India (default) or restrict by state/PIN codes
- Shipping methods: standard (3-7 days), express (1-2 days), same-day (metro only)
- Shipping rates: auto-calculated via integrated carrier APIs, or custom flat rate
- Free shipping threshold: seller can set "Free shipping above ₹X"
- Processing time: "Ships within 1 business day" / "Ships within 3 business days" (seller sets)

**FR-SM-004: Store Categories & Collections**
- Sellers can create internal collections (e.g., "Monsoon Sale", "Wedding Collection")
- Collections shown on seller's storefront
- Collections can be featured in promotional campaigns

---

# SECTION 7: AI-ASSISTED CATALOG CREATION

## This Is the Most Important Seller Feature

Catalog creation is the single biggest barrier to seller activation on every ecommerce platform. Amazon India reports that new sellers spend an average of 4 hours creating their first 10 listings. This kills activation for small sellers who don't have that time or skill.

DupeScout's AI Catalog Creator reduces this to **22 minutes for the first 10 products.**

This is not marginal improvement. This is a 10x change that unlocks a category of sellers who simply cannot afford the time cost of traditional listing creation.

## AI Catalog Creator — The Flow

```
STEP 1: PHOTO UPLOAD
  Seller taps "Add Product"
  Uploads 1-10 photos of the product
  (Phone camera photos acceptable — AI handles quality enhancement)
  
STEP 2: AI ANALYSIS (20-30 seconds)
  AI analyzes photos:
  → Identifies product category
  → Detects primary and secondary materials
  → Identifies color (precise color family, not just "blue")
  → Detects construction features (visible joins, texture, finish)
  → Assigns style/aesthetic codes
  → Identifies visual similarity to known products
  → Generates suggested selling price range
  
STEP 3: AI-GENERATED LISTING
  AI presents:
  ┌────────────────────────────────────────────────────────────┐
  │ AI GENERATED LISTING — Review and Edit                     │
  │                                                            │
  │ TITLE:                                                     │
  │ Handcrafted Sheesham Wood Side Table — Natural Finish      │
  │ [Edit]                                                     │
  │                                                            │
  │ DESCRIPTION:                                               │
  │ "This handcrafted side table is made from solid Sheesham   │
  │ (Indian Rosewood) in a natural oil finish that highlights  │
  │ the wood's natural grain patterns. Each piece is slightly  │
  │ unique — a feature of genuine handcraft. Ideal for         │
  │ Japandi, Wabi-sabi, or minimal Scandinavian interiors.    │
  │ Height: [add], Width: [add], Depth: [add]."               │
  │ [Edit]                                                     │
  │                                                            │
  │ MATERIAL TAGS:                                             │
  │ Sheesham Wood  ·  Solid Wood  ·  Natural Finish  ·        │
  │ Oil-Finished  ·  Handcrafted                               │
  │ [Edit tags]                                                │
  │                                                            │
  │ STYLE TAGS:                                                │
  │ Japandi  ·  Wabi-sabi  ·  Minimalist  ·  Natural          │
  │ [Edit tags]                                                │
  │                                                            │
  │ SIMILAR TO:                                                │
  │ CB2 "Bina" Side Table (87% similar)                       │
  │ IKEA VITTSJÖ Side Table (76% similar)                     │
  │ [This helps buyers find your product via visual search]   │
  │                                                            │
  │ SUGGESTED PRICE RANGE: ₹2,800 — ₹4,500                   │
  │ Based on 23 similar products on DupeScout                 │
  │                                                            │
  │ YOUR PRICE: [___________]                                  │
  │                                                            │
  │           [Publish]   [Save Draft]   [Edit More]          │
  └────────────────────────────────────────────────────────────┘
  
STEP 4: SELLER REVIEW & EDIT
  → Seller reviews AI-generated content
  → Edits any field (title, description, tags, price)
  → Adds dimensions, weight, and other required fields
  → Sets inventory quantity
  
STEP 5: PUBLISH
  → Product undergoes automated compliance check (< 1 minute)
  → If passes: Live immediately
  → If flagged: Seller sees specific issue with guidance to fix
```

## AI Catalog Creator — Technical Requirements

**FR-AC-001: Photo Processing**
- Accept: JPG, HEIC, PNG, WebP
- Minimum 2 photos required; maximum 15 per product
- AI performs: background removal (optional), brightness/contrast normalization, perspective correction
- Background removal: optional; seller can choose to keep original background
- Photo ordering: seller can reorder; AI suggests optimal order (hero shot first)

**FR-AC-002: Auto-Title Generation**
- Formula: [Material/Craft Type] + [Product Type] + [Key Feature] + [Style Code if distinctive]
- Examples:
  - "Handwoven Linen Cushion Cover — Natural Khaki"
  - "Solid Brass Door Handle — Minimalist Round"
  - "Hand-Block Printed Cotton Kurta Set — Indigo Floral"
- Max 60 characters (SEO-optimized length)
- Avoids brand names (compliance)

**FR-AC-003: Auto-Description Generation**
- Structure: Opening sentence (what it is + key material) → Craft/construction detail → Style guidance → Use case suggestions → Call to note for dimensions (which are always missing and always needed)
- Length: 100-200 words
- Tone: Honest, confident, aesthetic-aware
- Language: English (default); Hindi option for sellers who prefer
- No superlatives ("best in class", "amazing quality") — AI trained to avoid marketing speak
- Includes a [placeholder] for dimensions/weight that seller must fill

**FR-AC-004: Style and Aesthetic Tagging**
- 200+ predefined aesthetic tags across categories:
  - Fashion: Minimalist, Streetwear, Boho, Cottagecore, Y2K, Office Casual, etc.
  - Home: Japandi, Maximalist, Industrial, Farmhouse, Wabi-sabi, Coastal, etc.
- AI assigns 3-8 tags per product
- Seller can add/remove tags
- Tags directly impact which visual searches surface the product
- Quality gate: minimum 3 tags required for listing to go live

**FR-AC-005: Similarity Indexing**
- On publish, product is compared against entire DupeScout catalog using visual embedding
- Top 10 similar products identified and stored (used for "Similar to" search results)
- Similarity scores are recalculated weekly as catalog grows
- Seller can see which reference products their products are similar to

**FR-AC-006: Price Intelligence**
- Shows comparable products and their price range
- "Your price vs. market" indicator: green (competitive), amber (slightly high), red (significantly above market)
- Does not force sellers to follow market pricing — they price freely
- AI note when price is significantly above or below similar products (transparency)

**FR-AC-007: Bulk Upload**
- For sellers with 50+ products: CSV/Excel bulk upload
- AI processes each row, generates descriptions, sends back draft file for review
- Batch publish after seller review
- Image bulk upload: ZIP file of product images, matched to CSV rows by filename
- Shopify/WooCommerce API sync: import existing catalog with one OAuth connection

---

# SECTION 8: INVENTORY MANAGEMENT

## Inventory Philosophy

DupeScout's inventory system must work for both:
- A 1-person home business with 10 products and manual stock management
- A D2C brand with 500 SKUs and Shopify/WooCommerce integration

**FR-IM-001: Basic Stock Management**
- Per-product stock quantity
- Low stock alert: seller sets threshold (default: 5 units); notification sent
- Out-of-stock behavior: listing automatically hidden from search results; seller notified
- Restock notification: when a product goes back in stock, customers who wishlisted it are notified

**FR-IM-002: SKU / Variant Management**
- Support for product variants: size, color, material, other
- Each variant has its own inventory count
- Matrix view for variant management (e.g., size × color grid)
- Bulk variant creation: "This product comes in S/M/L/XL × 5 colors = 20 variants" — can create all at once

**FR-IM-003: External Platform Sync**
- Shopify integration: sync inventory bi-directionally
- WooCommerce integration: same
- Unicommerce integration: for sellers using a central WMS
- Manual override: seller can always override synced inventory count

**FR-IM-004: Inventory Alerts & Reports**
- Daily inventory summary via WhatsApp/email
- "Near stockout" report: products with <5 units remaining
- "Top sellers this week" report: helps seller know what to restock first
- Inventory value report: current inventory × price = total catalog value

---

# SECTION 9: ORDER MANAGEMENT

## Order Lifecycle

```
NEW ORDER
    ↓
SELLER NOTIFICATION (WhatsApp + app + email)
    ↓
SELLER ACCEPTS ORDER (auto-accept available; default: manual)
  → If not accepted within 12 hours: auto-accept + reminder
  → If cancelled by seller: penalty applied to seller rating
    ↓
ORDER PACKING
  → Seller packs the product
  → Prints shipping label from portal (auto-generated)
    ↓
ORDER DISPATCH
  → Seller scans label or enters AWB number
  → Tracking info synced to buyer's order page
  → Buyer notified: "Your order has been dispatched"
    ↓
IN TRANSIT
  → Carrier tracking auto-synced
  → Buyer receives milestone notifications
    ↓
DELIVERED
  → Delivery confirmation from carrier
  → Review request sent to buyer (7-day delay)
  → Payment settlement initiated (T+7 after delivery)
    ↓
CLOSED (after 30 days if no return request)
```

## Order Management Interface

```
┌─────────────────────────────────────────────────────────────────┐
│  ORDERS                                                         │
│  ─────────────────────────────────────────────────────────────  │
│  [New (3)]  [Processing (8)]  [Shipped (24)]  [Completed (847)] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  NEW ORDERS — Action Required                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ #DS-001234   Priya Sharma   Mumbai   July 31, 10:32 AM   │  │
│  │ [Image] Handwoven Linen Set (Sage Green, M)  ×1          │  │
│  │ ₹2,499  |  Standard Shipping  |  Exp. delivery: Aug 3   │  │
│  │                                                          │  │
│  │ [Accept Order]  [Print Label]  [Contact Buyer]           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ #DS-001235   Rohit Kumar   Bengaluru   July 31, 11:15 AM │  │
│  │ [Image] Sheesham Side Table (Natural)  ×2                │  │
│  │ ₹7,800  |  Express Shipping  |  Exp. delivery: Aug 2    │  │
│  │                                                          │  │
│  │ [Accept Order]  [Print Label]  [Contact Buyer]           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**FR-OM-001: Order Notification System**
- WhatsApp message: New order details (product, size, address, amount)
- App notification: badge + push
- Email: full order details
- Seller can choose notification channel priority in settings

**FR-OM-002: Shipping Label Generation**
- One-click label generation from order details page
- Carrier selection: auto (cheapest), manual (select carrier), express
- Label includes: buyer address, PIN, phone, order ID, DupeScout barcode
- PDF download for printing; or scan-from-phone to create AWB at Shiprocket/Delhivery drop point

**FR-OM-003: Batch Operations**
- Select multiple orders → bulk print labels
- Select multiple orders → mark as shipped
- Bulk actions: helpful for sellers processing 20+ orders daily

**FR-OM-004: Auto-Accept Configuration**
- Seller can enable auto-accept for all orders
- Conditions: within certain order value, specific PIN codes, specific product categories
- Recommended for sellers processing >10 orders/day

**FR-OM-005: Order Cancellation**
- Seller-initiated cancellation before dispatch: allowed, but tracked and affects seller score
- Seller-initiated after dispatch: not allowed without customer service involvement
- Repeat cancellations: trigger seller account review
- If order cancelled: buyer gets automatic full refund

---

# SECTION 10: RETURNS & REFUNDS (SELLER SIDE)

## Return Policy Framework

**Platform minimum policy** (all sellers must comply):
- Defective products: 30-day return accepted, seller responsible for return shipping cost
- Significantly not-as-described: 30-day return accepted, seller responsible

**Seller optional policies:**
- General returns: 7-day, no questions asked
- No general returns (final sale) — only defective/not-as-described accepted

## Return Request Flow

```
BUYER INITIATES RETURN REQUEST
    ↓
SELLER NOTIFIED (WhatsApp + app + email)
    ↓
SELLER REVIEWS REQUEST (within 48 hours)
  → Views: reason, buyer description, photos provided
  → Decision:
    ┌── ACCEPT: Generate return label, initiate refund on receipt
    ├── REJECT (only valid if reason doesn't qualify under policy)
    └── REQUEST MORE INFO: Ask buyer for additional photos/detail
    ↓
IF ACCEPTED:
  Buyer ships product back
  Seller confirms receipt
  Refund processed: 3-5 days to buyer's original payment method
    ↓
IF DISPUTED:
  DupeScout mediates
  72-hour resolution SLA
  Evidence review (photos, conversation logs)
  Decision binding on both parties
```

**FR-RR-001: Return Dashboard**
- Separate "Returns" tab in order management
- Status: Pending Review, Accepted, In Transit (back to seller), Received, Refunded, Disputed
- Return reason analytics: helps seller identify quality issues proactively

**FR-RR-002: Seller Return Performance**
- Return rate tracked per seller
- Acceptable baseline: <10% return rate (industry average: 15-20%)
- High return rate (>20%) triggers seller performance review
- Return reason analysis surfaced by AI: "7 of your last 10 returns cite 'color different from photo' — consider updating product photos"

---

# SECTION 11: SHIPPING & LOGISTICS

## Logistics Strategy

DupeScout does NOT own or operate any logistics infrastructure. We integrate with existing carriers and enable sellers to use their preferred logistics partners.

**Primary carrier integrations:**
1. **Shiprocket** — aggregates 25+ carriers; good for small/medium sellers
2. **Delhivery** — strong Tier 2/3 coverage; good rates for volumes
3. **Shadowfax** — fast delivery + hyperlocal; good for fashion
4. **Ekart** (Flipkart's logistics) — strong in East India
5. **Blue Dart** — premium, for high-value items

**FR-SL-001: Carrier Rate Display**
- When generating a shipping label, seller sees real-time rates from all integrated carriers
- Recommendation: AI suggests best carrier based on delivery time, cost, and historical performance
- Seller makes final choice

**FR-SL-002: Integrated Label Generation**
- Labels generated directly from DupeScout → carrier system (no manual login to carrier portal)
- AWB number created in DupeScout system for tracking

**FR-SL-003: Tracking Integration**
- Carrier webhooks update order status in real-time
- Buyer sees tracking updates on their order page
- Seller sees delivery status in order management

**FR-SL-004: Self-Ship Option**
- Sellers who use their own logistics (e.g., Blue Dart enterprise) can enter AWB manually
- Tracking still shown to buyer if carrier is in our tracking system

**FR-SL-005: Estimated Delivery Date Display**
- DupeScout calculates estimated delivery date based on seller processing time + carrier transit time + destination PIN code
- Shown to buyer at product page and checkout
- Seller processing time is configurable (default: 2 business days; range: 1-7 business days)

## Packaging Standards

**Seller packaging guidelines (required):**
- Products must be packed securely to prevent transit damage
- Fragile items: bubble wrap or cushioning required
- Food items: sealed, labeled per FSSAI guidelines
- DupeScout branded packaging tape / stickers available for purchase (optional, good for brand building)

---

# SECTION 12: PAYMENTS & PAYOUTS

## Payment Flow

```
BUYER PAYS
    ↓
PAYMENT HELD IN ESCROW (Razorpay/DupeScout payment gateway)
    ↓
ORDER DELIVERED (carrier confirms)
    ↓
RETURN WINDOW (7 days default for non-defective returns)
    ↓
NO RETURN INITIATED → PAYOUT RELEASED (T+7)
RETURN INITIATED → PAYOUT HELD UNTIL RESOLUTION
```

## Payout Schedule

| Seller Tier | Payout Frequency | Settlement Period |
|-------------|-----------------|-------------------|
| New (< 50 orders) | Weekly | T+10 after delivery |
| Standard (50-500 orders/month) | Weekly | T+7 after delivery |
| Established (500-2000/month) | Bi-weekly | T+5 after delivery |
| Power Seller (2000+/month) | Daily | T+3 after delivery |

Settlement periods improve as seller builds trust history. This manages fraud risk while rewarding established sellers.

## Commission Structure

| Category | Commission Rate | Rationale |
|----------|----------------|-----------|
| Fashion (clothing, bags, shoes) | 8% | High volume category; lower margin sellers |
| Home & Furniture | 10% | Higher AOV; moderate margin |
| Beauty & Skincare | 12% | High margin category; lower AOV |
| Electronics Accessories | 12% | High volume; moderate margin |
| Handcrafted / Artisan (any category) | 6% | Incentivize local artisan sellers |
| Branded D2C | 10% | Standard |

**Additional fees (transparent, no hidden):**
- Payment gateway fee: 2% (passed through from Razorpay; industry standard)
- Return processing fee: ₹50 per return (to cover logistics coordination)
- Promoted listing: CPC/CPD (separate, optional)

**No other fees.** No listing fee. No monthly subscription. No data fee.

## Payout Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  PAYMENTS                                                       │
├─────────────────────────────────────────────────────────────────┤
│  UPCOMING PAYOUT                                                │
│  Amount: ₹94,200                                               │
│  Date: August 4, 2026 (Monday)                                 │
│  To account: HDFC ****4521                                      │
│                        [Download Invoice]  [View Breakdown]    │
├─────────────────────────────────────────────────────────────────┤
│  THIS MONTH: JULY 2026                                          │
│  Gross Sales:          ₹3,84,000                               │
│  DupeScout Commission: ₹38,400 (10%)                           │
│  Payment Gateway Fees: ₹7,680 (2%)                             │
│  Returns Deducted:     ₹12,400                                 │
│  ──────────────────────────────                                │
│  Net Payout:           ₹3,25,520                               │
├─────────────────────────────────────────────────────────────────┤
│  PAYOUT HISTORY                                                 │
│  Jul 28  ₹86,400   ✓ Paid                                      │
│  Jul 21  ₹74,200   ✓ Paid                                      │
│  Jul 14  ₹91,800   ✓ Paid                                      │
│  Jul 7   ₹68,400   ✓ Paid                                      │
│  [View all]                                                     │
└─────────────────────────────────────────────────────────────────┘
```

**FR-PAY-001: GST Invoice Generation**
- DupeScout generates B2B GST invoices for all transactions
- Seller's GSTIN included on all invoices
- Monthly GST summary report for easy filing
- GSTR-1 compatible data export

**FR-PAY-002: TDS Compliance**
- DupeScout deducts TDS (1%) on seller payouts as required under Section 194-O
- TDS certificate issued quarterly
- Form 26AS-compatible data

---

# SECTION 13: ANALYTICS & PERFORMANCE DASHBOARD

## Philosophy

Sellers should be able to understand their business performance in 5 minutes without a data analytics background. Metrics should be in plain language, actionable, and comparative.

**Anti-pattern:** Showing 47 metrics without explaining what matters.
**DupeScout approach:** Surface the 5 most important numbers today, with plain-language context.

## Analytics Overview

```
ANALYTICS — [July 2026 ▼]  [Fashion ▼]

HEADLINE NUMBERS
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total Sales  │ Total Orders │ Conversion   │ Avg Rating   │
│ ₹3,84,000   │ 218          │ 1.8%         │ ★ 4.7        │
│ ↑ 23% MoM   │ ↑ 31 orders  │ ─ 0.1% MoM  │ ↑ 0.2 MoM   │
└──────────────┴──────────────┴──────────────┴──────────────┘

TRAFFIC SOURCES
Where are your buyers coming from?
→ Visual Search (buyer uploaded photo similar to yours)  47%
→ Keyword Search                                         28%
→ Recommendations (AI recommended your product)          15%
→ Direct (bookmarked your store, referral links)         7%
→ Promotions / Coupons                                   3%

WHAT THIS MEANS: 47% of your sales came from buyers who didn't know
your product existed — they searched by image and found you. This is
DupeScout's core strength working for you.

TOP PRODUCTS (by revenue this month)
┌──────────────────────┬────────┬───────┬────────┬──────────┐
│ Product              │ Orders │ Rev   │ Conv % │ vs. Avg  │
├──────────────────────┼────────┼───────┼────────┼──────────┤
│ Brass Planter Stand  │ 67     │₹89,3k │ 2.8%   │ ↑ +1.0%  │
│ Sheesham Side Table  │ 48     │₹2.2L  │ 1.4%   │ ─ avg    │
│ Rattan Floor Lamp    │ 34     │₹95k   │ 1.9%   │ ↑ +0.1%  │
│ Jute Wall Basket     │ 29     │₹26k   │ 3.2%   │ ↑ +1.4%  │
└──────────────────────┴────────┴───────┴────────┴──────────┘

CUSTOMER QUALITY
Repeat buyers:      34% (industry average: 22%)
Return rate:        7.3% (platform average: 9.8%)
Review response:    89% of deliveries got a review
```

**FR-AN-001: Core Metrics**
- Revenue (daily, weekly, monthly, YoY)
- Orders (same breakdowns)
- Conversion rate (views → add-to-cart → purchase)
- Average order value
- Return rate
- Seller rating trend
- Repeat buyer rate

**FR-AN-002: Traffic & Discovery Analytics**
- Traffic source breakdown (where buyers found the product)
- Top search queries that led to the seller's products
- Visual search analysis: which images buyers were uploading when they found seller's products
- "You appeared in X visual searches this week" — unique DupeScout insight

**FR-AN-003: Product-Level Analytics**
- Per-product views, add-to-cart rate, conversion rate, revenue
- Photo performance: which photos get the most engagement
- "Opportunity products": high-view, low-conversion products that might improve with better photos/price

**FR-AN-004: Competitive Benchmarking**
- Anonymous benchmarking against similar sellers in same category + price range
- "Your conversion rate is 1.4%. Top sellers in your category average 2.1%."
- "Your listing photos: 4 photos. Top sellers: 8 photos."
- Does not reveal specific competitor names — only anonymized averages

---

# SECTION 14: AI INSIGHTS & RECOMMENDATIONS

## The AI Business Advisor

Every seller on DupeScout has access to an AI business advisor that monitors their performance and proactively surfaces actionable recommendations. This is not a generic tips feed — it is personalized analysis based on the seller's specific data.

**FR-AI-001: Proactive Insight Cards**

Shown on dashboard; refreshed daily. Examples:

```
┌────────────────────────────────────────────────────────────────┐
│ 🤖 PRODUCT OPPORTUNITY                                         │
│                                                                │
│ "Your Sheesham Side Table is getting 120 views/day but only   │
│  1.4% conversion. The AI noticed: 92% of similar products    │
│  with 5+ photos convert at 2.1%+. You have 3 photos.         │
│  Adding 2-3 more photos (including a close-up of the wood     │
│  grain) could add ₹12,000/month in revenue based on your     │
│  current traffic."                                            │
│                                                                │
│  [Add Photos Now]  [Learn Why Photos Matter]                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 🤖 PRICING INSIGHT                                             │
│                                                                │
│ "You've had 34 buyers view your Brass Planter Stand and add   │
│  to wishlist but not purchase in the last 2 weeks. This often │
│  indicates price hesitation. The average wishlist-but-not-buy │
│  product on your store converts if price drops 10-15%.        │
│  A ₹200 price reduction (from ₹1,350 to ₹1,150) might        │
│  convert 18-22 of these into sales."                          │
│                                                                │
│  [Adjust Price]  [Run a Coupon Instead]  [Dismiss]            │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ 🤖 TREND ALERT                                                 │
│                                                                │
│ "Searches for 'wabi-sabi home decor' are up 156% this week    │
│  on DupeScout. You have 3 products that match this aesthetic. │
│  Adding 'Wabi-sabi' and 'Imperfect Beauty' tags to these     │
│  products could significantly increase their visibility in   │
│  these searches."                                             │
│                                                                │
│  [Update Tags Now]  [Show Me Which Products]                  │
└────────────────────────────────────────────────────────────────┘
```

**FR-AI-002: Monthly Business Report**
- Plain language summary of the month
- Revenue vs. prior month, with explanation
- Top performing products + why
- Underperforming products + recommended actions
- Trend predictions for next month
- Competitor benchmarking summary

**FR-AI-003: Inventory Demand Forecasting**
- Based on traffic and sales trends, AI predicts which products will run out of stock
- "Your Brass Planter Stand is selling 2.2 units/day. At current stock (34 units), you'll run out in 15 days. Reorder recommended by August 10."
- Helps sellers avoid lost sales from stockouts

**FR-AI-004: New Product Ideas**
- Based on trending searches that no seller currently covers well
- "There are 1,200 daily searches for 'rattan pendant lamp' on DupeScout. We have only 3 sellers with this product. If you make this, you'd be entering a high-demand, low-competition segment."

---

# SECTION 15: PROMOTION TOOLS

## Available Promotion Tools

**FR-PT-001: Flash Sales**
- Seller creates a sale with: % discount or fixed amount off, start/end time, specific products
- Flash sale badge appears on products ("Sale: 30% off until 6 PM")
- Sales listed in DupeScout's "Current Sales" section (free discovery boost)
- Maximum 2 active flash sales per seller at a time

**FR-PT-002: Coupons**
- Create coupon codes: percentage off, fixed amount off, free shipping
- Share coupon codes in marketing (Instagram, WhatsApp)
- Set: minimum order value, maximum uses, expiry date
- Analytics: coupon redemption rate, revenue generated

**FR-PT-003: Promoted Listings (Sponsored)**
- CPC (cost-per-click) bidding for featured placement in search results
- Sponsored results shown in clearly labeled "Sponsored" section — separated from organic
- Minimum bid: ₹2/click
- Budget cap: daily or total campaign budget
- Performance: clicks, spend, orders, ROAS shown per campaign

**FR-PT-004: Bundle Deals**
- Create product bundles: "Buy Table + Lamp, save 15%"
- Shown as bundle on both individual product pages
- Increases average order value for seller
- AI suggests bundle combinations based on what buyers frequently purchase together from the seller

**FR-PT-005: Loyalty Pricing for Repeat Buyers**
- Seller can set automatic "loyalty discount" for buyers who've purchased from them before
- Example: "Repeat customers get 5% off automatically"
- Creates seller-specific retention mechanism

---

# SECTION 16: SELLER COMMUNICATION & SUPPORT

## Messaging System

**Buyer-Seller Messaging:**
- In-platform messaging system (not email)
- Seller can respond to buyer questions about products before purchase
- All messages stored; auditable for dispute resolution
- Response time tracking: shown publicly on seller profile
- Automated away message when seller is offline

**DupeScout ↔ Seller Communication:**
- Policy updates: in-app notification + email
- Account alerts: WhatsApp + email
- Performance reviews: email + in-portal notification
- Seller newsletter: monthly (opt-in)

## Seller Support

**FR-SS-001: Support Channels**
- Live chat: 9 AM - 9 PM IST (extended hours for high-volume sellers)
- Email: support@dupescout.com (24-hour response SLA)
- WhatsApp support: for urgent order issues (high-tier sellers)
- Self-service knowledge base: searchable FAQ + video guides

**FR-SS-002: Seller Success Program**
- Dedicated seller success manager for sellers doing >100 orders/month
- Monthly review call
- Early access to new features
- Dedicated Slack channel for immediate help

**FR-SS-003: Seller Community**
- Private WhatsApp group for DupeScout sellers by category (furniture, fashion, etc.)
- Weekly tips from DupeScout team
- Peer learning: top sellers share what's working
- Platform updates and beta feature access

---

# SECTION 17: SELLER RATINGS & BADGES

## Seller Rating System

**Rating Components:**

| Component | Weight | How Measured |
|-----------|--------|--------------|
| Product accuracy | 30% | Reviews mentioning "as described" vs. "not as described" |
| Shipping speed | 25% | Actual ship time vs. stated processing time |
| Product quality | 25% | Overall review star ratings |
| Responsiveness | 10% | Response time to buyer messages |
| Returns handling | 10% | Return resolution satisfaction scores |

**Rating Display:**
- Shown as star rating (★ X.X) + total orders fulfilled
- Shown on product pages, in search results, and seller profile

## Seller Badges

| Badge | Criteria | Benefit |
|-------|----------|---------|
| ✓ Verified Seller | GST + KYC complete | Trust signal on all listings |
| ⭐ Top Seller | Top 5% NPS for 3 consecutive months | Priority placement in category |
| 🏆 Power Seller | >500 orders/month, rating >4.5 | Dedicated success manager, lower settlement period |
| 🌿 Sustainable Brand | Self-certified + spot-check verified | Shown in sustainability filters |
| 🏛️ Artisan Verified | Verified MSME + artisan product category | Featured in "Local Artisans" discovery surface |
| 🇮🇳 Made in India | Products verified India-manufactured | Featured in "Made in India" collections |

---

# SECTION 18: COMPLIANCE & POLICY

## Listing Compliance Requirements

**Mandatory for every listing:**
- No brand trademark misrepresentation (e.g., cannot claim "Nike" if not Nike)
- Accurate material description (cannot claim "100% silk" if it's polyester)
- Accurate quantity (cannot ship fewer items than listed)
- No restricted products (see restricted product list)
- No counterfeit products
- Appropriate category selection

**Restricted Products (not allowed on DupeScout):**
- Counterfeit goods (products mimicking brand-name products with intent to deceive)
- Pharmaceuticals and prescription drugs
- Weapons and related accessories
- Alcohol and tobacco
- Live animals
- Hazardous chemicals
- Pirated media
- Adult content (unless in specifically designated adult category with age verification)

**FR-CP-001: Automated Compliance Scan**
- Every new listing undergoes automated scan before going live:
  - Brand name detection: flags if recognized brand names appear in product title/description inappropriately
  - Restricted keyword detection
  - Image analysis: detects if product image shows unauthorized brand logos
  - Price outlier detection: flags if price is suspiciously low (possible counterfeit signal)
- Most listings clear in <60 seconds
- Flagged listings go to manual review queue

**FR-CP-002: Seller Policy Agreement**
- Sellers must accept DupeScout's Seller Agreement at onboarding
- Key terms explicitly highlighted (not buried in legal text):
  - No counterfeit goods
  - Accurate product representation
  - Mandatory return policy minimums
  - Commission structure
  - Suspension and ban criteria

## Enforcement & Penalties

| Violation | First Offense | Repeat Offense | Severe |
|-----------|--------------|----------------|--------|
| Inaccurate listing description | Warning + required correction | 7-day suspension | — |
| Fake reviews (buying/generating) | Product delisted | 30-day suspension | Permanent ban |
| Counterfeit product | Immediate delisting + held payout | Permanent ban | — |
| Trademark misrepresentation | Immediate delisting | Permanent ban | — |
| Shipping fraud | Order cancelled + full refund to buyer | 30-day suspension | Permanent ban |
| Repeat low quality (>30% return rate) | Performance review | Suspension | — |

---

# SECTION 19: DATA MODELS — SELLER DOMAIN

## Core Seller Data Model

```
TABLE: sellers
─────────────────────────────────────────────────────
seller_id           UUID PRIMARY KEY
phone_number        VARCHAR(15) UNIQUE NOT NULL
store_name          VARCHAR(100) NOT NULL
store_slug          VARCHAR(100) UNIQUE NOT NULL  -- URL-friendly name
store_tagline       VARCHAR(200)
store_bio           TEXT
category_primary    ENUM (fashion, home, beauty, electronics, sports, other)
categories_other    JSONB  -- array of secondary categories
pin_code            VARCHAR(10)
city                VARCHAR(100)
state               VARCHAR(100)
gstin               VARCHAR(20) UNIQUE
pan_number          VARCHAR(20)
aadhaar_masked      VARCHAR(20)
bank_account_num    VARCHAR(30) ENCRYPTED
bank_ifsc           VARCHAR(15)
upi_id              VARCHAR(100)
verification_status ENUM (registered, gst_verified, kyc_verified, fully_verified, suspended, banned)
seller_tier         ENUM (new, standard, established, power)
overall_rating      DECIMAL(3,2)  -- 1.00 to 5.00
total_orders        INTEGER DEFAULT 0
total_gmv           DECIMAL(15,2) DEFAULT 0
commission_rate     DECIMAL(5,4)  -- seller-specific override if negotiated
onboarding_date     TIMESTAMP
last_active         TIMESTAMP
settings            JSONB  -- notification prefs, shipping defaults, etc.
badges              JSONB  -- array of earned badge IDs
```

```
TABLE: products
─────────────────────────────────────────────────────
product_id          UUID PRIMARY KEY
seller_id           UUID FOREIGN KEY → sellers
title               VARCHAR(150) NOT NULL
slug                VARCHAR(200) UNIQUE NOT NULL
description         TEXT
category            VARCHAR(100) NOT NULL
subcategory         VARCHAR(100)
brand               VARCHAR(100)  -- seller's own brand name
material_primary    VARCHAR(100)
material_secondary  VARCHAR(100)
materials_tags      JSONB  -- array: ['100% Linen', 'Hand-finished seams']
style_tags          JSONB  -- array: ['Japandi', 'Minimalist', 'Natural']
aesthetic_codes     JSONB  -- array of aesthetic system codes
color_primary       VARCHAR(50)
color_secondary     VARCHAR(50)
color_hex           VARCHAR(10)
price               DECIMAL(10,2) NOT NULL
price_compare       DECIMAL(10,2)  -- original/compare-at price
currency            VARCHAR(3) DEFAULT 'INR'
stock_quantity      INTEGER DEFAULT 0
sku                 VARCHAR(100)
weight_grams        INTEGER
dimensions_cm       JSONB  -- {l: 40, w: 30, h: 20}
images              JSONB  -- ordered array of image URLs
video_url           VARCHAR(500)
visual_embedding    VECTOR(1536)  -- pgvector; for similarity search
similar_products    JSONB  -- top 10 similar product IDs + similarity scores
shipping_days_min   INTEGER DEFAULT 2
shipping_days_max   INTEGER DEFAULT 5
return_policy       TEXT
status              ENUM (draft, pending_review, live, paused, archived, banned)
view_count          INTEGER DEFAULT 0
save_count          INTEGER DEFAULT 0
purchase_count      INTEGER DEFAULT 0
avg_rating          DECIMAL(3,2)
review_count        INTEGER DEFAULT 0
ai_generated_desc   BOOLEAN DEFAULT true
compliance_flags    JSONB  -- any automated flags
created_at          TIMESTAMP
updated_at          TIMESTAMP
```

```
TABLE: product_variants
─────────────────────────────────────────────────────
variant_id          UUID PRIMARY KEY
product_id          UUID FOREIGN KEY → products
variant_name        VARCHAR(100)  -- e.g., "Medium / Sage Green"
attributes          JSONB  -- {size: 'M', color: 'Sage Green'}
price_override      DECIMAL(10,2)  -- NULL = use parent price
stock_quantity      INTEGER DEFAULT 0
sku                 VARCHAR(100) UNIQUE
images              JSONB  -- variant-specific images (optional)
status              ENUM (active, out_of_stock, discontinued)
```

```
TABLE: seller_analytics_daily
─────────────────────────────────────────────────────
id                  UUID PRIMARY KEY
seller_id           UUID FOREIGN KEY → sellers
date                DATE NOT NULL
views               INTEGER DEFAULT 0
unique_visitors     INTEGER DEFAULT 0
add_to_cart         INTEGER DEFAULT 0
orders              INTEGER DEFAULT 0
gmv                 DECIMAL(12,2) DEFAULT 0
revenue_net         DECIMAL(12,2) DEFAULT 0
returns             INTEGER DEFAULT 0
messages_received   INTEGER DEFAULT 0
messages_responded  INTEGER DEFAULT 0
avg_response_time   INTEGER  -- minutes
search_visual       INTEGER DEFAULT 0  -- orders via visual search
search_keyword      INTEGER DEFAULT 0  -- orders via keyword search
search_ai_chat      INTEGER DEFAULT 0  -- orders via AI chat
```

```
TABLE: payouts
─────────────────────────────────────────────────────
payout_id           UUID PRIMARY KEY
seller_id           UUID FOREIGN KEY → sellers
payout_date         DATE NOT NULL
gross_sales         DECIMAL(12,2)
commission_deducted DECIMAL(12,2)
gateway_fees        DECIMAL(12,2)
returns_deducted    DECIMAL(12,2)
tds_deducted        DECIMAL(12,2)
net_amount          DECIMAL(12,2)
bank_account        VARCHAR(30) ENCRYPTED
upi_id              VARCHAR(100)
payment_method      ENUM (bank_transfer, upi)
status              ENUM (pending, processing, completed, failed)
transaction_ref     VARCHAR(100)
failure_reason      TEXT
```

---

# SECTION 20: API SPECIFICATIONS — SELLER APIs

## API Design Principles

- RESTful with consistent naming conventions
- All seller APIs require JWT authentication with seller scope
- Rate limiting: 100 requests/minute per seller for standard tier; 500/minute for power sellers
- All responses include: data, meta (pagination), errors

## Core Seller APIs

### Products API

```
POST /api/v1/seller/products
Purpose: Create a new product listing
Auth: Bearer token (seller)
Request:
{
  "title": "string",
  "description": "string",
  "category": "string",
  "price": number,
  "price_compare": number | null,
  "stock_quantity": number,
  "images": ["string (URL)"],
  "material_primary": "string",
  "style_tags": ["string"],
  "weight_grams": number,
  "dimensions_cm": { "l": number, "w": number, "h": number },
  "variants": [{
    "name": "string",
    "attributes": {},
    "price_override": number | null,
    "stock_quantity": number,
    "sku": "string"
  }]
}
Response: { "product_id": "uuid", "status": "pending_review", "estimated_live": "ISO datetime" }

GET /api/v1/seller/products
Purpose: List all seller's products with pagination
Params: status, category, page, limit (default 20, max 100)
Response: { "data": [Product], "meta": { "total": number, "page": number, "limit": number } }

PUT /api/v1/seller/products/{product_id}
Purpose: Update product details
Auth: Bearer token (must be product owner)
Request: Partial Product object (only fields to update)
Response: Updated Product object

DELETE /api/v1/seller/products/{product_id}
Purpose: Archive (soft delete) a product
Response: { "status": "archived" }

POST /api/v1/seller/products/ai-generate
Purpose: Generate product listing draft from uploaded photos
Request: { "image_urls": ["string"] }
Response: {
  "draft": {
    "title": "string",
    "description": "string",
    "material_tags": ["string"],
    "style_tags": ["string"],
    "similar_products": [{ "product_id": "uuid", "similarity_score": number }],
    "suggested_price_min": number,
    "suggested_price_max": number
  }
}

POST /api/v1/seller/products/bulk
Purpose: Bulk create products from JSON array (for integrations)
Request: { "products": [Product] }
Response: { "created": number, "failed": number, "errors": [{ "index": number, "error": "string" }] }
```

### Orders API

```
GET /api/v1/seller/orders
Purpose: List orders with filtering
Params: status, date_from, date_to, page, limit
Status values: new, accepted, packed, shipped, delivered, cancelled, return_requested, returned
Response: { "data": [Order], "meta": {...} }

GET /api/v1/seller/orders/{order_id}
Purpose: Get single order detail
Response: Full Order object with buyer details, items, shipping info

PUT /api/v1/seller/orders/{order_id}/accept
Purpose: Accept a new order
Response: { "status": "accepted", "ship_by": "ISO datetime" }

PUT /api/v1/seller/orders/{order_id}/ship
Purpose: Mark order as shipped with tracking info
Request: { "carrier": "string", "awb_number": "string", "ship_date": "ISO datetime" }
Response: Updated Order object

PUT /api/v1/seller/orders/{order_id}/cancel
Purpose: Cancel an order (before shipment only)
Request: { "reason": "string" }
Response: { "status": "cancelled", "refund_initiated": true }
```

### Analytics API

```
GET /api/v1/seller/analytics/summary
Purpose: Get analytics summary for date range
Params: date_from, date_to, granularity (day|week|month)
Response: {
  "revenue": { "total": number, "series": [{ "date": "string", "value": number }] },
  "orders": { "total": number, "series": [...] },
  "views": { "total": number, "series": [...] },
  "conversion_rate": { "current": number, "benchmark": number },
  "top_products": [{ "product_id": "uuid", "revenue": number, "orders": number }],
  "traffic_sources": { "visual_search": number, "keyword": number, "ai_chat": number, "direct": number }
}

GET /api/v1/seller/analytics/ai-insights
Purpose: Get AI-generated insights and recommendations
Response: {
  "insights": [{
    "type": "string",  // "opportunity" | "warning" | "trend" | "pricing"
    "priority": "string",  // "high" | "medium" | "low"
    "title": "string",
    "description": "string",
    "action_label": "string",
    "action_endpoint": "string"  // API endpoint to take the recommended action
  }]
}
```

### Payout API

```
GET /api/v1/seller/payouts
Purpose: List payout history
Response: { "data": [Payout], "meta": {...} }

GET /api/v1/seller/payouts/upcoming
Purpose: Get next scheduled payout details
Response: {
  "amount": number,
  "payout_date": "ISO datetime",
  "breakdown": {
    "gross_sales": number,
    "commission": number,
    "gateway_fees": number,
    "returns": number,
    "net": number
  }
}
```

---

*End of Volume 3.*

**Next: Volume 4 — Admin Console PRD**

---

*DupeScout Founder Blueprint — Volume 3 of 6*  
*Confidential. Not for distribution.*
