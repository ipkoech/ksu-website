from __future__ import annotations

import json

import ksu_common.cache as cache_module
import pytest
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient
from ksu_common.cache import cached_public
from ksu_common.rate_limit import install_request_body_limit_middleware
from ksu_common.response_validation import allow_response_model_exemption
from ksu_common.runtime import (
    AuditOptions,
    CorsConfig,
    ServiceAppConfig,
    create_service_app,
)
from pydantic import BaseModel


def _register_routes(app: FastAPI) -> None:
    @app.get("/ok")
    async def ok(request: Request) -> dict[str, str]:
        return {
            "request_id": request.state.request_id,
            "correlation_id": request.state.correlation_id,
        }

    @app.get("/bad-input")
    async def bad_input() -> None:
        raise ValueError("invalid input")

    @app.get("/forbidden")
    async def forbidden() -> None:
        raise PermissionError("permission required")

    @app.post("/limited")
    async def limited() -> dict[str, bool]:
        return {"ok": True}

    limited.__max_body_bytes__ = 4

    @app.get("/items/{item_id}")
    async def item(item_id: str) -> dict[str, str]:
        return {"item_id": item_id}

    install_request_body_limit_middleware(app)


def _app() -> FastAPI:
    return create_service_app(
        ServiceAppConfig(service_name="test-service", title="Test", version="1.0.0"),
        cors=CorsConfig(origins=("https://example.test",)),
        register_routes=_register_routes,
    )


