import unittest
import uuid
from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.v1 import stats as stats_api
from app.deps import get_db
from app.helpers.jwt import create_access_token
from app.services.stats import PORTAL_STAT_CONTRACTS, portal_stats


class _CountResult:
    def __init__(self, value=0):
        self.value = value

    def scalar_one(self):
        return self.value


class _FakeDb:
    async def execute(self, _statement):
        return _CountResult()


class _AuthResult(_CountResult):
    def __init__(self, user):
        super().__init__()
        self.user = user

    def scalar_one_or_none(self):
        return self.user


class _AuthStatsDb:
    def __init__(self, user):
        self.user = user
        self.query_count = 0

    async def execute(self, _statement):
        self.query_count += 1
        if self.query_count == 1:
            return _AuthResult(self.user)
        return _CountResult()


def _user_with_scopes(*scopes: str):
    permissions = [
        SimpleNamespace(permission=SimpleNamespace(name=scope, is_active=True))
        for scope in scopes
    ]
    role = SimpleNamespace(is_active=True, role_permissions=permissions)
    return SimpleNamespace(
        id=uuid.uuid4(),
        is_active=True,
        deleted_at=None,
        role_assignments=[SimpleNamespace(is_active=True, role=role)],
        person=None,
    )


def _portal_stats_client(db) -> TestClient:
    app = FastAPI()
    app.include_router(stats_api.router, prefix="/api/v1/stats")

    async def _override_db():
        yield db

    app.dependency_overrides[get_db] = _override_db
    return TestClient(app)


class _WorkflowCountDb:
    def __init__(self):
        self.pending_tables = []

    async def execute(self, statement):
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
    async def test_corporate_communication_pending_review_counts_all_emitted_queue_states_and_club_content(self):
        db = _WorkflowCountDb()

        result = await portal_stats(db, "corporate-communication")

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
            "corporate-communication": {
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
        }

        for portal, keys in expected_keys.items():
            result = await portal_stats(_FakeDb(), portal)
            self.assertIsNotNone(result)
            self.assertEqual(keys, set(result.stats))

    def test_all_dashboard_portals_have_named_stats_contracts(self):
        expected = {
            "admin",
            "corporate-communication",
            "schools",
            "departments",
            "research",
            "library",
        }

        self.assertEqual(expected, set(PORTAL_STAT_CONTRACTS))
        for portal, keys in PORTAL_STAT_CONTRACTS.items():
            self.assertTrue(keys, portal)
            self.assertTrue(all(key.endswith("_count") for key in keys), portal)

    async def test_legacy_portal_stats_names_resolve_to_canonical_portals(self):
        result = await portal_stats(_FakeDb(), "cocms")

        self.assertIsNotNone(result)
        self.assertEqual("corporate-communication", result.portal)

    async def test_student_clubs_stats_are_not_a_standalone_portal_surface(self):
        result = await portal_stats(_FakeDb(), "student-clubs")

        self.assertIsNone(result)


class PortalStatsApiTests(unittest.TestCase):
    def test_portal_stats_permission_map_uses_canonical_main_service_keys(self):
        self.assertEqual(
            {"admin", "corporate-communication", "schools", "departments"},
            set(stats_api.PORTAL_STAT_SCOPES),
        )

    def test_corporate_communication_api_authorizes_canonical_portal_key(self):
        user = _user_with_scopes("content.view")
        db = _AuthStatsDb(user)
        token, _ = create_access_token(str(user.id), ["corporate-communication"], permissions=[])

        response = _portal_stats_client(db).get(
            "/api/v1/stats/portal/corporate-communication",
            headers={"Authorization": f"Bearer {token}"},
        )

        self.assertEqual(200, response.status_code)
        data = response.json()["data"]
        self.assertEqual("corporate-communication", data["portal"])
        self.assertEqual(
            {
                "pending_review_count",
                "published_count",
                "draft_count",
                "scheduled_count",
                "media_count",
            },
            set(data["stats"]),
        )


if __name__ == "__main__":
    unittest.main()
