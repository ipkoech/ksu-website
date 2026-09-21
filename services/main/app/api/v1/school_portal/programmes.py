"""School-owned programme endpoints."""

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from ksu_common.schemas.responses import SuccessResponse, success

from ....deps import DbSession
from ....schemas.school_portal_academics import (
    SchoolAcademicImportRequest,
    SchoolProgrammeCreate,
    SchoolProgrammeUpdate,
)
from ....schemas.admissions import ProgrammeSnapshot
from ....schemas.imports import ImportCommitRead, ImportPreviewRead
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

PROGRAMME_LIST_FIELDS = (
    "id", "name", "code", "slug", "external_source", "external_source_id",
    "external_name", "level", "mode_of_study", "duration", "credits_required",
    "department_id", "about", "objectives", "career_prospects",
    "curriculum_overview", "entry_requirements", "cluster_subjects",
    "fees_structure", "intake_months", "min_students", "max_students",
    "accreditation_status", "accrediting_body", "cover_image_id", "brochure_id",
    "is_active", "display_order",
)


@router.get(
    "/programmes",
    response_model=SuccessResponse[list[ProgrammeSnapshot]],
    response_model_exclude_unset=True,
)
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
    # Return a detached-safe list projection. ProgrammeSnapshot also supports
    # nested tutor/intake/media relationships for detail responses, but
    # serializing those ORM relationships here caused lazy loading after the
    # request session had been released and produced a 500 for this route.
    items = []
    for programme in result.items:
        item = {field: getattr(programme, field) for field in PROGRAMME_LIST_FIELDS}
        department = programme.department
        item["department"] = (
            {"id": department.id, "name": department.name}
            if department is not None
            else None
        )
        items.append(item)
    return success(data=items, meta=result.meta)


@router.post(
    "/programmes",
    status_code=status.HTTP_201_CREATED,
    response_model=SuccessResponse[ProgrammeSnapshot],
    response_model_exclude_unset=True,
)
async def post_programme(
    data: SchoolProgrammeCreate,
    db: DbSession,
    context: CurrentSchoolContext,
):
    return success(data=await create_school_programme(db, context, data))


@router.post(
    "/programmes/imports/preview",
    response_model=SuccessResponse[ImportPreviewRead],
    response_model_exclude_unset=True,
)
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


@router.post(
    "/programmes/imports",
    response_model=SuccessResponse[ImportCommitRead],
    response_model_exclude_unset=True,
)
async def commit_programme_import(
    data: SchoolAcademicImportRequest,
    db: DbSession,
    context: CurrentSchoolContext,
):
    if data.resource != "programmes":
        raise HTTPException(status_code=422, detail="Expected programmes import")
    return success(data=await commit_school_academic_import(db, context, data))


@router.get(
    "/programmes/{programme_id}",
    response_model=SuccessResponse[ProgrammeSnapshot],
    response_model_exclude_unset=True,
)
async def get_programme(
    programme_id: uuid.UUID,
    db: DbSession,
    context: CurrentSchoolContext,
):
    return success(data=await get_school_programme(db, context, programme_id))


@router.patch(
    "/programmes/{programme_id}",
    response_model=SuccessResponse[ProgrammeSnapshot],
    response_model_exclude_unset=True,
)
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
