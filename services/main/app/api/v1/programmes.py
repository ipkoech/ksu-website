"""Programme endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import ApiKeyAuth, CurrentUser, DbSession
from ...models import Person, Programme
from ...security.scopes import can_access_scope
from ...schemas import ProgrammeCreate, ProgrammeIntakeCreate, ProgrammeTutorCreate, ProgrammeUpdate
from ...services import ProgrammeService

router = APIRouter()

PROGRAMME_VIEW_PERMISSIONS = [
    "academic.view",
    "academic.manage_programmes",
    "programmes.view",
    "programmes.manage",
]
PROGRAMME_MANAGE_PERMISSIONS = ["academic.manage_programmes", "programmes.manage"]


async def _can_access_programme_department_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    department_id: uuid.UUID | None,
) -> bool:
    for permission in permissions:
        if await can_access_scope(db, user, permission, "department", department_id):
            return True
    return False


async def _require_programme_department_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    department_id: uuid.UUID | None,
) -> None:
    if not await _can_access_programme_department_scope(db, user, permissions, department_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges for this programme department scope",
        )


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


@router.get("/admin")
async def list_admin_programmes(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    q: str | None = None,
    school_id: uuid.UUID | None = None,
    department_id: uuid.UUID | None = None,
    level: str | None = None,
    mode_of_study: str | None = None,
    is_active: bool | None = None,
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
        is_active=is_active,
        load_options=selector.load_options,
    )
    items = []
    for item in result.items:
        if await _can_access_programme_department_scope(
            db,
            user,
            PROGRAMME_VIEW_PERMISSIONS,
            item.department_id,
        ):
            items.append(item)
    meta = dict(result.meta)
    meta["total"] = len(items)
    return success(data=selector.apply(items), meta=meta)


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
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
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_programme_staff(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    programme = await ProgrammeService.get_by_slug(db, slug)
    if programme is None:
        raise HTTPException(status_code=404, detail="Programme not found")
    selector = build_selector(Person, fields)
    staff = await ProgrammeService.get_staff(db, programme.id)
    return success(data=selector.apply(staff))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_programme(data: ProgrammeCreate, db: DbSession, user: CurrentUser):
    await _require_programme_department_scope(
        db,
        user,
        PROGRAMME_MANAGE_PERMISSIONS,
        data.department_id,
    )
    programme = await ProgrammeService.create(db, **data.model_dump())
    return success(data=programme, message="Programme created")


@router.patch("/{programme_id}")
async def update_programme(programme_id: uuid.UUID, data: ProgrammeUpdate, db: DbSession, user: CurrentUser):
    programme = await ProgrammeService.get_by_id(db, programme_id)
    if programme is None:
        raise HTTPException(status_code=404, detail="Programme not found")
    await _require_programme_department_scope(
        db,
        user,
        PROGRAMME_MANAGE_PERMISSIONS,
        programme.department_id,
    )
    payload = data.model_dump(exclude_unset=True)
    await _require_programme_department_scope(
        db,
        user,
        PROGRAMME_MANAGE_PERMISSIONS,
        payload.get("department_id", programme.department_id),
    )
    programme = await ProgrammeService.update(db, programme, **payload)
    return success(data=programme, message="Programme updated")


@router.post("/{programme_id}/tutors", status_code=status.HTTP_201_CREATED)
async def add_programme_tutor(programme_id: uuid.UUID, data: ProgrammeTutorCreate, db: DbSession, user: CurrentUser):
    programme = await ProgrammeService.get_by_id(db, programme_id)
    if programme is None:
        raise HTTPException(status_code=404, detail="Programme not found")
    await _require_programme_department_scope(
        db,
        user,
        PROGRAMME_MANAGE_PERMISSIONS,
        programme.department_id,
    )
    tutor = await ProgrammeService.add_tutor(
        db,
        programme_id,
        data.person_id,
        role=data.role,
        is_lead=data.is_lead,
    )
    return success(data=tutor, message="Programme tutor saved")


@router.post("/{programme_id}/intakes", status_code=status.HTTP_201_CREATED)
async def attach_programme_intake(programme_id: uuid.UUID, data: ProgrammeIntakeCreate, db: DbSession, user: CurrentUser):
    programme = await ProgrammeService.get_by_id(db, programme_id)
    if programme is None:
        raise HTTPException(status_code=404, detail="Programme not found")
    await _require_programme_department_scope(
        db,
        user,
        PROGRAMME_MANAGE_PERMISSIONS,
        programme.department_id,
    )
    item = await ProgrammeService.attach_intake(
        db,
        programme_id,
        data.intake_id,
        slots_available=data.slots_available,
        application_deadline=data.application_deadline,
        is_active=data.is_active,
    )
    return success(data=item, message="Programme intake saved")


@router.delete("/{programme_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_programme(programme_id: uuid.UUID, db: DbSession, user: CurrentUser):
    programme = await ProgrammeService.get_by_id(db, programme_id)
    if programme is None:
        raise HTTPException(status_code=404, detail="Programme not found")
    await _require_programme_department_scope(
        db,
        user,
        PROGRAMME_MANAGE_PERMISSIONS,
        programme.department_id,
    )
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
