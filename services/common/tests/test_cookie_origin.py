import pytest
from fastapi.testclient import TestClient

from ksu_common.runtime import CorsConfig, ServiceAppConfig, create_service_app


@pytest.mark.parametrize("cookie", ["ksu_access", "ksu_refresh", "access_token"])
def test_every_supported_auth_cookie_rejects_cross_origin_writes(cookie):
    def routes(app):
        @app.post("/change")
        async def change() -> str:
            return "done"

    app = create_service_app(
        ServiceAppConfig(service_name="test", title="Test", version="1", environment="development"),
        cors=CorsConfig(origins=("https://portal.example.edu",)), register_routes=routes,
    )
    with TestClient(app) as client:
        client.cookies.set(cookie, "test-token")
        for headers in ({"Origin": "https://untrusted.example"}, {"Sec-Fetch-Site": "cross-site"}):
            response = client.post("/change", headers=headers)
            assert response.status_code == 403
            assert response.json()["code"] == "csrf_origin"
        assert client.post("/change", headers={"Origin": "https://portal.example.edu"}).status_code == 200
        # Existing server-side cookie forwarding without browser headers is retained.
        assert client.post("/change").status_code == 200
        client.cookies.clear()
        assert client.post("/change", headers={"Authorization": "Bearer test-token"}).status_code == 200


def test_cors_allows_idempotency_command_header_for_browser_writes():
    def routes(app):
        @app.post("/change")
        async def change() -> str:
            return "done"

    app = create_service_app(
        ServiceAppConfig(service_name="test", title="Test", version="1", environment="development"),
        cors=CorsConfig(origins=("https://portal.example.edu",)), register_routes=routes,
    )
    with TestClient(app) as client:
        response = client.options(
            "/change",
            headers={
                "Origin": "https://portal.example.edu",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "idempotency-key",
            },
        )
        assert response.status_code == 200
        assert "idempotency-key" in response.headers["access-control-allow-headers"].lower()
