import pytest

from scripts.backfill_school_portal_ownership import build_backfill_steps


def test_backfill_covers_all_release_ownership_targets():
    steps = build_backfill_steps()
    names = {step.name for step in steps}

    assert {
        "school_content_ownership",
        "school_document_workflow",
        "publication_school_ids",
        "dean_school_admin_roles",
    } <= names
    assert all("school_id" in step.sql or "scope_id" in step.sql for step in steps)


def test_backfill_steps_are_idempotent_and_do_not_overwrite_existing_ownership():
    sql = "\n".join(step.sql for step in build_backfill_steps()).lower()

    assert "owner_scope_id is null" in sql
    assert "school_id is null" in sql
    assert "on conflict" in sql


def test_backfill_rejects_unsafe_schema_identifiers():
    with pytest.raises(ValueError, match="schema"):
        build_backfill_steps('main"; DROP SCHEMA main; --')
