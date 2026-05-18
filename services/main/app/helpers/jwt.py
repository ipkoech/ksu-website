"""JWT token helpers for auth flows."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import uuid4

import jwt

from ..core.config import get_settings

settings = get_settings()


def create_access_token(user_id: str, roles: list[str]) -> tuple[str, str]:
    """Create access token and return (token, jti)."""
    now = datetime.now(timezone.utc)
    jti = str(uuid4())
    payload = {
        "sub": user_id,
        "roles": roles,
        "jti": jti,
        "type": "access",
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(minutes=settings.JWT_ACCESS_TTL_MINUTES),
    }
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token, jti


def create_refresh_token(user_id: str, jti: str) -> str:
    """Create refresh token linked to an access-token jti."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "jti": jti,
        "type": "refresh",
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(days=settings.JWT_REFRESH_TTL_DAYS),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_token(user_id: str, roles: list[str]) -> tuple[str, str, str]:
    """Create access + refresh tokens and return (access, refresh, jti)."""
    access_token, jti = create_access_token(user_id, roles)
    refresh_token = create_refresh_token(user_id, jti)
    return access_token, refresh_token, jti


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])


def refresh_token(user_id: str, roles: list[str], jti: str) -> tuple[str, str]:
    """Issue a fresh access/refresh pair reusing the session jti."""
    now = datetime.now(timezone.utc)
    access_payload = {
        "sub": user_id,
        "roles": roles,
        "jti": jti,
        "type": "access",
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(minutes=settings.JWT_ACCESS_TTL_MINUTES),
    }
    refresh_payload = {
        "sub": user_id,
        "jti": jti,
        "type": "refresh",
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(days=settings.JWT_REFRESH_TTL_DAYS),
    }
    return (
        jwt.encode(access_payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM),
        jwt.encode(refresh_payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM),
    )
