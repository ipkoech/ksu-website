"""Alumni endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Alumni
from ...schemas import AlumniCreate, AlumniUpdate
from ...services import AlumniService

router = APIRouter()


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "school_id", "programme_id", "graduation_year", "mentor_only", "fields", "include"))
async def list_alumni(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    school_id: uuid.UUID | None = None,
    programme_id: uuid.UUID | None = None,
    graduation_year: int | None = None,
    mentor_only: bool = False,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Alumni, fields)
    result = await AlumniService.list(
        db,
        page=page,
        per_page=per_page,
        school_id=school_id,
        programme_id=programme_id,
        graduation_year=graduation_year,
        mentor_only=mentor_only,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{item_id}")
@cached_public(timeout=300)
async def get_alumnus(item_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Alumni, fields)
    item = await AlumniService.get_by_id(db, item_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Alumni profile not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("admin:*"))])
async def create_alumnus(data: AlumniCreate, db: DbSession, _: CurrentUser):
    item = await AlumniService.create(db, **data.model_dump())
    return success(data=item, message="Alumni profile created")


@router.patch("/{item_id}", dependencies=[Depends(require_scope("admin:*"))])
async def update_alumnus(item_id: uuid.UUID, data: AlumniUpdate, db: DbSession, _: CurrentUser):
    item = await AlumniService.get_by_id(db, item_id, public_only=False)
    if item is None:
        raise HTTPException(status_code=404, detail="Alumni profile not found")
    item = await AlumniService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Alumni profile updated")


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("admin:*"))])
async def delete_alumnus(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await AlumniService.get_by_id(db, item_id, public_only=False)
    if item is None:
        raise HTTPException(status_code=404, detail="Alumni profile not found")
    await AlumniService.delete(db, item)
