"""JWT token helpers for auth flows."""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from ksu_common.security import decode_key_material, decode_token as verify_token, encode_token

from ..core.config import get_settings

settings = get_settings()
public_key = decode_key_material(settings.JWT_PUBLIC_KEY_B64, field_name="JWT_PUBLIC_KEY_B64")


def _encode(payload: dict) -> str:
    if not settings.JWT_SIGNING_ENABLED or not settings.JWT_PRIVATE_KEY_B64:
        raise RuntimeError("JWT signing is disabled in this process")
    private_key = decode_key_material(
        settings.JWT_PRIVATE_KEY_B64,
        field_name="JWT_PRIVATE_KEY_B64",
    )
    return encode_token(
        payload,
        private_key=private_key,
        key_id=settings.JWT_KEY_ID,
        issuer=settings.JWT_ISSUER,
        audience=settings.JWT_AUDIENCE,
        algorithm=settings.JWT_ALGORITHM,
    )


def _claim_values(values: Iterable[str] | None) -> list[str]:
    """Return stable, de-duplicated string claim values."""
    if not values:
        return []
    seen: set[str] = set()
    claims: list[str] = []
    for value in values:
        normalized = str(value).strip()
        if normalized and normalized not in seen:
            seen.add(normalized)
            claims.append(normalized)
    return claims


def create_access_token(
    user_id: str,
    roles: list[str],
    *,
    permissions: Iterable[str] | None = None,
    scopes: Iterable[str] | None = None,
    scope_grants: Iterable[Mapping[str, object]] | None = None,
) -> tuple[str, str]:
    """Create access token and return (token, jti)."""
    now = datetime.now(timezone.utc)
    jti = str(uuid4())
    payload = {
        "sub": user_id,
        "roles": roles,
        "jti": jti,
        "type": "access",
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(minutes=settings.JWT_ACCESS_TTL_MINUTES),
    }
    permission_claims = _claim_values(permissions)
    scope_claims = _claim_values(scopes)
    if permission_claims:
        payload["permissions"] = permission_claims
    if scope_claims:
        payload["scopes"] = scope_claims
    if scope_grants:
        payload["scope_grants"] = list(scope_grants)
    token = _encode(payload)
    return token, jti


def create_refresh_token(user_id: str, jti: str) -> str:
    """Create refresh token linked to an access-token jti."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "jti": jti,
        "type": "refresh",
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(days=settings.JWT_REFRESH_TTL_DAYS),
    }
    return _encode(payload)


def create_socket_token(user_id: str, *, ttl_seconds: int) -> str:
    """Create a short-lived token restricted to WebSocket admission."""
    now = datetime.now(timezone.utc)
    return _encode(
        {
            "sub": user_id,
            "jti": str(uuid4()),
            "type": "socket",
            "iat": now,
            "nbf": now,
            "exp": now + timedelta(seconds=ttl_seconds),
        }
    )


def create_token(
    user_id: str,
    roles: list[str],
    *,
    permissions: Iterable[str] | None = None,
    scopes: Iterable[str] | None = None,
    scope_grants: Iterable[Mapping[str, object]] | None = None,
) -> tuple[str, str, str]:
    """Create access + refresh tokens and return (access, refresh, jti)."""
    access_token, jti = create_access_token(
        user_id,
        roles,
        permissions=permissions,
        scopes=scopes,
        scope_grants=scope_grants,
    )
    refresh_token = create_refresh_token(user_id, jti)
    return access_token, refresh_token, jti


def decode_token(token: str) -> dict:
    """Decode and validate a JWT token."""
    return verify_token(
        token,
        key=public_key,
        algorithm=settings.JWT_ALGORITHM,
        issuer=settings.JWT_ISSUER,
        audience=settings.JWT_AUDIENCE,
        key_id=settings.JWT_KEY_ID,
    )


def refresh_token(
    user_id: str,
    roles: list[str],
    jti: str,
    *,
    permissions: Iterable[str] | None = None,
    scopes: Iterable[str] | None = None,
    scope_grants: Iterable[Mapping[str, object]] | None = None,
) -> tuple[str, str]:
    """Issue a fresh access/refresh pair reusing the session jti."""
    now = datetime.now(timezone.utc)
    access_payload = {
        "sub": user_id,
        "roles": roles,
        "jti": jti,
        "type": "access",
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(minutes=settings.JWT_ACCESS_TTL_MINUTES),
    }
    permission_claims = _claim_values(permissions)
    scope_claims = _claim_values(scopes)
    if permission_claims:
        access_payload["permissions"] = permission_claims
    if scope_claims:
        access_payload["scopes"] = scope_claims
    if scope_grants:
        access_payload["scope_grants"] = list(scope_grants)
    refresh_payload = {
        "sub": user_id,
        "jti": jti,
        "type": "refresh",
        "iat": now,
        "nbf": now,
        "exp": now + timedelta(days=settings.JWT_REFRESH_TTL_DAYS),
    }
    return (
        _encode(access_payload),
        _encode(refresh_payload),
    )
