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
from app.models import PageSection, PartnershipSpotlight, SectionItem
from app.schemas import PageSectionCreate, PageSectionUpdate, SectionItemUpdate
from ksu_common import PaginatedResult


class _ScalarResult:
    def __init__(self, user):
        self._user = user

    def scalar_one_or_none(self):
        return self._user


class _AuthDb:
    def __init__(self, user):
        self._user = user
        self.added = []

    async def execute(self, _statement):
        return _ScalarResult(self._user)

    async def flush(self):
        return None

    async def refresh(self, _record):
        return None

    def add(self, record):
        self.added.append(record)


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
    async def test_editing_published_section_resets_it_to_draft(self):
        user = _user("page_sections.update")
        db = _AuthDb(user)
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="published",
            workflow_status="published",
        )
        section.id = uuid.uuid4()

        with (
            patch.object(page_cms.PageSection, "get_by_id", AsyncMock(return_value=section)),
            patch("app.api.v1._scoped._can_access_scope", return_value=True),
        ):
            response = await page_cms.update_page_section(
                section.id,
                PageSectionUpdate(title="Revised hero"),
                db=db,
                user=user,
            )

        self.assertEqual("draft", response["data"].status)
        self.assertEqual("draft", response["data"].workflow_status)
        self.assertEqual("edit_reset", db.added[0].action)

    async def test_page_section_transition_adds_workflow_log(self):
        user = _user("page_sections.review")
        db = _AuthDb(user)
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="in_review",
            workflow_status="in_review",
        )
        section.id = uuid.uuid4()

        with (
            patch.object(page_cms.PageSection, "get_by_id", AsyncMock(return_value=section)),
            patch("app.api.v1._scoped._can_access_scope", return_value=True),
        ):
            await page_cms.run_page_section_workflow_action(
                section.id, "approve", db=db, user=user,
            )

        self.assertEqual(1, len(db.added))
        self.assertEqual("page-sections", db.added[0].content_type)
        self.assertEqual("approve", db.added[0].action)

    async def test_spotlight_transition_adds_workflow_log(self):
        user = _user("partnership_spotlights.manage")
        db = _AuthDb(user)
        spotlight = PartnershipSpotlight(
            source_type="research_partner",
            source_id=uuid.uuid4(),
            headline="Research partnership",
            status="draft",
            workflow_status="draft",
        )
        spotlight.id = uuid.uuid4()

        with patch.object(
            page_cms, "_get_partnership_spotlight_or_404", AsyncMock(return_value=spotlight),
        ):
            await page_cms.run_partnership_spotlight_workflow_action(
                spotlight.id, "submit", db=db, user=user,
            )

        self.assertEqual(1, len(db.added))
        self.assertEqual("partnership-spotlights", db.added[0].content_type)
        self.assertEqual("submit", db.added[0].action)

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

    def test_admin_listing_requires_page_cms_permission_before_authorized_query(self):
        user = _user()
        client = _build_test_app(_AuthDb(user))
        list_admin_authorized = AsyncMock(return_value=SimpleNamespace(items=[], meta={"total": 0}))

        with patch.object(page_cms.PageSectionService, "list_admin_authorized", list_admin_authorized):
            response = client.get(
                "/api/v1/page-sections/admin",
                headers=_bearer_for(user.id),
            )

        self.assertEqual(403, response.status_code)
        self.assertEqual(0, list_admin_authorized.await_count)

    def test_section_definitions_require_page_cms_permission(self):
        user = _user()
        client = _build_test_app(_AuthDb(user))

        response = client.get(
            "/api/v1/page-section-definitions",
            headers=_bearer_for(user.id),
        )

        self.assertEqual(403, response.status_code)

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

    async def test_update_section_item_rejects_reference_to_text_without_clearing_source(self):
        user = _user("section_items.manage")
        db = _AuthDb(user)
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="draft",
        )
        section.id = uuid.uuid4()
        item = SectionItem(
            page_section_id=section.id,
            item_type="reference",
            source_type="news",
            source_id=uuid.uuid4(),
        )
        item.id = uuid.uuid4()
        reset = AsyncMock()

        with (
            patch.object(page_cms, "_get_section_item_or_404", AsyncMock(return_value=item)),
            patch.object(page_cms, "_get_page_section_or_404", AsyncMock(return_value=section)),
            patch.object(page_cms, "_require_page_section_access", AsyncMock()),
            patch.object(page_cms.ContentWorkflowService, "reset_after_authoring_edit", reset),
        ):
            with self.assertRaises(HTTPException) as context:
                await page_cms.update_section_item(
                    item.id,
                    SectionItemUpdate(item_type="text"),
                    db=db,
                    user=user,
                )

        self.assertEqual(422, context.exception.status_code)
        reset.assert_not_awaited()
        self.assertEqual("reference", item.item_type)

    async def test_update_section_item_rejects_manual_source_without_reference_type(self):
        user = _user("section_items.manage")
        db = _AuthDb(user)
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="draft",
        )
        section.id = uuid.uuid4()
        item = SectionItem(page_section_id=section.id, item_type="text", title="Manual item")
        item.id = uuid.uuid4()
        reset = AsyncMock()

        with (
            patch.object(page_cms, "_get_section_item_or_404", AsyncMock(return_value=item)),
            patch.object(page_cms, "_get_page_section_or_404", AsyncMock(return_value=section)),
            patch.object(page_cms, "_require_page_section_access", AsyncMock()),
            patch.object(page_cms.ContentWorkflowService, "reset_after_authoring_edit", reset),
        ):
            with self.assertRaises(HTTPException) as context:
                await page_cms.update_section_item(
                    item.id,
                    SectionItemUpdate(source_type="news", source_id=uuid.uuid4()),
                    db=db,
                    user=user,
                )

        self.assertEqual(422, context.exception.status_code)
        reset.assert_not_awaited()
        self.assertIsNone(item.source_type)

    async def test_update_section_item_can_atomically_convert_manual_to_reference(self):
        user = _user("section_items.manage")
        db = _AuthDb(user)
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="draft",
        )
        section.id = uuid.uuid4()
        item = SectionItem(
            page_section_id=section.id,
            item_type="text",
            title="Manual title",
            body_text="Manual body",
            content={"body": "Manual content"},
        )
        item.id = uuid.uuid4()
        reset = AsyncMock()
        source_id = uuid.uuid4()
        update = SectionItemUpdate(
            item_type="reference",
            title=None,
            subtitle=None,
            body_text=None,
            content=None,
            cta_label=None,
            cta_url=None,
            cta_description=None,
            media_caption=None,
            media_alt_text=None,
            video_provider=None,
            video_url=None,
            video_duration_seconds=None,
            source_type="news",
            source_id=source_id,
            editorial_overrides={"title": "Curated title"},
        )

        with (
            patch.object(page_cms, "_get_section_item_or_404", AsyncMock(return_value=item)),
            patch.object(page_cms, "_get_page_section_or_404", AsyncMock(return_value=section)),
            patch.object(page_cms, "_require_page_section_access", AsyncMock()),
            patch.object(page_cms.ContentWorkflowService, "reset_after_authoring_edit", reset),
        ):
            await page_cms.update_section_item(item.id, update, db=db, user=user)

        self.assertEqual("reference", item.item_type)
        self.assertEqual("news", item.source_type)
        self.assertEqual(source_id, item.source_id)
        self.assertIsNone(item.title)
        self.assertEqual({"title": "Curated title"}, item.editorial_overrides)
        reset.assert_awaited_once()

    async def test_update_section_item_can_atomically_convert_reference_to_manual(self):
        user = _user("section_items.manage")
        db = _AuthDb(user)
        section = PageSection(
            page_key="homepage",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="draft",
        )
        section.id = uuid.uuid4()
        item = SectionItem(
            page_section_id=section.id,
            item_type="reference",
            source_type="news",
            source_id=uuid.uuid4(),
        )
        item.id = uuid.uuid4()
        reset = AsyncMock()

        with (
            patch.object(page_cms, "_get_section_item_or_404", AsyncMock(return_value=item)),
            patch.object(page_cms, "_get_page_section_or_404", AsyncMock(return_value=section)),
            patch.object(page_cms, "_require_page_section_access", AsyncMock()),
            patch.object(page_cms.ContentWorkflowService, "reset_after_authoring_edit", reset),
        ):
            await page_cms.update_section_item(
                item.id,
                SectionItemUpdate(item_type="text", source_type=None, source_id=None, title="Manual title"),
                db=db,
                user=user,
            )

        self.assertEqual("text", item.item_type)
        self.assertIsNone(item.source_type)
        self.assertIsNone(item.source_id)
        self.assertEqual("Manual title", item.title)
        reset.assert_awaited_once()

    def test_section_detail_route_returns_single_admin_record(self):
        user = _user("page_sections.view")
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
            return permission == "page_sections.view"

        with (
            patch.object(page_cms.PageSection, "get_by_id", AsyncMock(return_value=section)),
            patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access),
        ):
            response = client.get(
                f"/api/v1/page-sections/{section.id}",
                headers=_bearer_for(user.id),
            )

        self.assertEqual(200, response.status_code)
        self.assertEqual(str(section.id), response.json()["data"]["id"])

    def test_spotlight_admin_routes_return_admin_records(self):
        user = _user("partnership_spotlights.manage")
        client = _build_test_app(_AuthDb(user))
        spotlight = PartnershipSpotlight(
            source_type="research_partner",
            source_id=uuid.uuid4(),
            primary_cta_source="manual",
            headline="Draft spotlight",
            status="draft",
            is_enabled=False,
        )
        spotlight.id = uuid.uuid4()

        list_admin = AsyncMock(
            return_value=PaginatedResult(
                items=[spotlight],
                meta={"page": 1, "per_page": 20, "total": 1, "pages": 1},
            )
        )

        with (
            patch.object(page_cms, "_get_partnership_spotlight_or_404", AsyncMock(return_value=spotlight)),
            patch.object(
                page_cms,
                "PartnershipSpotlightService",
                SimpleNamespace(list_admin=list_admin),
                create=True,
            ),
        ):
            list_response = client.get(
                "/api/v1/partnership-spotlights/admin",
                headers=_bearer_for(user.id),
            )
            detail_response = client.get(
                f"/api/v1/partnership-spotlights/{spotlight.id}",
                headers=_bearer_for(user.id),
            )

        self.assertEqual(200, list_response.status_code)
        self.assertEqual([str(spotlight.id)], [item["id"] for item in list_response.json()["data"]])
        self.assertEqual(200, detail_response.status_code)
        self.assertEqual("draft", detail_response.json()["data"]["status"])
        self.assertFalse(detail_response.json()["data"]["is_enabled"])

    async def test_partnership_spotlight_workflow_uses_manage_permission(self):
        user = _user("partnership_spotlights.manage")
        spotlight = PartnershipSpotlight(
            source_type="research_partner",
            source_id=uuid.uuid4(),
            primary_cta_source="manual",
            headline="Draft spotlight",
            status="draft",
        )
        spotlight.id = uuid.uuid4()
        transition = AsyncMock(return_value=spotlight)
        db = _AuthDb(user)

        with (
            patch.object(page_cms, "_get_partnership_spotlight_or_404", AsyncMock(return_value=spotlight)),
            patch.object(page_cms.PartnershipSpotlightWorkflowService, "transition", transition),
        ):
            response = await page_cms.run_partnership_spotlight_workflow_action(
                spotlight.id,
                "submit",
                db=db,
                user=user,
            )

        self.assertEqual("success", response["status"])
        transition.assert_awaited_once_with(spotlight, "submit", user.id, db=db)

    async def test_partnership_spotlight_author_cannot_publish(self):
        user = _user("partnership_spotlights.manage")
        spotlight = PartnershipSpotlight(
            source_type="research_partner",
            source_id=uuid.uuid4(),
            primary_cta_source="manual",
            headline="Draft spotlight",
            status="draft",
        )
        spotlight.id = uuid.uuid4()

        with (
            patch.object(page_cms, "_get_partnership_spotlight_or_404", AsyncMock(return_value=spotlight)),
        ):
            with self.assertRaises(HTTPException) as context:
                await page_cms.run_partnership_spotlight_workflow_action(
                    spotlight.id,
                    "publish",
                    db=_AuthDb(user),
                    user=user,
                )

        self.assertEqual(403, context.exception.status_code)

    async def test_partnership_spotlight_publish_uses_cocms_publish_permission(self):
        user = _user("content.publish")
        spotlight = PartnershipSpotlight(
            source_type="research_partner",
            source_id=uuid.uuid4(),
            primary_cta_source="manual",
            headline="Approved spotlight",
            status="approved",
            workflow_status="approved",
        )
        spotlight.id = uuid.uuid4()
        transition = AsyncMock(return_value=spotlight)
        db = _AuthDb(user)

        with (
            patch.object(page_cms, "_get_partnership_spotlight_or_404", AsyncMock(return_value=spotlight)),
            patch.object(page_cms.PartnershipSpotlightWorkflowService, "transition", transition),
        ):
            response = await page_cms.run_partnership_spotlight_workflow_action(
                spotlight.id,
                "publish",
                db=db,
                user=user,
            )

        self.assertEqual("success", response["status"])
        transition.assert_awaited_once_with(spotlight, "publish", user.id, db=db)

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

    async def test_review_permission_row_visibility_is_limited_to_in_review_sections(self):
        user = _user("page_sections.review")
        cases = (
            ("homepage", "in_review", True),
            ("homepage", "approved", False),
            ("research", "in_review", True),
            ("research", "published", False),
        )

        async def fake_can_access(_db, _user, permission, _scope_type, _scope_id):
            return permission == "page_sections.review"

        with patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access):
            for page_key, status, expected in cases:
                with self.subTest(page_key=page_key, status=status):
                    section = PageSection(
                        page_key=page_key,
                        scope_type="university",
                        section_key="hero",
                        layout_variant="hero_admissions",
                        status=status,
                    )

                    visible = await page_cms._can_access_page_section_admin_row(_AuthDb(user), user, section)

                    self.assertEqual(expected, visible)

    async def test_publish_permission_row_visibility_is_limited_to_publishable_statuses(self):
        user = _user("page_sections.publish")
        cases = (
            ("homepage", "approved", True),
            ("homepage", "published", True),
            ("homepage", "in_review", False),
            ("research", "approved", True),
            ("research", "published", True),
            ("research", "draft", False),
        )

        async def fake_can_access(_db, _user, permission, _scope_type, _scope_id):
            return permission == "page_sections.publish"

        with patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access):
            for page_key, status, expected in cases:
                with self.subTest(page_key=page_key, status=status):
                    section = PageSection(
                        page_key=page_key,
                        scope_type="university",
                        section_key="hero",
                        layout_variant="hero_admissions",
                        status=status,
                    )

                    visible = await page_cms._can_access_page_section_admin_row(_AuthDb(user), user, section)

                    self.assertEqual(expected, visible)

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

    async def test_homepage_publish_permission_row_visibility_is_homepage_only_and_actionable(self):
        user = _user("homepage.publish")
        cases = (
            ("homepage", "approved", True),
            ("homepage", "published", True),
            ("homepage", "in_review", False),
            ("research", "approved", False),
            ("research", "published", False),
        )

        async def fake_can_access(_db, _user, permission, _scope_type, _scope_id):
            return permission == "homepage.publish"

        with patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access):
            for page_key, status, expected in cases:
                with self.subTest(page_key=page_key, status=status):
                    section = PageSection(
                        page_key=page_key,
                        scope_type="university",
                        section_key="hero",
                        layout_variant="hero_admissions",
                        status=status,
                    )

                    visible = await page_cms._can_access_page_section_admin_row(_AuthDb(user), user, section)

                    self.assertEqual(expected, visible)

    async def test_view_permission_row_visibility_is_not_limited_by_workflow_status(self):
        user = _user("page_sections.view")
        section = PageSection(
            page_key="research",
            scope_type="university",
            section_key="hero",
            layout_variant="hero_admissions",
            status="draft",
        )

        async def fake_can_access(_db, _user, permission, _scope_type, _scope_id):
            return permission == "page_sections.view"

        with patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access):
            visible = await page_cms._can_access_page_section_admin_row(_AuthDb(user), user, section)

        self.assertTrue(visible)

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
