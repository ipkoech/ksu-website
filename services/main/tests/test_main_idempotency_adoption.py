from __future__ import annotations

from types import SimpleNamespace

import pytest
from app.services.idempotency import CommandClaim, IdempotencyKeyReuseError
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.v1 import register_routes
from app.api.v1._idempotency import install_main_idempotency, main_mutation_routes
from app.models.idempotency import CommandIdempotency


class _Session:
    async def __aenter__(self):
        return self

    async def __aexit__(self, *_exc):
        return False

    async def commit(self):
        return None

    async def rollback(self):
        return None

    async def close(self):
        return None


def _record(*, status_code: int | None = None, response_body: dict | None = None):
    record = CommandIdempotency(
        command_name="main.test.command",
        scope="actor:test",
        idempotency_key="test-key-1",
        request_fingerprint="f" * 64,
    )
    if status_code is not None:
        record.state = "completed"
        record.status_code = status_code
        record.response_body = response_body or {}
    return record


def test_registration_adopts_all_replay_meaningful_main_mutations() -> None:
    app = FastAPI()
    register_routes(app)

    mutations = main_mutation_routes(app.routes)

    assert mutations
    assert all(getattr(route, "main_idempotency_enabled", False) for route in mutations)


@pytest.mark.asyncio
async def test_route_adoption_requires_key_and_replays_204_without_body(monkeypatch):
    app = FastAPI()
    calls = 0
    router = app.router

    @router.delete("/items/{item_id}", status_code=204)
    async def delete_item(item_id: str):
        nonlocal calls
        calls += 1
        return None

    install_main_idempotency(app.routes)
    claim = CommandClaim(kind="started", record=_record())
    acquire = pytest.MonkeyPatch()
    acquire.setattr("app.api.v1._idempotency.AsyncSessionLocal", lambda: _Session())
    acquire.setattr("app.api.v1._idempotency.acquire_command", lambda *args, **kwargs: _started(claim))
    completed: list[tuple[int, dict]] = []
    acquire.setattr(
        "app.api.v1._idempotency.complete_command",
        lambda record, *, status_code, response_body: completed.append((status_code, response_body)),
    )
    try:
        client = TestClient(app)
        missing = client.delete("/items/1")
        assert missing.status_code == 400

        response = client.delete("/items/1", headers={"Idempotency-Key": "test-key-1"})
        assert response.status_code == 204
        assert response.content == b""
        assert calls == 1
        assert completed == [(204, {})]
    finally:
        acquire.undo()


@pytest.mark.asyncio
async def test_route_adoption_key_reuse_is_rejected_before_business_logic(monkeypatch):
    app = FastAPI()
    calls = 0

    @app.post("/commands")
    async def command():
        nonlocal calls
        calls += 1
        return {"ok": True}

    install_main_idempotency(app.routes)
    monkeypatch.setattr("app.api.v1._idempotency.AsyncSessionLocal", lambda: _Session())

    async def reused(*_args, **_kwargs):
        raise IdempotencyKeyReuseError("different payload")

    monkeypatch.setattr("app.api.v1._idempotency.acquire_command", reused)
    response = TestClient(app).post(
        "/commands",
        json={"value": 1},
        headers={"Idempotency-Key": "test-key-1"},
    )

    assert response.status_code == 409
    assert response.json()["code"] == "idempotency_key_reused"
    assert calls == 0


async def _started(claim: CommandClaim) -> CommandClaim:
    return claim
