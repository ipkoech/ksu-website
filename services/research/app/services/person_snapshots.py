"""Read public person snapshots through Main's authenticated interface."""

from __future__ import annotations

import uuid

from ksu_common.internal_client import get_integration_pool

from ..core.config import get_settings


async def public_people_by_id(person_ids: list[uuid.UUID]) -> dict[uuid.UUID, dict]:
    ids = list(dict.fromkeys(person_ids))
    if not ids:
        return {}
    settings = get_settings()
    response = await get_integration_pool().request_internal(
        "main-public-persons",
        settings.MAIN_SERVICE_URL,
        "POST",
        "/api/v1/internal/persons/resolve",
        api_key=settings.MAIN_SERVICE_API_KEY,
        json={"ids": [str(item) for item in ids]},
        headers={"Idempotency-Key": "persons-resolve-" + str(ids[0])},
    )
    response.raise_for_status()
    return {
        uuid.UUID(str(item["id"])): item
        for item in response.json().get("data", [])
    }


__all__ = ["public_people_by_id"]
