"""Shared RBAC policy evaluation and FastAPI authorization dependencies."""

from __future__ import annotations

from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from typing import Any

from .roles import ALL_PERMISSIONS, ROLE_DEFINITIONS, normalize_role_name


@dataclass(frozen=True)
class AuthorizationScope:
    """A service-owned resource scope supplied to the common policy evaluator."""

    scope_type: str
    scope_id: object | None = None


@dataclass(frozen=True)
class AuthorizationDecision:
    """The stable result returned by every authorization policy evaluation."""

    allowed: bool
    reason: str
    matched_permission: str | None = None


KNOWN_SCOPE_TYPES = frozenset(
    {
        "global",
        "university",
        "library",
        "research",
        "school",
        "division",
        "wing",
        "department",
        "programme",
        "club",
    }
)


def _normalize_value(value: str) -> str:
    return value.strip().lower().replace(":", ".")


def _normalize_scope_type(value: str) -> str:
    normalized = value.strip().lower().replace("-", "_")
    if normalized == "directorate":
        return "division"
    return normalized


def _split_permission(permission: str) -> tuple[str, str]:
    normalized = _normalize_value(permission)
    resource, separator, action = normalized.rpartition(".")
    return resource, action if separator else ""


KNOWN_PERMISSIONS = frozenset(_normalize_value(permission) for permission in ALL_PERMISSIONS)


def _resource_aliases(resource: str) -> frozenset[str]:
    aliases = {
        "organization": frozenset({"organization", "governance"}),
        "governance": frozenset({"governance", "organization"}),
    }
    return aliases.get(resource, frozenset({resource}))


def _is_known_permission(permission: str) -> bool:
    return _normalize_value(permission) in KNOWN_PERMISSIONS


def _required_permission(action: str, resource: str) -> str | None:
    normalized_action = _normalize_value(action)
    normalized_resource = _normalize_value(resource)
    if not normalized_resource and "." in normalized_action:
        return normalized_action
    if not normalized_action or not normalized_resource:
        return None
    if "." in normalized_action:
        return None
    return f"{normalized_resource}.{normalized_action}"


def _action_grants(granted_action: str, required_action: str) -> bool:
    if granted_action in {"*", required_action}:
        return True

    read_actions = {"read", "view", "list"}
    write_actions = {"write", "create", "update", "edit"}
    delete_actions = {"delete", "remove"}

    if granted_action in {"read", "view"}:
        return required_action in read_actions
    if granted_action == "write":
        return required_action in write_actions
    if granted_action == "manage":
        return required_action == "manage"
    if granted_action.startswith("manage"):
        return required_action == granted_action
    if granted_action == "delete":
        return required_action in delete_actions
    if granted_action == "upload":
        return required_action == "upload"
    if granted_action == "send":
        return required_action == "send"
    return False


def _permission_grants(granted_permission: str, required_permission: str) -> bool:
    granted_resource, granted_action = _split_permission(granted_permission)
    required_resource, required_action = _split_permission(required_permission)
    if _normalize_value(granted_permission) in {"*", "admin.*"}:
        return True
    if not granted_action:
        return _normalize_value(granted_permission) == required_permission
    if granted_resource not in _resource_aliases(required_resource) and not (
        granted_action == "*" and required_resource.startswith(f"{granted_resource}.")
    ):
        return False
    if required_action == "*":
        return granted_action == "*"
    return _action_grants(granted_action, required_action)


def get_role_scopes(role_name: str) -> tuple[str, ...]:
    definition = ROLE_DEFINITIONS.get(normalize_role_name(role_name))
    return tuple(definition.scopes) if definition else ()


def _string_values(value: object) -> list[str]:
    if not isinstance(value, Iterable) or isinstance(value, (str, bytes)):
        return []
    return [item for item in value if isinstance(item, str)]


def _subject_permissions(subject: object) -> list[str]:
    raw = getattr(subject, "raw", None)
    roles = getattr(subject, "roles", None)
    permissions = getattr(subject, "permissions", None)
    scopes: object = None
    if isinstance(subject, Mapping):
        raw = subject.get("raw", subject)
        roles = subject.get("roles", roles)
        permissions = subject.get("permissions", permissions)
        scopes = subject.get("scopes")
    elif raw is not None and isinstance(raw, Mapping):
        scopes = raw.get("scopes")
        permissions = [*(_string_values(permissions)), *_string_values(raw.get("permissions"))]
    elif isinstance(subject, Iterable) and not isinstance(subject, (str, bytes)):
        permissions = subject

    values = [*_string_values(scopes), *_string_values(permissions)]
    if isinstance(raw, Mapping):
        for grant in raw.get("scope_grants") or []:
            if isinstance(grant, Mapping):
                values.extend(_string_values(grant.get("permissions")))
    for role in _string_values(roles):
        values.extend(get_role_scopes(role))
    return values


