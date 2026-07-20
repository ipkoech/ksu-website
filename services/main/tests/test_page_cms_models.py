from __future__ import annotations

import uuid
from pathlib import Path

import sqlalchemy as sa

from app.models.media import MediaLink
from app.models.page_cms import (
    PAGE_SCOPE_TYPES,
    PAGE_SECTION_LAYOUT_VARIANTS,
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


def _index(table: sa.Table, name: str) -> sa.Index:
    for index in table.indexes:
        if index.name == name:
            return index
    raise AssertionError(f"Index {name} not found on {table.name}")


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


def test_page_sections_limit_layout_variants_to_the_approved_catalog():
    constraint = _check_constraint(PageSection.__table__, "ck_page_sections_layout_variant")
    sqltext = str(constraint.sqltext).lower()

    assert PAGE_SECTION_LAYOUT_VARIANTS == (
        "hero_admissions",
        "pulse_strip",
        "featured_partnership",
        "programme_finder",
        "featured_stories",
        "date_timeline",
        "pillar_grid",
        "media_mosaic",
        "leadership_activity",
        "research_cards",
        "news_grid",
        "events_list",
        "logo_carousel",
        "alumni_story",
        "facts_strip",
    )
    assert "layout_variant" in sqltext
    assert "hero_admissions" in sqltext
    assert "facts_strip" in sqltext


def test_page_sections_use_partial_unique_indexes_for_scoped_and_unscoped_records():
    with_scope_id = _index(PageSection.__table__, "uq_page_sections_scope_section_with_scope_id")
    without_scope_id = _index(PageSection.__table__, "uq_page_sections_scope_section_without_scope_id")

    with_scope_id_where = str(with_scope_id.dialect_options["postgresql"]["where"]).lower()
    without_scope_id_where = str(without_scope_id.dialect_options["postgresql"]["where"]).lower()

    assert with_scope_id.unique is True
    assert [column.name for column in with_scope_id.columns] == [
        "page_key",
        "scope_type",
        "scope_id",
        "section_key",
    ]
    assert "scope_id is not null" in with_scope_id_where

    assert without_scope_id.unique is True
    assert [column.name for column in without_scope_id.columns] == [
        "page_key",
        "scope_type",
        "section_key",
    ]
    assert "scope_id is null" in without_scope_id_where


def test_one_page_section_can_have_many_items():
    section = PageSection(
        page_key="homepage",
        scope_type="university",
        section_key="hero",
        layout_variant=PAGE_SECTION_LAYOUT_VARIANTS[0],
    )
    first_item = SectionItem(item_type=SECTION_ITEM_TYPES[0], title="Primary CTA", page_section=section)
    second_item = SectionItem(item_type=SECTION_ITEM_TYPES[1], title="Secondary CTA", page_section=section)

    assert first_item.page_section is section
    assert second_item.page_section is section
    assert section.items == [first_item, second_item]


def test_page_section_and_partnership_spotlight_have_enabled_flags():
    page_section_enabled = PageSection.__table__.c["is_enabled"]
    spotlight_enabled = PartnershipSpotlight.__table__.c["is_enabled"]

    assert page_section_enabled.nullable is False
    assert str(page_section_enabled.server_default.arg).lower() == "true"
    assert spotlight_enabled.nullable is False
    assert str(spotlight_enabled.server_default.arg).lower() == "true"


def test_page_sections_persist_display_order():
    display_order = PageSection.__table__.c["display_order"]
    section = PageSection(
        page_key="homepage",
        scope_type="university",
        section_key="hero",
        layout_variant=PAGE_SECTION_LAYOUT_VARIANTS[0],
        display_order=7,
    )

    assert display_order.nullable is False
    assert str(display_order.server_default.arg) == "100"
    assert section.display_order == 7


def test_page_sections_include_editor_copy_and_settings_columns():
    columns = PageSection.__table__.c

    assert "subtitle" in columns
    assert "description" in columns
    assert "settings" in columns
    assert columns["subtitle"].nullable is True
    assert columns["description"].nullable is True
    assert columns["settings"].nullable is True


def test_partnership_spotlights_reference_research_partner_sources():
    constraint = _check_constraint(PartnershipSpotlight.__table__, "ck_partnership_spotlights_source_type")
    spotlight = PartnershipSpotlight(
        source_type="research_partner",
        source_id=uuid.uuid4(),
        headline="Collaborative impact",
        primary_cta_source=PARTNERSHIP_CTA_SOURCES[0],
    )

    assert str(constraint.sqltext).lower().count("research_partner") >= 1
    assert spotlight.source_type == "research_partner"
    assert spotlight.source_id is not None


def test_partnership_spotlights_align_primary_cta_columns_and_allowed_sources():
    constraint = _check_constraint(PartnershipSpotlight.__table__, "ck_partnership_spotlights_primary_cta_source")
    sqltext = str(constraint.sqltext).lower()

    assert PARTNERSHIP_CTA_SOURCES == ("manual", "partner_website", "generated_detail_page")
    assert "primary_cta_source" in PartnershipSpotlight.__table__.c
    assert "primary_cta_label" in PartnershipSpotlight.__table__.c
    assert "primary_cta_url" in PartnershipSpotlight.__table__.c
    assert "cta_source" not in PartnershipSpotlight.__table__.c
    assert "cta_label" not in PartnershipSpotlight.__table__.c
    assert "cta_url" not in PartnershipSpotlight.__table__.c
    assert "manual" in sqltext
    assert "partner_website" in sqltext
    assert "generated_detail_page" in sqltext


def test_followup_migration_adds_partial_unique_indexes_and_enabled_columns():
    migration_path = (
        Path(__file__).resolve().parents[1]
        / "migrations"
        / "versions"
        / "20260710_0011_fix_page_cms_uniqueness_and_enabled_flags.py"
    )
    migration_text = migration_path.read_text(encoding="utf-8").lower()

    assert "op.add_column(" in migration_text
    assert '"page_sections"' in migration_text
    assert '"partnership_spotlights"' in migration_text
    assert '"is_enabled"' in migration_text
    assert 'uq_page_sections_scope_section_with_scope_id' in migration_text
    assert 'uq_page_sections_scope_section_without_scope_id' in migration_text
    assert 'postgresql_where=sa.text("scope_id is not null")' in migration_text
    assert 'postgresql_where=sa.text("scope_id is null")' in migration_text


def test_followup_migration_adds_layout_variant_constraint():
    migration_path = (
        Path(__file__).resolve().parents[1]
        / "migrations"
        / "versions"
        / "20260710_0012_constrain_page_section_layout_variants.py"
    )
    migration_text = migration_path.read_text(encoding="utf-8").lower()

    assert 'update page_sections' in migration_text
    assert "set layout_variant = 'hero_admissions'" in migration_text
    assert "layout_variant not in" in migration_text
    assert 'op.alter_column("page_sections", "layout_variant"' in migration_text
    assert 'server_default="hero_admissions"' in migration_text
    assert 'op.create_check_constraint(' in migration_text
    assert 'ck_page_sections_layout_variant' in migration_text


def test_followup_migration_aligns_partnership_spotlight_primary_cta_fields():
    migration_path = (
        Path(__file__).resolve().parents[1]
        / "migrations"
        / "versions"
        / "20260711_0013_align_partnership_spotlight_primary_cta.py"
    )
    migration_text = migration_path.read_text(encoding="utf-8").lower()

    assert 'new_column_name="primary_cta_source"' in migration_text
    assert 'new_column_name="primary_cta_label"' in migration_text
    assert 'new_column_name="primary_cta_url"' in migration_text
    assert "when primary_cta_source = 'custom' then 'manual'" in migration_text
    assert "when primary_cta_source = 'research_partner' then 'partner_website'" in migration_text
    assert 'ck_partnership_spotlights_primary_cta_source' in migration_text
    assert "primary_cta_source in ('manual', 'partner_website', 'generated_detail_page')" in migration_text


def test_followup_migration_persists_page_section_display_order():
    migration_path = (
        Path(__file__).resolve().parents[1]
        / "migrations"
        / "versions"
        / "20260711_0014_persist_page_section_display_order.py"
    )
    migration_text = migration_path.read_text(encoding="utf-8").lower()

    assert 'op.add_column("page_sections"' in migration_text
    assert '"display_order"' in migration_text
    assert 'server_default=sa.text("100")' in migration_text
    assert "update page_sections" in migration_text
    assert "from (" in migration_text
    assert "section_items" in migration_text
    assert "min(display_order)" in migration_text
    assert 'op.create_index("ix_page_sections_scope_page_order"' in migration_text


def test_followup_migration_adds_page_section_editor_fields():
    migration_path = (
        Path(__file__).resolve().parents[1]
        / "migrations"
        / "versions"
        / "20260711_0015_add_page_section_editor_fields.py"
    )
    migration_text = migration_path.read_text(encoding="utf-8").lower()

    assert 'op.add_column("page_sections"' in migration_text
    assert '"subtitle"' in migration_text
    assert '"description"' in migration_text
    assert '"settings"' in migration_text


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
