from __future__ import annotations

import unittest
import uuid
from datetime import datetime, timedelta, timezone

from pydantic import ValidationError

from app.models import PAGE_SECTION_LAYOUT_VARIANTS
from app.schemas.page_cms import (
    PageSectionCreate,
    PageSectionUpdate,
    PageSectionWorkflowAction,
    PartnershipSpotlightCreate,
    PartnershipSpotlightRead,
    PartnershipSpotlightUpdate,
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

    def test_page_section_create_rejects_lifecycle_fields(self):
        with self.assertRaises(ValidationError):
            PageSectionCreate(
                page_key="homepage",
                scope_type="university",
                section_key="hero",
                layout_variant=PAGE_SECTION_LAYOUT_VARIANTS[0],
                status="published",
                approved_at=_utc_now(),
                published_at=_utc_now(),
                approved_by_id=uuid.uuid4(),
                published_by_id=uuid.uuid4(),
            )

    def test_page_section_update_rejects_lifecycle_fields(self):
        with self.assertRaises(ValidationError):
            PageSectionUpdate(
                status="approved",
                approved_at=_utc_now(),
                published_at=_utc_now(),
                approved_by_id=uuid.uuid4(),
                published_by_id=uuid.uuid4(),
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

    def test_partnership_spotlight_create_rejects_lifecycle_fields(self):
        with self.assertRaises(ValidationError):
            PartnershipSpotlightCreate(
                source_id=uuid.uuid4(),
                headline="Collaborative research in health systems",
                status="published",
                approved_at=_utc_now(),
                published_at=_utc_now(),
            )

    def test_partnership_spotlight_update_rejects_lifecycle_fields(self):
        with self.assertRaises(ValidationError):
            PartnershipSpotlightUpdate(
                status="approved",
                approved_at=_utc_now(),
                published_at=_utc_now(),
            )

    def test_partnership_spotlight_create_rejects_primary_cta_url_without_supported_prefix(self):
        with self.assertRaises(ValidationError):
            PartnershipSpotlightCreate(
                source_id=uuid.uuid4(),
                headline="Collaborative research in health systems",
                primary_cta_source="manual",
                primary_cta_url="partner.example.com/opportunities",
            )

    def test_partnership_spotlight_read_round_trips_orm_fields(self):
        now = _utc_now()
        spotlight = type(
            "PartnershipSpotlightLike",
            (),
            {
                "id": uuid.uuid4(),
                "created_at": now,
                "updated_at": now,
                "source_type": "research_partner",
                "source_id": uuid.uuid4(),
                "primary_cta_source": "partner_website",
                "primary_cta_label": "Visit partner",
                "primary_cta_url": "https://partner.example.com/opportunities",
                "headline": "Collaborative research in health systems",
                "summary": "A partnership focused on service delivery and training.",
                "pillars": [{"title": "Training"}],
                "opportunities": [{"title": "Scholarships"}],
                "is_enabled": True,
                "status": "published",
                "valid_from": now,
                "valid_to": now + timedelta(days=30),
                "approved_at": now,
                "published_at": now,
            },
        )()

        result = PartnershipSpotlightRead.model_validate(spotlight)

        self.assertEqual(result.primary_cta_source, "partner_website")
        self.assertEqual(result.primary_cta_label, "Visit partner")
        self.assertEqual(result.primary_cta_url, "https://partner.example.com/opportunities")

    def test_page_section_workflow_action_accepts_supported_actions(self):
        for action in ("submit", "approve", "request_changes", "publish", "archive", "unpublish"):
            result = PageSectionWorkflowAction(action=action)
            self.assertEqual(result.action, action)

    def test_page_section_workflow_action_rejects_unsupported_action(self):
        with self.assertRaises(ValidationError):
            PageSectionWorkflowAction(action="delete")
