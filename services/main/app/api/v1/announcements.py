"""Announcement endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ._scoped import can_access_scoped_record, require_scoped_record
from ...deps import CurrentUser, DbSession, permissions_for_user
from ...models import Announcement
from ...schemas import AnnouncementCreate, AnnouncementUpdate
from ...services import AnnouncementService, ContentWorkflowService
from .content_workflow import authorize_content_workflow_action

router = APIRouter()

ANNOUNCEMENT_VIEW_PERMISSIONS = [
    "office.view",
    "content.view",
    "content.manage_announcements",
]
ANNOUNCEMENT_MANAGE_PERMISSIONS = [
    "office.manage_content",
    "content.manage_announcements",
    "content.publish",
]


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "scope_type", "scope_id", "is_main", "is_published", "search", "fields", "include"))
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


@router.get("/admin")
async def list_admin_announcements(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    is_main: bool | None = None,
    is_published: bool | None = None,
    status: str | None = None,
    workflow_status: str | None = None,
    owner_portal: str | None = None,
    owner_scope_type: str | None = None,
    owner_scope_id: uuid.UUID | None = None,
    scheduled_from: datetime | None = None,
    scheduled_to: datetime | None = None,
    search: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Announcement, fields)
    result = await AnnouncementService.list_admin(
        db,
        page=page,
        per_page=per_page,
        scope_type=scope_type,
        scope_id=scope_id,
        is_main=is_main,
        is_published=is_published,
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
            ANNOUNCEMENT_VIEW_PERMISSIONS,
            item.scope_type,
            item.scope_id,
        ):
            items.append(item)
    meta = dict(result.meta)
    meta["total"] = len(items)
    return success(data=selector.apply(items), meta=meta)


@router.get("/id/{announcement_id}")
async def get_announcement_by_id(
    announcement_id: uuid.UUID,
    db: DbSession,
    user: CurrentUser,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Announcement, fields)
    item = await AnnouncementService.get_by_id(db, announcement_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Announcement not found")
    await require_scoped_record(
        db,
        user,
        ANNOUNCEMENT_VIEW_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="announcement",
    )
    return success(data=selector.apply(item))


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_announcement(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Announcement, fields)
    item = await AnnouncementService.get_by_slug(db, slug, public_only=True, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Announcement not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_announcement(data: AnnouncementCreate, db: DbSession, user: CurrentUser):
    await require_scoped_record(
        db,
        user,
        ANNOUNCEMENT_MANAGE_PERMISSIONS,
        data.scope_type,
        data.scope_id,
        resource_name="announcement",
    )
    payload = ContentWorkflowService.authoring_create_payload(
        data.model_dump(), actor_id=user.id,
        **ContentWorkflowService.owner_metadata_for_scope(
            data.scope_type, data.scope_id, is_main=data.is_main,
        ),
    )
    item = await AnnouncementService.create(db, **payload)
    return success(data=item, message="Announcement created")


@router.patch("/{announcement_id}")
async def update_announcement(announcement_id: uuid.UUID, data: AnnouncementUpdate, db: DbSession, user: CurrentUser):
    item = await AnnouncementService.get_by_id(db, announcement_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Announcement not found")
    await require_scoped_record(
        db,
        user,
        ANNOUNCEMENT_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="announcement",
    )
    payload = data.model_dump(exclude_unset=True)
    await require_scoped_record(
        db,
        user,
        ANNOUNCEMENT_MANAGE_PERMISSIONS,
        payload.get("scope_type", item.scope_type),
        payload.get("scope_id", item.scope_id),
        resource_name="announcement",
    )
    current_status = item.workflow_status or item.status
    permissions = permissions_for_user(user)
    if current_status in {"submitted", "in_review", "approved", "scheduled"}:
        authorize_content_workflow_action(user, item, "edit", permissions)
    try:
        await ContentWorkflowService.apply_edit_policy(
            db,
            item,
            "announcements",
            user.id,
            actor_kind=(
                "reviewer"
                if current_status == "in_review"
                and {"content.review", "content.manage"}.intersection(permissions)
                else "author"
            ),
            changed_fields=payload,
        )
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    item = await AnnouncementService.update(db, item, **payload)
    return success(data=item, message="Announcement updated")


@router.post("/{announcement_id}/publish")
async def publish_announcement(announcement_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await AnnouncementService.get_by_id(db, announcement_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Announcement not found")
    await require_scoped_record(
        db,
        user,
        ANNOUNCEMENT_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="announcement",
    )
    permissions = permissions_for_user(user)
    authorize_content_workflow_action(user, item, "publish", permissions)
    try:
        item = await ContentWorkflowService.publish_content(db, item, "announcements", user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Announcement published")


@router.post("/{announcement_id}/unpublish")
async def unpublish_announcement(announcement_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await AnnouncementService.get_by_id(db, announcement_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Announcement not found")
    await require_scoped_record(
        db,
        user,
        ANNOUNCEMENT_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="announcement",
    )
    permissions = permissions_for_user(user)
    authorize_content_workflow_action(user, item, "unpublish", permissions)
    try:
        item = await ContentWorkflowService.unpublish_content(db, item, "announcements", user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Announcement unpublished")


@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_announcement(announcement_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await AnnouncementService.get_by_id(db, announcement_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Announcement not found")
    await require_scoped_record(
        db,
        user,
        ANNOUNCEMENT_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="announcement",
    )
    await AnnouncementService.delete(db, item)
