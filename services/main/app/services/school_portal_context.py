"""Resolve the authenticated user's one server-derived School Portal scope."""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from ..deps import CurrentUser, DbSession
from ..models import Department, School, User

SCHOOL_ADMIN_ROLE = "school_admin"
SCHOOL_EDITOR_ROLE = "school_editor"
SCHOOL_PORTAL_ROLE_NAMES = frozenset({SCHOOL_ADMIN_ROLE, SCHOOL_EDITOR_ROLE})

SCHOOL_PORTAL_PERMISSIONS = (
    "school.audit.view",
    "school.content.bulk",
    "school.content.manage",
    "school.content.submit",
    "school.content.view",
    "school.dashboard.view",
    "school.departments.bulk",
    "school.departments.manage",
    "school.departments.view",
    "school.inquiries.manage",
    "school.inquiries.reply",
    "school.inquiries.view",
    "school.media.bulk",
    "school.media.manage",
    "school.media.view",
    "school.notifications.manage",
    "school.notifications.view",
    "school.profile.manage",
    "school.profile.view",
    "school.programmes.bulk",
    "school.programmes.manage",
    "school.programmes.view",
    "school.publications.manage",
    "school.publications.submit",
    "school.publications.view",
    "school.team.bulk",
    "school.team.manage",
    "school.team.roles",
    "school.team.view",
)

SCHOOL_PORTAL_NAVIGATION_PERMISSIONS = (
    ("dashboard", "school.dashboard.view"),
    ("profile", "school.profile.view"),
    ("team", "school.team.view"),
    ("departments", "school.departments.view"),
    ("programmes", "school.programmes.view"),
    ("publications", "school.publications.view"),
    ("content", "school.content.view"),
    ("media", "school.media.view"),
    ("inquiries", "school.inquiries.view"),
    ("notifications", "school.notifications.view"),
    ("audit", "school.audit.view"),
)


@dataclass(frozen=True, slots=True)
class SchoolPortalContext:
    school: School
    user: User
    permissions: tuple[str, ...]
    role_names: tuple[str, ...]


def _normalized(value: str | None) -> str:
    return (value or "").strip().lower().replace("-", "_")


def _is_unexpired(expires_at: datetime | None) -> bool:
    if expires_at is None:
        return True
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return expires_at > datetime.now(timezone.utc)


def _role_permissions(assignment) -> set[str]:
    permissions: set[str] = set()
    role = getattr(assignment, "role", None)
    for role_permission in getattr(role, "role_permissions", ()) or ():
        permission = getattr(role_permission, "permission", None)
        name = _normalized(getattr(permission, "name", None)).replace("_", ".", 1)
        if (
            permission is not None
            and getattr(permission, "is_active", True)
            and name.startswith("school.")
            and name in SCHOOL_PORTAL_PERMISSIONS
        ):
            permissions.add(name)
    return permissions


def _active_school_assignments(user: User) -> list:
    assignments = []
    for assignment in getattr(user, "role_assignments", ()) or ():
        role = getattr(assignment, "role", None)
        role_name = _normalized(getattr(role, "name", None))
        if not getattr(assignment, "is_active", True):
            continue
        if role is None or not getattr(role, "is_active", True):
            continue
        if not _is_unexpired(getattr(assignment, "expires_at", None)):
            continue
        if _normalized(getattr(assignment, "scope_type", None)) != "school":
            continue
        if getattr(assignment, "scope_id", None) is None:
            continue
        if role_name not in SCHOOL_PORTAL_ROLE_NAMES and not _role_permissions(assignment):
            continue
        assignments.append(assignment)
    return assignments


def allowed_school_navigation(permissions: tuple[str, ...] | list[str]) -> list[str]:
    permission_set = set(permissions)
    return [
        key
        for key, required_permission in SCHOOL_PORTAL_NAVIGATION_PERMISSIONS
        if required_permission in permission_set
    ]


async def resolve_school_portal_context(
    db: AsyncSession,
    user: User,
) -> SchoolPortalContext:
    """Resolve one school exclusively from active scoped role assignments."""
    assignments = _active_school_assignments(user)
    school_ids = {
        uuid.UUID(str(assignment.scope_id))
        for assignment in assignments
    }
    if not school_ids:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No school is assigned to this account",
        )
    if len(school_ids) > 1:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Multiple schools are assigned to this account",
        )

    school_id = next(iter(school_ids))
    result = await db.execute(
        select(School)
        .options(
            joinedload(School.campus),
            joinedload(School.administrative_wing),
            joinedload(School.dean),
            joinedload(School.logo_image),
            joinedload(School.cover_image),
            joinedload(School.brochure),
            joinedload(
                School.departments.and_(
                    Department.is_active.is_(True),
                    Department.deleted_at.is_(None),
                )
            ),
        )
        .where(
            School.id == school_id,
            School.deleted_at.is_(None),
        )
    )
    school = result.unique().scalar_one_or_none()
    if school is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Assigned school is unavailable",
        )

    role_names = tuple(
        sorted(
            {
                _normalized(getattr(assignment.role, "name", None))
                for assignment in assignments
                if assignment.scope_id == school_id
            }
        )
    )
    if SCHOOL_ADMIN_ROLE in role_names:
        permissions = SCHOOL_PORTAL_PERMISSIONS
    else:
        permissions = tuple(
            sorted(
                {
                    permission
                    for assignment in assignments
                    if assignment.scope_id == school_id
                    for permission in _role_permissions(assignment)
                }
            )
        )

    return SchoolPortalContext(
        school=school,
        user=user,
        permissions=permissions,
        role_names=role_names,
    )


async def get_current_school_context(
    db: DbSession,
    user: CurrentUser,
) -> SchoolPortalContext:
    return await resolve_school_portal_context(db, user)


CurrentSchoolContext = Annotated[
    SchoolPortalContext,
    Depends(get_current_school_context),
]


__all__ = [
    "CurrentSchoolContext",
    "SCHOOL_PORTAL_NAVIGATION_PERMISSIONS",
    "SCHOOL_PORTAL_PERMISSIONS",
    "SchoolPortalContext",
    "allowed_school_navigation",
    "get_current_school_context",
    "resolve_school_portal_context",
]
