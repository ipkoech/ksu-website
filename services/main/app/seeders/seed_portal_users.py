"""Seed role-specific users for admin portal browser QA."""

from __future__ import annotations

import os
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import StaffAssignment, User, UserRole

from ._shared import (
    LEADERSHIP_PEOPLE,
    SCHOOL_SPECS,
    SeedContext,
    get_or_create_person,
    upsert_user,
    upsert_user_role,
    upsert_role_permission,
)


PORTAL_USER_SPECS = [
    {
        "key": "portal_super_admin",
        "email": "system.admin@ksu.dev.com",
        "full_name": "KSU Super Admin",
        "role": "super_admin",
        "institutional_role": "super_admin",
    },
    {
        "key": "portal_system_admin",
        "email": "admin@ksu.dev.com",
        "full_name": "KSU Admin",
        "role": "admin",
        "institutional_role": "admin",
    },
    {
        "key": "portal_school_admin",
        "email": "school.admin@ksu.dev.com",
        "full_name": "KSU School Admin",
        "role": "school_admin",
        "institutional_role": "school_admin",
    },
    {
        "key": "portal_department_admin",
        "email": "department.admin@ksu.dev.com",
        "full_name": "KSU Department Admin",
        "role": "dept_admin",
        "institutional_role": "department_admin",
    },
    {
        "key": "portal_corporate_admin",
        "email": "corporate.admin@ksu.dev.com",
        "full_name": "KSU Corporate Communication Admin",
        "role": "corporate_communication_admin",
        "institutional_role": "corporate_communication_admin",
    },
    {
        "key": "portal_research_admin",
        "email": "research.admin@ksu.dev.com",
        "full_name": "KSU Research Admin",
        "role": "research_admin",
        "institutional_role": "research_admin",
    },
    {
        "key": "portal_library_admin",
        "email": "library.admin@ksu.dev.com",
        "full_name": "KSU Library Admin",
        "role": "library_admin",
        "institutional_role": "library_admin",
    },
]

SCHOOL_DEAN_PORTAL_USER_SPECS = [
    {
        "key": f"school_dean_{school_spec['code'].lower()}",
        "school_code": school_spec["code"],
        "dean_key": school_spec["dean_key"],
        "role": "school_admin",
    }
    for school_spec in SCHOOL_SPECS
]

PORTAL_ROLE_EXTRA_PERMISSIONS = {
    "school_admin": [
        "content.manage_news",
        "content.manage_events",
    ],
    "dept_admin": [
        "content.manage_events",
    ],
}

LEGACY_PORTAL_USER_EMAILS = frozenset({
    "super.admin@ksu.dev.com",
    "governance.admin@ksu.dev.com",
    "research.content@ksu.dev.com",
    "research.farm@ksu.dev.com",
    "research.sustainability@ksu.dev.com",
    "publications.admin@ksu.dev.com",
    "student.clubs.admin@ksu.dev.com",
    "researcher@ksu.dev.com",
    "staff.profile@ksu.dev.com",
})


def portal_user_password() -> str:
    password = os.getenv("KSU_SEED_PORTAL_USER_PASSWORD")
    if not password:
        raise RuntimeError(
            "KSU_SEED_PORTAL_USER_PASSWORD must be set before seeding portal users"
        )
    return password


async def seed_portal_users(db: AsyncSession, ctx: SeedContext) -> None:
    password = portal_user_password()
    await _retire_legacy_portal_users(db)
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
            password=password,
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

        await _reconcile_portal_user_role_assignments(db, user, role.id)

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
            scope_type=None,
            scope_id=None,
            note="Seeded portal-specific assignment for browser QA",
        )

    await _seed_school_dean_portal_users(db, ctx, password)


async def _seed_school_dean_portal_users(
    db: AsyncSession,
    ctx: SeedContext,
    password: str,
) -> None:
    role = ctx.roles.get("school_admin")
    if role is None:
        raise ValueError("school_admin role must be seeded before dean portal users")

    for spec in SCHOOL_DEAN_PORTAL_USER_SPECS:
        school = ctx.schools.get(spec["school_code"])
        if school is None:
            raise ValueError(f"{spec['school_code']} school must be seeded before dean portal users")

        dean_spec = LEADERSHIP_PEOPLE[spec["dean_key"]]
        person = await get_or_create_person(db, ctx, spec["dean_key"], **dean_spec)
        user = await upsert_user(
            db,
            ctx,
            spec["key"],
            email=person.email,
            password=password,
            full_name=person.full_name,
            phone=person.phone,
            avatar_url=None,
            push_tokens=None,
            is_active=True,
            is_verified=True,
            mfa_enabled=False,
            mfa_secret=None,
            failed_login_attempts=0,
        )
        person.user_id = user.id

        assignment = ctx.assignments.get(f"school-{spec['school_code']}-dean")
        if assignment is None:
            assignment = (
                await db.execute(
                    select(StaffAssignment).where(
                        StaffAssignment.entity_type == "school",
                        StaffAssignment.entity_id == school.id,
                        StaffAssignment.role == "dean",
                        StaffAssignment.status == "active",
                        StaffAssignment.deleted_at.is_(None),
                    )
                )
            ).scalar_one_or_none()
        if assignment is not None:
            assignment.person_id = person.id
            assignment.user_id = user.id

        await upsert_user_role(
            db,
            user,
            role,
            assigned_by_id=user.id,
            scope_type="school",
            scope_id=school.id,
            note=f"Seeded school admin assignment for {school.name}",
        )


async def _retire_legacy_portal_users(db: AsyncSession) -> None:
    """Deactivate portal QA accounts removed from the canonical seven-user seed."""
    legacy_users = (
        await db.execute(select(User).where(User.email.in_(LEGACY_PORTAL_USER_EMAILS)))
    ).scalars().all()
    if not legacy_users:
        return

    for user in legacy_users:
        user.is_active = False

    assignments = (
        await db.execute(select(UserRole).where(UserRole.user_id.in_({user.id for user in legacy_users})))
    ).scalars().all()
    for assignment in assignments:
        assignment.is_active = False
    await db.flush()


async def _reconcile_portal_user_role_assignments(
    db: AsyncSession,
    user: User,
    canonical_role_id: uuid.UUID,
) -> None:
    """Leave each seeded portal account with only its canonical global role active."""
    assignments = (
        await db.execute(select(UserRole).where(UserRole.user_id == user.id))
    ).scalars().all()
    for assignment in assignments:
        if (
            assignment.role_id != canonical_role_id
            or assignment.scope_type is not None
            or assignment.scope_id is not None
        ):
            assignment.is_active = False
    await db.flush()
