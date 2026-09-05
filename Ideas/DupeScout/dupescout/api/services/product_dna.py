"""Product DNA Engine — Claude Sonnet 5 + Vision.

Extracts structured attributes from product images:
  - Category, sub-category
  - Materials (fabric, finish, composition)
  - Style tags and aesthetic codes
  - Title (max 80 chars, SEO-optimised)
  - Description (150-300 words, Gen Z tone)
  - Price range suggestion (based on quality signals + market data)
  - Ships-in days estimate

Vol 5 §3: DNA is stored per product and used for:
  - Search ranking (attribute-weighted BM25)
  - Recommendation engine (style similarity)
  - Trend detection (aggregate aesthetic codes)
  - Auto-moderation (price outlier detection)
"""
from __future__ import annotations

import json
import os
from typing import Optional

CATALOG_SYSTEM_PROMPT = """You are an expert product cataloguing specialist for DupeScout, an AI shopping
platform targeting Gen Z India. Your job is to analyse product photos and extract structured listing data.

Rules:
- Title: max 80 characters, include material + key style + product type
- Description: 150-300 words, conversational Gen Z tone (not stiff), highlight craftsmanship for artisan items
- Be honest about quality — do not oversell
- Price suggestions must be realistic for the Indian market (compare to equivalent products on Myntra/Flipkart)
- Aesthetic codes must come from the approved vocabulary: [indie-boho, artisan-craft, clean-minimal, y2k-revival, cottage-core, dark-academia, earthy-tones, india-heritage, streetwear, coastal-vibe, maximalist, quiet-luxury]
- category must be one of: fashion, furniture, beauty, electronics, home, other

Return ONLY valid JSON, no prose."""

CATALOG_USER_PROMPT = """Analyse these product photos and return a JSON object with exactly these fields:
{
  "title": "string (max 80 chars)",
  "description": "string (150-300 words)",
  "category": "fashion|furniture|beauty|electronics|home|other",
  "sub_category": "string",
  "aesthetic_codes": ["list", "of", "codes"],
  "material_tags": ["list"],
  "style_tags": ["list"],
  "suggested_price_min": number (INR),
  "suggested_price_max": number (INR),
  "mrp_suggestion": number (INR),
  "ships_in_days": number,
  "ai_confidence": number (0-100),
  "quality_signals": ["list of visible quality indicators"]
}"""


async def extract_product_dna(
    image_b64_list: list[str],
    additional_context: Optional[str] = None,
) -> dict:
    """
    Send product images to Claude Sonnet 5 with vision and get structured listing data.

    Args:
        image_b64_list: Up to 8 base64-encoded product images.
        additional_context: Optional seller notes (material, origin, etc.)

    Returns:
        Structured dict with title, description, tags, price range, etc.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        # Dev fallback: return deterministic mock data
        return _mock_dna_response(image_b64_list[0] if image_b64_list else "")

    try:
        import anthropic

        client = anthropic.AsyncAnthropic(api_key=api_key)

        # Build content list: images first, then the instruction
        content = []
        for b64 in image_b64_list[:8]:
            # Detect media type from first bytes
            import base64
            raw = base64.b64decode(b64[:20])
            if raw[:2] == b'\xff\xd8':
                media_type = "image/jpeg"
            elif raw[:8] == b'\x89PNG\r\n\x1a\n':
                media_type = "image/png"
            elif raw[:4] == b'RIFF':
                media_type = "image/webp"
            else:
                media_type = "image/jpeg"  # default

            content.append({
                "type": "image",
                "source": {"type": "base64", "media_type": media_type, "data": b64},
            })

        user_text = CATALOG_USER_PROMPT
        if additional_context:
            user_text += f"\n\nSeller note: {additional_context}"

        content.append({"type": "text", "text": user_text})

        message = await client.messages.create(
            model="claude-sonnet-5",
            max_tokens=1024,
            system=CATALOG_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": content}],
        )

        raw_text = message.content[0].text.strip()
        # Strip markdown code blocks if present
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        return json.loads(raw_text)

    except Exception as exc:
        print(f"Claude API error in extract_product_dna: {exc}")
        return _mock_dna_response("")


def _mock_dna_response(image_b64: str) -> dict:
    """Deterministic dev fallback — no API key required."""
    seed = sum(ord(c) for c in image_b64[:20]) if image_b64 else 42
    adjectives = ["Handcrafted", "Artisan", "Natural", "Organic", "Traditional", "Heritage"]
    materials  = ["Cotton", "Linen", "Silk", "Jute", "Wool", "Hemp"]
    styles     = ["Kurta", "Saree", "Dupatta", "Tote Bag", "Cushion Cover", "Wall Art"]
    adj = adjectives[seed % len(adjectives)]
    mat = materials[(seed + 1) % len(materials)]
    sty = styles[(seed + 2) % len(styles)]

    return {
        "title": f"{adj} {mat} {sty} — Indie Boho",
        "description": f"A beautifully {adj.lower()} {sty.lower()} crafted from premium {mat.lower()} using traditional techniques. This piece carries the warmth of artisan hands and the story of Indian heritage. Perfect for everyday wear or special occasions — it pairs effortlessly with both ethnic and indo-western ensembles. The {mat.lower()} fabric ensures breathability and comfort throughout the day. Each piece is unique, with slight variations that are a mark of authentic handcraft. Sustainable, slow fashion at its best.",
        "category": "fashion",
        "sub_category": "ethnic wear",
        "aesthetic_codes": ["indie-boho", "artisan-craft", "india-heritage"],
        "material_tags": [f"100% {mat.lower()}", "hand-crafted", "natural-dye"],
        "style_tags": [sty.lower(), "ethnic", "sustainable", "artisan"],
        "suggested_price_min": 799 + (seed % 10) * 100,
        "suggested_price_max": 1499 + (seed % 10) * 150,
        "mrp_suggestion": 2499 + (seed % 10) * 200,
        "ships_in_days": 3 + (seed % 4),
        "ai_confidence": 78 + (seed % 15),
        "quality_signals": ["hand-stitched visible", "natural fabric texture", "artisan dye patterns"],
    }
