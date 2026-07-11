from __future__ import annotations

import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient

from app.api.v1 import page_cms
from app.deps import get_db
from app.helpers.jwt import create_access_token
from app.models import PageSection
from app.schemas import PageSectionCreate, PageSectionUpdate
from ksu_common import PaginatedResult


class _ScalarResult:
    def __init__(self, user):
        self._user = user

    def scalar_one_or_none(self):
        return self._user


class _AuthDb:
    def __init__(self, user):
        self._user = user

    async def execute(self, _statement):
        return _ScalarResult(self._user)

    async def flush(self):
        return None

    async def refresh(self, _record):
        return None

    def add(self, _record):
        return None


def _permission(name: str):
    return SimpleNamespace(name=name, is_active=True)


def _role(name: str, permissions: list[str]):
    return SimpleNamespace(
        name=name,
        is_active=True,
        role_permissions=[
            SimpleNamespace(permission=_permission(permission_name))
            for permission_name in permissions
        ],
    )


def _role_assignment(*permissions: str):
    return SimpleNamespace(
        is_active=True,
        role=_role("page-editor", list(permissions)),
        scope_type=None,
        scope_id=None,
    )


def _user(*permissions: str):
    return SimpleNamespace(
        id=uuid.uuid4(),
        is_active=True,
        deleted_at=None,
        role_assignments=[_role_assignment(*permissions)] if permissions else [],
        person=None,
    )


def _bearer_for(user_id: uuid.UUID) -> dict[str, str]:
    token, _ = create_access_token(str(user_id), ["page-editor"], permissions=[])
    return {"Authorization": f"Bearer {token}"}


def _build_test_app(db) -> TestClient:
    app = FastAPI()
    app.include_router(page_cms.router, prefix="/api/v1")

    async def _override_db():
        yield db

    app.dependency_overrides[get_db] = _override_db
    return TestClient(app)


