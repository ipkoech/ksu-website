import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from app.api.v1 import documents
from app.schemas import DocumentCreate, DocumentUpdate


class _FakeSelector:
    load_options = ()

    def apply(self, value):
        return value


class _Page:
    def __init__(self, items):
        self.items = items
        self.meta = {"total": len(items)}


def _document(scope_type, scope_id):
    return SimpleNamespace(
        id=uuid.uuid4(),
        scope_type=scope_type,
        scope_id=scope_id,
    )


class DocumentScopeApiTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_document_list_pushes_scope_visibility_into_service(self):
        own_wing_id = uuid.uuid4()
        other_wing_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        item = _document("wing", own_wing_id)
        captured = {}

        async def fake_list_admin_authorized(_db, *, is_visible, **kwargs):
            captured["is_visible"] = is_visible
            captured["kwargs"] = kwargs
            return _Page([item])

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own_wing_id

        with (
            patch.object(documents, "build_selector", return_value=_FakeSelector()),
            patch.object(
                documents.DocumentService,
                "list_admin_authorized",
                side_effect=fake_list_admin_authorized,
            ),
            patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access),
        ):
            response = await documents.list_admin_documents(db=None, user=user)

            # The route's visibility callback enforces the user's scopes.
            self.assertTrue(await captured["is_visible"]("wing", own_wing_id))
            self.assertFalse(await captured["is_visible"]("wing", other_wing_id))

        self.assertEqual([item], response["data"])

    async def test_admin_document_list_returns_service_meta_untouched(self):
        """meta.total must come from the filtered query, not the page length."""
        user = SimpleNamespace(id=uuid.uuid4())
        page = _Page([_document("wing", uuid.uuid4())])
        page.meta = {"total": 41, "page": 2, "per_page": 1}

        with (
            patch.object(documents, "build_selector", return_value=_FakeSelector()),
            patch.object(documents.DocumentService, "list_admin_authorized", return_value=page),
        ):
            response = await documents.list_admin_documents(db=None, user=user, page=2, per_page=1)

        self.assertEqual(41, response["meta"]["total"])
        self.assertEqual(1, len(response["data"]))

    async def test_list_admin_authorized_filters_scopes_before_pagination(self):
        from unittest.mock import AsyncMock

        from app.services import documents as documents_service

        own_wing_id = uuid.uuid4()
        other_wing_id = uuid.uuid4()
        scope_rows = [("wing", own_wing_id), ("wing", other_wing_id), (None, None)]
        db = SimpleNamespace(execute=AsyncMock(return_value=SimpleNamespace(all=lambda: scope_rows)))
        seen: list[tuple] = []

        async def is_visible(scope_type, scope_id):
            seen.append((scope_type, scope_id))
            return scope_id == own_wing_id or scope_type is None

        with patch.object(documents_service, "paginate_query", AsyncMock()) as paginate:
            await documents_service.DocumentService.list_admin_authorized(db, is_visible=is_visible)

        self.assertEqual(scope_rows, seen)
        query = paginate.await_args.args[1]
        compiled = str(query)
        # Both allowed scopes are pushed into the WHERE clause pre-pagination.
        self.assertEqual(1, compiled.count("scope_id ="))
        self.assertEqual(1, compiled.count("scope_type IS NULL"))
        self.assertIn("OR", compiled)

    async def test_list_admin_authorized_returns_nothing_when_no_scope_visible(self):
        from unittest.mock import AsyncMock

        from app.services import documents as documents_service

        scope_rows = [("wing", uuid.uuid4())]
        db = SimpleNamespace(execute=AsyncMock(return_value=SimpleNamespace(all=lambda: scope_rows)))

        async def is_visible(_scope_type, _scope_id):
            return False

        with patch.object(documents_service, "paginate_query", AsyncMock()) as paginate:
            await documents_service.DocumentService.list_admin_authorized(db, is_visible=is_visible)

        compiled = str(paginate.await_args.args[1]).lower()
        self.assertIn("false", compiled.replace("0 = 1", "false"))

    async def test_create_document_rejects_unowned_scope(self):
        user = SimpleNamespace(id=uuid.uuid4())
        payload = DocumentCreate(
            title="Office Charter",
            document_type="charter",
            file_id=uuid.uuid4(),
            scope_type="wing",
            scope_id=uuid.uuid4(),
        )

        with patch("app.api.v1._scoped._can_access_scope", return_value=False):
            with self.assertRaises(HTTPException) as context:
                await documents.create_document(payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_update_document_checks_existing_and_next_scope(self):
        own_wing_id = uuid.uuid4()
        other_wing_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        item = _document("wing", own_wing_id)
        payload = DocumentUpdate(scope_type="wing", scope_id=other_wing_id)

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own_wing_id

        with (
            patch.object(documents.DocumentService, "get_by_id", return_value=item),
            patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access),
        ):
            with self.assertRaises(HTTPException) as context:
                await documents.update_document(item.id, payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)


if __name__ == "__main__":
    unittest.main()
