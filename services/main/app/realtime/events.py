"""Realtime room derivation and protocol envelopes."""

from __future__ import annotations

from typing import Any

from ksu_common.auth import TokenPayload
from ksu_contracts.rbac import AuthorizationScope, authorize_permission
from ..services.auth import _active_scope_grants


def rooms_for_user(user) -> set[str]:
    rooms = {f"user:{user.id}"}
    grants = getattr(user, "_realtime_scope_grants", None)
    if grants is None:
        grants = _active_scope_grants(user)
    actor = TokenPayload(str(user.id), "realtime", raw={"scope_grants": grants})
    for grant in grants:
        if grant.get("scope_type") == "school" and grant.get("scope_id") and authorize_permission(
            grant.get("permissions", []), "school.content.view"
        ).allowed:
            rooms.add(f"school:{grant['scope_id']}")
    if any(authorize_permission(actor, permission, AuthorizationScope("global")).allowed
           for permission in ("content.review", "content.publish")):
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
