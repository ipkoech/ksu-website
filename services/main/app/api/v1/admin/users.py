"""Admin user endpoints."""

from __future__ import annotations

from datetime import datetime
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from ksu_common.schemas.responses import success

from ....deps import CurrentUser, DbSession, require_scope
from ....models import User, UserRole
from ....schemas import UserCreate, UserUpdate
from ....services import RBACService, UserService
from .._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()


class UserRoleAssignmentPayload(BaseModel):
    role_id: uuid.UUID
    scope_type: str | None = Field(default=None, max_length=32)
    scope_id: uuid.UUID | None = None
    expires_at: datetime | None = None
    note: str | None = Field(default=None, max_length=255)


class UserRolesUpdatePayload(BaseModel):
    roles: list[UserRoleAssignmentPayload] = Field(default_factory=list)


@router.get("", dependencies=[Depends(require_scope("users:read"))])
async def list_admin_users(
    db: DbSession,
    _: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = Query(default=None),
    status: str | None = Query(default=None),
    role: str | None = Query(default=None),
    sort: str = Query(default="created_at"),
    order: str = Query(default="desc"),
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(User, fields)
    is_active = None
    if status == "active":
        is_active = True
    elif status == "inactive":
        is_active = False

    result = await UserService.list(
        db,
        page=page,
        per_page=per_page,
        search=search,
        is_active=is_active,
        role_name=role,
        sort=sort,
        order=order,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{user_id}", dependencies=[Depends(require_scope("users:read"))])
async def get_admin_user(user_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(User, fields)
    user = await UserService.get_by_id(db, user_id, load_options=selector.load_options)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return success(data=selector.apply(user))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("users:write"))])
async def create_admin_user(data: UserCreate, db: DbSession, _: CurrentUser):
    user = await UserService.create(db, **data.model_dump())
    return success(data=user, message="User created")


@router.patch("/{user_id}", dependencies=[Depends(require_scope("users:write"))])
@router.put("/{user_id}", dependencies=[Depends(require_scope("users:write"))])
async def update_admin_user(user_id: uuid.UUID, data: UserUpdate, db: DbSession, _: CurrentUser):
    user = await UserService.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user = await UserService.update(db, user, **data.model_dump(exclude_unset=True))
    return success(data=user, message="User updated")


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("users:delete"))])
async def delete_admin_user(user_id: uuid.UUID, db: DbSession, _: CurrentUser):
    user = await UserService.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    await UserService.delete(db, user)


@router.get("/{user_id}/roles", dependencies=[Depends(require_scope("roles:read"))])
async def list_admin_user_roles(user_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    user = await UserService.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    selector = build_selector(UserRole, fields)
    assignments = await RBACService.get_user_roles(db, user_id)
    return success(data=selector.apply(assignments))


@router.put("/{user_id}/roles", dependencies=[Depends(require_scope("roles:write"))])
async def update_admin_user_roles(
    user_id: uuid.UUID,
    data: UserRolesUpdatePayload,
    db: DbSession,
    current_user: CurrentUser,
    fields: FieldSelection = FieldsDep,
):
    user = await UserService.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    existing_assignments = await RBACService.get_user_roles(db, user_id)
    requested_keys = {
        (item.role_id, item.scope_type, item.scope_id)
        for item in data.roles
    }

    for assignment in existing_assignments:
        key = (assignment.role_id, assignment.scope_type, assignment.scope_id)
        if assignment.is_active and key not in requested_keys:
            await RBACService.revoke_role(db, assignment.id)

    for item in data.roles:
        await RBACService.assign_role(
            db,
            user_id,
            item.role_id,
            scope_type=item.scope_type,
            scope_id=item.scope_id,
            granted_by_id=current_user.id,
            expires_at=item.expires_at,
            note=item.note,
        )

    selector = build_selector(UserRole, fields)
    updated_assignments = await RBACService.get_user_roles(db, user_id)
    return success(data=selector.apply(updated_assignments), message="User roles updated")


@router.post("/{user_id}/roles/{role_id}", dependencies=[Depends(require_scope("roles:write"))])
async def assign_user_role(
    user_id: uuid.UUID,
    role_id: uuid.UUID,
    db: DbSession,
    user: CurrentUser,
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    fields: FieldSelection = FieldsDep,
):
    assignment = await RBACService.assign_role(db, user_id, role_id, scope_type=scope_type, scope_id=scope_id, granted_by_id=user.id)
    selector = build_selector(UserRole, fields)
    return success(data=selector.apply(assignment), message="Role assigned")
