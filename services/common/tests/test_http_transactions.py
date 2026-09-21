from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, Mock

import pytest
from fastapi import APIRouter, Depends
from fastapi.testclient import TestClient
from starlette.responses import JSONResponse, StreamingResponse

from ksu_common.database import DatabaseRuntime
from ksu_common.runtime import AuditOptions, CorsConfig, ServiceAppConfig, create_service_app


@pytest.mark.parametrize("nested", [False, True])
@pytest.mark.parametrize("failure", [None, "commit", "capture", "serialization", "handler", "response"])
def test_transaction_finishes_before_response_and_after_response_hooks(nested, failure):
    events = []
    session = AsyncMock()

    async def commit():
        events.append("commit")
        if failure == "commit":
            raise RuntimeError("database failed")

    async def rollback():
        events.append("rollback")

    session.commit.side_effect = commit
    session.rollback.side_effect = rollback

    @asynccontextmanager
    async def factory():
        events.append("open")
        try:
            yield session
        finally:
            events.append("close")

    database = DatabaseRuntime(object(), factory)

    def register(app):
        router = APIRouter()

        @router.post("/mutation", response_model=None if failure == "response" else int)
        async def mutation(db=Depends(database.session)):
            events.append("handler")
            if failure == "handler":
                raise ValueError("invalid mutation")
            if failure == "response":
                return JSONResponse({"detail": "invalid mutation"}, status_code=400)
            return "invalid integer" if failure == "serialization" else 1

        if nested:
            parent = APIRouter()
            parent.include_router(router, prefix="/nested")
            app.include_router(parent, prefix="/api")
        else:
            app.include_router(router)

    async def after_response(_request, response):
        events.append(f"response:{response.status_code}")

    async def capture(db, payload):
        assert db is session
        assert payload["status_code"] == 200
        events.append("capture")
        if failure == "capture":
            raise RuntimeError("audit staging failed")

    dispatch = AsyncMock()

    app = create_service_app(
        ServiceAppConfig(service_name="test", title="Test", version="1", environment="development"),
        cors=CorsConfig(origins=()), register_routes=register, after_response=after_response,
        audit=AuditOptions(
            session_factory=factory, service_name="test", token_key="test",
            token_algorithm="HS256", token_issuer="test", token_audience="test",
            token_key_id="test", capture=capture, dispatch=dispatch,
        ),
    )
    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.post("/api/nested/mutation" if nested else "/mutation")
    assert response.status_code == (400 if failure in {"handler", "response"} else 500 if failure else 200)
    if failure:
        assert "rollback" in events
        assert "response:200" not in events
        dispatch.assert_awaited_once()
        assert dispatch.call_args.args[0]["status_code"] >= 400
    else:
        assert events.index("capture") < events.index("commit")
        dispatch.assert_not_awaited()
        assert events.index("commit") < events.index("response:200")
        session.commit.assert_awaited_once()
        session.rollback.assert_not_awaited()
    assert events.count("close") == 1


def test_explicit_stream_keeps_session_until_iterator_finishes():
    events = []
    session = AsyncMock()

    @asynccontextmanager
    async def factory():
        try:
            yield session
        finally:
            events.append("close")

    database = DatabaseRuntime(object(), factory)

    def register(app):
        @app.get("/stream", response_class=StreamingResponse)
        async def stream(db=Depends(database.session)):
            async def chunks():
                assert "close" not in events
                await db.flush()
                yield "chunk"

            return StreamingResponse(chunks())

    app = create_service_app(
        ServiceAppConfig(service_name="test", title="Test", version="1", environment="development"),
        cors=CorsConfig(origins=()), register_routes=register,
    )
    with TestClient(app) as client:
        assert client.get("/stream").text == "chunk"
    assert events == ["close"]
    session.commit.assert_awaited_once()


def test_durable_capture_failure_does_not_retry_indexed_inline_write(caplog, monkeypatch):
    factory = Mock(side_effect=AssertionError("inline database fallback must not run"))
    dispatch = AsyncMock(side_effect=RuntimeError("sensitive connection text"))

    def register(app):
        @app.post("/probe", response_model=int)
        async def probe():
            return 1

    app = create_service_app(
        ServiceAppConfig(service_name="test", title="Test", version="1", environment="development"),
        cors=CorsConfig(origins=()), register_routes=register,
        audit=AuditOptions(
            session_factory=factory, service_name="test", token_key="test",
            token_algorithm="HS256", token_issuer="test", token_audience="test",
            token_key_id="test", dispatch=dispatch, inline_fallback=False,
        ),
    )
    increment = Mock(wraps=app.state.metrics.increment)
    monkeypatch.setattr(app.state.metrics, "increment", increment)
    with TestClient(app) as client:
        assert client.post("/probe").status_code == 200
    increment.assert_any_call("audit.capture_failure", tags={"service": "test"})
    dispatch.assert_awaited_once()
    factory.assert_not_called()
    assert "durable audit capture failed" in caplog.text
    assert "sensitive connection text" not in caplog.text
