import importlib
import json
import sys

from fastapi import Request
from fastapi.testclient import TestClient

from app.core.config import get_settings
from test_config import base_settings


def test_main_boots_with_shared_request_runtime(monkeypatch, tmp_path) -> None:
    environment = {
        key: json.dumps(value) if isinstance(value, list) else str(value)
        for key, value in base_settings(LOG_DIR=str(tmp_path)).items()
    }
    for key, value in environment.items():
        monkeypatch.setenv(key, value)
    get_settings.cache_clear()
    sys.modules.pop("app.main", None)
    app = importlib.import_module("app.main").create_app()

    @app.get("/api/docs/runtime-probe", include_in_schema=False)
    async def runtime_probe(request: Request) -> dict[str, str]:
        return {"request_id": request.state.request_id}

    response = TestClient(app).get(
        "/api/docs/runtime-probe",
        headers={"X-Request-ID": "main-runtime"},
    )

    assert response.status_code == 200
    assert response.json() == {"request_id": "main-runtime"}
    assert response.headers["X-Request-ID"] == "main-runtime"
    assert float(response.headers["X-Response-Time-Ms"]) >= 0
