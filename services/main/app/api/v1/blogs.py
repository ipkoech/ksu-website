"""Blog endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, permissions_for_user, require_scope
from ...models import Blog
from ...schemas import BlogCreate, BlogUpdate
from ...services import BlogService, ContentWorkflowService
from .content_workflow import authorize_content_workflow_action

router = APIRouter()


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "scope_type", "scope_id", "is_main", "is_published", "search", "fields", "include"))
async def list_blogs(
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
    selector = build_selector(Blog, fields)
    result = await BlogService.list(
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


@router.get("/admin", dependencies=[Depends(require_scope("content.manage_news"))])
async def list_admin_blogs(
    db: DbSession,
    _: CurrentUser,
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
    selector = build_selector(Blog, fields)
    result = await BlogService.list_admin(
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
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/id/{blog_id}")
async def get_blog_by_id(blog_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(Blog, fields)
    item = await BlogService.get_by_id(db, blog_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    return success(data=selector.apply(item))


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_blog(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Blog, fields)
    item = await BlogService.get_by_slug(db, slug, public_only=True, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("content.manage_news"))])
async def create_blog(data: BlogCreate, db: DbSession, user: CurrentUser):
    payload = ContentWorkflowService.authoring_create_payload(
        data.model_dump(), actor_id=user.id,
        **ContentWorkflowService.owner_metadata_for_scope(
            data.scope_type, data.scope_id, is_main=data.is_main,
        ),
    )
    item = await BlogService.create(db, **payload)
    return success(data=item, message="Blog created")


@router.patch("/id/{blog_id}", dependencies=[Depends(require_scope("content.manage_news"))])
async def update_blog(blog_id: uuid.UUID, data: BlogUpdate, db: DbSession, user: CurrentUser):
    item = await BlogService.get_by_id(db, blog_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    payload = data.model_dump(exclude_unset=True)
    current_status = item.workflow_status or item.status
    permissions = permissions_for_user(user)
    if current_status in {"submitted", "in_review", "approved", "scheduled"}:
        authorize_content_workflow_action(user, item, "edit", permissions)
    try:
        await ContentWorkflowService.apply_edit_policy(
            db,
            item,
            "blogs",
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
    item = await BlogService.update(db, item, **payload)
    return success(data=item, message="Blog updated")


@router.post("/id/{blog_id}/publish", dependencies=[Depends(require_scope("content.manage_news"))])
async def publish_blog(blog_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await BlogService.get_by_id(db, blog_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    permissions = permissions_for_user(user)
    authorize_content_workflow_action(user, item, "publish", permissions)
    try:
        item = await ContentWorkflowService.publish_content(db, item, "blogs", user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Blog published")


@router.post("/id/{blog_id}/unpublish", dependencies=[Depends(require_scope("content.manage_news"))])
async def unpublish_blog(blog_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await BlogService.get_by_id(db, blog_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    permissions = permissions_for_user(user)
    authorize_content_workflow_action(user, item, "unpublish", permissions)
    try:
        item = await ContentWorkflowService.unpublish_content(db, item, "blogs", user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    await db.flush()
    await db.refresh(item)
    return success(data=item, message="Blog unpublished")


@router.delete("/id/{blog_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("content.manage_news"))])
async def delete_blog(blog_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await BlogService.get_by_id(db, blog_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    await BlogService.delete(db, item)
