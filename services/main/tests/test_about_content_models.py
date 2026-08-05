from __future__ import annotations

import sqlalchemy as sa

from app.models import FactEdition, FactGroup, FactItem, HistoryMilestone, UniversityInfo


def test_university_info_has_first_class_about_statements():
    columns = UniversityInfo.__table__.c
    assert "philosophy" in columns
    assert "strategic_plan_summary" in columns


def test_about_content_models_have_expected_tables_and_relationship_keys():
    assert HistoryMilestone.__tablename__ == "history_milestones"
    assert FactEdition.__tablename__ == "fact_editions"
    assert FactGroup.__table__.c.fact_edition_id.nullable is True
    assert FactItem.__table__.c.fact_group_id.nullable is False


def test_fact_kind_is_constrained_to_evergreen_or_annual():
    constraint = next(
        item
        for item in FactItem.__table__.constraints
        if isinstance(item, sa.CheckConstraint) and item.name == "ck_fact_items_kind"
    )
    assert "evergreen" in str(constraint.sqltext)
    assert "annual" in str(constraint.sqltext)


def test_only_one_published_current_fact_edition_is_allowed():
    index = next(
        item
        for item in FactEdition.__table__.indexes
        if item.name == "uq_fact_editions_one_published_current"
    )
    assert index.unique is True
    predicate = str(index.dialect_options["postgresql"]["where"]).lower()
    assert "is_current" in predicate
    assert "published" in predicate
    assert "deleted_at is null" in predicate

