from pathlib import Path


def test_about_content_migration_adds_models_and_backfills_philosophy():
    migration = (
        Path(__file__).resolve().parents[1]
        / "migrations"
        / "versions"
        / "20260714_0024_add_about_facts_content.py"
    ).read_text(encoding="utf-8").lower()

    assert 'revision = "20260714_0024"' in migration
    assert 'down_revision = "20260713_0023"' in migration
    assert '"philosophy"' in migration
    assert '"strategic_plan_summary"' in migration
    assert "strategic_priorities" in migration
    assert "philosophy" in migration
    for table in (
        "about_page_content",
        "history_milestones",
        "fact_editions",
        "fact_groups",
        "fact_items",
    ):
        assert f'"{table}"' in migration

