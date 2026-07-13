from __future__ import annotations

import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from app.services.stats import portal_stats


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


if __name__ == "__main__":
    unittest.main()
