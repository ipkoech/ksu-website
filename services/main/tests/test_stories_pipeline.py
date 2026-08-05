"""Contributor story pipeline: submission -> review queue -> publish.

Covers the story-contributor portal contract end to end at the unit level:
workflow transitions (including resubmission after changes_requested),
queue serialization of contributor submissions, submission schema guards
(consent + body), and the contributor field restriction on updates.
"""

import unittest
import uuid
from types import SimpleNamespace

from fastapi import HTTPException
from pydantic import ValidationError

from app.api.v1.content_workflow import (
    CONTENT_MODELS,
    authorize_content_workflow_action,
    build_content_workflow_queue_items,
)
from app.api.v1.stories import (
    CONTRIBUTOR_EDITABLE_FIELDS,
    reject_non_contributor_fields,
)
from app.schemas import StorySubmissionCreate
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


def _story(status="draft", contributor_id=None, **overrides):
    contributor_id = contributor_id or uuid.uuid4()
    defaults = dict(
        id=uuid.uuid4(),
        status=status,
        workflow_status=status,
        title="A contributor story",
        summary="Summary",
        slug="a-contributor-story",
        rich_text="<p>Full story body</p>",
        plain_text="Full story body",
        structured_content=None,
        related_links=[],
        is_published=False,
        is_public=False,
        published_at=None,
        archived_at=None,
        valid_from=None,
        updated_at=None,
        submitted_at=None,
        submitted_by_id=None,
        scheduled_publish_at=None,
        reviewed_by_id=None,
        author_user_id=contributor_id,
        contributor_user_id=contributor_id,
        contributor_name_snapshot="Jane Contributor",
        contributor_email_snapshot="jane@example.com",
        contributor_affiliation_snapshot="School of Health Sciences",
        show_contributor_name=True,
        consent_to_publish=True,
        source_type="external",
        owner_portal="cocms",
        revision_notes=None,
        rejection_reason=None,
        meta_title=None,
        meta_description=None,
        keywords=None,
    )
    defaults.update(overrides)
    return SimpleNamespace(**defaults)


class StorySubmissionSchemaTests(unittest.TestCase):
    def test_submission_requires_consent(self):
        with self.assertRaises(ValidationError):
            StorySubmissionCreate(
                title="No consent",
                rich_text="<p>Body</p>",
                consent_to_publish=False,
            )

    def test_submission_requires_a_body(self):
        with self.assertRaises(ValidationError):
            StorySubmissionCreate(title="No body", consent_to_publish=True)

    def test_submission_forbids_server_managed_fields(self):
        with self.assertRaises(ValidationError):
            StorySubmissionCreate(
                title="Sneaky",
                rich_text="<p>Body</p>",
                consent_to_publish=True,
                workflow_status="published",
            )

    def test_valid_submission_passes(self):
        data = StorySubmissionCreate(
            title="Valid",
            rich_text="<p>Body</p>",
            consent_to_publish=True,
        )
        self.assertEqual(data.story_type, "article")


class ContributorFieldRestrictionTests(unittest.TestCase):
    def test_editorial_fields_are_rejected(self):
        for field in ("is_featured", "homepage_priority", "source_type",
                      "contributor_user_id", "contributor_name_snapshot"):
            with self.assertRaises(HTTPException) as ctx:
                reject_non_contributor_fields({field: "x"})
            self.assertEqual(ctx.exception.status_code, 403)

    def test_contributor_fields_are_allowed(self):
        payload = {field: None for field in CONTRIBUTOR_EDITABLE_FIELDS}
        reject_non_contributor_fields(payload)  # must not raise


