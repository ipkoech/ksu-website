"""Public settings endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Query

from ksu_common import cached_public
from ksu_common.schemas.responses import SuccessResponse, success

from ...deps import ApiKeyAuth, DbSession
from ...models import Setting
from ...services import SettingService
from ...schemas.base import optional_snapshot
from ...schemas.system import SettingRead
from ._fields import FieldSelection, FieldsDep, build_selector

router = APIRouter()
SettingSnapshot = optional_snapshot("PublicSettingSnapshot", SettingRead)


@router.get("", response_model=SuccessResponse[list[SettingSnapshot]], response_model_exclude_unset=True)
@cached_public(timeout=600, vary_on=("category", "fields", "include"))
async def list_public_settings(db: DbSession, category: str | None = Query(default=None), fields: FieldSelection = FieldsDep):
    selector = build_selector(Setting, fields)
    items = await SettingService.list_public(db, category=category, load_options=selector.load_options)
    return success(data=selector.apply(items))


@router.get("/public", response_model=SuccessResponse[list[SettingSnapshot]], response_model_exclude_unset=True)
async def list_public_settings_authenticated(
    db: DbSession,
    api_key: ApiKeyAuth,
    category: str | None = Query(default=None),
    fields: FieldSelection = FieldsDep,
):
    """Public settings via API key authentication."""
    selector = build_selector(Setting, fields)
    items = await SettingService.list_public(db, category=category, load_options=selector.load_options)
    return success(data=selector.apply(items))
