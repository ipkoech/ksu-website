"""University info endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import UniversityInfo
from ...schemas import UniversityInfoCreate, UniversityInfoUpdate
from ...services import UniversityInfoService

router = APIRouter()


@router.get("")
@cached_public(timeout=600, vary_on=("fields", "include"))
async def get_university_info(db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(UniversityInfo, fields)
    item = await UniversityInfoService.get_current(db, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="University info not found")
    return success(data=selector.apply(item))


@router.get("/{slug}")
@cached_public(timeout=600, vary_on=("slug", "fields", "include"))
async def get_university_info_by_slug(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(UniversityInfo, fields)
    item = await UniversityInfoService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="University info not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("about.manage"))])
async def create_university_info(data: UniversityInfoCreate, db: DbSession, _: CurrentUser):
    try:
        item = await UniversityInfoService.create(db, **data.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return success(data=item, message="University info created")


@router.patch("/{item_id}", dependencies=[Depends(require_scope("about.manage"))])
async def update_university_info(item_id: uuid.UUID, data: UniversityInfoUpdate, db: DbSession, _: CurrentUser):
    item = await UniversityInfoService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="University info not found")
    item = await UniversityInfoService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="University info updated")


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("about.manage"))])
async def delete_university_info(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await UniversityInfoService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="University info not found")
    await UniversityInfoService.delete(db, item)
