"""Social media post endpoints."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ksu_common.schemas.responses import success

from ...deps import CurrentUser, DbSession, require_scope
from ...models import SocialMediaDelivery, SocialMediaPost, SocialPlatformAccount
from ...schemas import (
    SocialMediaPostCreate,
    SocialMediaPostUpdate,
    SocialPlatformAccountCreate,
    SocialPlatformAccountUpdate,
)
from ...services import SocialMediaPostService, SocialPlatformAccountService
from ._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()

#: Marketing/communications staff can manage and publish social posts and see
#: which platform accounts are connected.
SOCIAL_MANAGE_SCOPE = "marketing.manage_social"
#: Connected account management uses the same explicit communications authority.
SOCIAL_ACCOUNT_ADMIN_SCOPE = "marketing.manage_social"


@router.get("", dependencies=[Depends(require_scope(SOCIAL_MANAGE_SCOPE))])
async def list_social_posts(
    db: DbSession,
    _: CurrentUser,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    status: str | None = None,
    source_type: str | None = None,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(SocialMediaPost, fields)
    result = await SocialMediaPostService.list(
        db,
        page=page,
        per_page=per_page,
        status=status,
        source_type=source_type,
        load_options=selector.load_options,
    )
    return success(data=selector.apply(result.items), meta=result.meta)


@router.get("/accounts", dependencies=[Depends(require_scope(SOCIAL_MANAGE_SCOPE))])
async def list_social_accounts(
    db: DbSession,
    _: CurrentUser,
    provider: str | None = None,
    active_only: bool = False,
    fields: FieldSelection = FieldsDep,
):
    selector = build_selector(SocialPlatformAccount, fields)
    items = await SocialPlatformAccountService.list(db, provider=provider, active_only=active_only, load_options=selector.load_options)
    return success(data=selector.apply(items))


@router.post("/accounts", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope(SOCIAL_ACCOUNT_ADMIN_SCOPE))])
async def create_social_account(data: SocialPlatformAccountCreate, db: DbSession, user: CurrentUser):
    try:
        item = await SocialPlatformAccountService.create(db, created_by_id=user.id, **data.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return success(data=item, message="Social platform account created")


@router.patch("/accounts/{item_id}", dependencies=[Depends(require_scope(SOCIAL_ACCOUNT_ADMIN_SCOPE))])
async def update_social_account(item_id: uuid.UUID, data: SocialPlatformAccountUpdate, db: DbSession, _: CurrentUser):
    item = await SocialPlatformAccountService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Social platform account not found")
    try:
        item = await SocialPlatformAccountService.update(db, item, **data.model_dump(exclude_unset=True))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return success(data=item, message="Social platform account updated")


@router.post("/accounts/{item_id}/validate", dependencies=[Depends(require_scope(SOCIAL_ACCOUNT_ADMIN_SCOPE))])
async def validate_social_account(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await SocialPlatformAccountService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Social platform account not found")
    ok, error = await SocialPlatformAccountService.validate_credentials(db, item)
    return success(data={"valid": ok, "error": error}, message="Social platform credentials checked")


@router.delete("/accounts/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope(SOCIAL_ACCOUNT_ADMIN_SCOPE))])
async def delete_social_account(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await SocialPlatformAccountService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Social platform account not found")
    await SocialPlatformAccountService.delete(db, item)


@router.get("/{item_id}", dependencies=[Depends(require_scope(SOCIAL_MANAGE_SCOPE))])
async def get_social_post(item_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    selector = build_selector(SocialMediaPost, fields)
    item = await SocialMediaPostService.get_by_id(db, item_id, load_options=selector.load_options)
    if item is None:
        raise HTTPException(status_code=404, detail="Social media post not found")
    return success(data=selector.apply(item))


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope(SOCIAL_MANAGE_SCOPE))])
async def create_social_post(data: SocialMediaPostCreate, db: DbSession, user: CurrentUser):
    try:
        item = await SocialMediaPostService.create(db, created_by_id=user.id, **data.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return success(data=item, message="Social media post created")


@router.patch("/{item_id}", dependencies=[Depends(require_scope(SOCIAL_MANAGE_SCOPE))])
async def update_social_post(item_id: uuid.UUID, data: SocialMediaPostUpdate, db: DbSession, _: CurrentUser):
    item = await SocialMediaPostService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Social media post not found")
    try:
        item = await SocialMediaPostService.update(db, item, **data.model_dump(exclude_unset=True))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return success(data=item, message="Social media post updated")


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope(SOCIAL_MANAGE_SCOPE))])
async def delete_social_post(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await SocialMediaPostService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Social media post not found")
    await SocialMediaPostService.delete(db, item)


@router.get("/{item_id}/deliveries", dependencies=[Depends(require_scope(SOCIAL_MANAGE_SCOPE))])
async def list_social_post_deliveries(item_id: uuid.UUID, db: DbSession, _: CurrentUser, fields: FieldSelection = FieldsDep):
    item = await SocialMediaPostService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Social media post not found")
    selector = build_selector(SocialMediaDelivery, fields)
    deliveries = await SocialMediaPostService.list_deliveries(db, item_id, load_options=selector.load_options)
    return success(data=selector.apply(deliveries))


@router.post("/{item_id}/validate", dependencies=[Depends(require_scope(SOCIAL_MANAGE_SCOPE))])
async def validate_social_post(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await SocialMediaPostService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Social media post not found")
    summary = await SocialMediaPostService.validate(db, item)
    return success(data=summary, message="Social media post validated")


@router.post("/{item_id}/publish", dependencies=[Depends(require_scope(SOCIAL_MANAGE_SCOPE))])
async def publish_social_post(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await SocialMediaPostService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Social media post not found")
    item = await SocialMediaPostService.publish_now(db, item)
    return success(data=item, message="Social media post queued for publishing")
