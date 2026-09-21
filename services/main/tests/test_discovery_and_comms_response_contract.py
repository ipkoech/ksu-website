from __future__ import annotations

from app.api.v1.corporate_comm_engagement import engagement_router, settings_router as comm_settings_router
from app.api.v1.partners import router as partners_router
from app.api.v1.search import router as search_router
from app.api.v1.settings import router as settings_router


def test_discovery_settings_and_engagement_routes_declare_bounded_responses() -> None:
    routes = [
        *partners_router.routes,
        *search_router.routes,
        *settings_router.routes,
        *comm_settings_router.routes,
        *engagement_router.routes,
    ]
    assert len(routes) == 9
    assert all(route.response_model is not None for route in routes)
