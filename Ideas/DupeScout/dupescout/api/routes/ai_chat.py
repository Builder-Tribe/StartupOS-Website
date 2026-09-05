"""Conversational AI chat endpoint — AI-4.

POST /api/v1/ai/chat
"""
from typing import Annotated, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from api.lib.auth import TokenPayload, require_consumer_opt
from api.lib.database import get_db
from api.lib.response import ApiResponse, ok, err
from api.services.conversational_ai import run_chat

router = APIRouter(prefix="/ai", tags=["ai"])


class ChatMessage(BaseModel):
    role: str   # "user" | "assistant"
    content: str

    @field_validator("role")
    @classmethod
    def valid_role(cls, v: str) -> str:
        if v not in ("user", "assistant"):
            raise ValueError("role must be 'user' or 'assistant'")
        return v


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    context: Optional[dict] = None  # optional page context (product_id, search_id, etc.)

    @field_validator("messages")
    @classmethod
    def min_one_message(cls, v: list) -> list:
        if not v:
            raise ValueError("messages must not be empty")
        if len(v) > 40:
            raise ValueError("messages list too long (max 40 turns)")
        return v


@router.post("/chat", response_model=ApiResponse)
async def ai_chat(
    request: ChatRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: Annotated[Optional[TokenPayload], Depends(require_consumer_opt)] = None,
):
    """
    Conversational AI shopping assistant.
    Uses Claude Sonnet 5 with 8 shopping tools (search, filter, cart, etc.)

    Rate limit: 20 messages/day for anonymous, unlimited for Pro.
    Context window: 40 turns max per session.
    """
    # Format messages for Anthropic API
    anthropic_messages = [
        {"role": msg.role, "content": msg.content}
        for msg in request.messages
    ]

    result = await run_chat(
        messages=anthropic_messages,
        db=db,
        user_id=user.sub if user else None,
    )

    return ok({
        "message":    result["message"],
        "tool_calls": result["tool_calls"],
        "turns":      result["turns"],
    })
