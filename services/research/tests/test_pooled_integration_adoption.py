from __future__ import annotations

import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock

import httpx
import pytest
from app.services import core, references
from app.tasks import donations


def _response(payload: object) -> httpx.Response:
    return httpx.Response(
        200,
        json=payload,
        request=httpx.Request("GET", "http://main.test/request"),
    )


class _Pool:
    def __init__(self, responses: list[httpx.Response]) -> None:
        self.responses = responses
        self.calls: list[tuple[str, tuple[object, ...], dict[str, object]]] = []

    async def request_internal(self, *args: object, **kwargs: object) -> httpx.Response:
        self.calls.append(("request_internal", args, kwargs))
        return self.responses.pop(0)

    async def request(self, *args: object, **kwargs: object) -> httpx.Response:
        self.calls.append(("request", args, kwargs))
        return self.responses.pop(0)


@pytest.mark.asyncio
async def test_research_reference_and_event_integrations_use_the_shared_pool(monkeypatch: pytest.MonkeyPatch) -> None:
    pool = _Pool([_response({}), _response({}), _response({"data": [{"id": "event-1"}]})])
    settings = SimpleNamespace(
        REFERENCE_VALIDATION_MODE="strict",
        MAIN_SERVICE_URL="http://main.test/",
        MAIN_SERVICE_API_KEY="main-key",
        REFERENCE_VALIDATION_TIMEOUT_SECONDS=4.0,
    )
    monkeypatch.setattr(references, "get_integration_pool", lambda: pool)
    monkeypatch.setattr(references, "get_settings", lambda: settings)
    monkeypatch.setattr(core, "get_integration_pool", lambda: pool)
    monkeypatch.setattr(core, "get_settings", lambda: settings)

    school_id = uuid.uuid4()
    department_id = uuid.uuid4()
    await references.MainReferenceValidator.validate({"school_id": school_id}, {"school_id": "schools"})
    await references.MainReferenceValidator.validate_department_school(school_id, department_id)
    events = await core.MainScopedEventService.list("research_project", uuid.uuid4())

    reference_call, department_call, event_call = pool.calls
    assert reference_call[0] == "request_internal"
    assert reference_call[1][:4] == (
        "research-main-reference-validation",
        "http://main.test",
        "GET",
        f"/api/v1/internal/references/schools/{school_id}",
    )
    assert reference_call[2]["api_key"] == "main-key"
    assert reference_call[2]["timeout"] == 4.0
    assert department_call[1][:4] == (
        "research-main-reference-validation",
        "http://main.test",
        "GET",
        f"/api/v1/internal/schools/{school_id}/departments/{department_id}",
    )
    assert event_call[0] == "request"
    assert event_call[1][:4] == ("main-scoped-events", "http://main.test", "GET", "/api/v1/events")
    assert events == [{"id": "event-1"}]


def test_research_donation_write_uses_the_shared_pool_without_task_retry(monkeypatch: pytest.MonkeyPatch) -> None:
    pool = _Pool([_response({"status": "success"})])
    settings = SimpleNamespace(MAIN_SERVICE_URL="http://main.test/", MAIN_SERVICE_API_KEY="main-key")
    monkeypatch.setattr(donations, "get_integration_pool", lambda: pool)
    monkeypatch.setattr(donations, "get_settings", lambda: settings)

    payload = {"to_email": "research@example.test", "subject": "Notice"}
    result = donations._post_main_internal("email/send", payload)

    assert result == {"status": "success"}
    call = pool.calls[0]
    assert call[0] == "request_internal"
    assert call[1][:4] == ("main-donation-notifications", "http://main.test", "POST", "/api/v1/internal/email/send")
    assert call[2]["api_key"] == "main-key"
    assert call[2]["json"] == payload
    assert not hasattr(donations.notify_research_admins_of_donation, "autoretry_for")


@pytest.mark.asyncio
async def test_research_lifespan_closes_shared_integration_pool(monkeypatch: pytest.MonkeyPatch) -> None:
    from app import main

    close_pool = AsyncMock()
    monkeypatch.setattr(main, "close_integration_pool", close_pool)

    async with main.lifespan(SimpleNamespace()):
        pass

    close_pool.assert_awaited_once()
