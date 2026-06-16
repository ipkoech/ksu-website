"""Campus endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Campus
from ...schemas import CampusCreate, CampusUpdate
from ...services import CampusService

router = APIRouter()


@router.get("")
@cached_public(timeout=300, vary_on=("is_active", "fields", "include"))
async def list_campuses(db: DbSession, is_active: bool | None = True, fields: FieldSelection = FieldsDep):
    selector = build_selector(Campus, fields)
    items = await CampusService.list(db, is_active=is_active, load_options=selector.load_options)
    return success(data=selector.apply(items))


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_campus(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Campus, fields)
    campus = await CampusService.get_by_slug(db, slug, load_options=selector.load_options)
    if campus is None:
        raise HTTPException(status_code=404, detail="Campus not found")
    return success(data=selector.apply(campus))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("academic:write"))])
async def create_campus(data: CampusCreate, db: DbSession, _: CurrentUser):
    campus = await CampusService.create(db, **data.model_dump())
    return success(data=campus, message="Campus created")


@router.patch("/{campus_id}", dependencies=[Depends(require_scope("academic:write"))])
async def update_campus(campus_id: uuid.UUID, data: CampusUpdate, db: DbSession, _: CurrentUser):
    campus = await CampusService.get_by_id(db, campus_id)
    if campus is None:
        raise HTTPException(status_code=404, detail="Campus not found")
    campus = await CampusService.update(db, campus, **data.model_dump(exclude_unset=True))
    return success(data=campus, message="Campus updated")
