import unittest

from fastapi.routing import APIRoute

from app.routes.v1.donations import router as donations_router
from app.routes.v1.projects import router as projects_router


def _route(router, path: str, method: str) -> APIRoute:
    for route in router.routes:
        if isinstance(route, APIRoute) and route.path == path and method in route.methods:
            return route
    raise AssertionError(f"{method} {path} route not found")


class ResearchAdminWorkspaceContractTests(unittest.TestCase):
    def test_project_detail_and_relationship_binding_routes_exist(self):
        expected_routes = (
            ("/projects/{slug}/detail", "GET"),
            ("/projects/id/{project_id}/partners", "GET"),
            ("/projects/id/{project_id}/partners/{partner_id}", "PUT"),
            ("/projects/id/{project_id}/partners/{partner_id}", "DELETE"),
            ("/projects/id/{project_id}/funders", "GET"),
            ("/projects/id/{project_id}/funders/{funder_id}", "PUT"),
            ("/projects/id/{project_id}/funders/{funder_id}", "DELETE"),
            ("/projects/id/{project_id}/focus-areas", "GET"),
            ("/projects/id/{project_id}/focus-areas/{focus_area_id}", "PUT"),
            ("/projects/id/{project_id}/focus-areas/{focus_area_id}", "DELETE"),
        )

        for path, method in expected_routes:
            with self.subTest(path=path, method=method):
                self.assertIsNotNone(_route(projects_router, path, method))

    def test_project_list_route_accepts_farm_filter(self):
        route = _route(projects_router, "/projects", "GET")
        query_param_names = {param.name for param in route.dependant.query_params}

        self.assertIn("farm_id", query_param_names)

    def test_donation_summary_route_exists_and_is_protected(self):
        route = _route(donations_router, "/donations/summary", "GET")

        self.assertTrue(route.dependencies)


if __name__ == "__main__":
    unittest.main()
