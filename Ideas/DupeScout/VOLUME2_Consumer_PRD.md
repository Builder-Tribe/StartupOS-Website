# DUPESCOUT — VOLUME 2
## Consumer Product Requirements Document: Web + Mobile

**Classification:** Confidential — Founding Document  
**Version:** 1.0 | **Date:** July 2026  
**Part of:** DupeScout Founder Blueprint (6-Volume Series)

---

# TABLE OF CONTENTS — VOLUME 2

1. Product Principles Recap
2. User Personas (Detailed)
3. Consumer Journeys (End-to-End)
4. Feature Architecture Overview
5. Core Consumer PRD
   - 5.1 Entry Points (Home / Discovery)
   - 5.2 Visual Search Engine
   - 5.3 Conversational AI Shopping
   - 5.4 Product Detail Page
   - 5.5 Comparison Engine
   - 5.6 Collections & Wishlist
   - 5.7 AI Style Assistant
   - 5.8 Outfit Builder (Fashion)
   - 5.9 Room Lens (Home/Furniture)
   - 5.10 Trend Intelligence Feed
   - 5.11 Price Tracker & Alerts
   - 5.12 Social Sharing & Community
   - 5.13 Checkout & Payments
   - 5.14 Order Management
   - 5.15 Profile & Preferences
   - 5.16 DupeScout Pro
6. Mobile UX (iOS + Android)
7. Web UX
8. User Flows (Detailed)
9. Edge Cases & Error States
10. Accessibility Standards
11. Performance Requirements
12. Design System Reference

---

# SECTION 1: PRODUCT PRINCIPLES RECAP

Before writing a single feature, return to first principles. Every feature in this PRD must answer: **which principle does this serve?**

| Principle | Application in Consumer PRD |
|-----------|----------------------------|
| **Visual First** | Camera is always one tap away. Never force keyword entry. |
| **AI Explains** | Every result has a reason. Every recommendation is justified. |
| **Honesty Over Conversion** | Show quality tradeoffs. Don't hide "the cheaper option is worse in this way." |
| **Local First** | Local sellers surface equally; never buried by brand bias. |
| **No Ads in Search** | Sponsored content is clearly labeled, separate from organic. |
| **Speed = Respect** | Visual search returns in <2s. Product pages load in <1s. |
| **Trust is the Business** | Verification badges, review authenticity, similarity score honesty. |

**What DupeScout does NOT do:**
- Does not show fake urgency ("Only 2 left! 14 people viewing!")
- Does not add hidden fees at checkout
- Does not push notifications without explicit opt-in per category
- Does not manipulate search ranking to favor higher-commission products
- Does not show results that are not genuinely visually similar

---

# SECTION 2: USER PERSONAS

## Persona 1: Aesthetic Priya

**"I know exactly what I want, I just can't find it."**

| Attribute | Detail |
|-----------|--------|
| Age | 23 |
| Location | Mumbai (lives in a shared apartment in Andheri) |
| Occupation | Junior UX Designer at a startup (₹45,000/month CTC) |
| Disposable income | ~₹8,000/month for non-essentials |
| Primary devices | iPhone 14 (primary), MacBook (work) |
| Social media | Instagram (3h/day), Pinterest, YouTube |
| Shopping frequency | 2-3 fashion purchases/month, 1 home/lifestyle per month |
| Current shopping tools | Amazon (reluctantly), Myntra, Nykaa, Pinterest |

**Pain Points:**
- Spends 40+ minutes trying to find products she saw on Instagram
- Finds Amazon results look nothing like what she wanted aesthetically
- Frustrated that Myntra's prices are often above her budget
- Has no tool that can explain "why is this ₹4,000 version worse than the ₹12,000 version?"

**Goals on DupeScout:**
- Upload screenshot → find what she wants in 30 seconds
- Get honest comparison of the ₹4,000 vs ₹12,000 version
- Build collections to plan future purchases
- Share her "finds" with friends for social capital

**DupeScout Features She Loves:**
- Visual Search (core)
- Similarity Score + AI explanation
- Collections
- Price Alerts
- Smart Value picks
- Instagram link paste

---

## Persona 2: Home Decorator Rohit

**"I want my apartment to look like that photo, under ₹2 lakh."**

| Attribute | Detail |
|-----------|--------|
| Age | 28 |
| Location | Bengaluru (just moved to 2BHK with new job) |
| Occupation | Product Manager at a tech company (₹1.8L/month CTC) |
| Disposable income | ₹30,000-50,000/month (furnishing budget) |
| Primary devices | Android (Samsung Galaxy S23), Dell laptop |
| Social media | Pinterest, YouTube, Instagram (lighter use) |
| Shopping frequency | Currently heavy (new apartment), normally 1-2 home items/month |
| Current shopping tools | Pepperfry, Urban Ladder, Amazon, Pinterest |

**Pain Points:**
- Finds a design he loves on Pinterest but cannot afford the $2,000 Restoration Hardware version
- Wants cohesive aesthetics across all furniture purchases but no tool helps with that
- Spends hours across multiple platforms with no unified comparison
- Returns items often because the online photo doesn't match reality

**Goals on DupeScout:**
- Take a photo of an inspiration image → get Indian alternatives at different price points
- Build a "room plan" that shows him the full aesthetic before buying
- Understand the actual quality differences between ₹8,000 and ₹40,000 sofas
- Find local Rajasthan furniture makers he'd never discover on Amazon

**DupeScout Features He Loves:**
- Room Lens
- Visual Search with "paste image URL"
- Material Quality Explainer
- Local Seller profiles
- Room planner / Budget tracker

---

## Persona 3: Trend Chaser Arjun

**"I want to wear it before it goes mainstream."**

| Attribute | Detail |
|-----------|--------|
| Age | 19 |
| Location | Delhi (lives with family, studying BCom) |
| Occupation | Student; part-time gig work; ₹5,000-8,000/month disposable |
| Primary devices | Android (Redmi Note 13), tablet for fashion research |
| Social media | Instagram (5h/day), YouTube Shorts, Twitter/X |
| Shopping frequency | 4-6 fashion items/month (low ticket, high frequency) |
| Current shopping tools | Meesho, Amazon, Instagram Shopping, occasionally Myntra |

**Pain Points:**
- By the time he figures out a trend, his feed is already showing it as mainstream
- Can't afford the authentic brands that set the trends (Carhartt, New Balance, Stüssy)
- Buys dupes but is never sure if the quality will hold up
- Has been burned by low-quality purchases multiple times

**Goals on DupeScout:**
- Find streetwear trends before they go mainstream
- Get honest quality signals on budget alternatives
- Find trusted sellers for specific product categories
- Build and share outfits for social capital

**DupeScout Features He Loves:**
- Trend Intelligence Feed
- Outfit Builder
- Trusted Seller badges
- Social sharing ("I found this before everyone")
- Price tier quality comparison

---

## Persona 4: Gift Finder Neha

**"I want to give a gift that feels expensive but isn't."**

| Attribute | Detail |
|-----------|--------|
| Age | 29 |
| Location | Pune (working professional, lives independently) |
| Occupation | Marketing Manager (₹80,000/month CTC) |
| Disposable income | ₹15,000/month; gift budget ₹2,000-5,000 per occasion |
| Primary devices | iPhone 13 |
| Social media | Instagram, WhatsApp |
| Shopping frequency | 3-4 gifts/month (birthdays, housewarmings, etc.) |
| Current tools | Amazon, Nykaa, Anthropologie (for inspiration), Google |

**Pain Points:**
- Wants to give gifts that look thoughtful and aesthetic, not just "Amazon basics"
- Can't afford actual premium brands like Forest Essentials, Anthropologie
- No tool helps her find "looks premium, costs ₹2,000" across categories
- Gift wrapping/presentation is important; most platforms don't address this

**Goals on DupeScout:**
- Type "gift for my friend who loves minimalist home décor, under ₹3,000" → get results
- Find products that look premium and photograph beautifully
- Get AI-generated gift set curation
- Save gift ideas to revisit near occasions

**DupeScout Features She Loves:**
- AI Gift Finder (conversational)
- "Looks Premium" quality filter
- Gift Collections
- Budget-based filtering
- Smart Value picks with aesthetic quality focus

---

## Persona 5: Local Seller Champion Malti

**"I make better sofas than IKEA. Nobody knows I exist."**

