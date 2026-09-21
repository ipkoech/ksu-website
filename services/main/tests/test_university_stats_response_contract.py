from __future__ import annotations

from app.api.v1.stats import router as stats_router
from app.api.v1.university_info import router as university_router


def test_university_and_stats_json_routes_declare_bounded_responses() -> None:
    university_routes = [route for route in university_router.routes if route.status_code != 204]
    stats_routes = [
        route for route in stats_router.routes
        if route.path != "/portal/corporate-communication/dashboard/export"
    ]
    assert len(university_routes) == 4
    assert len(stats_routes) == 4
    assert all(route.response_model is not None for route in (*university_routes, *stats_routes))
