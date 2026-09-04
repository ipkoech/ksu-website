"""Background tasks for external Digital Kisii synchronization."""

from __future__ import annotations

from typing import Any

from ksu_common.task_queue import run_worker_async

from ..core.config import get_settings
from ..core.database import AsyncSessionLocal
from ..services.digital_lecturers import DigitalLecturerSyncService
from .celery_app import celery_app


async def _synchronize_lecturers() -> dict[str, Any]:
    async with AsyncSessionLocal() as db:
        return await DigitalLecturerSyncService.sync(db, url=get_settings().DIGITAL_LECTURERS_URL)


async def _synchronize_programmes() -> dict[str, Any]:
    async with AsyncSessionLocal() as db:
        return await DigitalLecturerSyncService.sync_programmes(db, url=get_settings().DIGITAL_PROGRAMMES_URL)


@celery_app.task(name="main.digital_sync.lecturers")
def synchronize_lecturers() -> dict[str, Any]:
    return run_worker_async(_synchronize_lecturers())


@celery_app.task(name="main.digital_sync.programmes")
def synchronize_programmes() -> dict[str, Any]:
    return run_worker_async(_synchronize_programmes())
