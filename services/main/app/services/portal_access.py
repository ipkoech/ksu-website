"""Portal access resolution for scoped admin workspaces."""

from __future__ import annotations

import uuid
from collections.abc import Iterable, Mapping

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Department, Division, School, User, Wing
from ..schemas.access import PortalAccessRead
from ..security.scopes import (
    LIBRARY_LEADERSHIP_SCOPE_ROLES,
    RESEARCH_LEADERSHIP_SCOPE_ROLES,
)

ScopeKey = tuple[str, uuid.UUID]

ADMINISTRATION_SCOPE_TYPES = {"university", "division", "wing", "directorate"}
LEADERSHIP_ASSIGNMENT_ROLES = {
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
}
SCHOOL_LEADERSHIP_ASSIGNMENT_ROLES = {
    "dean",
    "deputy_dean",
}
DEPARTMENT_LEADERSHIP_ASSIGNMENT_ROLES = {
    "hod",
    "head",
    "cod",
    "deputy_hod",
}

PROFILE_PERMISSION = "profile.self_edit"
PROFILE_PORTAL_KEY = "staff-profile"
GLOBAL_ADMIN_PERMISSIONS = {"*", "admin:*"}
STUDENT_CLUB_ASSIGNMENT_PERMISSIONS = {
    "clubs.view",
    "clubs.manage_own",
    "clubs.content_submit",
    "clubs.events_manage",
    "clubs.stories_manage",
}

PORTAL_DEFINITIONS = {
    "super-admin": {
        "label": "Super Admin Portal",
        "service": "system",
        "href": "/super-admin",
        "permissions": {"users.view", "roles.view", "permissions.view", "audit.view", "settings.manage"},
    },
    PROFILE_PORTAL_KEY: {
        "label": "Staff Profile Portal",
        "service": "main",
        "href": "/settings/profile",
        "permissions": {PROFILE_PERMISSION},
    },
    "admin": {
        "label": "Admin Portal",
        "service": "main",
        "href": "/admin",
        "permissions": {
            "governance.view",
            "governance.manage_boards",
            "policy.view",
            "policy.manage",
            "administration.view",
            "administration.manage_units",
            "administration.manage_content",
            "administration.manage_staff",
            "administration.manage_services",
            "office.view",
            "office.manage_content",
            "office.manage_staff",
            "office.manage_services",
            "governance.manage_divisions",
            "organization.manage_divisions",
        },
    },
    "schools": {
        "label": "Schools Portal",
        "service": "main",
        "href": "/schools",
        "permissions": {"academic.view", "academic.manage_schools"},
    },
    "departments": {
        "label": "Departmental Portal",
        "service": "main",
        "href": "/departments",
        "permissions": {"academic.view", "academic.manage_departments"},
    },
    "corporate-communication": {
        "label": "Corporate Communication",
        "service": "main",
        "href": "/corporate-communication",
        "permissions": {
            "content.view",
            "content.manage",
            "content.manage_pages",
            "content.manage_news",
            "content.manage_events",
            "content.manage_blogs",
            "content.manage_announcements",
            "content.manage_categories",
            "content.review",
            "content.edit_submitted",
            "content.approve",
            "content.publish",
            "content.schedule",
            "content.unpublish",
            "media.view",
            "media.manage",
            "media.upload",
            "homepage.view",
            "homepage.manage",
            "homepage.publish",
            "marketing.view",
            "marketing.manage_sliders",
            "marketing.manage_testimonials",
            "page_sections.view",
            "page_sections.manage",
            "page_sections.create",
            "page_sections.update",
            "page_sections.delete",
            "page_sections.review",
            "page_sections.publish",
            "partnership_spotlights.manage",
            "clubs.view",
            "clubs.content_submit",
            "clubs.manage_own",
            "clubs.events_manage",
            "clubs.stories_manage",
        },
    },
    "research": {
        "label": "Research Portal",
        "service": "research",
        "href": "/research",
        "permissions": {
            "research.view",
            "research.view_projects",
            "publications.view",
            "publications.submit",
            "publications.review",
            "publications.approve",
            "publications.manage",
        },
    },
    "library": {
        "label": "Library Portal",
        "service": "library",
        "href": "/library",
        "permissions": {
            "library.view",
            "library:read",
            "library.manage_resources",
            "library.manage_services",
            "library.manage_collections",
            "library.manage_staff",
            "library.manage_loans",
        },
    },
}


def _normalize(value: str | None) -> str:
    return (value or "").strip().lower().replace("_", "-")


def _normalize_permission(value: str | None) -> str:
    return (value or "").strip().lower()


def _active_role_assignments(user: User) -> Iterable:
    return (
        assignment
        for assignment in getattr(user, "role_assignments", []) or []
        if getattr(assignment, "is_active", True)
        and getattr(assignment, "role", None)
        and getattr(assignment.role, "is_active", True)
    )


