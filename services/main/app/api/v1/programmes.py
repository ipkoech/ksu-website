"""Programme endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import ApiKeyAuth, CurrentUser, DbSession, require_api_key_scope, require_scope
from ...models import Person, Programme
from ...schemas import ProgrammeCreate, ProgrammeIntakeCreate, ProgrammeTutorCreate, ProgrammeUpdate
from ...services import ProgrammeService

router = APIRouter()


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "q", "school_id", "department_id", "level", "mode_of_study", "fields", "include"))
async def list_programmes(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    q: str | None = None,
    school_id: uuid.UUID | None = None,
    department_id: uuid.UUID | None = None,
    level: str | None = None,
    mode_of_study: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Programme, fields)
    result = await ProgrammeService.list(
        db,
        page=page,
        per_page=per_page,
        q=q,
        school_id=school_id,
        department_id=department_id,
        level=level,
        mode_of_study=mode_of_study,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{slug}")
@cached_public(timeout=300)
async def get_programme(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Programme, fields)
    programme = await ProgrammeService.get_by_slug(db, slug, load_options=selector.load_options)
    if programme is None:
        raise HTTPException(status_code=404, detail="Programme not found")
    return success(data=selector.apply(programme))


@router.get("/id/{programme_id}")
async def get_programme_by_id(programme_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(Programme, fields)
    programme = await ProgrammeService.get_by_id(db, programme_id, load_options=selector.load_options)
    if programme is None:
        raise HTTPException(status_code=404, detail="Programme not found")
    return success(data=selector.apply(programme))


@router.get("/{slug}/staff")
@cached_public(timeout=300)
async def get_programme_staff(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    programme = await ProgrammeService.get_by_slug(db, slug)
    if programme is None:
        raise HTTPException(status_code=404, detail="Programme not found")
    selector = build_selector(Person, fields)
    staff = await ProgrammeService.get_staff(db, programme.id)
    return success(data=selector.apply(staff))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("academic:write"))])
async def create_programme(data: ProgrammeCreate, db: DbSession, _: CurrentUser):
    programme = await ProgrammeService.create(db, **data.model_dump())
    return success(data=programme, message="Programme created")


@router.patch("/{programme_id}", dependencies=[Depends(require_scope("academic:write"))])
async def update_programme(programme_id: uuid.UUID, data: ProgrammeUpdate, db: DbSession, _: CurrentUser):
    programme = await ProgrammeService.get_by_id(db, programme_id)
    if programme is None:
        raise HTTPException(status_code=404, detail="Programme not found")
    programme = await ProgrammeService.update(db, programme, **data.model_dump(exclude_unset=True))
    return success(data=programme, message="Programme updated")


@router.post("/{programme_id}/tutors", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("academic:write"))])
async def add_programme_tutor(programme_id: uuid.UUID, data: ProgrammeTutorCreate, db: DbSession, _: CurrentUser):
    programme = await ProgrammeService.get_by_id(db, programme_id)
    if programme is None:
        raise HTTPException(status_code=404, detail="Programme not found")
    tutor = await ProgrammeService.add_tutor(
        db,
        programme_id,
        data.person_id,
        role=data.role,
        is_lead=data.is_lead,
    )
    return success(data=tutor, message="Programme tutor saved")


@router.post("/{programme_id}/intakes", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("academic:write"))])
async def attach_programme_intake(programme_id: uuid.UUID, data: ProgrammeIntakeCreate, db: DbSession, _: CurrentUser):
    programme = await ProgrammeService.get_by_id(db, programme_id)
    if programme is None:
        raise HTTPException(status_code=404, detail="Programme not found")
    item = await ProgrammeService.attach_intake(
        db,
        programme_id,
        data.intake_id,
        slots_available=data.slots_available,
        application_deadline=data.application_deadline,
        is_active=data.is_active,
    )
    return success(data=item, message="Programme intake saved")


@router.delete("/{programme_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("academic:delete"))])
async def delete_programme(programme_id: uuid.UUID, db: DbSession, _: CurrentUser):
    programme = await ProgrammeService.get_by_id(db, programme_id)
    if programme is None:
        raise HTTPException(status_code=404, detail="Programme not found")
    await ProgrammeService.delete(db, programme)


# API Key authenticated endpoints for external developers

@router.get("/api/list")
async def list_programmes_api_key(
    db: DbSession,
    api_key: ApiKeyAuth,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    q: str | None = None,
    school_id: uuid.UUID | None = None,
    department_id: uuid.UUID | None = None,
    level: str | None = None,
    mode_of_study: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    """List programmes via API key authentication."""
    selector = build_selector(Programme, fields)
    result = await ProgrammeService.list(
        db,
        page=page,
        per_page=per_page,
        q=q,
        school_id=school_id,
        department_id=department_id,
        level=level,
        mode_of_study=mode_of_study,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/api/{slug}")
async def get_programme_api_key(slug: str, db: DbSession, api_key: ApiKeyAuth, fields: FieldSelection = FieldsDep):
    """Get programme by slug via API key authentication."""
    selector = build_selector(Programme, fields)
    programme = await ProgrammeService.get_by_slug(db, slug, load_options=selector.load_options)
    if programme is None:
        raise HTTPException(status_code=404, detail="Programme not found")
    return success(data=selector.apply(programme))
