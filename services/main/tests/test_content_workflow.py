import unittest
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace

from fastapi import HTTPException

from app.api.v1.content_workflow import authorize_content_workflow_action
from app.services.content_workflow import ContentWorkflowService


class _FakeDb:
    def __init__(self):
        self.added = []

    def add(self, item):
        self.added.append(item)


def _content(status="draft", owner_id=None):
    return SimpleNamespace(
        id=uuid.uuid4(),
        status=status,
        author_user_id=owner_id,
        is_published=False,
        is_public=False,
        published_at=None,
        archived_at=None,
        valid_from=None,
        updated_at=None,
    )


class ContentWorkflowTests(unittest.IsolatedAsyncioTestCase):
    async def test_valid_transitions_update_content_and_create_workflow_logs(self):
        db = _FakeDb()
        actor_id = uuid.uuid4()
        item = _content()

        for action, expected_status in (
            ("submit", "submitted"),
            ("start_review", "in_review"),
            ("approve", "approved"),
            ("schedule", "scheduled"),
            ("publish", "published"),
            ("unpublish", "unpublished"),
            ("archive", "archived"),
        ):
            await ContentWorkflowService.transition(db, item, "news", action, actor_id)
            self.assertEqual(expected_status, item.status)

        self.assertEqual(7, len(db.added))
        self.assertEqual("draft", db.added[0].from_status)
        self.assertEqual("submitted", db.added[0].to_status)
        self.assertEqual("archive", db.added[-1].action)
        self.assertTrue(item.archived_at)

    def test_content_owner_cannot_publish(self):
        owner_id = uuid.uuid4()
        item = _content(status="approved", owner_id=owner_id)
        user = SimpleNamespace(id=owner_id)

        with self.assertRaises(HTTPException) as context:
            authorize_content_workflow_action(user, item, "publish", {"content.publish"})

        self.assertEqual(403, context.exception.status_code)

    def test_cocms_can_edit_submitted_content_with_edit_submitted_permission(self):
        item = _content(status="submitted", owner_id=uuid.uuid4())
        user = SimpleNamespace(id=uuid.uuid4())

        authorize_content_workflow_action(user, item, "edit", {"content.edit_submitted"})


if __name__ == "__main__":
    unittest.main()
