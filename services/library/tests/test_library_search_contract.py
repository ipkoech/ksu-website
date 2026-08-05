import unittest

from app.services import search


class LibrarySearchContractTests(unittest.TestCase):
    def test_search_types_include_discovery_guides_workflows_and_content_types(self):
        expected = {
            "branch",
            "catalog",
            "database",
            "download",
            "external_link",
            "regulation",
            "service",
            "staff",
            "guide",
            "specialist",
            "workflow",
            "policy",
        }

        self.assertEqual(search.SEARCH_TYPES, expected)

    def test_public_url_helpers_map_discovery_results_to_public_pages(self):
        self.assertEqual(search._guide_url("research-skills"), "/guides/research-skills")
        self.assertEqual(search._workflow_url("borrowing_access", "borrowing-basics"), "/borrowing")
        self.assertEqual(search._workflow_url("remote_access", "off-campus"), "/remote-access")
        self.assertEqual(search._workflow_url("repository_deposit", "deposit"), "/repositories")
        self.assertEqual(search._workflow_url("digital_scholarship", "data"), "/digital-scholarship")
        self.assertEqual(search._workflow_url("other", "fallback"), "/guides/fallback")
        self.assertEqual(search._policy_url("loan-rules"), "/policies/loan-rules")

    def test_per_type_limit_uses_implemented_library_types(self):
        selected = search._selected_types(None)

        self.assertEqual(search._per_type_limit(selected, 40), 4)

    def test_public_parent_filter_requires_public_active_library(self):
        compiled = str(search._public_library_parent_filter(search.LibraryResource))

        self.assertIn("libraries.is_active IS true", compiled)
        self.assertIn("libraries.is_public IS true", compiled)
        self.assertIn("libraries.deleted_at IS NULL", compiled)

    def test_public_parent_filter_allows_global_records_when_requested(self):
        compiled = str(
            search._public_library_parent_filter(
                search.ElectronicResource,
                allow_global=True,
            )
        )

        self.assertIn("electronic_resources.library_id IS NULL", compiled)
        self.assertIn("libraries.is_public IS true", compiled)
