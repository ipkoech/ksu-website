"""Tests for the slider admin listings.

Covers the admin slider-group listing (inactive/non-public groups must stay
visible to admins while the public route keeps hiding them) and the
workflow_status / is_active filters on the admin slider listing.
"""

from __future__ import annotations

import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from app.api.v1 import sliders
from app.services import content as content_services
from app.services.content import SliderGroupService, SliderService


class _FakeSelector:
    load_options = ()

    def apply(self, value):
        return value


class _Page:
    def __init__(self, items, meta=None):
        self.items = items
        self.meta = meta if meta is not None else {"page": 1, "per_page": 20, "total": len(items), "pages": 1}


class _CapturingResult:
    def scalars(self):
        return self

    def unique(self):
        return self

    def all(self):
        return []


class _FakeDb:
    def __init__(self):
        self.statements = []

    async def execute(self, statement):
        self.statements.append(statement)
        return _CapturingResult()


def _compiled(paginate_mock) -> str:
    query = paginate_mock.await_args.args[1]
    return str(query)


class SliderGroupAdminListQueryTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_list_shows_inactive_and_non_public_groups_by_default(self):
        paginate = AsyncMock(return_value=_Page([]))
        with patch.object(content_services, "paginate_query", paginate):
            await SliderGroupService.list_admin(_FakeDb())

        sql = _compiled(paginate)
        self.assertIn("deleted_at IS NULL", sql)
        self.assertNotIn("is_active IS", sql)
        self.assertNotIn("is_public IS", sql)

    async def test_admin_list_applies_optional_filters(self):
        paginate = AsyncMock(return_value=_Page([]))
        scope_id = uuid.uuid4()
        with patch.object(content_services, "paginate_query", paginate):
            await SliderGroupService.list_admin(
                _FakeDb(),
                is_active=False,
                is_public=True,
                scope_type="school",
                scope_id=scope_id,
                search="homepage",
            )

        sql = _compiled(paginate)
        self.assertIn("is_active IS", sql)
        self.assertIn("is_public IS", sql)
        self.assertIn("scope_type", sql)
        self.assertIn("scope_id", sql)
        self.assertIn("LIKE", sql.upper())

    async def test_public_list_still_hides_inactive_and_non_public_groups(self):
        db = _FakeDb()
        with patch.object(content_services, "_archive_expired_sliders", AsyncMock()):
            await SliderGroupService.list(db)

        self.assertEqual(1, len(db.statements))
        sql = str(db.statements[0])
        self.assertIn("is_active IS true", sql)
        self.assertIn("is_public IS true", sql)


class SliderGroupAdminRouteTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_group_route_forwards_filters_and_returns_meta(self):
        page = _Page([], meta={"page": 2, "per_page": 10, "total": 0, "pages": 0})
        list_admin = AsyncMock(return_value=page)
        scope_id = uuid.uuid4()
        with (
            patch.object(sliders, "build_selector", return_value=_FakeSelector()),
            patch.object(sliders.SliderGroupService, "list_admin", list_admin),
        ):
            response = await sliders.list_admin_slider_groups(
                db=None,
                _=SimpleNamespace(id=uuid.uuid4()),
                page=2,
                per_page=10,
                is_active=False,
                is_public=False,
                is_main=True,
                scope_type="school",
                scope_id=scope_id,
                search="rotation",
            )

        kwargs = list_admin.await_args.kwargs
        self.assertEqual(2, kwargs["page"])
        self.assertEqual(10, kwargs["per_page"])
        self.assertIs(False, kwargs["is_active"])
        self.assertIs(False, kwargs["is_public"])
        self.assertIs(True, kwargs["is_main"])
        self.assertEqual("school", kwargs["scope_type"])
        self.assertEqual(scope_id, kwargs["scope_id"])
        self.assertEqual("rotation", kwargs["search"])
        self.assertEqual(page.meta, response["meta"])
        self.assertEqual([], response["data"])


class SliderAdminListQueryTests(unittest.IsolatedAsyncioTestCase):
    async def test_workflow_status_filter_is_applied(self):
        paginate = AsyncMock(return_value=_Page([]))
        with patch.object(content_services, "paginate_query", paginate):
            await SliderService.list_admin(_FakeDb(), workflow_status="published")

        sql = _compiled(paginate)
        self.assertIn("workflow_status", sql)

    async def test_workflow_status_absent_by_default(self):
        paginate = AsyncMock(return_value=_Page([]))
        with patch.object(content_services, "paginate_query", paginate):
            await SliderService.list_admin(_FakeDb())

        sql = _compiled(paginate)
        self.assertNotIn("workflow_status =", sql)

    async def test_is_active_filter_is_applied(self):
        paginate = AsyncMock(return_value=_Page([]))
        with patch.object(content_services, "paginate_query", paginate):
            await SliderService.list_admin(_FakeDb(), is_active=False)

        sql = _compiled(paginate)
        self.assertIn("is_active IS", sql)


class SliderAdminRouteTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_slider_route_forwards_workflow_filters_and_returns_meta(self):
        page = _Page([])
        list_admin = AsyncMock(return_value=page)
        with (
            patch.object(sliders, "build_selector", return_value=_FakeSelector()),
            patch.object(sliders.SliderService, "list_admin", list_admin),
        ):
            response = await sliders.list_admin_sliders(
                db=None,
                _=SimpleNamespace(id=uuid.uuid4()),
                page=1,
                per_page=50,
                workflow_status="in_review",
                is_active=True,
            )

        kwargs = list_admin.await_args.kwargs
        self.assertEqual("in_review", kwargs["workflow_status"])
        self.assertIs(True, kwargs["is_active"])
        self.assertEqual(page.meta, response["meta"])
        self.assertEqual([], response["data"])


if __name__ == "__main__":
    unittest.main()
