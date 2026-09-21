from __future__ import annotations

from fastapi.responses import StreamingResponse

from app.api.v1.corporate_portal import router as corporate_router
from app.api.v1.corporate_portal_media import router as media_router
from app.api.v1.stats import router as stats_router


def test_corporate_portal_json_routes_declare_bounded_responses() -> None:
    routes = [route for route in corporate_router.routes if hasattr(route, "status_code") and route.status_code != 204]
    media_routes = [route for route in media_router.routes if route.status_code != 204]
    assert len(routes) == 1
    assert len(media_routes) == 3
    routes.extend(media_routes)
    assert all(route.response_model is not None for route in routes)


def test_dashboard_export_is_an_explicit_streaming_exception() -> None:
    route = next(route for route in stats_router.routes if route.path.endswith("dashboard/export"))
    assert route.response_model is None
    assert route.response_class is StreamingResponse
