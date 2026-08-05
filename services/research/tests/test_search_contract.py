import unittest

from fastapi.routing import APIRoute

from app.main import create_app
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


def _permissive_schema_paths(components: dict, schema_name: str) -> list[str]:
    findings: list[str] = []
    visited: set[str] = set()

    def visit(node, path: str) -> None:
        if isinstance(node, dict):
            ref = node.get("$ref")
            if isinstance(ref, str) and ref.startswith("#/components/schemas/"):
                name = ref.rsplit("/", 1)[-1]
                if name in visited:
                    return
                visited.add(name)
                visit(components[name], f"{path}->$ref({name})")
                return

            if node.get("additionalProperties") is True:
                findings.append(path)

            for key, value in node.items():
                visit(value, f"{path}.{key}")
            return

        if isinstance(node, list):
            for index, value in enumerate(node):
                visit(value, f"{path}[{index}]")

    visit(components[schema_name], schema_name)
    return findings


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

    def test_search_openapi_schemas_do_not_expose_permissive_objects(self):
        components = create_app().openapi()["components"]["schemas"]

        self.assertEqual(_permissive_schema_paths(components, "ResearchSearchResponse"), [])
        self.assertEqual(_permissive_schema_paths(components, "ResearchSearchResult"), [])


if __name__ == "__main__":
    unittest.main()
