"""Seed baseline RBAC permissions and roles."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Role, RolePermission
from ksu_common.roles import ALL_PERMISSIONS, ROLE_DEFINITIONS

from ._shared import SeedContext, upsert_permission, upsert_role, upsert_role_permission


PERMISSION_SPECS = [
    ("admin:*", "Full administrative access across the platform", "admin", "*"),
    ("users:read", "View users", "users", "read"),
    ("users:write", "Create and update users", "users", "write"),
    ("users:delete", "Deactivate users", "users", "delete"),
    ("roles:read", "View roles", "roles", "read"),
    ("roles:write", "Create and update roles", "roles", "write"),
    ("roles:delete", "Delete roles", "roles", "delete"),
    ("permissions:read", "View permissions", "permissions", "read"),
    ("permissions:write", "Create and update permissions", "permissions", "write"),
    ("audit:read", "View audit logs", "audit", "read"),
    ("settings:read", "View system settings", "settings", "read"),
    ("settings:write", "Create and update system settings", "settings", "write"),
    ("api_keys:read", "View API keys", "api_keys", "read"),
    ("api_keys:write", "Create and update API keys", "api_keys", "write"),
    ("api_keys:delete", "Revoke API keys", "api_keys", "delete"),
    ("webhooks:read", "View webhooks", "webhooks", "read"),
    ("webhooks:write", "Create and update webhooks", "webhooks", "write"),
    ("webhooks:delete", "Delete webhooks", "webhooks", "delete"),
    ("notifications:read", "View notification templates and deliveries", "notifications", "read"),
    ("notifications:write", "Create and update notification templates", "notifications", "write"),
    ("notifications:delete", "Delete notification templates", "notifications", "delete"),
    ("notifications:send", "Send and preview notifications", "notifications", "send"),
    ("academic:read", "View academic entities", "academic", "read"),
    ("academic:write", "Create and update academic entities", "academic", "write"),
    ("academic:delete", "Delete academic entities", "academic", "delete"),
    ("staff:read", "View staff assignments", "staff", "read"),
    ("staff:write", "Create and update staff assignments", "staff", "write"),
    ("staff:delete", "Delete staff assignments", "staff", "delete"),
    ("governance:read", "View governance records", "governance", "read"),
    ("governance:write", "Manage governance records", "governance", "write"),
    ("media:upload", "Upload media assets", "media", "upload"),
    ("media:delete", "Delete media assets", "media", "delete"),
    ("media:manage", "Manage media folders and links", "media", "manage"),
    ("content.manage", "Manage public content records", "content", "manage"),
    ("content.review", "Review submitted public content", "content", "review"),
    ("content.edit_submitted", "Edit submitted public content", "content", "edit_submitted"),
    ("content.approve", "Approve public content", "content", "approve"),
    ("content.schedule", "Schedule public content", "content", "schedule"),
    ("content.unpublish", "Unpublish public content", "content", "unpublish"),
    ("clubs.view", "View student club records", "clubs", "view"),
    ("clubs.manage_own", "Manage assigned student club records", "clubs", "manage_own"),
    ("clubs.content_submit", "Submit student club content for review", "clubs", "content_submit"),
    ("clubs.events_manage", "Manage assigned student club events", "clubs", "events_manage"),
    ("clubs.stories_manage", "Manage assigned student club stories", "clubs", "stories_manage"),
]


def _split_permission_name(permission_name: str) -> tuple[str, str]:
    if ":" in permission_name:
        resource, action = permission_name.split(":", 1)
        return resource, action
    if "." in permission_name:
        resource, action = permission_name.split(".", 1)
        return resource, action
    return permission_name, "access"


_existing_permissions = {spec[0] for spec in PERMISSION_SPECS}
for permission_name in ALL_PERMISSIONS:
    if permission_name in _existing_permissions:
        continue
    resource, action = _split_permission_name(permission_name)
    PERMISSION_SPECS.append((
        permission_name,
        f"Grant {permission_name.replace('_', ' ')}",
        resource,
        action,
    ))
    _existing_permissions.add(permission_name)


COCMS_PERMISSION_NAMES = [
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
    "media.upload",
    "media.manage",
    "homepage.view",
    "homepage.manage",
    "homepage.publish",
    "marketing.view",
    "marketing.manage_sliders",
    "marketing.manage_testimonials",
    "support.manage_faqs",
    "support.manage_contacts",
]


# Most seeded roles retain operator-added permissions. This legacy role is a
# deliberate consolidation exception: its prior admin:* grant must be removed.
RECONCILED_ROLE_NAMES = frozenset({"content_admin"})


ROLE_SPECS = [
    {
        "name": "super_admin",
        "display_name": "Super Admin",
        "description": "System-wide administrative role with full access.",
        "is_system": True,
        "permission_names": [spec[0] for spec in PERMISSION_SPECS],
    },
    {
        "name": "academic_admin",
        "display_name": "Academic Admin",
        "description": "Administrative role for schools, departments, programmes, and admissions.",
        "is_system": True,
        "permission_names": ["academic:read", "academic:write", "academic:delete", "staff:read"],
    },
    {
        "name": "content_admin",
        "display_name": "Content Admin (Legacy)",
        "description": "Legacy content administration role retained for CoCMS compatibility.",
        "is_system": True,
        "permission_names": COCMS_PERMISSION_NAMES,
    },
    {
        "name": "cocms_admin",
        "display_name": "CoCMS Admin",
        "description": "Administrator for the consolidated corporate communications and CMS portal.",
        "is_system": True,
        "permission_names": COCMS_PERMISSION_NAMES,
    },
    {
        "name": "staff_admin",
        "display_name": "Staff Admin",
        "description": "Administrative role for staff and governance assignments.",
        "is_system": True,
        "permission_names": ["staff:read", "staff:write", "staff:delete", "governance:read", "governance:write"],
    },
    {
        "name": "system_admin",
        "display_name": "System Admin",
        "description": "Administrative role for users, roles, permissions, audit logs, settings, integrations, and notifications.",
        "is_system": True,
        "permission_names": [
            "users:read",
            "users:write",
            "users:delete",
            "roles:read",
            "roles:write",
            "roles:delete",
            "permissions:read",
            "permissions:write",
            "audit:read",
            "settings:read",
            "settings:write",
            "api_keys:read",
            "api_keys:write",
            "api_keys:delete",
            "webhooks:read",
            "webhooks:write",
            "webhooks:delete",
            "notifications:read",
            "notifications:write",
            "notifications:delete",
            "notifications:send",
        ],
    },
    {
        "name": "publications_admin",
        "display_name": "Publications Admin",
        "description": "Administrator for publications submissions, review, and approval.",
        "is_system": True,
        "permission_names": [
            "publications.manage",
            "publications.view",
            "publications.submit",
            "publications.review",
            "publications.approve",
        ],
    },
    {
        "name": "student_clubs_admin",
        "display_name": "Student Clubs Admin",
        "description": "Administrator for student club profiles and club-scoped content submission.",
        "is_system": True,
        "permission_names": [
            "clubs.view",
            "clubs.manage_own",
            "clubs.content_submit",
            "clubs.events_manage",
            "clubs.stories_manage",
        ],
    },
]

_permission_names = {spec[0] for spec in PERMISSION_SPECS}
_existing_role_names = {spec["name"] for spec in ROLE_SPECS}
for role_name, definition in ROLE_DEFINITIONS.items():
    seed_name = role_name.replace("-", "_")
    if seed_name in _existing_role_names:
        continue
    permission_names = [scope for scope in definition.scopes if scope in _permission_names]
    if not permission_names:
        continue
    ROLE_SPECS.append({
        "name": seed_name,
        "display_name": definition.name.replace("-", " ").title(),
        "description": definition.description,
        "is_system": True,
        "permission_names": permission_names,
    })
    _existing_role_names.add(seed_name)


async def seed_rbac(db: AsyncSession, ctx: SeedContext) -> None:
    for name, description, resource, action in PERMISSION_SPECS:
        await upsert_permission(
            db,
            ctx,
            name=name,
            description=description,
            resource=resource,
            action=action,
            is_active=True,
        )

    for spec in ROLE_SPECS:
        role = await upsert_role(
            db,
            ctx,
            name=spec["name"],
            display_name=spec["display_name"],
            description=spec["description"],
            is_system=spec["is_system"],
            is_active=True,
        )
        for permission_name in spec["permission_names"]:
            await upsert_role_permission(db, role, ctx.permissions[permission_name])
        if spec["name"] in RECONCILED_ROLE_NAMES:
            await _reconcile_role_permissions(
                db,
                role,
                {ctx.permissions[permission_name].id for permission_name in spec["permission_names"]},
            )


async def _reconcile_role_permissions(
    db: AsyncSession,
    role: Role,
    permitted_permission_ids: set[uuid.UUID],
) -> None:
    result = await db.execute(
        select(RolePermission).where(RolePermission.role_id == role.id)
    )
    for role_permission in result.scalars():
        if role_permission.permission_id not in permitted_permission_ids:
            await db.delete(role_permission)
    await db.flush()
