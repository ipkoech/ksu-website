import unittest
import uuid
from types import SimpleNamespace

from fastapi import FastAPI, HTTPException

from app.api.v1 import register_routes
from app.api.v1.corporate_portal_media import (
    CORPORATE_MEDIA_PORTAL,
    MEDIA_UPLOAD_PERMISSIONS,
    MEDIA_VIEW_PERMISSIONS,
)
from app.models.upload_batch import UploadBatch, UploadBatchFile
from app.services.upload_batch import (
    UploadBatchService,
    enqueue_upload_progress,
)


class _Db:
    def __init__(self):
        self.added = []

    def add(self, value):
        self.added.append(value)

    async def flush(self):
        return None


class CorporatePortalMediaBatchTests(unittest.IsolatedAsyncioTestCase):
    def test_batch_model_is_portal_aware(self):
        columns = UploadBatch.__table__.columns
        self.assertIn("portal", columns.keys())
        self.assertTrue(columns["school_id"].nullable)
        self.assertEqual("schools", columns["portal"].server_default.arg)
        # Batch files stay portal-agnostic.
        self.assertTrue(UploadBatchFile.__table__.columns["target_entity_type"].nullable)

    def test_routes_expose_corporate_batch_progress_and_file_retry(self):
        app = FastAPI()
        register_routes(app)
        paths = app.openapi()["paths"]
        base = "/api/v1/corporate-communication-portal"
        self.assertIn(f"{base}/media/batches", paths)
        self.assertIn(f"{base}/media/batches/{{batch_id}}", paths)
        self.assertIn(f"{base}/media/batches/{{batch_id}}/files/{{file_id}}/retry", paths)

    def test_school_batch_routes_are_unchanged(self):
        app = FastAPI()
        register_routes(app)
        paths = app.openapi()["paths"]
        self.assertIn("/api/v1/school-portal/media/batches", paths)
        self.assertIn("/api/v1/school-portal/media/batches/{batch_id}", paths)
        self.assertIn(
            "/api/v1/school-portal/media/batches/{batch_id}/files/{file_id}/retry",
            paths,
        )

    def test_corporate_gate_uses_media_screen_scopes(self):
        self.assertEqual("corporate-communication", CORPORATE_MEDIA_PORTAL)
        self.assertEqual(("media.manage", "media.upload"), MEDIA_UPLOAD_PERMISSIONS)
        self.assertIn("media.view", MEDIA_VIEW_PERMISSIONS)

    async def test_create_for_portal_requires_files(self):
        db = _Db()
        with self.assertRaises(HTTPException) as caught:
            await UploadBatchService.create_for_portal(
                db,
                portal=CORPORATE_MEDIA_PORTAL,
                actor_id=uuid.uuid4(),
                files=[],
            )
        self.assertEqual(422, caught.exception.status_code)
        self.assertEqual([], db.added)

    def test_progress_events_without_school_scope_use_portal_scope(self):
        db = _Db()
        percent = enqueue_upload_progress(
            db,
            school_id=None,
            actor_id=uuid.uuid4(),
            batch_id=uuid.uuid4(),
            completed=2,
            total=2,
            last_percent=0,
        )
        self.assertEqual(100, percent)
        self.assertEqual(1, len(db.added))
        event = db.added[0]
        self.assertEqual("portal.upload.progress", event.event_type)
        self.assertEqual("portal", event.scope_type)
        self.assertIsNone(event.scope_id)

    def test_school_progress_events_keep_school_scope(self):
        db = _Db()
        school_id = uuid.uuid4()
        enqueue_upload_progress(
            db,
            school_id=school_id,
            actor_id=uuid.uuid4(),
            batch_id=uuid.uuid4(),
            completed=1,
            total=1,
            last_percent=0,
        )
        event = db.added[0]
        self.assertEqual("school.upload.progress", event.event_type)
        self.assertEqual("school", event.scope_type)
        self.assertEqual(school_id, event.scope_id)

    async def test_retry_is_portal_agnostic_and_requires_failed_status(self):
        db = _Db()
        batch = SimpleNamespace(
            failed_files=1,
            status="completed_with_errors",
            completed_at="then",
        )
        item = SimpleNamespace(status="completed", error=None, attempts=1)
        with self.assertRaises(HTTPException) as caught:
            await UploadBatchService.retry_file(db, batch, item)
        self.assertEqual(409, caught.exception.status_code)


if __name__ == "__main__":
    unittest.main()
