"""Policy endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common import cached_public
from ksu_common.schemas.responses import success

from ._fields import FieldSelection, FieldsDep, build_selector
from ...deps import CurrentUser, DbSession, user_has_scope
from ...models import Policy
from ...schemas import PolicyCreate, PolicyUpdate
from ...services import PolicyService

router = APIRouter()

POLICY_MANAGE_SCOPES = ("policy.manage", "office.manage_content", "content.manage_pages")


def require_policy_manage(user: CurrentUser) -> None:
    if not any(user_has_scope(user, scope) for scope in POLICY_MANAGE_SCOPES):
        raise HTTPException(status_code=403, detail="Not authorized to manage policies")


@router.get("")
@cached_public(timeout=300, vary_on=("page", "per_page", "q", "category", "division_id", "department_id", "fields", "include"))
async def list_policies(
    db: DbSession,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    q: str | None = None,
    category: str | None = None,
    division_id: uuid.UUID | None = None,
    department_id: uuid.UUID | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(Policy, fields)
    result = await PolicyService.list(
        db,
        page=page,
        per_page=per_page,
        q=q,
        category=category,
        division_id=division_id,
        department_id=department_id,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/{slug}")
@cached_public(timeout=300, vary_on=("slug", "fields", "include"))
async def get_policy(slug: str, db: DbSession, fields: FieldSelection = FieldsDep):
    selector = build_selector(Policy, fields)
    item = await PolicyService.get_by_slug(db, slug, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Policy not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_policy_manage)])
async def create_policy(data: PolicyCreate, db: DbSession, _: CurrentUser):
    item = await PolicyService.create(db, **data.model_dump())
    return success(data=item, message="Policy created")


@router.patch("/{item_id}", dependencies=[Depends(require_policy_manage)])
async def update_policy(item_id: uuid.UUID, data: PolicyUpdate, db: DbSession, _: CurrentUser):
    item = await PolicyService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Policy not found")
    item = await PolicyService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Policy updated")


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_policy_manage)])
async def delete_policy(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await PolicyService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Policy not found")
    await PolicyService.delete(db, item)
