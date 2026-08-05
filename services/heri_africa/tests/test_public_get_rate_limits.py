from __future__ import annotations

import inspect

from ksu_common.rate_limit import RateLimiter

from app.routes.v1 import collections, health, public
from app.routes.v1._rate_limits import settings


def _limiter(endpoint) -> RateLimiter:
    for cell in endpoint.__closure__ or ():
        if isinstance(cell.cell_contents, RateLimiter):
            return cell.cell_contents
    raise AssertionError(f"{endpoint.__name__} is missing a rate-limit wrapper")


def test_public_content_get_routes_have_shared_budget():
    routes = [*public.router.routes, *collections.router.routes]
    assert len(routes) == 22
    for route in routes:
        limiter = _limiter(route.endpoint)
        assert limiter.requests == settings.PUBLIC_CONTENT_RATE_LIMIT_COUNT
        assert limiter.window == settings.PUBLIC_CONTENT_RATE_LIMIT_WINDOW_SECONDS
        assert "request" in inspect.signature(route.endpoint).parameters


def test_health_get_route_has_dedicated_budget():
    route = health.router.routes[0]
    limiter = _limiter(route.endpoint)
    assert limiter.requests == settings.HEALTH_RATE_LIMIT_COUNT
    assert limiter.window == settings.HEALTH_RATE_LIMIT_WINDOW_SECONDS
    assert "request" in inspect.signature(route.endpoint).parameters
