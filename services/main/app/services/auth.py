"""Authentication service."""

from __future__ import annotations

import secrets
import uuid
from datetime import datetime, timedelta, timezone
from hashlib import sha256
import logging

from sqlalchemy import case, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import noload

from ksu_common.rate_limit import RateLimiter

from ..helpers.jwt import create_token, decode_token, refresh_token as issue_refreshed_tokens
from ..helpers.password import hash_password, verify_password
from ..core.config import get_settings
from ..models import Session, User
from ..core.database import AsyncSessionLocal
from ..security.scopes import user_scoped_grants
from ..tasks.email import queue_password_reset_email, queue_verification_email  # noqa: F401
from .domain_events import enqueue_email_event
from .user import UserService

settings = get_settings()
logger = logging.getLogger(__name__)

_LOGIN_RATE_LIMITER = RateLimiter(requests=5, window=60, prefix="main:auth-login")
_LOGIN_GLOBAL_RATE_LIMITER = RateLimiter(requests=60, window=60, prefix="main:auth-login-global")
_PASSWORD_RESET_EMAIL_RATE_LIMITER = RateLimiter(
    requests=settings.PASSWORD_RESET_RATE_LIMIT_COUNT,
    window=settings.PASSWORD_RESET_RATE_LIMIT_WINDOW_SECONDS,
    prefix="main:auth-password-reset-email",
)
_PASSWORD_RESET_IP_RATE_LIMITER = RateLimiter(
    requests=settings.PASSWORD_RESET_RATE_LIMIT_COUNT,
    window=settings.PASSWORD_RESET_RATE_LIMIT_WINDOW_SECONDS,
    prefix="main:auth-password-reset-ip",
)
_PASSWORD_RESET_TOKEN_RATE_LIMITER = RateLimiter(
    requests=10,
    window=300,
    prefix="main:auth-password-reset-token",
)
_PASSWORD_RESET_GLOBAL_RATE_LIMITER = RateLimiter(
    requests=30,
    window=300,
    prefix="main:auth-password-reset-global",
)


def _normalize_role(role: str) -> str:
    return role.strip().lower().replace("_", "-")


def _active_roles(user: User) -> list[str]:
    return [_normalize_role(role) for role in user.roles]


def _active_permissions(user: User) -> list[str]:
    permissions: list[str] = []
    seen: set[str] = set()
    for grant in user_scoped_grants(user):
        for permission in grant.permissions:
            name = permission.strip().lower()
            if name and name not in seen:
                seen.add(name)
                permissions.append(name)
    return permissions


def _active_scope_grants(user: User) -> list[dict[str, object]]:
    grants: list[dict[str, object]] = []
    for grant in user_scoped_grants(user):
        grants.append(
            {
                "permissions": sorted(grant.permissions),
                "scope_type": grant.scope_type,
                "scope_id": str(grant.scope_id) if grant.scope_id else None,
                "source": grant.source,
            }
        )
    return grants


def _token_digest(token: str) -> str:
    """Return the non-reversible database representation of a one-time token."""
    return sha256(token.encode("utf-8")).hexdigest()


