import unittest
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.api.v1.content_workflow import (
    CONTENT_MODELS,
    authorize_club_media_workflow_action,
    authorize_content_workflow_action,
    authorize_content_workflow_queue_access,
    build_content_workflow_queue_items,
    run_content_workflow_action,
)
from app.schemas.content_workflow import ContentWorkflowActionRequest
from app.services.content_workflow import ContentWorkflowService


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
        author_user_id=owner_id,
        is_published=False,
        is_public=False,
        published_at=None,
        archived_at=None,
        valid_from=None,
        updated_at=None,
    )


class ContentWorkflowTests(unittest.IsolatedAsyncioTestCase):
    def test_queue_access_requires_a_cocms_workflow_permission(self):
        with self.assertRaises(HTTPException) as context:
            authorize_content_workflow_queue_access({"content.submit"})

        self.assertEqual(403, context.exception.status_code)

        for permission in (
            "content.review",
            "content.publish",
            "content.manage",
            "homepage.manage",
        ):
            authorize_content_workflow_queue_access({permission})

    def test_queue_items_are_filtered_and_use_human_readable_labels(self):
        reviewer_id = uuid.uuid4()
        submitted_at = datetime(2030, 1, 10, tzinfo=timezone.utc)
        scheduled_at = datetime(2030, 1, 15, tzinfo=timezone.utc)
        records = {
            "news": [
                SimpleNamespace(
                    id=uuid.uuid4(),
                    title="Campus opens innovation hub",
                    slug="innovation-hub",
                    summary="A new collaboration space for students.",
                    workflow_status="submitted",
                    owner_portal="research",
                    author_user_id=None,
                    submitted_by_id=reviewer_id,
                    submitted_at=submitted_at,
                    reviewed_by_id=reviewer_id,
                    scheduled_publish_at=scheduled_at,
                    rich_text="<p>Preview body</p>",
                    plain_text="Preview body",
                    structured_content=None,
                    related_links=[],
                    meta_title="Innovation hub",
                    meta_description="Research news",
                    keywords=["innovation"],
                )
            ],
            "blogs": [
                SimpleNamespace(
                    id=uuid.uuid4(),
                    title="Alumni profile",
                    slug="alumni-profile",
                    summary=None,
                    workflow_status="approved",
                    owner_portal="alumni",
                    author_user_id=None,
                    submitted_by_id=None,
                    submitted_at=datetime(2030, 1, 9, tzinfo=timezone.utc),
                    reviewed_by_id=None,
                    scheduled_publish_at=None,
                    rich_text=None,
                    plain_text=None,
                    structured_content=None,
                    related_links=[],
                    meta_title=None,
                    meta_description=None,
                    keywords=None,
                )
            ],
        }

        items = build_content_workflow_queue_items(
            records,
            {reviewer_id: "Amina Reviewer"},
            content_type="news",
            status_filter="submitted",
            source_portal="research",
            submitted_date=submitted_at.date(),
            scheduled_date=scheduled_at.date(),
            reviewer="amina",
        )

        self.assertEqual(1, len(items))
        item = items[0]
        self.assertEqual("Campus opens innovation hub", item["title"])
        self.assertEqual("Research Portal", item["owner_label"])
        self.assertEqual("Research Portal", item["source_label"])
        self.assertEqual("Amina Reviewer", item["submitted_by_label"])
        self.assertEqual("Amina Reviewer", item["reviewer_label"])
        self.assertEqual("/news/innovation-hub", item["preview_path"])
        self.assertNotEqual(str(reviewer_id), item["submitted_by_label"])

    def test_club_media_is_discoverable_in_cocms_workflow_queue_contract(self):
        media = SimpleNamespace(title=None, original_filename="club-gallery.jpg", filename="club-gallery.jpg")
        submitted_at = datetime(2030, 1, 10, tzinfo=timezone.utc)
        records = {
            "club-media": [
                SimpleNamespace(
                    id=uuid.uuid4(),
                    media=media,
                    workflow_status="submitted",
                    owner_portal="student-clubs",
                    author_user_id=None,
                    submitted_by_id=None,
                    submitted_at=submitted_at,
                    reviewed_by_id=None,
                    scheduled_publish_at=None,
                    rich_text=None,
                    plain_text=None,
                    structured_content=None,
                    related_links=[],
                    meta_title=None,
                    meta_description=None,
                    keywords=None,
                )
            ]
        }

        self.assertIn("club-media", CONTENT_MODELS)
        items = build_content_workflow_queue_items(records, {}, source_portal="student-clubs")

        self.assertEqual(1, len(items))
        self.assertEqual("Club Media", items[0]["content_type_label"])
        self.assertEqual("club-gallery.jpg", items[0]["title"])
        self.assertEqual("/cocms/review-queue", items[0]["edit_path"])

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

    async def test_transitions_record_workflow_metadata(self):
        db = _FakeDb()
        actor_id = uuid.uuid4()
        item = _content()

        await ContentWorkflowService.transition(db, item, "news", "submit", actor_id)
        self.assertEqual("submitted", item.workflow_status)
        self.assertEqual(actor_id, item.submitted_by_id)
        self.assertIsNotNone(item.submitted_at)

        await ContentWorkflowService.transition(db, item, "news", "start_review", actor_id)
        self.assertEqual(actor_id, item.reviewed_by_id)
        self.assertIsNotNone(item.reviewed_at)

        await ContentWorkflowService.transition(db, item, "news", "approve", actor_id)
        self.assertEqual(actor_id, item.approved_by_id)
        self.assertIsNotNone(item.approved_at)

        scheduled_for = datetime(2030, 1, 1, tzinfo=timezone.utc)
        await ContentWorkflowService.transition(
            db, item, "news", "schedule", actor_id, scheduled_for=scheduled_for,
        )
        self.assertEqual(scheduled_for, item.scheduled_publish_at)

        await ContentWorkflowService.transition(db, item, "news", "publish", actor_id)
        self.assertEqual(actor_id, item.published_by_id)
        self.assertIsNotNone(item.published_at)

        await ContentWorkflowService.transition(db, item, "news", "unpublish", actor_id)
        self.assertEqual(actor_id, item.unpublished_by_id)
        self.assertIsNotNone(item.unpublished_at)

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

    async def test_generic_club_event_submit_requires_access_to_its_club(self):
        user = SimpleNamespace(id=uuid.uuid4())
        event = _content(owner_id=user.id)
        event.club_id = uuid.uuid4()

        with patch(
            "app.api.v1.content_workflow._get_content_or_404",
            new_callable=AsyncMock,
            return_value=event,
        ), patch("app.api.v1.content_workflow.permissions_for_user", return_value=set()):
            with self.assertRaises(HTTPException) as context:
                await run_content_workflow_action(
                    content_type="club-events",
                    content_id=event.id,
                    action="submit",
                    data=ContentWorkflowActionRequest(),
                    db=None,
                    user=user,
                )

        self.assertEqual(403, context.exception.status_code)

    async def test_generic_club_event_non_submit_requires_cocms_workflow_permission(self):
        user = SimpleNamespace(id=uuid.uuid4())
        event = _content(status="submitted", owner_id=user.id)
        event.club_id = uuid.uuid4()

        with patch(
            "app.api.v1.content_workflow._get_content_or_404",
            new_callable=AsyncMock,
            return_value=event,
        ), patch("app.api.v1.content_workflow.permissions_for_user", return_value={"content.edit"}):
            with self.assertRaises(HTTPException) as context:
                await run_content_workflow_action(
                    content_type="club-events",
                    content_id=event.id,
                    action="edit",
                    data=ContentWorkflowActionRequest(),
                    db=None,
                    user=user,
                )

        self.assertEqual(403, context.exception.status_code)

    async def test_generic_club_media_publish_syncs_underlying_media_visibility(self):
        user = SimpleNamespace(id=uuid.uuid4())
        link = _content(status="approved")
        link.workflow_status = "approved"
        link.media = SimpleNamespace(is_public=False)

        with patch(
            "app.api.v1.content_workflow._get_content_or_404",
            new_callable=AsyncMock,
            return_value=link,
        ), patch("app.api.v1.content_workflow.permissions_for_user", return_value={"content.publish"}):
            await run_content_workflow_action(
                content_type="club-media",
                content_id=link.id,
                action="publish",
                data=ContentWorkflowActionRequest(),
                db=_FakeDb(),
                user=user,
            )

        self.assertTrue(link.is_public)
        self.assertTrue(link.media.is_public)

    def test_club_media_workflow_uses_action_specific_permissions(self):
        with self.assertRaises(HTTPException):
            authorize_club_media_workflow_action("publish", {"content.review"})
        with self.assertRaises(HTTPException):
            authorize_club_media_workflow_action("approve", {"content.publish"})

        authorize_club_media_workflow_action("approve", {"content.review"})
        authorize_club_media_workflow_action("publish", {"content.publish"})


if __name__ == "__main__":
    unittest.main()
