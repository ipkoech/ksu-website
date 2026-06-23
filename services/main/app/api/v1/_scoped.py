"""Shared helpers for endpoints that protect records by portal scope."""

from __future__ import annotations

import uuid
from collections.abc import Iterable

from fastapi import HTTPException, status

from ...deps import CurrentUser, DbSession
from ...security.scopes import can_access_scope as _can_access_scope


def normalize_scope(scope_type: str | None, scope_id: uuid.UUID | None) -> tuple[str, uuid.UUID | None]:
    return (scope_type or "global", scope_id)


async def can_access_scoped_record(
    db: DbSession,
    user: CurrentUser,
    permissions: Iterable[str],
    scope_type: str | None,
    scope_id: uuid.UUID | None,
) -> bool:
    target_scope_type, target_scope_id = normalize_scope(scope_type, scope_id)
    for permission in permissions:
        if await _can_access_scope(db, user, permission, target_scope_type, target_scope_id):
            return True
    return False


async def require_scoped_record(
    db: DbSession,
    user: CurrentUser,
    permissions: Iterable[str],
    scope_type: str | None,
    scope_id: uuid.UUID | None,
    *,
    resource_name: str,
) -> None:
    if not await can_access_scoped_record(db, user, permissions, scope_type, scope_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient privileges for this {resource_name} scope",
        )
