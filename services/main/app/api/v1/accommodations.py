"""Accommodation endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Accommodation
from ...schemas import AccommodationCreate, AccommodationUpdate
from ...services import AccommodationService

router = APIRouter()


@router.get("")
@cached_public(timeout=300)
async def list_accommodations(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    campus_id: uuid.UUID | None = None,
    accommodation_type: str | None = None,
    gender: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Accommodation, fields)
    result = await AccommodationService.list(
        db,
        page=page,
        per_page=per_page,
        campus_id=campus_id,
        accommodation_type=accommodation_type,
        gender=gender,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{slug}")
@cached_public(timeout=300)
async def get_accommodation(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Accommodation, fields)
    item = await AccommodationService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Accommodation not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("admin:*"))])
async def create_accommodation(data: AccommodationCreate, db: DbSession, _: CurrentUser):
    item = await AccommodationService.create(db, **data.model_dump())
    return success(data=item, message="Accommodation created")


@router.patch("/{item_id}", dependencies=[Depends(require_scope("admin:*"))])
async def update_accommodation(item_id: uuid.UUID, data: AccommodationUpdate, db: DbSession, _: CurrentUser):
    item = await AccommodationService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Accommodation not found")
    item = await AccommodationService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Accommodation updated")


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("admin:*"))])
async def delete_accommodation(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await AccommodationService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Accommodation not found")
    await AccommodationService.delete(db, item)