def _scope_grants(subject: object) -> list[Mapping[str, Any]] | None:
    raw = getattr(subject, "raw", None)
    if isinstance(subject, Mapping):
        raw = subject.get("raw", subject)
    if not isinstance(raw, Mapping) or "scope_grants" not in raw:
        return None
    return [grant for grant in raw.get("scope_grants") or [] if isinstance(grant, Mapping)]


def _permission_decision(subject: object, required_permission: str) -> AuthorizationDecision:
    if not _is_known_permission(required_permission):
        return AuthorizationDecision(False, "unknown_permission")

    for granted_permission in _subject_permissions(subject):
        if _permission_grants(granted_permission, required_permission):
            return AuthorizationDecision(True, "allowed", granted_permission.strip().lower())
    return AuthorizationDecision(False, "missing_permission")


def _scope_decision(
    subject: object,
    required_permission: str,
    scope: AuthorizationScope,
    permission_decision: AuthorizationDecision,
) -> AuthorizationDecision:
    scope_type = _normalize_scope_type(scope.scope_type)
    if scope_type not in KNOWN_SCOPE_TYPES:
        return AuthorizationDecision(False, "unknown_scope")

    grants = _scope_grants(subject)
    if grants is None:
        return permission_decision

    target_id = None if scope.scope_id in (None, "") else str(scope.scope_id)
    for grant in grants:
        for granted_permission in _string_values(grant.get("permissions")):
            if not _permission_grants(granted_permission, required_permission):
                continue
            grant_scope_type = _normalize_scope_type(str(grant.get("scope_type") or "global"))
            grant_scope_id = grant.get("scope_id")
            if grant_scope_type in {"global", "university"}:
                return AuthorizationDecision(True, "allowed", granted_permission.strip().lower())
            if (
                grant_scope_type == scope_type
                and target_id is not None
                and grant_scope_id not in (None, "")
                and str(grant_scope_id) == target_id
            ):
                return AuthorizationDecision(True, "allowed", granted_permission.strip().lower())
    return AuthorizationDecision(False, "scope_mismatch")


def authorize(
    subject: object,
    action: str,
    resource: str,
    scope: AuthorizationScope | None = None,
) -> AuthorizationDecision:
    """Evaluate a normalized permission and optional exact/global scope grant.

    Services own hierarchical scope lookups. They should call this function for
    the permission decision, then return a new :class:`AuthorizationDecision`
    after their own ownership resolver has accepted or rejected the target.
    """
    required_permission = _required_permission(action, resource)
    if required_permission is None:
        return AuthorizationDecision(False, "unknown_permission")

    decision = _permission_decision(subject, required_permission)
    if not decision.allowed or scope is None:
        return decision
    return _scope_decision(subject, required_permission, scope, decision)


def authorize_permission(
    subject: object,
    permission: str,
    scope: AuthorizationScope | None = None,
) -> AuthorizationDecision:
    """Convenience adapter for legacy callers that carry a dotted permission."""
    resource, action = _split_permission(permission)
    return authorize(subject, action, resource, scope)


def has_scope(user_roles: Iterable[str], scope: str) -> bool:
    """Return whether any role grants the required known permission."""
    return authorize({"roles": list(user_roles)}, *_split_permission(scope)[::-1]).allowed




# ── FastAPI dependency ────────────────────────────────────────────────────────

from fastapi import Depends, HTTPException, status

from .auth import TokenPayload, UserDependency


def build_scope_dependency(user_dependency: UserDependency):
    """Bind permission enforcement to a service-owned user dependency."""

    def requires_scope(scope: str):
        def _check(payload: TokenPayload = Depends(user_dependency)) -> TokenPayload:
            if not authorize_permission(payload, scope).allowed:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient privileges",
                )
            return payload

        return _check

    return requires_scope


__all__ = [
    "KNOWN_PERMISSIONS",
    "KNOWN_SCOPE_TYPES",
    "AuthorizationDecision",
    "AuthorizationScope",
    "authorize",
    "authorize_permission",
    "get_role_scopes",
    "has_scope",
    "build_scope_dependency",
]
