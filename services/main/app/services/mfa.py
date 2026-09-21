"""Authenticator enrollment and proof verification in the caller's transaction.

TOTP follows RFC 6238 with six digits, 30-second steps and one-step clock drift.
Account row locks serialize code consumption across login and step-up requests.
"""

import base64
import hashlib
import hmac
import secrets
import struct
from datetime import datetime, timedelta, timezone
from urllib.parse import quote

from cryptography.fernet import Fernet, InvalidToken
from fastapi import HTTPException
from ksu_common.rate_limit import RateLimiter
from sqlalchemy import select, update
from sqlalchemy.orm import noload

from ..core.config import get_settings
from ..helpers.password import verify_password
from ..models import Session, User

_LIMITER = RateLimiter(requests=5, window=300, prefix="main:mfa")


def _cipher():
    key = get_settings().MFA_ENCRYPTION_KEY
    try:
        if not key:
            raise ValueError("Missing key")
        return Fernet(key.encode("ascii"))
    except (ValueError, UnicodeError) as exc:
        raise HTTPException(503, "MFA key configuration unavailable") from exc


def _decrypt(value):
    try:
        return _cipher().decrypt(value.encode("ascii")).decode("ascii")
    except (InvalidToken, UnicodeError, AttributeError) as exc:
        raise HTTPException(503, "MFA credential unavailable") from exc


def totp(secret: str, counter: int, *, digits: int = 6) -> str:
    key = base64.b32decode(secret, casefold=True)
    digest = hmac.digest(key, struct.pack(">Q", counter), "sha1")
    offset = digest[-1] & 15
    value = struct.unpack(">I", digest[offset:offset + 4])[0] & 0x7fffffff
    return str(value % (10 ** digits)).zfill(digits)


def matching_counter(secret, code, now, previous=None):
    if not isinstance(code, str) or len(code) != 6 or not code.isascii() or not code.isdigit():
        return None
    current = int(now.timestamp()) // 30
    for counter in (current, current - 1, current + 1):
        if counter >= 0 and (previous is None or counter > previous) and hmac.compare_digest(totp(secret, counter), code):
            return counter
    return None


def _recovery_hash(user_id, code):
    return hashlib.sha256(f"mfa-recovery:{user_id}:{code}".encode()).hexdigest()


async def _locked_user(db, user_id):
    user = await db.scalar(select(User).options(noload("*")).where(
        User.id == user_id, User.deleted_at.is_(None), User.is_active.is_(True),
    ).with_for_update())
    if user is None:
        raise HTTPException(401, "Inactive or missing user")
    await db.refresh(user, attribute_names=["password_hash", "mfa_enabled", "mfa_secret",
                                           "mfa_pending_secret", "mfa_pending_expires_at",
                                           "mfa_last_counter", "mfa_recovery_hashes"])
    return user


async def begin_enrollment(db, user_id, password, *, current_code=None):
    await _LIMITER.check(str(user_id), "mfa-proof")
    user = await _locked_user(db, user_id)
    if not verify_password(password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    if user.mfa_enabled:
        if current_code is None:
            raise HTTPException(409, "MFA is already enabled")
        await verify_factor(db, user_id, current_code)
    elif current_code is not None:
        raise HTTPException(409, "No authenticator to replace")
    secret = base64.b32encode(secrets.token_bytes(20)).decode("ascii")
    user.mfa_pending_secret = _cipher().encrypt(secret.encode()).decode()
    user.mfa_pending_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    await db.flush()
    return {"secret": secret, "otpauth_uri": f"otpauth://totp/{quote('KSU:' + user.email, safe='')}?secret={secret}&issuer=KSU&digits=6&period=30"}


async def confirm_enrollment(db, user_id, code):
    await _LIMITER.check(str(user_id), "mfa-proof")
    user = await _locked_user(db, user_id)
    now = datetime.now(timezone.utc)
    if not user.mfa_pending_expires_at or user.mfa_pending_expires_at <= now:
        raise HTTPException(409, "No active MFA enrollment")
    counter = matching_counter(_decrypt(user.mfa_pending_secret), code, now)
    if counter is None:
        raise HTTPException(401, "Invalid MFA code")
    codes = [secrets.token_hex(16) for _ in range(10)]
    user.mfa_secret = user.mfa_pending_secret
    user.mfa_pending_secret = None
    user.mfa_pending_expires_at = None
    user.mfa_enabled = True
    user.mfa_last_counter = counter
    user.mfa_recovery_hashes = [_recovery_hash(user.id, value) for value in codes]
    await db.flush()
    return codes


async def verify_factor(db, user_id, code):
    """Consume one authenticator/recovery proof; never commit independently."""
    await _LIMITER.check(str(user_id), "mfa-proof")
    user = await _locked_user(db, user_id)
    if not user.mfa_enabled:
        raise HTTPException(403, "MFA enrollment required")
    now = datetime.now(timezone.utc)
    counter = matching_counter(_decrypt(user.mfa_secret), code, now, user.mfa_last_counter)
    if counter is not None:
        user.mfa_last_counter = counter
    else:
        digest = _recovery_hash(user.id, code)
        hashes = list(user.mfa_recovery_hashes or [])
        found = next((value for value in hashes if hmac.compare_digest(value, digest)), None)
        if found is None:
            raise HTTPException(401, "Invalid or already used MFA code")
        hashes.remove(found)
        user.mfa_recovery_hashes = hashes
    await db.flush()
    return now


async def mark_session_verified(db, user_id, jti, verified_at):
    session = await db.scalar(select(Session).where(
        Session.user_id == user_id, Session.jti == jti,
    ).with_for_update().execution_options(populate_existing=True))
    if session is None or not session.is_valid():
        raise HTTPException(401, "Session is invalid")
    session.mfa_verified_at = verified_at
    await db.flush()


async def confirm_session_enrollment(db, user_id, jti, code):
    """Replace credentials and invalidate other sessions atomically."""
    codes = await confirm_enrollment(db, user_id, code)
    now = datetime.now(timezone.utc)
    await mark_session_verified(db, user_id, jti, now)
    await db.execute(update(Session).where(Session.user_id == user_id, Session.jti != jti,
                                            Session.is_active.is_(True)).values(
        is_active=False, revoked_at=now, revoked_reason="mfa_enrollment"))
    return codes


async def step_up_session(db, user_id, jti, password, code):
    await _LIMITER.check(str(user_id), "mfa-password")
    user = await _locked_user(db, user_id)
    if not verify_password(password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    verified = await verify_factor(db, user_id, code)
    await mark_session_verified(db, user_id, jti, verified)
    return verified
