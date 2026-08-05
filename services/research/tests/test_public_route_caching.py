import inspect
import os

from fastapi.routing import iter_route_contexts

os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://user:pass@postgres:5432/ksu")
os.environ.setdefault("JWT_SECRET_KEY", "j" * 32)
os.environ.setdefault("MAIN_SERVICE_API_KEY", "m" * 32)
os.environ.setdefault("INTERNAL_API_KEY", "r" * 32)

from app.routes.v1 import router as v1_router


PUBLIC_GET_PATHS = {
    "/farms/{slug}/detail",
    "/farms/id/{farm_id}/projects",
    "/farms/id/{farm_id}/partners",
    "/farms/id/{farm_id}/activities",
    "/farms/id/{farm_id}/impact-stories",
    "/centers/id/{center_id}/projects",
    "/centers/id/{center_id}/programs",
    "/centers/id/{center_id}/farms",
    "/centers/id/{center_id}/focus-areas",
    "/centers/id/{center_id}/partners",
    "/public/heri/centers/{center_id}/partners",
    "/programs/id/{program_id}/projects",
    "/programs/id/{program_id}/themes",
    "/grants/id/{grant_id}/projects",
    "/grants/id/{grant_id}/themes",
    "/funders/id/{funder_id}/projects",
    "/funders/id/{funder_id}/grants",
    "/innovations/id/{innovation_id}/startups",
    "/innovations/id/{innovation_id}/incubation-records",
    "/innovations/id/{innovation_id}/competition-entries",
    "/innovations/id/{innovation_id}/technology-transfer-cases",
    "/partners/id/{partner_id}/projects",
    "/partners/id/{partner_id}/farms",
    "/partners/id/{partner_id}/activities",
    "/partners/id/{partner_id}/impact-stories",
    "/partners/id/{partner_id}/impact-metrics",
    "/partners/id/{partner_id}/consultancies",
    "/partners/id/{partner_id}/startups",
    "/partners/id/{partner_id}/incubation-records",
    "/partners/id/{partner_id}/competition-entries",
    "/partners/id/{partner_id}/technology-transfer-cases",
    "/partners/id/{partner_id}/sustainability",
    "/projects/{slug}/detail",
    "/projects/id/{project_id}/activities",
    "/projects/id/{project_id}/impact-stories",
    "/projects/id/{project_id}/impact-metrics",
    "/projects/id/{project_id}/partners",
    "/projects/id/{project_id}/funders",
    "/projects/id/{project_id}/focus-areas",
    "/themes/id/{theme_id}/focus-areas",
    "/themes/id/{theme_id}/projects",
    "/themes/id/{theme_id}/programs",
    "/themes/id/{theme_id}/publications",
    "/themes/id/{theme_id}/grants",
    "/realtime/research/config",
    "/search",
    "/stats",
}


def _get_routes():
    return {
        context.path: context.endpoint
        for context in iter_route_contexts(v1_router.routes)
        if "GET" in context.methods
    }


def test_public_get_routes_use_shared_cache_decorator():
    routes = _get_routes()

    missing = {
        path
        for path in PUBLIC_GET_PATHS
        if path not in routes or not hasattr(routes[path], "__wrapped__")
    }

    assert not missing


def test_sensitive_get_routes_remain_uncached():
    routes = _get_routes()

    for path in (
        "/health",
        "/internal/stats",
        "/analytics/dashboard",
        "/exports/jobs/{job_id}/download",
        "/resources/{item_id}/download",
        "/guidelines/{item_id}/download",
    ):
        assert path in routes
        assert not hasattr(routes[path], "__wrapped__")


def test_search_cache_decorator_preserves_query_parameters():
    route = _get_routes()["/search"]
    assert inspect.signature(route).parameters.keys() >= {"q", "types", "limit"}
