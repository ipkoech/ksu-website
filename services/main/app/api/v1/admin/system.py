"""Admin system endpoints for settings, API keys, and webhooks."""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from ksu_common.schemas.responses import success

from ....deps import CurrentUser, DbSession, require_scope
from ....models import ApiKey, Setting, Webhook
from ....schemas import (
    ApiKeyCreate,
    ApiKeyUpdate,
    SettingCreate,
    SettingUpdate,
    WebhookCreate,
    WebhookUpdate,
)
from ....services import ApiKeyService, SettingService, WebhookService
from .._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()


class BulkSettingUpdateItem(BaseModel):
    key: str = Field(min_length=1, max_length=128)
    value: Any


class BulkSettingsUpdatePayload(BaseModel):
    settings: list[BulkSettingUpdateItem] = Field(default_factory=list)


@router.get("/settings", dependencies=[Depends(require_scope("settings:read"))])
async def list_settings(db: DbSession, _: CurrentUser, page: int = 1, per_page: int = 50, category: str | None = None, fields: FieldSelection = FieldsDep):
    selector = build_selector(Setting, fields)
    result = await SettingService.list(db, page=page, per_page=per_page, category=category, load_options=selector.load_options)
    return success(data=selector.apply(result.items), meta=result.meta)


@router.post("/settings", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("settings:write"))])
async def create_setting(data: SettingCreate, db: DbSession, user: CurrentUser):
    item = await SettingService.create(db, updated_by_id=user.id, **data.model_dump())
    return success(data=item, message="Setting created")


@router.put("/settings", dependencies=[Depends(require_scope("settings:write"))])
async def bulk_update_settings(data: BulkSettingsUpdatePayload, db: DbSession, user: CurrentUser):
    updated_items: list[Setting] = []
    for entry in data.settings:
        item = await SettingService.get_by_key(db, entry.key)
        if item is None:
            raise HTTPException(status_code=404, detail=f"Setting not found: {entry.key}")
        updated_items.append(
            await SettingService.update(
                db,
                item,
                updated_by_id=user.id,
                value=entry.value,
            )
        )
    return success(data=updated_items, message="Settings updated")


@router.patch("/settings/{item_id}", dependencies=[Depends(require_scope("settings:write"))])
@router.put("/settings/{item_id}", dependencies=[Depends(require_scope("settings:write"))])
async def update_setting(item_id: uuid.UUID, data: SettingUpdate, db: DbSession, user: CurrentUser):
    item = await SettingService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Setting not found")
    item = await SettingService.update(db, item, updated_by_id=user.id, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Setting updated")


@router.delete("/settings/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("settings:write"))])
async def delete_setting(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await SettingService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Setting not found")
    await SettingService.delete(db, item)


@router.get("/api-keys", dependencies=[Depends(require_scope("api_keys:read"))])
async def list_api_keys(db: DbSession, _: CurrentUser, page: int = 1, per_page: int = 50, is_active: bool | None = Query(default=None), fields: FieldSelection = FieldsDep):
    selector = build_selector(ApiKey, fields)
    result = await ApiKeyService.list(db, page=page, per_page=per_page, is_active=is_active, load_options=selector.load_options)
    return success(data=selector.apply(result.items), meta=result.meta)


@router.post("/api-keys", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("api_keys:write"))])
async def create_api_key(data: ApiKeyCreate, db: DbSession, user: CurrentUser):
    item, raw_key = await ApiKeyService.create(db, created_by_id=user.id, **data.model_dump())
    return success(data={"api_key": raw_key, "record": item}, message="API key created")


@router.patch("/api-keys/{item_id}", dependencies=[Depends(require_scope("api_keys:write"))])
@router.put("/api-keys/{item_id}", dependencies=[Depends(require_scope("api_keys:write"))])
async def update_api_key(item_id: uuid.UUID, data: ApiKeyUpdate, db: DbSession, _: CurrentUser):
    item = await ApiKeyService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="API key not found")
    item = await ApiKeyService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="API key updated")


@router.delete("/api-keys/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("api_keys:delete"))])
async def revoke_api_key(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await ApiKeyService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="API key not found")
    await ApiKeyService.revoke(db, item)


@router.get("/webhooks", dependencies=[Depends(require_scope("webhooks:read"))])
async def list_webhooks(db: DbSession, _: CurrentUser, page: int = 1, per_page: int = 50, is_active: bool | None = Query(default=None), fields: FieldSelection = FieldsDep):
    selector = build_selector(Webhook, fields)
    result = await WebhookService.list(db, page=page, per_page=per_page, is_active=is_active, load_options=selector.load_options)
    return success(data=selector.apply(result.items), meta=result.meta)


@router.post("/webhooks", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_scope("webhooks:write"))])
async def create_webhook(data: WebhookCreate, db: DbSession, user: CurrentUser):
    item = await WebhookService.create(db, created_by_id=user.id, **data.model_dump())
    return success(data=item, message="Webhook created")


@router.patch("/webhooks/{item_id}", dependencies=[Depends(require_scope("webhooks:write"))])
@router.put("/webhooks/{item_id}", dependencies=[Depends(require_scope("webhooks:write"))])
async def update_webhook(item_id: uuid.UUID, data: WebhookUpdate, db: DbSession, _: CurrentUser):
    item = await WebhookService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Webhook not found")
    item = await WebhookService.update(db, item, **data.model_dump(exclude_unset=True))
    return success(data=item, message="Webhook updated")


@router.delete("/webhooks/{item_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_scope("webhooks:delete"))])
async def delete_webhook(item_id: uuid.UUID, db: DbSession, _: CurrentUser):
    item = await WebhookService.get_by_id(db, item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Webhook not found")
    await WebhookService.delete(db, item)