def _role_permissions(role) -> set[str]:
    permissions: set[str] = set()
    for role_permission in getattr(role, "role_permissions", []) or []:
        permission = getattr(role_permission, "permission", None)
        if permission is not None and getattr(permission, "is_active", True):
            permissions.add(_normalize_permission(permission.name))
    for permission in getattr(role, "permissions", []) or []:
        permissions.add(_normalize_permission(permission))
    return {permission for permission in permissions if permission}


def _service_scope_for_portal(portal_key: str, permissions: set[str]) -> list[str]:
    relevant = set(PORTAL_DEFINITIONS[portal_key]["permissions"])
    if permissions.intersection(GLOBAL_ADMIN_PERMISSIONS):
        return sorted(relevant)
    return sorted(permission for permission in permissions if permission in relevant)


def _scope_label(scope_type: str, scope_id: uuid.UUID | None, scope_labels: Mapping[ScopeKey, str]) -> str:
    if scope_type == "global":
        return "All scopes"
    if scope_type == "university":
        return "University Office"
    if scope_type == "profile":
        return "My Staff Profile"
    if scope_id is not None:
        label = scope_labels.get((scope_type, scope_id))
        if label:
            return label
    return f"{scope_type.replace('_', ' ').replace('-', ' ').title()} scope"


def _add_or_merge(
    records: dict[tuple[str, str, uuid.UUID | None], PortalAccessRead],
    *,
    key: str,
    scope_type: str,
    scope_id: uuid.UUID | None,
    permissions: Iterable[str],
    scope_labels: Mapping[ScopeKey, str],
    source: str,
) -> None:
    definition = PORTAL_DEFINITIONS[key]
    normalized_permissions = sorted({_normalize_permission(permission) for permission in permissions if permission})
    if not normalized_permissions:
        return

    scope_label = _scope_label(scope_type, scope_id, scope_labels)
    record_key = (key, scope_type, scope_id)
    existing = records.get(record_key)
    if existing:
        existing.permissions = sorted(set(existing.permissions).union(normalized_permissions))
        if existing.source != source:
            existing.source = "mixed"
        return

    label = definition["label"]
    if scope_type not in {"global", "profile"}:
        label = f"{label} - {scope_label}"

    records[record_key] = PortalAccessRead(
        key=key,
        label=label,
        service=str(definition["service"]),
        href=str(definition["href"]),
        scope_type=scope_type,
        scope_id=scope_id,
        scope_label=scope_label,
        permissions=normalized_permissions,
        source=source,
        locked_scope=scope_type != "global",
    )


def _assignment_scope_type(scope_type: str | None) -> str:
    normalized = _normalize(scope_type).replace("-", "_")
    if normalized == "directorate":
        return "division"
    return normalized


def _assignment_role(role: str | None) -> str:
    return _normalize(role).replace("-", "_")


def _portal_keys_for_permissions(permissions: set[str], scope_type: str | None) -> list[str]:
    if permissions.intersection(GLOBAL_ADMIN_PERMISSIONS):
        return list(PORTAL_DEFINITIONS)

    keys: list[str] = []
    for key, definition in PORTAL_DEFINITIONS.items():
        if permissions.intersection(definition["permissions"]):
            keys.append(key)

    if scope_type in ADMINISTRATION_SCOPE_TYPES and permissions.intersection({
        "staff.view_assignments",
        "staff.manage_assignments",
        "persons.view",
        "persons.manage",
    }):
        keys.append("admin")

    return list(dict.fromkeys(keys))


