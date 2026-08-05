from __future__ import annotations

import inspect

from ksu_common.rate_limit import RateLimiter

from app.api.v1 import documents, events, media, news, public_media, public_pages
from app.core.config import get_settings
from app.routes.v1 import health

settings = get_settings()


def _limiter(endpoint) -> RateLimiter:
    for cell in endpoint.__closure__ or ():
        if isinstance(cell.cell_contents, RateLimiter):
            return cell.cell_contents
    raise AssertionError(f"{endpoint.__name__} is missing a rate-limit wrapper")


def test_public_content_get_routes_have_shared_budget():
    routes = [
        *documents.router.routes,
        *events.router.routes,
        *news.router.routes,
        *public_pages.router.routes,
    ]
    public_get_routes = [route for route in routes if "GET" in route.methods and "/admin" not in route.path and "/id/" not in route.path]
    assert len(public_get_routes) == 8
    for route in public_get_routes:
        limiter = _limiter(route.endpoint)
        assert limiter.requests == settings.PUBLIC_CONTENT_RATE_LIMIT_COUNT
        assert limiter.window == settings.PUBLIC_CONTENT_RATE_LIMIT_WINDOW_SECONDS
        assert "request" in inspect.signature(route.endpoint).parameters


def test_public_media_get_routes_have_media_budget():
    for route in public_media.router.routes:
        limiter = _limiter(route.endpoint)
        assert limiter.requests == settings.PUBLIC_MEDIA_RATE_LIMIT_COUNT
        assert limiter.window == settings.PUBLIC_MEDIA_RATE_LIMIT_WINDOW_SECONDS
        assert "request" in inspect.signature(route.endpoint).parameters


def test_authenticated_media_upload_has_user_or_ip_budget():
    route = next(route for route in media.router.routes if "/upload" in route.path)
    limiter = _limiter(route.endpoint)
    assert limiter.requests == settings.MEDIA_UPLOAD_RATE_LIMIT_COUNT
    assert limiter.window == settings.MEDIA_UPLOAD_RATE_LIMIT_WINDOW_SECONDS
    assert "request" in inspect.signature(route.endpoint).parameters


def test_health_get_route_has_dedicated_budget():
    route = health.router.routes[0]
    limiter = _limiter(route.endpoint)
    assert limiter.requests == settings.HEALTH_RATE_LIMIT_COUNT
    assert limiter.window == settings.HEALTH_RATE_LIMIT_WINDOW_SECONDS
    assert "request" in inspect.signature(route.endpoint).parameters
