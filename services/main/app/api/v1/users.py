"""User endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, require_scope
from ...models import User
from ...schemas import UserCreate, UserUpdate
from ...services import UserService
from ._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()


@router.get("")
async def list_users(
    db: DbSession,
    _: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(User, fields)
    result = await UserService.list(db, page=page, per_page=per_page, search=search, is_active=is_active, load_options=selector.load_options)
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{user_id}")
async def get_user(user_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(User, fields)
    user = await UserService.get_by_id(db, user_id, load_options=selector.load_options)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return success(data=selector.apply(user))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("users:write"))])
async def create_user(data: UserCreate, db: DbSession, _: CurrentUser):
    user = await UserService.create(db, **data.model_dump())
    await db.refresh(user)
    return success(data=user, message="User created")


@router.patch("/{user_id}", dependencies=[Depends(require_scope("users:write"))])
async def update_user(user_id: uuid.UUID, data: UserUpdate, db: DbSession, _: CurrentUser):
    user = await UserService.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user = await UserService.update(db, user, **data.model_dump(exclude_unset=True))
    return success(data=user, message="User updated")


@router.delete("/{user_id}", dependencies=[Depends(require_scope("users:delete"))], status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: uuid.UUID, db: DbSession, _: CurrentUser):
    user = await UserService.get_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    await UserService.delete(db, user)
