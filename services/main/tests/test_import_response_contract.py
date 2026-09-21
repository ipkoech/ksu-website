from __future__ import annotations

from app.api.v1.imports import router


def test_import_routes_declare_bounded_responses_or_stream_exception() -> None:
    body_routes = [route for route in router.routes if route.path.endswith("template") is False]
    assert len(body_routes) == 6
    assert all(route.response_model is not None for route in body_routes)
    template = next(route for route in router.routes if route.path.endswith("template"))
    assert template.response_model is None
