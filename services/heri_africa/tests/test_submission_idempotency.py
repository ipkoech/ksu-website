from __future__ import annotations

import json
import math
from pathlib import Path
from unittest.mock import AsyncMock

import pytest
import sqlalchemy as sa
from app.models.submissions import CommandIdempotency
from app.routes.v1 import submissions as submissions_module
from app.routes.v1.submissions import (
    SubmissionCommandClaim,
    SubmissionIdempotencyKeyReuseError,
    _acquire_json_submission_command,
    _complete_submission_command,
    _fail_submission_command,
    _submission_request_fingerprint,
)
from fastapi.responses import JSONResponse

ROOT = Path(__file__).parents[1]
MIGRATION = ROOT / "migrations" / "versions" / "0006_command_idempotency.py"


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


def test_submission_request_fingerprint_rejects_non_finite_json_values() -> None:
    with pytest.raises(ValueError):
        _submission_request_fingerprint({"score": math.nan})


def test_terminal_submission_idempotency_records_are_immutable() -> None:
    record = CommandIdempotency(
        command_name="heri.submission.contact",
        scope="email:visitor@example.com",
        idempotency_key="client-key",
        request_fingerprint="a" * 64,
    )

    _complete_submission_command(
        record,
        status_code=202,
        response_body={"status": "received", "message": "Thank you. The HERI Africa team will respond soon."},
    )

    with pytest.raises(ValueError, match="only pending"):
        _fail_submission_command(record, status_code=409, response_body={"code": "idempotency_key_reused"})


def test_submission_idempotency_model_requires_complete_terminal_responses() -> None:
    response_constraint = next(
        constraint
        for constraint in CommandIdempotency.__table__.constraints
        if isinstance(constraint, sa.CheckConstraint)
        and constraint.name == "ck_heri_command_idempotency_response_shape"
    )

    source = str(response_constraint.sqltext)
    assert "pending" in source
    assert "completed" in source
    assert "failed" in source
    assert "response_body IS NOT NULL" in source


@pytest.mark.asyncio
async def test_acquire_json_submission_command_converts_key_reuse_into_conflict_response(monkeypatch):
    monkeypatch.setattr(
        submissions_module,
        "_acquire_submission_command",
        AsyncMock(side_effect=SubmissionIdempotencyKeyReuseError("used with a different request payload")),
    )

    response = await _acquire_json_submission_command(
        _Db(),
        command_name="heri.submission.contact",
        scope="email:visitor@example.com",
        idempotency_key="client-key",
        request_payload={"email": "visitor@example.com"},
        in_progress_body={"status": "error", "code": "idempotency_in_progress"},
        key_reuse_body={"status": "error", "code": "idempotency_key_reused"},
    )

    assert isinstance(response, JSONResponse)
    assert response.status_code == 409
    assert json.loads(response.body)["code"] == "idempotency_key_reused"


@pytest.mark.asyncio
async def test_acquire_json_submission_command_replays_the_stored_terminal_response(monkeypatch):
    record = CommandIdempotency(
        command_name="heri.submission.contact",
        scope="email:visitor@example.com",
        idempotency_key="client-key",
        request_fingerprint="a" * 64,
        state="completed",
        status_code=202,
        response_body={"status": "received", "message": "Thank you. The HERI Africa team will respond soon."},
    )
    monkeypatch.setattr(
        submissions_module,
        "_acquire_submission_command",
        AsyncMock(return_value=SubmissionCommandClaim(kind="replay", record=record)),
    )

    response = await _acquire_json_submission_command(
        _Db(),
        command_name="heri.submission.contact",
        scope="email:visitor@example.com",
        idempotency_key="client-key",
        request_payload={"email": "visitor@example.com"},
        in_progress_body={"status": "error", "code": "idempotency_in_progress"},
        key_reuse_body={"status": "error", "code": "idempotency_key_reused"},
    )

    assert isinstance(response, JSONResponse)
    assert response.status_code == 202
    assert json.loads(response.body) == record.response_body


@pytest.mark.asyncio
async def test_acquire_json_submission_command_returns_retryable_in_progress_response(monkeypatch):
    record = CommandIdempotency(
        command_name="heri.submission.contact",
        scope="email:visitor@example.com",
        idempotency_key="client-key",
        request_fingerprint="a" * 64,
    )
    monkeypatch.setattr(
        submissions_module,
        "_acquire_submission_command",
        AsyncMock(return_value=SubmissionCommandClaim(kind="in_progress", record=record)),
    )

    response = await _acquire_json_submission_command(
        _Db(),
        command_name="heri.submission.contact",
        scope="email:visitor@example.com",
        idempotency_key="client-key",
        request_payload={"email": "visitor@example.com"},
        in_progress_body={"status": "error", "code": "idempotency_in_progress"},
        key_reuse_body={"status": "error", "code": "idempotency_key_reused"},
        retry_after=7,
    )

    assert isinstance(response, JSONResponse)
    assert response.status_code == 409
    assert response.headers["retry-after"] == "7"
    assert json.loads(response.body) == {"status": "error", "code": "idempotency_in_progress"}


def test_submission_idempotency_migration_targets_latest_head_and_guards_terminal_rows() -> None:
    source = MIGRATION.read_text(encoding="utf-8")

    assert 'down_revision = "0005_center_slug_settings"' in source
    assert "ck_heri_command_idempotency_response_shape" in source
    assert "CREATE TRIGGER heri_command_idempotency_terminal_immutable" in source
    assert "OLD.state IN ('completed', 'failed')" in source
