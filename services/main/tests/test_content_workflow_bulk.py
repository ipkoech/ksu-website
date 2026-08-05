import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.api.v1.content_workflow_bulk import (
    BULK_WORKFLOW_ACTIONS,
    BulkWorkflowItem,
    BulkWorkflowRequest,
    MAX_BULK_ITEMS,
    run_bulk_content_workflow_action,
)


class _FakeDb:
    def __init__(self):
        self.added = []

    def add(self, item):
        self.added.append(item)

    async def flush(self):
        return None

    async def refresh(self, item):
        return None


def _content(status="draft", owner_id=None):
    return SimpleNamespace(
        id=uuid.uuid4(),
        status=status,
        workflow_status=status,
        author_user_id=owner_id,
        is_published=False,
        is_public=False,
        published_at=None,
        archived_at=None,
        valid_from=None,
        updated_at=None,
    )


class ContentWorkflowBulkTests(unittest.IsolatedAsyncioTestCase):
    async def test_mixed_batch_reports_per_item_results_without_failing_request(self):
        """One publishable + one wrong-state + one not-permitted -> 200, one ok."""
        user = SimpleNamespace(id=uuid.uuid4())
        publishable = _content(status="approved", owner_id=uuid.uuid4())
        wrong_state = _content(status="draft", owner_id=uuid.uuid4())
        owned = _content(status="approved", owner_id=user.id)
        contents = {item.id: item for item in (publishable, wrong_state, owned)}

        async def fake_get(db, content_type, content_id):
            return contents[content_id]

        request = BulkWorkflowRequest(
            action="publish",
            items=[
                BulkWorkflowItem(content_type="news", content_id=publishable.id),
                BulkWorkflowItem(content_type="news", content_id=wrong_state.id),
                BulkWorkflowItem(content_type="news", content_id=owned.id),
            ],
        )

        with patch(
            "app.api.v1.content_workflow._get_content_or_404",
            new=AsyncMock(side_effect=fake_get),
        ), patch(
            "app.api.v1.content_workflow.permissions_for_user",
            return_value={"content.publish"},
        ):
            response = await run_bulk_content_workflow_action(request, _FakeDb(), user)

        results = response["data"]
        self.assertEqual(3, len(results))
        by_id = {result["content_id"]: result for result in results}

        self.assertTrue(by_id[str(publishable.id)]["ok"])
        self.assertIsNone(by_id[str(publishable.id)]["error"])
        self.assertEqual("published", publishable.workflow_status)

        self.assertFalse(by_id[str(wrong_state.id)]["ok"])
        self.assertIn("Invalid workflow transition", by_id[str(wrong_state.id)]["error"])
        self.assertEqual("draft", wrong_state.workflow_status)

        self.assertFalse(by_id[str(owned.id)]["ok"])
        self.assertEqual("Content owners cannot publish", by_id[str(owned.id)]["error"])
        self.assertEqual("approved", owned.workflow_status)

        self.assertEqual(1, sum(1 for result in results if result["ok"]))

    async def test_unsupported_action_rejected_for_whole_request(self):
        user = SimpleNamespace(id=uuid.uuid4())
        request = BulkWorkflowRequest(
            action="reject",
            items=[BulkWorkflowItem(content_type="news", content_id=uuid.uuid4())],
        )

        with self.assertRaises(HTTPException) as context:
            await run_bulk_content_workflow_action(request, _FakeDb(), user)

        self.assertEqual(400, context.exception.status_code)
        self.assertNotIn("reject", BULK_WORKFLOW_ACTIONS)

    def test_batch_size_is_capped(self):
        items = [
            {"content_type": "news", "content_id": str(uuid.uuid4())}
            for _ in range(MAX_BULK_ITEMS + 1)
        ]
        with self.assertRaises(ValueError):
            BulkWorkflowRequest.model_validate({"action": "publish", "items": items})


if __name__ == "__main__":
    unittest.main()
