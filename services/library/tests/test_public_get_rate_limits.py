from __future__ import annotations

import inspect

from ksu_common.rate_limit import RateLimiter

from app.routes.v1 import electronic, health, library, search
from app.routes.v1._rate_limits import settings


def _limiter(endpoint) -> RateLimiter:
    for cell in endpoint.__closure__ or ():
        if isinstance(cell.cell_contents, RateLimiter):
            return cell.cell_contents
    raise AssertionError(f"{endpoint.__name__} is missing a rate-limit wrapper")


def test_public_catalog_get_routes_have_shared_budget():
    routes = [
        *electronic.resources_router.routes,
        *electronic.guides_router.routes,
        *electronic.publications_router.routes,
        *library.branches_router.routes,
        *library.hours_router.routes,
        *library.today_hours_router.routes,
        *library.links_router.routes,
        *library.files_router.routes,
        *search.router.routes,
    ]
    public_get_routes = [route for route in routes if "GET" in route.methods and "saved" not in route.path]
    assert len(public_get_routes) == 14
    for route in public_get_routes:
        limiter = _limiter(route.endpoint)
        assert limiter.requests == settings.PUBLIC_CATALOG_RATE_LIMIT_COUNT
        assert limiter.window == settings.PUBLIC_CATALOG_RATE_LIMIT_WINDOW_SECONDS
        assert "request" in inspect.signature(route.endpoint).parameters


def test_health_get_route_has_dedicated_budget():
    route = health.router.routes[0]
    limiter = _limiter(route.endpoint)
    assert limiter.requests == settings.HEALTH_RATE_LIMIT_COUNT
    assert limiter.window == settings.HEALTH_RATE_LIMIT_WINDOW_SECONDS
    assert "request" in inspect.signature(route.endpoint).parameters
