from __future__ import annotations

from app.api.v1.content_workflow import router as workflow_router
from app.api.v1.record_recovery import router as recovery_router


def test_workflow_and_recovery_body_routes_declare_bounded_responses() -> None:
    workflow_routes = [route for route in workflow_router.routes if route.status_code != 204]
    recovery_routes = [route for route in recovery_router.routes if route.status_code != 204]

    assert len(workflow_routes) == 3
    assert len(recovery_routes) == 1
    assert all(route.response_model is not None for route in [*workflow_routes, *recovery_routes])
    assert all(route.response_model_exclude_unset for route in [*workflow_routes, *recovery_routes])
