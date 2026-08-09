"""System and integration services."""

from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import datetime, timezone
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ksu_common import PaginatedResult
from ksu_common.security import is_safe_public_url

from ..models import ApiKey, Setting, Webhook, WebhookDelivery
from ._base import apply_updates, paginate_query


class SettingService:
    @staticmethod
    async def get_by_id(db: AsyncSession, item_id: uuid.UUID, *, load_options: Sequence = ()) -> Setting | None:
        query = select(Setting).where(Setting.id == item_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_key(db: AsyncSession, key: str, *, public_only: bool = False, load_options: Sequence = ()) -> Setting | None:
        query = select(Setting).where(Setting.key == key)
        if public_only:
            query = query.where(Setting.is_public.is_(True))
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, *, updated_by_id: uuid.UUID | None = None, **data) -> Setting:
        item = Setting(updated_by_id=updated_by_id, **data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def update(db: AsyncSession, item: Setting, *, updated_by_id: uuid.UUID | None = None, **data) -> Setting:
        apply_updates(item, **data)
        item.updated_by_id = updated_by_id
        await db.flush()
        return item

    @staticmethod
    async def delete(db: AsyncSession, item: Setting) -> None:
        await db.delete(item)
        await db.flush()

    @staticmethod
    async def list(
        db: AsyncSession,
        *,
        page: int = 1,
        per_page: int = 50,
        category: str | None = None,
        public_only: bool | None = None,
        load_options: Sequence = (),
    ) -> PaginatedResult:
        query = select(Setting).order_by(Setting.category.asc(), Setting.key.asc())
        if load_options:
            query = query.options(*load_options)
        if category:
            query = query.where(Setting.category == category)
        if public_only is not None:
            query = query.where(Setting.is_public.is_(public_only))
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def list_public(db: AsyncSession, *, category: str | None = None, load_options: Sequence = ()) -> list[Setting]:
        query = select(Setting).where(Setting.is_public.is_(True)).order_by(Setting.category.asc(), Setting.key.asc())
        if load_options:
            query = query.options(*load_options)
        if category:
            query = query.where(Setting.category == category)
        result = await db.execute(query)
        return list(result.scalars().all())


class ApiKeyService:
    @staticmethod
    def _hash_key(raw_key: str) -> str:
        return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()

    @staticmethod
    async def get_by_id(db: AsyncSession, item_id: uuid.UUID, *, load_options: Sequence = ()) -> ApiKey | None:
        query = select(ApiKey).where(ApiKey.id == item_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, *, created_by_id: uuid.UUID, **data) -> tuple[ApiKey, str]:
        raw_key = f"ksu_{secrets.token_urlsafe(32)}"
        item = ApiKey(created_by_id=created_by_id, key_hash=ApiKeyService._hash_key(raw_key), **data)
        db.add(item)
        await db.flush()
        return item, raw_key

    @staticmethod
    async def update(db: AsyncSession, item: ApiKey, **data) -> ApiKey:
        apply_updates(item, **data)
        await db.flush()
        return item

    @staticmethod
    async def revoke(db: AsyncSession, item: ApiKey) -> ApiKey:
        item.is_active = False
        await db.flush()
        return item

    @staticmethod
    async def record_usage(db: AsyncSession, item: ApiKey) -> None:
        item.last_used_at = datetime.now(timezone.utc)
        await db.flush()

    @staticmethod
    async def list(db: AsyncSession, *, page: int = 1, per_page: int = 50, is_active: bool | None = None, load_options: Sequence = ()) -> PaginatedResult:
        query = select(ApiKey).order_by(ApiKey.created_at.desc())
        if load_options:
            query = query.options(*load_options)
        if is_active is not None:
            query = query.where(ApiKey.is_active.is_(is_active))
        return await paginate_query(db, query, page=page, per_page=per_page)


class WebhookService:
    @staticmethod
    async def get_by_id(db: AsyncSession, item_id: uuid.UUID, *, load_options: Sequence = ()) -> Webhook | None:
        query = select(Webhook).where(Webhook.id == item_id)
        if load_options:
            query = query.options(*load_options)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create(db: AsyncSession, *, created_by_id: uuid.UUID, **data) -> Webhook:
        url = str(data.get("url", ""))
        if not is_safe_public_url(url) or url.startswith("/"):
            raise ValueError("webhook URL must be a public HTTP(S) endpoint")
        data["secret"] = data.get("secret") or secrets.token_urlsafe(32)
        data["events"] = sorted({str(event).strip() for event in data.get("events", []) if str(event).strip()})
        if not data["events"]:
            raise ValueError("at least one webhook event is required")
        item = Webhook(created_by_id=created_by_id, **data)
        db.add(item)
        await db.flush()
        return item

    @staticmethod
    async def update(db: AsyncSession, item: Webhook, **data) -> Webhook:
        if "url" in data:
            url = str(data["url"])
            if not is_safe_public_url(url) or url.startswith("/"):
                raise ValueError("webhook URL must be a public HTTP(S) endpoint")
        if "events" in data:
            data["events"] = sorted({str(event).strip() for event in data["events"] if str(event).strip()})
            if not data["events"]:
                raise ValueError("at least one webhook event is required")
        apply_updates(item, **data)
        await db.flush()
        return item

    @staticmethod
    async def delete(db: AsyncSession, item: Webhook) -> None:
        item.is_active = False
        await db.flush()

    @staticmethod
    async def record_delivery(db: AsyncSession, item: Webhook, *, status_code: int) -> Webhook:
        item.last_triggered_at = datetime.now(timezone.utc)
        item.last_status = status_code
        item.failure_count = item.failure_count + 1 if status_code >= 400 else 0
        await db.flush()
        return item

    @staticmethod
    async def list(db: AsyncSession, *, page: int = 1, per_page: int = 50, is_active: bool | None = None, load_options: Sequence = ()) -> PaginatedResult:
        query = select(Webhook).order_by(Webhook.created_at.desc())
        if load_options:
            query = query.options(*load_options)
        if is_active is not None:
            query = query.where(Webhook.is_active.is_(is_active))
        return await paginate_query(db, query, page=page, per_page=per_page)

    @staticmethod
    async def list_deliveries(
        db: AsyncSession,
        webhook_id: uuid.UUID,
        *,
        page: int = 1,
        per_page: int = 50,
    ) -> PaginatedResult:
        query = (
            select(WebhookDelivery)
            .where(WebhookDelivery.webhook_id == webhook_id)
            .order_by(WebhookDelivery.attempted_at.desc())
        )
        return await paginate_query(db, query, page=page, per_page=per_page)


__all__ = ["SettingService", "ApiKeyService", "WebhookService"]
