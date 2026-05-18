"""Proxy helpers for partner data owned by the Research service."""

from __future__ import annotations

from typing import Any

import httpx

from ..core.config import get_settings

settings = get_settings()


class ResearchPartnersProxyService:
    """Read partner data from the Research service without duplicating ownership."""

    @staticmethod
    async def list_partners(
        *,
        page: int = 1,
        per_page: int = 20,
        search: str | None = None,
        status: str | None = "active",
        is_active: bool | None = True,
        is_featured: bool | None = None,
    ) -> dict[str, Any]:
        params: dict[str, Any] = {
            "page": page,
            "per_page": per_page,
            "status": status,
            "is_active": is_active,
            "is_featured": is_featured,
        }
        if search:
            params["search"] = search

        async with httpx.AsyncClient(
            base_url=settings.RESEARCH_SERVICE_URL.rstrip("/"),
            timeout=httpx.Timeout(20.0, connect=5.0),
        ) as client:
            response = await client.get("/api/v1/partners", params=params)
            response.raise_for_status()
            payload = response.json()

        if not isinstance(payload, dict) or payload.get("status") != "success":
            raise ValueError("Research service returned an unexpected partners payload")
        return payload

    @staticmethod
    async def get_partner(slug: str) -> dict[str, Any]:
        async with httpx.AsyncClient(
            base_url=settings.RESEARCH_SERVICE_URL.rstrip("/"),
            timeout=httpx.Timeout(20.0, connect=5.0),
        ) as client:
            response = await client.get(f"/api/v1/partners/{slug}")
            response.raise_for_status()
            payload = response.json()

        if not isinstance(payload, dict) or payload.get("status") != "success":
            raise ValueError("Research service returned an unexpected partner payload")
        return payload


__all__ = ["ResearchPartnersProxyService"]
