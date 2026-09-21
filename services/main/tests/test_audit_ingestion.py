import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from unittest.mock import AsyncMock

from fastapi.testclient import TestClient

from app.api.v1 import internal_router
from app.routes.v1 import internal
from ksu_common.rate_limit import RateLimiter
from ksu_common.database import DatabaseRuntime
from ksu_common.runtime import AuditOptions, CorsConfig, ServiceAppConfig, create_service_app


def test_single_and_batch_audit_wire_contracts_and_authorization(monkeypatch):
    insert = AsyncMock(return_value=1)
    monkeypatch.setattr(internal, "insert_audit_batch", insert)
    monkeypatch.setattr(RateLimiter, "check", AsyncMock())
    session = AsyncMock()

    @asynccontextmanager
    async def factory():
        yield session

    database = DatabaseRuntime(object(), factory)
    capture, dispatch = AsyncMock(), AsyncMock()
    app = create_service_app(
        ServiceAppConfig(service_name="test", title="Test", version="1", environment="development"),
        cors=CorsConfig(origins=()),
        register_routes=lambda app: app.include_router(internal_router, prefix="/api/v1/internal"),
        audit=AuditOptions(
            session_factory=factory, service_name="main", token_key="test",
            token_algorithm="HS256", token_issuer="test", token_audience="test",
            token_key_id="test", capture=capture, dispatch=dispatch,
        ),
    )
    app.dependency_overrides[internal.get_db] = database.session
    payload = {
        "id": str(uuid.uuid4()), "service_name": "library", "action": "test",
        "request_method": "POST", "request_path": "/test", "status_code": 200,
        "status": "success", "happened_at": datetime.now(timezone.utc).isoformat(),
    }
    headers = {"X-Internal-Key": internal.get_settings().INTERNAL_API_KEY}
    with TestClient(app, raise_server_exceptions=False) as client:
        denied = client.post("/api/v1/internal/audit/batch", json={"events": [payload]})
        assert denied.status_code == 403
        insert.assert_not_awaited()
        for events in ([], [{**payload, "details": {"api_key": "batch-secret"}}] * 101):
            rejected = client.post("/api/v1/internal/audit/batch", json={"events": events}, headers=headers)
            assert rejected.status_code == 422
            assert "batch-secret" not in rejected.text
            assert len(rejected.content) < 4096
        for field in ("request_path", "user_agent", "action", "error_message"):
            invalid = {**payload, field: "bad\x00text", "details": {"api_key": "unrelated-secret"}}
            for path, body in [("/audit", invalid), ("/audit/batch", {"events": [invalid]})]:
                rejected = client.post("/api/v1/internal" + path, json=body, headers=headers)
                assert rejected.status_code == 422
                assert "unrelated-secret" not in rejected.text
                assert rejected.json()["detail"][0]["loc"][-1] == field
        insert.assert_not_awaited()
        single = client.post("/api/v1/internal/audit", json=payload, headers=headers)
        assert single.status_code == 202
        assert single.json() == {"status": "accepted", "id": payload["id"]}
        batch = client.post("/api/v1/internal/audit/batch", json={"events": [payload]}, headers=headers)
        assert batch.status_code == 202
        assert batch.json() == {"status": "accepted", "received": 1, "inserted": 1}
        session.commit.side_effect = RuntimeError("commit failed")
        assert client.post("/api/v1/internal/audit/batch", json={"events": [payload]}, headers=headers).status_code == 500
        session.commit.side_effect = None
        insert.side_effect = RuntimeError("insert failed")
        assert client.post("/api/v1/internal/audit", json=payload, headers=headers).status_code == 500
    assert insert.await_count == 4
    assert insert.await_args.args[1][0]["id"] == uuid.UUID(payload["id"])
    capture.assert_not_awaited()
    assert [call.args[0]["status_code"] for call in dispatch.await_args_list] == [403] + [422] * 10 + [500, 500]
