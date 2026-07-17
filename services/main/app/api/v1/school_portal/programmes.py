"""School-owned programme endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from ksu_common.schemas.responses import success

from ....deps import DbSession
from ....schemas.school_portal_academics import (
    SchoolAcademicImportRequest,
    SchoolProgrammeCreate,
    SchoolProgrammeUpdate,
)
from ....services.admissions import ProgrammeService
from ....services.school_portal_academics import (
    create_school_programme,
    commit_school_academic_import,
    delete_school_programme,
    get_school_programme,
    preview_school_academic_import,
    update_school_programme,
)
from ....services.school_portal_context import CurrentSchoolContext

router = APIRouter()


@router.get("/programmes")
async def list_programmes(
    db: DbSession,
    context: CurrentSchoolContext,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = None,
    department_id: uuid.UUID | None = None,
    level: str | None = None,
    mode_of_study: str | None = None,
    is_active: bool | None = None,
):
    if "school.programmes.view" not in context.permissions:
        raise HTTPException(status_code=403, detail="school.programmes.view permission is required")
    result = await ProgrammeService.list(
        db,
        page=page,
        per_page=per_page,
        q=search,
        school_id=context.school.id,
        department_id=department_id,
        level=level,
        mode_of_study=mode_of_study,
        is_active=is_active,
    )
    return success(data=result.items, meta=result.meta)


@router.post("/programmes", status_code=status.HTTP_201_CREATED)
async def post_programme(
    data: SchoolProgrammeCreate,
    db: DbSession,
    context: CurrentSchoolContext,
):
    return success(data=await create_school_programme(db, context, data))


@router.post("/programmes/imports/preview")
async def preview_programme_import(
    data: SchoolAcademicImportRequest,
    db: DbSession,
    context: CurrentSchoolContext,
):
    if "school.programmes.bulk" not in context.permissions:
        raise HTTPException(status_code=403, detail="school.programmes.bulk permission is required")
    if data.resource != "programmes":
        raise HTTPException(status_code=422, detail="Expected programmes import")
    return success(
        data=await preview_school_academic_import(
            db, "programmes", context.school.id, data.rows
        )
    )


@router.post("/programmes/imports")
async def commit_programme_import(
    data: SchoolAcademicImportRequest,
    db: DbSession,
    context: CurrentSchoolContext,
):
    if data.resource != "programmes":
        raise HTTPException(status_code=422, detail="Expected programmes import")
    return success(data=await commit_school_academic_import(db, context, data))


@router.get("/programmes/{programme_id}")
async def get_programme(
    programme_id: uuid.UUID,
    db: DbSession,
    context: CurrentSchoolContext,
):
    return success(data=await get_school_programme(db, context, programme_id))


@router.patch("/programmes/{programme_id}")
async def patch_programme(
    programme_id: uuid.UUID,
    data: SchoolProgrammeUpdate,
    db: DbSession,
    context: CurrentSchoolContext,
):
    return success(
        data=await update_school_programme(db, context, programme_id, data)
    )


@router.delete("/programmes/{programme_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_programme(
    programme_id: uuid.UUID,
    db: DbSession,
    context: CurrentSchoolContext,
):
    await delete_school_programme(db, context, programme_id)


__all__ = ["router"]
