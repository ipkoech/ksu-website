"""Public official-site page snapshot endpoints."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import DbSession
from ...models import PublicSitePage
from ...services import PublicSitePageService

router = APIRouter()


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "page_type", "search", "fields", "include"))
async def list_public_site_pages(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    page_type: str | None = None,
    search: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(PublicSitePage, fields)
    result = await PublicSitePageService.list(
        db,
        page=page,
        per_page=per_page,
        page_type=page_type,
        search=search,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_public_site_page(
    slug: str,
    db: DbSession,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(PublicSitePage, fields)
    item = await PublicSitePageService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Public site page not found")
    return success(data=selector.apply(item))
