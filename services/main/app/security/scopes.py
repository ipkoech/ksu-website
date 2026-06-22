"""Scoped authorization helpers for portal-owned records."""

from __future__ import annotations

import uuid
from collections.abc import Awaitable, Callable, Iterable
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..deps import _has_permission
from ..models import Department, User, Wing


ScopeResolver = Callable[
    [AsyncSession | None, str, uuid.UUID | None, str, uuid.UUID | None],
    Awaitable[bool],
]

LEADERSHIP_SCOPE_ROLES = {
    "vc",
    "vice_chancellor",
    "dvc",
    "deputy_vice_chancellor",
    "dvc_arsa",
    "dvc_apf",
    "registrar",
    "registrar_academic",
    "registrar_admin",
    "finance_officer",
    "director",
    "deputy_director",
    "deputy_registrar",
    "manager",
    "dean",
    "hod",
    "head",
    "cod",
}


@dataclass(frozen=True)
class ScopedGrant:
    permissions: frozenset[str]
    scope_type: str
    scope_id: uuid.UUID | None
    source: str


def normalize_scope_type(value: str | None) -> str:
    normalized = (value or "global").strip().lower().replace("-", "_")
    if normalized == "directorate":
        return "division"
    return normalized


def _active_role_assignments(user: User) -> Iterable:
    return (
        assignment
        for assignment in getattr(user, "role_assignments", []) or []
        if getattr(assignment, "is_active", True)
        and getattr(assignment, "role", None)
        and getattr(assignment.role, "is_active", True)
    )


def _role_permissions(role) -> frozenset[str]:
    permissions: set[str] = set()
    for role_permission in getattr(role, "role_permissions", []) or []:
        permission = getattr(role_permission, "permission", None)
        if permission is not None and getattr(permission, "is_active", True):
            permissions.add(permission.name.strip().lower())
    for permission in getattr(role, "permissions", []) or []:
        permissions.add(str(permission).strip().lower())
    return frozenset(permission for permission in permissions if permission)


def user_scoped_grants(user: User) -> list[ScopedGrant]:
    grants: list[ScopedGrant] = []
    for assignment in _active_role_assignments(user):
        grants.append(
            ScopedGrant(
                permissions=_role_permissions(assignment.role),
                scope_type=normalize_scope_type(getattr(assignment, "scope_type", None)),
                scope_id=getattr(assignment, "scope_id", None),
                source="role",
            )
        )

    person = getattr(user, "person", None)
    for assignment in getattr(person, "assignments", []) or []:
        if getattr(assignment, "status", "active") != "active":
            continue
        role = str(getattr(assignment, "role", "") or "").strip().lower().replace("-", "_")
        if role not in LEADERSHIP_SCOPE_ROLES:
            continue
        scope_type = normalize_scope_type(getattr(assignment, "entity_type", None))
        grants.append(
            ScopedGrant(
                permissions=frozenset(
                    {
                        "administration.view",
                        "office.view",
                        "office.manage_content",
                        "office.manage_services",
                        "staff.view_assignments",
                    }
                ),
                scope_type=scope_type,
                scope_id=getattr(assignment, "entity_id", None),
                source="assignment",
            )
        )
    return grants


def grant_has_permission(grant: ScopedGrant, permission: str) -> bool:
    return _has_permission(set(grant.permissions), permission)


def has_global_permission(user: User, permission: str) -> bool:
    return any(
        grant.scope_type == "global" and grant_has_permission(grant, permission)
        for grant in user_scoped_grants(user)
    )


async def default_scope_contains(
    db: AsyncSession | None,
    grant_scope_type: str,
    grant_scope_id: uuid.UUID | None,
    target_scope_type: str,
    target_scope_id: uuid.UUID | None,
) -> bool:
    grant_scope_type = normalize_scope_type(grant_scope_type)
    target_scope_type = normalize_scope_type(target_scope_type)

    if grant_scope_type == "global":
        return True
    if grant_scope_type == "university":
        return True
    if grant_scope_type == target_scope_type and grant_scope_id == target_scope_id:
        return True
    if grant_scope_id is None or target_scope_id is None or db is None:
        return False

    if grant_scope_type == "division" and target_scope_type == "wing":
        result = await db.execute(select(Wing.division_id).where(Wing.id == target_scope_id))
        return result.scalar_one_or_none() == grant_scope_id

    if grant_scope_type == "wing" and target_scope_type == "department":
        result = await db.execute(select(Department.wing_id).where(Department.id == target_scope_id))
        return result.scalar_one_or_none() == grant_scope_id

    if grant_scope_type == "school" and target_scope_type == "department":
        result = await db.execute(select(Department.school_id).where(Department.id == target_scope_id))
        return result.scalar_one_or_none() == grant_scope_id

    return False


async def can_access_scope(
    db: AsyncSession | None,
    user: User,
    permission: str,
    target_scope_type: str,
    target_scope_id: uuid.UUID | None,
    *,
    scope_contains: ScopeResolver = default_scope_contains,
) -> bool:
    target_scope_type = normalize_scope_type(target_scope_type)
    for grant in user_scoped_grants(user):
        if not grant_has_permission(grant, permission):
            continue
        if await scope_contains(
            db,
            grant.scope_type,
            grant.scope_id,
            target_scope_type,
            target_scope_id,
        ):
            return True
    return False


async def filter_records_for_scope(
    db: AsyncSession | None,
    user: User,
    permission: str,
    records: Iterable,
    *,
    scope_getter: Callable[[object], tuple[str, uuid.UUID | None]],
) -> list:
    visible = []
    for record in records:
        scope_type, scope_id = scope_getter(record)
        if await can_access_scope(db, user, permission, scope_type, scope_id):
            visible.append(record)
    return visible

