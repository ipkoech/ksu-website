from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.testclient import TestClient

from ksu_common.runtime import CorsConfig, ServiceAppConfig, create_service_app


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
