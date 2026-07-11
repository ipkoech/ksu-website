from __future__ import annotations

import unittest
import uuid
from unittest.mock import patch

from app.models import PageSection
from app.services import PageSectionService, PageSectionWorkflowService
import app.services.page_cms as page_cms


async def _capture_query(_db, query, *, page=1, per_page=20):
    return query


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
        self.assertIn("page_sections.is_enabled is true", query_text)
        self.assertIn("page_sections.valid_from is null", query_text)
        self.assertIn("page_sections.valid_to is null", query_text)
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
        self.assertEqual(user_id, section.updated_by_id)

        await PageSectionWorkflowService.transition(section, "approve", user_id)
        self.assertEqual("approved", section.status)
        self.assertEqual(user_id, section.approved_by_id)
        self.assertIsNotNone(section.approved_at)

        await PageSectionWorkflowService.transition(section, "publish", user_id)
        self.assertEqual("published", section.status)
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


if __name__ == "__main__":
    unittest.main()
