import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from app.api.v1 import contacts, faqs
from app.schemas import ContactDirectoryCreate, FAQCreate, FAQUpdate


class _FakeSelector:
    load_options = ()

    def apply(self, value):
        return value


class _Page:
    def __init__(self, items):
        self.items = items
        self.meta = {"total": len(items)}


def _scoped_record(scope_type, scope_id):
    return SimpleNamespace(
        id=uuid.uuid4(),
        scope_type=scope_type,
        scope_id=scope_id,
        is_public=True,
        status="active",
    )


class SupportScopeApiTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_contacts_list_filters_by_user_scope(self):
        own_wing_id = uuid.uuid4()
        other_wing_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        page = _Page([
            _scoped_record("wing", own_wing_id),
            _scoped_record("wing", other_wing_id),
        ])

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own_wing_id

        with (
            patch.object(contacts, "build_selector", return_value=_FakeSelector()),
            patch.object(contacts.ContactService, "list", return_value=page),
            patch.object(contacts, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            response = await contacts.list_admin_contacts(db=None, user=user)

        self.assertEqual([page.items[0]], response["data"])
        self.assertEqual(1, response["meta"]["total"])

    async def test_create_contact_rejects_unowned_scope(self):
        user = SimpleNamespace(id=uuid.uuid4())
        payload = ContactDirectoryCreate(
            name="Registrar Contacts",
            scope_type="wing",
            scope_id=uuid.uuid4(),
        )

        with patch.object(contacts, "can_access_scope", return_value=False, create=True):
            with self.assertRaises(HTTPException) as context:
                await contacts.create_contact(payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_get_admin_contact_rejects_unowned_scope(self):
        user = SimpleNamespace(id=uuid.uuid4())
        item = _scoped_record("wing", uuid.uuid4())

        with (
            patch.object(contacts, "build_selector", return_value=_FakeSelector()),
            patch.object(contacts.ContactService, "get_by_id", return_value=item),
            patch.object(contacts, "can_access_scope", return_value=False, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await contacts.get_admin_contact(item.id, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_public_contact_by_id_rejects_private_records(self):
        item = _scoped_record("wing", uuid.uuid4())
        item.is_public = False

        with (
            patch.object(contacts, "build_selector", return_value=_FakeSelector()),
            patch.object(contacts.ContactService, "get_by_id", return_value=item),
        ):
            with self.assertRaises(HTTPException) as context:
                await contacts.get_contact.__wrapped__(item.id, db=None)

        self.assertEqual(404, context.exception.status_code)

    async def test_admin_faqs_list_filters_by_user_scope(self):
        own_department_id = uuid.uuid4()
        other_department_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        page = _Page([
            _scoped_record("department", own_department_id),
            _scoped_record("department", other_department_id),
        ])

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own_department_id

        with (
            patch.object(faqs, "build_selector", return_value=_FakeSelector()),
            patch.object(faqs.FAQService, "list", return_value=page),
            patch.object(faqs, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            response = await faqs.list_admin_faqs(db=None, user=user)

        self.assertEqual([page.items[0]], response["data"])
        self.assertEqual(1, response["meta"]["total"])

    async def test_get_admin_faq_rejects_unowned_scope(self):
        user = SimpleNamespace(id=uuid.uuid4())
        item = _scoped_record("department", uuid.uuid4())

        with (
            patch.object(faqs, "build_selector", return_value=_FakeSelector()),
            patch.object(faqs.FAQService, "get_by_id", return_value=item),
            patch.object(faqs, "can_access_scope", return_value=False, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await faqs.get_admin_faq(item.id, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_public_faq_by_id_rejects_drafts(self):
        item = _scoped_record("department", uuid.uuid4())
        item.status = "draft"

        with (
            patch.object(faqs, "build_selector", return_value=_FakeSelector()),
            patch.object(faqs.FAQService, "get_by_id", return_value=item),
        ):
            with self.assertRaises(HTTPException) as context:
                await faqs.get_faq.__wrapped__(item.id, db=None)

        self.assertEqual(404, context.exception.status_code)

    async def test_update_faq_checks_existing_and_next_scope(self):
        own_department_id = uuid.uuid4()
        other_department_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        item = _scoped_record("department", own_department_id)
        payload = FAQUpdate(scope_type="department", scope_id=other_department_id)

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own_department_id

        with (
            patch.object(faqs.FAQService, "get_by_id", return_value=item),
            patch.object(faqs, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await faqs.update_faq(item.id, payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)


if __name__ == "__main__":
    unittest.main()
