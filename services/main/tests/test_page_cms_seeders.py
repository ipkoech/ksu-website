from __future__ import annotations

import unittest
import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

from app.models import PageSection, PartnershipSpotlight
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

