"""Blog endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Blog
from ...schemas import BlogCreate, BlogUpdate
from ...services import BlogService

router = APIRouter()


@router.get("")
@cached_public(timeout=300)
async def list_blogs(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    is_main: bool | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Blog, fields)
    result = await BlogService.list(db, page=page, per_page=per_page, scope_type=scope_type, scope_id=scope_id, is_main=is_main, load_options=selector.load_options)
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{slug}")
@cached_public(timeout=300)
async def get_blog(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Blog, fields)
    item = await BlogService.get_by_slug(db, slug, public_only=True, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("content.manage_news"))])
async def create_blog(data: BlogCreate, db: DbSession, user: CurrentUser):
    item = await BlogService.create(db, author_user_id=user.sub, **data.model_dump())
    return success(data=item, message="Blog created")


@router.patch("/id/{blog_id}", dependencies=[Depends(require_scope("content.manage_news"))])
async def update_blog(blog_id: uuid.UUID, data: BlogUpdate, db: DbSession, _: CurrentUser):
    item = await BlogService.get_by_id(db, blog_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    item = await BlogService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Blog updated")


@router.delete("/id/{blog_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("content.manage_news"))])
async def delete_blog(blog_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await BlogService.get_by_id(db, blog_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    await BlogService.delete(db, item)
