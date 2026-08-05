from fastapi import Request
from fastapi.testclient import TestClient

from app.main import create_app


def test_heri_boots_with_shared_request_runtime() -> None:
    app = create_app()

    @app.get("/api/docs/runtime-probe", include_in_schema=False)
    async def runtime_probe(request: Request) -> dict[str, str]:
        return {"request_id": request.state.request_id}

    response = TestClient(app).get(
        "/api/docs/runtime-probe",
        headers={"X-Request-ID": "heri-runtime"},
    )

    assert response.status_code == 200
    assert response.json() == {"request_id": "heri-runtime"}
    assert response.headers["X-Request-ID"] == "heri-runtime"
    assert float(response.headers["X-Response-Time-Ms"]) >= 0
