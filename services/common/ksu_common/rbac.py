"""RBAC helpers — framework-agnostic core + FastAPI dependency."""

from __future__ import annotations

from typing import Iterable, Sequence

from .roles import ROLE_DEFINITIONS


def get_role_scopes(role_name: str) -> Sequence[str]:
    definition = ROLE_DEFINITIONS.get(role_name)
    return definition.scopes if definition else ()


def has_scope(user_roles: Iterable[str], scope: str) -> bool:
    """Return True if any of the supplied roles grants the given scope."""
    return any(scope in get_role_scopes(role) for role in user_roles)


# ── FastAPI dependency ────────────────────────────────────────────────────────

from fastapi import Depends, HTTPException, status
from .auth import get_current_user, TokenPayload


def requires_scope(scope: str):
    """FastAPI dependency factory that enforces a required RBAC scope."""

    def _check(payload: TokenPayload = Depends(get_current_user)) -> TokenPayload:
        if not has_scope(payload.roles, scope):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient privileges",
            )
        return payload

    return _check
