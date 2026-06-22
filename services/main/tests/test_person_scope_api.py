import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app import schemas
from app.api.v1 import persons


class _FakeSelector:
    load_options = ()

    def apply(self, value):
        return value


class _Page:
    def __init__(self, items):
        self.items = items
        self.meta = {"total": len(items)}


def _person(department_id=None):
    return SimpleNamespace(
        id=uuid.uuid4(),
        department_id=department_id,
    )


class PersonScopeApiTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_persons_list_filters_by_user_scope_and_researcher_flag(self):
        own_department_id = uuid.uuid4()
        other_department_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        page = _Page([
            _person(own_department_id),
            _person(other_department_id),
        ])
        list_mock = AsyncMock(return_value=page)

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own_department_id

        with (
            patch.object(persons, "build_selector", return_value=_FakeSelector()),
            patch.object(persons.PersonService, "list", list_mock),
            patch.object(persons, "with_person_photo_urls", side_effect=lambda data, _items: data),
            patch.object(persons, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            response = await persons.list_admin_persons(db=None, user=user, is_researcher=True)

        self.assertEqual([page.items[0]], response["data"])
        self.assertEqual(1, response["meta"]["total"])
        self.assertIs(True, list_mock.call_args.kwargs["is_researcher"])

    async def test_create_person_rejects_unowned_department(self):
        user = SimpleNamespace(id=uuid.uuid4())
        payload = schemas.PersonCreate(
            first_name="Ada",
            last_name="Ochieng",
            full_name="Ada Ochieng",
            email="ada.ochieng@example.com",
            department_id=uuid.uuid4(),
        )

        with patch.object(persons, "can_access_scope", return_value=False, create=True):
            with self.assertRaises(HTTPException) as context:
                await persons.create_person(payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_update_person_checks_existing_and_next_department(self):
        own_department_id = uuid.uuid4()
        other_department_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        item = _person(own_department_id)
        payload = schemas.PersonUpdate(department_id=other_department_id)

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own_department_id

        with (
            patch.object(persons.PersonService, "get_by_id", return_value=item),
            patch.object(persons, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await persons.update_person(item.id, payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)


if __name__ == "__main__":
    unittest.main()
