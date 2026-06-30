"""Celery tasks for bulk imports."""

from __future__ import annotations

import asyncio
from typing import Any

from ..core.database import AsyncSessionLocal
from ..schemas.imports import ImportCommitRequest
from ..services.imports import ImportService
from .celery_app import celery_app


@celery_app.task(name="main.imports.commit")
def commit_import(resource_key: str, payload: dict[str, Any]) -> dict[str, Any]:
    return asyncio.run(_commit_import(resource_key, payload))


async def _commit_import(resource_key: str, payload: dict[str, Any]) -> dict[str, Any]:
    config = ImportService.get_resource(resource_key)
    if config is None:
        raise ValueError("Import resource not found")

    request = ImportCommitRequest.model_validate(payload)
    async with AsyncSessionLocal() as db:
        try:
            result = await ImportService.commit(db, config, request)
            await db.commit()
        except Exception:
            await db.rollback()
            raise

    return result.model_dump(mode="json")
