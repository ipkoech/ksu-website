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


def test_upgrade_dynamic_and_wrapped_sql_require_destructive_review() -> None:
    source = """
def upgrade():
    table_name = 'old_records'
    op.execute(f'DROP TABLE {table_name}')
    op.execute(sa.text('TRUNCATE TABLE transient_records'))
    op.execute(sa.text(f'DROP TABLE {table_name}'))


def downgrade():
    op.execute(f'DROP TABLE {table_name}')
    op.execute(sa.text('TRUNCATE TABLE transient_records'))
"""

    findings = validate_migration_source(source, path="versions/003.py")

    assert len(findings) == 3
    assert all(finding.code == "destructive_upgrade_operation" for finding in findings)
    assert all(finding.path == "versions/003.py" for finding in findings)


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


def test_select_migration_paths_ignores_traversal_paths() -> None:
    paths = select_migration_paths(
        mode="tracked",
        tracked_paths=(
            "services/main/migrations/versions/003_safe.py",
            "services/main/migrations/versions/../env.py",
            "services/main/migrations/versions/../../outside.py",
        ),
        migration_directory="services/main/migrations/versions",
    )

    assert paths == ("services/main/migrations/versions/003_safe.py",)


def test_require_single_head_rejects_non_head_and_diagnostic_output() -> None:
    assert require_single_head("abc123 (head)") == "abc123 (head)"

    for output in (
        "",
        "alembic failed to load config",
        "first (head)\nsecond (head)\n",
        "warning: stale config\nfirst (head)\n",
    ):
        try:
            require_single_head(output)
        except MigrationCheckError as error:
            assert "exactly one Alembic '(head)' marker" in str(error)
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
        MigrationFinding(
            path="<migration-set>",
            code="destructive_unapproved",
            message="destructive migration changes require explicit approval",
        ),
        MigrationFinding(
            path="<migration-set>",
            code="invalid_head_count",
            message="expected exactly one Alembic '(head)' marker with no diagnostics; received 0 markers across 2 lines",
        ),
    )


def test_file_set_exposes_typed_invalid_source_error() -> None:
    result = validate_migration_file_set(
        migration_sources={"versions/broken.py": "def upgrade(:\n    pass\n"},
        alembic_heads="valid (head)",
        destructive_approved=True,
    )

    assert result.errors == (
        MigrationFinding(
            path="<migration-set>",
            code="invalid_source",
            message="one or more migration sources cannot be parsed",
        ),
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
