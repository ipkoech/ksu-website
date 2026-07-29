"""School-owned department endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from ksu_common.schemas.responses import success

from ....deps import DbSession
from ....schemas.school_portal_academics import (
    SchoolAcademicImportRequest,
    SchoolDepartmentCreate,
    SchoolDepartmentUpdate,
)
from ....services.academic import DepartmentService
from ....services.school_portal_academics import (
    create_school_department,
    commit_school_academic_import,
    delete_school_department,
    get_school_department,
    preview_school_academic_import,
    update_school_department,
)
from ....services.school_portal_context import CurrentSchoolContext

router = APIRouter()


@router.get("/departments")
async def list_departments(
    db: DbSession,
    context: CurrentSchoolContext,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = None,
    department_type: str | None = None,
    is_active: bool | None = None,
    is_public: bool | None = None,
):
    if "school.departments.view" not in context.permissions:
        raise HTTPException(status_code=403, detail="school.departments.view permission is required")
    result = await DepartmentService.list(
        db,
        page=page,
        per_page=per_page,
        school_id=context.school.id,
        search=search,
        department_type=department_type,
        is_active=is_active,
        is_public=is_public,
    )
    return success(data=result.items, meta=result.meta)


@router.post("/departments", status_code=status.HTTP_201_CREATED)
async def post_department(
    data: SchoolDepartmentCreate,
    db: DbSession,
    context: CurrentSchoolContext,
):
    return success(data=await create_school_department(db, context, data))


@router.post("/departments/imports/preview")
async def preview_department_import(
    data: SchoolAcademicImportRequest,
    db: DbSession,
    context: CurrentSchoolContext,
):
    if "school.departments.bulk" not in context.permissions:
        raise HTTPException(status_code=403, detail="school.departments.bulk permission is required")
    if data.resource != "departments":
        raise HTTPException(status_code=422, detail="Expected departments import")
    return success(
        data=await preview_school_academic_import(
            db, "departments", context.school.id, data.rows
        )
    )


@router.post("/departments/imports")
async def commit_department_import(
    data: SchoolAcademicImportRequest,
    db: DbSession,
    context: CurrentSchoolContext,
):
    if data.resource != "departments":
        raise HTTPException(status_code=422, detail="Expected departments import")
    return success(data=await commit_school_academic_import(db, context, data))


@router.get("/departments/{department_id}")
async def get_department(
    department_id: uuid.UUID,
    db: DbSession,
    context: CurrentSchoolContext,
):
    return success(data=await get_school_department(db, context, department_id))


@router.patch("/departments/{department_id}")
async def patch_department(
    department_id: uuid.UUID,
    data: SchoolDepartmentUpdate,
    db: DbSession,
    context: CurrentSchoolContext,
):
    return success(
        data=await update_school_department(db, context, department_id, data)
    )


@router.delete("/departments/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_department(
    department_id: uuid.UUID,
    db: DbSession,
    context: CurrentSchoolContext,
):
    await delete_school_department(db, context, department_id)


__all__ = ["router"]
