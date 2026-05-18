"""FastAPI dependencies for Main service."""

from __future__ import annotations

import hashlib
import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, Header, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common import TokenPayload, get_current_user as get_current_token

from .core.database import get_session
from .models import ApiKey, Role, RolePermission, User, UserRole

security = HTTPBearer()


class ApiKeyUser:
    """Represents an API key user for authentication context."""

    def __init__(self, api_key: ApiKey, user: User | None = None):
        self.api_key = api_key
        self.user = user
        self.scopes = set(api_key.scopes or [])
        self.id = api_key.id
        self.is_active = api_key.is_active

    def has_scope(self, scope: str) -> bool:
        """Check if API key has the required scope."""
        scope_parts = scope.split(":")
        if len(scope_parts) == 2 and scope_parts[1] == "*":
            return any(s.startswith(f"{scope_parts[0]}:") for s in self.scopes)
        return scope in self.scopes


async def get_api_key_user(
    x_api_key: Annotated[str | None, Header(alias="X-API-Key")],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ApiKeyUser:
    """Validate API key from X-API-Key header."""
    if not x_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-API-Key header",
        )

    key_hash = hashlib.sha256(x_api_key.encode("utf-8")).hexdigest()

    result = await db.execute(
        select(ApiKey).where(
            ApiKey.key_hash == key_hash,
            ApiKey.is_active.is_(True),
        )
    )
    api_key = result.scalar_one_or_none()

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or inactive API key",
        )

    user = None
    if api_key.created_by_id:
        user_result = await db.execute(
            select(User).where(User.id == api_key.created_by_id, User.is_active.is_(True))
        )
        user = user_result.scalar_one_or_none()

    return ApiKeyUser(api_key, user)


def require_api_key_scope(scope: str):
    """Dependency factory for API key scope checking."""

    async def _check(
        api_key_user: Annotated[ApiKeyUser, Depends(get_api_key_user)],
    ) -> ApiKeyUser:
        if not api_key_user.has_scope(scope):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient API key privileges",
            )
        return api_key_user

    return _check


async def get_db():
    """Yield database session."""
    async for session in get_session():
        yield session


async def get_current_active_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Resolve the currently authenticated active user."""
    payload = await get_current_token(credentials)
    try:
        user_id = uuid.UUID(payload.sub)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject") from exc
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.person),
            selectinload(User.role_assignments)
            .selectinload(UserRole.role)
            .selectinload(Role.role_permissions)
            .selectinload(RolePermission.permission),
        )
        .where(User.id == user_id, User.deleted_at.is_(None))
    )
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive or missing user")
    return user


async def get_token_payload(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
) -> TokenPayload:
    """Expose the decoded JWT payload."""
    return await get_current_token(credentials)


def _has_permission(permissions: set[str], scope: str) -> bool:
    """Check if any permission grants the required scope."""
    scope_parts = scope.split(":")
    if len(scope_parts) == 2 and scope_parts[1] == "*":
        return any(perm.startswith(f"{scope_parts[0]}:") for perm in permissions)
    return scope in permissions


def require_scope(scope: str):
    """Dependency factory for scope checking using database permissions."""

    async def _check(
        payload: Annotated[TokenPayload, Depends(get_token_payload)],
        db: Annotated[AsyncSession, Depends(get_db)],
    ) -> TokenPayload:
        try:
            user_id = uuid.UUID(payload.sub)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token subject",
            )

        result = await db.execute(
            select(User)
            .options(
                selectinload(User.role_assignments)
                .selectinload(UserRole.role)
                .selectinload(Role.role_permissions)
                .selectinload(RolePermission.permission),
            )
            .where(User.id == user_id, User.is_active.is_(True), User.deleted_at.is_(None))
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )

        permissions = {
            rp.permission.name
            for assignment in user.role_assignments
            if assignment.is_active and assignment.role and assignment.role.is_active
            for rp in assignment.role.role_permissions
            if rp.permission and rp.permission.is_active
        }

        if not _has_permission(permissions, scope):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient privileges",
            )

        return payload

    return _check


DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_active_user)]
CurrentToken = Annotated[TokenPayload, Depends(get_token_payload)]
ApiKeyAuth = Annotated[ApiKeyUser, Depends(get_api_key_user)]
