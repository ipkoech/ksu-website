"""Event endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException, Query, status
from fastapi.encoders import jsonable_encoder

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ._scoped import can_access_scoped_record, require_scoped_record
from ...deps import CurrentUser, DbSession, permissions_for_user
from ...models import Event
from ...schemas import EventCreate, EventUpdate
from ...services import ContentWorkflowService, EventService
from .content_workflow import authorize_content_workflow_action

router = APIRouter()

RESEARCH_SCOPE_LABELS = {
    "research": "Research",
    "research-center": "Research center",
    "research-centers": "Research center",
    "research-consultancies": "Research consultancy",
    "research-consultancy": "Research consultancy",
    "research-donor": "Research donor",
    "research-donors": "Research donor",
    "research-endowment": "Research endowment",
    "research-endowments": "Research endowment",
    "research-farm": "Research farm",
    "research-farms": "Research farm",
    "research-focus-area": "Research focus area",
    "research-focus-areas": "Research focus area",
    "research-funder": "Research funder",
    "research-funders": "Research funder",
    "research-grant": "Research grant",
    "research-grants": "Research grant",
    "research-impact-metric": "Research impact metric",
    "research-impact-metrics": "Research impact metric",
    "research-innovation": "Research innovation",
    "research-innovations": "Research innovation",
    "research-mentorship": "Research mentorship",
    "research-output": "Research output",
    "research-outputs": "Research output",
    "research-partner": "Research partner",
    "research-partners": "Research partner",
    "research-program": "Research program",
    "research-programs": "Research program",
    "research-project": "Research project",
    "research-projects": "Research project",
    "research-publication": "Research publication",
    "research-publications": "Research publication",
    "research-scholarship": "Research scholarship",
    "research-scholarships": "Research scholarship",
    "research-sustainability": "Research sustainability",
    "research-theme": "Research theme",
    "research-themes": "Research theme",
    "research-training": "Research training",
}

EVENT_VIEW_PERMISSIONS = [
    "office.view",
    "content.view",
    "content.manage_events",
]
EVENT_MANAGE_PERMISSIONS = [
    "office.manage_content",
    "content.manage_events",
    "content.publish",
]


def _normalized_scope_type(scope_type: str | None) -> str | None:
    if scope_type is None:
        return None
    return scope_type.strip().lower().replace("_", "-").replace(".", "-")


def _resolve_scope_summary(scope_type: str | None, scope_id: uuid.UUID | None) -> dict[str, Any] | None:
    normalized_type = _normalized_scope_type(scope_type)
    if scope_type is None or scope_id is None or normalized_type not in RESEARCH_SCOPE_LABELS:
        return None
    return {
        "type": scope_type,
        "id": str(scope_id),
        "label": RESEARCH_SCOPE_LABELS[normalized_type],
    }


def _with_scope_summary(serialized_item: Any, source_item: Any) -> dict[str, Any]:
    item = jsonable_encoder(serialized_item)
    item["scope"] = _resolve_scope_summary(
        getattr(source_item, "scope_type", None),
        getattr(source_item, "scope_id", None),
    )
    return item


def _with_scope_summaries(serialized_items: Any, source_items: list[Any]) -> list[dict[str, Any]]:
    return [
        _with_scope_summary(serialized_item, source_item)
        for serialized_item, source_item in zip(serialized_items, source_items, strict=False)
    ]


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "scope_type", "scope_id", "is_main", "is_published", "upcoming", "search", "fields", "include", "include_scope"))
async def list_events(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    is_main: bool | None = None,
    is_published: bool | None = None,
    upcoming: bool | None = None,
    search: str | None = None,
    include_scope: bool = False,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Event, fields)
    result = await EventService.list(
        db,
        page=page,
        per_page=per_page,
        scope_type=scope_type,
        scope_id=scope_id,
        is_main=is_main,
        is_published=is_published,
        upcoming=upcoming,
        search=search,
        load_options=selector.load_options,
    )
    data = selector.apply(result.items)
    if include_scope:
        data = _with_scope_summaries(data, list(result.items))
    return success(data=data, meta=result.meta)


@router.get("/admin")
async def list_admin_events(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    is_main: bool | None = None,
    is_published: bool | None = None,
    upcoming: bool | None = None,
    status: str | None = None,
    workflow_status: str | None = None,
    owner_portal: str | None = None,
    owner_scope_type: str | None = None,
    owner_scope_id: uuid.UUID | None = None,
    scheduled_from: datetime | None = None,
    scheduled_to: datetime | None = None,
    search: str | None = None,
    include_scope: bool = False,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Event, fields)
    result = await EventService.list_admin(
        db,
        page=page,
        per_page=per_page,
        scope_type=scope_type,
        scope_id=scope_id,
        is_main=is_main,
        is_published=is_published,
        upcoming=upcoming,
        status=status,
        workflow_status=workflow_status,
        owner_portal=owner_portal,
        owner_scope_type=owner_scope_type,
        owner_scope_id=owner_scope_id,
        scheduled_from=scheduled_from,
        scheduled_to=scheduled_to,
        search=search,
        load_options=selector.load_options,
    )
    items = []
    for item in result.items:
        if await can_access_scoped_record(
            db,
            user,
            EVENT_VIEW_PERMISSIONS,
            item.scope_type,
            item.scope_id,
        ):
            items.append(item)
    meta = dict(result.meta)
    meta["total"] = len(items)
    data = selector.apply(items)
    if include_scope:
        data = _with_scope_summaries(data, items)
    return success(data=data, meta=meta)


@router.get("/id/{event_id}")
async def get_event_by_id(
    event_id: uuid.UUID,
    db: DbSession,
    user: CurrentUser,
    include_scope: bool = False,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Event, fields)
    item = await EventService.get_by_id(db, event_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Event not found")
    await require_scoped_record(
        db,
        user,
        EVENT_VIEW_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="event",
    )
    data = selector.apply(item)
    if include_scope:
        data = _with_scope_summary(data, item)
    return success(data=data)


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include", "include_scope"))
async def get_event(slug: str, db: DbSession, include_scope: bool = False, fields: FieldSelection = FieldsDep):
    selector = build_selector(Event, fields)
    item = await EventService.get_by_slug(db, slug, public_only=True, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Event not found")
    data = selector.apply(item)
    if include_scope:
        data = _with_scope_summary(data, item)
    return success(data=data)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_event(data: EventCreate, db: DbSession, user: CurrentUser):
    await require_scoped_record(
        db,
        user,
        EVENT_MANAGE_PERMISSIONS,
        data.scope_type,
        data.scope_id,
        resource_name="event",
    )
    item = await EventService.create(db, **data.model_dump())
    return success(data=item, message="Event created")


@router.patch("/{event_id}")
async def update_event(event_id: uuid.UUID, data: EventUpdate, db: DbSession, user: CurrentUser):
    item = await EventService.get_by_id(db, event_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Event not found")
    await require_scoped_record(
        db,
        user,
        EVENT_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="event",
    )
    payload = data.model_dump(exclude_unset=True)
    await require_scoped_record(
        db,
        user,
        EVENT_MANAGE_PERMISSIONS,
        payload.get("scope_type", item.scope_type),
        payload.get("scope_id", item.scope_id),
        resource_name="event",
    )
    item = await EventService.update(db, item, **payload)
    return success(data=item, message="Event updated")


@router.post("/{event_id}/publish")
async def publish_event(event_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await EventService.get_by_id(db, event_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Event not found")
    await require_scoped_record(
        db,
        user,
        EVENT_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="event",
    )
    permissions = permissions_for_user(user)
    authorize_content_workflow_action(user, item, "publish", permissions)
    try:
        item = await ContentWorkflowService.publish_content(db, item, "events", user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Event published")


@router.post("/{event_id}/unpublish")
async def unpublish_event(event_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await EventService.get_by_id(db, event_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Event not found")
    await require_scoped_record(
        db,
        user,
        EVENT_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="event",
    )
    permissions = permissions_for_user(user)
    authorize_content_workflow_action(user, item, "unpublish", permissions)
    try:
        item = await ContentWorkflowService.unpublish_content(db, item, "events", user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Event unpublished")


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(event_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await EventService.get_by_id(db, event_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Event not found")
    await require_scoped_record(
        db,
        user,
        EVENT_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="event",
    )
    await EventService.delete(db, item)
