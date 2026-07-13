from __future__ import annotations

import uuid

import sqlalchemy as sa

from app.models.page_cms import SECTION_ITEM_SOURCE_TYPES, PageSection, SectionItem


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


def test_section_items_persist_typed_source_references():
    columns = SectionItem.__table__.c
    source_constraint = _check_constraint(SectionItem.__table__, "ck_section_items_source_reference")
    content_constraint = _check_constraint(SectionItem.__table__, "ck_section_items_reference_content_empty")
    item_type_constraint = _check_constraint(SectionItem.__table__, "ck_section_items_item_type")
    source_index = _index(SectionItem.__table__, "ix_section_items_source")
    source_id = uuid.uuid4()
    item = SectionItem(
        item_type="reference",
        source_type="news",
        source_id=source_id,
        editorial_overrides={"title": "Editorial headline"},
    )

    assert {"source_type", "source_id", "editorial_overrides", "revision"} <= set(columns.keys())
    assert columns["source_type"].nullable is True
    assert columns["source_id"].nullable is True
    assert columns["editorial_overrides"].nullable is True
    assert columns["revision"].nullable is False
    assert str(columns["revision"].server_default.arg) == "1"
    assert "source_type" in str(source_constraint.sqltext).lower()
    assert "source_id" in str(source_constraint.sqltext).lower()
    content_sql = str(content_constraint.sqltext).lower()
    assert "item_type" in content_sql
    for field in (
        "title",
        "subtitle",
        "body_text",
        "content",
        "cta_label",
        "cta_url",
        "cta_description",
        "media_caption",
        "media_alt_text",
        "video_provider",
        "video_url",
        "video_duration_seconds",
    ):
        assert field in content_sql
    assert "reference" in str(item_type_constraint.sqltext).lower()
    assert [column.name for column in source_index.columns] == ["source_type", "source_id"]
    assert item.source_type == "news"
    assert item.source_id == source_id
    assert item.editorial_overrides == {"title": "Editorial headline"}


def test_page_sections_persist_revision_numbers():
    revision = PageSection.__table__.c["revision"]

    assert revision.nullable is False
    assert str(revision.server_default.arg) == "1"


def test_section_item_source_types_match_the_domain_catalog():
    source_type_constraint = _check_constraint(SectionItem.__table__, "ck_section_items_source_type")
    source_type_sql = str(source_type_constraint.sqltext).lower()

    assert SECTION_ITEM_SOURCE_TYPES == (
        "intake",
        "programme",
        "academic_calendar",
        "person",
        "staff_assignment",
        "research_project",
        "publication",
        "news",
        "event",
        "research_partner",
        "alumni",
        "testimonial",
        "public_stat",
        "club_activity",
    )
    assert all(source_type in source_type_sql for source_type in SECTION_ITEM_SOURCE_TYPES)
