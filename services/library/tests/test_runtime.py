import importlib
import sys

from fastapi import Request
from fastapi.testclient import TestClient

from app.core.config import get_settings


def test_library_boots_with_shared_request_runtime(monkeypatch, tmp_path) -> None:
    monkeypatch.setenv("DATABASE_URL", "postgresql+asyncpg://user:pass@postgres:5432/ksu")
    monkeypatch.setenv("JWT_SECRET_KEY", "j" * 32)
    monkeypatch.setenv("INTERNAL_API_KEY", "l" * 32)
    monkeypatch.setenv("LOG_DIR", str(tmp_path))
    get_settings.cache_clear()
    sys.modules.pop("app.main", None)
    app = importlib.import_module("app.main").create_app()

    @app.get("/api/docs/runtime-probe", include_in_schema=False)
    async def runtime_probe(request: Request) -> dict[str, str]:
        return {"request_id": request.state.request_id}

    response = TestClient(app).get(
        "/api/docs/runtime-probe",
        headers={"X-Request-ID": "library-runtime"},
    )

    assert response.status_code == 200
    assert response.json() == {"request_id": "library-runtime"}
    assert response.headers["X-Request-ID"] == "library-runtime"
    assert float(response.headers["X-Response-Time-Ms"]) >= 0
