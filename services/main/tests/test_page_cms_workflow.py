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

        await PartnershipSpotlightWorkflowService.transition(spotlight, "approve", user_id)
        self.assertEqual("approved", spotlight.status)
        self.assertEqual(user_id, spotlight.approved_by_id)
        self.assertIsNotNone(spotlight.approved_at)

        await PartnershipSpotlightWorkflowService.transition(spotlight, "publish", user_id)
        self.assertEqual("published", spotlight.status)
        self.assertEqual(user_id, spotlight.published_by_id)
        self.assertIsNotNone(spotlight.published_at)

        await PartnershipSpotlightWorkflowService.transition(spotlight, "unpublish", user_id)
        self.assertEqual("approved", spotlight.status)

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


if __name__ == "__main__":
    unittest.main()
