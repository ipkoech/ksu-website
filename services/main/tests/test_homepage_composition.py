from __future__ import annotations

import unittest
import uuid
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch

from app.models import Media, MediaLink, PageSection, PartnershipSpotlight, SectionItem
from app.api.v1 import public_media
from app.services import BlogService, HomepageCompositionService, group_media_links
import app.services.content as content_service
from app.services.page_cms import _get_research_partner_payload, _serialize_section


class _ScalarResult:
    def __init__(self, rows):
        self._rows = list(rows)

    def scalars(self):
        return self

    def all(self):
        return list(self._rows)


class _QueueDb:
    def __init__(self, *result_sets):
        self._result_sets = [list(result_set) for result_set in result_sets]
        self.statements = []

    async def execute(self, statement):
        self.statements.append(statement)
        rows = self._result_sets.pop(0) if self._result_sets else []
        return _ScalarResult(rows)


async def _capture_query(_db, query, *, page=1, per_page=20):
    return query


def _make_media(filename: str, *, media_type: str = "image") -> Media:
    return Media(
        filename=filename,
        original_filename=filename,
        mime_type="video/mp4" if media_type == "video" else "image/jpeg",
        file_size=1024,
        storage_path=f"uploads/{filename}",
        public_url=f"https://cdn.example.test/{filename}",
        media_type=media_type,
        is_public=True,
    )


def _make_link(entity_type: str, entity_id: uuid.UUID, role: str, filename: str, *, media_type: str = "image") -> MediaLink:
    media = _make_media(filename, media_type=media_type)
    return MediaLink(
        media=media,
        media_id=media.id,
        entity_type=entity_type,
        entity_id=entity_id,
        role=role,
        display_order=10,
        is_public=True,
    )