*Note: This persona is technically a seller, included here because her perspective shapes the consumer experience — she IS the supply behind the "Local First" discovery results.*

| Attribute | Detail |
|-----------|--------|
| Age | 34 |
| Location | Jodhpur, Rajasthan |
| Occupation | Owns a small furniture workshop (3 artisans) |
| Business | Handcrafted furniture; ₹8,000-45,000 price range |
| Online presence | WhatsApp catalogue, occasionally Flipkart (poor results) |
| Core need | Reach buyers who value handcraft and reasonable prices |

**What she needs from DupeScout's consumer side:**
- A buyer who searches for "handcrafted boho side table" and finds HER product
- Reviews that build trust because they're genuine
- A product page that shows material quality, not just a single photo

---

# SECTION 3: CONSUMER JOURNEYS

## Journey 1: The Screenshot-to-Purchase Flow
**Persona: Aesthetic Priya | Category: Fashion**

```
STEP 1: DISCOVERY
Priya sees a creator wearing a green linen co-ord set in an Instagram Reel.
She screenshots it. (Trigger: visual inspiration on social media)

STEP 2: ENTRY
She opens DupeScout app. 
The home screen is a camera/search bar — not a banner-filled homepage.
She taps "Upload Photo" and selects the screenshot.
Time: 3 seconds.

STEP 3: AI ANALYSIS
DupeScout AI analyzes the image:
- Detects: Women's co-ord set, linen fabric, sage green color, wide-leg pants,
  oversized blazer, minimal detail, "minimal chic" aesthetic code
- Confidence: 94%
- Category: Women's Coordinated Sets
Time: 1.8 seconds.

STEP 4: RESULTS PAGE
DupeScout returns 3 tiers of results:
┌─────────────────────────────────────────────────────────┐
│ AI FOUND: Sage Green Linen Co-ord Set                   │
│ Similarity: 94% match                                    │
│                                                         │
│ ORIGINAL PRODUCT (likely)                               │
│ [Image] Zara Linen Wide-Leg Coord Set                   │
│ ₹7,999 | Available on Zara.in | In stock               │
│                                                         │
│ SMART VALUE PICKS (85-95% similarity, lower price)      │
│ [Image] Sage Linen Set — "The Label" (D2C brand)        │
│ ₹2,499 | 91% similar | 4.6★ 847 reviews                │
│ AI says: "Same linen texture, slightly less structured  │
│ blazer. The quality difference is marginal at this      │
│ price point."                                           │
│                                                         │
│ [Image] Coord Set — Niharika Fabrics (Surat seller)     │
│ ₹1,200 | 87% similar | 4.2★ 234 reviews                │
│ AI says: "Very similar silhouette. Linen blend vs       │
│ pure linen — visible difference if you look closely."   │
│                                                         │
│ ALSO SIMILAR (75-85% match)                             │
│ [grid of 8 more products]                               │
└─────────────────────────────────────────────────────────┘

STEP 5: DEEP DIVE
Priya taps on "The Label" product.
Product Detail Page loads in 0.9 seconds.
She sees: More photos, material breakdown, review highlights,
size chart, "Compare to Zara version" button.

She taps "Compare to Zara version":
┌──────────────────────┬──────────────────────┐
│ Zara Linen Set       │ The Label Linen Set  │
│ ₹7,999              │ ₹2,499              │
├──────────────────────┼──────────────────────┤
│ 100% Linen          │ 100% Linen           │
│ Portugal source      │ India source         │
│ Structured blazer    │ Slightly relaxed fit │
│ Premium buttons      │ Standard buttons     │
│ 4.4★ 2,100 reviews  │ 4.6★ 847 reviews     │
│ Returns: Easy (Zara) │ Returns: 7-day       │
├──────────────────────┼──────────────────────┤
│ AI Verdict: Zara is  │ AI Verdict: 91%      │
│ worth ₹5,500 more if │ the look at 31% the  │
│ fabric origin matters│ price. Recommended.  │
└──────────────────────┴──────────────────────┘

STEP 6: PURCHASE
Priya adds to cart, selects size M.
Checks out via UPI in 2 taps.
Delivery: 3-5 days.
Total: ₹2,499 + ₹50 shipping = ₹2,549.
Saves ₹5,450 vs the Zara original.

STEP 7: POST-PURCHASE
DupeScout prompts: "Add to your Style Collection?"
Priya adds it to her "Summer Looks 2026" collection.
The app asks: "Complete the look? Here are similar bags and sandals."
Priya discovers a bag she loves (₹890) and adds to wishlist.

STEP 8: SOCIAL
She shares the "find" to her WhatsApp story.
Caption generated by DupeScout AI: "Found this for ₹2,499 vs ₹7,999 original 🔥"
3 friends ask for the link. DupeScout tracks referral conversions.
```

**Conversion metrics this journey is designed to achieve:**
- Time from upload to first result: <2 seconds
- Time from upload to add-to-cart: <5 minutes
- Session abandonment point: Never before seeing results
- Share rate: >15% of purchases

---

## Journey 2: Conversational Gift Discovery
**Persona: Gift Finder Neha | Category: Home Décor Gift**

```
STEP 1: ENTRY
Neha opens DupeScout. She taps the AI chat button.
(Not the camera — she doesn't have an image. She has a need.)

STEP 2: CONVERSATION
DupeScout AI: "What are we shopping for today?"

Neha: "I need a housewarming gift for a friend who loves 
       minimalist Scandinavian style. Budget ₹2,500."

AI: "Got it — minimalist Scandi aesthetic, ₹2,500 max.
     A few quick questions:
     → Is she into plants/botanicals? [Yes / No / Not sure]
     → Candles ok? [Yes / No / She hates strong scents]
     → Kitchen / Living room / Bathroom focus?"

Neha: "Loves plants. Candles ok (no strong scents). Living room."

AI: "Here are 5 gift options that are genuinely Scandi-minimal
     and won't look like they came from Amazon:

     1. Ceramic Bud Vase Set (3-piece) — Mitti Works
        ₹890 | Handmade in Jaipur | Matte white, minimal
        AI note: "Looks like it's from Muji. Made by artisan."

     2. Linen Table Runner + 2 Beeswax Candles Bundle
        ₹1,400 | Organic Cotton Co.
        AI note: "Unscented beeswax. Very Scandi."

     3. Minimal Brass Planter Stand
        ₹1,800 | Kalakar Home
        AI note: "Instagram-worthy. Good for small plants."

     4. Complete set: Vase + Runner + Candle
        Total: ₹2,290 | Free gift wrap available
        AI note: "My recommendation for ₹2,500 budget.
                  Cohesive gift that looks expensive."

     5. Wabi-sabi Ceramic Tray (bestseller)
        ₹1,200 | 4.8★ 1,240 reviews
        AI note: 'Top gifted item in this aesthetic.'"

Neha: "I love option 4. Can I add a note with the gift?"

AI: "Absolutely. Add the gift message at checkout.
     DupeScout will pack it together in tissue and a kraft box."

[Neha proceeds to checkout]
```

**Key design decisions in this journey:**
1. Conversation, not keyword search — no friction in starting
2. AI asks clarifying questions — builds context without overwhelming
3. AI provides OPTIONS, not a single answer
4. "My recommendation" clearly flagged — AI takes a position
5. Practical logistics ("free gift wrap") surfaced proactively

---

## Journey 3: Room Inspiration to Purchase
**Persona: Home Decorator Rohit | Category: Furniture**