def build_portal_access_records(user: User, scope_labels: Mapping[ScopeKey, str]) -> list[PortalAccessRead]:
    """Build the current user's portal access records from roles and active staff assignments."""
    records: dict[tuple[str, str, uuid.UUID | None], PortalAccessRead] = {}

    for assignment in _active_role_assignments(user):
        role_permissions = _role_permissions(assignment.role)
        role_name = _normalize(getattr(assignment.role, "name", None))
        scope_type = _assignment_scope_type(getattr(assignment, "scope_type", None)) or "global"
        scope_id = getattr(assignment, "scope_id", None)

        if role_name == "staff" or PROFILE_PERMISSION in role_permissions:
            _add_or_merge(
                records,
                key=PROFILE_PORTAL_KEY,
                scope_type="profile",
                scope_id=getattr(user, "id", None),
                permissions=[PROFILE_PERMISSION],
                scope_labels=scope_labels,
                source="role",
            )

        for portal_key in _portal_keys_for_permissions(role_permissions, scope_type):
            if portal_key == PROFILE_PORTAL_KEY:
                continue
            portal_permissions = _service_scope_for_portal(portal_key, role_permissions)
            if not portal_permissions and role_permissions.intersection(GLOBAL_ADMIN_PERMISSIONS):
                portal_permissions = sorted(PORTAL_DEFINITIONS[portal_key]["permissions"])
            if portal_permissions:
                _add_or_merge(
                    records,
                    key=portal_key,
                    scope_type=scope_type,
                    scope_id=scope_id if scope_type != "global" else None,
                    permissions=portal_permissions,
                    scope_labels=scope_labels,
                    source="role",
                )

    person = getattr(user, "person", None)
    for assignment in getattr(person, "assignments", []) or []:
        if getattr(assignment, "status", "active") != "active":
            continue
        entity_type = _assignment_scope_type(getattr(assignment, "entity_type", None))
        entity_id = getattr(assignment, "entity_id", None)
        role = _assignment_role(getattr(assignment, "role", None))
        if entity_type in ADMINISTRATION_SCOPE_TYPES and role in LEADERSHIP_ASSIGNMENT_ROLES:
            _add_or_merge(
                records,
                key="admin",
                scope_type=entity_type,
                scope_id=entity_id,
                permissions=[
                    "administration.view",
                    "office.view",
                    "office.manage_content",
                    "office.manage_services",
                    "staff.view_assignments",
                ],
                scope_labels=scope_labels,
                source="assignment",
            )
        elif entity_type == "school" and role in SCHOOL_LEADERSHIP_ASSIGNMENT_ROLES:
            _add_or_merge(
                records,
                key="schools",
                scope_type=entity_type,
                scope_id=entity_id,
                permissions=[
                    "academic.view",
                    "academic.manage_schools",
                ],
                scope_labels=scope_labels,
                source="assignment",
            )
        elif entity_type == "department" and role in DEPARTMENT_LEADERSHIP_ASSIGNMENT_ROLES:
            _add_or_merge(
                records,
                key="departments",
                scope_type=entity_type,
                scope_id=entity_id,
                permissions=[
                    "academic.view",
                    "academic.manage_departments",
                ],
                scope_labels=scope_labels,
                source="assignment",
            )
        elif entity_type == "library" and role in LIBRARY_LEADERSHIP_SCOPE_ROLES:
            _add_or_merge(
                records,
                key="library",
                scope_type=entity_type,
                scope_id=entity_id,
                permissions=[
                    "library.view",
                    "library.manage_resources",
                    "library.manage_services",
                ],
                scope_labels=scope_labels,
                source="assignment",
            )
        elif entity_type == "research" and role in RESEARCH_LEADERSHIP_SCOPE_ROLES:
            _add_or_merge(
                records,
                key="research",
                scope_type=entity_type,
                scope_id=entity_id,
                permissions=[
                    "research.view",
                    "research.view_projects",
                    "research.manage_projects",
                ],
                scope_labels=scope_labels,
                source="assignment",
            )
        elif entity_type == "club":
            _add_or_merge(
                records,
                key="corporate-communication",
                scope_type=entity_type,
                scope_id=entity_id,
                permissions=STUDENT_CLUB_ASSIGNMENT_PERMISSIONS,
                scope_labels=scope_labels,
                source="assignment",
            )

    return sorted(records.values(), key=lambda record: (record.service, record.key, record.scope_label))


def collect_scope_keys(user: User) -> set[ScopeKey]:
    keys: set[ScopeKey] = set()
    for assignment in _active_role_assignments(user):
        scope_type = _assignment_scope_type(getattr(assignment, "scope_type", None))
        scope_id = getattr(assignment, "scope_id", None)
        if scope_type and scope_id:
            keys.add((scope_type, scope_id))

    person = getattr(user, "person", None)
    for assignment in getattr(person, "assignments", []) or []:
        entity_type = _assignment_scope_type(getattr(assignment, "entity_type", None))
        entity_id = getattr(assignment, "entity_id", None)
        if entity_type and entity_id:
            keys.add((entity_type, entity_id))
    return keys


async def load_scope_labels(db: AsyncSession, scope_keys: set[ScopeKey]) -> dict[ScopeKey, str]:
    labels: dict[ScopeKey, str] = {}
    model_map = {
        "division": Division,
        "wing": Wing,
        "school": School,
        "department": Department,
    }

    for scope_type, model in model_map.items():
        ids = [scope_id for key_type, scope_id in scope_keys if key_type == scope_type]
        if not ids:
            continue
        result = await db.execute(select(model.id, model.name).where(model.id.in_(ids)))
        for scope_id, name in result.all():
            labels[(scope_type, scope_id)] = name

    return labels


async def get_portal_access(db: AsyncSession, user: User) -> list[PortalAccessRead]:
    scope_labels = await load_scope_labels(db, collect_scope_keys(user))
    return build_portal_access_records(user, scope_labels)
