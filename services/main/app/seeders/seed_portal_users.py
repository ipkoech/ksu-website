"""Seed role-specific users for admin portal browser QA."""

from __future__ import annotations

import os
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Club, Role, User, UserRole

from ._shared import (
    SeedContext,
    get_or_create_person,
    upsert_user,
    upsert_user_role,
    upsert_role_permission,
)
from .seed_public_records import CLUB_SPECS


STUDENT_CLUBS_PORTAL_CLUB_SLUG = str(CLUB_SPECS[0]["slug"])


PORTAL_USER_SPECS = [
    {
        "key": "portal_super_admin",
        "email": "super.admin@example.invalid",
        "full_name": "KSU Super Admin",
        "role": "super_admin",
        "institutional_role": "super_admin",
    },
    {
        "key": "portal_system_admin",
        "email": "system.admin@example.invalid",
        "full_name": "KSU Admin",
        "role": "admin",
        "institutional_role": "admin",
    },
    {
        "key": "portal_governance_admin",
        "email": "governance.admin@example.invalid",
        "full_name": "KSU Governance Admin",
        "role": "admin",
        "institutional_role": "governance_admin",
    },
    {
        "key": "portal_school_admin",
        "email": "school.admin@example.invalid",
        "full_name": "KSU School Admin",
        "role": "school_admin",
        "institutional_role": "school_admin",
    },
    {
        "key": "portal_department_admin",
        "email": "department.admin@example.invalid",
        "full_name": "KSU Department Admin",
        "role": "dept_admin",
        "institutional_role": "department_admin",
    },
    {
        "key": "portal_corporate_admin",
        "email": "corporate.admin@example.invalid",
        "full_name": "KSU CoCMS Admin",
        "role": "cocms_admin",
        "institutional_role": "cocms_admin",
    },
    {
        "key": "portal_research_admin",
        "email": "research@kisiiuniversity.ac.ke",
        "full_name": "KSU Research Admin",
        "role": "research_admin",
        "institutional_role": "research_admin",
    },
    {
        "key": "portal_research_content",
        "email": "research.content@example.invalid",
        "full_name": "KSU Research Content",
        "role": "research_content",
        "institutional_role": "research_content",
    },
    {
        "key": "portal_research_farm",
        "email": "research.farm@example.invalid",
        "full_name": "KSU Research Farm",
        "role": "research_farm",
        "institutional_role": "research_farm",
    },
    {
        "key": "portal_research_sustainability",
        "email": "research.sustainability@example.invalid",
        "full_name": "KSU Research Sustainability",
        "role": "research_sustainability",
        "institutional_role": "research_sustainability",
    },
    {
        "key": "portal_library_admin",
        "email": "library.admin@example.invalid",
        "full_name": "KSU Library Admin",
        "role": "library_admin",
        "institutional_role": "library_admin",
    },
    {
        "key": "portal_publications_admin",
        "email": "publications.admin@example.invalid",
        "full_name": "KSU Publications Admin",
        "role": "publications_admin",
        "institutional_role": "publications_admin",
    },
    {
        "key": "portal_student_clubs_admin",
        "email": "student.clubs.admin@example.invalid",
        "full_name": "KSU Student Clubs Admin",
        "role": "student_clubs_admin",
        "institutional_role": "student_clubs_admin",
        "scope_type": "club",
        "scope_key": STUDENT_CLUBS_PORTAL_CLUB_SLUG,
    },
    {
        "key": "portal_researcher",
        "email": "researcher@example.invalid",
        "full_name": "KSU Researcher",
        "role": "researcher",
        "institutional_role": "researcher",
    },
    {
        "key": "portal_staff_profile_editor",
        "email": "staff.profile@example.invalid",
        "full_name": "KSU Staff Profile Editor",
        "role": "staff",
        "institutional_role": "staff_profile_editor",
    },
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


def portal_user_password() -> str:
    password = os.getenv("KSU_SEED_PORTAL_USER_PASSWORD")
    if not password:
        raise RuntimeError(
            "KSU_SEED_PORTAL_USER_PASSWORD must be set before seeding portal users"
        )
    return password


async def _resolve_portal_user_scope(
    db: AsyncSession,
    spec: dict[str, object],
) -> tuple[str | None, uuid.UUID | None]:
    scope_type = spec.get("scope_type")
    if scope_type is None:
        return None, None
    if scope_type != "club":
        raise ValueError(f"Unsupported portal user scope type: {scope_type}")

    scope_key = spec.get("scope_key")
    if not isinstance(scope_key, str):
        raise ValueError(f"Portal user scope key must be a string: {scope_key}")
    club = (
        await db.execute(select(Club).where(Club.slug == scope_key))
    ).scalar_one_or_none()
    if club is None:
        raise ValueError(f"Seeded club not found for portal user scope: {scope_key}")
    return scope_type, club.id


async def _reconcile_portal_user_role_scope(
    db: AsyncSession,
    user: User,
    role: Role,
    scope_type: str | None,
    scope_id: uuid.UUID | None,
) -> None:
    if scope_type is None:
        return

    result = await db.execute(
        select(UserRole).where(
            UserRole.user_id == user.id,
            UserRole.role_id == role.id,
        )
    )
    for assignment in result.scalars():
        if assignment.scope_type != scope_type or assignment.scope_id != scope_id:
            await db.delete(assignment)
    await db.flush()


async def seed_portal_users(db: AsyncSession, ctx: SeedContext) -> None:
    password = portal_user_password()
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

        for permission_name in PORTAL_ROLE_EXTRA_PERMISSIONS.get(spec["role"], []):
            permission = ctx.permissions.get(permission_name)
            if permission is None:
                raise ValueError(f"{permission_name} permission must be seeded before portal users")
            await upsert_role_permission(db, role, permission)

        scope_type, scope_id = await _resolve_portal_user_scope(db, spec)
        await _reconcile_portal_user_role_scope(
            db,
            user,
            role,
            scope_type,
            scope_id,
        )

        await upsert_user_role(
            db,
            user,
            role,
            assigned_by_id=user.id,
            scope_type=scope_type,
            scope_id=scope_id,
            note="Seeded portal-specific assignment for browser QA",
        )