```
STEP 1: INSPIRATION
Rohit screenshots a living room photo from a design blog.
The room features: cream bouclé sofa, walnut coffee table, 
rattan floor lamp, minimal bookshelf, monstera plant.
Estimated original products total: ~₹4,00,000.

STEP 2: ROOM LENS UPLOAD
Rohit opens DupeScout → Room Lens.
Uploads the screenshot.
AI identifies 6 distinct products in the scene.
Each product is highlighted with a tap target.

STEP 3: PRODUCT-BY-PRODUCT RESULTS
Rohit taps the sofa:
  Original likely: West Elm Henry Sofa (~₹1,40,000)
  Smart value: Nilkamal Fabric Sofa (87% similar) — ₹24,999
  Local artisan: Jodhpur Craft Co. bouclé-style (84% similar) — ₹18,500

Rohit taps the coffee table:
  Original: CB2 Walnut Table (~₹65,000, not available India)
  Smart value: Wooden Street Sheesham Table — ₹12,999
  Local artisan: Rajwada Carpentry (89% similar) — ₹9,200

Rohit taps the floor lamp:
  Original: Serena & Lily Rattan Lamp (~$450)
  Smart value: West Elm India rattan lamp — ₹8,999
  Local: Artisan Weaves Rattan Floor Lamp — ₹3,200

STEP 4: BUDGET PLANNER
DupeScout generates a room budget planner:
┌────────────────────────────────────────────────────────────┐
│ ROOM BUDGET PLANNER                                        │
│ Based on: "Nordic Living Room Inspiration"                  │
│                                                            │
│ Item            Smart Pick     Artisan Pick    Premium     │
│ ─────────────   ──────────     ────────────    ──────────  │
│ Sofa            ₹24,999        ₹18,500         ₹1,40,000   │
│ Coffee Table    ₹12,999        ₹9,200          ₹65,000     │
│ Floor Lamp      ₹8,999         ₹3,200          ₹35,000     │
│ Bookshelf       ₹7,499         ₹5,100          ₹28,000     │
│ Rug             ₹3,999         ₹2,800          ₹18,000     │
│ ─────────────   ──────────     ────────────    ──────────  │
│ TOTAL           ₹58,495        ₹38,800         ₹2,86,000   │
│                                                            │
│ AI: "The 'Artisan Mix' gives you 86% of this aesthetic     │
│      at 13.5% of the inspiration room's estimated cost."   │
│                                                            │
│ [Save Plan]  [Buy All Artisan]  [Mix & Match]              │
└────────────────────────────────────────────────────────────┘

STEP 5: SAVE AND PURCHASE OVER TIME
Rohit saves the room plan.
He buys the sofa first (biggest purchase — wants to check quality).
DupeScout saves his plan. Two weeks later, when he's ready for
the table, DupeScout sends a price alert: "Wooden Street sale — 
your saved table is 20% off today."

Rohit buys the table.
Total spend over 3 months: ₹47,300 (artisan mix with one upgrade).
Total saves vs. premium original: ₹2,38,700.
```

---

# SECTION 4: FEATURE ARCHITECTURE OVERVIEW

## The DupeScout Feature Stack

```
╔══════════════════════════════════════════════════════════════════╗
║                    USER-FACING LAYERS                            ║
╠══════════════════════════════════════════════════════════════════╣
║  DISCOVERY       RESEARCH        PURCHASE        POST-PURCHASE   ║
║  ─────────────   ──────────────  ─────────────   ─────────────  ║
║  Visual Search   Product DNA     Cart & Checkout  Order Track    ║
║  AI Chat         Comparison      UPI / Cards      Returns        ║
║  Trend Feed      Price History   Saved Addresses  Reviews        ║
║  Room Lens       Review AI       Coupons          Reorder        ║
║  Outfit Builder  Size Guide      Loyalty Points   Share Find     ║
║  Link Paste      Seller Profile                                   ║
╠══════════════════════════════════════════════════════════════════╣
║                    AI INTELLIGENCE LAYER                          ║
╠══════════════════════════════════════════════════════════════════╣
║  Visual Similarity Engine  |  Product DNA Engine                 ║
║  Recommendation Engine     |  Trend Prediction Engine            ║
║  Conversational AI         |  Price Intelligence Engine          ║
║  Review Authenticity AI    |  Personalization Engine             ║
╠══════════════════════════════════════════════════════════════════╣
║                    PLATFORM LAYER                                 ║
╠══════════════════════════════════════════════════════════════════╣
║  Marketplace Engine  |  Search Index  |  Seller Network          ║
║  Payments (UPI/Razorpay)  |  Logistics (Shiprocket/Delhivery)   ║
║  Notification System  |  Analytics  |  Content Delivery          ║
╚══════════════════════════════════════════════════════════════════╝
```

---

# SECTION 5: CORE CONSUMER PRD

## 5.1 Entry Points — Home / Discovery Screen

### Design Philosophy for Home Screen

**This is not an ecommerce homepage.** There are no banners. There are no "sale" announcements. There are no brand logos. There is no "featured collection" grid.

The home screen has ONE primary purpose: **get the user into a discovery interaction as fast as possible.**

Inspiration: The home screen should feel more like the "new conversation" screen in ChatGPT — clean, expectant, ready — than like an Amazon or Flipkart homepage.

### Home Screen Layout (Mobile)

```
┌─────────────────────────────────────────┐
│  DupeScout          🔔  👤             │  ← Minimal header
├─────────────────────────────────────────┤
│                                         │
│   What are you looking for?             │  ← Tagline / prompt
│                                         │
│  ┌──────────────────────────────────┐  │
│  │  📷  Describe or ask anything…  │  │  ← Primary search/chat bar
│  └──────────────────────────────────┘  │
│                                         │
│  ┌────┐  ┌─────┐  ┌─────┐  ┌──────┐  │
│  │ 📷 │  │  🔗 │  │  🎙️ │  │  🖼  │  │  ← Quick action pills
│  │Cam │  │Link │  │Voice│  │Upload│  │
│  └────┘  └─────┘  └─────┘  └──────┘  │
│                                         │
├─────────────────────────────────────────┤
│  TRENDING TODAY                         │
│  ┌──────────┐ ┌──────────┐ ┌────────┐  │
│  │[img]     │ │[img]     │ │[img]   │  │  ← Trend cards
│  │Quiet Lux │ │Rattan    │ │Y2K Bag │  │    (not product ads)
│  │+847 saves│ │+1.2K     │ │+2.3K   │  │
│  └──────────┘ └──────────┘ └────────┘  │
├─────────────────────────────────────────┤
│  FOR YOU  (personalized after session 2)│
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │[img] │ │[img] │ │[img] │ │[img] │  │  ← Personalized
│  │₹1,200│ │₹4,500│ │₹890  │ │₹2,800│  │    product recs
│  └──────┘ └──────┘ └──────┘ └──────┘  │
├─────────────────────────────────────────┤
│  LOCAL SELLERS NEAR YOU                 │  ← Local first
│  [Map view + seller cards]              │
└─────────────────────────────────────────┘
│  🏠  🔍  💬  ❤️  👤  │  ← Bottom nav
```

### Home Screen — Component Specifications

**Primary Search Bar:**
- Placeholder text rotates: "Search by photo or words..." / "Paste an Instagram link..." / "Ask AI anything..."
- On tap: expands to full-screen input with camera/voice/upload options visible
- Supports: text query, voice query, image upload, link paste
- Auto-detects input type (URL vs. query text vs. image)

**Quick Action Pills:**
- Camera: opens device camera with real-time overlay suggestions
- Link: opens link input field with platform detection (Instagram, Amazon, Pinterest, etc.)
- Voice: opens voice input (supports Hindi + English)
- Upload: opens photo library picker

**Trending Today:**
- Curated by trend intelligence engine, not manual editorial
- Shows aesthetic categories (Quiet Luxury, Coastal Grandmother, etc.) not brand names
- "saves" count shows organic social proof
- Tapping a trend card opens a visual inspiration grid with shoppable products

**For You (Personalized):**
- Empty on first session — shows "Trending" content instead
- Populated after first 2-3 searches with style preference signals
- Always shows price clearly
- No "sponsored" products in this section — ever

**Local Sellers Near You:**
- Shows seller cards within 50km of user's saved location
- Not just products — shows the person/business behind the product
- Creates emotional connection to local artisan economy

---

## 5.2 Visual Search Engine

### Feature Overview

The Visual Search Engine is the core product feature. Everything else is built on top of it.

**User inputs accepted:**
1. Direct camera capture (live photo)
2. Photo from device gallery (screenshot, saved image)
3. URL from any platform (Amazon, Instagram, Pinterest, Myntra, Flipkart, Zara, IKEA, etc.)
4. Drag-and-drop on web
5. Share extension (iOS/Android share sheet integration)

### Visual Search — Functional Requirements

**FR-VS-001: Image Input Handling**
- Accept: JPG, PNG, WEBP, HEIC, GIF (first frame)
- Max file size: 25MB
- Minimum resolution: 100×100px
- Optimal: 800×800px+
- Auto-crop: user can select specific region of image (e.g., just the bag in a full-outfit shot)
- Multi-product detection: if multiple distinct products detected, show product selection overlay

