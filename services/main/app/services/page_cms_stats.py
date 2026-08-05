"""Public statistics proxies used by Page CMS source adapters."""

from __future__ import annotations

from typing import Any

import httpx

from ..core.config import get_settings
from .page_cms_source_errors import PageCmsSourceProviderError

settings = get_settings()


class PageCmsStatsProxyService:
    @staticmethod
    async def get_public_stats(scope_type: str) -> dict[str, Any]:
        service_urls = {
            "research": settings.RESEARCH_SERVICE_URL,
            "library": settings.LIBRARY_SERVICE_URL,
        }
        base_url = service_urls.get(scope_type)
        if base_url is None:
            raise PageCmsSourceProviderError(f"Unsupported stats provider scope: {scope_type}")

        try:
            async with httpx.AsyncClient(
                base_url=base_url.rstrip("/"),
                timeout=httpx.Timeout(20.0, connect=5.0),
                headers={"X-KSU-Proxy": "main-page-cms-stats"},
            ) as client:
                response = await client.get("/api/v1/stats")
                response.raise_for_status()
                payload = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise PageCmsSourceProviderError(f"{scope_type} stats provider is unavailable") from exc

        data = payload.get("data") if isinstance(payload, dict) and payload.get("status") == "success" else None
        if not isinstance(data, dict) or data.get("scope") != scope_type:
            raise PageCmsSourceProviderError(f"{scope_type} stats provider returned an invalid scope contract")
        if not isinstance(data.get("title"), str) or not isinstance(data.get("stats"), list):
            raise PageCmsSourceProviderError(f"{scope_type} stats provider returned an invalid payload")

        for item in data["stats"]:
            if not isinstance(item, dict):
                raise PageCmsSourceProviderError(f"{scope_type} stats provider returned an invalid stat item")
            if not isinstance(item.get("key"), str) or not isinstance(item.get("label"), str):
                raise PageCmsSourceProviderError(f"{scope_type} stats provider returned an invalid stat item")
            if not isinstance(item.get("value"), (int, float)) or isinstance(item.get("value"), bool):
                raise PageCmsSourceProviderError(f"{scope_type} stats provider returned an invalid stat value")
            if not isinstance(item.get("description"), str):
                raise PageCmsSourceProviderError(f"{scope_type} stats provider returned an invalid stat item")
        return data


__all__ = ["PageCmsStatsProxyService"]
