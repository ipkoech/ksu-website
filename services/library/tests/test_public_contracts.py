import unittest
from unittest.mock import patch

from app.main import create_app
from app.routes.v1 import engagement as engagement_routes
from app.routes.v1 import library as library_routes
from app.services import engagement as engagement_service
from app.services import library as library_service


class PublicLibraryContractTests(unittest.TestCase):
    def test_openapi_is_hidden_in_production(self):
        with patch.object(library_routes, "invalidate_prefix"):
            with patch("app.main.settings.APP_ENV", "production"):
                app = create_app()

        self.assertIsNone(app.openapi_url)
        self.assertIsNone(app.docs_url)
        self.assertIsNone(app.redoc_url)

    def test_public_branch_route_does_not_accept_public_only_override(self):
        self.assertNotIn("public_only", library_routes.list_libraries.__annotations__)

    def test_toggle_external_link_uses_schema_body(self):
        annotation = library_routes.toggle_external_link.__annotations__["body"]

        self.assertEqual(
            annotation if isinstance(annotation, str) else annotation.__name__,
            "LibraryExternalLinkToggle",
        )

    def test_public_library_query_filters_active_and_public(self):
        query = library_service.public_libraries_query()

        whereclause = str(query.whereclause)
        self.assertIn("libraries.is_active", whereclause)
        self.assertIn("libraries.is_public", whereclause)

    def test_public_regulations_query_filters_public_and_active_status(self):
        query = engagement_service.public_regulations_query()

        whereclause = str(query.whereclause)
        self.assertIn("library_regulations.is_public", whereclause)
        self.assertIn("library_regulations.status", whereclause)

    def test_mutations_invalidate_public_cache(self):
        self.assertTrue(hasattr(library_routes, "invalidate_public_library_cache"))
        self.assertTrue(hasattr(engagement_routes, "invalidate_public_library_cache"))


if __name__ == "__main__":
    unittest.main()
