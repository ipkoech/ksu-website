"""Scoped authorization helpers for portal-owned records."""

from __future__ import annotations

import uuid
from collections.abc import Awaitable, Callable, Iterable
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.rbac import AuthorizationDecision, authorize_permission

from ..models import Department, Programme, User, Wing


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

SCHOOL_LEADERSHIP_SCOPE_ROLES = {
    "dean",
    "deputy_dean",
}

DEPARTMENT_LEADERSHIP_SCOPE_ROLES = {
    "hod",
    "head",
    "cod",
    "deputy_hod",
}

LIBRARY_LEADERSHIP_SCOPE_ROLES = {
    "university_librarian",
    "chief_librarian",
    "librarian",
    "deputy_librarian",
    "head_librarian",
    "branch_librarian",
    "manager",
}

RESEARCH_LEADERSHIP_SCOPE_ROLES = {
    "director",
    "deputy_director",
    "manager",
    "coordinator",
    "project_coordinator",
    "principal_investigator",
    "project_lead",
}

ADMINISTRATION_ASSIGNMENT_PERMISSIONS = frozenset(
    {
        "administration.view",
        "office.view",
        "office.manage_content",
        "office.manage_services",
        "staff.view_assignments",
    }
)

SCHOOL_ASSIGNMENT_PERMISSIONS = frozenset(
    {
        "academic.view",
        "academic.manage_schools",
        "academic.manage_departments",
        "academic.manage_programmes",
        "staff.view_assignments",
    }
)

DEPARTMENT_ASSIGNMENT_PERMISSIONS = frozenset(
    {
        "academic.view",
        "academic.manage_departments",
        "academic.manage_programmes",
        "staff.view_assignments",
    }
)

LIBRARY_ASSIGNMENT_PERMISSIONS = frozenset(
    {
        "library.view",
        "library:read",
        "library:write",
        "library.manage_resources",
        "library.manage_services",
        "library.manage_collections",
        "library.manage_staff",
        "library.manage_loans",
    }
)

RESEARCH_ASSIGNMENT_PERMISSIONS = frozenset(
    {
        "research.view",
        "research.view_projects",
        "research:read",
        "research.manage_projects",
        "research.manage_services",
        "research.manage_office",
        "research.manage_reports",
    }
)

CLUB_ASSIGNMENT_PERMISSIONS = frozenset(
    {
        "clubs.view",
        "clubs.manage_own",
        "clubs.content_submit",
        "clubs.events_manage",
        "clubs.stories_manage",
        "media.upload",
        "media.manage",
        "media:upload",
        "media:manage",
    }
)

SCHOOL_PORTAL_PERMISSION_NAMES = (
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

SCHOOL_PORTAL_VIEW_PERMISSION_NAMES = tuple(
    permission
    for permission in SCHOOL_PORTAL_PERMISSION_NAMES
    if permission.endswith(".view")
)

GOVERNANCE_PERMISSIONS = frozenset(
    {
        "governance.manage_roles",
        "governance.manage_members",
        "governance.manage_order",
        "governance.review",
        "governance.approve",
        "governance.publish",
        "governance.archive",
    }
)


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


def normalize_assignment_role(value: str | None) -> str:
    return (value or "").strip().lower().replace("-", "_")


def assignment_permissions(scope_type: str, role: str) -> frozenset[str]:
    if scope_type == "club":
        return CLUB_ASSIGNMENT_PERMISSIONS
    if scope_type == "library" and role in LIBRARY_LEADERSHIP_SCOPE_ROLES:
        return LIBRARY_ASSIGNMENT_PERMISSIONS
    if scope_type == "research" and role in RESEARCH_LEADERSHIP_SCOPE_ROLES:
        return RESEARCH_ASSIGNMENT_PERMISSIONS
    if role in LEADERSHIP_SCOPE_ROLES:
        if scope_type == "school" and role in SCHOOL_LEADERSHIP_SCOPE_ROLES:
            return SCHOOL_ASSIGNMENT_PERMISSIONS
        if scope_type == "department" and role in DEPARTMENT_LEADERSHIP_SCOPE_ROLES:
            return DEPARTMENT_ASSIGNMENT_PERMISSIONS
        return ADMINISTRATION_ASSIGNMENT_PERMISSIONS
    return frozenset()


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
        scope_type = normalize_scope_type(getattr(assignment, "entity_type", None))
        role = normalize_assignment_role(getattr(assignment, "role", None))
        permissions = assignment_permissions(scope_type, role)
        if not permissions:
            continue
        grants.append(
            ScopedGrant(
                permissions=permissions,
                scope_type=scope_type,
                scope_id=getattr(assignment, "entity_id", None),
                source="assignment",
            )
        )
    return grants


def grant_has_permission(grant: ScopedGrant, permission: str) -> bool:
    return authorize_permission(grant.permissions, permission).allowed


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

    if grant_scope_type == "department" and target_scope_type == "programme":
        result = await db.execute(select(Programme.department_id).where(Programme.id == target_scope_id))
        return result.scalar_one_or_none() == grant_scope_id

    if grant_scope_type == "school" and target_scope_type == "programme":
        result = await db.execute(
            select(Department.school_id)
            .join(Programme, Programme.department_id == Department.id)
            .where(Programme.id == target_scope_id)
        )
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
    return (
        await authorize_scope(
            db,
            user,
            permission,
            target_scope_type,
            target_scope_id,
            scope_contains=scope_contains,
        )
    ).allowed


async def authorize_scope(
    db: AsyncSession | None,
    user: User,
    permission: str,
    target_scope_type: str,
    target_scope_id: uuid.UUID | None,
    *,
    scope_contains: ScopeResolver = default_scope_contains,
) -> AuthorizationDecision:
    """Return the common decision for a portal record and its local scope tree."""
    target_scope_type = normalize_scope_type(target_scope_type)
    permission_decision: AuthorizationDecision | None = None
    for grant in user_scoped_grants(user):
        decision = authorize_permission(grant.permissions, permission)
        if not decision.allowed:
            continue
        permission_decision = decision
        if await scope_contains(
            db,
            grant.scope_type,
            grant.scope_id,
            target_scope_type,
            target_scope_id,
        ):
            return decision
    if permission_decision is not None:
        return AuthorizationDecision(False, "scope_mismatch")
    return AuthorizationDecision(False, "missing_permission")


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
