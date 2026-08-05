import unittest
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.v1 import register_routes
from app.api.v1 import corporate_comm_engagement as module
from app.deps import get_db
from app.helpers.jwt import create_access_token

ENGAGEMENT_PATH = "/api/v1/stats/portal/corporate-communication/engagement"
SETTINGS_PATH = "/api/v1/corporate-communication-portal/settings"


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


class _Result:
    def __init__(self, *, user=None, one=None, rows=None, scalar=None):
        self._user = user
        self._one = one
        self._rows = rows if rows is not None else []
        self._scalar = scalar

    def scalar_one_or_none(self):
        return self._user if self._user is not None else self._scalar

    def one(self):
        return self._one

    def all(self):
        return self._rows


class _ScriptedDb:
    """Returns the auth user first, then the scripted results in order."""

    def __init__(self, user, results):
        self._results = [_Result(user=user), *results]
        self.executed = 0

    async def execute(self, _statement):
        result = self._results[min(self.executed, len(self._results) - 1)]
        self.executed += 1
        return result

    def add(self, _obj):
        pass

    async def flush(self):
        pass


def _client(db) -> TestClient:
    app = FastAPI()
    app.include_router(
        module.engagement_router,
        prefix="/api/v1/stats/portal/corporate-communication",
    )
    app.include_router(
        module.settings_router,
        prefix="/api/v1/corporate-communication-portal/settings",
    )

    async def _override_db():
        yield db

    app.dependency_overrides[get_db] = _override_db
    return TestClient(app)


def _auth_headers(user):
    token, _ = create_access_token(
        str(user.id), ["corporate-communication"], permissions=[]
    )
    return {"Authorization": f"Bearer {token}"}


class RouteRegistrationTests(unittest.TestCase):
    def test_engagement_and_settings_routes_are_registered(self):
        app = FastAPI()
        register_routes(app)
        paths = app.openapi()["paths"]

        self.assertIn(ENGAGEMENT_PATH, paths)
        self.assertIn("get", paths[ENGAGEMENT_PATH])
        self.assertIn(SETTINGS_PATH, paths)
        self.assertIn("get", paths[SETTINGS_PATH])
        self.assertIn("put", paths[SETTINGS_PATH])
        self.assertIn(f"{SETTINGS_PATH}/team", paths)

    def test_settings_nav_key_is_declared_with_known_capabilities(self):
        from app.services.corporate_portal_context import (
            CORPORATE_PORTAL_CAPABILITIES,
            CORPORATE_PORTAL_NAVIGATION,
        )

        nav = dict(CORPORATE_PORTAL_NAVIGATION)
        self.assertIn("settings", nav)
        for scope in nav["settings"]:
            self.assertIn(scope, CORPORATE_PORTAL_CAPABILITIES)


class EngagementStatsTests(unittest.TestCase):
    def test_engagement_requires_portal_scopes(self):
        user = _user_with_scopes("unrelated.permission")
        db = _ScriptedDb(user, [])

        response = _client(db).get(ENGAGEMENT_PATH, headers=_auth_headers(user))

        self.assertEqual(403, response.status_code)

    def test_engagement_rejects_inverted_date_range(self):
        user = _user_with_scopes("content.view")
        db = _ScriptedDb(user, [])

        response = _client(db).get(
            ENGAGEMENT_PATH,
            params={"date_from": "2026-08-04", "date_to": "2026-08-01"},
            headers=_auth_headers(user),
        )

        self.assertEqual(422, response.status_code)

    def test_engagement_payload_shape_and_delivery_bucketing(self):
        user = _user_with_scopes("content.view")
        news_id = uuid.uuid4()
        bucket_time = datetime(2026, 8, 1, tzinfo=timezone.utc)
        db = _ScriptedDb(
            user,
            [
                _Result(one=(120, 45)),
                _Result(rows=[("news", 80), ("page", 40)]),
                _Result(
                    rows=[
                        ("news", news_id, "Graduation 2026", "graduation-2026", "/news/graduation-2026", 60, 30),
                    ]
                ),
                _Result(rows=[(bucket_time, 120, 45)]),
                _Result(
                    rows=[
                        ("facebook", "posted", 3),
                        ("facebook", "failed", 1),
                        ("x", "draft", 2),
                    ]
                ),
            ],
        )

        response = _client(db).get(ENGAGEMENT_PATH, headers=_auth_headers(user))

        self.assertEqual(200, response.status_code)
        data = response.json()["data"]
        self.assertEqual(
            {"period", "website", "social", "social_insights_available", "note"},
            set(data),
        )
        self.assertFalse(data["social_insights_available"])
        self.assertFalse(data["social"]["social_insights_available"])
        self.assertIn("not platform impressions", data["social"]["note"])

        website = data["website"]
        self.assertEqual(120, website["page_views"])
        self.assertEqual(45, website["unique_visitors"])
        self.assertEqual(
            [{"key": "news", "label": "News", "views": 80},
             {"key": "page", "label": "Page", "views": 40}],
            website["views_by_type"],
        )
        self.assertEqual(1, len(website["top_content"]))
        top = website["top_content"][0]
        self.assertEqual(str(news_id), top["entity_id"])
        self.assertEqual("Graduation 2026", top["title"])
        self.assertEqual(60, top["views"])
        self.assertEqual(1, len(website["trend"]))
        self.assertEqual(120, website["trend"][0]["views"])

        social = data["social"]
        self.assertEqual(
            {"posted": 3, "failed": 1, "pending": 2, "total": 6},
            social["totals"],
        )
        platforms = {row["platform"]: row for row in social["by_platform"]}
        self.assertEqual({"facebook", "x"}, set(platforms))
        self.assertEqual(3, platforms["facebook"]["posted"])
        self.assertEqual(1, platforms["facebook"]["failed"])
        # draft deliveries surface as pending, never as impressions
        self.assertEqual(2, platforms["x"]["pending"])


