from __future__ import annotations

from pathlib import Path

import pytest
import sqlalchemy as sa
from app.models.idempotency import CommandIdempotency
from app.services.idempotency import (
    IdempotencyKeyReuseError,
    acquire_command,
    complete_command,
    fail_command,
    request_fingerprint,
)
from sqlalchemy.dialects import postgresql

ROOT = Path(__file__).parents[1]
MIGRATION = ROOT / "migrations" / "versions" / "20260805_0040_add_command_idempotency.py"


class _Result:
    def __init__(self, record: CommandIdempotency | None):
        self.record = record

    def scalar_one_or_none(self) -> CommandIdempotency | None:
        return self.record


class _Db:
    def __init__(self, *records: CommandIdempotency | None):
        self._results = iter(_Result(record) for record in records)
        self.statements: list[sa.Executable] = []

    async def execute(self, statement: sa.Executable) -> _Result:
        self.statements.append(statement)
        return next(self._results)


def test_request_fingerprint_is_stable_for_equivalent_json_payloads():
    first = request_fingerprint({"name": "Kisii", "settings": {"enabled": True, "rank": 2}})
    second = request_fingerprint({"settings": {"rank": 2, "enabled": True}, "name": "Kisii"})

    assert first == second
    assert len(first) == 64


def test_command_idempotency_model_scopes_client_keys_and_stores_replay_data():
    table = CommandIdempotency.__table__
    columns = table.c
    unique_constraint = next(
        constraint
        for constraint in table.constraints
        if isinstance(constraint, sa.UniqueConstraint)
        and constraint.name == "uq_command_idempotency_scope_key"
    )
    state_constraint = next(
        constraint
        for constraint in table.constraints
        if isinstance(constraint, sa.CheckConstraint)
        and constraint.name == "ck_command_idempotency_state"
    )

    assert table.name == "command_idempotency"
    assert [column.name for column in unique_constraint.columns] == [
        "command_name",
        "scope",
        "idempotency_key",
    ]
    assert {"request_fingerprint", "state", "status_code", "response_body"} <= set(columns.keys())
    assert "pending" in str(state_constraint.sqltext)
    assert "completed" in str(state_constraint.sqltext)
    assert "failed" in str(state_constraint.sqltext)


def test_completion_and_failure_persist_the_response_to_replay():
    record = CommandIdempotency(
        command_name="school.update",
        scope="user:7",
        idempotency_key="client-key",
        request_fingerprint="a" * 64,
    )

    complete_command(record, status_code=201, response_body={"id": "school-1"})

    assert record.state == "completed"
    assert record.status_code == 201
    assert record.response_body == {"id": "school-1"}

    fail_command(record, status_code=422, response_body={"detail": "invalid"})

    assert record.state == "failed"
    assert record.status_code == 422
    assert record.response_body == {"detail": "invalid"}


@pytest.mark.asyncio
async def test_acquire_command_starts_a_durable_record_with_postgres_conflict_protection():
    record = CommandIdempotency(
        command_name="school.update",
        scope="user:7",
        idempotency_key="client-key",
        request_fingerprint=request_fingerprint({"name": "Kisii"}),
    )
    db = _Db(record)

    claim = await acquire_command(
        db,
        command_name="school.update",
        scope="user:7",
        idempotency_key="client-key",
        request_payload={"name": "Kisii"},
    )

    assert claim.kind == "started"
    assert claim.record is record
    sql = str(db.statements[0].compile(dialect=postgresql.dialect()))
    assert "ON CONFLICT (command_name, scope, idempotency_key) DO NOTHING" in sql


@pytest.mark.asyncio
async def test_acquire_command_replays_a_matching_completed_request():
    record = CommandIdempotency(
        command_name="school.update",
        scope="user:7",
        idempotency_key="client-key",
        request_fingerprint=request_fingerprint({"name": "Kisii"}),
        state="completed",
        status_code=201,
        response_body={"id": "school-1"},
    )
    db = _Db(None, record)

    claim = await acquire_command(
        db,
        command_name="school.update",
        scope="user:7",
        idempotency_key="client-key",
        request_payload={"name": "Kisii"},
    )

    assert claim.kind == "replay"
    assert claim.record.status_code == 201
    assert claim.record.response_body == {"id": "school-1"}


@pytest.mark.asyncio
async def test_acquire_command_reports_a_matching_pending_request_as_in_progress():
    record = CommandIdempotency(
        command_name="school.update",
        scope="user:7",
        idempotency_key="client-key",
        request_fingerprint=request_fingerprint({"name": "Kisii"}),
        state="pending",
    )
    db = _Db(None, record)

    claim = await acquire_command(
        db,
        command_name="school.update",
        scope="user:7",
        idempotency_key="client-key",
        request_payload={"name": "Kisii"},
    )

    assert claim.kind == "in_progress"


@pytest.mark.asyncio
async def test_acquire_command_rejects_reusing_a_client_key_for_a_different_payload():
    record = CommandIdempotency(
        command_name="school.update",
        scope="user:7",
        idempotency_key="client-key",
        request_fingerprint=request_fingerprint({"name": "Kisii"}),
    )
    db = _Db(None, record)

    with pytest.raises(IdempotencyKeyReuseError):
        await acquire_command(
            db,
            command_name="school.update",
            scope="user:7",
            idempotency_key="client-key",
            request_payload={"name": "Different"},
        )


def test_migration_creates_a_reversible_postgres_idempotency_table():
    source = MIGRATION.read_text(encoding="utf-8").lower()

    assert 'revision = "20260805_0040"' in source
    assert 'down_revision = "20260805_0500"' in source
    assert 'op.create_table(' in source
    assert '"command_idempotency"' in source
    assert '"uq_command_idempotency_scope_key"' in source
    assert 'postgresql.jsonb' in source
    assert 'op.drop_table("command_idempotency")' in source
