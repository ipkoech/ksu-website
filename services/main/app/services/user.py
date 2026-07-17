"""User service."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Sequence

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common import PaginatedResult

from ..helpers.password import hash_password
from ..models import Person, Role, RolePermission, User, UserRole
from ..tasks.email import queue_account_created_email
from ._base import apply_updates, ilike_any, paginate_query


SCHOOL_ADMINISTRATION_ROLE_NAMES = frozenset({"school_admin", "school_editor"})


class SchoolAdministrationRoleConflict(HTTPException):
    """Raised when a school administrator would become scoped to two schools."""

    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="School administrators and editors can be assigned to only one school",
        )


class UserService:
    """User CRUD operations."""

    @staticmethod
    def _auth_load_options():
        return (
            selectinload(User.person).selectinload(Person.assignments),
            selectinload(User.role_assignments)
            .selectinload(UserRole.role)
            .selectinload(Role.role_permissions)
            .selectinload(RolePermission.permission),
        )

    @staticmethod
    async def validate_school_administration_assignment(
        db: AsyncSession,
        *,
        user_id: uuid.UUID,
        role: Role,
        scope_type: str | None,
        scope_id: uuid.UUID | None,
    ) -> None:
        """Reject a second active school for school-admin/editor roles."""
        role_name = (role.name or "").strip().lower().replace("-", "_")
        if role_name not in SCHOOL_ADMINISTRATION_ROLE_NAMES:
            return
        if scope_type != "school" or scope_id is None:
            raise ValueError("school_admin and school_editor roles require a school scope")

        now = datetime.now(timezone.utc)
        result = await db.execute(
            select(UserRole)
            .join(Role, UserRole.role_id == Role.id)
            .where(
                UserRole.user_id == user_id,
                UserRole.is_active.is_(True),
                UserRole.deleted_at.is_(None),
                UserRole.scope_type == "school",
                UserRole.scope_id.is_not(None),
                Role.name.in_(SCHOOL_ADMINISTRATION_ROLE_NAMES),
                Role.is_active.is_(True),
                (UserRole.expires_at.is_(None) | (UserRole.expires_at > now)),
            )
        )
        existing_assignments = result.scalars().all()
        if any(assignment.scope_id != scope_id for assignment in existing_assignments):
            raise SchoolAdministrationRoleConflict()

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: uuid.UUID, *, load_options: Sequence = ()) -> User | None:
        query = select(User).options(*UserService._auth_load_options()).where(User.id == user_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str, *, load_options: Sequence = ()) -> User | None:
        query = (
            select(User)
            .options(*UserService._auth_load_options())
            .where(User.email == email.lower().strip())
        )
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, *, email: str, password: str, **kwargs) -> User:
        existing = await UserService.get_by_email(db, email)
        if existing is not None:
            raise ValueError("User with this email already exists")
        user = User(
            email=email.lower().strip(),
            password_hash=hash_password(password),
            **kwargs,
        )
        db.add(user)
        await db.flush()
        await db.refresh(user)
        queue_account_created_email.delay(user.email, user.full_name, password)
        return user

    @staticmethod
    async def update(db: AsyncSession, user: User, **kwargs) -> User:
        if "email" in kwargs and kwargs["email"] is not None:
            kwargs["email"] = kwargs["email"].lower().strip()
        if "password" in kwargs and kwargs["password"] is not None:
            kwargs["password_hash"] = hash_password(kwargs.pop("password"))
        apply_updates(user, **kwargs)
        await db.flush()
        await db.refresh(user)
        return user

    @staticmethod
    async def delete(db: AsyncSession, user: User) -> None:
        """Soft delete via account deactivation."""
        user.is_active = False
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 20,
        search: str | None = None,
        is_active: bool | None = None,
        role_name: str | None = None,
        sort: str = "created_at",
        order: str = "desc",
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(User).options(*UserService._auth_load_options())
        if load_options:
            query = query.options(*load_options)

        if search:
            query = query.where(ilike_any(search, User.email, User.full_name))
        if is_active is not None:
            query = query.where(User.is_active.is_(is_active))
        if role_name:
            query = query.join(User.role_assignments).join(Role).where(UserRole.is_active.is_(True))
            try:
                role_id = uuid.UUID(role_name)
            except ValueError:
                query = query.where(Role.name == role_name)
            else:
                query = query.where(Role.id == role_id)

        sort_col = getattr(User, sort, User.created_at)
        if order == "desc":
            query = query.order_by(sort_col.desc())
        else:
            query = query.order_by(sort_col.asc())

        return await paginate_query(db, query, page=page, per_page=per_page)
