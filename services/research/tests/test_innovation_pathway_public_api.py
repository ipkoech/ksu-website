from fastapi.routing import APIRoute

from app.routes.v1.innovation_partnership import router as innovation_partnership_router


def _iter_routes(router, prefix: str = ""):
    for route in router.routes:
        if isinstance(route, APIRoute):
            yield prefix + route.path, route
            continue

        original_router = getattr(route, "original_router", None)
        include_context = getattr(route, "include_context", None)
        if original_router is not None:
            nested_prefix = prefix + getattr(include_context, "prefix", "")
            yield from _iter_routes(original_router, nested_prefix)


def _route(path: str, method: str) -> APIRoute:
    for route_path, route in _iter_routes(innovation_partnership_router):
        if route_path == path and method in route.methods:
            return route
    raise AssertionError(f"{method} {path} route not found")


def test_startup_list_route_accepts_pathway_filters():
    route = _route("/startups", "GET")
    query_param_names = {param.name for param in route.dependant.query_params}

    assert "innovation_id" in query_param_names
    assert "partner_id" in query_param_names
    assert "venture_stage" in query_param_names
    assert "registration_status" in query_param_names


def test_incubation_list_route_accepts_pathway_filters():
    route = _route("/incubation-records", "GET")
    query_param_names = {param.name for param in route.dependant.query_params}

    assert "innovation_id" in query_param_names
    assert "startup_id" in query_param_names
    assert "incubation_type" in query_param_names
    assert "stage" in query_param_names


def test_competition_list_route_accepts_pathway_filters():
    route = _route("/competition-entries", "GET")
    query_param_names = {param.name for param in route.dependant.query_params}

    assert "innovation_id" in query_param_names
    assert "startup_id" in query_param_names
    assert "entry_type" in query_param_names
    assert "entry_status" in query_param_names


def test_transfer_case_list_route_accepts_pathway_filters():
    route = _route("/technology-transfer-cases", "GET")
    query_param_names = {param.name for param in route.dependant.query_params}

    assert "innovation_id" in query_param_names
    assert "partner_id" in query_param_names
    assert "case_type" in query_param_names
    assert "transfer_status" in query_param_names