class HomepageCompositionTests(unittest.IsolatedAsyncioTestCase):
    async def test_public_section_payload_excludes_non_published_items(self):
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="campus-life",
            layout_variant="pillar_grid",
            status="published",
        )
        section.id = uuid.uuid4()
        now = datetime.now(timezone.utc)
        for item_status, title in (
            ("published", "Live tile"),
            ("draft", "Draft tile"),
            ("in_review", "Review tile"),
            ("archived", "Archived tile"),
            (None, "Legacy tile"),
        ):
            item = SectionItem(
                page_section_id=section.id,
                item_type="text",
                title=title,
                display_order=1,
                is_enabled=True,
            )
            item.status = item_status
            item.created_at = now
            section.items.append(item)

        payload = await _serialize_section(None, section, {})

        titles = sorted(item["title"] for item in payload["items"])
        self.assertEqual(["Legacy tile", "Live tile"], titles)
        self.assertTrue(all(item["status"] == "published" for item in payload["items"]))

    async def test_group_media_links_scopes_workflow_gate_to_club_media(self):
        db = _QueueDb([])

        await group_media_links(db, "club", uuid.uuid4())

        query_text = str(db.statements[0]).lower()
        self.assertIn("media_links.is_public is true", query_text)
        self.assertIn("media_links.owner_scope_type", query_text)
        self.assertIn("media_links.is_published is true", query_text)
        self.assertIn("media_links.workflow_status", query_text)
        self.assertIn("media_links.archived_at is null", query_text)
        self.assertIn("media_links.scheduled_publish_at is null", query_text)
        self.assertIn("media_links.expires_at is null", query_text)
        self.assertIn("media_links.owner_scope_type is null", query_text)

    async def test_public_media_links_endpoint_scopes_workflow_gate_to_club_media(self):
        db = _QueueDb([])

        await public_media.list_public_media_links.__wrapped__.__wrapped__(
            request=None,
            db=db,
            entity_type="club",
            entity_id=uuid.uuid4(),
            per_page=24,
        )

        query_text = str(db.statements[0]).lower()
        self.assertIn("media_links.is_public is true", query_text)
        self.assertIn("media_links.owner_scope_type", query_text)
        self.assertIn("media_links.is_published is true", query_text)
        self.assertIn("media_links.workflow_status", query_text)
        self.assertIn("media_links.owner_scope_type is null", query_text)

    async def test_public_blog_feed_keeps_published_club_stories_eligible_for_homepage(self):
        with (
            patch.object(content_service, "_archive_expired_content", AsyncMock()),
            patch.object(content_service, "paginate_query", _capture_query),
        ):
            query = await BlogService.list(
                object(),
                scope_type="club",
                scope_id=uuid.uuid4(),
            )

        query_text = str(query).lower()
        compiled = query.compile()
        self.assertIn("blogs.scope_type", query_text)
        self.assertIn("blogs.is_public is true", query_text)
        self.assertIn("blogs.is_published is true", query_text)
        self.assertIn("blogs.workflow_status", query_text)
        self.assertIn("blogs.archived_at is null", query_text)
        self.assertIn("published", compiled.params.values())

    async def test_group_media_links_groups_roles_for_composition(self):
        entity_id = uuid.uuid4()
        db = _QueueDb(
            [
                _make_link("page_section", entity_id, "heroImage", "hero.jpg"),
                _make_link("page_section", entity_id, "mobileImage", "hero-mobile.jpg"),
                _make_link("page_section", entity_id, "logo", "logo.png"),
                _make_link("page_section", entity_id, "gallery", "gallery.jpg"),
                _make_link("page_section", entity_id, "video", "story.mp4", media_type="video"),
                _make_link("page_section", entity_id, "background", "bg.jpg"),
                _make_link("page_section", entity_id, "poster", "poster.jpg"),
            ]
        )

        grouped = await group_media_links(db, "page_section", entity_id)

        self.assertEqual(
            {"heroImage", "mobileImage", "logos", "gallery", "video", "background", "poster"},
            set(grouped.keys()),
        )
        self.assertEqual("heroImage", grouped["heroImage"][0]["role"])
        self.assertEqual("mobileImage", grouped["mobileImage"][0]["role"])
        self.assertEqual("logo", grouped["logos"][0]["role"])
        self.assertEqual("gallery", grouped["gallery"][0]["role"])
        self.assertEqual("video", grouped["video"][0]["role"])
        self.assertEqual("background", grouped["background"][0]["role"])
        self.assertEqual("poster", grouped["poster"][0]["role"])

        query_text = str(db.statements[0]).lower()
        self.assertIn("media_links.entity_type", query_text)
        self.assertIn("media_links.entity_id", query_text)
        self.assertIn("media_links.display_order", query_text)

    async def test_compose_sorts_sections_and_resolves_partnership_ctas(self):
        spotlight_source_id = uuid.uuid4()
        first_section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="cta-strip",
            layout_variant="pulse_strip",
            status="published",
            display_order=20,
        )
        first_section.id = uuid.uuid4()
        first_section.items = [
            SectionItem(
                page_section=first_section,
                page_section_id=first_section.id,
                item_type="cta",
                title="Apply",
                display_order=20,
            )
        ]

        second_section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="published",
            display_order=5,
        )
        second_section.id = uuid.uuid4()
        second_section.items = [
            SectionItem(
                page_section=second_section,
                page_section_id=second_section.id,
                item_type="cta",
                title="Visit",
                display_order=5,
            )
        ]

        manual_spotlight = PartnershipSpotlight(
            source_type="research_partner",
            source_id=spotlight_source_id,
            headline="Manual CTA",
            primary_cta_source="manual",
            primary_cta_label="Explore",
            primary_cta_url="/partnerships/manual",
            status="published",
            is_enabled=True,
        )
        partner_website_spotlight = PartnershipSpotlight(
            source_type="research_partner",
            source_id=spotlight_source_id,
            headline="Partner CTA",
            primary_cta_source="partner_website",
            primary_cta_label="Visit partner",
            primary_cta_url=None,
            status="published",
            is_enabled=True,
        )
        detail_page_spotlight = PartnershipSpotlight(
            source_type="research_partner",
            source_id=spotlight_source_id,
            headline="Detail CTA",
            primary_cta_source="generated_detail_page",
            primary_cta_label="Read partnership",
            primary_cta_url=None,
            status="published",
            is_enabled=True,
        )

        with (
            patch(
                "app.services.page_cms.PageSectionService.list_public",
                AsyncMock(return_value=[first_section, second_section]),
            ),
            patch(
                "app.services.page_cms._list_active_partnership_spotlights",
                AsyncMock(return_value=[manual_spotlight, partner_website_spotlight, detail_page_spotlight]),
            ),
            patch(
                "app.services.page_cms.group_media_links_for_entities",
                AsyncMock(return_value={
                    first_section.id: {"heroImage": [], "mobileImage": [], "logos": [], "gallery": [], "video": [], "background": [], "poster": []},
                    second_section.id: {"heroImage": [], "mobileImage": [], "logos": [], "gallery": [], "video": [], "background": [], "poster": []},
                }),
            ),
            patch(
                "app.services.page_cms.group_media_links",
                AsyncMock(
                    side_effect=[
                        {"heroImage": [], "mobileImage": [], "logos": [], "gallery": [], "video": [], "background": [], "poster": []},
                        {"heroImage": [], "mobileImage": [], "logos": [], "gallery": [], "video": [], "background": [], "poster": []},
                        {"heroImage": [], "mobileImage": [], "logos": [], "gallery": [], "video": [], "background": [], "poster": []},
                        {"heroImage": [], "mobileImage": [], "logos": [], "gallery": [], "video": [], "background": [], "poster": []},
                        {"heroImage": [], "mobileImage": [], "logos": [], "gallery": [], "video": [], "background": [], "poster": []},
                    ]
                ),
            ),
            patch(
                "app.services.page_cms._get_research_partner_payload",
                AsyncMock(
                    return_value={
                        "id": str(spotlight_source_id),
                        "slug": "international-collaboration",
                        "website": "https://partner.example.test",
                        "name": "Partner University",
                    }
                ),
            ),
            patch(
                "app.services.page_cms.ResearchPartnersProxyService.find_partners_by_ids",
                AsyncMock(
                    return_value={
                        str(spotlight_source_id): {
                            "id": str(spotlight_source_id),
                            "slug": "international-collaboration",
                            "website": "https://partner.example.test",
                            "name": "Partner University",
                        }
                    }
                ),
            ),
        ):
            composition = await HomepageCompositionService.compose(object(), "homepage", "university")

        self.assertEqual(
            ["hero", "cta-strip"],
            [section["section_key"] for section in composition["sections"]],
        )
        self.assertEqual(
            {"label": "Explore", "href": "/partnerships/manual"},
            composition["partnership_spotlights"][0]["primary_cta"],
        )
        self.assertEqual(
            {"label": "Visit partner", "href": "https://partner.example.test"},
            composition["partnership_spotlights"][1]["primary_cta"],
        )
        self.assertEqual(
            {"label": "Read partnership", "href": "/partnerships/international-collaboration"},
            composition["partnership_spotlights"][2]["primary_cta"],
        )

    async def test_compose_loads_all_section_media_in_one_bulk_query(self):
        first_section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="first",
            layout_variant="hero_admissions",
            status="published",
            display_order=10,
        )
        first_section.id = uuid.uuid4()
        second_section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="second",
            layout_variant="hero_admissions",
            status="published",
            display_order=20,
        )
        second_section.id = uuid.uuid4()
        first_section.items = []
        second_section.items = []
        empty_media = {
            "heroImage": [], "mobileImage": [], "logos": [], "gallery": [],
            "video": [], "background": [], "poster": [],
        }
        bulk_media = AsyncMock(return_value={
            first_section.id: {**empty_media, "heroImage": [{"id": "first"}]},
            second_section.id: {**empty_media, "heroImage": [{"id": "second"}]},
        })
        db = object()

        with (
            patch("app.services.page_cms.PageSectionService.list_public", AsyncMock(return_value=[first_section, second_section])),
            patch("app.services.page_cms._list_active_partnership_spotlights", AsyncMock(return_value=[])),
            patch("app.services.page_cms.group_media_links_for_entities", bulk_media),
            patch("app.services.page_cms.group_media_links", AsyncMock()) as individual_media,
        ):
            composition = await HomepageCompositionService.compose(db, "homepage", "university")

        bulk_media.assert_awaited_once_with(db, "page_section", [first_section.id, second_section.id])
        individual_media.assert_not_awaited()
        self.assertEqual([{"id": "first"}], composition["sections"][0]["media"]["heroImage"])
        self.assertEqual([{"id": "second"}], composition["sections"][1]["media"]["heroImage"])

    async def test_compose_filters_disabled_and_deleted_section_items_and_preserves_item_order(self):
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="published",
            display_order=5,
        )
        section.id = uuid.uuid4()
        deleted_item = SectionItem(
            page_section=section,
            page_section_id=section.id,
            item_type="cta",
            title="Deleted",
            display_order=15,
            is_enabled=True,
        )
        deleted_item.deleted_at = datetime.now(timezone.utc)
        section.items = [
            SectionItem(
                page_section=section,
                page_section_id=section.id,
                item_type="cta",
                title="Second live",
                display_order=30,
                is_enabled=True,
            ),
            SectionItem(
                page_section=section,
                page_section_id=section.id,
                item_type="cta",
                title="Disabled",
                display_order=10,
                is_enabled=False,
            ),
            deleted_item,
            SectionItem(
                page_section=section,
                page_section_id=section.id,
                item_type="cta",
                title="First live",
                display_order=5,
                is_enabled=True,
            ),
        ]

        with (
            patch(
                "app.services.page_cms.PageSectionService.list_public",
                AsyncMock(return_value=[section]),
            ),
            patch(
                "app.services.page_cms._list_active_partnership_spotlights",
                AsyncMock(return_value=[]),
            ),
            patch(
                "app.services.page_cms.group_media_links_for_entities",
                AsyncMock(return_value={
                    section.id: {"heroImage": [], "mobileImage": [], "logos": [], "gallery": [], "video": [], "background": [], "poster": []},
                }),
            ),
            patch(
                "app.services.page_cms.group_media_links",
                AsyncMock(
                    return_value={
                        "heroImage": [],
                        "mobileImage": [],
                        "logos": [],
                        "gallery": [],
                        "video": [],
                        "background": [],
                        "poster": [],
                    }
                ),
            ),
        ):
            composition = await HomepageCompositionService.compose(object(), "homepage", "university")

        self.assertEqual(
            ["First live", "Second live"],
            [item["title"] for item in composition["sections"][0]["items"]],
        )
        self.assertEqual(
            [5, 30],
            [item["display_order"] for item in composition["sections"][0]["items"]],
        )

    async def test_compose_attaches_active_research_partners_to_partners_section(self):
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="partners",
            layout_variant="logo_carousel",
            status="published",
            display_order=95,
            settings={"source": "research_partners"},
        )
        section.id = uuid.uuid4()
        section.items = [
            SectionItem(
                page_section=section,
                page_section_id=section.id,
                item_type="card",
                title="Static fallback partner",
                display_order=10,
                is_enabled=True,
                content={"label": "Static fallback partner"},
            )
        ]
        partner_id = uuid.uuid4()

        with (
            patch(
                "app.services.page_cms.PageSectionService.list_public",
                AsyncMock(return_value=[section]),
            ),
            patch(
                "app.services.page_cms._list_active_partnership_spotlights",
                AsyncMock(return_value=[]),
            ),
            patch(
                "app.services.page_cms.group_media_links_for_entities",
                AsyncMock(return_value={
                    section.id: {"heroImage": [], "mobileImage": [], "logos": [], "gallery": [], "video": [], "background": [], "poster": []},
                }),
            ),
            patch(
                "app.services.page_cms.group_media_links",
                AsyncMock(
                    return_value={
                        "heroImage": [],
                        "mobileImage": [],
                        "logos": [],
                        "gallery": [],
                        "video": [],
                        "background": [],
                        "poster": [],
                    }
                ),
            ),
            patch(
                "app.services.page_cms.ResearchPartnersProxyService.list_partners",
                AsyncMock(
                    return_value={
                        "status": "success",
                        "data": [
                            {
                                "id": str(partner_id),
                                "name": "University of Minnesota",
                                "acronym": "UMN",
                                "slug": "university-of-minnesota",
                                "website": "https://twin-cities.umn.edu/",
                                "logo_url": "https://cdn.example.test/umn.svg",
                                "partner_type": "Academic",
                                "country": "United States",
                                "display_order": 20,
                            }
                        ],
                    }
                ),
            ),
        ):
            composition = await HomepageCompositionService.compose(object(), "homepage", "university")

        item = composition["sections"][0]["items"][0]

        self.assertEqual("research_partner", item["item_type"])
        self.assertEqual("University of Minnesota", item["title"])
        self.assertEqual("UMN", item["content"]["label"])
        self.assertEqual("https://cdn.example.test/umn.svg", item["content"]["logoUrl"])
        self.assertEqual("https://twin-cities.umn.edu/", item["cta_url"])
        self.assertEqual("university-of-minnesota", item["content_enriched"]["research_partner"]["slug"])

    async def test_compose_reuses_partner_section_payload_for_matching_spotlight(self):
        partner_id = uuid.uuid4()
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="partners",
            layout_variant="logo_carousel",
            status="published",
        )
        section.id = uuid.uuid4()
        section.items = []
        spotlight = PartnershipSpotlight(
            source_type="research_partner",
            source_id=partner_id,
            headline="Partner CTA",
            primary_cta_source="partner_website",
            primary_cta_label="Visit partner",
            status="published",
            is_enabled=True,
        )
        partner = {
            "id": str(partner_id),
            "name": "Partner University",
            "slug": "partner-university",
            "website": "https://partner.example.test",
        }

        with (
            patch("app.services.page_cms.PageSectionService.list_public", AsyncMock(return_value=[section])),
            patch("app.services.page_cms._list_active_partnership_spotlights", AsyncMock(return_value=[spotlight])),
            patch("app.services.page_cms.group_media_links_for_entities", AsyncMock(return_value={section.id: {"heroImage": [], "mobileImage": [], "logos": [], "gallery": [], "video": [], "background": [], "poster": []}})),
            patch("app.services.page_cms.group_media_links", AsyncMock(return_value={"heroImage": [], "mobileImage": [], "logos": [], "gallery": [], "video": [], "background": [], "poster": []})),
            patch("app.services.page_cms.ResearchPartnersProxyService.list_partners", AsyncMock(return_value={"status": "success", "data": [partner]})) as list_partners,
            patch("app.services.page_cms._get_research_partner_payload", AsyncMock()) as get_partner,
        ):
            composition = await HomepageCompositionService.compose(object(), "homepage", "university")

        list_partners.assert_awaited_once_with(per_page=24, status="active", is_active=True)
        get_partner.assert_not_awaited()
        self.assertEqual("https://partner.example.test", composition["partnership_spotlights"][0]["primary_cta"]["href"])

    async def test_partner_lookup_is_not_limited_to_the_first_page(self):
        target_id = uuid.uuid4()
        other_id = uuid.uuid4()

        with patch(
            "app.services.page_cms.ResearchPartnersProxyService.list_partners",
            AsyncMock(
                side_effect=[
                    {
                        "status": "success",
                        "data": [{"id": str(other_id), "slug": "other"}],
                        "meta": {"page": 1, "per_page": 100, "total": 2, "pages": 2},
                    },
                    {
                        "status": "success",
                        "data": [{"id": str(target_id), "slug": "target"}],
                        "meta": {"page": 2, "per_page": 100, "total": 2, "pages": 2},
                    },
                ]
            ),
        ) as list_partners:
            payload = await _get_research_partner_payload(target_id)

        self.assertIsNotNone(payload)
        self.assertEqual(str(target_id), payload["id"])
        self.assertEqual(2, list_partners.await_count)


if __name__ == "__main__":
    unittest.main()
