"""Cross-service public media resolution helpers."""

from __future__ import annotations

import uuid
from typing import Any

import httpx
from ksu_common.internal_client import get_integration_pool

from ..core.config import get_settings

_TIMEOUT = 3.0
_BATCH_SIZE = 100


def _media_id(value: Any) -> uuid.UUID | None:
    if isinstance(value, uuid.UUID):
        return value
    if value:
        try:
            return uuid.UUID(str(value))
        except ValueError:
            return None
    return None


async def _resolve_legacy_media(
    pool,
    base_url: str,
    api_key: str | None,
    media_ids: list[uuid.UUID],
    resolved: dict[uuid.UUID, dict[str, Any]],
) -> None:
    """Use the old single-item adapter during a rolling Main deployment."""

    for media_id in media_ids:
        try:
            response = await pool.request_internal(
                "main-public-media",
                base_url,
                "GET",
                f"/api/v1/internal/media/{media_id}",
                api_key=api_key,
                timeout=_TIMEOUT,
            )
            response.raise_for_status()
            body = response.json()
            if isinstance(body, dict):
                payload = body.get("data", body)
                if isinstance(payload, dict):
                    resolved[media_id] = payload
        except (httpx.HTTPError, ValueError, KeyError):
            continue


async def resolve_public_media(media_ids: list[uuid.UUID]) -> dict[uuid.UUID, dict[str, Any]]:
    """Resolve public media payloads from the main service.

    Media is owned by the main service. Library records store stable media IDs and
    use this helper only to enrich public payloads with browser-loadable URLs.
    Requests are sent in bounded batches of 100; the legacy single-item route
    is used only when a rolling Main deployment has not exposed the batch route.
    """

    unique_ids = list(dict.fromkeys(media_ids))
    if not unique_ids:
        return {}

    settings = get_settings()
    base_url = settings.MAIN_SERVICE_URL.rstrip("/")
    resolved: dict[uuid.UUID, dict[str, Any]] = {}

    pool = get_integration_pool()
    for start in range(0, len(unique_ids), _BATCH_SIZE):
        batch = unique_ids[start:start + _BATCH_SIZE]
        try:
            response = await pool.request_internal(
                "main-public-media",
                base_url,
                "POST",
                "/api/v1/internal/media/resolve",
                api_key=settings.MAIN_SERVICE_API_KEY,
                json={"ids": [str(media_id) for media_id in batch]},
                timeout=_TIMEOUT,
            )
            response.raise_for_status()
            body = response.json()
            payload = body.get("data") if isinstance(body, dict) else None
            if isinstance(payload, list):
                for item in payload:
                    if not isinstance(item, dict):
                        continue
                    resolved_id = _media_id(item.get("id"))
                    if resolved_id in batch:
                        resolved[resolved_id] = item
        except httpx.HTTPStatusError as exc:
            # Keep rolling upgrades compatible with a Main instance that has
            # the legacy GET adapter but not the bounded resolve endpoint.
            if exc.response.status_code in {404, 405}:
                await _resolve_legacy_media(
                    pool, base_url, settings.MAIN_SERVICE_API_KEY, batch, resolved,
                )
        except (httpx.HTTPError, ValueError, KeyError):
            continue

    return resolved


async def require_public_media(*media_ids: uuid.UUID | None) -> None:
    """Reject links to Main media that cannot be safely exposed by Library."""
    requested = [item for item in media_ids if item is not None]
    if not requested:
        return
    resolved = await resolve_public_media(requested)
    if any(item not in resolved for item in requested):
        raise ValueError("Referenced media is unavailable or not public")


async def require_public_documents(*document_ids: uuid.UUID | None) -> None:
    requested = [item for item in document_ids if item is not None]
    if not requested:
        return
    settings = get_settings()
    response = await get_integration_pool().request_internal(
        "main-public-documents", settings.MAIN_SERVICE_URL.rstrip("/"), "POST",
        "/api/v1/internal/documents/resolve", api_key=settings.MAIN_SERVICE_API_KEY,
        json={"ids": [str(item) for item in requested]}, timeout=_TIMEOUT,
    )
    response.raise_for_status()
    body = response.json()
    resolved = set(body.get("data", [])) if isinstance(body, dict) else set()
    if any(str(item) not in resolved for item in requested):
        raise ValueError("Referenced document is unavailable or not public")


async def attach_public_media(
    records: list[dict[str, Any]],
    *,
    id_field: str = "media_id",
    target_field: str = "media",
) -> list[dict[str, Any]]:
    media_ids = [
        media_id
        for record in records
        if (media_id := _media_id(record.get(id_field))) is not None
    ]
    media_by_id = await resolve_public_media(media_ids)
    for record in records:
        media_id = _media_id(record.get(id_field))
        media = media_by_id.get(media_id) if media_id else None
        record[target_field] = media
        record["file_url"] = media.get("url") if media else None
        record["thumbnail_url"] = media.get("thumbnail_url") if media else None
    return records
