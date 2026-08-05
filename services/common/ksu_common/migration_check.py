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
_ALEMBIC_HEAD_MARKER = re.compile(r"\(head\)")


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
    errors: tuple[MigrationFinding, ...]

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
                code="invalid_source",
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
            elif operation == "execute":
                sql_finding = _destructive_sql_finding(node, path=path)
                if sql_finding is not None:
                    findings.append(sql_finding)
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

    root = _normalise_path(migration_directory)
    if root is None:
        raise MigrationCheckError("migration directory must not contain traversal segments")
    root = root.rstrip("/")
    selected = {
        normalised
        for path in paths
        if (normalised := _normalise_path(path)) is not None
        and normalised.startswith(root + "/")
        and normalised.endswith(".py")
    }
    return tuple(sorted(selected))


def require_single_head(alembic_heads: str) -> str:
    """Return the sole Alembic ``(head)`` line and reject diagnostic output."""

    lines = tuple(line.strip() for line in alembic_heads.splitlines() if line.strip())
    heads = tuple(line for line in lines if _ALEMBIC_HEAD_MARKER.search(line))
    if len(lines) != 1 or len(heads) != 1:
        raise MigrationCheckError(
            "expected exactly one Alembic '(head)' marker with no diagnostics; "
            f"received {len(heads)} markers across {len(lines)} lines"
        )
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
    errors: list[MigrationFinding] = []
    if any(finding.code == "destructive_upgrade_operation" for finding in findings) and not destructive_approved:
        errors.append(
            MigrationFinding(
                path="<migration-set>",
                code="destructive_unapproved",
                message="destructive migration changes require explicit approval",
            )
        )
    if any(finding.code == "invalid_source" for finding in findings):
        errors.append(
            MigrationFinding(
                path="<migration-set>",
                code="invalid_source",
                message="one or more migration sources cannot be parsed",
            )
        )
    try:
        require_single_head(alembic_heads)
    except MigrationCheckError as error:
        errors.append(
            MigrationFinding(
                path="<migration-set>",
                code="invalid_head_count",
                message=str(error),
            )
        )
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


def _destructive_sql_finding(node: ast.Call, *, path: str) -> MigrationFinding | None:
    """Require review for destructive or dynamic ``op.execute`` SQL.

    Dynamic SQL cannot be statically proven safe, so it follows the existing
    destructive-review gate.  Literal SQL inside ``sa.text(...)`` is unwrapped
    so safe wrapped statements remain safe while destructive ones are caught.
    """

    if not node.args:
        return None
    sql_text, dynamic = _sql_expression(node.args[0])
    match = _DESTRUCTIVE_SQL.search(sql_text)
    if match:
        detail = f"SQL {match.group(0).upper()}"
        if dynamic:
            detail += " (dynamic)"
    elif dynamic:
        detail = "dynamic SQL requires review"
    else:
        return None
    return MigrationFinding(
        path=path,
        code="destructive_upgrade_operation",
        message="destructive operation in upgrade: " + detail,
    )


def _sql_expression(node: ast.AST) -> tuple[str, bool]:
    """Return static SQL fragments and whether the expression is dynamic."""

    if isinstance(node, ast.Constant) and isinstance(node.value, str):
        return node.value, False
    if isinstance(node, ast.JoinedStr):
        fragments = [value.value for value in node.values if isinstance(value, ast.Constant) and isinstance(value.value, str)]
        return "".join(fragments), True
    if isinstance(node, ast.Call) and _is_sql_text_wrapper(node):
        if not node.args:
            return "", True
        return _sql_expression(node.args[0])
    return "", True


def _is_sql_text_wrapper(node: ast.Call) -> bool:
    function = node.func
    return (
        isinstance(function, ast.Name)
        and function.id == "text"
        or isinstance(function, ast.Attribute)
        and function.attr == "text"
    )


def _normalise_path(path: str) -> str | None:
    normalised = PurePosixPath(path.replace("\\", "/"))
    if ".." in normalised.parts:
        return None
    return normalised.as_posix()
