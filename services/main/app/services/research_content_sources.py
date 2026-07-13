"""Validated public Page CMS source reads from the Research service."""

from __future__ import annotations

import uuid
from typing import Any

import httpx

from ..core.config import get_settings
from .page_cms_source_errors import PageCmsSourceProviderError

settings = get_settings()

SUPPORTED_RESEARCH_CONTENT_SOURCE_TYPES = frozenset({"research_project", "publication"})
MAX_RESEARCH_CONTENT_PAGE = 100
MAX_RESEARCH_CONTENT_PER_PAGE = 50
MAX_RESEARCH_CONTENT_IDS = 100


class ResearchContentSourcesProxyService:
    """Use the Research public source contract without leaking provider payloads."""

    @classmethod
    async def search(
        cls,
        source_type: str,
        *,
        page: int = 1,
        per_page: int = 20,
        search: str | None = None,
        center_id: uuid.UUID | None = None,
    ) -> dict[str, Any]:
        cls._validate_source_type(source_type)
        params: dict[str, Any] = {
            "page": max(1, min(page, MAX_RESEARCH_CONTENT_PAGE)),
            "per_page": max(1, min(per_page, MAX_RESEARCH_CONTENT_PER_PAGE)),
        }
        if search:
            params["search"] = search
        if center_id is not None:
            params["center_id"] = str(center_id)
        payload = await cls._request(
            "get",
            f"/api/v1/page-cms-sources/{source_type}",
            params=params,
        )
        return cls._validate_page_payload(source_type, payload)

    @classmethod
    async def resolve_many(
        cls,
        source_type: str,
        ids: list[uuid.UUID],
        *,
        center_id: uuid.UUID | None = None,
    ) -> list[dict[str, Any]]:
        cls._validate_source_type(source_type)
        if len(ids) > MAX_RESEARCH_CONTENT_IDS:
            raise PageCmsSourceProviderError(f"Research content resolution accepts at most {MAX_RESEARCH_CONTENT_IDS} ids")
        payload = await cls._request(
            "post",
            f"/api/v1/page-cms-sources/{source_type}/resolve",
            json={"ids": [str(item_id) for item_id in ids], "center_id": str(center_id) if center_id else None},
        )
        data = payload.get("data") if isinstance(payload, dict) and payload.get("status") == "success" else None
        if not isinstance(data, list):
            raise PageCmsSourceProviderError("Research content provider returned an invalid resolution payload")
        return [cls._validate_summary(source_type, item) for item in data]

    @staticmethod
    def _validate_source_type(source_type: str) -> None:
        if source_type not in SUPPORTED_RESEARCH_CONTENT_SOURCE_TYPES:
            raise PageCmsSourceProviderError(f"Unsupported research content source type: {source_type}")

    @staticmethod
    async def _request(method: str, path: str, **kwargs) -> dict[str, Any]:
        try:
            async with httpx.AsyncClient(
                base_url=settings.RESEARCH_SERVICE_URL.rstrip("/"),
                timeout=httpx.Timeout(20.0, connect=5.0),
                headers={"X-KSU-Proxy": "main-page-cms-sources"},
            ) as client:
                response = await getattr(client, method)(path, **kwargs)
                response.raise_for_status()
                payload = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise PageCmsSourceProviderError("Research content provider is unavailable") from exc
        if not isinstance(payload, dict):
            raise PageCmsSourceProviderError("Research content provider returned an invalid payload")
        return payload

    @classmethod
    def _validate_page_payload(cls, source_type: str, payload: dict[str, Any]) -> dict[str, Any]:
        data = payload.get("data") if payload.get("status") == "success" else None
        meta = payload.get("meta")
        if not isinstance(data, list) or not isinstance(meta, dict):
            raise PageCmsSourceProviderError("Research content provider returned an invalid page payload")
        for key in ("page", "per_page", "total", "pages"):
            value = meta.get(key)
            if not isinstance(value, int) or isinstance(value, bool) or value < 0:
                raise PageCmsSourceProviderError("Research content provider returned invalid pagination metadata")
        return {"data": [cls._validate_summary(source_type, item) for item in data], "meta": meta}

    @staticmethod
    def _validate_summary(source_type: str, item: Any) -> dict[str, Any]:
        if not isinstance(item, dict):
            raise PageCmsSourceProviderError("Research content provider returned an invalid source summary")
        required_keys = {"id", "source_type", "label", "secondary_label", "status", "published_at", "thumbnail_url", "metadata"}
        if set(item) != required_keys or item.get("source_type") != source_type:
            raise PageCmsSourceProviderError("Research content provider returned an invalid source summary")
        try:
            uuid.UUID(str(item["id"]))
        except (TypeError, ValueError) as exc:
            raise PageCmsSourceProviderError("Research content provider returned an invalid source summary") from exc
        if not isinstance(item["label"], str) or not isinstance(item["status"], str):
            raise PageCmsSourceProviderError("Research content provider returned an invalid source summary")
        for key in ("secondary_label", "published_at", "thumbnail_url"):
            if item[key] is not None and not isinstance(item[key], str):
                raise PageCmsSourceProviderError("Research content provider returned an invalid source summary")
        metadata = item["metadata"]
        if not isinstance(metadata, dict) or any(key == "id" or key.endswith("_id") for key in metadata):
            raise PageCmsSourceProviderError("Research content provider returned an invalid source summary")
        allowed_value_types = (str, int, bool, type(None))
        if any(not isinstance(value, allowed_value_types) for value in metadata.values()):
            raise PageCmsSourceProviderError("Research content provider returned an invalid source summary")
        return item


__all__ = [
    "MAX_RESEARCH_CONTENT_IDS",
    "MAX_RESEARCH_CONTENT_PAGE",
    "MAX_RESEARCH_CONTENT_PER_PAGE",
    "ResearchContentSourcesProxyService",
    "SUPPORTED_RESEARCH_CONTENT_SOURCE_TYPES",
]
