import unittest

from app.services import guides


class LibraryGuidesServiceTests(unittest.TestCase):
    def test_public_guides_query_requires_public_active_records(self):
        query = guides.public_guides_query()
        whereclause = str(query.whereclause)

        self.assertIn("library_guides.is_public", whereclause)
        self.assertIn("library_guides.is_active", whereclause)

    def test_public_workflows_query_requires_public_active_records(self):
        query = guides.public_workflows_query()
        whereclause = str(query.whereclause)

        self.assertIn("library_workflows.is_public", whereclause)
        self.assertIn("library_workflows.is_active", whereclause)

    def test_public_policy_pages_query_requires_public_published_records(self):
        query = guides.public_policy_pages_query()
        whereclause = str(query.whereclause)

        self.assertIn("library_policy_pages.is_public", whereclause)
        self.assertIn("library_policy_pages.status", whereclause)
