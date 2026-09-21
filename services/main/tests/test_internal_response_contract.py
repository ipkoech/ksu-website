from __future__ import annotations

from app.routes.v1.internal import router


def test_internal_snapshot_routes_declare_bounded_response_models() -> None:
    expected = {
        "/events",
        "/email/send",
        "/notifications/broadcast",
        "/persons/{person_id}",
        "/persons/resolve",
        "/staff-assignments/{assignment_id}",
        "/departments/{department_id}",
        "/schools/{school_id}/departments/{department_id}",
        "/media/{media_id}",
        "/references/{kind}/{item_id}",
    }
    models = {route.path: route.response_model for route in router.routes if route.path in expected}
    assert set(models) == expected
    assert all(model is not None for model in models.values())