class SettingsEndpointTests(unittest.TestCase):
    def test_get_settings_returns_namespaced_values(self):
        user = _user_with_scopes("content.view")
        office = SimpleNamespace(
            value={
                "email": "comms@kisiiuniversity.ac.ke",
                "phone": "+254720000000",
                "physical_office": "Admin Block, 2nd Floor",
                "service_hours": "Mon-Fri 8am-5pm",
                "escalation_contact": "Director, Corporate Communication",
            }
        )
        social = SimpleNamespace(
            value={"facebook": "https://facebook.com/kisiiuniversity"}
        )
        db = _ScriptedDb(user, [_Result(scalar=office), _Result(scalar=social)])

        response = _client(db).get(SETTINGS_PATH, headers=_auth_headers(user))

        self.assertEqual(200, response.status_code)
        data = response.json()["data"]
        self.assertEqual(
            "comms@kisiiuniversity.ac.ke", data["office_channels"]["email"]
        )
        self.assertEqual(
            "https://facebook.com/kisiiuniversity",
            data["social_links"]["facebook"],
        )
        self.assertFalse(data["can_manage"])

    def test_put_settings_requires_manage_scope(self):
        user = _user_with_scopes("content.view")
        db = _ScriptedDb(user, [])

        response = _client(db).put(
            SETTINGS_PATH,
            json={"office_channels": {"email": "comms@example.test"}},
            headers=_auth_headers(user),
        )

        self.assertEqual(403, response.status_code)

    def test_put_settings_rejects_empty_payload(self):
        user = _user_with_scopes("homepage.manage")
        db = _ScriptedDb(user, [])

        response = _client(db).put(
            SETTINGS_PATH, json={}, headers=_auth_headers(user)
        )

        self.assertEqual(422, response.status_code)

    def test_put_settings_upserts_both_namespaced_keys(self):
        user = _user_with_scopes("homepage.manage")
        db = _ScriptedDb(user, [])
        stored: dict[str, SimpleNamespace] = {}

        async def _get_by_key(_db, key, **_kwargs):
            return stored.get(key)

        async def _create(_db, *, updated_by_id=None, **data):
            item = SimpleNamespace(updated_by_id=updated_by_id, **data)
            stored[data["key"]] = item
            return item

        with (
            patch.object(module.SettingService, "get_by_key", side_effect=_get_by_key),
            patch.object(module.SettingService, "create", side_effect=_create) as create_mock,
            patch.object(module.SettingService, "update", new=AsyncMock()) as update_mock,
        ):
            response = _client(db).put(
                SETTINGS_PATH,
                json={
                    "office_channels": {"email": "comms@kisiiuniversity.ac.ke"},
                    "social_links": {"twitter": "https://x.com/kisiiuniversity"},
                },
                headers=_auth_headers(user),
            )

        self.assertEqual(200, response.status_code)
        self.assertEqual(2, create_mock.call_count)
        update_mock.assert_not_called()
        self.assertEqual(
            {module.OFFICE_CHANNELS_KEY, module.SOCIAL_LINKS_KEY}, set(stored)
        )
        for item in stored.values():
            self.assertEqual(module.SETTINGS_CATEGORY, item.category)
            self.assertTrue(item.is_public)
        data = response.json()["data"]
        self.assertEqual(
            "comms@kisiiuniversity.ac.ke", data["office_channels"]["email"]
        )
        self.assertEqual(
            "https://x.com/kisiiuniversity", data["social_links"]["twitter"]
        )

    def test_put_settings_rejects_unknown_fields(self):
        user = _user_with_scopes("homepage.manage")
        db = _ScriptedDb(user, [])

        response = _client(db).put(
            SETTINGS_PATH,
            json={"office_channels": {"unexpected": "value"}},
            headers=_auth_headers(user),
        )

        self.assertEqual(422, response.status_code)


class TeamEndpointTests(unittest.TestCase):
    def test_team_lists_users_with_corporate_roles(self):
        user = _user_with_scopes("content.view")
        member_id = uuid.uuid4()
        last_login = datetime(2026, 8, 1, 9, 0, tzinfo=timezone.utc)
        db = _ScriptedDb(
            user,
            [
                _Result(
                    rows=[
                        (member_id, "Jane Comms", "jane@ksu.test", last_login, "comms_editor", "Comms Editor"),
                        (member_id, "Jane Comms", "jane@ksu.test", last_login, "comms_reviewer", None),
                    ]
                )
            ],
        )

        response = _client(db).get(
            f"{SETTINGS_PATH}/team", headers=_auth_headers(user)
        )

        self.assertEqual(200, response.status_code)
        members = response.json()["data"]["members"]
        self.assertEqual(1, len(members))
        member = members[0]
        self.assertEqual(str(member_id), member["id"])
        self.assertEqual(["Comms Editor", "comms_reviewer"], member["roles"])
        self.assertEqual(last_login.isoformat(), member["last_login_at"])

    def test_team_requires_portal_scopes(self):
        user = _user_with_scopes("unrelated.permission")
        db = _ScriptedDb(user, [])

        response = _client(db).get(
            f"{SETTINGS_PATH}/team", headers=_auth_headers(user)
        )

        self.assertEqual(403, response.status_code)


if __name__ == "__main__":
    unittest.main()