class PageCmsApiTests(unittest.IsolatedAsyncioTestCase):
    def test_admin_requests_require_authentication(self):
        client = _build_test_app(_AuthDb(_user()))

        response = client.post(
            "/api/v1/page-sections",
            json={
                "page_key": "homepage",
                "scope_type": "university",
                "section_key": "hero",
                "layout_variant": "hero_admissions",
            },
        )

        self.assertEqual(401, response.status_code)

    def test_authenticated_user_without_scope_gets_forbidden(self):
        user = _user()
        client = _build_test_app(_AuthDb(user))

        response = client.post(
            "/api/v1/page-sections",
            json={
                "page_key": "homepage",
                "scope_type": "university",
                "section_key": "hero",
                "layout_variant": "hero_admissions",
            },
            headers=_bearer_for(user.id),
        )

        self.assertEqual(403, response.status_code)

    def test_admin_listing_requires_page_cms_permission_before_query(self):
        user = _user()
        client = _build_test_app(_AuthDb(user))
        list_admin = AsyncMock(return_value=SimpleNamespace(items=[], meta={"total": 0}))

        with patch.object(page_cms.PageSectionService, "list_admin", list_admin):
            response = client.get(
                "/api/v1/page-sections/admin",
                headers=_bearer_for(user.id),
            )

        self.assertEqual(403, response.status_code)
        self.assertEqual(0, list_admin.await_count)

    def test_create_section_item_route_is_not_shadowed_by_workflow_action(self):
        user = _user("section_items.manage")
        client = _build_test_app(_AuthDb(user))
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="draft",
        )
        section.id = uuid.uuid4()

        async def fake_can_access(_db, _user, permission, _scope_type, _scope_id):
            return permission == "section_items.manage"

        workflow_transition = AsyncMock(side_effect=AssertionError("workflow route should not handle /items"))

        with (
            patch.object(page_cms.PageSection, "get_by_id", AsyncMock(return_value=section)),
            patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access),
            patch.object(page_cms.PageSectionWorkflowService, "transition", workflow_transition),
        ):
            response = client.post(
                f"/api/v1/page-sections/{section.id}/items",
                json={"item_type": "text", "title": "Hero card"},
                headers=_bearer_for(user.id),
            )

        self.assertEqual(201, response.status_code)
        self.assertEqual(0, workflow_transition.await_count)

    async def test_create_page_section_accepts_manage_permission_and_starts_in_draft(self):
        user = _user("page_sections.manage")
        db = _AuthDb(user)
        payload = PageSectionCreate(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            title="Homepage Hero",
        )

        async def fake_can_access(_db, _user, permission, _scope_type, _scope_id):
            return permission == "page_sections.manage"

        with patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access):
            response = await page_cms.create_page_section(payload, db=db, user=user)

        self.assertEqual("success", response["status"])
        self.assertEqual("draft", response["data"].status)
        self.assertEqual(user.id, response["data"].created_by_id)
        self.assertEqual(user.id, response["data"].updated_by_id)

    async def test_review_permission_can_approve_section(self):
        user = _user("page_sections.review")
        db = _AuthDb(user)
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="in_review",
        )
        section.id = uuid.uuid4()

        async def fake_can_access(_db, _user, permission, _scope_type, _scope_id):
            return permission == "page_sections.review"

        with (
            patch.object(page_cms.PageSection, "get_by_id", AsyncMock(return_value=section)),
            patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access),
        ):
            response = await page_cms.run_page_section_workflow_action(
                section.id,
                "approve",
                db=db,
                user=user,
            )

        self.assertEqual("approved", response["data"].status)
        self.assertEqual(user.id, response["data"].approved_by_id)

    async def test_publish_permission_can_publish_section(self):
        user = _user("page_sections.publish")
        db = _AuthDb(user)
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="approved",
        )

        async def fake_can_access(_db, _user, permission, _scope_type, _scope_id):
            return permission == "page_sections.publish"

        with (
            patch.object(page_cms.PageSection, "get_by_id", AsyncMock(return_value=section)),
            patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access),
        ):
            response = await page_cms.run_page_section_workflow_action(
                section.id,
                "publish",
                db=db,
                user=user,
            )

        self.assertEqual("published", response["data"].status)
        self.assertEqual(user.id, response["data"].published_by_id)

    async def test_review_permission_can_list_visible_sections_without_view_permission(self):
        user = _user("page_sections.review")
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="in_review",
        )

        async def fake_can_access(_db, _user, permission, _scope_type, _scope_id):
            return permission == "page_sections.review"

        async def fake_list_admin_authorized(_db, **kwargs):
            self.assertTrue(await kwargs["is_visible"](section))
            return PaginatedResult(
                items=[section],
                meta={"page": 1, "per_page": 20, "total": 1, "pages": 1},
            )

        with (
            patch.object(page_cms.PageSectionService, "list_admin_authorized", side_effect=fake_list_admin_authorized),
            patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access),
        ):
            response = await page_cms.list_admin_page_sections(
                db=_AuthDb(user),
                user=user,
            )

        self.assertEqual([section.id], [item.id for item in response["data"]])
        self.assertEqual(1, response["meta"]["total"])

    async def test_homepage_publish_permission_can_publish_homepage_section(self):
        user = _user("homepage.publish")
        db = _AuthDb(user)
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="approved",
        )

        async def fake_can_access(_db, _user, permission, _scope_type, _scope_id):
            return permission == "homepage.publish"

        with (
            patch.object(page_cms.PageSection, "get_by_id", AsyncMock(return_value=section)),
            patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access),
        ):
            response = await page_cms.run_page_section_workflow_action(
                section.id,
                "publish",
                db=db,
                user=user,
            )

        self.assertEqual("published", response["data"].status)
        self.assertEqual(user.id, response["data"].published_by_id)

    async def test_homepage_publish_permission_lists_only_homepage_sections_it_can_publish(self):
        user = _user("homepage.publish")
        allowed = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="approved",
        )
        allowed.id = uuid.uuid4()
        disallowed = PageSection(
            page_key="research",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="approved",
        )
        disallowed.id = uuid.uuid4()

        async def fake_can_access(_db, _user, permission, _scope_type, _scope_id):
            return permission == "homepage.publish"

        async def fake_list_admin_authorized(_db, **kwargs):
            self.assertTrue(await kwargs["is_visible"](allowed))
            self.assertFalse(await kwargs["is_visible"](disallowed))
            return PaginatedResult(
                items=[allowed],
                meta={"page": 1, "per_page": 20, "total": 1, "pages": 1},
            )

        with (
            patch.object(page_cms.PageSectionService, "list_admin_authorized", side_effect=fake_list_admin_authorized),
            patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access),
        ):
            response = await page_cms.list_admin_page_sections(
                db=_AuthDb(user),
                user=user,
            )

        self.assertEqual([allowed.id], [item.id for item in response["data"]])

    async def test_homepage_publish_permission_cannot_publish_non_homepage_section(self):
        user = _user("homepage.publish")
        section = PageSection(
            page_key="research",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="approved",
        )

        async def fake_can_access(_db, _user, permission, _scope_type, _scope_id):
            return permission == "homepage.publish"

        with (
            patch.object(page_cms.PageSection, "get_by_id", AsyncMock(return_value=section)),
            patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access),
        ):
            with self.assertRaises(HTTPException) as context:
                await page_cms.run_page_section_workflow_action(
                    section.id,
                    "publish",
                    db=_AuthDb(user),
                    user=user,
                )

        self.assertEqual(403, context.exception.status_code)

    async def test_homepage_publish_permission_cannot_unpublish_non_homepage_section(self):
        user = _user("homepage.publish")
        section = PageSection(
            page_key="research",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="published",
        )

        async def fake_can_access(_db, _user, permission, _scope_type, _scope_id):
            return permission == "homepage.publish"

        with (
            patch.object(page_cms.PageSection, "get_by_id", AsyncMock(return_value=section)),
            patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access),
        ):
            with self.assertRaises(HTTPException) as context:
                await page_cms.run_page_section_workflow_action(
                    section.id,
                    "unpublish",
                    db=_AuthDb(user),
                    user=user,
                )

        self.assertEqual(403, context.exception.status_code)

    async def test_public_homepage_alias_returns_public_composition(self):
        composition = {
            "page_key": "homepage",
            "scope_type": "university",
            "scope_id": None,
            "sections": [
                {
                    "id": uuid.uuid4(),
                    "page_key": "homepage",
                    "scope_type": "university",
                    "scope_id": None,
                    "section_key": "hero",
                    "title": "Homepage Hero",
                    "display_order": 10,
                    "is_enabled": True,
                    "layout_variant": "hero_admissions",
                    "status": "published",
                    "items": [],
                }
            ],
            "partnership_spotlights": [],
        }

        with patch.object(page_cms.HomepageCompositionService, "compose", AsyncMock(return_value=composition)):
            response = await page_cms.get_homepage(db=None)

        self.assertEqual("success", response["status"])
        self.assertEqual(["hero"], [section["section_key"] for section in response["data"]["sections"]])
        self.assertEqual(["published"], [section["status"] for section in response["data"]["sections"]])

    async def test_school_scoped_update_requires_scope_access(self):
        own_school_id = uuid.uuid4()
        other_school_id = uuid.uuid4()
        user = _user("page_sections.update")
        item = PageSection(
            page_key="homepage",
            scope_type="school",
            scope_id=own_school_id,
            section_key="hero",
            layout_variant="hero_admissions",
            status="draft",
        )
        payload = PageSectionUpdate(scope_type="school", scope_id=other_school_id)

        async def fake_can_access(_db, _user, permission, _scope_type, scope_id):
            return permission == "page_sections.update" and scope_id == own_school_id

        with (
            patch.object(page_cms.PageSection, "get_by_id", AsyncMock(return_value=item)),
            patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access),
        ):
            with self.assertRaises(HTTPException) as context:
                await page_cms.update_page_section(item.id, payload, db=_AuthDb(user), user=user)

        self.assertEqual(403, context.exception.status_code)


if __name__ == "__main__":
    unittest.main()
