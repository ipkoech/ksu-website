import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from app.api.v1 import divisions, wings
from app.schemas import DivisionUpdate, WingCreate


class _FakeSelector:
    load_options = ()

    def apply(self, value):
        return value


class _Page:
    def __init__(self, items):
        self.items = items
        self.meta = {"total": len(items)}


def _division():
    return SimpleNamespace(id=uuid.uuid4())


def _wing(division_id):
    return SimpleNamespace(id=uuid.uuid4(), division_id=division_id)


class OrganizationScopeApiTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_divisions_list_filters_by_user_scope(self):
        own = _division()
        other = _division()
        user = SimpleNamespace(id=uuid.uuid4())
        page = _Page([own, other])

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own.id

        with (
            patch.object(divisions, "build_selector", return_value=_FakeSelector()),
            patch.object(divisions.DivisionService, "list", return_value=page),
            patch.object(divisions, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            response = await divisions.list_admin_divisions(db=None, user=user)

        self.assertEqual([own], response["data"])
        self.assertEqual(1, response["meta"]["total"])

    async def test_update_division_rejects_unowned_scope(self):
        item = _division()
        user = SimpleNamespace(id=uuid.uuid4())
        payload = DivisionUpdate(name="Other Division")

        with (
            patch.object(divisions.DivisionService, "get_by_id", return_value=item),
            patch.object(divisions, "can_access_scope", return_value=False, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await divisions.update_division(item.id, payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_admin_wings_list_filters_by_user_scope(self):
        own_division_id = uuid.uuid4()
        own = _wing(own_division_id)
        other = _wing(uuid.uuid4())
        user = SimpleNamespace(id=uuid.uuid4())

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own.id

        with (
            patch.object(wings, "build_selector", return_value=_FakeSelector()),
            patch.object(wings.WingService, "list", return_value=_Page([own, other])),
            patch.object(wings, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            response = await wings.list_admin_wings(db=None, user=user)

        self.assertEqual([own], response["data"])
        self.assertEqual(1, response["meta"]["total"])

    async def test_create_wing_rejects_unmanaged_parent_division(self):
        user = SimpleNamespace(id=uuid.uuid4())
        payload = WingCreate(
            division_id=uuid.uuid4(),
            name="Registrar Academic Affairs",
            slug="registrar-academic-affairs",
            code="RAA",
        )

        with patch.object(wings, "can_access_scope", return_value=False, create=True):
            with self.assertRaises(HTTPException) as context:
                await wings.create_wing(payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)


if __name__ == "__main__":
    unittest.main()
