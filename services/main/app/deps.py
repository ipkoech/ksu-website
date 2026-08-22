"""FastAPI dependencies for Main service."""

from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, Header, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from ksu_common import TokenPayload, build_user_dependencies
from ksu_common.cache import get_redis
from ksu_contracts.rbac import authorize_permission, normalize_permission

from .core.config import get_settings
from .core.database import get_session
from .models import ApiKey, Person, Role, RolePermission, User, UserRole
from .security.role_assignments import is_role_assignment_current

security = HTTPBearer(auto_error=False)
settings = get_settings()
get_current_token = build_user_dependencies(
    public_key_b64=settings.JWT_PUBLIC_KEY_B64,
    algorithm=settings.JWT_ALGORITHM,
    issuer=settings.JWT_ISSUER,
    audience=settings.JWT_AUDIENCE,
    key_id=settings.JWT_KEY_ID,
).current_user


async def get_db():
    """Yield database session."""
    async for session in get_session():
        yield session


def _credentials_from_request(
    credentials: HTTPAuthorizationCredentials | None,
    access_cookie: str | None,
) -> HTTPAuthorizationCredentials:
    if credentials is not None:
        return credentials
    if access_cookie:
        return HTTPAuthorizationCredentials(scheme="Bearer", credentials=access_cookie)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")


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
        return _has_permission(self.scopes, scope)


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
    if api_key.expires_at is not None:
        expires_at = api_key.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at <= datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API key has expired",
            )

    await _enforce_api_key_rate_limit(api_key)
    api_key.last_used_at = datetime.now(timezone.utc)
    await db.flush()

    user = None
    if api_key.created_by_id:
        user_result = await db.execute(
            select(User).where(User.id == api_key.created_by_id, User.is_active.is_(True))
        )
        user = user_result.scalar_one_or_none()

    return ApiKeyUser(api_key, user)


async def _enforce_api_key_rate_limit(api_key: ApiKey) -> None:
    """Enforce per-key request limits over the configured API-key window."""
    try:
        redis = await get_redis()
        window = settings.API_KEY_RATE_LIMIT_WINDOW_SECONDS
        key = f"main:api-key:{api_key.id}:window"
        current = await redis.incr(key)
        if current == 1:
            await redis.expire(key, window)
        if current > api_key.rate_limit:
            ttl = await redis.ttl(key)
            retry_after = ttl if ttl and ttl > 0 else window
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="API key rate limit exceeded",
                headers={"Retry-After": str(retry_after)},
            )
    except HTTPException:
        raise
    except Exception:
        return None


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


async def get_current_active_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Annotated[AsyncSession, Depends(get_db)],
    access_cookie: Annotated[str | None, Cookie(alias="ksu_access")] = None,
) -> User:
    """Resolve the currently authenticated active user."""
    credentials = _credentials_from_request(credentials, access_cookie)
    payload = await get_current_token(credentials)
    try:
        user_id = uuid.UUID(payload.sub)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token subject") from exc
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.person).selectinload(Person.assignments),
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
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    access_cookie: Annotated[str | None, Cookie(alias="ksu_access")] = None,
) -> TokenPayload:
    """Expose the decoded JWT payload."""
    credentials = _credentials_from_request(credentials, access_cookie)
    return await get_current_token(credentials)


def _has_permission(permissions: set[str], scope: str) -> bool:
    """Check a permission using the shared, versioned backend policy."""
    return authorize_permission(permissions, scope).allowed


def permissions_for_user(user: User) -> set[str]:
    """Return active permission names granted to a loaded user."""
    return {
        normalize_permission(rp.permission.name)
        for assignment in user.role_assignments
        if is_role_assignment_current(assignment) and assignment.role and assignment.role.is_active
        for rp in assignment.role.role_permissions
        if rp.permission and rp.permission.is_active
    }


def user_has_scope(user: User, scope: str) -> bool:
    """Check whether a loaded user has a scope through active role permissions."""
    return _has_permission(permissions_for_user(user), scope)


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

        if not user_has_scope(user, scope):
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
