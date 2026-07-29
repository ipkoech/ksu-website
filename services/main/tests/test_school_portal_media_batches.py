import unittest
import uuid
from types import SimpleNamespace

from fastapi import FastAPI, HTTPException

from app.api.v1 import register_routes
from app.models.upload_batch import UploadBatch, UploadBatchFile
from app.services.upload_batch import (
    UploadBatchService,
    enqueue_upload_progress,
    validate_file_signature,
)


class _Db:
    def __init__(self):
        self.added = []

    def add(self, value):
        self.added.append(value)

    async def flush(self):
        return None


class SchoolPortalMediaBatchTests(unittest.IsolatedAsyncioTestCase):
    def test_batch_models_track_progress_integrity_scope_and_retry(self):
        batch_fields = {
            "school_id",
            "created_by_id",
            "status",
            "total_files",
            "completed_files",
            "failed_files",
            "total_bytes",
            "received_bytes",
            "expires_at",
        }
        file_fields = {
            "batch_id",
            "client_reference",
            "original_filename",
            "mime_type",
            "file_size",
            "bytes_received",
            "checksum_sha256",
            "target_entity_type",
            "target_entity_id",
            "target_role",
            "display_order",
            "status",
            "error",
            "attempts",
            "media_id",
        }
        self.assertTrue(batch_fields <= set(UploadBatch.__table__.columns.keys()))
        self.assertTrue(file_fields <= set(UploadBatchFile.__table__.columns.keys()))

    def test_routes_expose_batch_progress_and_file_retry(self):
        app = FastAPI()
        register_routes(app)
        paths = app.openapi()["paths"]
        self.assertIn("/api/v1/school-portal/media/batches", paths)
        self.assertIn("/api/v1/school-portal/media/batches/{batch_id}", paths)
        self.assertIn(
            "/api/v1/school-portal/media/batches/{batch_id}/files/{file_id}/retry",
            paths,
        )
        self.assertIn("/api/v1/school-portal/media/content-imports/preview", paths)
        self.assertIn("/api/v1/school-portal/media/content-imports", paths)

    def test_signature_validation_uses_bytes_not_filename(self):
        validate_file_signature("image/png", b"\x89PNG\r\n\x1a\n")
        validate_file_signature("application/pdf", b"%PDF-1.7")
        with self.assertRaises(ValueError):
            validate_file_signature("image/png", b"<script>")

    async def test_completion_is_idempotent_and_does_not_double_count(self):
        batch = SimpleNamespace(
            completed_files=0,
            failed_files=0,
            received_bytes=0,
            total_files=1,
            status="processing",
        )
        item = SimpleNamespace(
            status="processing",
            file_size=120,
            bytes_received=120,
            media_id=None,
            error=None,
        )
        media_id = uuid.uuid4()
        db = _Db()

        await UploadBatchService.complete_file(db, batch, item, media_id)
        await UploadBatchService.complete_file(db, batch, item, media_id)

        self.assertEqual("completed", item.status)
        self.assertEqual(1, batch.completed_files)
        self.assertEqual(120, batch.received_bytes)
        self.assertEqual("completed", batch.status)

    def test_link_target_must_resolve_to_current_school(self):
        with self.assertRaises(HTTPException) as caught:
            UploadBatchService.verify_target_school(
                expected_school_id=uuid.uuid4(),
                resolved_scope_type="school",
                resolved_scope_id=uuid.uuid4(),
            )
        self.assertEqual(404, caught.exception.status_code)

    def test_progress_events_are_throttled(self):
        db = _Db()
        school_id = uuid.uuid4()
        actor_id = uuid.uuid4()
        batch_id = uuid.uuid4()
        self.assertEqual(
            0,
            enqueue_upload_progress(
                db,
                school_id=school_id,
                actor_id=actor_id,
                batch_id=batch_id,
                completed=1,
                total=100,
                last_percent=0,
            ),
        )
        self.assertEqual(
            10,
            enqueue_upload_progress(
                db,
                school_id=school_id,
                actor_id=actor_id,
                batch_id=batch_id,
                completed=10,
                total=100,
                last_percent=0,
            ),
        )
        self.assertEqual(1, len(db.added))


if __name__ == "__main__":
    unittest.main()
