from __future__ import annotations

import unittest
import uuid
from datetime import datetime, timedelta, timezone

from pydantic import ValidationError

from app.models import PAGE_SECTION_LAYOUT_VARIANTS
from app.schemas.page_cms import (
    PageSectionCreate,
    PartnershipSpotlightCreate,
    SectionItemCreate,
)


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


class PageCmsSchemaTests(unittest.TestCase):
    def test_page_section_create_requires_scope_id_for_school_scope(self):
        with self.assertRaises(ValidationError):
            PageSectionCreate(
                page_key="homepage",
                scope_type="school",
                section_key="hero",
                layout_variant=PAGE_SECTION_LAYOUT_VARIANTS[0],
            )

    def test_page_section_create_rejects_unknown_layout_variant(self):
        with self.assertRaises(ValidationError):
            PageSectionCreate(
                page_key="homepage",
                scope_type="university",
                section_key="hero",
                layout_variant="unknown_variant",
            )

    def test_page_section_create_rejects_invalid_validity_window(self):
        valid_from = _utc_now()
        valid_to = valid_from - timedelta(hours=1)

        with self.assertRaises(ValidationError):
            PageSectionCreate(
                page_key="homepage",
                scope_type="university",
                section_key="hero",
                layout_variant=PAGE_SECTION_LAYOUT_VARIANTS[0],
                valid_from=valid_from,
                valid_to=valid_to,
            )

    def test_section_item_create_rejects_external_cta_urls_without_http_scheme(self):
        with self.assertRaises(ValidationError):
            SectionItemCreate(
                item_type="cta",
                title="Apply now",
                cta_label="Visit partner",
                cta_url="www.example.com/apply",
            )

    def test_section_item_create_rejects_internal_links_without_leading_slash(self):
        with self.assertRaises(ValidationError):
            SectionItemCreate(
                item_type="cta",
                title="Apply now",
                cta_label="View programme",
                cta_url="programmes/computer-science",
            )

    def test_partnership_spotlight_create_accepts_supported_primary_cta_sources(self):
        payload = {
            "source_id": uuid.uuid4(),
            "headline": "Collaborative research in health systems",
        }

        for source in ("manual", "partner_website", "generated_detail_page"):
            spotlight = PartnershipSpotlightCreate.model_validate(
                {
                    **payload,
                    "primary_cta_source": source,
                }
            )

            self.assertEqual(spotlight.primary_cta_source, source)

    def test_partnership_spotlight_create_rejects_primary_cta_url_without_supported_prefix(self):
        with self.assertRaises(ValidationError):
            PartnershipSpotlightCreate(
                source_id=uuid.uuid4(),
                headline="Collaborative research in health systems",
                primary_cta_source="manual",
                primary_cta_url="partner.example.com/opportunities",
            )
