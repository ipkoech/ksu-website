import unittest

from app.services.stats import PORTAL_STAT_CONTRACTS, portal_stats


class _CountResult:
    def __init__(self, value=0):
        self.value = value

    def scalar_one(self):
        return self.value


class _MappingResult:
    def __init__(self, value):
        self.value = value

    def mappings(self):
        return self

    def one(self):
        return self.value


class _PageSectionResult:
    def scalars(self):
        return self

    def all(self):
        return []


class _FakeDb:
    async def execute(self, statement):
        sql = str(statement).lower()
        if "draft_count" in sql:
            return _MappingResult({
                "draft_count": 0,
                "in_review_count": 0,
                "changes_requested_count": 0,
                "approved_count": 0,
                "scheduled_count": 0,
                "published_count": 0,
                "expired_count": 0,
            })
        if "spotlight_count" in sql:
            return _MappingResult({"spotlight_count": 0})
        if "select page_sections." in sql:
            return _PageSectionResult()
        return _CountResult()


class _WorkflowCountDb:
    def __init__(self):
        self.pending_tables = []

    async def execute(self, statement):
        sql = str(statement).lower()
        if "draft_count" in sql:
            return _MappingResult({
                "draft_count": 0,
                "in_review_count": 0,
                "changes_requested_count": 0,
                "approved_count": 0,
                "scheduled_count": 0,
                "published_count": 0,
                "expired_count": 0,
            })
        if "spotlight_count" in sql:
            return _MappingResult({"spotlight_count": 0})
        if "select page_sections." in sql:
            return _PageSectionResult()
        compiled = statement.compile()
        values = {
            value
            for parameter in compiled.params.values()
            for value in (parameter if isinstance(parameter, (list, tuple)) else [parameter])
        }
        if {"submitted", "in_review"}.issubset(values):
            self.pending_tables.append(str(statement).lower())
            return _CountResult(1)
        return _CountResult()


class PortalStatsTests(unittest.IsolatedAsyncioTestCase):
    async def test_cocms_pending_review_counts_all_emitted_queue_states_and_club_content(self):
        db = _WorkflowCountDb()

        result = await portal_stats(db, "cocms")

        self.assertEqual(9, result.stats["pending_review_count"])
        pending_sql = "\n".join(db.pending_tables)
        for table in (
            "news",
            "blogs",
            "events",
            "announcements",
            "club_activities",
            "media_links",
            "page_sections",
            "partnership_spotlights",
            "sliders",
        ):
            self.assertIn(table, pending_sql)
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
                "in_review_count",
                "changes_requested_count",
                "approved_count",
                "expired_count",
                "validation_blocker_count",
                "spotlight_count",
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
