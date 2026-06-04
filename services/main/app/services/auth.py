"""Authentication service."""

from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timedelta, timezone
from hashlib import sha256

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common.cache import get_redis

from ..helpers.jwt import create_token, decode_token, refresh_token as issue_refreshed_tokens
from ..helpers.password import hash_password, verify_password
from ..core.config import get_settings
from ..models import Session, User
from ..tasks.email import queue_password_reset_email, queue_verification_email
from .user import UserService

settings = get_settings()


def _normalize_role(role: str) -> str:
    return role.strip().lower().replace("_", "-")


def _active_roles(user: User) -> list[str]:
    return [_normalize_role(role) for role in user.roles]


def _active_permissions(user: User) -> list[str]:
    permissions: list[str] = []
    seen: set[str] = set()
    for assignment in user.role_assignments:
        if not assignment.is_active or assignment.role is None or not assignment.role.is_active:
            continue
        for role_permission in assignment.role.role_permissions:
            permission = role_permission.permission
            if permission is None or not permission.is_active:
                continue
            name = permission.name.strip().lower()
            if name and name not in seen:
                seen.add(name)
                permissions.append(name)
    return permissions


class AuthService:
    """Authentication operations."""

    @staticmethod
    async def login(db: AsyncSession, email: str, password: str) -> tuple[User, str, str]:
        user = await UserService.get_by_email(db, email)
        if user is None or not verify_password(password, user.password_hash):
            raise PermissionError("Invalid credentials")
        if not user.is_active:
            raise PermissionError("User account is inactive")
        if user.is_locked:
            raise PermissionError("User account is locked")

        roles = _active_roles(user)
        permissions = _active_permissions(user)
        access_token, refresh_token, jti = create_token(
            str(user.id),
            roles,
            permissions=permissions,
            scopes=permissions,
        )
        session = Session(
            user_id=user.id,
            jti=jti,
            token_type="refresh",
            expires_at=datetime.now(timezone.utc) + timedelta(days=7),
            is_active=True,
        )
        user.last_login_at = datetime.now(timezone.utc)
        user.failed_login_attempts = 0
        db.add(session)
        await db.flush()
        return user, access_token, refresh_token

    @staticmethod
    async def refresh_token(db: AsyncSession, refresh_token: str) -> tuple[str, str]:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise PermissionError("Invalid refresh token")
        user = await UserService.get_by_id(db, uuid.UUID(payload["sub"]))
        if user is None or not user.is_active:
            raise PermissionError("User not found or inactive")
        result = await db.execute(select(Session).where(Session.jti == payload["jti"], Session.user_id == user.id))
        session = result.scalar_one_or_none()
        if session is None or not session.is_valid():
            raise PermissionError("Session is invalid")
        roles = _active_roles(user)
        permissions = _active_permissions(user)
        access_token, new_refresh_token = issue_refreshed_tokens(
            str(user.id),
            roles,
            session.jti,
            permissions=permissions,
            scopes=permissions,
        )
        session.touch()
        await db.flush()
        return access_token, new_refresh_token

    @staticmethod
    async def logout(db: AsyncSession, user_id: uuid.UUID, jti: str) -> None:
        result = await db.execute(select(Session).where(Session.user_id == user_id, Session.jti == jti))
        session = result.scalar_one_or_none()
        if session is None:
            raise ValueError("Session not found")
        session.revoke("logout")
        await db.flush()

    @staticmethod
    async def logout_all(db: AsyncSession, user_id: uuid.UUID) -> int:
        result = await db.execute(
            update(Session)
            .where(Session.user_id == user_id, Session.is_active.is_(True))
            .values(
                revoked_at=datetime.now(timezone.utc),
                revoked_reason="logout_all",
                is_active=False,
            )
            .returning(Session.id)
        )
        rows = result.fetchall()
        return len(rows)

    @staticmethod
    async def request_password_reset(
        db: AsyncSession,
        email: str,
        *,
        frontend_service: str | None = None,
        ip_address: str | None = None,
    ) -> None:
        await AuthService._enforce_password_reset_rate_limit(email=email, ip_address=ip_address)
        user = await UserService.get_by_email(db, email)
        if user is None:
            return
        token = secrets.token_urlsafe(32)
        user.password_reset_token = token
        user.password_reset_expires = datetime.now(timezone.utc) + timedelta(hours=settings.PASSWORD_RESET_TOKEN_TTL_HOURS)
        await db.flush()
        queue_password_reset_email.delay(user.email, token, frontend_service)

    @staticmethod
    async def reset_password(db: AsyncSession, token: str, new_password: str) -> None:
        result = await db.execute(select(User).where(User.password_reset_token == token))
        user = result.scalar_one_or_none()
        if user is None or user.password_reset_expires is None or user.password_reset_expires < datetime.now(timezone.utc):
            raise ValueError("Invalid or expired reset token")
        user.password_hash = hash_password(new_password)
        user.password_reset_token = None
        user.password_reset_expires = None
        await AuthService.logout_all(db, user.id)
        await db.flush()

    @staticmethod
    async def verify_email(db: AsyncSession, token: str) -> User:
        result = await db.execute(select(User).where(User.email_verification_token == token))
        user = result.scalar_one_or_none()
        if user is None:
            raise ValueError("Invalid verification token")
        user.is_verified = True
        user.email_verified_at = datetime.now(timezone.utc)
        user.email_verification_token = None
        await db.flush()
        return user

    @staticmethod
    async def change_password(db: AsyncSession, user: User, old_pw: str, new_pw: str) -> None:
        if not verify_password(old_pw, user.password_hash):
            raise PermissionError("Current password is incorrect")
        user.password_hash = hash_password(new_pw)
        await AuthService.logout_all(db, user.id)
        await db.flush()

    @staticmethod
    async def create_verification_token(db: AsyncSession, user: User) -> str:
        token = secrets.token_urlsafe(32)
        user.email_verification_token = token
        await db.flush()
        queue_verification_email.delay(user.email, token)
        return token

    @staticmethod
    async def _enforce_password_reset_rate_limit(*, email: str, ip_address: str | None = None) -> None:
        client = await get_redis()
        window = settings.PASSWORD_RESET_RATE_LIMIT_WINDOW_SECONDS
        limit = settings.PASSWORD_RESET_RATE_LIMIT_COUNT
        email_hash = sha256(email.lower().encode()).hexdigest()[:24]
        keys = [f"auth:pwreset:email:{email_hash}"]
        if ip_address:
            keys.append(f"auth:pwreset:ip:{ip_address}")

        for key in keys:
            current = await client.incr(key)
            if current == 1:
                await client.expire(key, window)
            if current > limit:
                raise PermissionError("Too many password reset requests. Please try again later.")
