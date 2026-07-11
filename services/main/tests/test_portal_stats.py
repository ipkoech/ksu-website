import unittest

from app.services.stats import PORTAL_STAT_CONTRACTS, portal_stats


class _CountResult:
    def scalar_one(self):
        return 0


class _FakeDb:
    async def execute(self, _statement):
        return _CountResult()


class PortalStatsTests(unittest.IsolatedAsyncioTestCase):
    async def test_main_portal_stats_expose_exact_dashboard_values(self):
        expected_keys = {
            "admin": {
                "boards_count",
                "divisions_count",
                "offices_count",
                "staff_assignments_count",
                "documents_count",
            },
            "cocms": {
                "pending_review_count",
                "published_count",
                "draft_count",
                "scheduled_count",
                "media_count",
            },
            "schools": {"schools_count", "programmes_count", "departments_count"},
            "departments": {
                "departments_count",
                "programmes_count",
                "unpublished_count",
            },
            "student-clubs": {"active_clubs_count", "active_members_count"},
        }

        for portal, keys in expected_keys.items():
            result = await portal_stats(_FakeDb(), portal)
            self.assertIsNotNone(result)
            self.assertEqual(keys, set(result.stats))

    def test_all_dashboard_portals_have_named_stats_contracts(self):
        expected = {
            "admin",
            "cocms",
            "schools",
            "departments",
            "student-clubs",
            "research",
            "library",
            "publications",
        }

        self.assertEqual(expected, set(PORTAL_STAT_CONTRACTS))
        for portal, keys in PORTAL_STAT_CONTRACTS.items():
            self.assertTrue(keys, portal)
            self.assertTrue(all(key.endswith("_count") for key in keys), portal)


if __name__ == "__main__":
    unittest.main()
