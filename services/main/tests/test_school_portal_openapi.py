import unittest

from fastapi import FastAPI

from app.api.v1 import register_routes


class SchoolPortalOpenAPIContractTests(unittest.TestCase):
    def setUp(self):
        app = FastAPI()
        register_routes(app)
        self.schema = app.openapi()

    def test_complete_portal_surface_is_documented(self):
        paths = self.schema["paths"]
        expected = {
            "/api/v1/school-portal/context",
            "/api/v1/school-portal/dashboard",
            "/api/v1/school-portal/profile",
            "/api/v1/school-portal/team",
            "/api/v1/school-portal/departments",
            "/api/v1/school-portal/programmes",
            "/api/v1/school-portal/publications",
            "/api/v1/school-portal/content",
            "/api/v1/school-portal/media/batches",
            "/api/v1/school-portal/inquiries",
        }
        self.assertFalse(expected - set(paths))

    def test_portal_never_accepts_a_caller_selected_school_id(self):
        for path, path_item in self.schema["paths"].items():
            if not path.startswith("/api/v1/school-portal/"):
                continue
            for method, operation in path_item.items():
                if method == "parameters":
                    continue
                parameter_names = {
                    item["name"] for item in operation.get("parameters", ())
                }
                self.assertNotIn("school_id", parameter_names, f"{method} {path}")

    def test_every_portal_operation_has_authentication(self):
        for path, path_item in self.schema["paths"].items():
            if not path.startswith("/api/v1/school-portal/"):
                continue
            for method, operation in path_item.items():
                if method == "parameters":
                    continue
                self.assertTrue(operation.get("security"), f"{method} {path}")

    def test_dashboard_response_is_a_typed_success_envelope(self):
        response = self.schema["paths"]["/api/v1/school-portal/dashboard"][
            "get"
        ]["responses"]["200"]
        schema = response["content"]["application/json"]["schema"]
        self.assertIn("SuccessResponse_SchoolPortalDashboardResponse_", schema["$ref"])


if __name__ == "__main__":
    unittest.main()
