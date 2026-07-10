from __future__ import annotations

import uuid

import sqlalchemy as sa

from app.models.media import MediaLink
from app.models.page_cms import (
    PAGE_SCOPE_TYPES,
    PAGE_SECTION_STATUSES,
    PARTNERSHIP_CTA_SOURCES,
    SECTION_ITEM_TYPES,
    PageSection,
    PartnershipSpotlight,
    SectionItem,
)


def _check_constraint(table: sa.Table, name: str) -> sa.CheckConstraint:
    for constraint in table.constraints:
        if isinstance(constraint, sa.CheckConstraint) and constraint.name == name:
            return constraint
    raise AssertionError(f"Check constraint {name} not found on {table.name}")


def test_school_scoped_sections_require_scope_id():
    constraint = _check_constraint(PageSection.__table__, "ck_page_sections_school_scope_requires_id")
    sqltext = str(constraint.sqltext).lower()

    assert PAGE_SCOPE_TYPES == ("university", "school", "research", "library")
    assert PAGE_SECTION_STATUSES == (
        "draft",
        "in_review",
        "changes_requested",
        "approved",
        "published",
        "archived",
    )
    assert "scope_type" in sqltext
    assert "school" in sqltext
    assert "scope_id" in sqltext


def test_one_page_section_can_have_many_items():
    section = PageSection(
        page_key="homepage",
        scope_type="university",
        section_key="hero",
        layout_variant="feature_grid",
    )
    first_item = SectionItem(item_type=SECTION_ITEM_TYPES[0], title="Primary CTA", page_section=section)
    second_item = SectionItem(item_type=SECTION_ITEM_TYPES[1], title="Secondary CTA", page_section=section)

    assert first_item.page_section is section
    assert second_item.page_section is section
    assert section.items == [first_item, second_item]


def test_partnership_spotlights_reference_research_partner_sources():
    constraint = _check_constraint(PartnershipSpotlight.__table__, "ck_partnership_spotlights_source_type")
    spotlight = PartnershipSpotlight(
        source_type="research_partner",
        source_id=uuid.uuid4(),
        headline="Collaborative impact",
        cta_source=PARTNERSHIP_CTA_SOURCES[0],
    )

    assert str(constraint.sqltext).lower().count("research_partner") >= 1
    assert spotlight.source_type == "research_partner"
    assert spotlight.source_id is not None


def test_page_cms_media_attaches_through_existing_media_links():
    section_link = MediaLink(media_id=uuid.uuid4(), entity_type="page_section", entity_id=uuid.uuid4(), role="cover")
    item_link = MediaLink(media_id=uuid.uuid4(), entity_type="section_item", entity_id=uuid.uuid4(), role="gallery")
    spotlight_link = MediaLink(
        media_id=uuid.uuid4(),
        entity_type="partnership_spotlight",
        entity_id=uuid.uuid4(),
        role="logo",
    )

    assert [section_link.entity_type, item_link.entity_type, spotlight_link.entity_type] == [
        "page_section",
        "section_item",
        "partnership_spotlight",
    ]
