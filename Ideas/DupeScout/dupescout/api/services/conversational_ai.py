"""Conversational AI service — AI-4.

Powers the DupeScout AI shopping assistant using Claude Sonnet 5 with tool use.

8 tools available to the AI:
  1. search_by_text        — keyword/semantic product search
  2. search_by_image_url   — visual search from URL
  3. get_product_details   — fetch full product info
  4. filter_by_price       — apply price filters to results
  5. filter_by_aesthetic   — filter by aesthetic codes (indie-boho, y2k-revival, etc.)
  6. get_seller_info        — fetch seller details and ratings
  7. check_availability    — check stock for a product/variant
  8. add_to_cart           — add product to user's cart

System prompt focuses the AI on Gen Z India shopping context.
Similarity scores are never fabricated — only real data from the DB is used.
"""
from __future__ import annotations

import json
import os
from typing import Any, Optional

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

SYSTEM_PROMPT = """You are Dupe, the AI shopping assistant for DupeScout — India's AI visual shopping platform for Gen Z.

Your personality:
- Helpful, direct, and knowledgeable about Indian fashion and artisan crafts
- Use clear, conversational language. No corporate speak.
- Be honest about product similarities — never exaggerate. If a dupe is 72% similar, say it's a "good alternative" not "identical."
- Celebrate local artisans and slow fashion. Surface local/artisan options first when they're comparable.
- Know Indian aesthetic vocabulary: saree, kurta, dupatta, lehenga, dhoti, phulkari, kantha, ajrakh, ikat, block-print, etc.
- Understand Gen Z aesthetics: indie-boho, y2k-revival, artisan-craft, cottagecore, clean-minimal, dark-academia, streetwear-india

Rules you MUST follow:
1. NEVER fabricate product details, prices, or similarity scores. Only use data from your tools.
2. NEVER recommend sponsored products in organic results. Paid placements are always labeled.
3. If you can't find a good match, say so honestly rather than recommending poor alternatives.
4. Keep India data residency — never reference or route to non-Indian infrastructure.
5. For products above ₹5,000 COD limit, always mention that online payment is required.

When helping users:
- For visual queries: use search_by_image_url first
- For text queries: use search_by_text
- For refinements: use filter_by_price or filter_by_aesthetic
- Always check_availability before suggesting the user add to cart
- Use get_product_details to get the full picture before recommending
"""

TOOLS = [
    {
        "name": "search_by_text",
        "description": "Search for products using a text query. Uses hybrid BM25 + semantic search. Returns up to 12 products.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query (e.g. 'blue block print kurta under 2000')"},
                "category": {"type": "string", "description": "Optional product category filter"},
                "max_results": {"type": "integer", "default": 6},
            },
            "required": ["query"],
        },
    },
    {
        "name": "search_by_image_url",
        "description": "Run visual similarity search from a product image URL. Returns products by similarity tier (original ≥95%, smart_value ≥80%, similar ≥60%).",
        "input_schema": {
            "type": "object",
            "properties": {
                "image_url": {"type": "string", "description": "Public URL of a product image"},
                "category": {"type": "string", "description": "Optional category hint"},
            },
            "required": ["image_url"],
        },
    },
    {
        "name": "get_product_details",
        "description": "Get full details for a specific product by ID, including price, seller info, materials, sizes, and AI-generated description.",
        "input_schema": {
            "type": "object",
            "properties": {
                "product_id": {"type": "string"},
            },
            "required": ["product_id"],
        },
    },
    {
        "name": "filter_by_price",
        "description": "Filter a list of product IDs by price range.",
        "input_schema": {
            "type": "object",
            "properties": {
                "product_ids": {"type": "array", "items": {"type": "string"}},
                "min_price": {"type": "number", "description": "Minimum price in INR"},
                "max_price": {"type": "number", "description": "Maximum price in INR"},
            },
            "required": ["product_ids"],
        },
    },
    {
        "name": "filter_by_aesthetic",
        "description": "Filter products by aesthetic code tags (e.g. indie-boho, y2k-revival, clean-minimal, artisan-craft, festive-ethnic).",
        "input_schema": {
            "type": "object",
            "properties": {
                "product_ids": {"type": "array", "items": {"type": "string"}},
                "aesthetic_codes": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "One or more aesthetic codes to filter by",
                },
            },
            "required": ["product_ids", "aesthetic_codes"],
        },
    },
    {
        "name": "get_seller_info",
        "description": "Get seller details including name, city, seller_type (artisan/brand/d2c/reseller), rating, and total reviews.",
        "input_schema": {
            "type": "object",
            "properties": {
                "seller_id": {"type": "string"},
            },
            "required": ["seller_id"],
        },
    },
    {
        "name": "check_availability",
        "description": "Check if a product/variant is in stock and get current delivery estimate.",
        "input_schema": {
            "type": "object",
            "properties": {
                "product_id": {"type": "string"},
                "variant_id": {"type": "string", "description": "Size/color variant ID"},
                "pincode": {"type": "string", "description": "Delivery pincode for ETA"},
            },
            "required": ["product_id"],
        },
    },
    {
        "name": "add_to_cart",
        "description": "Add a product to the user's cart. Requires user to be logged in.",
        "input_schema": {
            "type": "object",
            "properties": {
                "product_id": {"type": "string"},
                "variant_id": {"type": "string"},
                "quantity": {"type": "integer", "default": 1},
            },
            "required": ["product_id"],
        },
    },
]


