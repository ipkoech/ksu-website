"""RBAC helpers — framework-agnostic core + FastAPI dependency."""

from __future__ import annotations

from typing import Iterable, Sequence

from .roles import ROLE_DEFINITIONS


def _normalize_role(role_name: str) -> str:
    return role_name.strip().lower().replace("_", "-")


def _normalize_scope(scope: str) -> str:
    return scope.strip().lower()


def _split_scope(scope: str) -> tuple[str, str]:
    normalized = _normalize_scope(scope)
    colon_index = normalized.index(":") if ":" in normalized else -1
    dot_index = normalized.index(".") if "." in normalized else -1
    separator_index = colon_index if dot_index == -1 else dot_index if colon_index == -1 else min(colon_index, dot_index)
    if separator_index == -1:
        return normalized, ""
    return normalized[:separator_index], normalized[separator_index + 1 :]


def _action_grants(granted_action: str, required_action: str) -> bool:
    if granted_action in {"*", required_action}:
        return True

    read_actions = {"read", "view", "list"}
    write_actions = {"write", "create", "update", "edit", "manage"}
    delete_actions = {"delete", "remove"}

    if granted_action == "read":
        return required_action in read_actions
    if granted_action == "view":
        return required_action in read_actions
    if granted_action == "write":
        return (
            required_action in write_actions
            or required_action.startswith("manage")
            or required_action in {"publish", "unpublish", "upload", "send"}
        )
    if granted_action == "manage":
        return required_action not in delete_actions
    if granted_action.startswith("manage"):
        return required_action in write_actions or required_action.startswith("manage")
    if granted_action == "delete":
        return required_action in delete_actions
    if granted_action == "upload":
        return required_action == "upload"
    if granted_action == "send":
        return required_action == "send"

    return False


def _scope_variants(scope: str) -> set[str]:
    resource, action = _split_scope(scope)
    if not action:
        return {resource}

    variants = {f"{resource}:{action}", f"{resource}.{action}"}
    if action == "read":
        variants.update({f"{resource}.view", f"{resource}:view"})
    if action == "view":
        variants.update({f"{resource}:read", f"{resource}.read"})
    if action == "write":
        variants.update({f"{resource}.manage", f"{resource}:manage"})
    if action.startswith("manage"):
        variants.update({f"{resource}:write", f"{resource}.write"})
    return variants


def _scope_grants(granted_scope: str, required_scope: str) -> bool:
    granted_resource, granted_action = _split_scope(granted_scope)
    required_resource, required_action = _split_scope(required_scope)
    if granted_scope == "*" or granted_scope == "admin:*":
        return True
    if granted_scope in _scope_variants(required_scope):
        return True
    if granted_resource != required_resource:
        return False
    if required_action == "*":
        return granted_action == "*"
    return _action_grants(granted_action, required_action)


def get_role_scopes(role_name: str) -> Sequence[str]:
    definition = ROLE_DEFINITIONS.get(_normalize_role(role_name))
    return definition.scopes if definition else ()


def has_scope(user_roles: Iterable[str], scope: str) -> bool:
    """Return True if any of the supplied roles grants the given scope."""
    normalized_scope = _normalize_scope(scope)
    return any(
        _scope_grants(_normalize_scope(role_scope), normalized_scope)
        for role in user_roles
        for role_scope in get_role_scopes(role)
    )


def has_payload_scope(payload: "TokenPayload", scope: str) -> bool:
    """Return True if token roles, permissions, or scopes grant the required scope."""
    normalized_scope = _normalize_scope(scope)
    raw_scopes = payload.raw.get("scopes") or []
    raw_permissions = payload.raw.get("permissions") or []
    explicit_scopes = {
        _normalize_scope(value)
        for values in (raw_scopes, raw_permissions)
        for value in values
        if isinstance(value, str)
    }
    if any(_scope_grants(granted_scope, normalized_scope) for granted_scope in explicit_scopes):
        return True
    return has_scope(payload.roles, normalized_scope)


# ── FastAPI dependency ────────────────────────────────────────────────────────

from fastapi import Depends, HTTPException, status
from .auth import get_current_user, TokenPayload


def requires_scope(scope: str):
    """FastAPI dependency factory that enforces a required RBAC scope."""

    def _check(payload: TokenPayload = Depends(get_current_user)) -> TokenPayload:
        if not has_payload_scope(payload, scope):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient privileges",
            )
        return payload

    return _check
