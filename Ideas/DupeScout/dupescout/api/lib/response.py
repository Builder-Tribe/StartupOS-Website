"""Standard JSON envelope for all API responses."""
from typing import Any, Optional
from pydantic import BaseModel


class ApiError(BaseModel):
    code: str
    message: str
    details: Optional[dict[str, Any]] = None


class ApiMeta(BaseModel):
    page: Optional[int] = None
    per_page: Optional[int] = None
    total: Optional[int] = None
    took_ms: Optional[int] = None


class ApiResponse(BaseModel):
    success: bool
    data: Optional[Any] = None
    error: Optional[ApiError] = None
    meta: Optional[ApiMeta] = None


def ok(data: Any, meta: Optional[ApiMeta] = None) -> ApiResponse:
    return ApiResponse(success=True, data=data, meta=meta)


def err(code: str, message: str, details: Optional[dict] = None) -> ApiResponse:
    return ApiResponse(success=False, error=ApiError(code=code, message=message, details=details))
