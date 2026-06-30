import unittest

from fastapi.routing import APIRoute

from app.routes.v1 import router as v1_router
from app.routes.v1.search import router as search_router
from app.services.search import RESEARCH_SEARCH_AREAS


def _iter_routes(router):
    for route in router.routes:
        if isinstance(route, APIRoute):
            yield route
        elif hasattr(route, "original_router"):
            yield from _iter_routes(route.original_router)


def _route(router, path: str, method: str) -> APIRoute:
    for route in _iter_routes(router):
        if route.path == path and method in route.methods:
            return route
    raise AssertionError(f"{method} {path} route not found")


class ResearchSearchContractTests(unittest.TestCase):
    def test_research_search_route_is_registered_public_endpoint(self):
        route = _route(search_router, "/search", "GET")
        query_param_names = {param.name for param in route.dependant.query_params}

        self.assertFalse(route.dependencies)
        self.assertIn("q", query_param_names)
        self.assertIn("types", query_param_names)
        self.assertIn("limit", query_param_names)

    def test_research_v1_router_includes_search_route(self):
        paths = {
            route.path
            for route in _iter_routes(v1_router)
            if "GET" in route.methods
        }

        self.assertIn("/search", paths)

    def test_research_search_covers_public_research_areas_only(self):
        keys = {area.key for area in RESEARCH_SEARCH_AREAS}

        self.assertGreaterEqual(len(keys), 16)
        self.assertIn("projects", keys)
        self.assertIn("publications", keys)
        self.assertIn("grants", keys)
        self.assertIn("innovations", keys)
        self.assertIn("resources", keys)
        self.assertNotIn("grant_applications", keys)
        self.assertNotIn("donations", keys)


if __name__ == "__main__":
    unittest.main()
