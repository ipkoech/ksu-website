"""Validate Main-owned context choices without querying another service's data."""

from dataclasses import replace
from uuid import UUID

from sqlalchemy import select

from ..models import Club, Department, School

LOCAL_MODELS = {"school": School, "department": Department, "club": Club}


def scope_uuid(value):
    try:
        return UUID(str(value))
    except (ValueError, TypeError, AttributeError):
        return None


async def active_workspace_actor(db, actor, selected=None):
    """Batch scope checks, preserving the real actor and its original snapshot."""
    grants = actor.raw.get("scope_grants", [])
    active = {}
    for scope_type, model in LOCAL_MODELS.items():
        ids = {scope_uuid(g.get("scope_id")) for g in grants if g.get("scope_type") == scope_type}
        if selected and selected.scope_type == scope_type:
            ids.add(scope_uuid(selected.scope_id))
        ids.discard(None)
        active[scope_type] = set()
        if ids:
            active[scope_type] = set((await db.scalars(select(model.id).where(
                model.id.in_(ids), model.is_active.is_(True), model.deleted_at.is_(None),
            ))).all())
    if selected and selected.scope_type in LOCAL_MODELS:
        if scope_uuid(selected.scope_id) not in active[selected.scope_type]:
            raise PermissionError("Selected scope is inactive or unavailable")
    filtered = [
        g
        for g in grants
        if g.get("scope_type") not in LOCAL_MODELS
        or scope_uuid(g.get("scope_id")) in active.get(g.get("scope_type"), set())
    ]
    return replace(actor, raw={**actor.raw, "scope_grants": filtered})
