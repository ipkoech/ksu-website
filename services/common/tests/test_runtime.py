from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

from ksu_common.rate_limit import install_request_body_limit_middleware
from ksu_common.runtime import AuditOptions, CorsConfig, ServiceAppConfig, create_service_app


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
