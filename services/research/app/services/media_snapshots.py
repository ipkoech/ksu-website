"""Read Main-owned public media through the authenticated service interface."""

import uuid

from ksu_common.internal_client import get_integration_pool

from ..core.config import get_settings
from ..models.media import PublicMedia


async def public_media_by_id(media_ids: list[uuid.UUID]) -> dict[uuid.UUID, PublicMedia]:
    ids = list(dict.fromkeys(media_ids))
    if not ids:
        return {}
    settings = get_settings()
    response = await get_integration_pool().request_internal(
        "main-public-media",
        settings.MAIN_SERVICE_URL,
        "POST",
        "/api/v1/internal/media/resolve",
        api_key=settings.MAIN_SERVICE_API_KEY,
        json={"ids": [str(item) for item in ids]},
        headers={"Idempotency-Key": "media-resolve-" + str(ids[0])},
    )
    response.raise_for_status()
    snapshots: dict[uuid.UUID, PublicMedia] = {}
    for item in response.json().get("data", []):
        identifier = uuid.UUID(str(item["id"]))
        snapshots[identifier] = PublicMedia(
            id=identifier,
            url=str(item["url"]),
            thumbnail_url=item.get("thumbnail_url"),
            title=item.get("title"),
            alt_text=item.get("alt_text"),
            description=item.get("description"),
            caption=item.get("caption"),
            media_type=item.get("media_type"),
            is_public=True,
        )
    return snapshots


__all__ = ["public_media_by_id"]
