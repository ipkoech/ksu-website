"""Validated, idempotent school media upload batches."""

from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from typing import Iterable

from fastapi import HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from ..core.config import get_settings
from ..models import Department, Programme, UploadBatch, UploadBatchFile
from .domain_events import enqueue_domain_event
from .media import MediaService

settings = get_settings()

SIGNATURES: dict[str, tuple[bytes, ...]] = {
    "image/jpeg": (b"\xff\xd8\xff",),
    "image/png": (b"\x89PNG\r\n\x1a\n",),
    "image/gif": (b"GIF87a", b"GIF89a"),
    "image/webp": (b"RIFF",),
    "application/pdf": (b"%PDF-",),
    "application/msword": (b"\xd0\xcf\x11\xe0",),
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": (b"PK\x03\x04",),
}


def validate_file_signature(mime_type: str, prefix: bytes) -> None:
    signatures = SIGNATURES.get(mime_type)
    if signatures is None:
        raise ValueError("Unsupported upload MIME type")
    if not any(prefix.startswith(signature) for signature in signatures):
        raise ValueError("File signature does not match its declared MIME type")
    if mime_type == "image/webp" and prefix[8:12] != b"WEBP":
        raise ValueError("File signature does not match its declared MIME type")


def enqueue_upload_progress(
    db,
    *,
    school_id: uuid.UUID | None,
    actor_id: uuid.UUID,
    batch_id: uuid.UUID,
    completed: int,
    total: int,
    last_percent: int,
) -> int:
    percent = 100 if total == 0 else int(completed * 100 / total)
    step = settings.UPLOAD_PROGRESS_STEP_PERCENT
    if percent < 100 and percent - last_percent < step:
        return last_percent
    if school_id is not None:
        event_type, scope_type = "school.upload.progress", "school"
    else:
        # Portal batches (e.g. Corporate Communication) have no school scope.
        event_type, scope_type = "portal.upload.progress", "portal"
    enqueue_domain_event(
        db,
        event_type=event_type,
        scope_type=scope_type,
        scope_id=school_id,
        actor_id=actor_id,
        resource_type="upload_batch",
        resource_id=batch_id,
        data={"completed_files": completed, "total_files": total, "percent": percent},
    )
    return percent


