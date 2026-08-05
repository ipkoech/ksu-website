from __future__ import annotations

import json
import math
import uuid
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
import sqlalchemy as sa
from app.api.v1 import newsletters
from app.api.v1.public import inquiries
from app.models.idempotency import CommandIdempotency
from app.schemas.contact_inquiry import PublicEntityInquiryCreate
from app.services.idempotency import (
    CommandClaim,
    IdempotencyKeyReuseError,
    acquire_command,
    acquire_json_command,
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


def _request(key: str, *, path: str = "/api/v1/public/schools/business/inquiries", method: str = "POST") -> SimpleNamespace:
    return SimpleNamespace(
        headers={"Idempotency-Key": key},
        client=SimpleNamespace(host="127.0.0.1"),
        method=method,
        url=SimpleNamespace(path=path),
    )


def _subscriber(**overrides) -> SimpleNamespace:
    values = {
        "id": uuid.uuid4(),
        "email": "jane@example.com",
        "name": "Jane Student",
        "subscribed_at": datetime(2026, 8, 5, tzinfo=timezone.utc),
        "unsubscribed_at": None,
        "frequency": "all",
        "categories": None,
        "is_verified": False,
        "status": "active",
    }
    values.update(overrides)
    return SimpleNamespace(**values)


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
    create = AsyncMock()
    monkeypatch.setattr(inquiries, "resolve_public_inquiry_target", AsyncMock(return_value=target))
    monkeypatch.setattr(
        inquiries,
        "acquire_json_command",
        AsyncMock(return_value=JSONResponse(status_code=201, content=body)),
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
        "acquire_json_command",
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
    create = AsyncMock()
    monkeypatch.setattr(inquiries, "resolve_public_inquiry_target", AsyncMock(return_value=target))
    monkeypatch.setattr(
        inquiries,
        "acquire_json_command",
        AsyncMock(
            return_value=JSONResponse(
                status_code=409,
                content={"status": "error", "message": "still processing", "code": "idempotency_in_progress"},
                headers={"Retry-After": "1"},
            )
        ),
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


@pytest.mark.asyncio
async def test_school_inquiry_new_key_still_creates_a_later_same_content_inquiry(monkeypatch):
    target = _target()
    record = CommandIdempotency(
        command_name="public.school_inquiry.create",
        scope=f"public:school:{target.entity_id}",
        idempotency_key="later-client-key",
        request_fingerprint="b" * 64,
    )
    existing = SimpleNamespace(id=uuid.uuid4(), reference_number="INQ-1", status="new")
    created = SimpleNamespace(id=uuid.uuid4(), reference_number="INQ-2", status="new")
    create = AsyncMock(return_value=created)
    monkeypatch.setattr(inquiries, "resolve_public_inquiry_target", AsyncMock(return_value=target))
    monkeypatch.setattr(
        inquiries,
        "acquire_json_command",
        AsyncMock(return_value=CommandClaim(kind="started", record=record)),
    )
    monkeypatch.setattr(inquiries, "_enforce_email_limit", AsyncMock(), raising=False)
    monkeypatch.setattr(inquiries, "_find_duplicate", AsyncMock(return_value=existing), raising=False)
    monkeypatch.setattr(inquiries.ContactInquiryService, "create_public", create)

    response = await inquiries.create_public_school_inquiry.__wrapped__(
        school_slug="business",
        request=_request("later-client-key"),
        data=_payload(),
        db=SimpleNamespace(),
        idempotency_key="later-client-key",
    )

    body = json.loads(response.body)
    assert isinstance(response, JSONResponse)
    assert response.status_code == 201
    assert body["message"] == "Inquiry received"
    assert body["data"]["id"] == str(created.id)
    assert body["data"]["reference_number"] == created.reference_number
    assert body["data"]["id"] != str(existing.id)
    create.assert_awaited_once()
    assert record.state == "completed"


@pytest.mark.asyncio
async def test_entity_inquiry_started_claim_executes_business_logic_and_stores_response(monkeypatch):
    target = SimpleNamespace(
        entity_type="department",
        entity_id=uuid.uuid4(),
        name="Admissions Office",
        slug="admissions-office",
    )
    record = CommandIdempotency(
        command_name="public.entity_inquiry.create",
        scope=f"public:{target.entity_type}:{target.entity_id}",
        idempotency_key="client-key",
        request_fingerprint="a" * 64,
    )
    item = SimpleNamespace(id=uuid.uuid4(), reference_number="INQ-9", status="new")
    create = AsyncMock(return_value=item)
    monkeypatch.setattr(inquiries, "resolve_public_inquiry_target", AsyncMock(return_value=target))
    monkeypatch.setattr(
        inquiries,
        "acquire_json_command",
        AsyncMock(return_value=CommandClaim(kind="started", record=record)),
    )
    monkeypatch.setattr(inquiries, "_enforce_email_limit", AsyncMock(), raising=False)
    monkeypatch.setattr(inquiries, "_find_duplicate", AsyncMock(return_value=None), raising=False)
    monkeypatch.setattr(inquiries.ContactInquiryService, "create_public", create)

    response = await inquiries.create_public_entity_inquiry.__wrapped__(
        entity_type="department",
        entity_slug="admissions-office",
        request=_request("client-key", path="/api/v1/public/entities/department/admissions-office/inquiries"),
        data=_payload(),
        db=SimpleNamespace(),
        idempotency_key="client-key",
    )

    assert isinstance(response, JSONResponse)
    assert response.status_code == 201
    assert json.loads(response.body)["data"]["id"] == str(item.id)
    assert create.await_count == 1
    assert record.state == "completed"
    assert record.status_code == 201
    assert record.response_body == json.loads(response.body)


@pytest.mark.asyncio
async def test_entity_inquiry_key_reuse_returns_conflict_without_business_logic(monkeypatch):
    target = SimpleNamespace(
        entity_type="department",
        entity_id=uuid.uuid4(),
        name="Admissions Office",
        slug="admissions-office",
    )
    create = AsyncMock()
    monkeypatch.setattr(inquiries, "resolve_public_inquiry_target", AsyncMock(return_value=target))
    monkeypatch.setattr(
        inquiries,
        "acquire_json_command",
        AsyncMock(
            return_value=JSONResponse(
                status_code=409,
                content={"status": "error", "message": "reused", "code": "idempotency_key_reused"},
            )
        ),
    )
    monkeypatch.setattr(inquiries.ContactInquiryService, "create_public", create)

    response = await inquiries.create_public_entity_inquiry.__wrapped__(
        entity_type="department",
        entity_slug="admissions-office",
        request=_request("client-key", path="/api/v1/public/entities/department/admissions-office/inquiries"),
        data=_payload(),
        db=SimpleNamespace(),
        idempotency_key="client-key",
    )

    assert isinstance(response, JSONResponse)
    assert response.status_code == 409
    assert json.loads(response.body)["code"] == "idempotency_key_reused"
    create.assert_not_awaited()


@pytest.mark.asyncio
async def test_newsletter_subscribe_started_claim_stores_response(monkeypatch):
    record = CommandIdempotency(
        command_name="public.newsletter.subscribe",
        scope="public:newsletter:jane@example.com",
        idempotency_key="client-key",
        request_fingerprint="a" * 64,
    )
    item = _subscriber()
    subscribe = AsyncMock(return_value=item)
    monkeypatch.setattr(
        newsletters,
        "acquire_json_command",
        AsyncMock(return_value=CommandClaim(kind="started", record=record)),
    )
    monkeypatch.setattr(newsletters._NEWSLETTER_EMAIL_LIMITER, "check", AsyncMock())
    monkeypatch.setattr(newsletters.NewsletterSubscriberService, "subscribe", subscribe)

    response = await newsletters.subscribe_newsletter.__wrapped__(
        request=_request("client-key", path="/api/v1/newsletters/subscribe"),
        data=newsletters.NewsletterSubscriberCreate(email="jane@example.com", name="Jane Student"),
        db=SimpleNamespace(),
        idempotency_key="client-key",
    )

    body = json.loads(response.body)
    assert isinstance(response, JSONResponse)
    assert response.status_code == 201
    assert body["message"] == "Subscription created"
    assert body["data"]["email"] == item.email
    assert record.state == "completed"
    assert record.status_code == 201
    assert record.response_body == body
    subscribe.assert_awaited_once()


@pytest.mark.asyncio
async def test_newsletter_unsubscribe_missing_subscriber_stores_failed_response(monkeypatch):
    record = CommandIdempotency(
        command_name="public.newsletter.unsubscribe",
        scope="public:newsletter:jane@example.com",
        idempotency_key="client-key",
        request_fingerprint="a" * 64,
    )
    unsubscribe = AsyncMock(return_value=None)
    monkeypatch.setattr(
        newsletters,
        "acquire_json_command",
        AsyncMock(return_value=CommandClaim(kind="started", record=record)),
    )
    monkeypatch.setattr(newsletters._NEWSLETTER_EMAIL_LIMITER, "check", AsyncMock())
    monkeypatch.setattr(newsletters.NewsletterSubscriberService, "unsubscribe", unsubscribe)

    response = await newsletters.unsubscribe_newsletter.__wrapped__(
        request=_request("client-key", path="/api/v1/newsletters/unsubscribe"),
        email="jane@example.com",
        db=SimpleNamespace(),
        idempotency_key="client-key",
    )

    assert isinstance(response, JSONResponse)
    assert response.status_code == 404
    assert json.loads(response.body) == {"detail": "Subscriber not found"}
    assert record.state == "failed"
    assert record.status_code == 404
    assert record.response_body == {"detail": "Subscriber not found"}
    unsubscribe.assert_awaited_once()


@pytest.mark.asyncio
async def test_acquire_json_command_converts_key_reuse_into_conflict_response(monkeypatch):
    monkeypatch.setattr(
        "app.services.idempotency.acquire_command",
        AsyncMock(side_effect=IdempotencyKeyReuseError("used with a different request payload")),
    )

    response = await acquire_json_command(
        _Db(),
        command_name="public.entity_inquiry.create",
        scope="public:department:1",
        idempotency_key="client-key",
        request_payload={"subject": "Admissions question"},
        in_progress_body={"code": "idempotency_in_progress"},
        key_reuse_body={"code": "idempotency_key_reused"},
    )

    assert isinstance(response, JSONResponse)
    assert response.status_code == 409
    assert json.loads(response.body)["code"] == "idempotency_key_reused"


@pytest.mark.asyncio
async def test_acquire_json_command_replays_the_stored_terminal_response(monkeypatch):
    record = CommandIdempotency(
        command_name="public.entity_inquiry.create",
        scope="public:department:1",
        idempotency_key="client-key",
        request_fingerprint="a" * 64,
        state="completed",
        status_code=201,
        response_body={"status": "success", "data": {"id": "inquiry-1"}},
    )
    monkeypatch.setattr(
        "app.services.idempotency.acquire_command",
        AsyncMock(return_value=CommandClaim(kind="replay", record=record)),
    )

    response = await acquire_json_command(
        _Db(),
        command_name="public.entity_inquiry.create",
        scope="public:department:1",
        idempotency_key="client-key",
        request_payload={"subject": "Admissions question"},
        in_progress_body={"code": "idempotency_in_progress"},
        key_reuse_body={"code": "idempotency_key_reused"},
    )

    assert isinstance(response, JSONResponse)
    assert response.status_code == 201
    assert json.loads(response.body) == record.response_body


@pytest.mark.asyncio
async def test_acquire_json_command_returns_retryable_in_progress_response(monkeypatch):
    record = CommandIdempotency(
        command_name="public.entity_inquiry.create",
        scope="public:department:1",
        idempotency_key="client-key",
        request_fingerprint="a" * 64,
    )
    monkeypatch.setattr(
        "app.services.idempotency.acquire_command",
        AsyncMock(return_value=CommandClaim(kind="in_progress", record=record)),
    )

    response = await acquire_json_command(
        _Db(),
        command_name="public.entity_inquiry.create",
        scope="public:department:1",
        idempotency_key="client-key",
        request_payload={"subject": "Admissions question"},
        in_progress_body={"code": "idempotency_in_progress"},
        key_reuse_body={"code": "idempotency_key_reused"},
        retry_after=7,
    )

    assert isinstance(response, JSONResponse)
    assert response.status_code == 409
    assert response.headers["retry-after"] == "7"
    assert json.loads(response.body) == {"code": "idempotency_in_progress"}


def test_migration_uses_the_current_main_head_and_guards_terminal_rows():
    source = MIGRATION.read_text(encoding="utf-8")

    assert 'down_revision = "20260803_0300"' in source
    assert "20260805_0500" not in source
    assert "ck_command_idempotency_response_shape" in source
    assert "CREATE TRIGGER command_idempotency_terminal_immutable" in source
    assert "OLD.state IN ('completed', 'failed')" in source
    assert "op.execute" in source
