# Chrome Web Store Metadata & Publishing Guide — DupeScout

> **Single Source of Truth** for Chrome Web Store listing metadata, permissions justifications, privacy disclosures, and store review compliance for the **DupeScout** Chrome Extension.

**Last Updated:** August 11, 2026  
**Extension Version:** `1.0.0`  
**Target Category:** Shopping / Shopping Utilities  

---

## 1. Store Listing Copy

### Title
**DupeScout — Shop the Look. Not the Markup.**

### Short Description (max 132 chars)
Find visually similar products & cheaper dupes across India and the web while browsing any online store.

### Detailed Description (Chrome Web Store)
DupeScout is your AI visual shopping assistant. Find exact dupes, smart-value alternatives, and lower-priced variants of high-street fashion, footwear, and lifestyle items directly while browsing.

**✨ Key Features:**
- **Instant Visual Dupe Search:** Right-click any image or product on any webpage to search DupeScout's AI similarity engine.
- **On-Page Image Overlay:** Hover over product images on fashion and e-commerce websites to instantly reveal matching dupes.
- **Honest Match Scores:** Get transparent percentage match breakdowns across Shape, Color, Material, and Style.
- **Price Savings Calculator:** Instantly compare original prices with dupe alternatives to save up to 80%.
- **Side Panel Visual Comparison:** Compare products side-by-side without leaving your active shopping tab.
- **No Paid Ad Bias:** Organic results are strictly ranked by AI similarity score and genuine value—never by ad placement.

---

## 2. Permissions Justifications (Review Compliance)

Every permission declared in `manifest.json` requires a specific, plain-English justification for the Chrome Developer Review team:

| Permission | Justification |
|---|---|
| `activeTab` | Required to extract the current product image or page URL when the user explicitly clicks the extension action or context menu. |
| `scripting` | Required to inject the hover badge UI onto product images on e-commerce sites when requested by the user. |
| `storage` | Required to store recent visual search history and user preferences locally on the user's device (`chrome.storage.local`). |
| `contextMenus` | Required to add "Find Dupes on DupeScout" context menu item when right-clicking images or selected text. |
| `sidePanel` | Required to render side-by-side visual comparison and breakdown metrics in Chrome's side panel UI. |
| `notifications` | Required to notify the user when a visual dupe search finishes and high-saving dupes are found. |
| `tabs` | Required to access the active tab's URL and title when launching a visual search from the context menu or popup. |

### Host Permissions Justification
- `http://localhost:8000/*` — Required to communicate with the local DupeScout FastAPI backend server.
- `https://*/*` — Required to inspect product images on e-commerce websites specified by the user.

---

## 3. Privacy & Data Use Disclosures

- **Data Collected:** Product image URLs and search queries submitted explicitly by the user for visual matching.
- **Data Not Collected:** Personal identity, browsing history outside of shopping queries, keystrokes, financial details.
- **Data Transmission:** Search queries are processed securely via the DupeScout API. No user data is sold or shared with third parties.

---

## 4. Pre-Submission Review Checklist

- [x] `manifest_version: 3` enforced with no legacy V2 APIs.
- [x] Ephemeral service worker using `chrome.storage.local` (no global state persistence).
- [x] Clean context menu implementation with instant user feedback notification.
- [x] Side panel opens safely on user action trigger.
- [x] Offline fallback simulation enabled for zero-friction demo and review testing.
- [x] Single source of truth `CHROMEWEBSTORE.md` created.