class StoryWorkflowTransitionTests(unittest.IsolatedAsyncioTestCase):
    async def _run(self, story, action, actor_id=None, **kwargs):
        return await ContentWorkflowService.transition(
            _FakeDb(), story, "stories", action, actor_id or uuid.uuid4(), **kwargs
        )

    async def test_submit_review_publish_pipeline(self):
        contributor = uuid.uuid4()
        reviewer = uuid.uuid4()
        story = _story("draft", contributor_id=contributor)

        await self._run(story, "submit", contributor)
        self.assertEqual(story.workflow_status, "submitted")
        self.assertEqual(story.submitted_by_id, contributor)
        self.assertIsNotNone(story.submitted_at)

        await self._run(story, "start_review", reviewer)
        self.assertEqual(story.workflow_status, "in_review")

        await self._run(story, "approve", reviewer)
        self.assertEqual(story.workflow_status, "approved")

        await self._run(story, "publish", reviewer)
        self.assertEqual(story.workflow_status, "published")
        self.assertTrue(story.is_published)
        self.assertTrue(story.is_public)
        self.assertIsNotNone(story.published_at)

    async def test_changes_requested_stores_comments_and_allows_resubmit(self):
        contributor = uuid.uuid4()
        story = _story("in_review", contributor_id=contributor)

        await self._run(story, "request_changes", comments="Tighten the intro")
        self.assertEqual(story.workflow_status, "changes_requested")
        self.assertEqual(story.revision_notes, "Tighten the intro")

        # Contributor may resubmit after changes were requested.
        await self._run(story, "submit", contributor)
        self.assertEqual(story.workflow_status, "submitted")

    async def test_rejected_story_can_be_resubmitted(self):
        story = _story("in_review")
        await self._run(story, "reject", comments="Off topic")
        self.assertEqual(story.workflow_status, "rejected")
        self.assertEqual(story.rejection_reason, "Off topic")
        await self._run(story, "submit", story.contributor_user_id)
        self.assertEqual(story.workflow_status, "submitted")

    async def test_story_without_body_cannot_be_published(self):
        story = _story("approved", rich_text=None, plain_text=None)
        with self.assertRaises(ValueError):
            await self._run(story, "publish")

    async def test_request_changes_logs_reviewer_comment_for_feedback_surface(self):
        db = _FakeDb()
        story = _story("in_review")
        await ContentWorkflowService.transition(
            db, story, "stories", "request_changes", uuid.uuid4(),
            comments="Add a photo credit",
        )
        logs = [item for item in db.added if getattr(item, "content_type", None) == "stories"]
        self.assertEqual(len(logs), 1)
        self.assertEqual(logs[0].action, "request_changes")
        self.assertEqual(logs[0].comments, "Add a photo credit")
        self.assertEqual(logs[0].content_id, story.id)


class StoryQueueSerializationTests(unittest.TestCase):
    def test_stories_are_a_supported_queue_content_type(self):
        self.assertIn("stories", CONTENT_MODELS)

    def test_submitted_contributor_story_appears_with_attribution(self):
        contributor = uuid.uuid4()
        story = _story("submitted", contributor_id=contributor)
        story.submitted_by_id = contributor
        from datetime import datetime, timezone

        story.submitted_at = datetime.now(timezone.utc)
        items = build_content_workflow_queue_items(
            {"stories": [story]},
            {contributor: "Jane Contributor"},
        )
        self.assertEqual(len(items), 1)
        item = items[0]
        self.assertEqual(item["content_type"], "stories")
        self.assertEqual(item["status"], "submitted")
        self.assertEqual(item["owner_label"], "Jane Contributor")
        self.assertEqual(item["submitted_by_label"], "Jane Contributor")
        self.assertEqual(item["source_label"], "CoCMS")
        self.assertEqual(item["preview_path"], "/stories/a-contributor-story")
        self.assertEqual(
            item["workflow_action_path"],
            f"/api/v1/content-workflow/stories/{story.id}/{{action}}",
        )
        self.assertTrue(item["preview"]["rich_text"])


class StoryWorkflowAuthorizationTests(unittest.TestCase):
    def test_contributor_can_submit_their_own_story(self):
        contributor = uuid.uuid4()
        story = _story("draft", contributor_id=contributor)
        user = SimpleNamespace(id=contributor)
        authorize_content_workflow_action(
            user, story, "submit", {"stories.submit", "content.submit"}
        )  # must not raise

    def test_contributor_cannot_publish_their_own_story(self):
        contributor = uuid.uuid4()
        story = _story("approved", contributor_id=contributor)
        user = SimpleNamespace(id=contributor)
        with self.assertRaises(HTTPException) as ctx:
            authorize_content_workflow_action(
                user, story, "publish", {"stories.submit", "content.publish"}
            )
        self.assertEqual(ctx.exception.status_code, 403)

    def test_contributor_cannot_review_other_stories(self):
        story = _story("submitted")
        user = SimpleNamespace(id=uuid.uuid4())
        with self.assertRaises(HTTPException):
            authorize_content_workflow_action(
                user, story, "start_review", {"stories.submit", "content.submit"}
            )


if __name__ == "__main__":
    unittest.main()
