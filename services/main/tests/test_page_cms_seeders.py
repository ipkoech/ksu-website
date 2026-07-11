from __future__ import annotations

import unittest
import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

from app.models import PageSection, PartnershipSpotlight, SectionItem
from app.seeders._shared import SeedContext
from app.seeders.seed_page_cms import seed_page_cms


class _ScalarResult:
    def __init__(self, rows):
        self._rows = list(rows)

    def scalar_one_or_none(self):
        if len(self._rows) > 1:
            raise AssertionError("expected at most one row")
        return self._rows[0] if self._rows else None

    def scalars(self):
        return self

    def all(self):
        return list(self._rows)


class _MemoryDb:
    def __init__(self):
        self.sections: list[PageSection] = []
        self.spotlights: list[PartnershipSpotlight] = []
        self.added: list[object] = []
        self.flush_count = 0

    def add(self, instance):
        self.added.append(instance)
        if isinstance(instance, PageSection):
            self.sections.append(instance)
        elif isinstance(instance, PartnershipSpotlight):
            self.spotlights.append(instance)

    async def flush(self):
        self.flush_count += 1

    async def execute(self, statement):
        entity = statement.column_descriptions[0].get("entity")
        if entity is PageSection:
            return _ScalarResult(self.sections)
        if entity is PartnershipSpotlight:
            return _ScalarResult(self.spotlights)
        return _ScalarResult([])


def _section_by_key(db: _MemoryDb, section_key: str) -> PageSection:
    return next(section for section in db.sections if section.section_key == section_key)


