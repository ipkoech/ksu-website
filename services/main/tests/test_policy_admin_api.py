import inspect
import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.api.v1 import policies
from app.services import documents as documents_service


class _FakeSelector:
    load_options = ()

    def apply(self, value):
        return value


class _Page:
    def __init__(self, items, meta=None):
        self.items = items
        self.meta = meta if meta is not None else {"total": len(items)}


def _policy(status="active", is_public=True):
    return SimpleNamespace(
        id=uuid.uuid4(),
        title="Records Policy",
        status=status,
        is_public=is_public,
    )


class PolicyAdminApiTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_listing_lists_drafts_and_archived(self):
        """Admin route must request public_only=False and pass status through."""
        user = SimpleNamespace(id=uuid.uuid4())
        page = _Page([_policy(status="archived", is_public=False)], meta={"total": 3})
        service_list = AsyncMock(return_value=page)

        with (
            patch.object(policies, "build_selector", return_value=_FakeSelector()),
            patch.object(policies.PolicyService, "list", service_list),
            patch.object(policies, "user_has_scope", return_value=True),
        ):
            response = await policies.list_admin_policies(db=None, user=user, status="archived")

        kwargs = service_list.await_args.kwargs
        self.assertFalse(kwargs["public_only"])
        self.assertEqual("archived", kwargs["status"])
        self.assertEqual(page.items, response["data"])
        self.assertEqual(3, response["meta"]["total"])

    async def test_admin_listing_rejects_users_without_view_scope(self):
        user = SimpleNamespace(id=uuid.uuid4())

        with patch.object(policies, "user_has_scope", return_value=False):
            with self.assertRaises(HTTPException) as context:
                await policies.list_admin_policies(db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_public_listing_cannot_be_widened(self):
        """The public route exposes neither status nor public_only params."""
        params = inspect.signature(policies.list_policies).parameters
        self.assertNotIn("status", params)
        self.assertNotIn("public_only", params)
        self.assertNotIn("is_public", params)

    async def test_public_listing_service_defaults_hide_non_active(self):
        db = SimpleNamespace()

        with patch.object(documents_service, "paginate_query", AsyncMock()) as paginate:
            await documents_service.PolicyService.list(db)

        compiled = str(paginate.await_args.args[1])
        where_clause = compiled.split("WHERE", 1)[1]
        self.assertIn("is_public IS", where_clause)
        self.assertIn("status =", where_clause)

    async def test_service_admin_listing_includes_archived_and_filters_by_status(self):
        db = SimpleNamespace()

        with patch.object(documents_service, "paginate_query", AsyncMock()) as paginate:
            await documents_service.PolicyService.list(db, public_only=False)
        unfiltered = str(paginate.await_args.args[1])
        # No WHERE clause at all: drafts and archived policies are listable.
        self.assertNotIn("WHERE", unfiltered)

        with patch.object(documents_service, "paginate_query", AsyncMock()) as paginate:
            await documents_service.PolicyService.list(db, public_only=False, status="draft", is_public=False)
        filtered_where = str(paginate.await_args.args[1]).split("WHERE", 1)[1]
        self.assertIn("status =", filtered_where)
        self.assertIn("is_public IS", filtered_where)


if __name__ == "__main__":
    unittest.main()
