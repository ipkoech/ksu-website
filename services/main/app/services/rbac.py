"""RBAC service."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common import PaginatedResult

from ..models import Permission, Role, RolePermission, UserRole
from ._base import apply_updates, ilike_any, paginate_query


class RBACService:
    """Role-based access control operations."""

    @staticmethod
    async def get_user_roles(db: AsyncSession, user_id: uuid.UUID) -> list[UserRole]:
        result = await db.execute(
            select(UserRole)
            .options(selectinload(UserRole.role))
            .where(UserRole.user_id == user_id, UserRole.is_active.is_(True))
        )
        return list(result.scalars().all())

    @staticmethod
    async def get_user_permissions(db: AsyncSession, user_id: uuid.UUID) -> set[str]:
        roles = await RBACService.get_user_roles(db, user_id)
        permissions: set[str] = set()
        for assignment in roles:
            if assignment.role:
                permissions.update(assignment.role.permissions)
        return permissions

    @staticmethod
    async def assign_role(
        db: AsyncSession,
        user_id: uuid.UUID,
        role_id: uuid.UUID,
        *,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
        granted_by_id: uuid.UUID,
        expires_at=None,
        note: str | None = None,
    ) -> UserRole:
        result = await db.execute(
            select(UserRole).where(
                UserRole.user_id == user_id,
                UserRole.role_id == role_id,
                UserRole.scope_type == scope_type,
                UserRole.scope_id == scope_id,
            )
        )
        existing = result.scalar_one_or_none()
        if existing:
            existing.is_active = True
            existing.assigned_by_id = granted_by_id
            if expires_at is not None:
                existing.expires_at = expires_at
            if note is not None:
                existing.note = note
            await db.flush()
            return existing
        assignment = UserRole(
            user_id=user_id,
            role_id=role_id,
            scope_type=scope_type,
            scope_id=scope_id,
            assigned_by_id=granted_by_id,
            expires_at=expires_at,
            note=note,
            is_active=True,
        )
        db.add(assignment)
        await db.flush()
        return assignment

    @staticmethod
    async def revoke_role(db: AsyncSession, user_role_id: uuid.UUID) -> None:
        assignment = await UserRole.get_by_id(db, user_role_id)
        if assignment is None:
            raise ValueError("User role assignment not found")
        assignment.is_active = False
        await db.flush()

    @staticmethod
    async def check_permission(
        db: AsyncSession,
        user_id: uuid.UUID,
        permission: str,
        scope_type: str | None = None,
        scope_id: uuid.UUID | None = None,
    ) -> bool:
        assignments = await RBACService.get_user_roles(db, user_id)
        for assignment in assignments:
            if not assignment.role or permission not in assignment.role.permissions:
                continue
            if scope_type is None:
                return True
            if assignment.scope_type == scope_type and assignment.scope_id == scope_id:
                return True
        return False

    @staticmethod
    async def list_roles(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        search: str | None = None,
        is_system: bool | None = None,
        include_inactive: bool = False,
    ) -> PaginatedResult:
        query = select(Role).options(
            selectinload(Role.role_permissions).selectinload(RolePermission.permission)
        )
        if not include_inactive:
            query = query.where(Role.is_active.is_(True))
        if search:
            query = query.where(ilike_any(search, Role.name, Role.display_name))
        if is_system is not None:
            query = query.where(Role.is_system.is_(is_system))
        query = query.order_by(Role.name.asc())
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def list_permissions(db: AsyncSession) -> list[Permission]:
        result = await db.execute(select(Permission).where(Permission.is_active.is_(True)).order_by(Permission.name.asc()))
        return list(result.scalars().all())

    @staticmethod
    async def get_role(db: AsyncSession, role_id: uuid.UUID) -> Role | None:
        result = await db.execute(select(Role).options(selectinload(Role.role_permissions).selectinload(RolePermission.permission)).where(Role.id == role_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def create_role(db: AsyncSession, **data) -> Role:
        role = Role(**data)
        db.add(role)
        await db.flush()
        return role

    @staticmethod
    async def update_role(db: AsyncSession, role: Role, **data) -> Role:
        apply_updates(role, **data)
        await db.flush()
        return role

    @staticmethod
    async def delete_role(db: AsyncSession, role: Role) -> None:
        role.is_active = False
        await db.flush()

    @staticmethod
    async def set_role_permissions(db: AsyncSession, role: Role, permission_names: list[str]) -> Role:
        result = await db.execute(
            select(Permission).where(Permission.name.in_(permission_names), Permission.is_active.is_(True))
        )
        permissions = list(result.scalars().all())
        permission_ids = {permission.id for permission in permissions}
        current = {rp.permission_id: rp for rp in role.role_permissions}

        role.role_permissions[:] = [
            rp for rp in role.role_permissions if rp.permission_id in permission_ids
        ]
        missing = [
            RolePermission(role_id=role.id, permission_id=permission.id)
            for permission in permissions
            if permission.id not in current
        ]
        role.role_permissions.extend(missing)
        await db.flush()
        return role

    @staticmethod
    async def get_permission(db: AsyncSession, permission_id: uuid.UUID) -> Permission | None:
        result = await db.execute(select(Permission).where(Permission.id == permission_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def create_permission(db: AsyncSession, **data) -> Permission:
        permission = Permission(**data)
        db.add(permission)
        await db.flush()
        return permission
