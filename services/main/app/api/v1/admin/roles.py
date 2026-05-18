"""Admin role endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from ksu_common.schemas.responses import success

from ....deps import CurrentUser, DbSession, require_scope
from ....models import Permission, Role
from ....schemas import RoleCreate, RoleUpdate
from ....services import RBACService
from .._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()


class RolePermissionsUpdatePayload(BaseModel):
    permissions: list[str] = Field(default_factory=list)


class RoleCreatePayload(RoleCreate):
    permissions: list[str] = Field(default_factory=list)


@router.get("", dependencies=[Depends(require_scope("roles:read"))])
async def list_roles(
    db: DbSession,
    _: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = Query(default=None),
    system: bool | None = Query(default=None),
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Role, fields)
    result = await RBACService.list_roles(
        db,
        page=page,
        per_page=per_page,
        search=search,
        is_system=system,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{role_id}", dependencies=[Depends(require_scope("roles:read"))])
async def get_role(role_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(Role, fields)
    role = await RBACService.get_role(db, role_id)
    if role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    return success(data=selector.apply(role))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("roles:write"))])
async def create_role(data: RoleCreatePayload, db: DbSession, _: CurrentUser):
    role_data = data.model_dump(exclude={"permissions"})
    role = await RBACService.create_role(db, **role_data)
    if data.permissions:
        role = await RBACService.set_role_permissions(db, role, data.permissions)
    return success(data=role, message="Role created")


@router.patch("/{role_id}", dependencies=[Depends(require_scope("roles:write"))])
@router.put("/{role_id}", dependencies=[Depends(require_scope("roles:write"))])
async def update_role(role_id: uuid.UUID, data: RoleUpdate, db: DbSession, _: CurrentUser):
    role = await RBACService.get_role(db, role_id)
    if role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    role = await RBACService.update_role(db, role, **data.model_dump(exclude_unset=True))
    return success(data=role, message="Role updated")


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("roles:delete"))])
async def delete_role(role_id: uuid.UUID, db: DbSession, _: CurrentUser):
    role = await RBACService.get_role(db, role_id)
    if role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    await RBACService.delete_role(db, role)


@router.get("/{role_id}/permissions", dependencies=[Depends(require_scope("roles:read"))])
async def get_role_permissions(role_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    role = await RBACService.get_role(db, role_id)
    if role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    selector = build_selector(Permission, fields)
    permissions = [rp.permission for rp in role.role_permissions if rp.permission and rp.permission.is_active]
    return success(data=selector.apply(permissions))


@router.put("/{role_id}/permissions", dependencies=[Depends(require_scope("roles:write"))])
async def update_role_permissions(role_id: uuid.UUID, data: RolePermissionsUpdatePayload, db: DbSession, _: CurrentUser):
    role = await RBACService.get_role(db, role_id)
    if role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    role = await RBACService.set_role_permissions(db, role, data.permissions)
    return success(data=role, message="Role permissions updated")