**FR-VS-002: URL Input Handling**
- Supported platforms: Amazon, Flipkart, Myntra, Meesho, Instagram, Pinterest, IKEA, Zara.in, HM, Pepperfry, Urban Ladder, Nykaa Fashion, AJIO, YouTube (thumbnail + description extraction)
- Unsupported URL: show "We couldn't extract product info from this link. Try uploading a screenshot instead."
- Processing: Extract product images, name, price, and attributes from URL
- Processing time: <3 seconds for supported platforms

**FR-VS-003: Analysis Pipeline**
- Step 1: Category detection (fashion, furniture, beauty, etc.)
- Step 2: Object detection (identify the primary product in frame)
- Step 3: Attribute extraction (color, material, shape, style code)
- Step 4: Aesthetic classification (assign to style system: minimalist, maximalist, etc.)
- Step 5: Embedding generation (vector embedding for similarity search)
- Step 6: Catalog search (search indexed products by vector similarity)
- Step 7: External platform search (search Amazon, Flipkart, etc. via affiliate APIs)
- Step 8: Results ranking and AI explanation generation
- Total end-to-end time target: <2 seconds

**FR-VS-004: Results Page**
- Results organized in three tiers (Original/Identified, Smart Value, Similar Products)
- Each result shows: image, price, brand/seller name, similarity score (%), star rating, review count
- AI explanation card for top 3 results: explains what is similar, what is different, AI verdict
- Filter options: Price range, Category refinement, Similarity threshold (>90%, >80%, >70%), Local sellers only, Verified sellers only
- Sort options: Best match, Lowest price, Best reviewed, Trending
- Infinite scroll for additional results
- Results refresh: user can mark a result as "not relevant" — system learns and re-ranks

**FR-VS-005: Similarity Score Display**
- Score shown as percentage (e.g., "94% similar")
- Score color: 90-100% = green, 75-90% = blue, 60-75% = amber
- Tapping the score opens a breakdown: "Shape: 97% | Color: 98% | Material: 89% | Style: 91%"
- Scores are honest — show 62% as 62%, not rounded up to 65%

---

## 5.3 Conversational AI Shopping

### Feature Overview

The AI Shopping Copilot enables users to describe what they want in natural language and have a conversation that progressively narrows to the right product. This feature is not a search bar. It is a conversation with someone who has seen everything on the internet and has excellent taste.

### Design Principle

The AI should feel like "your most stylish, most knowledgeable friend who never tries to sell you anything." It gives opinions. It pushes back. It asks clarifying questions. It admits when it doesn't know.

### Functional Requirements

**FR-AI-001: Conversation Interface**
- Full-screen chat interface, similar to WhatsApp
- User input: text + voice (Hindi + English supported)
- AI response: text + product cards embedded inline
- Product cards in chat: compact version (image, price, similarity score, quick buy button)
- Conversation history: persists across sessions (user can reference past chats)
- "New search" clears conversation; user prompted to save key results first

**FR-AI-002: Natural Language Understanding**
- Supports queries like:
  - "I want this sofa under ₹20,000" (with image attached)
  - "Find me an outfit that looks like what Deepika wore at Cannes"
  - "What's a good dupe for the IKEA KALLAX shelf?"
  - "I need a bag that goes with this dress" (with dress image)
  - "Show me furniture that matches Japandi aesthetic under ₹50,000 total"
  - "Is the ₹4,000 version actually worth it vs the ₹1,200 one?"
- Language: supports Hinglish (mixed Hindi-English), pure Hindi, pure English
- Context memory: maintains context across turns (no need to repeat information)

**FR-AI-003: AI Persona and Behavior**
- Persona: Knowledgeable friend with excellent taste, not a sales robot
- Opinions: AI gives clear recommendations, not just lists. "I'd go with option 2."
- Honesty: "I'm going to be honest — the ₹2,000 version probably won't last more than 6 months based on the material. It's worth the ₹5,000 if you plan to wear it often."
- Clarifying questions: AI asks when the query is ambiguous, but never more than 2 follow-up questions before showing results
- Uncertainty: AI acknowledges when it cannot identify a specific product ("I can't find the exact product, but here are 5 things that match the aesthetic")
- No hallucination: AI only shows real, in-stock products. Never fabricates specifications or prices.

**FR-AI-004: Gift Finder Mode**
- Triggered by: "gift for...", "present for...", "I need to buy for my friend who..."
- Special UI: starts with a quick profiling flow (recipient preferences, budget, occasion)
- Output: curated gift sets, not individual products
- Gift wrapping option surfaced at checkout

**FR-AI-005: Budget Optimizer Mode**
- Triggered by: "under ₹X", "within budget of ₹X", "cheapest option that..."
- Behavior: AI prioritizes value-for-money over similarity score
- Shows: "At ₹2,000 you can get 87% of the look. At ₹4,500 you can get 94%. The extra ₹2,500 buys you [specific difference]."

---

## 5.4 Product Detail Page (PDP)

### Design Philosophy

The PDP must do two things simultaneously:
1. Give users everything they need to make a confident purchase decision
2. Not overwhelm them with information

The PDP is NOT the Amazon product page. It is not a wall of text with 47 bullet points. It is a visual, scannable, honest product story.

### PDP Layout (Mobile)

```
┌─────────────────────────────────────────────┐
│ ← Back    [Product Name]    🔗 Share  ❤️   │
├─────────────────────────────────────────────┤
│                                             │
│         [PRIMARY PRODUCT IMAGE]             │
│    ◀ ── swipe for more photos ── ▶         │
│                                             │
│         ●  ○  ○  ○  ○  ○                  │  ← image dots
├─────────────────────────────────────────────┤
│  Sage Green Linen Co-ord Set                │
│  by The Label                               │
│                                             │
│  ★★★★☆  4.6  (847 reviews)                │
│  Verified Seller  ✓  |  Ships in 2-3 days  │
├─────────────────────────────────────────────┤
│  ₹2,499    ~~₹4,999~~                      │  ← Price + discount
│                                             │
│  ┌───────────────────────────────────────┐  │
│  │ 94% similar to Zara Linen Set (₹7,999)│  │  ← Similarity pill
│  │  [See comparison →]                   │  │
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  SIZE:  XS  S  [M]  L  XL  XXL             │
│         ↑ Your usual size                   │
├─────────────────────────────────────────────┤
│  AI SAYS                                    │
│  ┌───────────────────────────────────────┐  │
│  │ "The linen quality here is comparable  │  │
│  │ to the Zara version — same Indian      │  │
│  │ linen source. The main difference is   │  │
│  │ the blazer has slightly less structure.│  │
│  │ For casual wear, you won't notice.     │  │
│  │ For office use, the Zara might be worth│  │
│  │ the extra ₹5,500."                    │  │
│  └───────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│  MATERIAL & CONSTRUCTION          [Expand]  │
│  • 100% Linen (Indian sourced)              │
│  • Hand-finished seams                      │
│  • Washable at 30°C                         │
├─────────────────────────────────────────────┤
│  REVIEWS SUMMARY                  [See all] │
│  ★★★★★ "Exactly as described. Love it!"   │
│  ★★★★☆ "Good quality, slight size issue"  │
│  ★★★★★ "Looks way more expensive"          │
│                                             │
│  AI Review Analysis: 89% positive. Common  │
│  praise: quality, look. Common issue: sizing│
│  runs large — consider ordering one size    │
│  smaller.                                   │
├─────────────────────────────────────────────┤
│  SELLER: The Label                          │
│  ⭐ 4.8 seller rating | 2,847 orders       │
│  📍 Delhi, India | Ships pan-India          │
│  [View seller profile]                      │
├─────────────────────────────────────────────┤
│  YOU MIGHT ALSO LOVE                        │
│  [Row of 6 similar products with prices]    │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐    │
│  │      ADD TO CART  ₹2,499           │    │  ← Primary CTA
│  └─────────────────────────────────────┘    │
│  ┌────────────────┐  ┌────────────────┐     │
│  │  ❤️ Save       │  │  ⚡ Buy Now     │    │
│  └────────────────┘  └────────────────┘     │
└─────────────────────────────────────────────┘
```

### PDP — Functional Requirements

**FR-PDP-001: Image Gallery**
- Minimum 5 images required from seller
- AI-generated quality check: flags blurry, poorly lit, or misrepresenting images
- Zoom capability (pinch to zoom on mobile)
- Video support: short product video optional (max 30 seconds)
- "How it looks on real people" section: user-submitted review photos with verified purchase badge

