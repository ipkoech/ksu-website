"""Admission information endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import AdmissionInfo
from ...schemas import AdmissionInfoCreate, AdmissionInfoUpdate
from ...services import AdmissionInfoService

router = APIRouter()


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "content_type", "audience_level", "school_id", "fields", "include"))
async def list_admission_info(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    content_type: str | None = None,
    audience_level: str | None = None,
    school_id: uuid.UUID | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(AdmissionInfo, fields)
    result = await AdmissionInfoService.list(
        db,
        page=page,
        per_page=per_page,
        content_type=content_type,
        audience_level=audience_level,
        school_id=school_id,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/admin", dependencies=[Depends(require_scope("academic:write"))])
async def list_admin_admission_info(
    db: DbSession,
    _: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    content_type: str | None = None,
    audience_level: str | None = None,
    school_id: uuid.UUID | None = None,
    is_published: bool | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(AdmissionInfo, fields)
    result = await AdmissionInfoService.list(
        db,
        page=page,
        per_page=per_page,
        content_type=content_type,
        audience_level=audience_level,
        school_id=school_id,
        is_published=is_published,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/id/{item_id}")
async def get_admission_info_by_id(item_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(AdmissionInfo, fields)
    item = await AdmissionInfoService.get_by_id(db, item_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission information not found")
    return success(data=selector.apply(item))


@router.get("/{slug}")
@cached_public(timeout=300)
async def get_admission_info(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(AdmissionInfo, fields)
    item = await AdmissionInfoService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission information not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("academic:write"))])
async def create_admission_info(data: AdmissionInfoCreate, db: DbSession, _: CurrentUser):
    item = await AdmissionInfoService.create(db, **data.model_dump())
    return success(data=item, message="Admission information created")


@router.patch("/{item_id}", dependencies=[Depends(require_scope("academic:write"))])
async def update_admission_info(item_id: uuid.UUID, data: AdmissionInfoUpdate, db: DbSession, _: CurrentUser):
    item = await AdmissionInfoService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission information not found")
    item = await AdmissionInfoService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Admission information updated")


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("academic:delete"))])
async def delete_admission_info(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await AdmissionInfoService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Admission information not found")
    await AdmissionInfoService.delete(db, item)
