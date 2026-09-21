from unittest.mock import AsyncMock

import pytest
from fastapi import APIRouter, Request
from fastapi.testclient import TestClient

from ksu_common.rate_limit import RateLimiter, install_request_body_limit_middleware, rate_limit
from ksu_common.runtime import CorsConfig, ServiceAppConfig, create_service_app


@pytest.mark.parametrize("chunked", [False, True])
def test_nested_body_limit_runs_before_json_binding(monkeypatch, chunked):
    check = AsyncMock()
    monkeypatch.setattr(RateLimiter, "check", check)

    def register(app):
        child = APIRouter()

        @child.post("/items")
        @rate_limit(requests=10, window=60, max_body_bytes=8)
        async def items(request: Request, body: dict[str, int]) -> int:
            return body["x"]

        parent = APIRouter()
        parent.include_router(child, prefix="/nested")
        app.include_router(parent, prefix="/api")
        install_request_body_limit_middleware(app)

    app = create_service_app(
        ServiceAppConfig(service_name="test", title="Test", version="1", environment="development"),
        cors=CorsConfig(origins=()), register_routes=register,
    )
    with TestClient(app) as client:
        body = iter([b"x" * 16]) if chunked else b"x" * 16
        rejected = client.post("/api/nested/items", content=body, headers={"Content-Type": "application/json"})
        assert rejected.status_code == 413
        check.assert_not_awaited()
        assert client.post("/api/nested/items", content=b'{"x":1}', headers={"Content-Type": "application/json"}).json() == 1


@pytest.mark.parametrize("length", ["-1", "+7", "1_0", "", " 7", "7 "])
@pytest.mark.parametrize("middleware", [False, True])
def test_malformed_length_rejected_before_limiter_and_handler(monkeypatch, length, middleware):
    check = AsyncMock()
    handler = AsyncMock()
    monkeypatch.setattr(RateLimiter, "check", check)

    def register(app):
        @app.post("/items")
        @rate_limit(requests=10, window=60, max_body_bytes=8)
        async def items(request: Request):
            await handler()
            return {"ok": True}

        if middleware:
            install_request_body_limit_middleware(app)

    app = create_service_app(
        ServiceAppConfig(service_name="test", title="Test", version="1", environment="development"),
        cors=CorsConfig(origins=()), register_routes=register,
    )
    with TestClient(app) as client:
        response = client.post("/items", content=b'{"x":1}', headers={"Content-Length": length})
    assert response.status_code == 400
    assert response.json() == {"detail": "Invalid Content-Length header"}
    check.assert_not_awaited()
    handler.assert_not_awaited()
