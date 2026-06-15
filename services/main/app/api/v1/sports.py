"""Sports facility endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import SportsFacility
from ...schemas import SportsFacilityCreate, SportsFacilityUpdate
from ...services import SportsFacilityService

router = APIRouter()


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "campus_id", "facility_type", "is_active", "fields", "include"))
async def list_sports_facilities(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    campus_id: uuid.UUID | None = None,
    facility_type: str | None = None,
    is_active: bool | None = True,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(SportsFacility, fields)
    result = await SportsFacilityService.list(
        db,
        page=page,
        per_page=per_page,
        campus_id=campus_id,
        facility_type=facility_type,
        is_active=is_active,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_sports_facility(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(SportsFacility, fields)
    item = await SportsFacilityService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Sports facility not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("admin:*"))])
async def create_sports_facility(data: SportsFacilityCreate, db: DbSession, _: CurrentUser):
    item = await SportsFacilityService.create(db, **data.model_dump())
    return success(data=item, message="Sports facility created")


@router.patch("/{item_id}", dependencies=[Depends(require_scope("admin:*"))])
async def update_sports_facility(item_id: uuid.UUID, data: SportsFacilityUpdate, db: DbSession, _: CurrentUser):
    item = await SportsFacilityService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Sports facility not found")
    item = await SportsFacilityService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Sports facility updated")


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("admin:*"))])
async def delete_sports_facility(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await SportsFacilityService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Sports facility not found")
    await SportsFacilityService.delete(db, item)
