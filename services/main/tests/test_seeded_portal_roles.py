import asyncio
import uuid
from unittest.mock import AsyncMock, patch

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models import Permission, Role, RolePermission, User, UserRole
from app.seeders._shared import SeedContext
from app.seeders import seed_portal_users, seed_rbac


def test_seeded_portal_users_are_canonical():
    assert {item["email"] for item in seed_portal_users.PORTAL_USER_SPECS} == {
        "system.admin@ksu.dev.com",
        "admin@ksu.dev.com",
        "corporate.admin@ksu.dev.com",
        "research.admin@ksu.dev.com",
        "school.admin@ksu.dev.com",
        "department.admin@ksu.dev.com",
        "library.admin@ksu.dev.com",
    }


def test_primary_roles_are_canonical():
    roles_by_name = {item["name"]: item for item in seed_rbac.ROLE_SPECS}

    assert "cocms_admin" not in roles_by_name
    assert "corporate_communication_admin" in roles_by_name
    assert "publications_admin" not in roles_by_name
    assert {
        "publications.manage",
        "publications.view",
        "publications.submit",
        "publications.review",
        "publications.approve",
    }.issubset(roles_by_name["research_admin"]["permission_names"])


def test_reseeding_retires_persisted_legacy_portal_roles_and_users(monkeypatch):
    monkeypatch.setenv("KSU_SEED_PORTAL_USER_PASSWORD", "seeded-portal-password")
    asyncio.run(_assert_reseed_convergence())


async def _assert_reseed_convergence():
    legacy_role_names = ("cocms_admin", "publications_admin", "student_clubs_admin")
    legacy_user_emails = (
        "super.admin@ksu.dev.com",
        "governance.admin@ksu.dev.com",
        "research.content@ksu.dev.com",
        "research.farm@ksu.dev.com",
        "research.sustainability@ksu.dev.com",
        "publications.admin@ksu.dev.com",
        "student.clubs.admin@ksu.dev.com",
        "researcher@ksu.dev.com",
        "staff.profile@ksu.dev.com",
    )

    async with AsyncSessionLocal() as db:
        try:
            legacy_permission = (
                await db.execute(
                    select(Permission).where(Permission.name == "seed_test.legacy_portal_authority")
                )
            ).scalar_one_or_none()
            if legacy_permission is None:
                legacy_permission = Permission(
                    id=uuid.uuid4(),
                    name="seed_test.legacy_portal_authority",
                    description="Legacy portal authority used by reseed regression coverage.",
                    resource="seed_test",
                    action="legacy_portal_authority",
                    is_active=True,
                )
                db.add(legacy_permission)

            legacy_roles = []
            for name in legacy_role_names:
                role = (
                    await db.execute(select(Role).where(Role.name == name))
                ).scalar_one_or_none()
                if role is None:
                    role = Role(
                        id=uuid.uuid4(),
                        name=name,
                        display_name=name,
                        description="Legacy seeded portal role.",
                        is_system=True,
                        is_active=True,
                    )
                    db.add(role)
                else:
                    role.is_active = True
                    role.deleted_at = None
                legacy_roles.append(role)
            await db.flush()

            for role in legacy_roles:
                existing_assignment = (
                    await db.execute(
                        select(RolePermission).where(
                            RolePermission.role_id == role.id,
                            RolePermission.permission_id == legacy_permission.id,
                        )
                    )
                ).scalar_one_or_none()
                if existing_assignment is None:
                    db.add(
                        RolePermission(
                            id=uuid.uuid4(),
                            role_id=role.id,
                            permission_id=legacy_permission.id,
                        )
                    )

            legacy_users = []
            for email in legacy_user_emails:
                user = (
                    await db.execute(select(User).where(User.email == email))
                ).scalar_one_or_none()
                if user is None:
                    user = User(
                        id=uuid.uuid4(),
                        email=email,
                        password_hash="legacy-seed-password-hash",
                        full_name="Legacy Seeded Portal User",
                        is_active=True,
                    )
                    db.add(user)
                else:
                    user.is_active = True
                    user.deleted_at = None
                legacy_users.append(user)
            await db.flush()
            db.add_all(
                UserRole(
                    id=uuid.uuid4(),
                    user_id=user.id,
                    role_id=legacy_roles[index % len(legacy_roles)].id,
                    is_active=True,
                )
                for index, user in enumerate(legacy_users)
            )

            prior_system_admin = (
                await db.execute(select(User).where(User.email == "system.admin@ksu.dev.com"))
            ).scalar_one_or_none()
            if prior_system_admin is None:
                prior_system_admin = User(
                    id=uuid.uuid4(),
                    email="system.admin@ksu.dev.com",
                    password_hash="legacy-seed-password-hash",
                    full_name="Legacy System Admin",
                    is_active=True,
                )
                db.add(prior_system_admin)
                await db.flush()

            ctx = SeedContext()
            await seed_rbac.seed_rbac(db, ctx)
            admin = ctx.roles["admin"]
            db.add(UserRole(
                id=uuid.uuid4(),
                user_id=prior_system_admin.id,
                role_id=admin.id,
                is_active=True,
            ))
            await db.flush()

            with patch.object(
                seed_portal_users,
                "_seed_school_dean_portal_users",
                AsyncMock(),
            ):
                await seed_portal_users.seed_portal_users(db, ctx)

            retired_roles = (
                await db.execute(select(Role).where(Role.name.in_(legacy_role_names)))
            ).scalars().all()
            assert len(retired_roles) == len(legacy_role_names)
            assert all(not role.is_active for role in retired_roles)

            retired_role_ids = {role.id for role in retired_roles}
            assert not (
                await db.execute(select(RolePermission).where(RolePermission.role_id.in_(retired_role_ids)))
            ).scalars().all()
            assert all(
                not assignment.is_active
                for assignment in (
                    await db.execute(select(UserRole).where(UserRole.role_id.in_(retired_role_ids)))
                ).scalars().all()
            )

            retired_users = (
                await db.execute(select(User).where(User.email.in_(legacy_user_emails)))
            ).scalars().all()
            assert len(retired_users) == len(legacy_user_emails)
            assert all(not user.is_active for user in retired_users)
            assert all(
                not assignment.is_active
                for assignment in (
                    await db.execute(
                        select(UserRole).where(UserRole.user_id.in_({user.id for user in retired_users}))
                    )
                ).scalars().all()
            )

            system_admin = (
                await db.execute(select(User).where(User.email == "system.admin@ksu.dev.com"))
            ).scalar_one()
            active_system_admin_roles = (
                await db.execute(
                    select(Role.name)
                    .join(UserRole, UserRole.role_id == Role.id)
                    .where(UserRole.user_id == system_admin.id, UserRole.is_active.is_(True))
                )
            ).scalars().all()
            assert active_system_admin_roles == ["super_admin"]
        finally:
            await db.rollback()
