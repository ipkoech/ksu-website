"""News endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ._scoped import can_access_scoped_record, require_scoped_record
from ...deps import CurrentUser, DbSession, permissions_for_user
from ...models import News
from ...schemas import NewsCreate, NewsUpdate
from ...services import ContentWorkflowService, NewsService
from .content_workflow import authorize_content_workflow_action

router = APIRouter()

NEWS_VIEW_PERMISSIONS = [
    "office.view",
    "content.view",
    "content.manage_news",
]
NEWS_MANAGE_PERMISSIONS = [
    "office.manage_content",
    "content.manage_news",
    "content.publish",
]


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "scope_type", "scope_id", "is_main", "is_published", "search", "fields", "include"))
async def list_news(
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
    selector = build_selector(News, fields)
    result = await NewsService.list(
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
async def list_admin_news(
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
    selector = build_selector(News, fields)
    result = await NewsService.list_admin(
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
            NEWS_VIEW_PERMISSIONS,
            item.scope_type,
            item.scope_id,
        ):
            items.append(item)
    meta = dict(result.meta)
    meta["total"] = len(items)
    return success(data=selector.apply(items), meta=meta)


@router.get("/id/{news_id}")
async def get_news_by_id(news_id: uuid.UUID, db: DbSession, user: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(News, fields)
    item = await NewsService.get_by_id(db, news_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="News item not found")
    await require_scoped_record(
        db,
        user,
        NEWS_VIEW_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="news",
    )
    return success(data=selector.apply(item))


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_news(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(News, fields)
    item = await NewsService.get_by_slug(db, slug, public_only=True, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="News item not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_news(data: NewsCreate, db: DbSession, user: CurrentUser):
    await require_scoped_record(
        db,
        user,
        NEWS_MANAGE_PERMISSIONS,
        data.scope_type,
        data.scope_id,
        resource_name="news",
    )
    payload = ContentWorkflowService.authoring_create_payload(
        data.model_dump(),
        actor_id=user.id,
        **ContentWorkflowService.owner_metadata_for_scope(
            data.scope_type, data.scope_id, is_main=data.is_main,
        ),
    )
    item = await NewsService.create(db, **payload)
    return success(data=item, message="News created")


@router.patch("/{news_id}")
async def update_news(news_id: uuid.UUID, data: NewsUpdate, db: DbSession, user: CurrentUser):
    item = await NewsService.get_by_id(db, news_id)
    if item is None:
        raise HTTPException(status_code=404, detail="News item not found")
    await require_scoped_record(
        db,
        user,
        NEWS_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="news",
    )
    payload = data.model_dump(exclude_unset=True)
    await require_scoped_record(
        db,
        user,
        NEWS_MANAGE_PERMISSIONS,
        payload.get("scope_type", item.scope_type),
        payload.get("scope_id", item.scope_id),
        resource_name="news",
    )
    current_status = item.workflow_status or item.status
    if current_status in {"submitted", "in_review", "approved", "scheduled"}:
        authorize_content_workflow_action(user, item, "edit", permissions_for_user(user))
    await ContentWorkflowService.reset_after_authoring_edit(
        db, item, "news", user.id, changed_fields=payload,
    )
    item = await NewsService.update(db, item, **payload)
    return success(data=item, message="News updated")


@router.post("/{news_id}/publish")
async def publish_news(news_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await NewsService.get_by_id(db, news_id)
    if item is None:
        raise HTTPException(status_code=404, detail="News item not found")
    await require_scoped_record(
        db,
        user,
        NEWS_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="news",
    )
    permissions = permissions_for_user(user)
    authorize_content_workflow_action(user, item, "publish", permissions)
    try:
        item = await ContentWorkflowService.publish_content(db, item, "news", user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="News published")


@router.post("/{news_id}/unpublish")
async def unpublish_news(news_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await NewsService.get_by_id(db, news_id)
    if item is None:
        raise HTTPException(status_code=404, detail="News item not found")
    await require_scoped_record(
        db,
        user,
        NEWS_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="news",
    )
    permissions = permissions_for_user(user)
    authorize_content_workflow_action(user, item, "unpublish", permissions)
    try:
        item = await ContentWorkflowService.unpublish_content(db, item, "news", user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="News unpublished")


@router.delete("/{news_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_news(news_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await NewsService.get_by_id(db, news_id)
    if item is None:
        raise HTTPException(status_code=404, detail="News item not found")
    await require_scoped_record(
        db,
        user,
        NEWS_MANAGE_PERMISSIONS,
        item.scope_type,
        item.scope_id,
        resource_name="news",
    )
    await NewsService.delete(db, item)
