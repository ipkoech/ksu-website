"""Department endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, require_scope
from ...models import Department, DepartmentService as DepartmentServiceModel, Person, Programme
from ...schemas import DepartmentCreate, DepartmentUpdate
from ...services import DepartmentService, ProgrammeService

router = APIRouter()


@router.get("")
@cached_public(timeout=300)
async def list_departments(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    school_id: uuid.UUID | None = None,
    wing_id: uuid.UUID | None = None,
    department_type: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Department, fields)
    result = await DepartmentService.list(
        db,
        page=page,
        per_page=per_page,
        school_id=school_id,
        wing_id=wing_id,
        department_type=department_type,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{slug}")
@cached_public(timeout=300)
async def get_department(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Department, fields)
    department = await DepartmentService.get_by_slug(db, slug, load_options=selector.load_options)
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    return success(data=selector.apply(department))


@router.get("/{slug}/staff")
@cached_public(timeout=300)
async def get_department_staff(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    department = await DepartmentService.get_by_slug(db, slug)
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    selector = build_selector(Person, fields)
    staff = await DepartmentService.get_staff(db, department.id)
    return success(data=selector.apply(staff))


@router.get("/{slug}/services")
@cached_public(timeout=300)
async def get_department_services(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    department = await DepartmentService.get_by_slug(db, slug)
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    selector = build_selector(DepartmentServiceModel, fields)
    items = await DepartmentService.get_services(db, department.id)
    return success(data=selector.apply(items))


@router.get("/{slug}/programmes")
@cached_public(timeout=300)
async def get_department_programmes(
    slug: str,
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    fields: FieldSelection = FieldsDep,
):
    department = await DepartmentService.get_by_slug(db, slug)
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    selector = build_selector(Programme, fields)
    result = await ProgrammeService.list(db, page=page, per_page=per_page, department_id=department.id, load_options=selector.load_options)
    return success(data=selector.apply(result.items), meta=result.meta)


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("academic:write"))])
async def create_department(data: DepartmentCreate, db: DbSession, _: CurrentUser):
    department = await DepartmentService.create(db, **data.model_dump())
    return success(data=department, message="Department created")


@router.patch("/{department_id}", dependencies=[Depends(require_scope("academic:write"))])
async def update_department(department_id: uuid.UUID, data: DepartmentUpdate, db: DbSession, _: CurrentUser):
    department = await DepartmentService.get_by_id(db, department_id)
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    department = await DepartmentService.update(db, department, **data.model_dump(exclude_unset=True))
    return success(data=department, message="Department updated")


@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("academic:delete"))])
async def delete_department(department_id: uuid.UUID, db: DbSession, _: CurrentUser):
    department = await DepartmentService.get_by_id(db, department_id)
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    department.is_active = False
