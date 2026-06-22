"""Event endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession
from ...models import Event
from ...security.scopes import can_access_scope
from ...schemas import EventCreate, EventUpdate
from ...services import EventService

router = APIRouter()

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


def _event_scope(scope_type: str | None, scope_id: uuid.UUID | None) -> tuple[str, uuid.UUID | None]:
    return (scope_type or "global", scope_id)


async def _can_access_event_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    scope_type: str | None,
    scope_id: uuid.UUID | None,
) -> bool:
    target_scope_type, target_scope_id = _event_scope(scope_type, scope_id)
    for permission in permissions:
        if await can_access_scope(db, user, permission, target_scope_type, target_scope_id):
            return True
    return False


async def _require_event_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    scope_type: str | None,
    scope_id: uuid.UUID | None,
) -> None:
    if not await _can_access_event_scope(db, user, permissions, scope_type, scope_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges for this event scope",
        )


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "scope_type", "scope_id", "is_main", "is_published", "upcoming", "search", "fields", "include"))
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
    return success(data=selector.apply(result.items), meta=result.meta)


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
    search: str | None = None,
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
        search=search,
        load_options=selector.load_options,
    )
    items = []
    for item in result.items:
        if await _can_access_event_scope(
            db,
            user,
            EVENT_VIEW_PERMISSIONS,
            item.scope_type,
            item.scope_id,
        ):
            items.append(item)
    meta = dict(result.meta)
    meta["total"] = len(items)
    return success(data=selector.apply(items), meta=meta)


@router.get("/id/{event_id}")
async def get_event_by_id(event_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(Event, fields)
    item = await EventService.get_by_id(db, event_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return success(data=selector.apply(item))


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_event(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Event, fields)
    item = await EventService.get_by_slug(db, slug, public_only=True, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_event(data: EventCreate, db: DbSession, user: CurrentUser):
    await _require_event_scope(
        db,
        user,
        EVENT_MANAGE_PERMISSIONS,
        data.scope_type,
        data.scope_id,
    )
    item = await EventService.create(db, **data.model_dump())
    return success(data=item, message="Event created")


@router.patch("/{event_id}")
async def update_event(event_id: uuid.UUID, data: EventUpdate, db: DbSession, user: CurrentUser):
    item = await EventService.get_by_id(db, event_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Event not found")
    await _require_event_scope(
        db,
        user,
        EVENT_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
    )
    payload = data.model_dump(exclude_unset=True)
    await _require_event_scope(
        db,
        user,
        EVENT_MANAGE_PERMISSIONS,
        payload.get("scope_type", item.scope_type),
        payload.get("scope_id", item.scope_id),
    )
    item = await EventService.update(db, item, **payload)
    return success(data=item, message="Event updated")


@router.post("/{event_id}/publish")
async def publish_event(event_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await EventService.get_by_id(db, event_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Event not found")
    await _require_event_scope(
        db,
        user,
        EVENT_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
    )
    item = await EventService.publish(db, item)
    return success(data=item, message="Event published")


@router.post("/{event_id}/unpublish")
async def unpublish_event(event_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await EventService.get_by_id(db, event_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Event not found")
    await _require_event_scope(
        db,
        user,
        EVENT_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
    )
    item = await EventService.unpublish(db, item)
    return success(data=item, message="Event unpublished")


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(event_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await EventService.get_by_id(db, event_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Event not found")
    await _require_event_scope(
        db,
        user,
        EVENT_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
    )
    await EventService.delete(db, item)