**FR-PDP-002: Similarity Display**
- Similarity pill showing "X% similar to [identified product]" visible above fold
- Tapping the pill opens a comparison modal (side-by-side with the reference product)
- If no identified original, show "Style match: [aesthetic category name]"
- Similarity score breakdown visible in comparison modal

**FR-PDP-003: AI Says Card**
- Always shown for products with similarity score data
- Tone: honest advisor, not sales pitch
- Must include: what is similar, what is different, when premium is worth it, when it isn't
- Max 3 sentences — concise, not comprehensive
- Refreshes as AI model improves (not static text stored in DB)

**FR-PDP-004: Material & Construction**
- Required fields from sellers: primary material, secondary material (if blend), care instructions, manufacturing location
- AI verification: cross-checks seller claims against product images using AI analysis
- "Material verified" badge shown when AI cross-check passes
- Flags when AI cannot verify seller's material claims

**FR-PDP-005: Reviews**
- Display: individual reviews (paginated) + AI review summary
- AI summary: sentiment analysis showing top praise themes, top concern themes
- Review authenticity: shows "Verified Purchase" badge, filters obvious fake reviews
- Size/fit guidance: AI aggregates size mentions in reviews to generate size guidance
- Photo reviews: shown prominently, more trusted signal than text-only

**FR-PDP-006: Seller Profile Card**
- Seller name, rating, total orders, location
- Verification badges: GST Verified, KYC Verified, Photos Authentic
- "Top Seller" badge if in top 5% of seller NPS
- Link to full seller profile page
- Response time: "Typically replies within 4 hours"

---

## 5.5 Comparison Engine

### Feature Overview

The Comparison Engine is a standalone feature that lets users place multiple products side-by-side and get an AI-structured comparison across the dimensions they actually care about.

**Trigger points:**
- From search results: select 2-4 products to compare
- From PDP: "Compare with similar" button
- From AI chat: user asks "compare these two options for me"

### Comparison Interface

```
┌─────────────────────────────────────────────────────────────────┐
│  COMPARING 2 PRODUCTS             [+ Add another]              │
├────────────────────────┬────────────────────────────────────────┤
│  Zara Linen Co-ord     │  The Label Linen Co-ord                │
│  [image]               │  [image]                               │
│  ₹7,999               │  ₹2,499                                │
│  External (Zara.in)    │  DupeScout Marketplace                 │
├────────────────────────┼────────────────────────────────────────┤
│  SIMILARITY SCORE      │                                        │
│  Reference (100%)      │  91% match                             │
├────────────────────────┼────────────────────────────────────────┤
│  MATERIAL              │                                        │
│  100% Linen            │  100% Linen                            │
│  Portugal sourced      │  India sourced                         │
├────────────────────────┼────────────────────────────────────────┤
│  CONSTRUCTION          │                                        │
│  Structured blazer     │  Semi-structured blazer                │
│  Premium buttons       │  Standard buttons                      │
├────────────────────────┼────────────────────────────────────────┤
│  REVIEWS               │                                        │
│  ★★★★☆ 4.4 (2,100)   │  ★★★★★ 4.6 (847)                     │
├────────────────────────┼────────────────────────────────────────┤
│  RETURN POLICY         │                                        │
│  30-day (Zara policy)  │  7-day (DupeScout policy)              │
├────────────────────────┼────────────────────────────────────────┤
│  DELIVERY              │                                        │
│  3-5 days              │  2-4 days                              │
├────────────────────────┴────────────────────────────────────────┤
│  AI VERDICT                                                     │
│                                                                 │
│  "The Label version gives you 91% of the Zara look at 31% of   │
│   the price. The practical difference: the blazer has slightly  │
│   less stiff structure, and the buttons are simpler. For casual │
│   or WFH wear, there is no meaningful difference. For formal    │
│   events, the Zara version has better structure.                │
│                                                                 │
│   My recommendation: The Label unless you specifically need    │
│   formal structure. You're saving ₹5,500."                     │
│                                                                 │
│   [Buy The Label ₹2,499]    [Buy Zara ₹7,999]                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5.6 Collections & Wishlist

### Feature Overview

Collections allow users to save products and inspiration images into organized visual boards — like Pinterest boards but with purchasable, price-tracked products.

**Collections vs. Wishlist:**
- **Wishlist:** Simple save list. One tap to add, one list.
- **Collections:** Organized boards. Multiple collections per user. Shareable. Collaborative (invite friends to co-curate).

### Collection Features

**FR-COL-001: Create Collection**
- Create with name + optional description
- Visibility: Private / Friends only / Public
- Cover image: auto-selected from first product added, or manually set

**FR-COL-002: Add to Collection**
- From search results, PDP, AI chat, or external share
- Can add: DupeScout products, external product links, inspiration images (non-purchasable)
- Products show current price when added; price history tracked

**FR-COL-003: Collection View**
- Pinterest-style masonry grid
- Prices shown on each item (with price change indicator if price dropped)
- Quick add to cart from collection view
- "Complete the look" AI button: AI analyzes the collection and suggests complementary products

**FR-COL-004: Price Tracking in Collections**
- All saved products are tracked for price changes
- When a price drops >10% on a saved item, user gets a notification
- Price history chart on each saved item

**FR-COL-005: Collaborative Collections**
- Invite by phone number or DupeScout username
- Collaborators can add products, not remove others' additions
- Activity feed: "[Name] added a product to your collection"
- Use case: roommates furnishing together, friends planning matching outfits for events

**FR-COL-006: Sharing**
- Collections can be shared as a link (public collections only)
- "Shared" collections show DupeScout branding in preview
- Referral credit: if a friend buys from a shared collection, the sharer gets ₹50 credit

---

## 5.7 AI Style Assistant

### Feature Overview

The Style Assistant is a dedicated AI feature for fashion users. It acts as a personal stylist who knows the user's wardrobe, budget, and aesthetic preferences.

**Key capabilities:**
1. **Wardrobe Memory:** User can photograph existing wardrobe items; AI remembers them
2. **"Does it match?":** Upload a new product; AI checks against saved wardrobe
3. **Outfit Suggestions:** AI suggests complete outfits using items the user already owns + new purchases
4. **Style Profile:** Over time, AI builds a style profile (color palette, silhouettes, aesthetics)

### Style Assistant — Setup Flow

```
First-time setup:
STEP 1: "Tell me about your style" 
  → Three visual mood boards shown; user picks 1-3 that resonate
  → (This is faster than asking "what's your aesthetic?")

STEP 2: "What's your budget range for a typical fashion purchase?"
  → Slider from ₹500 to ₹10,000+

STEP 3: "Add a few things from your wardrobe (optional)"
  → Camera flow to photograph 3-5 current items
  → AI identifies each item, adds to wardrobe

STEP 4: Style profile ready
  → "Based on what you told me, here are 8 picks I think you'll love"
