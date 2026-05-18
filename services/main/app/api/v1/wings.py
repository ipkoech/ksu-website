"""Wing endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Wing
from ...schemas import WingCreate, WingUpdate
from ...services import WingService

router = APIRouter()


@router.get("/division/{division_id}")
@cached_public(timeout=300)
async def list_wings_by_division(division_id: uuid.UUID, db: DbSession, is_active: bool | None = True, fields: FieldSelection = FieldsDep):
    selector = build_selector(Wing, fields)
    items = await WingService.list_by_division(db, division_id, is_active=is_active, load_options=selector.load_options)
    return success(data=selector.apply(items))


@router.get("/{wing_id}")
@cached_public(timeout=300)
async def get_wing(wing_id: uuid.UUID, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Wing, fields)
    wing = await WingService.get_by_id(db, wing_id, load_options=selector.load_options)
    if wing is None:
        raise HTTPException(status_code=404, detail="Wing not found")
    return success(data=selector.apply(wing))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("academic:write"))])
async def create_wing(data: WingCreate, db: DbSession, _: CurrentUser):
    wing = await WingService.create(db, data.division_id, **data.model_dump(exclude={"division_id"}))
    return success(data=wing, message="Wing created")


@router.patch("/{wing_id}", dependencies=[Depends(require_scope("academic:write"))])
async def update_wing(wing_id: uuid.UUID, data: WingUpdate, db: DbSession, _: CurrentUser):
    wing = await WingService.get_by_id(db, wing_id)
    if wing is None:
        raise HTTPException(status_code=404, detail="Wing not found")
    wing = await WingService.update(db, wing, **data.model_dump(exclude_unset=True))
    return success(data=wing, message="Wing updated")
