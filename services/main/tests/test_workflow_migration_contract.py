from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_workflow_actor_foreign_key_migration_covers_declared_models():
    migration = ROOT / "migrations/versions/20260712_0020_add_workflow_actor_foreign_keys.py"
    text = migration.read_text(encoding="utf-8")

    expected_columns_by_table = {
        "news": (
            "submitted_by_id", "reviewed_by_id", "approved_by_id",
            "published_by_id", "unpublished_by_id",
        ),
        "blogs": (
            "submitted_by_id", "reviewed_by_id", "approved_by_id",
            "published_by_id", "unpublished_by_id",
        ),
        "announcements": (
            "submitted_by_id", "reviewed_by_id", "approved_by_id",
            "published_by_id", "unpublished_by_id",
        ),
        "events": (
            "submitted_by_id", "reviewed_by_id", "approved_by_id",
            "published_by_id", "unpublished_by_id",
        ),
        "sliders": (
            "submitted_by_id", "reviewed_by_id", "approved_by_id",
            "published_by_id", "unpublished_by_id",
        ),
        "page_sections": (
            "submitted_by_id", "reviewed_by_id", "unpublished_by_id",
        ),
        "partnership_spotlights": (
            "submitted_by_id", "reviewed_by_id", "approved_by_id",
            "published_by_id", "unpublished_by_id",
        ),
    }

    for table, expected_columns in expected_columns_by_table.items():
        assert f'"{table}"' in text
        table_block = text.split(f'"{table}": (', 1)[1].split("),", 1)[0]
        for column in expected_columns:
            assert f'"{column}"' in table_block, f"{table}.{column}"
    assert 'ondelete="SET NULL"' in text
    assert "edit_reset" in text
    assert 'down_revision = "20260712_0019"' in text