class AuthService:
    """Authentication operations."""

    @staticmethod
    async def login(
        db: AsyncSession,
        email: str,
        password: str,
        *,
        ip_address: str | None = None,
        mfa_code: str | None = None,
    ) -> tuple[User, str, str]:
        await _LOGIN_GLOBAL_RATE_LIMITER.check("all", "POST:/auth/login/global")
        await _LOGIN_RATE_LIMITER.check(email.strip().lower(), "POST:/auth/login")
        # Keyed per address as well as per email, so one attacker cannot burn a
        # known account's budget and lock its owner out. Mirrors the password
        # reset limiter. Only meaningful once the proxy chain stops collapsing
        # every client to the edge address — see --forwarded-allow-ips.
        if ip_address:
            await _LOGIN_RATE_LIMITER.check(f"ip:{ip_address}", "POST:/auth/login/ip")
        user = await UserService.get_by_email(db, email)
        if user is None:
            raise PermissionError("Invalid credentials")
        if not user.is_active:
            raise PermissionError("User account is inactive")
        if user.is_locked:
            raise PermissionError("User account is locked")
        if not verify_password(password, user.password_hash):
            # The accounting write intentionally uses its own transaction so
            # the request rollback cannot erase it. Release this read session
            # first; otherwise a burst of failed logins can hold every pool
            # connection while waiting for an accounting connection.
            failed_user_id = user.id
            await db.rollback()
            await AuthService._record_failed_login(db, failed_user_id)
            raise PermissionError("Invalid credentials")

        roles = _active_roles(user)
        permissions = _active_permissions(user)
        scope_grants = _active_scope_grants(user)
        mfa_verified_at = None
        if user.mfa_enabled:
            from .mfa import verify_factor
            from fastapi import HTTPException

            if not mfa_code:
                raise HTTPException(401, "MFA code required")
            mfa_verified_at = await verify_factor(db, user.id, mfa_code)
        access_token, refresh_token, jti = create_token(
            str(user.id),
            roles,
            permissions=permissions,
            scope_grants=scope_grants,
        )
        session = Session(
            user_id=user.id,
            jti=jti,
            mfa_verified_at=mfa_verified_at,
            token_type="refresh",
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TTL_DAYS),
            is_active=True,
        )
        user.last_login_at = datetime.now(timezone.utc)
        user.failed_login_attempts = 0
        user.locked_until = None
        db.add(session)
        await db.flush()
        return user, access_token, refresh_token

    @staticmethod
    async def _record_failed_login(db: AsyncSession, user: User | uuid.UUID) -> None:
        """Commit lockout accounting independently of the failed request.

        The request transaction intentionally rolls back on PermissionError;
        using it here made every failed password invisible. A row-level atomic
        update prevents concurrent attempts from losing increments. ``db`` is
        retained in the signature for compatibility, but is not mutated.
        """
        del db
        user_id = getattr(user, "id", user)
        now = datetime.now(timezone.utc)
        attempts = User.failed_login_attempts + 1
        locked_until = case(
            (attempts >= settings.AUTH_LOGIN_MAX_ATTEMPTS,
             now + timedelta(minutes=settings.AUTH_LOGIN_LOCKOUT_MINUTES)),
            else_=User.locked_until,
        )
        async with AsyncSessionLocal.begin() as accounting_db:
            updated = await accounting_db.execute(
                update(User)
                .where(User.id == user_id, User.is_active.is_(True))
                .values(failed_login_attempts=attempts, locked_until=locked_until)
                .returning(User.failed_login_attempts, User.locked_until)
            )
            if updated.first() is None:
                logger.info("failed login accounting skipped for unavailable account", extra={
                    "event": "failed_login_account_missing",
                })

    @staticmethod
    async def refresh_token(db: AsyncSession, refresh_token: str) -> tuple[str, str]:
        try:
            payload = decode_token(refresh_token)
            token_type = payload.get("type")
            subject = uuid.UUID(str(payload["sub"]))
            raw_jti = payload["jti"]
            old_jti = raw_jti if isinstance(raw_jti, str) else ""
        except (KeyError, TypeError, ValueError):
            raise PermissionError("Invalid refresh token") from None
        if token_type != "refresh" or not old_jti:
            raise PermissionError("Invalid refresh token")
        user = await UserService.get_by_id(db, subject)
        if user is None or not user.is_active:
            raise PermissionError("User not found or inactive")
        # Serialize refresh attempts for one session. The second concurrent or
        # replayed request observes the revoked row after the first commits.
        result = await db.execute(
            select(Session)
            .where(Session.jti == old_jti, Session.user_id == user.id)
            .with_for_update()
        )
        session = result.scalar_one_or_none()
        if session is None or not session.is_valid():
            raise PermissionError("Session is invalid")
        roles = _active_roles(user)
        permissions = _active_permissions(user)
        scope_grants = _active_scope_grants(user)
        new_jti = str(uuid.uuid4())
        access_token, new_refresh_token = issue_refreshed_tokens(
            str(user.id),
            roles,
            new_jti,
            permissions=permissions,
            scope_grants=scope_grants,
        )
        session.revoke("refresh_rotation")
        db.add(
            Session(
                user_id=user.id,
                jti=new_jti,
                mfa_verified_at=session.mfa_verified_at,
                token_type="refresh",
                expires_at=datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TTL_DAYS),
                is_active=True,
            )
        )
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
        user.password_reset_token = _token_digest(token)
        user.password_reset_expires = datetime.now(timezone.utc) + timedelta(hours=settings.PASSWORD_RESET_TOKEN_TTL_HOURS)
        await db.flush()
        enqueue_email_event(
            db,
            event_type="auth.password_reset_email",
            user_id=user.id,
            payload={"args": [user.email, token, frontend_service]},
        )

    @staticmethod
    async def reset_password(db: AsyncSession, token: str, new_password: str) -> None:
        await _PASSWORD_RESET_GLOBAL_RATE_LIMITER.check(
            "all",
            "POST:/auth/reset-password/global",
        )
        token_hash = _token_digest(token)[:24]
        await _PASSWORD_RESET_TOKEN_RATE_LIMITER.check(
            token_hash,
            "POST:/auth/reset-password",
        )
        token_digest = _token_digest(token)
        # The plaintext comparison is a bounded compatibility path for
        # tokens issued before digest storage was introduced. New tokens are
        # always matched by their digest and are consumed under a row lock.
        result = await db.execute(
            select(User)
            .options(noload("*"))
            .where(User.password_reset_token.in_((token_digest, token)))
            .with_for_update()
        )
        user = result.scalar_one_or_none()
        if user is None or user.password_reset_expires is None or user.password_reset_expires < datetime.now(timezone.utc):
            raise ValueError("Invalid or expired reset token")
        user.password_hash = hash_password(new_password)
        user.password_reset_token = None
        user.password_reset_expires = None
        user.must_change_password = False
        await AuthService.logout_all(db, user.id)
        await db.flush()

    @staticmethod
    async def verify_email(db: AsyncSession, token: str) -> User:
        token_digest = _token_digest(token)
        result = await db.execute(
            select(User)
            .options(noload("*"))
            .where(User.email_verification_token.in_((token_digest, token)))
            .with_for_update()
        )
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
        user.must_change_password = False
        await AuthService.logout_all(db, user.id)
        await db.flush()

    @staticmethod
    async def create_verification_token(db: AsyncSession, user: User) -> str:
        token = secrets.token_urlsafe(32)
        user.email_verification_token = _token_digest(token)
        await db.flush()
        enqueue_email_event(
            db,
            event_type="auth.verification_email",
            user_id=user.id,
            payload={"args": [user.email, token]},
        )
        return token

    @staticmethod
    async def _enforce_password_reset_rate_limit(*, email: str, ip_address: str | None = None) -> None:
        email_hash = sha256(email.strip().lower().encode()).hexdigest()[:24]
        await _PASSWORD_RESET_EMAIL_RATE_LIMITER.check(
            email_hash,
            "POST:/auth/forgot-password/email",
        )
        if ip_address:
            await _PASSWORD_RESET_IP_RATE_LIMITER.check(
                ip_address,
                "POST:/auth/forgot-password/ip",
            )