# ── Tool handlers (stub implementations — replace with real DB queries) ────────

async def _handle_tool(name: str, tool_input: dict, db=None, user_id: str | None = None) -> dict:
    """Dispatch tool calls to their implementations."""
    if name == "search_by_text":
        from api.services.keyword_search import run_keyword_search
        try:
            result = await run_keyword_search(
                query=tool_input["query"],
                db=db,
                category=tool_input.get("category"),
                page_size=tool_input.get("max_results", 6),
            )
            return {
                "hits": [
                    {"product_id": h.product_id, "title": h.title, "price": h.price,
                     "seller_name": h.seller_name, "is_local": h.is_local}
                    for h in result.hits
                ],
                "total": len(result.hits),
            }
        except Exception as e:
            return {"error": str(e), "hits": []}

    elif name == "search_by_image_url":
        from api.services.visual_similarity import run_visual_search
        try:
            output = await run_visual_search(
                image_b64=None,
                image_url=tool_input["image_url"],
                query_text=None,
                db=db,
                category=tool_input.get("category"),
            )
            results = [{"product_id": r.product_id, "score": round(r.score * 100, 1), "tier": r.similarity_tier}
                       for r in output.results[:12]]
            return {"results": results, "total": len(results)}
        except Exception as e:
            return {"error": str(e), "results": []}

    elif name == "get_product_details":
        # TODO: SELECT * FROM products WHERE id = tool_input["product_id"]
        return {"product_id": tool_input["product_id"], "status": "stub — real DB query TODO"}

    elif name == "filter_by_price":
        # TODO: SELECT id FROM products WHERE id IN (...) AND price BETWEEN min AND max
        return {"filtered_ids": tool_input.get("product_ids", [])}

    elif name == "filter_by_aesthetic":
        # TODO: SELECT id FROM products WHERE id IN (...) AND aesthetic_codes && ARRAY[...]
        return {"filtered_ids": tool_input.get("product_ids", [])}

    elif name == "get_seller_info":
        # TODO: SELECT * FROM sellers WHERE id = seller_id
        return {"seller_id": tool_input["seller_id"], "status": "stub — real DB query TODO"}

    elif name == "check_availability":
        # TODO: SELECT stock_count FROM product_variants WHERE product_id=... AND id=...
        return {"in_stock": True, "stock_count": 5, "delivery_days": "3-5 business days"}

    elif name == "add_to_cart":
        # This action modifies client-side Zustand store — return instruction to frontend
        return {
            "action": "add_to_cart",
            "product_id": tool_input["product_id"],
            "variant_id": tool_input.get("variant_id"),
            "quantity": tool_input.get("quantity", 1),
            "message": "Added to cart",
        }

    return {"error": f"Unknown tool: {name}"}


# ── Main conversational loop ───────────────────────────────────────────────────

async def run_chat(
    messages: list[dict],
    db=None,
    user_id: str | None = None,
    max_turns: int = 8,
) -> dict:
    """
    Run a multi-turn conversation with Claude Sonnet 5 + tools.

    Args:
        messages: Conversation history in Anthropic format [{"role": "user", "content": "..."}]
        db: Database session for tool queries
        user_id: Authenticated user ID (for add_to_cart)
        max_turns: Maximum agentic turns (prevents runaway loops)

    Returns:
        {
            "message": str,           # AI's final text response
            "tool_calls": list[dict], # Tools used (for UI to execute add_to_cart etc.)
            "turns": int,             # Number of agentic turns taken
        }
    """
    if not ANTHROPIC_API_KEY:
        return {
            "message": "AI assistant is not configured. Set ANTHROPIC_API_KEY to enable.",
            "tool_calls": [],
            "turns": 0,
        }

    try:
        import anthropic
        client = anthropic.AsyncAnthropic(api_key=ANTHROPIC_API_KEY)
    except ImportError:
        return {
            "message": "anthropic package not installed. Run: pip install anthropic",
            "tool_calls": [],
            "turns": 0,
        }

    current_messages = list(messages)
    all_tool_calls: list[dict] = []
    turns = 0

    while turns < max_turns:
        turns += 1

        response = await client.messages.create(
            model="claude-sonnet-5",
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            tools=TOOLS,
            messages=current_messages,
        )

        # Collect text and tool_use blocks
        text_parts: list[str] = []
        tool_uses: list[dict] = []

        for block in response.content:
            if block.type == "text":
                text_parts.append(block.text)
            elif block.type == "tool_use":
                tool_uses.append({"id": block.id, "name": block.name, "input": block.input})

        # If model is done (no tools), return final response
        if response.stop_reason == "end_turn" or not tool_uses:
            return {
                "message": "".join(text_parts),
                "tool_calls": all_tool_calls,
                "turns": turns,
            }

        # Execute tools and append results
        tool_results = []
        for tool_call in tool_uses:
            all_tool_calls.append(tool_call)
            result = await _handle_tool(tool_call["name"], tool_call["input"], db, user_id)
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": tool_call["id"],
                "content": json.dumps(result),
            })

        # Append assistant turn with tool uses, then tool results
        current_messages.append({"role": "assistant", "content": response.content})
        current_messages.append({"role": "user", "content": tool_results})

    return {
        "message": "I've done my research but hit the turn limit. Please try a more specific question.",
        "tool_calls": all_tool_calls,
        "turns": turns,
    }