```

**FR-SA-001: Wardrobe Management**
- Users can photograph up to 500 wardrobe items
- AI identifies: item type, color, material, style code
- Wardrobe is searchable ("show me all my white shirts")
- Privacy: wardrobe data is stored encrypted, never used for external targeting

**FR-SA-002: Outfit Builder Integration**
- "Build an outfit with [new product]": AI shows combinations with wardrobe items
- "I need an outfit for [occasion]": AI curates from wardrobe + new buys
- Missing pieces: AI identifies "you need shoes and a bag to complete this — here are options under ₹3,000 total"

**FR-SA-003: Style Evolution**
- AI notes when user's style is evolving (e.g., more minimalist saves recently)
- Gently reflects this: "I've noticed you're saving a lot of quiet luxury pieces lately — should I lean into that aesthetic for recommendations?"

---

## 5.8 Outfit Builder (Fashion)

### Feature Overview

Outfit Builder is a dedicated tool for assembling complete outfits from multiple products across any combination of DupeScout sellers and external platforms.

### Outfit Builder Interface

```
┌─────────────────────────────────────────────────────────┐
│  OUTFIT BUILDER              [Save Outfit]  [Share]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│         ┌──────────────────────┐                       │
│         │     [TOP IMAGE]      │  ← Tap to change      │
│         │  ₹2,499              │                       │
│         └──────────────────────┘                       │
│         ┌──────────────────────┐                       │
│         │   [BOTTOM IMAGE]     │  ← Tap to change      │
│         │  ₹1,800              │                       │
│         └──────────────────────┘                       │
│   ┌─────────┐         ┌─────────┐                      │
│   │[SHOES]  │         │  [BAG]  │                      │
│   │ ₹3,200  │         │ ₹890    │                      │
│   └─────────┘         └─────────┘                      │
│                                                         │
│   TOTAL: ₹8,389        [Add All to Cart]               │
│                                                         │
│   ┌───────────────────────────────────────────────────┐│
│   │ AI: "This is a clean minimal co-ord look. The      ││
│   │  white sneakers work well — consider tan sandals  ││
│   │  if you want a more formal finish. Add a          ││
│   │  structured tote instead of the sling bag for     ││
│   │  office use."                                     ││
│   └───────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────┤
│  SUGGESTED COMPLETE LOOKS                               │
│  [Scroll row of AI-generated outfit alternatives]       │
└─────────────────────────────────────────────────────────┘
```

**FR-OB-001: Outfit Assembly**
- User can add individual products to slots (top, bottom, dress, shoes, bag, accessory, outerwear)
- For each slot: search/browse within the builder, or select from saved products
- AI color harmony check: flags if colors clash, suggests alternatives
- Price total updates in real-time as items are added/changed

**FR-OB-002: AI Suggestions**
- "Complete the look": user fills 2 slots, AI suggests remaining items under a stated budget
- "Alternative outfit": generate 3 outfit variations using different item combinations
- Occasion-specific: "make this work for office" / "make this more casual" / "dress it up for an event"

**FR-OB-003: Outfit Sharing**
- Export as a styled image card (like a fashion flat lay)
- Auto-caption: "Built this look for ₹8,389 on DupeScout" with link
- Shareable to Instagram Stories, WhatsApp
- Creator feature: verified creators can share outfits as "shopping posts" with affiliate tracking

---

## 5.9 Room Lens (Home/Furniture)

### Feature Overview

Room Lens is the home décor equivalent of Outfit Builder — a tool that lets users analyze a room image, identify all products, and find similar products for each identified item.

**Two modes:**
1. **Inspiration Mode:** Upload someone else's room photo → find all products in it
2. **Your Room Mode:** Photo your own room → get AI suggestions for what to add/change

### Room Lens — Functional Requirements

**FR-RL-001: Product Detection**
- AI detects and labels individual products within a room image
- Minimum 3 products detected for "Room Lens" to activate
- Products labeled by category: sofa, coffee table, rug, lamp, plant, art, etc.
- User can tap individual items to see alternatives

**FR-RL-002: Budget Planner**
- After detecting products, show a budget planner with estimated prices at 3 tiers (Smart Value, Mid-Range, Premium)
- User can set a total room budget; AI shows which items to "invest in" and where to save
- Budget planner is exportable/shareable

**FR-RL-003: Your Room Mode**
- User uploads their own room photo
- AI analyzes existing aesthetic, identifies style, suggests what to add/change
- "What would make this room feel more [aesthetic]?" — AI gives specific product recommendations
- AI highlights what's working aesthetically and what's working against the room's potential

**FR-RL-004: Room Planner Save**
- Save room plans with product selections
- Track prices of saved items
- "Complete my room" feature: reminder when user has bought most items to suggest the remaining ones

---

## 5.10 Trend Intelligence Feed

### Feature Overview

The Trend Feed is the "editorial" layer of DupeScout — a discovery surface that surfaces emerging trends before they go mainstream, using AI analysis of social signals.

**This is NOT:**
- A manually curated editorial feed
- A brand advertising platform
- A clone of Instagram's Explore

**This IS:**
- An AI-powered trend detection system
- A signal that tells users where in the trend lifecycle an aesthetic sits
- A discovery surface for emerging aesthetics and the products that represent them

### Trend Feed Design

```
┌─────────────────────────────────────────────────────────┐
│  TRENDING NOW           [Emerging ▼]   [Fashion ▼]     │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐   │
│  │  🔥 EMERGING — "Coastal Cowgirl"                 │   │
│  │  ↑ +342% saves this week                         │   │
│  │  Peak predicted: 3-6 weeks from now              │   │  ← Trend lifecycle
│  │  [3 representative product images]               │   │
│  │  8,400 products available • Starting ₹890        │   │
│  │                                       [Explore]  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  📈 PEAKING — "Quiet Luxury"                     │   │
│  │  ↑ Currently most searched aesthetic             │   │
│  │  Peak predicted: at peak now — may decline soon  │   │
│  │  [3 representative product images]               │   │
│  │  24,000 products • Starting ₹1,200               │   │
│  │                                       [Explore]  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  📉 DECLINING — "Coastal Grandmother"            │   │
│  │  ↓ Saves down 28% this month                    │   │
│  │  Still popular but heading toward mainstream    │   │
│  │  [3 representative product images]               │   │
│  │  Note: Good time to buy on sale as sellers discount│  │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Trend Lifecycle Classification:**
- **Emerging (🔥):** Growing rapidly in niche communities; not yet mainstream
- **Peaking (📈):** At maximum mainstream visibility
- **Mainstream (≈):** Widely adopted; no longer a differentiator
- **Declining (📉):** Post-peak; moving toward passé for early adopters

**FR-TI-001: Trend Detection Signals**
Data sources for trend detection:
- DupeScout internal: save rates, search query trends, collection themes
- Public social signals: hashtag velocity on Instagram/TikTok (API-permitted data)
- Reddit engagement on fashion/home subreddits
- Google Trends India
- Influencer content categorization

**FR-TI-002: Personalized Trend Feed**
- Users can follow specific aesthetics
- Trend feed weighted by followed aesthetics + inferred style profile
- Option to set alert for when a specific aesthetic is "emerging"

---

## 5.11 Price Tracker & Alerts

### Feature Overview

Price Tracker turns DupeScout into a proactive shopping assistant — monitoring prices on saved products and notifying users when the moment to buy is optimal.

**FR-PT-001: Price History Chart**
- Every product on DupeScout marketplace has a price history chart
- Shows last 90 days of price fluctuations
- Shows: current price, 30-day low, 30-day high, average price
- AI annotation: "Price usually drops around festival season" / "This seller discounts heavily in sale weeks"

**FR-PT-002: Price Alert Setup**
- User sets a target price for any saved product
- Notification when price hits or goes below target
- Pre-set alerts: "Notify me if this drops by 15% or more"

**FR-PT-003: External Price Comparison**
- For products that exist on multiple platforms (Amazon, Flipkart, Myntra), show price comparison
- Updated in real-time via platform APIs and affiliate links
- "Best price today: Amazon ₹3,499 | Flipkart ₹3,799 | DupeScout seller ₹2,999"

**FR-PT-004: AI Price Prediction**
- AI predicts: "Based on this seller's history, this product is likely to go on sale in 2-3 weeks. You could save ₹400-600 by waiting."
- Caveat shown: "Prediction confidence: 72% — seller patterns aren't always consistent"

---

## 5.12 Social Sharing & Community

### Feature Overview

DupeScout's viral growth depends on users sharing their "finds" — the moment of discovery delight when they find a 92% similar product for 20% of the price. The sharing feature must make this as frictionless and brag-worthy as possible.

**FR-SS-001: Share a Find**
- From any product: one-tap share generates a visual card showing:
  - Product image
  - "X% similar to [reference product]"
  - Original price vs. found price
  - "Found on DupeScout" attribution
- Share destinations: Instagram Stories, WhatsApp, Twitter/X, copy link
- Share card is visually beautiful — not a generic white card with a product image

**Share Card Design:**
```
┌──────────────────────────────────┐
│  dupescout                       │
│                                  │
│  [Product Image — full bleed]    │
│                                  │
│  ┌────────────────────────────┐  │
│  │  91% similar               │  │
│  │  Zara: ₹7,999              │  │
│  │  This: ₹2,499              │  │  ← Auto-generated
│  │  Saved: ₹5,500  🔥         │  │
│  └────────────────────────────┘  │
│                                  │
│  Shop the Look. Not the Markup.  │
└──────────────────────────────────┘
```

**FR-SS-002: Referral Tracking**
- Every share has a unique referral code embedded in the link
- When a friend purchases through a shared link: sharer gets ₹75 credit; new user gets ₹100 off first purchase
- Referral dashboard: shows how many friends signed up, how many purchased, total credits earned

