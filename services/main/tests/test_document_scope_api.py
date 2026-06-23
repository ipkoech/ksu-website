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
    async def test_admin_document_list_filters_by_user_scope(self):
        own_wing_id = uuid.uuid4()
        other_wing_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        page = _Page([
            _document("wing", own_wing_id),
            _document("wing", other_wing_id),
        ])

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own_wing_id

        with (
            patch.object(documents, "build_selector", return_value=_FakeSelector()),
            patch.object(documents.DocumentService, "list", return_value=page),
            patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access),
        ):
            response = await documents.list_admin_documents(db=None, user=user)

        self.assertEqual([page.items[0]], response["data"])
        self.assertEqual(1, response["meta"]["total"])

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
