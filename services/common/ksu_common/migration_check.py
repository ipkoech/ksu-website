"""Pure migration-policy checks shared by deployment and CI entrypoints.

This module deliberately does not call Git, Alembic, a database, or a
subprocess.  Adapters collect those inputs and pass their results here.
"""

from __future__ import annotations

import ast
import re
from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from pathlib import PurePosixPath


_DESTRUCTIVE_ALEMBIC_OPERATIONS = frozenset({"drop_table", "drop_column"})
_DESTRUCTIVE_SQL = re.compile(r"\b(?:drop|truncate)\b", re.IGNORECASE)


class MigrationCheckError(ValueError):
    """Raised when supplied migration metadata violates an invariant."""


@dataclass(frozen=True)
class MigrationFinding:
    """A policy finding tied to one migration source file."""

    path: str
    code: str
    message: str


@dataclass(frozen=True)
class MigrationValidationResult:
    """Structured outcome for a supplied migration file set."""

    findings: tuple[MigrationFinding, ...]
    errors: tuple[str, ...]

    @property
    def ok(self) -> bool:
        return not self.errors


def validate_migration_source(source: str, *, path: str = "<migration>") -> tuple[MigrationFinding, ...]:
    """Return destructive operations found in a migration's ``upgrade`` code.

    Destructive downgrade code is intentional rollback behavior and is not an
    upgrade-policy finding.  Invalid Python source is reported as a finding so
    callers can surface it with other file-level results.
    """

    try:
        tree = ast.parse(source, filename=path)
    except SyntaxError as error:
        location = f" at line {error.lineno}" if error.lineno else ""
        return (
            MigrationFinding(
                path=path,
                code="invalid_migration_source",
                message=f"migration source cannot be parsed{location}",
            ),
        )

    findings: list[MigrationFinding] = []
    for upgrade in _upgrade_functions(tree):
        for node in ast.walk(upgrade):
            if not isinstance(node, ast.Call):
                continue
            operation = _alembic_operation(node)
            if operation in _DESTRUCTIVE_ALEMBIC_OPERATIONS:
                findings.append(
                    MigrationFinding(
                        path=path,
                        code="destructive_upgrade_operation",
                        message=f"destructive operation in upgrade: op.{operation}",
                    )
                )
            elif operation == "execute" and _contains_destructive_sql(node):
                findings.append(
                    MigrationFinding(
                        path=path,
                        code="destructive_upgrade_operation",
                        message="destructive operation in upgrade: SQL " + _sql_operation(node),
                    )
                )
    return tuple(findings)


def select_migration_paths(
    *,
    mode: str,
    changed_paths: Iterable[str] = (),
    committed_paths: Iterable[str] = (),
    tracked_paths: Iterable[str] = (),
    migration_directory: str,
) -> tuple[str, ...]:
    """Select normalized migration files from caller-provided path lists.

    ``changed`` selects changed paths, ``committed`` selects paths from a
    supplied commit range, and ``tracked`` selects all supplied tracked paths.
    Files outside ``migration_directory`` and non-Python files are ignored.
    """

    sources = {
        "changed": changed_paths,
        "committed": committed_paths,
        "tracked": tracked_paths,
    }
    try:
        paths = sources[mode]
    except KeyError as error:
        raise MigrationCheckError(f"unsupported migration scan mode: {mode}") from error

    root = _normalise_path(migration_directory).rstrip("/")
    selected = {
        normalised
        for path in paths
        if (normalised := _normalise_path(path)).startswith(root + "/")
        and normalised.endswith(".py")
    }
    return tuple(sorted(selected))


def require_single_head(alembic_heads: str) -> str:
    """Return the sole non-empty Alembic head line or raise a clear error."""

    heads = tuple(line.strip() for line in alembic_heads.splitlines() if line.strip())
    if len(heads) != 1:
        raise MigrationCheckError(f"expected exactly one migration head; received {len(heads)}")
    return heads[0]


def validate_migration_file_set(
    *,
    migration_sources: Mapping[str, str] | Iterable[tuple[str, str]],
    alembic_heads: str,
    destructive_approved: bool,
) -> MigrationValidationResult:
    """Validate source policy and supplied Alembic head output together."""

    entries = migration_sources.items() if isinstance(migration_sources, Mapping) else migration_sources
    findings = tuple(
        finding
        for path, source in sorted(entries)
        for finding in validate_migration_source(source, path=path)
    )
    errors: list[str] = []
    if any(finding.code == "destructive_upgrade_operation" for finding in findings) and not destructive_approved:
        errors.append("destructive migration changes require explicit approval")
    if any(finding.code == "invalid_migration_source" for finding in findings):
        errors.append("one or more migration sources cannot be parsed")
    try:
        require_single_head(alembic_heads)
    except MigrationCheckError as error:
        errors.append(str(error))
    return MigrationValidationResult(findings=findings, errors=tuple(errors))


def _upgrade_functions(tree: ast.Module) -> Iterable[ast.FunctionDef | ast.AsyncFunctionDef]:
    return (
        node
        for node in tree.body
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)) and node.name == "upgrade"
    )


def _alembic_operation(node: ast.Call) -> str | None:
    function = node.func
    if not (
        isinstance(function, ast.Attribute)
        and isinstance(function.value, ast.Name)
        and function.value.id == "op"
    ):
        return None
    return function.attr


def _contains_destructive_sql(node: ast.Call) -> bool:
    return bool(_DESTRUCTIVE_SQL.search(_sql_text(node)))


def _sql_operation(node: ast.Call) -> str:
    match = _DESTRUCTIVE_SQL.search(_sql_text(node))
    return match.group(0).upper() if match else "statement"


def _sql_text(node: ast.Call) -> str:
    if not node.args:
        return ""
    try:
        value = ast.literal_eval(node.args[0])
    except (ValueError, TypeError):
        return ""
    return value if isinstance(value, str) else ""


def _normalise_path(path: str) -> str:
    return PurePosixPath(path.replace("\\", "/")).as_posix()
