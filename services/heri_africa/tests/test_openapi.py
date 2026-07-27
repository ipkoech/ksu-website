from __future__ import annotations

from app.main import create_app


def test_openapi_contains_core_heri_backend_routes() -> None:
    paths = create_app().openapi()["paths"]
    expected = {
        "/api/v1/heri/site",
        "/api/v1/heri/news",
        "/api/v1/heri/contact",
        "/api/v1/heri/admin/dashboard",
        "/api/v1/heri/admin/news",
        "/api/v1/heri/admin/media/upload",
        "/api/v1/heri/admin/analytics/report",
        "/api/v1/heri/events",
        "/api/v1/heri/research/projects",
    }
    assert expected.issubset(paths)
