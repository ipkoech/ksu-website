"""Admin user endpoints."""

from __future__ import annotations

from datetime import datetime
import uuid
from collections.abc import Sequence
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import select

from ksu_common.schemas.responses import success

from ....deps import CurrentUser, DbSession, require_scope
from ....models import Intake, Programme, User, UserRole
from ....schemas import UserCreate, UserUpdate
from ....services import RBACService, StaffService, UserService
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


def _scope_fallback(scope_type: str | None, scope_id: uuid.UUID | str | None) -> dict[str, Any] | None:
    if not scope_type:
        return None
    return {
        "id": scope_id,
        "name": scope_type.replace("_", " ").title(),
        "type": scope_type,
        "subtitle": None,
        "is_active": True,
    }


async def _resolve_user_role_scopes(
    db: DbSession,
    assignments: Sequence[UserRole],
) -> dict[tuple[str | None, uuid.UUID | None], dict[str, Any] | None]:
    keys = {(assignment.scope_type, assignment.scope_id) for assignment in assignments}
    resolved: dict[tuple[str | None, uuid.UUID | None], dict[str, Any] | None] = {
        (None, None): None,
        ("", None): None,
    }
    staff_scope_keys = [
        (scope_type, scope_id)
        for scope_type, scope_id in keys
        if scope_type in {"university", "division", "wing", "school", "department", "directorate"}
    ]
    if staff_scope_keys:
        resolved.update(await StaffService.get_entity_summaries(db, staff_scope_keys))

    programme_ids = {scope_id for scope_type, scope_id in keys if scope_type == "programme" and scope_id is not None}
    if programme_ids:
        result = await db.execute(select(Programme).where(Programme.id.in_(programme_ids)))
        for programme in result.scalars().all():
            resolved[("programme", programme.id)] = {
                "id": programme.id,
                "name": programme.name,
                "type": "programme",
                "subtitle": programme.code,
                "is_active": bool(programme.is_active),
            }

    intake_ids = {scope_id for scope_type, scope_id in keys if scope_type == "intake" and scope_id is not None}
    if intake_ids:
        result = await db.execute(select(Intake).where(Intake.id.in_(intake_ids)))
        for intake in result.scalars().all():
            resolved[("intake", intake.id)] = {
                "id": intake.id,
                "name": intake.name,
                "type": "intake",
                "subtitle": intake.code,
                "is_active": bool(intake.is_active),
            }

    for scope_type, scope_id in keys:
        resolved.setdefault((scope_type, scope_id), _scope_fallback(scope_type, scope_id))
    return resolved


async def _with_user_role_scopes(
    db: DbSession,
    assignments: Sequence[UserRole],
    data: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    summaries = await _resolve_user_role_scopes(db, assignments)
    assignments_by_id = {str(assignment.id): assignment for assignment in assignments}
    for index, row in enumerate(data):
        assignment = assignments_by_id.get(str(row.get("id"))) if row.get("id") else None
        if assignment is None and index < len(assignments):
            assignment = assignments[index]
        if assignment is None:
            row["scope"] = _scope_fallback(row.get("scope_type"), row.get("scope_id"))
            continue
        row["scope"] = summaries.get((assignment.scope_type, assignment.scope_id))
    return data


async def _with_user_scoped_roles(
    db: DbSession,
    user: User,
    data: dict[str, Any],
) -> dict[str, Any]:
    rows = data.get("role_assignments")
    if not isinstance(rows, list):
        return data
    assignments = list(getattr(user, "role_assignments", []) or [])
    data["role_assignments"] = await _with_user_role_scopes(db, assignments, rows)
    return data


async def _with_users_scoped_roles(
    db: DbSession,
    users: Sequence[User],
    data: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    users_by_id = {str(user.id): user for user in users}
    for index, row in enumerate(data):
        user = users_by_id.get(str(row.get("id"))) if row.get("id") else None
        if user is None and index < len(users):
            user = users[index]
        if user is not None:
            await _with_user_scoped_roles(db, user, row)
    return data


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
    data = selector.apply(result.items)
    data = await _with_users_scoped_roles(db, result.items, data)
    return success(data=data, meta=result.meta)


@router.get("/{user_id}", dependencies=[Depends(require_scope("users:read"))])
async def get_admin_user(user_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(User, fields)
    user = await UserService.get_by_id(db, user_id, load_options=selector.load_options)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    data = selector.apply(user)
    data = await _with_user_scoped_roles(db, user, data)
    return success(data=data)


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
    data = selector.apply(assignments)
    data = await _with_user_role_scopes(db, assignments, data)
    return success(data=data)


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
    data = selector.apply(updated_assignments)
    data = await _with_user_role_scopes(db, updated_assignments, data)
    return success(data=data, message="User roles updated")


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
    data = selector.apply([assignment])
    data = await _with_user_role_scopes(db, [assignment], data)
    return success(data=data[0] if data else None, message="Role assigned")
