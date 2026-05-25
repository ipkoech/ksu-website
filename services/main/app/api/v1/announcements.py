"""Announcement endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Announcement
from ...schemas import AnnouncementCreate, AnnouncementUpdate
from ...services import AnnouncementService

router = APIRouter()


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "scope_type", "scope_id", "is_main", "is_published", "search", "fields"))
async def list_announcements(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    is_main: bool | None = None,
    is_published: bool | None = None,
    search: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Announcement, fields)
    result = await AnnouncementService.list(
        db,
        page=page,
        per_page=per_page,
        scope_type=scope_type,
        scope_id=scope_id,
        is_main=is_main,
        is_published=is_published,
        search=search,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/id/{announcement_id}")
async def get_announcement_by_id(announcement_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(Announcement, fields)
    item = await AnnouncementService.get_by_id(db, announcement_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return success(data=selector.apply(item))


@router.get("/{slug}")
@cached_public(timeout=300)
async def get_announcement(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Announcement, fields)
    item = await AnnouncementService.get_by_slug(db, slug, public_only=True, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("admin:*"))])
async def create_announcement(data: AnnouncementCreate, db: DbSession, _: CurrentUser):
    item = await AnnouncementService.create(db, **data.model_dump())
    return success(data=item, message="Announcement created")


@router.patch("/{announcement_id}", dependencies=[Depends(require_scope("admin:*"))])
async def update_announcement(announcement_id: uuid.UUID, data: AnnouncementUpdate, db: DbSession, _: CurrentUser):
    item = await AnnouncementService.get_by_id(db, announcement_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Announcement not found")
    item = await AnnouncementService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Announcement updated")


@router.post("/{announcement_id}/publish", dependencies=[Depends(require_scope("admin:*"))])
async def publish_announcement(announcement_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await AnnouncementService.get_by_id(db, announcement_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Announcement not found")
    item = await AnnouncementService.publish(db, item)
    return success(data=item, message="Announcement published")


@router.post("/{announcement_id}/unpublish", dependencies=[Depends(require_scope("admin:*"))])
async def unpublish_announcement(announcement_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await AnnouncementService.get_by_id(db, announcement_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Announcement not found")
    item = await AnnouncementService.unpublish(db, item)
    return success(data=item, message="Announcement unpublished")


@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("admin:*"))])
async def delete_announcement(announcement_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await AnnouncementService.get_by_id(db, announcement_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Announcement not found")
    await AnnouncementService.delete(db, item)
