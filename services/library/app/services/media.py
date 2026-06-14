"""Cross-service public media resolution helpers."""

from __future__ import annotations

import uuid
from typing import Any

import httpx

from ..core.config import get_settings

_TIMEOUT = 3.0


def _media_id(value: Any) -> uuid.UUID | None:
    if isinstance(value, uuid.UUID):
        return value
    if value:
        try:
            return uuid.UUID(str(value))
        except ValueError:
            return None
    return None


async def resolve_public_media(media_ids: list[uuid.UUID]) -> dict[uuid.UUID, dict[str, Any]]:
    """Resolve public media payloads from the main service.

    Media is owned by the main service. Library records store stable media IDs and
    use this helper only to enrich public payloads with browser-loadable URLs.
    """

    unique_ids = list(dict.fromkeys(media_ids))
    if not unique_ids:
        return {}

    settings = get_settings()
    base_url = settings.MAIN_SERVICE_URL.rstrip("/")
    resolved: dict[uuid.UUID, dict[str, Any]] = {}

    async with httpx.AsyncClient(base_url=base_url, timeout=_TIMEOUT) as client:
        for media_id in unique_ids:
            try:
                response = await client.get(
                    f"/api/v1/internal/media/{media_id}",
                    headers={"X-Internal-Key": settings.INTERNAL_API_KEY},
                )
                response.raise_for_status()
                payload = response.json().get("data")
                if isinstance(payload, dict):
                    resolved[media_id] = payload
            except (httpx.HTTPError, ValueError, KeyError):
                continue

    return resolved


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
