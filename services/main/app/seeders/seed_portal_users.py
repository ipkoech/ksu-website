"""Seed role-specific users for admin portal browser QA."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from ._shared import (
    SeedContext,
    get_or_create_person,
    upsert_user,
    upsert_user_role,
    upsert_role_permission,
)


PORTAL_USER_SPECS = [
    {
        "key": "portal_system_admin",
        "email": "system.admin@kisiiuniversity.ac.ke",
        "full_name": "KSU System Admin",
        "role": "system_admin",
        "institutional_role": "system_admin",
    },
    {
        "key": "portal_governance_admin",
        "email": "governance.admin@kisiiuniversity.ac.ke",
        "full_name": "KSU Governance Admin",
        "role": "staff_admin",
        "institutional_role": "governance_admin",
    },
    {
        "key": "portal_school_admin",
        "email": "school.admin@kisiiuniversity.ac.ke",
        "full_name": "KSU School Admin",
        "role": "school_admin",
        "institutional_role": "school_admin",
    },
    {
        "key": "portal_department_admin",
        "email": "department.admin@kisiiuniversity.ac.ke",
        "full_name": "KSU Department Admin",
        "role": "dept_admin",
        "institutional_role": "department_admin",
    },
    {
        "key": "portal_corporate_admin",
        "email": "corporate.admin@kisiiuniversity.ac.ke",
        "full_name": "KSU Corporate Communication Admin",
        "role": "content_admin",
        "institutional_role": "corporate_communication_admin",
    },
    {
        "key": "portal_research_admin",
        "email": "research.admin@kisiiuniversity.ac.ke",
        "full_name": "KSU Research Admin",
        "role": "research_admin",
        "institutional_role": "research_admin",
    },
    {
        "key": "portal_library_admin",
        "email": "library.admin@kisiiuniversity.ac.ke",
        "full_name": "KSU Library Admin",
        "role": "library_admin",
        "institutional_role": "library_admin",
    },
    {
        "key": "portal_researcher",
        "email": "researcher@kisiiuniversity.ac.ke",
        "full_name": "KSU Researcher",
        "role": "researcher",
        "institutional_role": "researcher",
    },
]

PORTAL_USER_PASSWORD = "ChangeMe123!"

PORTAL_ROLE_EXTRA_PERMISSIONS = {
    "school_admin": [
        "content.manage_news",
        "content.manage_events",
    ],
    "dept_admin": [
        "content.manage_events",
    ],
}


async def seed_portal_users(db: AsyncSession, ctx: SeedContext) -> None:
    for spec in PORTAL_USER_SPECS:
        person = await get_or_create_person(
            db,
            ctx,
            f"{spec['key']}_person",
            full_name=spec["full_name"],
            institutional_role=spec["institutional_role"],
            bio="Seeded portal-specific account for admin portal browser QA.",
            email=spec["email"],
            is_researcher=spec["role"] == "researcher",
        )

        user = await upsert_user(
            db,
            ctx,
            spec["key"],
            email=spec["email"],
            password=PORTAL_USER_PASSWORD,
            full_name=spec["full_name"],
            phone=None,
            avatar_url=None,
            push_tokens=None,
            is_active=True,
            is_verified=True,
            mfa_enabled=False,
            mfa_secret=None,
            failed_login_attempts=0,
        )
        person.user_id = user.id
        await db.flush()

        role = ctx.roles.get(spec["role"])
        if role is None:
            raise ValueError(f"{spec['role']} role must be seeded before portal users")

        for permission_name in PORTAL_ROLE_EXTRA_PERMISSIONS.get(spec["role"], []):
            permission = ctx.permissions.get(permission_name)
            if permission is None:
                raise ValueError(f"{permission_name} permission must be seeded before portal users")
            await upsert_role_permission(db, role, permission)

        await upsert_user_role(
            db,
            user,
            role,
            assigned_by_id=user.id,
            note="Seeded portal-specific assignment for browser QA",
        )
