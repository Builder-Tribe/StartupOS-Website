"""JWT authentication — consumer, seller, and admin realms."""
import os
from datetime import datetime, timedelta, timezone
from typing import Literal, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from pydantic import BaseModel

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret-change-in-production")
ALGORITHM  = os.getenv("JWT_ALGORITHM", "HS256")

Realm = Literal["consumer", "seller", "admin"]

security = HTTPBearer()


class TokenPayload(BaseModel):
    sub: str           # user / seller / admin id
    realm: Realm
    exp: datetime
    is_pro: bool = False


def create_token(subject: str, realm: Realm, is_pro: bool = False, expires_hours: int = 4) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=expires_hours)
    payload = {
        "sub": subject,
        "realm": realm,
        "exp": expire,
        "is_pro": is_pro,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> TokenPayload:
    try:
        raw = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return TokenPayload(**raw)
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def _require_realm(required: Realm):
    def _inner(creds: HTTPAuthorizationCredentials = Depends(security)) -> TokenPayload:
        payload = decode_token(creds.credentials)
        if payload.realm != required:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Wrong token realm")
        return payload
    return _inner


# FastAPI dependency injectors
require_consumer = _require_realm("consumer")
require_seller   = _require_realm("seller")
require_admin    = _require_realm("admin")


def require_consumer_opt(
    creds: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
) -> Optional[TokenPayload]:
    """Consumer auth that is optional — returns None for anonymous requests."""
    if creds is None:
        return None
    payload = decode_token(creds.credentials)
    return payload if payload.realm == "consumer" else None
