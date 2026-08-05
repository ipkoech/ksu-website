"""Asynchronous thumbnail/preview processing for school upload batches."""

from __future__ import annotations

import re
import uuid
from pathlib import Path

from PIL import Image, ImageOps
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from ksu_common.task_queue import run_worker_async

from ..core.config import get_settings
from ..core.database import AsyncSessionLocal
from ..models import Media, UploadBatchFile
from ..services.upload_batch import (
    UploadBatchService,
    enqueue_upload_progress,
)
from .celery_app import celery_app


@celery_app.task(name="main.media.process_upload_file")
def process_upload_file(file_id: str) -> dict:
    return run_worker_async(_process_upload_file(uuid.UUID(file_id)))


@celery_app.task(name="main.media.cleanup_expired_batches")
def cleanup_expired_upload_batches() -> int:
    return run_worker_async(_cleanup_expired_upload_batches())


def _create_preview(media: Media) -> None:
    settings = get_settings()
    source = settings.upload_dir_path / media.storage_path
    preview_dir = settings.upload_dir_path / "previews"
    preview_dir.mkdir(parents=True, exist_ok=True)
    if media.is_image:
        preview = preview_dir / f"{media.id}.webp"
        with Image.open(source) as image:
            image = ImageOps.exif_transpose(image)
            media.width, media.height = image.size
            image.thumbnail((640, 640))
            image.convert("RGB").save(preview, "WEBP", quality=82)
        media.thumbnail_url = f"{settings.MEDIA_URL.rstrip('/')}/previews/{preview.name}"
        media.thumbnails = {"medium": media.thumbnail_url}
    elif media.is_document:
        preview = preview_dir / f"{media.id}.svg"
        safe_label = (
            re.sub(r"[^A-Z0-9]", "", Path(media.original_filename).suffix.upper())[:8]
            or "DOC"
        )
        preview.write_text(
            (
                '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="420" '
                'viewBox="0 0 320 420"><rect width="320" height="420" rx="18" fill="#eef2f7"/>'
                '<path d="M75 45h115l55 55v275H75z" fill="white" stroke="#94a3b8" stroke-width="4"/>'
                f'<text x="160" y="245" text-anchor="middle" font-family="sans-serif" '
                f'font-size="42" fill="#334155">{safe_label[:8]}</text></svg>'
            ),
            encoding="utf-8",
        )
        media.thumbnail_url = f"{settings.MEDIA_URL.rstrip('/')}/previews/{preview.name}"
    media.is_processed = True


async def _process_upload_file(file_id: uuid.UUID) -> dict:
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(UploadBatchFile)
            .options(selectinload(UploadBatchFile.batch))
            .where(UploadBatchFile.id == file_id)
        )
        item = result.scalar_one_or_none()
        if item is None:
            return {"status": "missing"}
        if item.status == "completed":
            return {"status": "completed", "media_id": str(item.media_id)}
        batch = item.batch
        media = await Media.get_by_id(db, item.media_id) if item.media_id else None
        if media is None:
            await UploadBatchService.fail_file(db, batch, item, "Uploaded media is unavailable")
            await db.commit()
            return {"status": "failed"}
        try:
            _create_preview(media)
            await UploadBatchService.complete_file(db, batch, item, media.id)
            enqueue_upload_progress(
                db,
                school_id=batch.school_id,
                actor_id=batch.created_by_id,
                batch_id=batch.id,
                completed=batch.completed_files + batch.failed_files,
                total=batch.total_files,
                last_percent=max(
                    0,
                    int((batch.completed_files + batch.failed_files - 1) * 100 / batch.total_files),
                ),
            )
            await db.commit()
        except Exception as exc:  # noqa: BLE001 - failure is persisted for per-file retry.
            await UploadBatchService.fail_file(db, batch, item, str(exc))
            await db.commit()
            raise
        return {"status": item.status, "media_id": str(media.id)}


async def _cleanup_expired_upload_batches() -> int:
    async with AsyncSessionLocal() as db:
        count = await UploadBatchService.cleanup_expired(db)
        await db.commit()
        return count
