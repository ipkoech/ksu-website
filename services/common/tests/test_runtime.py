from __future__ import annotations

import json
from typing import Any

import ksu_common.cache as cache_module
import pytest
from fastapi import APIRouter, Depends, FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.testclient import TestClient
from ksu_common.cache import cached_public
from ksu_common.observability import PrometheusMetricsRegistry
from ksu_common.rate_limit import install_request_body_limit_middleware
from ksu_common.response_validation import allow_response_model_exemption
from ksu_common.runtime import (
    AuditOptions,
    CorsConfig,
    ServiceAppConfig,
    create_service_app,
)
from pydantic import BaseModel, field_validator


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


def _response_validation_app(register_routes, **config_options: Any) -> FastAPI:
    return create_service_app(
        ServiceAppConfig(
            service_name="test-service",
            title="Test",
            version="1.0.0",
            **config_options,
        ),
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


def test_runtime_applies_response_validation_to_nested_included_routers() -> None:
    def register_routes(app: FastAPI) -> None:
        child_router = APIRouter()
        nested_router = APIRouter(prefix="/nested")

        @child_router.get("/widget", response_model=_WidgetResponse)
        async def widget() -> JSONResponse:
            return JSONResponse({"name": 42})

        nested_router.include_router(child_router)
        app.include_router(nested_router, prefix="/api")

    response = TestClient(_response_validation_app(register_routes), raise_server_exceptions=False).get(
        "/api/nested/widget"
    )

    assert response.status_code == 500


def test_runtime_validates_cached_response_once_for_a_cache_miss_and_hit(monkeypatch) -> None:
    class FakeRedis:
        def __init__(self) -> None:
            self.values: dict[str, str] = {}
            self.locks: dict[str, str] = {}

        async def get(self, key: str) -> str | None:
            return self.values.get(key)

        async def set(self, key: str, value: str, *, nx: bool = False, px: int | None = None) -> bool:
            if nx and key in self.locks:
                return False
            if nx:
                self.locks[key] = value
            else:
                self.values[key] = value
            return True

        async def eval(self, _script: str, num_keys: int, *args: str | int) -> int:
            if num_keys == 2:
                cache_key, lock_key, value, _timeout, token = args
                if self.locks.get(str(lock_key)) != str(token):
                    return 0
                self.values[str(cache_key)] = str(value)
                del self.locks[str(lock_key)]
                return 1
            lock_key, token, *_ = args
            if self.locks.get(str(lock_key)) != str(token):
                return 0
            del self.locks[str(lock_key)]
            return 1

    fake_redis = FakeRedis()

    async def get_fake_redis() -> FakeRedis:
        return fake_redis

    monkeypatch.setattr(cache_module, "get_redis", get_fake_redis)
    validation_calls = 0
    handler_calls = 0

    class CountingWidget(BaseModel):
        name: str

        @field_validator("name")
        @classmethod
        def count_validation(cls, value: str) -> str:
            nonlocal validation_calls
            validation_calls += 1
            return value

    def register_routes(app: FastAPI) -> None:
        @app.get("/widget", response_model=CountingWidget)
        @cached_public()
        async def widget() -> dict[str, str]:
            nonlocal handler_calls
            handler_calls += 1
            return {"name": "fresh"}

    client = TestClient(_response_validation_app(register_routes))

    first = client.get("/widget")
    second = client.get("/widget")

    assert first.headers["X-Cache"] == "MISS"
    assert second.headers["X-Cache"] == "HIT"
    assert first.json() == second.json() == {"name": "fresh"}
    assert handler_calls == 1
    assert validation_calls == 2


def test_runtime_observes_missing_and_permissive_public_schemas_in_production() -> None:
    def register_routes(app: FastAPI) -> None:
        @app.get("/public", response_model=None)
        async def public_route() -> dict[str, bool]:
            return {"ok": True}

        child_router = APIRouter()
        nested_router = APIRouter(prefix="/nested")

        @child_router.get("/any", response_model=Any)
        async def any_response() -> dict[str, bool]:
            return {"ok": True}

        @child_router.get("/object", response_model=object)
        async def object_response() -> dict[str, bool]:
            return {"ok": True}

        @child_router.get("/list", response_model=list)
        async def list_response() -> list[dict[str, bool]]:
            return [{"ok": True}]

        @child_router.get("/dict", response_model=dict)
        async def dict_response() -> dict[str, bool]:
            return {"ok": True}

        nested_router.include_router(child_router)
        app.include_router(nested_router, prefix="/api")

    registry = PrometheusMetricsRegistry()
    app = create_service_app(
        ServiceAppConfig(
            service_name="test-service",
            title="Test",
            version="1.0.0",
            environment="production",
        ),
        cors=CorsConfig(origins=("https://example.test",)),
        register_routes=register_routes,
        metrics_registry=registry,
    )
    coverage = app.state.response_model_coverage

    assert coverage.missing == ("GET /public",)
    assert coverage.nonconcrete == (
        "GET /api/nested/any",
        "GET /api/nested/object",
        "GET /api/nested/list",
        "GET /api/nested/dict",
    )
    assert coverage.baseline_missing == 907
    assert "ksu_response_model_coverage_missing{service=\"test-service\"} 1" in registry.render()
    assert "ksu_response_model_coverage_nonconcrete{service=\"test-service\"} 4" in registry.render()


def test_runtime_rejects_invalid_exemption_paths_and_unauthenticated_internal_exemptions() -> None:
    async def internal_auth() -> None:
        return None

    def register_routes(app: FastAPI) -> None:
        @app.get("/healthz", response_model=None)
        @allow_response_model_exemption("health", path="/health")
        async def health() -> dict[str, bool]:
            return {"ok": True}

        @app.get("/internal", response_model=None)
        @allow_response_model_exemption("internal", path="/internal", internal_auth=internal_auth)
        async def internal() -> dict[str, bool]:
            return {"ok": True}

        @app.get("/protected-internal", response_model=None, dependencies=[Depends(internal_auth)])
        @allow_response_model_exemption(
            "internal", path="/protected-internal", internal_auth=internal_auth
        )
        async def protected_internal() -> dict[str, bool]:
            return {"ok": True}

    coverage = _response_validation_app(register_routes).state.response_model_coverage

    assert len(coverage.invalid_exemptions) == 2
    assert "GET /healthz" in coverage.invalid_exemptions[0]
    assert "GET /internal" in coverage.invalid_exemptions[1]
    assert coverage.missing == ()


def test_runtime_allows_only_explicit_streaming_exemptions() -> None:
    try:
        stream_exemption = allow_response_model_exemption("stream", path="/events")
        invalid_stream_exemption = allow_response_model_exemption("stream", path="/not-a-stream")
        file_exemption = allow_response_model_exemption("file", path="/download")
    except ValueError as exc:
        pytest.fail(f"streaming responses need a constrained exemption: {exc}")

    def register_routes(app: FastAPI) -> None:
        @app.get("/events", response_model=None, response_class=StreamingResponse)
        @stream_exemption
        async def events() -> StreamingResponse:
            return StreamingResponse(iter([b"event: ok\n\n"]), media_type="text/event-stream")

        @app.get("/download", response_model=None, response_class=FileResponse)
        @file_exemption
        async def download() -> FileResponse:
            return FileResponse(__file__)

        @app.get("/not-a-stream", response_model=None)
        @invalid_stream_exemption
        async def not_a_stream() -> dict[str, bool]:
            return {"ok": True}

    coverage = _response_validation_app(register_routes).state.response_model_coverage

    assert coverage.missing == ()
    assert len(coverage.invalid_exemptions) == 1
    assert "GET /not-a-stream" in coverage.invalid_exemptions[0]


def test_runtime_allows_explicit_health_response_model_exemption() -> None:
    def register_routes(app: FastAPI) -> None:
        @app.get("/health", response_model=None)
        @allow_response_model_exemption("health", path="/health")
        async def health() -> dict[str, bool]:
            return {"ok": True}

    app = _response_validation_app(register_routes)

    assert app.state.response_model_coverage.missing == ()
