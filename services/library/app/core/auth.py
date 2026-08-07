"""Library service authorization helpers."""

from __future__ import annotations

import uuid

from fastapi import HTTPException, status
from ksu_common.auth import TokenPayload, build_user_dependencies
from ksu_contracts.rbac import (
    AuthorizationDecision,
    AuthorizationScope,
    authorize_permission,
    build_scope_dependency,
)

from .config import get_settings

settings = get_settings()
_user_dependencies = build_user_dependencies(
    secret=settings.JWT_SECRET_KEY,
    algorithm=settings.JWT_ALGORITHM,
    app_env=settings.APP_ENV,
)
get_current_user = _user_dependencies.current_user
get_optional_user = _user_dependencies.optional_user
requires_scope = build_scope_dependency(get_current_user)


def authorize_library_scope(
    user: TokenPayload,
    permission: str,
    library_id: uuid.UUID | str | None,
) -> AuthorizationDecision:
    """Evaluate a Library permission and its exact or global branch scope."""
    return authorize_permission(
        user,
        permission,
        AuthorizationScope("library", library_id),
    )


def can_access_library_scope(
    user: TokenPayload,
    permission: str,
    library_id: uuid.UUID | str | None,
) -> bool:
    return authorize_library_scope(user, permission, library_id).allowed


def allowed_library_scope_ids(user: TokenPayload, permission: str) -> set[str] | None:
    """Return assigned branch IDs for a structured token, or None for global access."""
    if not authorize_permission(user, permission).allowed:
        return set()

    grants = [
        grant for grant in user.raw.get("scope_grants", []) or [] if isinstance(grant, dict)
    ]
    if not grants:
        return None

    matching = [
        grant
        for grant in grants
        if authorize_permission(grant.get("permissions", []), permission).allowed
    ]
    if not matching:
        return set()

    scope_ids: set[str] = set()
    for grant in matching:
        grant_scope_type = str(grant.get("scope_type") or "global").strip().lower()
        grant_scope_id = None if grant.get("scope_id") in (None, "") else str(grant["scope_id"])
        if grant_scope_type in {"global", "university"}:
            return None
        if grant_scope_type == "library" and grant_scope_id:
            scope_ids.add(grant_scope_id)
    return scope_ids


def require_library_scope(
    user: TokenPayload,
    permission: str,
    library_id: uuid.UUID | str | None,
) -> None:
    if not authorize_library_scope(user, permission, library_id).allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges for this assigned library branch",
        )
