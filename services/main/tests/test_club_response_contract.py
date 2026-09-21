from __future__ import annotations

from app.api.v1.clubs import router


def test_club_profile_and_activity_routes_declare_bounded_responses() -> None:
    routes = [route for route in router.routes if route.response_model is not None]
    assert len(routes) == 25
    assert all(route.response_model is not None for route in routes)
    assert all(route.response_model_exclude_unset for route in routes)
