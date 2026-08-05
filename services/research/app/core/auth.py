"""Authentication helpers for the Research service."""

from __future__ import annotations

import uuid

from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from ksu_common.auth import TokenPayload
from ksu_common.authorization import (
    AuthorizationDecision,
    AuthorizationScope,
    authorize_permission,
)
from ksu_common.security import decode_token

from .config import get_settings
from .idempotency_context import set_authenticated_scope

settings = get_settings()
_bearer = HTTPBearer(auto_error=False)


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
            expected_type="access",
        )
    except Exception as exc:  # pragma: no cover - fast fail around shared jwt lib
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    token_payload = TokenPayload(
        sub=payload["sub"],
        jti=payload["jti"],
        roles=payload.get("roles", []),
        raw=payload,
    )
    set_authenticated_scope(token_payload.sub)
    return token_payload


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    access_token: str | None = Cookie(default=None, alias="access_token"),
) -> TokenPayload | None:
    """Decode a user token when present without treating service calls as users."""
    token = credentials.credentials if credentials else access_token
    if not token:
        return None
    try:
        payload = decode_token(
            token,
            secret=settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM,
            expected_type="access",
        )
    except Exception:
        return None
    return TokenPayload(
        sub=payload["sub"],
        jti=payload["jti"],
        roles=payload.get("roles", []),
        raw=payload,
    )


def require_scope(scope: str):
    def _check(user: TokenPayload = Depends(get_current_user)) -> TokenPayload:
        if authorize_permission(user, scope).allowed:
            return user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges",
        )

    return _check


def authorize_scoped_record(
    user: TokenPayload,
    permission: str,
    target_scope_type: str,
    target_scope_id: uuid.UUID | str | None,
) -> AuthorizationDecision:
    """Evaluate a Research permission and its exact or global signed scope."""
    return authorize_permission(
        user,
        permission,
        AuthorizationScope(target_scope_type, target_scope_id),
    )


def can_access_scoped_record(
    user: TokenPayload,
    permission: str,
    target_scope_type: str,
    target_scope_id: uuid.UUID | str | None,
) -> bool:
    return authorize_scoped_record(
        user,
        permission,
        target_scope_type,
        target_scope_id,
    ).allowed


def require_scoped_record(
    user: TokenPayload,
    permission: str,
    target_scope_type: str,
    target_scope_id: uuid.UUID | str | None,
) -> None:
    if not authorize_scoped_record(
        user,
        permission,
        target_scope_type,
        target_scope_id,
    ).allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges for this assigned scope",
        )


def resolve_exact_school_grant(user: TokenPayload, permission: str) -> uuid.UUID:
    """Resolve one school from a structured grant carrying ``permission``.

    School portal endpoints deliberately do not fall back to flat permissions:
    the server must derive ownership from exactly one signed school grant.
    """
    matching_ids: set[uuid.UUID] = set()
    for grant in user.raw.get("scope_grants", []) or []:
        if not isinstance(grant, dict) or not authorize_permission(
            grant.get("permissions", []), permission
        ).allowed:
            continue
        if str(grant.get("scope_type") or "").strip().lower() != "school":
            continue
        try:
            matching_ids.add(uuid.UUID(str(grant.get("scope_id"))))
        except (TypeError, ValueError):
            continue

    if not matching_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="A school-scoped assignment is required",
        )
    if len(matching_ids) != 1:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Select one school assignment before continuing",
        )
    return next(iter(matching_ids))


CurrentUser = TokenPayload
