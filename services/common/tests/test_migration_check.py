from __future__ import annotations

from ksu_common.migration_check import (
    MigrationCheckError,
    MigrationFinding,
    require_single_head,
    select_migration_paths,
    validate_migration_file_set,
    validate_migration_source,
)


def test_upgrade_destructive_operations_require_explicit_approval() -> None:
    source = """
def upgrade():
    op.drop_table('obsolete')
    op.execute('TRUNCATE TABLE transient_data')


def downgrade():
    op.drop_column('obsolete', 'value')
"""

    findings = validate_migration_source(source, path="versions/001.py")

    assert findings == (
        MigrationFinding(
            path="versions/001.py",
            code="destructive_upgrade_operation",
            message="destructive operation in upgrade: op.drop_table",
        ),
        MigrationFinding(
            path="versions/001.py",
            code="destructive_upgrade_operation",
            message="destructive operation in upgrade: SQL TRUNCATE",
        ),
    )


def test_downgrade_destructive_operations_are_not_upgrade_findings() -> None:
    source = """
def upgrade():
    op.create_table('replacement')


def downgrade():
    op.drop_table('replacement')
"""

    assert validate_migration_source(source, path="versions/002.py") == ()


def test_select_migration_paths_uses_only_requested_source_and_migration_directory() -> None:
    paths = select_migration_paths(
        mode="committed",
        changed_paths=(
            "services/main/migrations/versions/001_changed.py",
        ),
        committed_paths=(
            "services/main/migrations/versions/002_committed.py",
            "services/main/migrations/env.py",
            "README.md",
            "services/main/migrations/versions/002_committed.py",
        ),
        tracked_paths=("services/main/migrations/versions/003_tracked.py",),
        migration_directory="services/main/migrations/versions",
    )

    assert paths == ("services/main/migrations/versions/002_committed.py",)


def test_require_single_head_rejects_zero_or_multiple_heads() -> None:
    assert require_single_head("abc123 (head)") == "abc123 (head)"

    for output in ("", "first (head)\nsecond (head)\n"):
        try:
            require_single_head(output)
        except MigrationCheckError as error:
            assert "exactly one migration head" in str(error)
        else:  # pragma: no cover - documents the failure expected above
            raise AssertionError("expected migration-head validation to fail")


def test_file_set_returns_head_and_destructive_errors_together() -> None:
    result = validate_migration_file_set(
        migration_sources={
            "versions/001_safe.py": "def upgrade():\n    op.create_table('safe')\n",
            "versions/002_destructive.py": "def upgrade():\n    op.drop_column('safe', 'old')\n",
        },
        alembic_heads="first\nsecond\n",
        destructive_approved=False,
    )

    assert result.ok is False
    assert result.findings == (
        MigrationFinding(
            path="versions/002_destructive.py",
            code="destructive_upgrade_operation",
            message="destructive operation in upgrade: op.drop_column",
        ),
    )
    assert result.errors == (
        "destructive migration changes require explicit approval",
        "expected exactly one migration head; received 2",
    )


def test_file_set_allows_reviewed_destructive_upgrade() -> None:
    result = validate_migration_file_set(
        migration_sources={
            "versions/003_reviewed.py": "def upgrade():\n    op.drop_table('old_data')\n",
        },
        alembic_heads="reviewed (head)",
        destructive_approved=True,
    )

    assert result.ok is True
    assert result.errors == ()
