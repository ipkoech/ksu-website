"""News endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import News
from ...schemas import NewsCreate, NewsUpdate
from ...services import NewsService

router = APIRouter()


@router.get("")
@cached_public(timeout=300)
async def list_news(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    is_main: bool | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(News, fields)
    result = await NewsService.list(db, page=page, per_page=per_page, scope_type=scope_type, scope_id=scope_id, is_main=is_main, load_options=selector.load_options)
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{slug}")
@cached_public(timeout=300)
async def get_news(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(News, fields)
    item = await NewsService.get_by_slug(db, slug, public_only=True, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="News item not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("admin:*"))])
async def create_news(data: NewsCreate, db: DbSession, _: CurrentUser):
    item = await NewsService.create(db, **data.model_dump())
    return success(data=item, message="News created")


@router.patch("/{news_id}", dependencies=[Depends(require_scope("admin:*"))])
async def update_news(news_id: uuid.UUID, data: NewsUpdate, db: DbSession, _: CurrentUser):
    item = await NewsService.get_by_id(db, news_id)
    if item is None:
        raise HTTPException(status_code=404, detail="News item not found")
    item = await NewsService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="News updated")


@router.delete("/{news_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("admin:*"))])
async def delete_news(news_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await NewsService.get_by_id(db, news_id)
    if item is None:
        raise HTTPException(status_code=404, detail="News item not found")
    await NewsService.delete(db, item)
