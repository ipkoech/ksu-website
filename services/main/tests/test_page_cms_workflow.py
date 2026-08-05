from __future__ import annotations

import unittest
import uuid
from unittest.mock import patch

from app.models import PageSection, PartnershipSpotlight
from app.services import PageSectionService, PageSectionWorkflowService, PartnershipSpotlightWorkflowService
import app.services.page_cms as page_cms


async def _capture_query(_db, query, *, page=1, per_page=20):
    return query


class _ScalarListResult:
    def __init__(self, items):
        self._items = items

    def scalars(self):
        return self

    def all(self):
        return list(self._items)


class _ListDb:
    def __init__(self, items):
        self._items = items
        self.queries = []

    async def execute(self, query):
        self.queries.append(query)
        return _ScalarListResult(self._items)


class PageCmsWorkflowTests(unittest.IsolatedAsyncioTestCase):
    async def test_public_list_requires_published_enabled_and_active_sections(self):
        with patch.object(page_cms, "paginate_query", _capture_query):
            query = await PageSectionService.list_public(
                object(),
                page_key="homepage",
                scope_type="university",
            )

        query_text = str(query).lower()
        compiled = query.compile()

        self.assertIn("page_sections.page_key", query_text)
        self.assertIn("page_sections.scope_type", query_text)
        self.assertIn("page_sections.status =", query_text)
        self.assertIn("page_sections.workflow_status =", query_text)
        self.assertIn("page_sections.is_enabled is true", query_text)
        self.assertIn("page_sections.valid_from is null", query_text)
        self.assertIn("page_sections.valid_to is null", query_text)
        self.assertIn("page_sections.scheduled_publish_at is null", query_text)
        self.assertIn("page_sections.expires_at is null", query_text)
        self.assertIn("page_sections.deleted_at is null", query_text)
        self.assertIn("order by page_sections.display_order asc", query_text)
        self.assertIn("published", compiled.params.values())
        self.assertIn("homepage", compiled.params.values())
        self.assertIn("university", compiled.params.values())

    async def test_admin_list_orders_by_persisted_display_order(self):
        with patch.object(page_cms, "paginate_query", _capture_query):
            query = await PageSectionService.list_admin(
                object(),
                page_key="homepage",
                scope_type="university",
            )

        query_text = str(query).lower()

        self.assertIn("order by page_sections.display_order asc", query_text)

    async def test_admin_authorized_list_filters_before_paginating(self):
        hidden = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero-hidden",
            layout_variant="hero_admissions",
            status="draft",
        )
        hidden.id = uuid.uuid4()
        first_visible = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero-visible-1",
            layout_variant="hero_admissions",
            status="draft",
        )
        first_visible.id = uuid.uuid4()
        second_visible = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero-visible-2",
            layout_variant="hero_admissions",
            status="draft",
        )
        second_visible.id = uuid.uuid4()
        db = _ListDb([hidden, first_visible, second_visible])

        async def is_visible(section: PageSection) -> bool:
            return section.id in {first_visible.id, second_visible.id}

        result = await PageSectionService.list_admin_authorized(
            db,
            page_key="homepage",
            scope_type="university",
            page=2,
            per_page=1,
            is_visible=is_visible,
        )

        self.assertEqual([second_visible.id], [item.id for item in result.items])
        self.assertEqual({"page": 2, "per_page": 1, "total": 2, "pages": 2}, result.meta)

    async def test_workflow_rejects_draft_publish_transition(self):
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="draft",
        )

        with self.assertRaisesRegex(ValueError, "Invalid workflow transition"):
            await PageSectionWorkflowService.transition(section, "publish", uuid.uuid4())

    async def test_workflow_accepts_submit_approve_publish_sequence(self):
        user_id = uuid.uuid4()
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="draft",
        )

        await PageSectionWorkflowService.transition(section, "submit", user_id)
        self.assertEqual("in_review", section.status)
        self.assertEqual("in_review", section.workflow_status)
        self.assertEqual(user_id, section.submitted_by_id)
        self.assertIsNotNone(section.submitted_at)
        self.assertEqual(user_id, section.updated_by_id)

        await PageSectionWorkflowService.transition(section, "approve", user_id)
        self.assertEqual("approved", section.status)
        self.assertEqual("approved", section.workflow_status)
        self.assertEqual(user_id, section.reviewed_by_id)
        self.assertIsNotNone(section.reviewed_at)
        self.assertEqual(user_id, section.approved_by_id)
        self.assertIsNotNone(section.approved_at)

        await PageSectionWorkflowService.transition(section, "publish", user_id)
        self.assertEqual("published", section.status)
        self.assertEqual("published", section.workflow_status)
        self.assertEqual(user_id, section.published_by_id)
        self.assertIsNotNone(section.published_at)

    async def test_publish_requires_approved_section(self):
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="in_review",
        )

        with self.assertRaisesRegex(ValueError, "Invalid workflow transition"):
            await PageSectionWorkflowService.transition(section, "publish", uuid.uuid4())

    async def test_unpublish_returns_published_section_to_approved(self):
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="published",
        )

        await PageSectionWorkflowService.transition(section, "unpublish", uuid.uuid4())

        self.assertEqual("approved", section.status)
        self.assertEqual("approved", section.workflow_status)

    async def test_spotlight_workflow_accepts_submit_approve_publish_unpublish_sequence(self):
        user_id = uuid.uuid4()
        spotlight = PartnershipSpotlight(
            source_type="research_partner",
            source_id=uuid.uuid4(),
            primary_cta_source="manual",
            headline="Partner impact",
            status="draft",
        )

        await PartnershipSpotlightWorkflowService.transition(spotlight, "submit", user_id)
        self.assertEqual("in_review", spotlight.status)
        self.assertEqual("in_review", spotlight.workflow_status)
        self.assertEqual(user_id, spotlight.submitted_by_id)
        self.assertIsNotNone(spotlight.submitted_at)

        await PartnershipSpotlightWorkflowService.transition(spotlight, "approve", user_id)
        self.assertEqual("approved", spotlight.status)
        self.assertEqual("approved", spotlight.workflow_status)
        self.assertEqual(user_id, spotlight.reviewed_by_id)
        self.assertIsNotNone(spotlight.reviewed_at)
        self.assertEqual(user_id, spotlight.approved_by_id)
        self.assertIsNotNone(spotlight.approved_at)

        await PartnershipSpotlightWorkflowService.transition(spotlight, "publish", user_id)
        self.assertEqual("published", spotlight.status)
        self.assertEqual("published", spotlight.workflow_status)
        self.assertEqual(user_id, spotlight.published_by_id)
        self.assertIsNotNone(spotlight.published_at)

        await PartnershipSpotlightWorkflowService.transition(spotlight, "unpublish", user_id)
        self.assertEqual("approved", spotlight.status)
        self.assertEqual("approved", spotlight.workflow_status)

    async def test_spotlight_workflow_rejects_invalid_transition(self):
        spotlight = PartnershipSpotlight(
            source_type="research_partner",
            source_id=uuid.uuid4(),
            primary_cta_source="manual",
            headline="Partner impact",
            status="draft",
        )

        with self.assertRaisesRegex(ValueError, "Invalid workflow transition"):
            await PartnershipSpotlightWorkflowService.transition(spotlight, "publish", uuid.uuid4())

    async def test_request_changes_stores_revision_notes(self):
        """Verify that reason is stored as revision_notes when requesting changes."""
        user_id = uuid.uuid4()
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="draft",
        )

        # First submit to get to in_review
        await PageSectionWorkflowService.transition(section, "submit", user_id)
        self.assertEqual("in_review", section.status)

        # Request changes with a reason
        reason = "Please fix the hero image alignment and update the CTA text."
        await PageSectionWorkflowService.transition(section, "request_changes", user_id, note=reason)

        self.assertEqual("changes_requested", section.status)
        self.assertEqual("changes_requested", section.workflow_status)
        self.assertEqual(reason, section.revision_notes)
        self.assertEqual(user_id, section.reviewed_by_id)
        self.assertIsNotNone(section.reviewed_at)

    async def test_workflow_log_includes_reason_as_comments(self):
        """Verify that reason is persisted to ContentWorkflowLog.comments when db is provided."""
        from unittest.mock import MagicMock, AsyncMock

        user_id = uuid.uuid4()
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="draft",
        )
        section.id = uuid.uuid4()

        # Submit first
        await PageSectionWorkflowService.transition(section, "submit", user_id)

        # Mock db to capture the log entry
        mock_db = MagicMock()
        added_logs = []
        mock_db.add = lambda log: added_logs.append(log)

        reason = "Needs accessibility improvements."
        await PageSectionWorkflowService.transition(
            section, "request_changes", user_id, note=reason, db=mock_db
        )

        # Verify a log was added with the reason as comments
        self.assertEqual(1, len(added_logs))
        log = added_logs[0]
        self.assertEqual("page-sections", log.content_type)
        self.assertEqual(section.id, log.content_id)
        self.assertEqual("in_review", log.from_status)
        self.assertEqual("changes_requested", log.to_status)
        self.assertEqual("request_changes", log.action)
        self.assertEqual(user_id, log.actor_id)
        self.assertEqual(reason, log.comments)


if __name__ == "__main__":
    unittest.main()
