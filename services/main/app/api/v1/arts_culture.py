"""Arts and culture endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import ArtsCulture
from ...schemas import ArtsCultureCreate, ArtsCultureUpdate
from ...services import ArtsCultureService

router = APIRouter()


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "category", "school_id", "club_id", "fields", "include"))
async def list_arts_culture(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: str | None = None,
    school_id: uuid.UUID | None = None,
    club_id: uuid.UUID | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(ArtsCulture, fields)
    result = await ArtsCultureService.list(
        db,
        page=page,
        per_page=per_page,
        category=category,
        school_id=school_id,
        club_id=club_id,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{slug}")
@cached_public(timeout=300)
async def get_arts_culture(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(ArtsCulture, fields)
    item = await ArtsCultureService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Arts and culture item not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("admin:*"))])
async def create_arts_culture(data: ArtsCultureCreate, db: DbSession, _: CurrentUser):
    item = await ArtsCultureService.create(db, **data.model_dump())
    return success(data=item, message="Arts and culture item created")


@router.patch("/{item_id}", dependencies=[Depends(require_scope("admin:*"))])
async def update_arts_culture(item_id: uuid.UUID, data: ArtsCultureUpdate, db: DbSession, _: CurrentUser):
    item = await ArtsCultureService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Arts and culture item not found")
    item = await ArtsCultureService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Arts and culture item updated")


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("admin:*"))])
async def delete_arts_culture(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await ArtsCultureService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Arts and culture item not found")
    await ArtsCultureService.delete(db, item)
