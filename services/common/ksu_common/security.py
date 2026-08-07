"""Framework-agnostic JWT and password helpers."""

from __future__ import annotations

import ipaddress
import uuid
from collections.abc import Collection
from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import SplitResult, urlparse, urlsplit

import jwt
from argon2 import PasswordHasher
from argon2 import exceptions as argon2_exceptions

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

    parsed = _parse_production_url(url, field_name=field_name)
    _reject_local_or_placeholder_host(parsed.hostname or "", field_name=field_name)
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
        if origin.strip() == "*":
            raise ValueError("CORS_ORIGINS must use configured, non-local origins outside local development")
        parsed = _parse_production_url(origin, field_name="CORS_ORIGINS", origin=True)
        _reject_local_or_placeholder_host(parsed.hostname or "", field_name="CORS_ORIGINS")
    return origins


def _parse_production_url(
    value: str | None, *, field_name: str, origin: bool = False
) -> SplitResult:
    normalized = value.strip() if value else ""
    try:
        parsed = urlsplit(normalized)
        hostname = parsed.hostname
        parsed.port
    except ValueError as exc:
        raise ValueError(f"{field_name} must be a valid URL outside local development") from exc

    if not parsed.scheme or not parsed.netloc or not hostname:
        raise ValueError(f"{field_name} must be a valid URL outside local development")
    if origin and parsed.scheme.lower() not in {"http", "https"}:
        raise ValueError(f"{field_name} must use http or https origins outside local development")
    if origin and (
        parsed.path not in {"", "/"}
        or parsed.query
        or parsed.fragment
        or parsed.username
        or parsed.password
    ):
        raise ValueError(f"{field_name} must contain only a scheme, host, and optional port")
    return parsed


def _reject_local_or_placeholder_host(hostname: str, *, field_name: str) -> None:
    normalized = hostname.rstrip(".").lower()
    is_loopback = False
    try:
        is_loopback = ipaddress.ip_address(normalized).is_loopback
    except ValueError:
        pass

    if (
        normalized == "localhost"
        or normalized.endswith(".localhost")
        or is_loopback
        or "example.invalid" in normalized
        or normalized.startswith(PLACEHOLDER_PREFIXES)
    ):
        raise ValueError(f"{field_name} must use a configured, non-local URL outside local development")


def hash_password(password: str) -> str:
    return _ph.hash(password)


def verify_password(password_hash: str, candidate: str) -> bool:
    try:
        return _ph.verify(password_hash, candidate)
    except (argon2_exceptions.VerifyMismatchError, argon2_exceptions.VerificationError):
        return False


def decode_token(
    token: str,
    *,
    secret: str,
    algorithm: str = "HS256",
    expected_type: str | None = None,
) -> dict:
    """Decode and validate a JWT. Raises jwt.PyJWTError on failure.

    Access, refresh and socket-ticket tokens are all signed with the same secret,
    so callers must pass expected_type to stop one kind being replayed as another.
    """
    payload = jwt.decode(
        token,
        secret,
        algorithms=[algorithm],
        options={"require": ["exp", "iat", "nbf", "jti", "sub"]},
    )

    if expected_type is not None and payload.get("type") != expected_type:
        raise jwt.InvalidTokenError(
            f"expected {expected_type!r} token, got {payload.get('type')!r}"
        )

    return payload


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


def _is_numeric_hostname_candidate(hostname: str) -> bool:
    return all(
        component.isdecimal()
        or (
            component.startswith("0x")
            and len(component) > 2
            and all(character in "0123456789abcdef" for character in component[2:])
        )
        for component in hostname.split(".")
    )


def _has_unsafe_authority(value: str) -> bool:
    scheme, separator, remainder = value.partition(":")
    if not separator or scheme.lower() not in {"http", "https"} or not remainder.startswith("//"):
        return False
    authority = remainder[2:]
    for delimiter in "/?#":
        authority = authority.split(delimiter, 1)[0]
    return any(
        character in {"%", "\\"}
        or ord(character) < 32
        or 127 <= ord(character) <= 159
        or ord(character) > 127
        for character in authority
    )


def _is_safe_public_url(value: Any) -> bool:
    """Accept public HTTP(S) and local-path URLs while rejecting SSRF targets."""
    if not isinstance(value, str) or not value or value != value.strip() or _has_unsafe_authority(value):
        return False
    try:
        parsed = urlparse(value)
    except ValueError:
        return False
    if parsed.scheme in {"http", "https"}:
        if not parsed.netloc or parsed.username is not None or parsed.password is not None:
            return False
        try:
            hostname = parsed.hostname
            parsed.port
        except ValueError:
            return False
        if hostname is None:
            return False
        hostname = hostname.rstrip(".").lower()
        if hostname == "localhost" or hostname.endswith((".localhost", ".local", ".internal")):
            return False
        try:
            address = ipaddress.ip_address(hostname)
        except ValueError:
            if _is_numeric_hostname_candidate(hostname):
                return False
            return True
        return address.is_global and not any(
            (
                address.is_loopback,
                address.is_private,
                address.is_link_local,
                address.is_multicast,
                address.is_reserved,
                address.is_unspecified,
            )
        )
    return value.startswith("/") and not value.startswith("//") and not parsed.scheme and not parsed.netloc


is_safe_public_url = _is_safe_public_url