class UploadBatchService:
    @staticmethod
    def verify_target_school(
        *,
        expected_school_id: uuid.UUID,
        resolved_scope_type: str,
        resolved_scope_id: uuid.UUID | None,
    ) -> None:
        if resolved_scope_type != "school" or resolved_scope_id != expected_school_id:
            raise HTTPException(status_code=404, detail="Upload target not found")

    @classmethod
    async def get_for_portal(cls, db, batch_id: uuid.UUID, portal: str):
        result = await db.execute(
            select(UploadBatch)
            .options(selectinload(UploadBatch.files))
            .where(
                UploadBatch.id == batch_id,
                UploadBatch.portal == portal,
                UploadBatch.school_id.is_(None),
                UploadBatch.deleted_at.is_(None),
            )
        )
        batch = result.scalar_one_or_none()
        if batch is None:
            raise HTTPException(status_code=404, detail="Upload batch not found")
        return batch

    @classmethod
    async def get_for_school(cls, db, batch_id: uuid.UUID, school_id: uuid.UUID):
        result = await db.execute(
            select(UploadBatch)
            .options(selectinload(UploadBatch.files))
            .where(
                UploadBatch.id == batch_id,
                UploadBatch.school_id == school_id,
                UploadBatch.deleted_at.is_(None),
            )
        )
        batch = result.scalar_one_or_none()
        if batch is None:
            raise HTTPException(status_code=404, detail="Upload batch not found")
        return batch

    @staticmethod
    async def resolve_target_school(
        db,
        *,
        resolved_scope_type: str,
        resolved_scope_id: uuid.UUID | None,
    ) -> uuid.UUID | None:
        if resolved_scope_type == "school":
            return resolved_scope_id
        if resolved_scope_type == "department" and resolved_scope_id:
            result = await db.execute(
                select(Department.school_id).where(
                    Department.id == resolved_scope_id,
                    Department.deleted_at.is_(None),
                )
            )
            return result.scalar_one_or_none()
        if resolved_scope_type == "programme" and resolved_scope_id:
            result = await db.execute(
                select(Department.school_id)
                .join(Programme, Programme.department_id == Department.id)
                .where(
                    Programme.id == resolved_scope_id,
                    Programme.deleted_at.is_(None),
                    Department.deleted_at.is_(None),
                )
            )
            return result.scalar_one_or_none()
        return None

    @staticmethod
    async def _validate_uploads(
        uploads: list[UploadFile],
    ) -> list[tuple[UploadFile, bytes, str]]:
        validated_uploads: list[tuple[UploadFile, bytes, str]] = []
        for upload in uploads:
            content = await upload.read(settings.MAX_UPLOAD_MB * 1024 * 1024 + 1)
            await upload.seek(0)
            if len(content) > settings.MAX_UPLOAD_MB * 1024 * 1024:
                raise HTTPException(status_code=413, detail=f"{upload.filename} exceeds upload limit")
            mime_type = upload.content_type or "application/octet-stream"
            try:
                validate_file_signature(mime_type, content[:16])
            except ValueError as exc:
                raise HTTPException(status_code=400, detail=f"{upload.filename}: {exc}") from exc
            validated_uploads.append((upload, content, mime_type))
        return validated_uploads

    @classmethod
    async def create_for_portal(
        cls,
        db,
        *,
        portal: str,
        actor_id: uuid.UUID,
        files: Iterable[UploadFile],
        folder_id: uuid.UUID | None = None,
        is_public: bool = False,
        target_role: str = "attachment",
    ) -> UploadBatch:
        """Create a portal-scoped batch whose files land as plain media rows."""
        uploads = list(files)
        if not uploads:
            raise HTTPException(status_code=422, detail="At least one file is required")
        validated_uploads = await cls._validate_uploads(uploads)

        batch = UploadBatch(
            school_id=None,
            portal=portal,
            created_by_id=actor_id,
            status="processing",
            total_files=len(uploads),
            completed_files=0,
            failed_files=0,
            total_bytes=sum(len(content) for _, content, _ in validated_uploads),
            received_bytes=0,
            expires_at=datetime.now(timezone.utc)
            + timedelta(hours=settings.UPLOAD_BATCH_EXPIRY_HOURS),
        )
        db.add(batch)
        await db.flush()

        for index, (upload, content, mime_type) in enumerate(validated_uploads):
            item = UploadBatchFile(
                batch_id=batch.id,
                client_reference=f"{index + 1}:{upload.filename or 'file'}",
                original_filename=upload.filename or "file",
                mime_type=mime_type,
                file_size=len(content),
                bytes_received=len(content),
                checksum_sha256=hashlib.sha256(content).hexdigest(),
                target_entity_type=None,
                target_entity_id=None,
                target_role=target_role,
                display_order=index,
                status="processing",
                attempts=1,
            )
            db.add(item)
            await db.flush()
            media = await MediaService.upload(
                db,
                file=upload,
                folder_id=folder_id,
                uploaded_by_id=actor_id,
                is_public=is_public,
            )
            media.is_processed = False
            if media.file_hash != item.checksum_sha256:
                raise HTTPException(status_code=400, detail=f"{upload.filename}: checksum mismatch")
            item.media_id = media.id

            # Delay dispatch slightly so the request transaction can commit.
            from ..tasks.media import process_upload_file

            process_upload_file.apply_async(args=[str(item.id)], countdown=1)
        await db.flush()
        return batch

    @classmethod
    async def create(
        cls,
        db,
        *,
        school_id: uuid.UUID,
        actor_id: uuid.UUID,
        files: Iterable[UploadFile],
        target_entity_type: str | None = None,
        target_entity_id: uuid.UUID | None = None,
        target_role: str = "attachment",
    ) -> UploadBatch:
        uploads = list(files)
        if not uploads:
            raise HTTPException(status_code=422, detail="At least one file is required")
        if (target_entity_type is None) != (target_entity_id is None):
            raise HTTPException(status_code=422, detail="Upload target type and ID are required together")
        entity_type = target_entity_type or "school"
        entity_id = target_entity_id or school_id
        resolved_type, resolved_id = await MediaService.get_attachment_scope(
            db,
            entity_type=entity_type,
            entity_id=entity_id,
        )
        target_school_id = await cls.resolve_target_school(
            db,
            resolved_scope_type=resolved_type,
            resolved_scope_id=resolved_id,
        )
        cls.verify_target_school(
            expected_school_id=school_id,
            resolved_scope_type="school" if target_school_id else resolved_type,
            resolved_scope_id=target_school_id or resolved_id,
        )

        validated_uploads = await cls._validate_uploads(uploads)

        batch = UploadBatch(
            school_id=school_id,
            created_by_id=actor_id,
            status="processing",
            total_files=len(uploads),
            completed_files=0,
            failed_files=0,
            total_bytes=sum(len(content) for _, content, _ in validated_uploads),
            received_bytes=0,
            expires_at=datetime.now(timezone.utc)
            + timedelta(hours=settings.UPLOAD_BATCH_EXPIRY_HOURS),
        )
        db.add(batch)
        await db.flush()

        for index, (upload, content, mime_type) in enumerate(validated_uploads):
            item = UploadBatchFile(
                batch_id=batch.id,
                client_reference=f"{index + 1}:{upload.filename or 'file'}",
                original_filename=upload.filename or "file",
                mime_type=mime_type,
                file_size=len(content),
                bytes_received=len(content),
                checksum_sha256=hashlib.sha256(content).hexdigest(),
                target_entity_type=entity_type,
                target_entity_id=entity_id,
                target_role=target_role,
                display_order=index,
                status="processing",
                attempts=1,
            )
            db.add(item)
            await db.flush()
            media = await MediaService.upload(
                db,
                file=upload,
                uploaded_by_id=actor_id,
                is_public=False,
                entity_type=entity_type,
                entity_id=entity_id,
                role=target_role,
            )
            media.is_processed = False
            if media.file_hash != item.checksum_sha256:
                raise HTTPException(status_code=400, detail=f"{upload.filename}: checksum mismatch")
            item.media_id = media.id

            # Delay dispatch slightly so the request transaction can commit.
            from ..tasks.media import process_upload_file

            process_upload_file.apply_async(args=[str(item.id)], countdown=1)
        await db.flush()
        return batch

    @staticmethod
    async def complete_file(
        db,
        batch,
        item,
        media_id: uuid.UUID,
    ):
        if item.status == "completed":
            return item
        if item.status == "failed" and batch.failed_files:
            batch.failed_files -= 1
        item.status = "completed"
        item.media_id = media_id
        item.error = None
        batch.completed_files += 1
        batch.received_bytes += item.bytes_received
        if batch.completed_files + batch.failed_files >= batch.total_files:
            batch.status = "completed" if batch.failed_files == 0 else "completed_with_errors"
            batch.completed_at = datetime.now(timezone.utc)
        await db.flush()
        return item

    @staticmethod
    async def fail_file(db, batch, item, error: str):
        if item.status != "failed":
            batch.failed_files += 1
        item.status = "failed"
        item.error = error[:2000]
        if batch.completed_files + batch.failed_files >= batch.total_files:
            batch.status = "completed_with_errors"
            batch.completed_at = datetime.now(timezone.utc)
        await db.flush()
        return item

    @staticmethod
    async def retry_file(db, batch, item):
        if item.status != "failed":
            raise HTTPException(status_code=409, detail="Only failed files can be retried")
        batch.failed_files = max(0, batch.failed_files - 1)
        batch.status = "processing"
        batch.completed_at = None
        item.status = "processing"
        item.error = None
        item.attempts += 1
        await db.flush()
        from ..tasks.media import process_upload_file

        process_upload_file.apply_async(args=[str(item.id)], countdown=1)
        return item

    @staticmethod
    async def cleanup_expired(db) -> int:
        now = datetime.now(timezone.utc)
        result = await db.execute(
            select(UploadBatch).where(
                UploadBatch.expires_at < now,
                UploadBatch.status.in_(("pending", "processing")),
                UploadBatch.deleted_at.is_(None),
            )
        )
        batches = list(result.scalars().all())
        for batch in batches:
            batch.status = "expired"
            batch.soft_delete()
        await db.flush()
        return len(batches)


__all__ = [
    "UploadBatchService",
    "enqueue_upload_progress",
    "validate_file_signature",
]
