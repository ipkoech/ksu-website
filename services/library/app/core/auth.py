"""Library service authorization helpers."""

from __future__ import annotations

import uuid

from fastapi import HTTPException, status

from ksu_common.auth import TokenPayload
from ksu_common.rbac import has_payload_scope


def _scope_variants(scope: str) -> set[str]:
    return {scope, scope.replace(":", "."), scope.replace(".", ":")}


def _split_scope(scope: str) -> tuple[str, str]:
    normalized = scope.strip().lower()
    colon_index = normalized.index(":") if ":" in normalized else -1
    dot_index = normalized.index(".") if "." in normalized else -1
    if colon_index == -1 and dot_index == -1:
        return normalized, ""
    if colon_index == -1:
        separator_index = dot_index
    elif dot_index == -1:
        separator_index = colon_index
    else:
        separator_index = min(colon_index, dot_index)
    return normalized[:separator_index], normalized[separator_index + 1 :]


def _action_grants(granted_action: str, required_action: str) -> bool:
    if granted_action in {"*", required_action}:
        return True
    read_actions = {"read", "view", "list"}
    write_actions = {"write", "create", "update", "edit", "manage"}
    delete_actions = {"delete", "remove"}
    if granted_action in {"read", "view"}:
        return required_action in read_actions
    if granted_action == "write":
        return required_action in read_actions | write_actions or required_action.startswith(
            "manage"
        )
    if granted_action == "manage":
        return required_action not in delete_actions
    if granted_action.startswith("manage"):
        return (
            required_action in read_actions | write_actions
            or required_action.startswith("manage")
        )
    if granted_action == "delete":
        return required_action in delete_actions
    return False


def _matches_scope(granted: str, required: str) -> bool:
    required_variants = _scope_variants(required)
    granted_variants = _scope_variants(granted)
    if granted_variants & required_variants:
        return True
    granted_resource, granted_action = _split_scope(granted)
    required_resource, required_action = _split_scope(required)
    if granted_resource == required_resource and required_action:
        return _action_grants(granted_action, required_action)
    for variant in granted_variants:
        if variant.endswith(":*") and any(
            req.startswith(variant[:-1]) for req in required_variants
        ):
            return True
        if variant.endswith(".*") and any(
            req.startswith(variant[:-1]) for req in required_variants
        ):
            return True
    return False


def _grant_permissions(grant: dict) -> set[str]:
    return {
        str(permission).strip()
        for permission in grant.get("permissions", []) or []
        if str(permission).strip()
    }


def _grant_matches_permission(grant: dict, permission: str) -> bool:
    return any(_matches_scope(granted, permission) for granted in _grant_permissions(grant))


def _normalized_scope_id(value: object) -> str | None:
    if value in (None, ""):
        return None
    return str(value)


def can_access_library_scope(
    user: TokenPayload,
    permission: str,
    library_id: uuid.UUID | str | None,
) -> bool:
    """Return whether a token can access a branch-owned library record.

    Tokens without structured grants stay compatible with the older flat
    permission model. Once a token carries matching structured grants, it must
    either be global/university-scoped or match the branch ID.
    """
    if not has_payload_scope(user, permission):
        return False

    grants = [
        grant for grant in user.raw.get("scope_grants", []) or [] if isinstance(grant, dict)
    ]
    if not grants:
        return True

    matching = [grant for grant in grants if _grant_matches_permission(grant, permission)]
    if not matching:
        return True

    target_id = _normalized_scope_id(library_id)
    for grant in matching:
        grant_scope_type = str(grant.get("scope_type") or "global").strip().lower()
        grant_scope_id = _normalized_scope_id(grant.get("scope_id"))
        if grant_scope_type in {"global", "university"}:
            return True
        if grant_scope_type == "library" and target_id and grant_scope_id == target_id:
            return True
    return False


def allowed_library_scope_ids(user: TokenPayload, permission: str) -> set[str] | None:
    """Return assigned branch IDs for a structured token, or None for global access."""
    if not has_payload_scope(user, permission):
        return set()

    grants = [
        grant for grant in user.raw.get("scope_grants", []) or [] if isinstance(grant, dict)
    ]
    if not grants:
        return None

    matching = [grant for grant in grants if _grant_matches_permission(grant, permission)]
    if not matching:
        return None

    scope_ids: set[str] = set()
    for grant in matching:
        grant_scope_type = str(grant.get("scope_type") or "global").strip().lower()
        grant_scope_id = _normalized_scope_id(grant.get("scope_id"))
        if grant_scope_type in {"global", "university"}:
            return None
        if grant_scope_type == "library" and grant_scope_id:
            scope_ids.add(grant_scope_id)
    return scope_ids


def require_library_scope(
    user: TokenPayload,
    permission: str,
    library_id: uuid.UUID | str | None,
) -> None:
    if not can_access_library_scope(user, permission, library_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges for this assigned library branch",
        )
