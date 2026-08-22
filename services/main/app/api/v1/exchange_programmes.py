"""Exchange programme endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import ExchangeProgramme
from ...schemas import ExchangeProgrammeCreate, ExchangeProgrammeUpdate
from ...services import ExchangeProgrammeService

router = APIRouter()


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "q", "programme_type", "school_id", "accepting_only", "fields", "include"))
async def list_exchange_programmes(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    q: str | None = None,
    programme_type: str | None = None,
    school_id: uuid.UUID | None = None,
    accepting_only: bool = False,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(ExchangeProgramme, fields)
    result = await ExchangeProgrammeService.list(
        db,
        page=page,
        per_page=per_page,
        q=q,
        programme_type=programme_type,
        school_id=school_id,
        accepting_only=accepting_only,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_exchange_programme(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(ExchangeProgramme, fields)
    item = await ExchangeProgrammeService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Exchange programme not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("exchange_programmes.manage"))])
async def create_exchange_programme(data: ExchangeProgrammeCreate, db: DbSession, _: CurrentUser):
    item = await ExchangeProgrammeService.create(db, **data.model_dump())
    return success(data=item, message="Exchange programme created")


@router.patch("/{item_id}", dependencies=[Depends(require_scope("exchange_programmes.manage"))])
async def update_exchange_programme(item_id: uuid.UUID, data: ExchangeProgrammeUpdate, db: DbSession, _: CurrentUser):
    item = await ExchangeProgrammeService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Exchange programme not found")
    item = await ExchangeProgrammeService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Exchange programme updated")


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("exchange_programmes.manage"))])
async def delete_exchange_programme(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await ExchangeProgrammeService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Exchange programme not found")
    await ExchangeProgrammeService.delete(db, item)
