"""Framework-agnostic JWT and password helpers."""

from __future__ import annotations

import os
import uuid
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher, exceptions as argon2_exceptions

_ph = PasswordHasher(time_cost=2, memory_cost=102400, parallelism=8, hash_len=32)


def hash_password(password: str) -> str:
    return _ph.hash(password)


def verify_password(password_hash: str, candidate: str) -> bool:
    try:
        return _ph.verify(password_hash, candidate)
    except (argon2_exceptions.VerifyMismatchError, argon2_exceptions.VerificationError):
        return False


def decode_token(token: str, *, secret: str, algorithm: str = "HS256") -> dict:
    """Decode and validate a JWT. Raises jwt.PyJWTError on failure."""
    return jwt.decode(
        token,
        secret,
        algorithms=[algorithm],
        options={"require": ["exp", "iat", "nbf", "jti", "sub"]},
    )


def generate_access_token(
    subject: str,
    *,
    secret: str,
    algorithm: str = "HS256",
    expires_minutes: int = 15,
    roles: list[str] | None = None,
    token_id: str | None = None,
) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(minutes=expires_minutes),
        "jti": token_id or str(uuid.uuid4()),
        "type": "access",
        "roles": roles or [],
    }
    return jwt.encode(payload, secret, algorithm=algorithm)
