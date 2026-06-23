"""Seed a test super-admin user."""

from __future__ import annotations

import os

from sqlalchemy.ext.asyncio import AsyncSession

from ._shared import (
    SeedContext,
    get_or_create_person,
    upsert_user,
    upsert_user_role,
)


def test_admin_seed_credentials() -> tuple[str, str]:
    email = os.getenv("KSU_SEED_TEST_ADMIN_EMAIL", "test.admin@example.invalid")
    password = os.getenv("KSU_SEED_TEST_ADMIN_PASSWORD")
    if not password:
        raise RuntimeError(
            "KSU_SEED_TEST_ADMIN_PASSWORD must be set before seeding the test admin"
        )
    return email, password


async def seed_test_user(db: AsyncSession, ctx: SeedContext) -> None:
    email, password = test_admin_seed_credentials()
    person = await get_or_create_person(
        db,
        ctx,
        "test_super_admin_person",
        **{
            "full_name": "KSU Test Admin",
            "title": "Mr.",
            "institutional_role": "system_super_admin",
            "bio": "Seeded test administrator account for the Main service.",
            "email": email,
        },
    )

    user = await upsert_user(
        db,
        ctx,
        "test_super_admin",
        email=email,
        password=password,
        full_name="KSU Test Admin",
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

    role = ctx.roles.get("super_admin")
    if role is None:
        raise ValueError("super_admin role must be seeded before the test user")

    await upsert_user_role(
        db,
        user,
        role,
        assigned_by_id=user.id,
        note="Seeded super admin assignment for test access",
    )
