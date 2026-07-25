import unittest

from fastapi.routing import APIRoute

from app.main import create_app
from app.routes.v1.content import router as content_router


def _route(router, path: str, method: str) -> APIRoute:
    for route in router.routes:
        if isinstance(route, APIRoute) and route.path == path and method in route.methods:
            return route
    raise AssertionError(f"{method} {path} route not found")


def _paths(router, method: str, prefix: str = "") -> set[str]:
    paths: set[str] = set()
    for route in router.routes:
        if isinstance(route, APIRoute) and method in route.methods:
            paths.add(f"{prefix}{route.path}")
            continue
        original_router = getattr(route, "original_router", None)
        include_context = getattr(route, "include_context", None)
        if original_router is not None and include_context is not None:
            paths.update(_paths(original_router, method, f"{prefix}{include_context.prefix}"))
    return paths


class SupportDownloadRouteContractTests(unittest.TestCase):
    def test_resource_download_route_is_public_get_by_id(self):
        route = _route(content_router, "/resources/{item_id}/download", "GET")

        path_params = {param.name for param in route.dependant.path_params}
        self.assertIn("item_id", path_params)
        self.assertFalse(route.dependencies)

    def test_guideline_download_route_is_public_get_by_id(self):
        route = _route(content_router, "/guidelines/{item_id}/download", "GET")

        path_params = {param.name for param in route.dependant.path_params}
        self.assertIn("item_id", path_params)
        self.assertFalse(route.dependencies)

    def test_research_v1_router_registers_support_download_routes(self):
        paths = _paths(create_app(), "GET")

        self.assertIn("/api/v1/resources/{item_id}/download", paths)
        self.assertIn("/api/v1/guidelines/{item_id}/download", paths)


if __name__ == "__main__":
    unittest.main()
