"""Consumer authentication — email / password flow.

POST /api/v1/auth/register — create new consumer account → return JWT + profile
POST /api/v1/auth/login    — verify email + password → return JWT + profile
GET  /api/v1/auth/me       — get current user profile (requires token)
"""
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from api.lib.auth import TokenPayload, create_token, require_consumer
from api.lib.database import get_db, AsyncSession
from api.lib.response import ApiResponse, ok

router = APIRouter(prefix="/auth", tags=["auth"])

# ── In-memory user store ──────────────────────────────────────────────────────
# In production: users table in PostgreSQL with bcrypt-hashed passwords.
# Key: email (lowercase). Value: user record dict.
_USERS: dict[str, dict] = {
    "agarwal.harshit97@gmail.com": {
        "password":  "harshit@14597",
        "id":        "u_harshit_agarwal",
        "name":      "Harshit Agarwal",
        "email":     "agarwal.harshit97@gmail.com",
        "phone":     "",
        "is_pro":    True,
        "city":      "Bengaluru",
    },
}


# ── Request / response models ─────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name:     str
    email:    EmailStr
    password: str

    def validate_fields(self) -> str | None:
        if len(self.name.strip()) < 2:
            return "Name must be at least 2 characters"
        if len(self.password) < 8:
            return "Password must be at least 8 characters"
        return None


class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/register", response_model=ApiResponse, status_code=201)
async def register(request: RegisterRequest):
    """Create a new consumer account. Returns JWT on success."""
    if err := request.validate_fields():
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=err)

    email = request.email.lower()
    if email in _USERS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    import random, string
    user_id = "u_" + "".join(random.choices(string.ascii_lowercase + string.digits, k=9))
    _USERS[email] = {
        "password": request.password,
        "id":       user_id,
        "name":     request.name.strip(),
        "email":    email,
        "phone":    "",
        "is_pro":   False,
        "city":     "",
    }

    token = create_token(subject=user_id, realm="consumer", is_pro=False)
    return ok({
        "token":       token,
        "is_new_user": True,
        "user": {
            "id":    user_id,
            "name":  request.name.strip(),
            "email": email,
            "phone": "",
            "is_pro": False,
        },
    })


@router.post("/login", response_model=ApiResponse)
async def login(request: LoginRequest):
    """Verify email + password. On success: return JWT + profile."""
    user_record = _USERS.get(request.email.lower())

    if not user_record or user_record["password"] != request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = create_token(
        subject=user_record["id"],
        realm="consumer",
        is_pro=user_record.get("is_pro", False),
    )

    return ok({
        "token":       token,
        "is_new_user": False,
        "user": {
            "id":    user_record["id"],
            "name":  user_record["name"],
            "email": user_record["email"],
            "phone": user_record.get("phone", ""),
            "is_pro": user_record.get("is_pro", False),
            "city":  user_record.get("city", ""),
        },
    })


@router.get("/me", response_model=ApiResponse)
async def get_me(
    user: Annotated[TokenPayload, Depends(require_consumer)],
    db:   Annotated[AsyncSession, Depends(get_db)],
):
    """Return the authenticated consumer's profile."""
    record = next(
        (v for v in _USERS.values() if v["id"] == user.sub),
        None,
    )
    if record:
        return ok({
            "id":    record["id"],
            "name":  record["name"],
            "email": record["email"],
            "phone": record.get("phone", ""),
            "is_pro": user.is_pro,
            "realm":  user.realm,
            "city":   record.get("city", ""),
        })
    return ok({"id": user.sub, "is_pro": user.is_pro, "realm": user.realm})
