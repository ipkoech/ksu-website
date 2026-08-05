from pathlib import Path
import importlib.util


ROOT = Path(__file__).resolve().parents[1]


def _load_migration(filename: str):
    path = ROOT / "migrations/versions" / filename
    spec = importlib.util.spec_from_file_location(filename.removesuffix(".py"), path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_slider_workflow_backfill_uses_slider_publication_columns():
    migration = _load_migration(
        "20260712_0017_attach_publishable_content_workflow_metadata.py"
    )

    predicate = migration._published_predicate("sliders")

    assert "is_public IS TRUE" in predicate
    assert "is_active IS TRUE" in predicate
    assert "start_datetime" in predicate
    assert "end_datetime" in predicate
    assert "is_published" not in predicate
    assert "valid_from" not in predicate


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
