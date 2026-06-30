"""Celery tasks for bulk imports."""

from __future__ import annotations

import asyncio
import uuid
from typing import Any

from ..core.database import AsyncSessionLocal
from ..schemas.imports import ImportCommitRequest
from ..services.notification import NotificationService
from ..services.imports import ImportService
from .celery_app import celery_app


@celery_app.task(name="main.imports.commit")
def commit_import(resource_key: str, payload: dict[str, Any], user_id: str | None = None) -> dict[str, Any]:
    return asyncio.run(_commit_import(resource_key, payload, user_id))


async def _commit_import(resource_key: str, payload: dict[str, Any], user_id: str | None = None) -> dict[str, Any]:
    config = ImportService.get_resource(resource_key)
    if config is None:
        raise ValueError("Import resource not found")

    request = ImportCommitRequest.model_validate(payload)
    async with AsyncSessionLocal() as db:
        try:
            result = await ImportService.commit(db, config, request)
            if user_id:
                await NotificationService.send_to_user(
                    db,
                    user_id=uuid.UUID(user_id),
                    title="Import completed",
                    subject=f"{config.label} import completed",
                    message=(
                        f"Created {result.created_rows}, skipped {result.skipped_rows}, "
                        f"failed {result.failed_rows}."
                    ),
                    notification_type="success" if result.failed_rows == 0 else "warning",
                    priority="normal",
                    action_url="/research/projects" if resource_key == "research-projects" else "/research",
                    scope_type="research",
                    channels=["in_app"],
                    payload={
                        "event": "import.completed",
                        "resource": resource_key,
                        "created_rows": result.created_rows,
                        "skipped_rows": result.skipped_rows,
                        "failed_rows": result.failed_rows,
                    },
                )
            await db.commit()
        except Exception:
            await db.rollback()
            raise

    return result.model_dump(mode="json")