**FR-SS-003: Community Feed (Phase 2)**
- Public collections shared by users
- "Best Finds This Week" — AI-curated top discoveries
- User-generated "dupe of the week" submissions
- Community voting on best finds
- Comment system (basic: like, reply)

---

## 5.13 Checkout & Payments

### Design Philosophy

Checkout must be the simplest, fastest, most trustworthy moment in the user journey. Any friction here destroys conversion. Any trust violation here destroys the relationship.

**Rules for checkout:**
1. No hidden fees — price shown in search = price paid
2. No dark patterns — no pre-checked add-ons, no fake urgency
3. Guest checkout available — never force account creation to buy
4. Maximum 3 steps from add-to-cart to order confirmed

### Checkout Flow

```
STEP 1: CART REVIEW
┌─────────────────────────────────────────────────────────┐
│  YOUR CART (2 items)                                    │
│                                                         │
│  [Image] Sage Green Co-ord Set — Size M                 │
│  The Label  |  ₹2,499  |  Ships in 2-3 days  [Remove]  │
│                                                         │
│  [Image] Minimal Tote Bag                               │
│  LocalCraft  |  ₹890  |  Ships in 1-2 days   [Remove]  │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│  Subtotal:          ₹3,389                              │
│  Shipping:          ₹49  (Free above ₹999 ✓)           │
│  Discount:          -₹0                                 │
│  ─────────────────────────────────────────────────────  │
│  TOTAL:             ₹3,389  (shipping free)             │
│                                                         │
│  Have a coupon? [Enter code]                            │
│                                            [Continue]   │
└─────────────────────────────────────────────────────────┘

STEP 2: DELIVERY DETAILS
┌─────────────────────────────────────────────────────────┐
│  DELIVER TO                                             │
│                                                         │
│  [Saved: Home — Mumbai, Andheri] ← ── ←   ←  ←       │  ← One tap if saved
│  [Saved: Work — BKC]                                    │
│  [+ Add new address]                                    │
│                                                         │
│  Delivery estimate: 2-3 business days                   │
│                                            [Continue]   │
└─────────────────────────────────────────────────────────┘

STEP 3: PAYMENT
┌─────────────────────────────────────────────────────────┐
│  PAY ₹3,389                                             │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │ ⚡ UPI — Pay instantly                           │    │  ← Default
│  │ GPay / PhonePe / BHIM / UPI ID                  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ───────── or pay another way ─────────                 │
│                                                         │
│  💳 Credit/Debit Card                                   │
│  🏦 Net Banking                                         │
│  📦 Cash on Delivery (available for this seller)        │
│                                                         │
│  🔒 Payments secured by Razorpay                        │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │              PAY ₹3,389                         │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**FR-CK-001: Payment Methods**
- UPI (GPay, PhonePe, BHIM, direct UPI ID) — Primary
- Credit/Debit Cards (all major networks)
- Net Banking (top 20 banks)
- Cash on Delivery (seller opt-in; maximum order value ₹5,000 for COD)
- EMI: 3/6/9-month no-cost EMI for orders above ₹3,000 via HDFC, ICICI, SBI cards
- DupeScout Credits (from referrals, returns)

**FR-CK-002: No Hidden Fees Policy**
- Price shown = price paid (except for shipping — shown clearly at cart)
- Shipping: Free above ₹999. Below: flat ₹49 for most categories.
- GST: included in displayed price, itemized on invoice
- No surprise "service fees" or "platform fees"

**FR-CK-003: Guest Checkout**
- Full checkout without account creation
- Requires only: delivery address + phone number for tracking + payment
- Optional: "Create account to track order and save address"
- Conversion optimization: don't block checkout to force registration

**FR-CK-004: Multi-Seller Orders**
- Orders from multiple sellers are handled transparently
- User sees: "This order has 2 sellers. Each will ship separately. You'll get 2 delivery tracking links."
- Single payment, split payout handled by DupeScout backend

---

## 5.14 Order Management

**FR-OM-001: Order Tracking**
- Real-time tracking from dispatch to delivery
- Carrier integration: Shiprocket, Delhivery, Shadowfax
- Map view showing package location (where available)
- Proactive notifications at key milestones (dispatched, out for delivery, delivered)
- WhatsApp notification option (user opt-in)

**FR-OM-002: Returns & Refunds**
- Initiate return from order details page
- Return reasons: Wrong size, Defective, Not as described, Changed mind, Quality poor
- Photo upload required for defective/not-as-described returns
- Return label generated if seller accepts return
- Refund timeline: 3-5 business days to original payment method; instant to DupeScout Credits

**FR-OM-003: Reviews — Post Purchase**
- Review request sent 7 days after delivery
- Review format: Star rating + text + optional photo upload
- AI prompt: "Tell us how the similarity matched what you expected" — unique DupeScout review angle
- Verified purchase badge on all reviews

---

## 5.15 Profile & Preferences

**Profile Sections:**
1. **Style Profile** — aesthetic preferences, style code, size info
2. **Wardrobe** — uploaded wardrobe items (Style Assistant feature)
3. **Collections** — all saved collections
4. **Orders** — order history
5. **Reviews** — reviews written
6. **Credits & Referrals** — DupeScout credit balance, referral link and history
7. **Notifications** — granular notification controls
8. **Privacy** — data export, delete account, personalization opt-out

**FR-PR-001: Style Profile Setup**
- Done via mood board visual quiz (3-5 minutes)
- Not text-heavy — image-first
- Results: assigned aesthetic codes, color palette, preferred silhouettes
- Revisable: "Refresh my style profile" at any time

**FR-PR-002: Notification Controls**
- Granular: user controls which events trigger notifications
- Categories: Price drops on saved items, New products matching style, Order updates, Promotions, Community activity
- Frequency caps: user can set "max X notifications per day"
- Default: only order updates + >15% price drops on saved items

---

## 5.16 DupeScout Pro

### Overview

DupeScout Pro is a premium subscription (₹99/month or ₹799/year) for power users who want advanced capabilities.

**Pro Features:**

| Feature | Free | Pro |
|---------|------|-----|
| Visual searches per day | 20 | Unlimited |
| Price history chart | 30 days | 1 year |
| Price alerts per user | 5 | Unlimited |
| Saved collections | 5 | Unlimited |
| Wardrobe items | 50 | Unlimited |
| AI chat sessions | 10/month | Unlimited |
| Exclusive seller deals | No | Yes (average 8-15% additional discount) |
| Early access to trending products | No | 48-hour early access |
| Priority customer support | No | Yes (4-hour response SLA) |
| Export wardrobe/collections | No | Yes |
| Advanced comparison (5+ products) | No | Yes |

**Pricing rationale:** ₹99/month is below the price of a single coffee in urban India. The value proposition (access to exclusive deals that more than cover the subscription cost) makes it an easy sell to power users. Annual plan saves 32% and improves retention.

---

# SECTION 6: MOBILE UX

## Platform Strategy

**Primary platform: Android.** 75%+ of India's smartphone market runs Android. First release targets Android 8.0+. iOS follows within 2 months of Android launch.

**Performance requirements:**
- App size: <30MB initial install
- Cold start: <1.5 seconds
- Visual search response: <2 seconds
- Chat response latency: <800ms first token
- Image upload: background, non-blocking

## Navigation Architecture

```
PRIMARY NAVIGATION (Bottom Tab Bar)
────────────────────────────────────────────────
Tab 1: 🏠 Home      — Discovery + personalized feed
Tab 2: 🔍 Search    — Visual search + AI chat entry
Tab 3: 💬 AI        — Dedicated AI shopping copilot
Tab 4: ❤️ Saved     — Collections + wishlist
Tab 5: 👤 Profile   — Orders + settings + style profile
────────────────────────────────────────────────

FLOATING ACTION BUTTON (always visible)
→ Camera / Visual Search — one tap to search by photo
  Positioned bottom-right, distinctive color
