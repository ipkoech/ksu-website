"""Framework-agnostic JWT and password helpers."""

from __future__ import annotations

import os
import uuid
from collections.abc import Collection
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher, exceptions as argon2_exceptions

_ph = PasswordHasher(time_cost=2, memory_cost=102400, parallelism=8, hash_len=32)

LOCAL_ENVS = {"development", "dev", "local", "test", "testing"}
MIN_SECRET_LENGTH = 32
KNOWN_DEFAULTS = {"change-me-local", "change-me-internal", "password", "secret"}
PLACEHOLDER_PREFIXES = ("replace_", "generate_", "url_encoded_")


def is_local_environment(app_env: str | None) -> bool:
    return (app_env or "").strip().lower() in LOCAL_ENVS


def validate_secret(secret: str | None, *, field_name: str, app_env: str | None) -> str | None:
    """Reject missing, short, and known default secrets outside local environments."""
    if is_local_environment(app_env):
        return secret

    normalized = secret.strip() if secret else ""
    if (
        not normalized
        or len(normalized) < MIN_SECRET_LENGTH
        or normalized.lower() in KNOWN_DEFAULTS
        or normalized.lower().startswith(PLACEHOLDER_PREFIXES)
    ):
        raise ValueError(f"{field_name} must be a non-default secret of at least {MIN_SECRET_LENGTH} characters")
    return secret


def validate_service_url(url: str | None, *, field_name: str, app_env: str | None) -> str | None:
    """Reject local and placeholder service endpoints outside local environments."""
    if is_local_environment(app_env):
        return url

    normalized = url.strip().lower() if url else ""
    if (
        not normalized
        or "@localhost" in normalized
        or "://localhost" in normalized
        or "://127.0.0.1" in normalized
        or "example.invalid" in normalized
        or normalized.startswith(PLACEHOLDER_PREFIXES)
    ):
        raise ValueError(f"{field_name} must be a configured, non-local URL outside local environments")
    return url


def require_explicit_production_values(
    configured_fields: Collection[str], *, field_names: Collection[str], app_env: str | None
) -> None:
    """Require production settings that otherwise have development defaults."""
    if is_local_environment(app_env):
        return

    for field_name in field_names:
        if field_name not in configured_fields:
            raise ValueError(f"{field_name} must be explicitly configured outside local development")


def validate_cors_origins(origins: Collection[str], *, app_env: str | None) -> Collection[str]:
    """Reject empty, local, wildcard, and placeholder CORS origins in production."""
    if is_local_environment(app_env):
        return origins

    if not origins:
        raise ValueError("CORS_ORIGINS must not be empty outside local development")

    for origin in origins:
        normalized = origin.strip().lower()
        if (
            not normalized
            or normalized == "*"
            or "localhost" in normalized
            or "127.0.0.1" in normalized
            or "example.invalid" in normalized
            or normalized.startswith(PLACEHOLDER_PREFIXES)
        ):
            raise ValueError("CORS_ORIGINS must use configured, non-local origins outside local development")
    return origins


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
