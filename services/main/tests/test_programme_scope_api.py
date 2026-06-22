import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.api.v1 import programmes
from app.schemas import ProgrammeCreate, ProgrammeUpdate


class _FakeSelector:
    load_options = ()

    def apply(self, value):
        return value


class _Page:
    def __init__(self, items):
        self.items = items
        self.meta = {"total": len(items)}


def _programme(department_id=None):
    return SimpleNamespace(id=uuid.uuid4(), department_id=department_id or uuid.uuid4())


class ProgrammeScopeApiTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_programmes_list_filters_by_department_scope(self):
        own = _programme()
        other = _programme()
        user = SimpleNamespace(id=uuid.uuid4())

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own.department_id

        list_mock = AsyncMock(return_value=_Page([own, other]))

        with (
            patch.object(programmes, "build_selector", return_value=_FakeSelector()),
            patch.object(programmes.ProgrammeService, "list", list_mock),
            patch.object(programmes, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            response = await programmes.list_admin_programmes(
                db=None,
                user=user,
                is_active=False,
            )

        self.assertEqual([own], response["data"])
        self.assertEqual(1, response["meta"]["total"])
        self.assertIs(False, list_mock.call_args.kwargs["is_active"])

    async def test_create_programme_rejects_unmanaged_department(self):
        user = SimpleNamespace(id=uuid.uuid4())
        payload = ProgrammeCreate(
            name="Bachelor of Scope",
            code="BSC_SCOPE",
            level="undergraduate",
            duration="4 years",
            department_id=uuid.uuid4(),
        )

        with patch.object(programmes, "can_access_scope", return_value=False, create=True):
            with self.assertRaises(HTTPException) as context:
                await programmes.create_programme(payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_update_programme_rejects_unowned_existing_department(self):
        item = _programme()
        user = SimpleNamespace(id=uuid.uuid4())
        payload = ProgrammeUpdate(name="Renamed Programme")

        with (
            patch.object(programmes.ProgrammeService, "get_by_id", return_value=item),
            patch.object(programmes, "can_access_scope", return_value=False, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await programmes.update_programme(item.id, payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_update_programme_rejects_unmanaged_target_department(self):
        current_department_id = uuid.uuid4()
        target_department_id = uuid.uuid4()
        item = _programme(department_id=current_department_id)
        user = SimpleNamespace(id=uuid.uuid4())
        payload = ProgrammeUpdate(department_id=target_department_id)

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == current_department_id

        with (
            patch.object(programmes.ProgrammeService, "get_by_id", return_value=item),
            patch.object(programmes, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await programmes.update_programme(item.id, payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)


if __name__ == "__main__":
    unittest.main()
