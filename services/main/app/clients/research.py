"""Bounded, request-aware client for the Research service."""

from __future__ import annotations

import uuid
from typing import Any
from fastapi import HTTPException

from ksu_common.internal_client import get_integration_pool


class ResearchClient:
    """Forward school publication calls without retrying mutations."""

    def __init__(
        self,
        *,
        base_url: str,
        authorization: str | None,
        request_id: str | None,
        idempotency_key: str | None = None,
        selected_school: str | None = None,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.authorization = authorization
        self.request_id = request_id
        self.idempotency_key = idempotency_key
        self.selected_school = selected_school

    @property
    def headers(self) -> dict[str, str]:
        headers: dict[str, str] = {}
        if self.authorization:
            headers["Authorization"] = self.authorization
        return headers

    async def _request_once(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        response = await get_integration_pool().request_authenticated(
            "research-school-publications",
            self.base_url,
            method,
            path,
            auth_headers=self.headers,
            headers={key: value for key, value in {
                "Idempotency-Key": self.idempotency_key,
                "X-School-ID": self.selected_school,
            }.items() if value},
            request_id=self.request_id,
            params=params,
            json=json,
        )
        if response.is_error:
            try:
                payload = response.json()
                detail = payload.get("detail", payload.get("message", "Research request failed"))
            except (ValueError, AttributeError):
                detail = "Research request failed"
            raise HTTPException(response.status_code, detail, headers={
                key: response.headers[key] for key in ("Retry-After", "WWW-Authenticate")
                if key in response.headers
            })
        return response.json()

    async def _request(
        self,
        method: str,
        path: str,
        *,
        params: dict[str, Any] | None = None,
        json: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        # The integration pool retries only safe reads (or mutations carrying an
        # idempotency key), so this boundary keeps mutation behavior unchanged.
        return await self._request_once(method, path, params=params, json=json)

    async def list_school_publications(
        self,
        *,
        page: int = 1,
        per_page: int = 20,
        status: str | None = None,
    ) -> dict[str, Any]:
        params: dict[str, Any] = {"page": page, "per_page": per_page}
        if status is not None:
            params["status"] = status
        return await self._request("GET", "/api/v1/school-publications", params=params)

    async def get_school_publication(self, publication_id: uuid.UUID) -> dict[str, Any]:
        return await self._request("GET", f"/api/v1/school-publications/{publication_id}")

    async def get_school_publication_summary(self) -> dict[str, Any]:
        return await self._request("GET", "/api/v1/school-publications/summary")

    async def create_school_publication(self, payload: dict[str, Any]) -> dict[str, Any]:
        return await self._request("POST", "/api/v1/school-publications", json=payload)

    async def update_school_publication(
        self,
        publication_id: uuid.UUID,
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        return await self._request(
            "PATCH",
            f"/api/v1/school-publications/{publication_id}",
            json=payload,
        )

    async def submit_school_publication(self, publication_id: uuid.UUID) -> dict[str, Any]:
        return await self._request(
            "POST",
            f"/api/v1/school-publications/{publication_id}/submit",
        )

    async def withdraw_school_publication(self, publication_id: uuid.UUID) -> dict[str, Any]:
        return await self._request(
            "POST",
            f"/api/v1/school-publications/{publication_id}/withdraw",
        )