```

## Typography & Visual Language

**DO NOT** design DupeScout like a traditional ecommerce app. The visual language should be closer to:
- The clean white space of Apple's product pages
- The editorial grid of Vogue.com
- The conversational interface of WhatsApp

**Typography:**
- Primary typeface: Inter (clean, modern, highly legible)
- Display typeface: Playfair Display (for aesthetic/editorial moments only)
- Body text: 14pt minimum (accessibility)
- Price display: bold, prominent, never buried

**Color System:**
- Primary: Deep Navy (#0D1B2A) — authority, trust
- Accent: Electric Teal (#00B4D8) — AI, discovery moments
- Success: Forest Green (#2D6A4F) — value wins, price savings
- Background: Near-white (#F8F9FA) — clean canvas
- Text: Near-black (#1A1A2E)

**Product Images:**
- Always shown at 1:1 ratio on cards
- Soft shadow, white background
- No watermarks on search results

## Gesture Design

- **Swipe left on product card:** Quick-save to wishlist
- **Swipe right on product card:** Dismiss / not interested (trains algorithm)
- **Long press on product:** Preview with AI summary tooltip
- **Pinch on product image:** Zoom in (detail view)
- **Swipe up from home:** Quick visual search

## Offline Mode

- Saved collections accessible offline
- Wishlist accessible offline
- Orders page accessible offline (last known state)
- Search: not available offline; clear message "Connect to search"

## Accessibility

- Full screen reader support (TalkBack/VoiceOver)
- Minimum contrast ratio 4.5:1 for all text
- Tap targets minimum 44×44pt
- All images have AI-generated alt text
- Font size respects system accessibility settings

---

# SECTION 7: WEB UX

## Platform Philosophy

The web experience is NOT just a desktop-expanded version of the mobile app. The web serves different use cases:
- Deep research mode (large screen, multiple tabs, price comparison)
- Seller discovery (smaller businesses often research on desktop)
- Room planning (Room Lens on a large screen is significantly more usable)
- Power users doing bulk collection curation

## Web Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                         │
│  Logo    [Search bar — wide, prominent]    [Sign in]  [Cart]   │
├─────────────────────────────────────────────────────────────────┤
│         │                                     │                  │
│  LEFT   │         MAIN CONTENT                │  RIGHT PANEL    │
│  PANEL  │                                     │                  │
│         │                                     │                  │
│  Filter │  [Visual upload zone — drag & drop]  │  AI Chat Panel  │
│  Panel  │                                     │  (slide-out)    │
│         │  [Results grid — 3-4 column]        │                  │
│  Price  │                                     │                  │
│  Range  │  [Product cards with AI scores]     │                  │
│         │                                     │                  │
│  Seller │  [Load more / Infinite scroll]      │                  │
│  Type   │                                     │                  │
│         │                                     │                  │
│  Style  │                                     │                  │
│  Code   │                                     │                  │
└─────────────────────────────────────────────────────────────────┘
```

**Web-specific features:**
- Drag-and-drop image upload to search
- Side-by-side comparison panel (up to 4 products simultaneously)
- Room Lens with larger canvas (works much better on desktop)
- Keyboard shortcuts: `/` for search, `s` to save product, `c` for camera
- Browser extension: Chrome/Firefox extension for "Find on DupeScout" from any webpage

---

# SECTION 8: USER FLOWS (DETAILED)

## Flow 1: First-Time User Flow

```
INSTALL APP
    ↓
ONBOARDING (3 screens, skippable)
  Screen 1: "Search with a photo" — animated demo
  Screen 2: "AI explains the difference" — demo of price comparison
  Screen 3: "Save and track prices" — demo of collections
    ↓
SIGN UP / SKIP
  → With phone number (OTP) [fastest, recommended]
  → With Google
  → Skip (guest mode — can buy, can't save)
    ↓
STYLE QUIZ (optional, skippable)
  "Help us show you things you'll love"
  → 3 mood board images to pick from
  → Budget range slider
  → Primary interest: Fashion / Home / Both
    ↓
HOME SCREEN
  → Personalized if style quiz completed
  → Trending if skipped
    ↓
[USER BEGINS DISCOVERY]
```

## Flow 2: Visual Search Flow (Critical Path)

```
HOME SCREEN
    ↓
TAP CAMERA BUTTON (FAB)
    ↓
CAMERA / UPLOAD CHOICE
  → Camera: open camera with product detection overlay
  → Upload: open gallery picker
  → Link: open URL input
    ↓
IMAGE/LINK SUBMITTED
    ↓
LOADING STATE (< 2 seconds)
  "AI is analyzing your photo..."
  [Animated: product attributes extracting]
    ↓
RESULTS PAGE
    ↓
  ┌─ IF NO RESULTS FOUND:
  │   "We couldn't find an exact match. Here are the closest products."
  │   + "Try a clearer photo?" suggestion
  │
  └─ IF RESULTS FOUND:
      → 3-tier results display
      → AI explanation cards on top 3
      → Filter/sort controls
    ↓
USER TAPS PRODUCT
    ↓
PRODUCT DETAIL PAGE
    ↓
  ┌─ IF COMPARING:
  │   → Add to comparison list
  │   → Comparison modal opens with 2-4 products
  │
  └─ IF BUYING:
      → Add to cart → Checkout flow
      OR
      → Save to collection
```

## Flow 3: New User Referral Flow

```
EXISTING USER shares a product
    ↓
FRIEND receives shared link
    ↓
FRIEND opens link
  → If no app: landing page with "Download DupeScout" CTA
    + product shown with similarity score
    + "Your friend saved ₹X finding this"
  → If app installed: deep link opens product directly
    ↓
FRIEND sees product
    ↓
FRIEND signs up to save/buy
  → ₹100 discount applied to first order automatically
  → Referrer gets ₹75 credit
    ↓
CONVERSION
```

---

# SECTION 9: EDGE CASES & ERROR STATES

## Visual Search Edge Cases

| Edge Case | Handling |
|-----------|---------|
| Image shows no identifiable product | "This doesn't look like a product photo. Try uploading a clear photo of a single product." |
| Image shows luxury counterfeit | AI detects fake branding → show warning + remove from results |
| Image contains multiple products | Show product detection overlay; user selects which item to search |
| Very low quality / blurry image | "Try a clearer photo for better results. Here are the closest matches we found." |
| Screenshot of screenshot (degraded quality) | Process anyway with confidence score warning |
| Product not in any category DupeScout covers | "We don't cover [category] yet. Try: [categories we do cover]" |
| No products in stock matching search | Show out-of-stock options with alert option; suggest similar in-stock alternatives |
| URL from unsupported platform | "We don't support [platform] links yet. Try uploading a screenshot." |

## Payment Edge Cases

| Edge Case | Handling |
|-----------|---------|
| UPI payment timeout | "Your payment didn't complete. Your cart is saved. Try again." (No charge applied) |
| Duplicate order (double-tap) | Idempotency key prevents duplicate; one order created |
| Cart item goes out of stock before checkout | "Sorry, [item] sold out while you were shopping. We've removed it from your cart. Here are similar options." |
| Seller doesn't ship to user's PIN code | Show at cart stage, not checkout: "This seller doesn't ship to [pin code]. [Show alternatives]" |
| COD order over limit | "COD is available for orders up to ₹5,000. Try UPI or card." |

## Account Edge Cases

| Edge Case | Handling |
|-----------|---------|
| Phone number already registered | "This number has an account. Sign in?" with OTP option |
| OTP not received | Show "Resend after 60 seconds" + option to try WhatsApp OTP |
| User tries to buy without account | Allow guest checkout; show "Save ₹100 on your next order — create a free account" post-purchase |
| User deletes account mid-active-order | Order is preserved; confirmation email sent to last known address |

---

# SECTION 10: PERFORMANCE REQUIREMENTS

| Metric | Target | Rationale |
|--------|--------|-----------|
| Visual search end-to-end | <2s | Attention drops dramatically after 2s |
| App cold start | <1.5s | Industry benchmark for premium apps |
| Product page load | <1s | SEO and conversion |
| Chat first token | <800ms | Conversational feel requires near-instant response |
| Image upload | Background, non-blocking | User should not wait for upload before seeing results |
| API error rate | <0.1% | Reliability = trust |
| App crash rate | <0.01% | Quality baseline |
| Uptime (platform) | 99.95% | 4.4 hours downtime max per year |

**Mobile data optimization (critical for India):**
- Image compression: all product images served at <150KB for mobile connections
- Lazy loading: images below fold not loaded until user scrolls toward them
- Offline caching: saved collections + recent searches cached locally
- 2G compatibility: core search functionality works on slow 2G connections (India Tier 2/3 reality)

---

*End of Volume 2.*

**Next: Volume 3 — Vendor Management System PRD**

---

*DupeScout Founder Blueprint — Volume 2 of 6*  
*Confidential. Not for distribution.*
