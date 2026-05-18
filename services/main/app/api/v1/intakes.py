"""Intake endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Intake
from ...schemas import IntakeCreate, IntakeUpdate
from ...services import IntakeService

router = APIRouter()


@router.get("")
@cached_public(timeout=300)
async def list_intakes(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    academic_calendar_id: uuid.UUID | None = None,
    is_open: bool | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Intake, fields)
    result = await IntakeService.list(
        db,
        page=page,
        per_page=per_page,
        academic_calendar_id=academic_calendar_id,
        is_open=is_open,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{slug}")
@cached_public(timeout=300)
async def get_intake(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Intake, fields)
    intake = await IntakeService.get_by_slug(db, slug, load_options=selector.load_options)
    if intake is None:
        raise HTTPException(status_code=404, detail="Intake not found")
    return success(data=selector.apply(intake))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("academic:write"))])
async def create_intake(data: IntakeCreate, db: DbSession, _: CurrentUser):
    intake = await IntakeService.create(db, **data.model_dump())
    return success(data=intake, message="Intake created")


@router.patch("/{intake_id}", dependencies=[Depends(require_scope("academic:write"))])
async def update_intake(intake_id: uuid.UUID, data: IntakeUpdate, db: DbSession, _: CurrentUser):
    intake = await IntakeService.get_by_id(db, intake_id)
    if intake is None:
        raise HTTPException(status_code=404, detail="Intake not found")
    intake = await IntakeService.update(db, intake, **data.model_dump(exclude_unset=True))
    return success(data=intake, message="Intake updated")


@router.delete("/{intake_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("academic:delete"))])
async def delete_intake(intake_id: uuid.UUID, db: DbSession, _: CurrentUser):
    intake = await IntakeService.get_by_id(db, intake_id)
    if intake is None:
        raise HTTPException(status_code=404, detail="Intake not found")
    await IntakeService.delete(db, intake)
