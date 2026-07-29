import unittest
import uuid
from types import SimpleNamespace

from fastapi import FastAPI, HTTPException
from pydantic import ValidationError

from app.api.v1 import register_routes
from app.models import Document
from app.schemas.school_portal_content import SchoolContentCreate
from app.services.content_workflow import ContentWorkflowService
from app.services.school_portal_content import (
    SCHOOL_CONTENT_MODELS,
    school_content_create_payload,
    verify_school_content_owner,
)


class _Db:
    def __init__(self):
        self.added = []

    def add(self, item):
        self.added.append(item)


class SchoolPortalContentTests(unittest.IsolatedAsyncioTestCase):
    def test_supported_school_content_adapters_and_routes(self):
        self.assertEqual(
            {
                "news",
                "event",
                "story",
                "announcement",
                "calendar_entry",
                "gallery_link",
                "document",
                "download",
            },
            set(SCHOOL_CONTENT_MODELS),
        )
        app = FastAPI()
        register_routes(app)
        paths = app.openapi()["paths"]
        self.assertIn("/api/v1/school-portal/content", paths)
        self.assertIn("/api/v1/school-portal/content/{content_type}/{content_id}", paths)
        self.assertIn(
            "/api/v1/school-portal/content/{content_type}/{content_id}/submit",
            paths,
        )
        self.assertIn(
            "/api/v1/school-portal/content/{content_type}/{content_id}/withdraw",
            paths,
        )

    def test_school_create_rejects_caller_owned_scope_and_workflow(self):
        for forbidden in ("school_id", "scope_id", "owner_scope_id", "status", "is_public"):
            with self.subTest(forbidden=forbidden), self.assertRaises(ValidationError):
                SchoolContentCreate(
                    content_type="news",
                    data={"title": "Update", "slug": "update", forbidden: "unsafe"},
                )

    def test_create_payload_is_private_draft_owned_by_current_school(self):
        school_id = uuid.uuid4()
        actor_id = uuid.uuid4()
        payload = school_content_create_payload(
            "news",
            {"title": "School update", "slug": "school-update"},
            school_id=school_id,
            actor_id=actor_id,
        )
        self.assertEqual("draft", payload["status"])
        self.assertEqual("draft", payload["workflow_status"])
        self.assertFalse(payload["is_public"])
        self.assertFalse(payload["is_published"])
        self.assertEqual("schools", payload["owner_portal"])
        self.assertEqual("school", payload["owner_scope_type"])
        self.assertEqual(school_id, payload["owner_scope_id"])
        self.assertEqual(school_id, payload["scope_id"])
        self.assertEqual(actor_id, payload["author_user_id"])

    def test_cross_school_record_is_hidden(self):
        with self.assertRaises(HTTPException) as caught:
            verify_school_content_owner(
                SimpleNamespace(owner_scope_type="school", owner_scope_id=uuid.uuid4()),
                uuid.uuid4(),
            )
        self.assertEqual(404, caught.exception.status_code)

    async def test_actor_aware_edits_preserve_review_state_and_lock_submitted_authors(self):
        db = _Db()
        actor = uuid.uuid4()
        submitted = SimpleNamespace(id=uuid.uuid4(), workflow_status="submitted", status="submitted")
        with self.assertRaises(ValueError):
            await ContentWorkflowService.apply_edit_policy(
                db, submitted, "news", actor, actor_kind="author"
            )

        in_review = SimpleNamespace(id=uuid.uuid4(), workflow_status="in_review", status="in_review")
        changed = await ContentWorkflowService.apply_edit_policy(
            db,
            in_review,
            "news",
            actor,
            actor_kind="reviewer",
            changed_fields={"title": "Corrected"},
        )
        self.assertFalse(changed)
        self.assertEqual("in_review", in_review.workflow_status)
        self.assertEqual("in_review", in_review.status)

    def test_document_has_shared_workflow_metadata(self):
        expected = {
            "workflow_status",
            "owner_portal",
            "owner_scope_type",
            "owner_scope_id",
            "author_user_id",
            "submitted_by_id",
            "submitted_at",
            "reviewed_by_id",
            "reviewed_at",
            "approved_by_id",
            "approved_at",
            "published_by_id",
            "published_at",
            "scheduled_publish_at",
            "revision_notes",
            "rejection_reason",
            "is_published",
            "archived_at",
        }
        self.assertTrue(expected <= set(Document.__table__.columns.keys()))


if __name__ == "__main__":
    unittest.main()
