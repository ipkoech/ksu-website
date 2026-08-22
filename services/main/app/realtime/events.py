"""Realtime room derivation and protocol envelopes."""

from __future__ import annotations

from typing import Any

from ..security.role_assignments import is_role_assignment_current


def rooms_for_user(user) -> set[str]:
    rooms = {f"user:{user.id}"}
    permissions: set[str] = set()
    for assignment in getattr(user, "role_assignments", ()) or ():
        if not is_role_assignment_current(assignment):
            continue
        if getattr(assignment, "scope_type", None) == "school" and assignment.scope_id:
            rooms.add(f"school:{assignment.scope_id}")
        role = getattr(assignment, "role", None)
        for item in getattr(role, "role_permissions", ()) or ():
            permission = getattr(item, "permission", None)
            if permission and getattr(permission, "is_active", True):
                permissions.add(str(permission.name).replace(":", "."))
    if {"content.review", "content.publish", "content.manage"}.intersection(permissions):
        rooms.add("portal:cocms")
    return rooms


def rooms_for_event(event: dict[str, Any]) -> set[str]:
    rooms: set[str] = set()
    scope = event.get("scope") or {}
    if scope.get("type") == "school" and scope.get("id"):
        rooms.add(f"school:{scope['id']}")
    data = event.get("data") or {}
    if data.get("user_id"):
        rooms.add(f"user:{data['user_id']}")
    if str(event.get("type", "")).startswith("school.content."):
        rooms.add("portal:cocms")
    return rooms


def protocol_event(cursor: str, event: dict[str, Any]) -> dict[str, Any]:
    return {"type": "event", "cursor": cursor, "event": event}


__all__ = ["protocol_event", "rooms_for_event", "rooms_for_user"]
