"""Division endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Division
from ...schemas import DivisionCreate, DivisionUpdate
from ...services import DivisionService

router = APIRouter()


@router.get("")
@cached_public(timeout=300)
async def list_divisions(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    is_active: bool | None = True,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Division, fields)
    result = await DivisionService.list(db, page=page, per_page=per_page, is_active=is_active, load_options=selector.load_options)
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{slug}")
@cached_public(timeout=300)
async def get_division(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Division, fields)
    division = await DivisionService.get_by_slug(db, slug, load_options=selector.load_options)
    if division is None:
        raise HTTPException(status_code=404, detail="Division not found")
    return success(data=selector.apply(division))


@router.get("/id/{division_id}")
async def get_division_by_id(division_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(Division, fields)
    division = await DivisionService.get_by_id(db, division_id, load_options=selector.load_options)
    if division is None:
        raise HTTPException(status_code=404, detail="Division not found")
    return success(data=selector.apply(division))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("organization.manage_divisions"))])
async def create_division(data: DivisionCreate, db: DbSession, _: CurrentUser):
    division = await DivisionService.create(db, **data.model_dump())
    return success(data=division, message="Division created")


@router.patch("/id/{division_id}", dependencies=[Depends(require_scope("organization.manage_divisions"))])
async def update_division(division_id: uuid.UUID, data: DivisionUpdate, db: DbSession, _: CurrentUser):
    division = await DivisionService.get_by_id(db, division_id)
    if division is None:
        raise HTTPException(status_code=404, detail="Division not found")
    division = await DivisionService.update(db, division, **data.model_dump(exclude_unset=True))
    return success(data=division, message="Division updated")


@router.delete("/id/{division_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("organization.manage_divisions"))])
async def delete_division(division_id: uuid.UUID, db: DbSession, _: CurrentUser):
    division = await DivisionService.get_by_id(db, division_id)
    if division is None:
        raise HTTPException(status_code=404, detail="Division not found")
    await DivisionService.soft_delete(db, division)
