"""Authentication helpers for the Research service."""

from __future__ import annotations

from collections.abc import Iterable

from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from ksu_common.auth import TokenPayload
from ksu_common.roles import ROLE_DEFINITIONS
from ksu_common.security import decode_token

from .config import get_settings

settings = get_settings()
_bearer = HTTPBearer(auto_error=False)


def _scope_variants(scope: str) -> set[str]:
    return {scope, scope.replace(":", "."), scope.replace(".", ":")}


def _matches_scope(granted: str, required: str) -> bool:
    required_variants = _scope_variants(required)
    granted_variants = _scope_variants(granted)
    if granted_variants & required_variants:
        return True
    for variant in granted_variants:
        if variant.endswith(":*") and any(req.startswith(variant[:-1]) for req in required_variants):
            return True
        if variant.endswith(".*") and any(req.startswith(variant[:-1]) for req in required_variants):
            return True
    return False


def _collect_scopes(payload: TokenPayload) -> set[str]:
    scopes = set(payload.raw.get("scopes", []) or [])
    scopes.update(payload.raw.get("permissions", []) or [])
    for role in payload.roles:
        definition = ROLE_DEFINITIONS.get(role)
        if definition:
            scopes.update(definition.scopes)
    return scopes


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    access_token: str | None = Cookie(default=None, alias="access_token"),
) -> TokenPayload:
    token = credentials.credentials if credentials else access_token
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = decode_token(
            token,
            secret=settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM,
        )
    except Exception as exc:  # pragma: no cover - fast fail around shared jwt lib
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    return TokenPayload(
        sub=payload["sub"],
        jti=payload["jti"],
        roles=payload.get("roles", []),
        raw=payload,
    )


def require_scope(scope: str):
    def _check(user: TokenPayload = Depends(get_current_user)) -> TokenPayload:
        scopes = _collect_scopes(user)
        if any(_matches_scope(granted, scope) for granted in scopes):
            return user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges",
        )

    return _check


CurrentUser = TokenPayload

