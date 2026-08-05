import unittest
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace

from app.api.v1.content_workflow import (
    CONTENT_MODELS,
    build_content_workflow_queue_items,
)
from app.services.content_workflow import ALLOWED_TRANSITIONS


def _record(title, content_type):
    return SimpleNamespace(
        id=uuid.uuid4(),
        title=title,
        slug=f"{content_type}-item",
        description="School content",
        workflow_status="submitted",
        status="submitted",
        owner_portal="schools",
        owner_scope_type="school",
        owner_scope_id=uuid.uuid4(),
        author_user_id=None,
        submitted_by_id=None,
        submitted_at=datetime.now(timezone.utc),
        reviewed_by_id=None,
        scheduled_publish_at=None,
        rich_text=None,
        plain_text=None,
        structured_content=None,
        related_links=[],
        meta_title=None,
        meta_description=None,
        keywords=None,
        media=None,
    )


class SchoolCoCMSHandoffTests(unittest.TestCase):
    def test_school_documents_and_gallery_are_in_shared_queue(self):
        self.assertIn("documents", CONTENT_MODELS)
        self.assertIn("school-gallery", CONTENT_MODELS)
        items = build_content_workflow_queue_items(
            {
                "documents": [_record("School handbook", "documents")],
                "school-gallery": [_record("Graduation gallery", "school-gallery")],
            },
            {},
            source_portal="schools",
        )
        self.assertEqual({"documents", "school-gallery"}, {item["content_type"] for item in items})
        self.assertTrue(all(item["source_portal"] == "schools" for item in items))

    def test_author_can_withdraw_only_before_review(self):
        self.assertEqual("draft", ALLOWED_TRANSITIONS["submitted"]["withdraw"])
        self.assertNotIn("withdraw", ALLOWED_TRANSITIONS["in_review"])


if __name__ == "__main__":
    unittest.main()