class PageCmsSeederTests(unittest.IsolatedAsyncioTestCase):
    async def test_seed_creates_initial_homepage_sections_and_heri_spotlight(self):
        db = _MemoryDb()
        partner_id = uuid.uuid4()

        with patch(
            "app.seeders.seed_page_cms.ResearchPartnersProxyService.list_partners",
            AsyncMock(
                return_value={
                    "status": "success",
                    "data": [{"id": str(partner_id), "name": "Heri Africa", "slug": "heri-africa"}],
                    "meta": {"pages": 1},
                }
            ),
        ):
            await seed_page_cms(db, SeedContext())

        sections_by_key = {section.section_key: section for section in db.sections}
        self.assertEqual(
            {
                "hero-admissions",
                "pulse",
                "featured-partnership",
                "programme-finder",
                "facts",
            },
            set(sections_by_key),
        )

        hero = sections_by_key["hero-admissions"]
        self.assertEqual("homepage", hero.page_key)
        self.assertEqual("university", hero.scope_type)
        self.assertIsNone(hero.scope_id)
        self.assertEqual("hero_admissions", hero.layout_variant)
        self.assertEqual("published", hero.status)
        self.assertTrue(hero.is_enabled)
        self.assertEqual("page-cms-homepage-v1", hero.settings["seed"]["owner"])
        self.assertGreaterEqual(len(hero.items), 2)

        self.assertEqual("pulse_strip", sections_by_key["pulse"].layout_variant)
        self.assertEqual("featured_partnership", sections_by_key["featured-partnership"].layout_variant)
        self.assertEqual("programme_finder", sections_by_key["programme-finder"].layout_variant)
        self.assertEqual("facts_strip", sections_by_key["facts"].layout_variant)
        self.assertTrue(sections_by_key["programme-finder"].settings["filters"])

        self.assertEqual(1, len(db.spotlights))
        spotlight = db.spotlights[0]
        self.assertEqual(partner_id, spotlight.source_id)
        self.assertEqual("published", spotlight.status)
        self.assertTrue(spotlight.is_enabled)
        self.assertIn("Heri Africa", spotlight.headline)

    async def test_seed_creates_inactive_draft_heri_spotlight_when_partner_is_pending(self):
        db = _MemoryDb()

        with patch(
            "app.seeders.seed_page_cms.ResearchPartnersProxyService.list_partners",
            AsyncMock(return_value={"status": "success", "data": [], "meta": {"pages": 1}}),
        ):
            await seed_page_cms(db, SeedContext())

        self.assertEqual(1, len(db.spotlights))
        spotlight = db.spotlights[0]
        self.assertEqual("draft", spotlight.status)
        self.assertFalse(spotlight.is_enabled)
        self.assertIn("pending", spotlight.summary.lower())
        self.assertEqual(uuid.UUID("8d724ec7-3b5b-54f8-b3f3-8770f627dd6a"), spotlight.source_id)

    async def test_seed_is_idempotent_for_sections_and_spotlights(self):
        db = _MemoryDb()

        with patch(
            "app.seeders.seed_page_cms.ResearchPartnersProxyService.list_partners",
            AsyncMock(return_value={"status": "success", "data": [], "meta": {"pages": 1}}),
        ):
            await seed_page_cms(db, SeedContext())
            await seed_page_cms(db, SeedContext())

        self.assertEqual(5, len(db.sections))
        self.assertEqual(1, len(db.spotlights))
        self.assertEqual(
            sorted(section.section_key for section in db.sections),
            sorted({section.section_key for section in db.sections}),
        )

    async def test_seed_updates_seed_owned_drafts_but_not_manually_edited_published_sections(self):
        db = _MemoryDb()
        seed_owned_draft = PageSection(
            page_key="homepage",
            scope_type="university",
            scope_id=None,
            section_key="pulse",
            title="Old seed title",
            settings={"seed": {"owner": "page-cms-homepage-v1"}},
            layout_variant="pulse_strip",
            status="draft",
            is_enabled=True,
        )
        manual_published = PageSection(
            page_key="homepage",
            scope_type="university",
            scope_id=None,
            section_key="facts",
            title="Editor facts",
            settings={"edited_by": "admin"},
            layout_variant="facts_strip",
            status="published",
            published_at=datetime.now(timezone.utc),
            is_enabled=True,
        )
        db.sections.extend([seed_owned_draft, manual_published])

        with patch(
            "app.seeders.seed_page_cms.ResearchPartnersProxyService.list_partners",
            AsyncMock(return_value={"status": "success", "data": [], "meta": {"pages": 1}}),
        ):
            await seed_page_cms(db, SeedContext())

        self.assertNotEqual("Old seed title", seed_owned_draft.title)
        self.assertEqual("published", seed_owned_draft.status)
        self.assertEqual("Editor facts", manual_published.title)
        self.assertEqual({"edited_by": "admin"}, manual_published.settings)
        self.assertEqual(5, len(db.sections))
        self.assertIs(_section_by_key(db, "facts"), manual_published)

    async def test_seed_does_not_overwrite_published_seeded_section_after_manual_edits(self):
        db = _MemoryDb()
        published_seeded_section = PageSection(
            page_key="homepage",
            scope_type="university",
            scope_id=None,
            section_key="hero-admissions",
            title="Editor hero title",
            settings={"seed": {"owner": "page-cms-homepage-v1"}, "edited": True},
            layout_variant="hero_admissions",
            status="published",
            published_at=datetime.now(timezone.utc),
            is_enabled=True,
        )
        manual_item = SectionItem(
            item_type="text",
            title="Editor item",
            body_text="Manual homepage copy",
            display_order=1,
            is_enabled=True,
        )
        published_seeded_section.items = [manual_item]
        db.sections.append(published_seeded_section)

        with patch(
            "app.seeders.seed_page_cms.ResearchPartnersProxyService.list_partners",
            AsyncMock(return_value={"status": "success", "data": [], "meta": {"pages": 1}}),
        ):
            await seed_page_cms(db, SeedContext())

        self.assertEqual("Editor hero title", published_seeded_section.title)
        self.assertEqual({"seed": {"owner": "page-cms-homepage-v1"}, "edited": True}, published_seeded_section.settings)
        self.assertEqual([manual_item], published_seeded_section.items)
        self.assertEqual("Editor item", published_seeded_section.items[0].title)

    async def test_seed_does_not_overwrite_editor_owned_unpublished_heri_spotlight(self):
        db = _MemoryDb()
        partner_id = uuid.uuid4()
        editor_spotlight = PartnershipSpotlight(
            source_type="research_partner",
            source_id=partner_id,
            headline="Editor Heri Africa review draft",
            summary="Editor-owned partnership copy",
            primary_cta_source="manual",
            primary_cta_label="Editor CTA",
            primary_cta_url="/editor-heri-africa",
            status="in_review",
            is_enabled=True,
        )
        db.spotlights.append(editor_spotlight)

        with patch(
            "app.seeders.seed_page_cms.ResearchPartnersProxyService.list_partners",
            AsyncMock(
                return_value={
                    "status": "success",
                    "data": [{"id": str(partner_id), "name": "Heri Africa", "slug": "heri-africa"}],
                    "meta": {"pages": 1},
                }
            ),
        ):
            await seed_page_cms(db, SeedContext())

        self.assertEqual("Editor Heri Africa review draft", editor_spotlight.headline)
        self.assertEqual("Editor-owned partnership copy", editor_spotlight.summary)
        self.assertEqual("manual", editor_spotlight.primary_cta_source)
        self.assertEqual("in_review", editor_spotlight.status)
        self.assertEqual(1, len(db.spotlights))

    async def test_seed_does_not_overwrite_manually_edited_pending_heri_placeholder(self):
        db = _MemoryDb()
        edited_placeholder = PartnershipSpotlight(
            source_type="research_partner",
            source_id=uuid.UUID("8d724ec7-3b5b-54f8-b3f3-8770f627dd6a"),
            headline="Heri Africa partnership spotlight pending",
            summary="Editor revised the pending partnership summary.",
            primary_cta_source="manual",
            primary_cta_label="Editor review link",
            primary_cta_url="/editor-review",
            pillars=[{"label": "Editor pillar", "description": "Manual pillar copy"}],
            opportunities=[{"label": "Editor opportunity", "href": "/editor-opportunity"}],
            status="draft",
            is_enabled=False,
        )
        db.spotlights.append(edited_placeholder)

        with patch(
            "app.seeders.seed_page_cms.ResearchPartnersProxyService.list_partners",
            AsyncMock(return_value={"status": "success", "data": [], "meta": {"pages": 1}}),
        ):
            await seed_page_cms(db, SeedContext())

        self.assertEqual("Editor revised the pending partnership summary.", edited_placeholder.summary)
        self.assertEqual("Editor review link", edited_placeholder.primary_cta_label)
        self.assertEqual("/editor-review", edited_placeholder.primary_cta_url)
        self.assertEqual([{"label": "Editor pillar", "description": "Manual pillar copy"}], edited_placeholder.pillars)
        self.assertEqual([{"label": "Editor opportunity", "href": "/editor-opportunity"}], edited_placeholder.opportunities)
        self.assertEqual(1, len(db.spotlights))
