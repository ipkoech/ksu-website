"""Department endpoints."""

from __future__ import annotations

import uuid
from types import SimpleNamespace

from fastapi import APIRouter, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ._person_media import with_person_photo_urls
from ...deps import CurrentUser, DbSession
from ...models import Department, DepartmentService as DepartmentServiceModel, Person, Programme
from ...security.scopes import can_access_scope
from ...schemas import DepartmentCreate, DepartmentUpdate
from ...services import DepartmentService, ProgrammeService

router = APIRouter()

DEPARTMENT_VIEW_PERMISSIONS = [
    "academic.view",
    "academic.manage_departments",
    "administration.view",
    "office.view",
]
DEPARTMENT_MANAGE_PERMISSIONS = [
    "academic.manage_departments",
    "administration.manage_units",
    "office.manage_content",
]


def _department_parent_scope(data) -> tuple[str, uuid.UUID | None]:
    school_id = getattr(data, "school_id", None)
    wing_id = getattr(data, "wing_id", None)
    if school_id:
        return ("school", school_id)
    if wing_id:
        return ("wing", wing_id)
    return ("university", None)


async def _can_access_department_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    department_id: uuid.UUID | None,
) -> bool:
    for permission in permissions:
        if await can_access_scope(db, user, permission, "department", department_id):
            return True
    return False


async def _require_department_scope(
    db: DbSession,
    user: CurrentUser,
    permissions: list[str],
    department_id: uuid.UUID | None,
) -> None:
    if not await _can_access_department_scope(db, user, permissions, department_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges for this department scope",
        )


async def _require_department_parent_scope(
    db: DbSession,
    user: CurrentUser,
    parent_scope_type: str,
    parent_scope_id: uuid.UUID | None,
) -> None:
    permissions = (
        ["academic.manage_departments"]
        if parent_scope_type == "school"
        else ["administration.manage_units", "office.manage_content"]
    )
    for permission in permissions:
        if await can_access_scope(db, user, permission, parent_scope_type, parent_scope_id):
            return
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Insufficient privileges for this department parent scope",
    )


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "school_id", "wing_id", "department_type", "search", "fields", "include"))
async def list_departments(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    school_id: uuid.UUID | None = None,
    wing_id: uuid.UUID | None = None,
    department_type: str | None = None,
    search: str | None = None,
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
        search=search,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/admin")
async def list_admin_departments(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    school_id: uuid.UUID | None = None,
    wing_id: uuid.UUID | None = None,
    department_type: str | None = None,
    search: str | None = None,
    is_active: bool | None = None,
    is_public: bool | None = None,
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
        search=search,
        is_active=is_active,
        is_public=is_public,
        load_options=selector.load_options,
    )
    items = []
    for item in result.items:
        if await _can_access_department_scope(db, user, DEPARTMENT_VIEW_PERMISSIONS, item.id):
            items.append(item)
    meta = dict(result.meta)
    meta["total"] = len(items)
    return success(data=selector.apply(items), meta=meta)


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_department(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Department, fields)
    department = await DepartmentService.get_by_slug(db, slug, load_options=selector.load_options)
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    return success(data=selector.apply(department))


@router.get("/id/{department_id}")
async def get_department_by_id(department_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(Department, fields)
    department = await DepartmentService.get_by_id(db, department_id, is_active=None, load_options=selector.load_options)
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    return success(data=selector.apply(department))


@router.get("/{slug}/staff")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_department_staff(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    department = await DepartmentService.get_by_slug(db, slug)
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    selector = build_selector(Person, fields)
    staff = await DepartmentService.get_staff(db, department.id)
    return success(data=with_person_photo_urls(selector.apply(staff), staff))


@router.get("/{slug}/services")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_department_services(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    department = await DepartmentService.get_by_slug(db, slug)
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    selector = build_selector(DepartmentServiceModel, fields)
    items = await DepartmentService.get_services(db, department.id)
    return success(data=selector.apply(items))


@router.get("/{slug}/programmes")
@cached_public(timeout=300, vary_on=("slug", "page", "per_page", "fields", "include"))
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


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_department(data: DepartmentCreate, db: DbSession, user: CurrentUser):
    parent_scope_type, parent_scope_id = _department_parent_scope(data)
    await _require_department_parent_scope(db, user, parent_scope_type, parent_scope_id)
    try:
        department = await DepartmentService.create(db, **data.model_dump())
    except ValueError as exc:
        detail = str(exc)
        status_code = status.HTTP_409_CONFLICT if "already assigned" in detail else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return success(data=department, message="Department created")


@router.patch("/{department_id}")
async def update_department(department_id: uuid.UUID, data: DepartmentUpdate, db: DbSession, user: CurrentUser):
    department = await DepartmentService.get_by_id(db, department_id, is_active=None)
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    await _require_department_scope(db, user, DEPARTMENT_MANAGE_PERMISSIONS, department.id)
    payload = data.model_dump(exclude_unset=True)
    next_parent = SimpleNamespace(
        school_id=payload.get("school_id", department.school_id),
        wing_id=payload.get("wing_id", department.wing_id),
    )
    parent_scope_type, parent_scope_id = _department_parent_scope(next_parent)
    await _require_department_parent_scope(db, user, parent_scope_type, parent_scope_id)
    try:
        department = await DepartmentService.update(db, department, **payload)
    except ValueError as exc:
        detail = str(exc)
        status_code = status.HTTP_409_CONFLICT if "already assigned" in detail else status.HTTP_400_BAD_REQUEST
        raise HTTPException(status_code=status_code, detail=detail) from exc
    return success(data=department, message="Department updated")


@router.delete("/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_department(department_id: uuid.UUID, db: DbSession, user: CurrentUser):
    department = await DepartmentService.get_by_id(db, department_id, is_active=None)
    if department is None:
        raise HTTPException(status_code=404, detail="Department not found")
    await _require_department_scope(db, user, DEPARTMENT_MANAGE_PERMISSIONS, department.id)
    await DepartmentService.delete(db, department)
