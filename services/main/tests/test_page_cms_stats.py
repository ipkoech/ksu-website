from __future__ import annotations

import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.v1 import stats as stats_api
from app.deps import get_db
from app.helpers.jwt import create_access_token
from app.services.stats import portal_stats
from app.services.page_cms_sources import PageCmsSourceService


class _ScalarResult:
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


class _EmptyScalars:
    def all(self):
        return []


class _SectionResult:
    def scalar_one(self):
        return 0

    def scalars(self):
        return _EmptyScalars()


class _PageCmsStatsDb:
    def __init__(self):
        self.statements = []

    async def execute(self, statement):
        self.statements.append(statement)
        sql = str(statement).lower()
        if "draft_count" in sql:
            return _MappingResult({
                "draft_count": 2,
                "in_review_count": 1,
                "changes_requested_count": 1,
                "approved_count": 1,
                "scheduled_count": 1,
                "published_count": 1,
                "expired_count": 1,
            })
        if "spotlight_count" in sql:
            return _MappingResult({"spotlight_count": 2})
        if "from page_sections" in sql:
            return _SectionResult()
        return _ScalarResult()


class _PageCmsValidationStatsDb(_PageCmsStatsDb):
    def __init__(self, sections):
        super().__init__()
        self.sections = sections

    async def execute(self, statement):
        self.statements.append(statement)
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
        if "from page_sections" in sql:
            return _SectionsResult(self.sections)
        return _ScalarResult()


class _SectionsResult:
    def __init__(self, sections):
        self.sections = sections

    def scalar_one(self):
        return 0

    def scalars(self):
        return SimpleNamespace(all=lambda: self.sections)


class _AuthScalarResult:
    def __init__(self, user):
        self.user = user

    def scalar_one_or_none(self):
        return self.user


class _StatsAuthDb:
    def __init__(self, user):
        self.user = user

    async def execute(self, _statement):
        return _AuthScalarResult(self.user)


def _stats_user(*permissions: str):
    role = SimpleNamespace(
        name="page-cms-viewer",
        is_active=True,
        role_permissions=[
            SimpleNamespace(permission=SimpleNamespace(name=name, is_active=True))
            for name in permissions
        ],
    )
    return SimpleNamespace(
        id=uuid.uuid4(),
        is_active=True,
        deleted_at=None,
        role_assignments=[SimpleNamespace(
            is_active=True,
            role=role,
            scope_type=None,
            scope_id=None,
        )],
        person=None,
    )


def _stats_client(user):
    app = FastAPI()
    app.include_router(stats_api.router, prefix="/api/v1/stats")

    async def override_db():
        yield _StatsAuthDb(user)

    app.dependency_overrides[get_db] = override_db
    token, _ = create_access_token(str(user.id), ["page-cms-viewer"], permissions=[])
    return TestClient(app), {"Authorization": f"Bearer {token}"}


