from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import create_app


def test_heri_health_returns_service_status() -> None:
    client = TestClient(create_app())

    response = client.get("/api/v1/heri/health")

    assert response.status_code == 200
    assert response.json()["data"] == {"service": "heri-africa", "status": "ok"}
