"""School-owned adapters over the shared CoCMS content workflow."""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import HTTPException
from sqlalchemy import select

from ..models import Announcement, Blog, Document, Event, MediaLink, News
from .content_workflow import ContentWorkflowService
from .domain_events import enqueue_domain_event

SCHOOL_CONTENT_MODELS = {
    "news": News,
    "event": Event,
    "story": Blog,
    "announcement": Announcement,
    "calendar_entry": Event,
    "gallery_link": MediaLink,
    "document": Document,
    "download": Document,
}


def _require(context, permission: str) -> None:
    if permission not in context.permissions:
        raise HTTPException(status_code=403, detail=f"{permission} permission is required")


def school_content_create_payload(
    content_type: str,
    data: dict[str, Any],
    *,
    school_id: uuid.UUID,
    actor_id: uuid.UUID,
) -> dict[str, Any]:
    payload = ContentWorkflowService.authoring_create_payload(
        dict(data),
        actor_id=actor_id,
        owner_portal="schools",
        owner_scope_type="school",
        owner_scope_id=school_id,
    )
    payload["scope_type"] = "school"
    payload["scope_id"] = school_id
    if content_type == "gallery_link":
        payload.update(
            entity_type="school",
            entity_id=school_id,
            role=payload.get("role", "gallery"),
        )
        payload.pop("scope_type", None)
        payload.pop("scope_id", None)
    return payload


def verify_school_content_owner(item: Any, school_id: uuid.UUID) -> None:
    owner_type = getattr(item, "owner_scope_type", None)
    owner_id = getattr(item, "owner_scope_id", None)
    if owner_type != "school" or owner_id != school_id:
        raise HTTPException(status_code=404, detail="Content not found")


async def list_school_content(db, context, content_type: str | None = None) -> list[dict[str, Any]]:
    _require(context, "school.content.view")
    requested = [content_type] if content_type else list(SCHOOL_CONTENT_MODELS)
    if any(kind not in SCHOOL_CONTENT_MODELS for kind in requested):
        raise HTTPException(status_code=400, detail="Unsupported content type")
    items: list[dict[str, Any]] = []
    for kind in requested:
        model = SCHOOL_CONTENT_MODELS[kind]
        query = select(model).where(
            model.owner_scope_type == "school",
            model.owner_scope_id == context.school.id,
        )
        if model is MediaLink:
            query = query.where(MediaLink.entity_type == "school")
        result = await db.execute(query.order_by(model.updated_at.desc()))
        items.extend({"content_type": kind, "record": item} for item in result.scalars().all())
    return items


async def get_school_content(db, context, content_type: str, content_id: uuid.UUID):
    model = SCHOOL_CONTENT_MODELS.get(content_type)
    if model is None:
        raise HTTPException(status_code=404, detail="Unsupported content type")
    item = await model.get_by_id(db, content_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Content not found")
    verify_school_content_owner(item, context.school.id)
    return item


async def create_school_content(db, context, data):
    _require(context, "school.content.manage")
    model = SCHOOL_CONTENT_MODELS[data.content_type]
    payload = school_content_create_payload(
        data.content_type,
        data.data,
        school_id=context.school.id,
        actor_id=context.user.id,
    )
    item = model(**payload)
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return item


async def update_school_content(db, context, content_id: uuid.UUID, data):
    _require(context, "school.content.manage")
    item = await get_school_content(db, context, data.content_type, content_id)
    try:
        await ContentWorkflowService.apply_edit_policy(
            db,
            item,
            data.content_type,
            context.user.id,
            actor_kind="author",
            changed_fields=data.data,
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    for key, value in data.data.items():
        setattr(item, key, value)
    await db.flush()
    await db.refresh(item)
    return item


async def delete_school_content(db, context, content_type: str, content_id: uuid.UUID) -> None:
    _require(context, "school.content.manage")
    item = await get_school_content(db, context, content_type, content_id)
    current = getattr(item, "workflow_status", None) or item.status
    if current != "draft":
        raise HTTPException(status_code=409, detail="Only unused drafts can be deleted")
    item.soft_delete()
    await db.flush()


async def run_school_content_action(
    db,
    context,
    content_type: str,
    content_id: uuid.UUID,
    action: str,
    *,
    comments: str | None = None,
):
    _require(context, "school.content.submit")
    if action not in {"submit", "withdraw"}:
        raise HTTPException(status_code=400, detail="Unsupported author action")
    item = await get_school_content(db, context, content_type, content_id)
    try:
        await ContentWorkflowService.transition(
            db,
            item,
            content_type,
            action,
            context.user.id,
            comments=comments,
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    enqueue_domain_event(
        db,
        event_type=(
            "school.content.withdrawn"
            if action == "withdraw"
            else "school.content.submitted"
        ),
        scope_type="school",
        scope_id=context.school.id,
        actor_id=context.user.id,
        resource_type=content_type,
        resource_id=item.id,
        data={"workflow_status": item.workflow_status},
    )
    await db.flush()
    await db.refresh(item)
    return item
