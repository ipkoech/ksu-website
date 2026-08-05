from __future__ import annotations

import json
import math
import uuid
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
import sqlalchemy as sa
from app.api.v1.public import inquiries
from app.models.idempotency import CommandIdempotency
from app.schemas.contact_inquiry import PublicEntityInquiryCreate
from app.services.idempotency import (
    CommandClaim,
    acquire_command,
    complete_command,
    fail_command,
    request_fingerprint,
)
from fastapi.responses import JSONResponse


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


def _payload() -> PublicEntityInquiryCreate:
    return PublicEntityInquiryCreate(
        sender_name="Jane Student",
        sender_email="jane@example.com",
        subject="Admissions question",
        message="When does the intake open?",
        consent_to_contact=True,
    )


def _target() -> SimpleNamespace:
    return SimpleNamespace(
        entity_type="school",
        entity_id=uuid.uuid4(),
        name="School of Business",
        slug="business",
    )


def _request(key: str) -> SimpleNamespace:
    return SimpleNamespace(
        headers={"Idempotency-Key": key},
        client=SimpleNamespace(host="127.0.0.1"),
    )


def test_request_fingerprint_rejects_non_finite_json_values():
    with pytest.raises(ValueError):
        request_fingerprint({"score": math.nan})


@pytest.mark.asyncio
async def test_acquire_command_rejects_an_oversized_idempotency_key():
    with pytest.raises(ValueError, match="idempotency_key must not exceed 255 characters"):
        await acquire_command(
            _Db(),
            command_name="public.school_inquiry.create",
            scope="public:school:1",
            idempotency_key="k" * 256,
            request_payload={"subject": "Admissions question"},
        )


def test_terminal_records_cannot_be_rewritten_by_completion_helpers():
    record = CommandIdempotency(
        command_name="public.school_inquiry.create",
        scope="public:school:1",
        idempotency_key="client-key",
        request_fingerprint="a" * 64,
    )

    complete_command(record, status_code=201, response_body={"id": "inquiry-1"})

    with pytest.raises(ValueError, match="only pending"):
        fail_command(record, status_code=422, response_body={"detail": "invalid"})


def test_model_requires_complete_terminal_responses():
    response_constraint = next(
        constraint
        for constraint in CommandIdempotency.__table__.constraints
        if isinstance(constraint, sa.CheckConstraint)
        and constraint.name == "ck_command_idempotency_response_shape"
    )

    source = str(response_constraint.sqltext)
    assert "pending" in source
    assert "completed" in source
    assert "failed" in source
    assert "response_body IS NOT NULL" in source


@pytest.mark.asyncio
async def test_school_inquiry_replays_the_stored_response_without_creating_again(monkeypatch):
    target = _target()
    body = {
        "status": "success",
        "message": "Inquiry received",
        "data": {"id": "inquiry-1", "reference_number": "INQ-1", "status": "new"},
    }
    record = CommandIdempotency(
        command_name="public.school_inquiry.create",
        scope=f"public:school:{target.entity_id}",
        idempotency_key="client-key",
        request_fingerprint="a" * 64,
        state="completed",
        status_code=201,
        response_body=body,
    )
    create = AsyncMock()
    monkeypatch.setattr(inquiries, "resolve_public_inquiry_target", AsyncMock(return_value=target))
    monkeypatch.setattr(
        inquiries,
        "acquire_command",
        AsyncMock(return_value=CommandClaim(kind="replay", record=record)),
    )
    monkeypatch.setattr(inquiries.ContactInquiryService, "create_public", create)

    response = await inquiries.create_public_school_inquiry.__wrapped__(
        school_slug="business", request=_request("client-key"), data=_payload(), db=SimpleNamespace(), idempotency_key="client-key"
    )

    assert isinstance(response, JSONResponse)
    assert response.status_code == 201
    assert json.loads(response.body) == body
    create.assert_not_awaited()


@pytest.mark.asyncio
async def test_school_inquiry_only_started_claim_executes_business_logic(monkeypatch):
    target = _target()
    record = CommandIdempotency(
        command_name="public.school_inquiry.create",
        scope=f"public:school:{target.entity_id}",
        idempotency_key="client-key",
        request_fingerprint="a" * 64,
    )
    item = SimpleNamespace(id=uuid.uuid4(), reference_number="INQ-1", status="new")
    create = AsyncMock(return_value=item)
    monkeypatch.setattr(inquiries, "resolve_public_inquiry_target", AsyncMock(return_value=target))
    monkeypatch.setattr(
        inquiries,
        "acquire_command",
        AsyncMock(return_value=CommandClaim(kind="started", record=record)),
    )
    monkeypatch.setattr(inquiries, "_enforce_email_limit", AsyncMock(), raising=False)
    monkeypatch.setattr(inquiries, "_find_duplicate", AsyncMock(return_value=None), raising=False)
    monkeypatch.setattr(inquiries.ContactInquiryService, "create_public", create)

    response = await inquiries.create_public_school_inquiry.__wrapped__(
        school_slug="business", request=_request("client-key"), data=_payload(), db=SimpleNamespace(), idempotency_key="client-key"
    )

    assert isinstance(response, JSONResponse)
    assert json.loads(response.body)["data"]["id"] == str(item.id)
    assert create.await_count == 1
    assert record.state == "completed"
    assert record.status_code == 201
    assert record.response_body == json.loads(response.body)


@pytest.mark.asyncio
async def test_school_inquiry_pending_claim_returns_documented_retry_response(monkeypatch):
    target = _target()
    record = CommandIdempotency(
        command_name="public.school_inquiry.create",
        scope=f"public:school:{target.entity_id}",
        idempotency_key="client-key",
        request_fingerprint="a" * 64,
    )
    create = AsyncMock()
    monkeypatch.setattr(inquiries, "resolve_public_inquiry_target", AsyncMock(return_value=target))
    monkeypatch.setattr(
        inquiries,
        "acquire_command",
        AsyncMock(return_value=CommandClaim(kind="in_progress", record=record)),
    )
    monkeypatch.setattr(inquiries.ContactInquiryService, "create_public", create)

    response = await inquiries.create_public_school_inquiry.__wrapped__(
        school_slug="business", request=_request("client-key"), data=_payload(), db=SimpleNamespace(), idempotency_key="client-key"
    )

    assert isinstance(response, JSONResponse)
    assert response.status_code == 409
    assert response.headers["retry-after"] == "1"
    assert json.loads(response.body)["code"] == "idempotency_in_progress"
    create.assert_not_awaited()


def test_migration_uses_the_current_main_head_and_guards_terminal_rows():
    source = MIGRATION.read_text(encoding="utf-8")

    assert 'down_revision = "20260803_0300"' in source
    assert "20260805_0500" not in source
    assert "ck_command_idempotency_response_shape" in source
    assert "CREATE TRIGGER command_idempotency_terminal_immutable" in source
    assert "OLD.state IN ('completed', 'failed')" in source
    assert "op.execute" in source
