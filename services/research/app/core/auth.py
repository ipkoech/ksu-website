"""Authentication helpers for the Research service."""

from __future__ import annotations

from collections.abc import Iterable
import uuid

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


def _grant_permissions(grant: dict) -> set[str]:
    return {str(permission).strip() for permission in grant.get("permissions", []) or [] if str(permission).strip()}


def _grant_matches_permission(grant: dict, permission: str) -> bool:
    return any(_matches_scope(granted, permission) for granted in _grant_permissions(grant))


def _normalized_scope_id(value: object) -> str | None:
    if value in (None, ""):
        return None
    return str(value)


def can_access_scoped_record(
    user: TokenPayload,
    permission: str,
    target_scope_type: str,
    target_scope_id: uuid.UUID | str | None,
) -> bool:
    """Return whether structured JWT grants allow a scoped record action.

    Tokens without structured grants remain governed by flat permission checks for
    backwards compatibility. When grants are present for a permission, at least
    one matching grant must be global/university or match the target scope.
    """
    grants = [grant for grant in user.raw.get("scope_grants", []) or [] if isinstance(grant, dict)]
    if not grants:
        return True

    matching = [grant for grant in grants if _grant_matches_permission(grant, permission)]
    if not matching:
        return True

    target_id = _normalized_scope_id(target_scope_id)
    for grant in matching:
        grant_scope_type = str(grant.get("scope_type") or "global").strip().lower()
        grant_scope_id = _normalized_scope_id(grant.get("scope_id"))
        if grant_scope_type in {"global", "university"}:
            return True
        if grant_scope_type == target_scope_type and target_id and grant_scope_id == target_id:
            return True
    return False


def require_scoped_record(
    user: TokenPayload,
    permission: str,
    target_scope_type: str,
    target_scope_id: uuid.UUID | str | None,
) -> None:
    if not can_access_scoped_record(user, permission, target_scope_type, target_scope_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges for this assigned scope",
        )


CurrentUser = TokenPayload
