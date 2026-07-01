import unittest

from fastapi.routing import APIRoute

from app.routes.v1.centers import router as centers_router
from app.routes.v1.donations import router as donations_router
from app.routes.v1.partners import router as partners_router
from app.routes.v1.projects import router as projects_router
from app.routes.v1.publications import router as publications_router
from app.routes.v1.stories import router as stories_router


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


def _route(router, path: str, method: str) -> APIRoute:
    for route_path, route in _iter_routes(router):
        if route_path == path and method in route.methods:
            return route
    raise AssertionError(f"{method} {path} route not found")


class ResearchAdminWorkspaceContractTests(unittest.TestCase):
    def test_project_detail_and_relationship_binding_routes_exist(self):
        expected_routes = (
            ("/projects/{slug}/detail", "GET"),
            ("/projects/id/{project_id}/activities", "GET"),
            ("/projects/id/{project_id}/impact-stories", "GET"),
            ("/projects/id/{project_id}/impact-metrics", "GET"),
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

    def test_crud_update_routes_accept_json_body(self):
        route = _route(publications_router, "/publications/id/{item_id}", "PATCH")
        query_param_names = {param.name for param in route.dependant.query_params}
        body_param_names = {param.name for param in route.dependant.body_params}

        self.assertNotIn("data", query_param_names)
        self.assertIn("data", body_param_names)

    def test_farm_detail_and_project_binding_routes_exist(self):
        expected_routes = (
            ("/farms/{slug}/detail", "GET"),
            ("/farms/id/{farm_id}/projects", "GET"),
            ("/farms/id/{farm_id}/projects/{project_id}", "PUT"),
            ("/farms/id/{farm_id}/projects/{project_id}", "DELETE"),
            ("/farms/id/{farm_id}/partners", "GET"),
            ("/farms/id/{farm_id}/activities", "GET"),
            ("/farms/id/{farm_id}/impact-stories", "GET"),
        )

        for path, method in expected_routes:
            with self.subTest(path=path, method=method):
                self.assertIsNotNone(_route(centers_router, path, method))

    def test_core_center_relationship_binding_routes_exist(self):
        expected_routes = (
            ("/centers/id/{center_id}/projects", "GET"),
            ("/centers/id/{center_id}/programs", "GET"),
            ("/centers/id/{center_id}/farms", "GET"),
            ("/centers/id/{center_id}/focus-areas", "GET"),
            ("/centers/id/{center_id}/focus-areas/{focus_area_id}", "PUT"),
            ("/centers/id/{center_id}/focus-areas/{focus_area_id}", "DELETE"),
        )

        for path, method in expected_routes:
            with self.subTest(path=path, method=method):
                self.assertIsNotNone(_route(centers_router, path, method))

    def test_core_program_relationship_binding_routes_exist(self):
        expected_routes = (
            ("/programs/id/{program_id}/projects", "GET"),
            ("/programs/id/{program_id}/themes", "GET"),
            ("/programs/id/{program_id}/themes/{theme_id}", "PUT"),
            ("/programs/id/{program_id}/themes/{theme_id}", "DELETE"),
        )

        for path, method in expected_routes:
            with self.subTest(path=path, method=method):
                self.assertIsNotNone(_route(centers_router, path, method))

    def test_core_theme_relationship_routes_exist(self):
        expected_routes = (
            ("/themes/id/{theme_id}/focus-areas", "GET"),
            ("/themes/id/{theme_id}/projects", "GET"),
            ("/themes/id/{theme_id}/projects/{project_id}", "PUT"),
            ("/themes/id/{theme_id}/projects/{project_id}", "DELETE"),
            ("/themes/id/{theme_id}/programs", "GET"),
            ("/themes/id/{theme_id}/programs/{program_id}", "PUT"),
            ("/themes/id/{theme_id}/programs/{program_id}", "DELETE"),
            ("/themes/id/{theme_id}/publications", "GET"),
            ("/themes/id/{theme_id}/publications/{publication_id}", "PUT"),
            ("/themes/id/{theme_id}/publications/{publication_id}", "DELETE"),
            ("/themes/id/{theme_id}/grants", "GET"),
            ("/themes/id/{theme_id}/grants/{grant_id}", "PUT"),
            ("/themes/id/{theme_id}/grants/{grant_id}", "DELETE"),
        )

        for path, method in expected_routes:
            with self.subTest(path=path, method=method):
                self.assertIsNotNone(_route(projects_router, path, method))

    def test_sustainability_relationship_binding_routes_exist(self):
        expected_routes = (
            ("/sustainability/id/{sustainability_id}/projects", "GET"),
            ("/sustainability/id/{sustainability_id}/projects/{project_id}", "PUT"),
            ("/sustainability/id/{sustainability_id}/projects/{project_id}", "DELETE"),
            ("/sustainability/id/{sustainability_id}/partners", "GET"),
            ("/sustainability/id/{sustainability_id}/partners/{partner_id}", "PUT"),
            ("/sustainability/id/{sustainability_id}/partners/{partner_id}", "DELETE"),
            ("/sustainability/id/{sustainability_id}/training", "GET"),
            ("/sustainability/id/{sustainability_id}/training/{training_id}", "PUT"),
            ("/sustainability/id/{sustainability_id}/training/{training_id}", "DELETE"),
            ("/sustainability/id/{sustainability_id}/stories", "GET"),
            ("/sustainability/id/{sustainability_id}/stories/{story_id}", "PUT"),
            ("/sustainability/id/{sustainability_id}/stories/{story_id}", "DELETE"),
        )

        for path, method in expected_routes:
            with self.subTest(path=path, method=method):
                self.assertIsNotNone(_route(stories_router, path, method))

    def test_partner_reverse_relationship_routes_exist(self):
        expected_routes = (
            ("/partners/id/{partner_id}/projects", "GET"),
            ("/partners/id/{partner_id}/farms", "GET"),
            ("/partners/id/{partner_id}/activities", "GET"),
            ("/partners/id/{partner_id}/impact-stories", "GET"),
            ("/partners/id/{partner_id}/impact-metrics", "GET"),
            ("/partners/id/{partner_id}/consultancies", "GET"),
            ("/partners/id/{partner_id}/sustainability", "GET"),
        )

        for path, method in expected_routes:
            with self.subTest(path=path, method=method):
                self.assertIsNotNone(_route(partners_router, path, method))

    def test_donation_summary_route_exists_and_is_protected(self):
        route = _route(donations_router, "/donations/summary", "GET")

        self.assertTrue(route.dependencies)


if __name__ == "__main__":
    unittest.main()
