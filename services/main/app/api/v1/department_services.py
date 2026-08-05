"""Department service catalog endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, HTTPException, Query, status

from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession
from ...models import DepartmentService as DepartmentServiceModel
from ...schemas import DepartmentServiceCreate, DepartmentServiceUpdate
from ...security.scopes import can_access_scope
from ...services import DepartmentServiceCatalogService

router = APIRouter()

DEPARTMENT_SERVICE_VIEW_PERMISSIONS = [
    "academic.view",
    "academic.manage_departments",
    "administration.view",
    "office.view",
]
DEPARTMENT_SERVICE_MANAGE_PERMISSIONS = [
    "academic.manage_departments",
    "administration.manage_units",
    "office.manage_content",
]


async def _can_access_department(db: DbSession, user: CurrentUser, permissions: list[str], department_id: uuid.UUID) -> bool:
    for permission in permissions:
        if await can_access_scope(db, user, permission, "department", department_id):
            return True
    return False


async def _require_department_access(db: DbSession, user: CurrentUser, permissions: list[str], department_id: uuid.UUID) -> None:
    if not await _can_access_department(db, user, permissions, department_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient privileges for this department service",
        )


@router.get("/admin")
async def list_admin_department_services(
    db: DbSession,
    user: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    department_id: uuid.UUID | None = None,
    search: str | None = None,
    is_active: bool | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(DepartmentServiceModel, fields)
    result = await DepartmentServiceCatalogService.list(
        db,
        page=page,
        per_page=per_page,
        department_id=department_id,
        search=search,
        is_active=is_active,
        load_options=selector.load_options,
    )
    items = []
    for item in result.items:
        if await _can_access_department(db, user, DEPARTMENT_SERVICE_VIEW_PERMISSIONS, item.department_id):
            items.append(item)
    meta = dict(result.meta)
    meta["total"] = len(items)
    return success(data=selector.apply(items), meta=meta)


@router.get("/{service_id}")
async def get_department_service(service_id: uuid.UUID, db: DbSession, user: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(DepartmentServiceModel, fields)
    item = await DepartmentServiceCatalogService.get_by_id(db, service_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Department service not found")
    await _require_department_access(db, user, DEPARTMENT_SERVICE_VIEW_PERMISSIONS, item.department_id)
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_department_service(data: DepartmentServiceCreate, db: DbSession, user: CurrentUser):
    await _require_department_access(db, user, DEPARTMENT_SERVICE_MANAGE_PERMISSIONS, data.department_id)
    item = await DepartmentServiceCatalogService.create(db, **data.model_dump())
    return success(data=item, message="Department service created")


@router.patch("/{service_id}")
async def update_department_service(service_id: uuid.UUID, data: DepartmentServiceUpdate, db: DbSession, user: CurrentUser):
    item = await DepartmentServiceCatalogService.get_by_id(db, service_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Department service not found")
    await _require_department_access(db, user, DEPARTMENT_SERVICE_MANAGE_PERMISSIONS, item.department_id)
    payload = data.model_dump(exclude_unset=True)
    next_department_id = payload.get("department_id", item.department_id)
    await _require_department_access(db, user, DEPARTMENT_SERVICE_MANAGE_PERMISSIONS, next_department_id)
    item = await DepartmentServiceCatalogService.update(db, item, **payload)
    return success(data=item, message="Department service updated")


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_department_service(service_id: uuid.UUID, db: DbSession, user: CurrentUser):
    item = await DepartmentServiceCatalogService.get_by_id(db, service_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Department service not found")
    await _require_department_access(db, user, DEPARTMENT_SERVICE_MANAGE_PERMISSIONS, item.department_id)
    await DepartmentServiceCatalogService.delete(db, item)
