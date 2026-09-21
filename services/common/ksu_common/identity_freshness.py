"""Bounded, fail-closed session validation at the identity service boundary."""

from __future__ import annotations

import asyncio
from uuid import UUID

import httpx
from fastapi import HTTPException

from .auth import TokenPayload
from .internal_client import outbound_client


def build_identity_validator(*, base_url: str, service_key: str | None):
    """Recheck each request; never cache revoked sessions or old assignments.

    The complete operation has a two-second deadline, no retries, redirects or
    stale fallback. Only Main owns the underlying account/session database.
    """
    async def validate(token: str, verified: TokenPayload) -> TokenPayload:
        try:
            async with asyncio.timeout(2):
                async with outbound_client(base_url=base_url, timeout=1.5) as client:
                    response = await client.post(
                        "/api/v1/internal/auth/introspect",
                        headers={"Authorization": f"Bearer {token}",
                                 "X-Internal-Key": service_key or ""},
                    )
            if response.status_code == 401:
                raise HTTPException(401, "Invalid or missing token", headers={"WWW-Authenticate": "Bearer"})
            response.raise_for_status()
            current = response.json()
            if current.get("sub") != verified.sub or current.get("jti") != verified.jti:
                raise ValueError("identity mismatch")
            if not isinstance(current.get("scope_grants"), list):
                raise ValueError("missing current assignments")
            person_id = current.get("person_id")
            if person_id is not None:
                person_id = str(UUID(person_id))
            # Replace all authorization claims, including role templates.
            raw = {**verified.raw, "roles": [], "scopes": [], "permissions": [],
                   "person_id": person_id,
                   "mfa_enabled": current.get("mfa_enabled") is True,
                   "mfa_verified_at": current.get("mfa_verified_at"),
                   "scope_grants": current["scope_grants"]}
            return TokenPayload(sub=verified.sub, jti=verified.jti, roles=[], raw=raw)
        except HTTPException:
            raise
        except (httpx.HTTPError, TimeoutError, ValueError, TypeError, AttributeError) as exc:
            raise HTTPException(503, "Identity validation unavailable", headers={"Retry-After": "2"}) from exc

    return validate
