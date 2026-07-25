import unittest

from fastapi import FastAPI

from app.api.v1 import register_routes


class SchoolPortalJourneyContractTests(unittest.TestCase):
    def test_operational_journey_has_an_http_contract_for_every_step(self):
        app = FastAPI()
        register_routes(app)
        paths = app.openapi()["paths"]
        journey = (
            ("/api/v1/auth/login", "post"),
            ("/api/v1/school-portal/context", "get"),
            ("/api/v1/school-portal/profile", "patch"),
            ("/api/v1/school-portal/team", "post"),
            ("/api/v1/school-portal/departments", "post"),
            ("/api/v1/school-portal/programmes", "post"),
            ("/api/v1/school-portal/content", "post"),
            (
                "/api/v1/school-portal/content/{content_type}/{content_id}/submit",
                "post",
            ),
            ("/api/v1/content-workflow/queue", "get"),
            ("/api/v1/notifications/unread-count", "get"),
            (
                "/api/v1/school-portal/inquiries/{inquiry_id}/replies",
                "post",
            ),
            ("/api/v1/school-portal/dashboard", "get"),
        )
        for path, method in journey:
            with self.subTest(path=path, method=method):
                self.assertIn(path, paths)
                self.assertIn(method, paths[path])


if __name__ == "__main__":
    unittest.main()
