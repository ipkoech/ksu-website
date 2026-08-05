"""Proxy helpers for partner data owned by the Research service."""

from __future__ import annotations

import uuid
from typing import Any

from ksu_common.internal_client import get_integration_pool

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
        }
        if is_featured is not None:
            params["is_featured"] = is_featured
        if search:
            params["search"] = search

        response = await get_integration_pool().request_internal(
            "research-partners",
            settings.RESEARCH_SERVICE_URL.rstrip("/"),
            "GET",
            "/api/v1/internal/partners",
            api_key=settings.RESEARCH_SERVICE_API_KEY,
            headers={"X-KSU-Proxy": "main-partners"},
            params=params,
        )
        response.raise_for_status()
        payload = response.json()

        if not isinstance(payload, dict) or payload.get("status") != "success":
            raise ValueError("Research service returned an unexpected partners payload")
        return payload

    @staticmethod
    async def get_partner(slug: str) -> dict[str, Any]:
        response = await get_integration_pool().request_internal(
            "research-partners",
            settings.RESEARCH_SERVICE_URL.rstrip("/"),
            "GET",
            f"/api/v1/internal/partners/{slug}",
            api_key=settings.RESEARCH_SERVICE_API_KEY,
            headers={"X-KSU-Proxy": "main-partners"},
        )
        response.raise_for_status()
        payload = response.json()

        if not isinstance(payload, dict) or payload.get("status") != "success":
            raise ValueError("Research service returned an unexpected partner payload")
        return payload

    @staticmethod
    async def find_partner_by_id(
        partner_id: uuid.UUID,
        *,
        per_page: int = 100,
        max_pages: int = 10,
    ) -> dict[str, Any] | None:
        """Find a partner record by UUID via bounded pagination.

        The Research service currently exposes partner detail by slug, not by UUID.
        This helper follows pagination metadata instead of assuming the first page
        contains every partner.
        """

        page = 1
        partner_id_text = str(partner_id)

        while page <= max_pages:
            payload = await ResearchPartnersProxyService.list_partners(page=page, per_page=per_page)
            partners = payload.get("data") or []
            for partner in partners:
                if not isinstance(partner, dict):
                    continue
                candidate_id = partner.get("id")
                if candidate_id == partner_id or str(candidate_id) == partner_id_text:
                    return partner

            meta = payload.get("meta")
            if not isinstance(meta, dict):
                return None
            total_pages = meta.get("pages")
            if not isinstance(total_pages, int) or page >= total_pages:
                return None
            page += 1

        raise ValueError(
            f"Research partner lookup exceeded {max_pages} pages while searching for partner {partner_id_text}"
        )


__all__ = ["ResearchPartnersProxyService"]