def test_runtime_centralizes_request_and_correlation_headers() -> None:
    response = TestClient(_app()).get(
        "/ok",
        headers={"X-Request-ID": "request-123", "X-Correlation-ID": "correlation-456"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "request_id": "request-123",
        "correlation_id": "correlation-456",
    }
    assert response.headers["X-Request-ID"] == "request-123"
    assert response.headers["X-Correlation-ID"] == "correlation-456"
    assert float(response.headers["X-Response-Time-Ms"]) >= 0


def test_runtime_generates_a_request_id_and_standardizes_domain_errors() -> None:
    client = TestClient(_app(), raise_server_exceptions=False)

    generated = client.get("/ok")
    bad_input = client.get("/bad-input")
    forbidden = client.get("/forbidden")

    assert generated.headers["X-Request-ID"]
    assert generated.headers["X-Correlation-ID"] == generated.headers["X-Request-ID"]
    assert bad_input.status_code == 400
    assert bad_input.json() == {
        "status": "error",
        "message": "invalid input",
        "code": "bad_request",
    }
    assert forbidden.status_code == 403
    assert forbidden.json() == {
        "status": "error",
        "message": "permission required",
        "code": "forbidden",
    }


def test_runtime_observes_header_rejected_body_limits(monkeypatch) -> None:
    response = TestClient(_app()).post(
        "/limited",
        content=b"12345",
        headers={"Content-Length": "5", "X-Request-ID": "body-limit-request"},
    )

    assert response.status_code == 413
    assert response.headers["X-Request-ID"] == "body-limit-request"
    assert response.headers["X-Correlation-ID"] == "body-limit-request"
    assert float(response.headers["X-Response-Time-Ms"]) >= 0


def test_runtime_audit_preserves_safe_exception_detail(monkeypatch) -> None:
    persisted = []

    async def capture_audit(*args, **kwargs):
        persisted.append(kwargs)

    monkeypatch.setattr("ksu_common.runtime.persist_audit_log", capture_audit)

    def register_routes(app: FastAPI) -> None:
        @app.get("/raises")
        async def raises() -> None:
            raise RuntimeError("database lookup failed for record 17")

    app = create_service_app(
        ServiceAppConfig(service_name="test-service", title="Test", version="1.0.0"),
        cors=CorsConfig(origins=("https://example.test",)),
        register_routes=register_routes,
        audit=AuditOptions(session_factory=object(), service_name="test-service"),
    )

    response = TestClient(app, raise_server_exceptions=False).get("/raises")

    assert response.status_code == 500
    assert persisted[-1]["error_message"] == "database lookup failed for record 17"


def test_runtime_redacts_secret_like_exception_detail(monkeypatch) -> None:
    persisted = []

    async def capture_audit(*args, **kwargs):
        persisted.append(kwargs)

    monkeypatch.setattr("ksu_common.runtime.persist_audit_log", capture_audit)

    def register_routes(app: FastAPI) -> None:
        @app.get("/raises")
        async def raises() -> None:
            raise RuntimeError("upstream Authorization: Bearer super-secret-token failed")

    app = create_service_app(
        ServiceAppConfig(service_name="test-service", title="Test", version="1.0.0"),
        cors=CorsConfig(origins=("https://example.test",)),
        register_routes=register_routes,
        audit=AuditOptions(session_factory=object(), service_name="test-service"),
    )

    TestClient(app, raise_server_exceptions=False).get("/raises")

    assert persisted[-1]["error_message"] == "upstream Authorization: Bearer [REDACTED] failed"


def test_runtime_exposes_prometheus_http_metrics_without_raw_urls() -> None:
    client = TestClient(_app(), raise_server_exceptions=False)

    assert client.get("/items/secret-record-123").status_code == 200
    assert client.get("/missing").status_code == 404

    response = client.get("/metrics")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/plain; version=0.0.4")
    body = response.text
    assert 'ksu_http_server_requests_total{method="GET",route="/items/{item_id}",service="test-service",status_code="200"} 1' in body
    assert 'ksu_http_server_requests_total{method="GET",route="/__unmatched__",service="test-service",status_code="404"} 1' in body
    assert "secret-record-123" not in body
    assert "route=\"/metrics\"" not in body
    assert "ksu_http_server_request_duration_seconds" in body


class _WidgetResponse(BaseModel):
    name: str


def _response_validation_app(register_routes) -> FastAPI:
    return create_service_app(
        ServiceAppConfig(service_name="test-service", title="Test", version="1.0.0"),
        cors=CorsConfig(origins=("https://example.test",)),
        register_routes=register_routes,
    )


def test_runtime_rejects_raw_json_responses_that_bypass_a_declared_response_model() -> None:
    def register_routes(app: FastAPI) -> None:
        @app.get("/widget", response_model=_WidgetResponse)
        async def widget() -> JSONResponse:
            return JSONResponse({"name": 42})

    response = TestClient(_response_validation_app(register_routes), raise_server_exceptions=False).get(
        "/widget"
    )

    assert response.status_code == 500


def test_runtime_keeps_fastapi_response_model_validation_for_cached_results(monkeypatch) -> None:
    class FakeRedis:
        async def get(self, _key):
            return json.dumps({"name": "cached", "unexpected": "discarded"})

        async def setex(self, _key, _timeout, _value):
            raise AssertionError("cache hit must not be written")

    async def get_fake_redis():
        return FakeRedis()

    monkeypatch.setattr(cache_module, "get_redis", get_fake_redis)
    calls = 0

    def register_routes(app: FastAPI) -> None:
        @app.get("/widget", response_model=_WidgetResponse)
        @cached_public()
        async def widget() -> dict[str, str]:
            nonlocal calls
            calls += 1
            return {"name": "handler"}

    response = TestClient(_response_validation_app(register_routes)).get("/widget")

    assert response.json() == {"name": "cached"}
    assert calls == 0


def test_runtime_records_public_routes_missing_response_models_outside_production() -> None:
    def register_routes(app: FastAPI) -> None:
        @app.get("/public", response_model=None)
        async def public_route() -> dict[str, bool]:
            return {"ok": True}

    app = _response_validation_app(register_routes)

    assert getattr(app.state, "response_model_coverage", []) == ["GET /public"]


def test_runtime_rejects_public_routes_missing_response_models_in_production(monkeypatch) -> None:
    monkeypatch.setenv("APP_ENV", "production")

    def register_routes(app: FastAPI) -> None:
        @app.get("/public", response_model=None)
        async def public_route() -> dict[str, bool]:
            return {"ok": True}

    with pytest.raises(ValueError, match="GET /public"):
        _response_validation_app(register_routes)


def test_runtime_rejects_response_model_escapes_outside_health_metrics_or_internal_routes(
    monkeypatch,
) -> None:
    monkeypatch.setenv("APP_ENV", "production")

    async def public_route() -> dict[str, bool]:
        return {"ok": True}

    public_route.__response_model_exemption__ = "internal"

    def register_routes(app: FastAPI) -> None:
        app.add_api_route("/public", public_route, methods=["GET"], response_model=None)

    with pytest.raises(ValueError, match="invalid response-model exemption"):
        _response_validation_app(register_routes)


def test_runtime_allows_explicit_health_response_model_exemption_in_production(monkeypatch) -> None:
    monkeypatch.setenv("APP_ENV", "production")

    def register_routes(app: FastAPI) -> None:
        @app.get("/health", response_model=None)
        @allow_response_model_exemption("health")
        async def health() -> dict[str, bool]:
            return {"ok": True}

    app = _response_validation_app(register_routes)

    assert app.state.response_model_coverage == []
