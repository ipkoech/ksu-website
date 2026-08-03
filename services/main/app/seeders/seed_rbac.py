"""Seed baseline RBAC permissions and roles."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Role, RolePermission, UserRole
from app.security.scopes import (
    SCHOOL_PORTAL_PERMISSION_NAMES,
    SCHOOL_PORTAL_VIEW_PERMISSION_NAMES,
)
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
    ("governance.manage_roles", "Manage governance role definitions", "governance", "manage_roles"),
    ("governance.manage_members", "Manage governance member appointments", "governance", "manage_members"),
    ("governance.manage_order", "Manage governance display order", "governance", "manage_order"),
    ("governance.review", "Review governance content", "governance", "review"),
    ("governance.approve", "Approve governance content", "governance", "approve"),
    ("governance.publish", "Publish governance content", "governance", "publish"),
    ("governance.archive", "Archive governance content", "governance", "archive"),
    ("media:upload", "Upload media assets", "media", "upload"),
    ("media:delete", "Delete media assets", "media", "delete"),
    ("media:manage", "Manage media folders and links", "media", "manage"),
    ("content.manage", "Manage public content records", "content", "manage"),
    ("content.manage_stories", "Manage public stories and contributor requests", "content", "manage_stories"),
    ("content.submit", "Submit public content for review", "content", "submit"),
    ("content.review", "Review submitted public content", "content", "review"),
    ("content.edit_submitted", "Edit submitted public content", "content", "edit_submitted"),
    ("content.approve", "Approve public content", "content", "approve"),
    ("content.schedule", "Schedule public content", "content", "schedule"),
    ("content.unpublish", "Unpublish public content", "content", "unpublish"),
    ("stories.submit", "Submit stories as an approved contributor", "stories", "submit"),
    ("stories.view_own", "View own submitted stories", "stories", "view_own"),
    ("stories.update_own", "Update own submitted stories before publication", "stories", "update_own"),
    ("about.manage", "Manage About KSU and institutional facts", "about", "manage"),
    ("clubs.view", "View student club records", "clubs", "view"),
    ("clubs.manage_own", "Manage assigned student club records", "clubs", "manage_own"),
    ("clubs.content_submit", "Submit student club content for review", "clubs", "content_submit"),
    ("clubs.events_manage", "Manage assigned student club events", "clubs", "events_manage"),
    ("clubs.stories_manage", "Manage assigned student club stories", "clubs", "stories_manage"),
]

VC_HUB_PERMISSION_NAMES = [
    "vc_hub.view",
    "vc_hub.manage",
    "vc_hub.review",
    "vc_hub.publish",
]
for permission_name in VC_HUB_PERMISSION_NAMES:
    _, action = permission_name.split(".", 1)
    PERMISSION_SPECS.append((
        permission_name,
        f"{action.replace('_', ' ').title()} Meet the Vice Chancellor content",
        "vc_hub",
        action,
    ))

for permission_name in SCHOOL_PORTAL_PERMISSION_NAMES:
    section, action = permission_name.removeprefix("school.").split(".", 1)
    PERMISSION_SPECS.append(
        (
            permission_name,
            f"{action.replace('_', ' ').title()} the School Portal {section.replace('_', ' ')} section",
            f"school.{section}",
            action,
        )
    )


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
    "about.manage",
    "content.view",
    "content.manage",
    "content.manage_stories",
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
    "stories.view_own",
    "stories.update_own",
    "media.view",
    "media.upload",
    "media.manage",
    "homepage.view",
    "homepage.manage",
    "homepage.publish",
    "life_around_studies.view",
    "life_around_studies.manage",
    "life_around_studies.review",
    "life_around_studies.publish",
    "page_sections.view",
    "page_sections.update",
    "page_sections.review",
    "page_sections.publish",
    "partnership_spotlights.manage",
    "marketing.view",
    "marketing.manage_sliders",
    "marketing.manage_testimonials",
    "marketing.manage_newsletters",
    "support.manage_faqs",
    "support.manage_contacts",
    "policy.view",
    "policy.view_drafts",
    "policy.manage",
    "policy.publish",
    *VC_HUB_PERMISSION_NAMES,
]

PUBLICATIONS_ADMIN_PERMISSION_NAMES = [
    "publications.manage",
    "publications.view",
    "publications.submit",
    "publications.review",
    "publications.approve",
]

LEGACY_PORTAL_ROLE_NAMES = frozenset({
    "cocms_admin",
    "publications_admin",
    "student_clubs_admin",
})


# Reconcile roles whose publication authority changed so stale grants are
# removed idempotently when existing databases are reseeded.
RECONCILED_ROLE_NAMES = frozenset({
    "content_admin",
    "content_manager",
    "library_admin",
    "research_content_admin",
    "research_content",
    "research_admin",
    "sustainability_admin",
    "research_sustainability",
    "university_farm_admin",
    "research_farm",
})


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
        "name": "school_admin",
        "display_name": "School Administrator",
        "description": "Full administration of one assigned school through the School Portal.",
        "is_system": True,
        "permission_names": list(SCHOOL_PORTAL_PERMISSION_NAMES),
    },
    {
        "name": "school_editor",
        "display_name": "School Editor",
        "description": "View access to one assigned school; additional actions are explicitly granted.",
        "is_system": True,
        "permission_names": list(SCHOOL_PORTAL_VIEW_PERMISSION_NAMES),
    },
    {
        "name": "content_admin",
        "display_name": "Content Admin (Legacy)",
        "description": "Legacy content administration role retained for CoCMS compatibility.",
        "is_system": True,
        "permission_names": COCMS_PERMISSION_NAMES,
    },
    {
        "name": "corporate_communication_admin",
        "display_name": "Corporate Communication Admin",
        "description": "Administrator for homepage CMS, public publishing, media, and communications review.",
        "is_system": True,
        "permission_names": COCMS_PERMISSION_NAMES,
    },
    {
        "name": "story_contributor",
        "display_name": "Story Contributor",
        "description": "Approved external contributor who can draft and submit public stories for review.",
        "is_system": True,
        "permission_names": ["content.submit", "stories.submit", "stories.view_own", "stories.update_own"],
    },
    {
        "name": "staff_admin",
        "display_name": "Staff Admin",
        "description": "Administrative role for staff and governance assignments.",
        "is_system": True,
        "permission_names": [
            "staff:read", "staff:write", "staff:delete", "governance:read", "governance:write",
            "governance.manage_roles", "governance.manage_members", "governance.manage_order",
            "governance.review", "governance.approve", "governance.publish", "governance.archive",
        ],
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

for spec in ROLE_SPECS:
    if spec["name"] == "research_admin":
        spec["permission_names"] = list(dict.fromkeys([
            *spec["permission_names"],
            *PUBLICATIONS_ADMIN_PERMISSION_NAMES,
        ]))
        break


for spec in ROLE_SPECS:
    for permission_name in spec["permission_names"]:
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

    await _retire_legacy_portal_roles(db)

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


async def _retire_legacy_portal_roles(db: AsyncSession) -> None:
    """Make roles removed from the portal seed model unable to grant access."""
    legacy_roles = (
        await db.execute(select(Role).where(Role.name.in_(LEGACY_PORTAL_ROLE_NAMES)))
    ).scalars().all()
    if not legacy_roles:
        return

    legacy_role_ids = {role.id for role in legacy_roles}
    for role in legacy_roles:
        role.is_active = False

    role_permissions = (
        await db.execute(select(RolePermission).where(RolePermission.role_id.in_(legacy_role_ids)))
    ).scalars().all()
    for role_permission in role_permissions:
        await db.delete(role_permission)

    assignments = (
        await db.execute(select(UserRole).where(UserRole.role_id.in_(legacy_role_ids)))
    ).scalars().all()
    for assignment in assignments:
        assignment.is_active = False
    await db.flush()


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
