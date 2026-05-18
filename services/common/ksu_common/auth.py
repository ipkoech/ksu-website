"""FastAPI authentication dependency."""

from __future__ import annotations

import os
from dataclasses import dataclass, field

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .security import decode_token

_bearer = HTTPBearer(auto_error=False)


@dataclass
class TokenPayload:
    sub: str
    jti: str
    roles: list[str] = field(default_factory=list)
    raw: dict = field(default_factory=dict)


def _get_jwt_secret() -> str:
    secret = os.getenv("JWT_SECRET_KEY")
    if not secret:
        raise RuntimeError("JWT_SECRET_KEY env var is not set")
    return secret


def _get_jwt_algorithm() -> str:
    return os.getenv("JWT_ALGORITHM", "HS256")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> TokenPayload:
    """Validate Bearer JWT and return the token payload."""
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not credentials:
        raise exc

    try:
        payload = decode_token(
            credentials.credentials,
            secret=_get_jwt_secret(),
            algorithm=_get_jwt_algorithm(),
        )
    except jwt.PyJWTError:
        raise exc

    return TokenPayload(
        sub=payload["sub"],
        jti=payload["jti"],
        roles=payload.get("roles", []),
        raw=payload,
    )


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> TokenPayload | None:
    """Like get_current_user but returns None instead of raising on missing token."""
    if not credentials:
        return None
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