class PageCmsStatsTests(unittest.IsolatedAsyncioTestCase):
    async def test_cocms_stats_return_portal_wide_page_cms_workflow_counts(self):
        db = _PageCmsStatsDb()

        result = await portal_stats(db, "cocms")

        self.assertEqual({
            "draft_count": 2,
            "in_review_count": 1,
            "changes_requested_count": 1,
            "approved_count": 1,
            "scheduled_count": 1,
            "published_count": 1,
            "expired_count": 1,
            "validation_blocker_count": 0,
            "spotlight_count": 2,
        }, {key: result.stats[key] for key in (
            "draft_count",
            "in_review_count",
            "changes_requested_count",
            "approved_count",
            "scheduled_count",
            "published_count",
            "expired_count",
            "validation_blocker_count",
            "spotlight_count",
        )})

        page_cms_queries = [
            str(statement).lower()
            for statement in db.statements
            if "from page_sections" in str(statement).lower()
        ]
        workflow_query = next(query for query in page_cms_queries if "draft_count" in query)
        self.assertIn("filter (where", workflow_query)
        for field in ("valid_from", "valid_to", "scheduled_publish_at", "expires_at"):
            self.assertIn(field, workflow_query)
        self.assertFalse(any(" limit " in query or " offset " in query for query in page_cms_queries))

    async def test_published_count_uses_the_public_composition_predicate_at_window_boundaries(self):
        db = _PageCmsStatsDb()

        await portal_stats(db, "cocms")

        workflow_query = next(
            str(statement.compile(compile_kwargs={"literal_binds": True})).lower()
            for statement in db.statements
            if "draft_count" in str(statement).lower()
        )
        for predicate in (
            "page_sections.is_enabled is true",
            "page_sections.status = 'published'",
            "page_sections.workflow_status = 'published'",
            "page_sections.valid_from <=",
            "page_sections.valid_to >=",
            "page_sections.scheduled_publish_at <=",
            "page_sections.expires_at >=",
        ):
            self.assertIn(predicate, workflow_query)

    async def test_validation_stats_reuses_provider_data_for_duplicate_sources_across_page_groups(self):
        source_id = uuid.uuid4()
        sections = [
            SimpleNamespace(
                id=uuid.uuid4(),
                page_key=page_key,
                scope_type="university",
                scope_id=None,
                status="draft",
                items=[SimpleNamespace(
                    id=uuid.uuid4(),
                    is_enabled=True,
                    deleted_at=None,
                    display_order=1,
                    item_type="reference",
                    source_type="research_partner",
                    source_id=source_id,
                )],
            )
            for page_key in ("homepage", "research")
        ]
        db = _PageCmsValidationStatsDb(sections)
        provider = AsyncMock(return_value=[{
            "id": str(source_id),
            "name": "KSU Research Partner",
            "status": "active",
            "is_active": True,
            "is_public": True,
        }])

        with (
            patch("app.services.page_cms.group_preview_media_links_many", AsyncMock(return_value={
                section.id: {} for section in sections
            })),
            patch("app.services.page_cms.PageSectionValidationService.validate", return_value=[]),
            patch.object(PageCmsSourceService, "_load_public_partners", provider),
        ):
            result = await portal_stats(db, "cocms")

        self.assertEqual(0, result.stats["validation_blocker_count"])
        self.assertEqual(1, provider.await_count)

    async def test_cocms_stats_count_each_section_with_blocking_validation_once(self):
        section = SimpleNamespace(
            id=uuid.uuid4(),
            page_key="homepage",
            scope_type="university",
            scope_id=None,
            status="draft",
            items=[],
        )
        db = _PageCmsValidationStatsDb([section])
        resolve = AsyncMock(return_value={section.id: []})
        media = AsyncMock(return_value={section.id: {}})
        validate = unittest.mock.MagicMock(return_value=[
            SimpleNamespace(blocking=True),
            SimpleNamespace(blocking=True),
        ])

        with (
            patch("app.services.page_cms.PageSectionValidationService.resolve_items_for_sections", resolve),
            patch("app.services.page_cms.group_preview_media_links_many", media),
            patch("app.services.page_cms.PageSectionValidationService.validate", validate),
        ):
            result = await portal_stats(db, "cocms")

        self.assertEqual(1, result.stats["validation_blocker_count"])
        resolve.assert_awaited_once()
        media.assert_awaited_once_with(db, "page_section", [section.id])
        capability = resolve.await_args.args[2]
        self.assertTrue(await capability.allows(
            source_scope_type="university",
            source_scope_id=None,
            destination_scope_type="university",
            destination_scope_id=None,
        ))
        self.assertFalse(await capability.allows(
            source_scope_type="school",
            source_scope_id=uuid.uuid4(),
            destination_scope_type="university",
            destination_scope_id=None,
        ))


class PageCmsStatsAuthorizationTests(unittest.TestCase):
    def test_portal_stats_allows_page_cms_viewer(self):
        user = _stats_user("page_sections.view")
        client, headers = _stats_client(user)
        portal = AsyncMock(return_value=SimpleNamespace(model_dump=lambda: {
            "portal": "cocms",
            "title": "CoCMS publishing counters",
            "stats": {},
        }))

        with patch.object(stats_api, "portal_stats", portal):
            response = client.get("/api/v1/stats/portal/cocms", headers=headers)

        self.assertEqual(200, response.status_code)
        portal.assert_awaited_once()

    def test_portal_stats_rejects_media_only_user(self):
        user = _stats_user("media.view")
        client, headers = _stats_client(user)
        portal = AsyncMock(return_value=SimpleNamespace(model_dump=lambda: {
            "portal": "cocms",
            "title": "CoCMS publishing counters",
            "stats": {},
        }))

        with patch.object(stats_api, "portal_stats", portal):
            response = client.get("/api/v1/stats/portal/cocms", headers=headers)

        self.assertEqual(403, response.status_code)
        portal.assert_not_awaited()


if __name__ == "__main__":
    unittest.main()
