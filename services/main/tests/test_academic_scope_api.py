import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.api.v1 import departments, schools
from app.schemas import DepartmentCreate, SchoolUpdate


class _FakeSelector:
    load_options = ()

    def apply(self, value):
        return value


class _Page:
    def __init__(self, items):
        self.items = items
        self.meta = {"total": len(items)}


def _school():
    return SimpleNamespace(id=uuid.uuid4())


def _department(school_id=None, wing_id=None):
    return SimpleNamespace(id=uuid.uuid4(), school_id=school_id, wing_id=wing_id)


class AcademicScopeApiTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_schools_list_filters_by_user_scope(self):
        own = _school()
        other = _school()
        user = SimpleNamespace(id=uuid.uuid4())

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own.id

        list_mock = AsyncMock(return_value=_Page([own, other]))

        with (
            patch.object(schools, "build_selector", return_value=_FakeSelector()),
            patch.object(schools.SchoolService, "list", list_mock),
            patch.object(schools, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            response = await schools.list_admin_schools(
                db=None,
                user=user,
                is_active=False,
                is_public=False,
            )

        self.assertEqual([own], response["data"])
        self.assertEqual(1, response["meta"]["total"])
        self.assertIs(False, list_mock.call_args.kwargs["is_active"])
        self.assertIs(False, list_mock.call_args.kwargs["is_public"])

    async def test_update_school_rejects_unowned_scope(self):
        item = _school()
        user = SimpleNamespace(id=uuid.uuid4())
        payload = SchoolUpdate(name="Other School")

        with (
            patch.object(schools.SchoolService, "get_by_id", return_value=item),
            patch.object(schools, "can_access_scope", return_value=False, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await schools.update_school(item.id, payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_admin_departments_list_filters_by_user_scope(self):
        own = _department(school_id=uuid.uuid4())
        other = _department(school_id=uuid.uuid4())
        user = SimpleNamespace(id=uuid.uuid4())

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own.id

        list_mock = AsyncMock(return_value=_Page([own, other]))

        with (
            patch.object(departments, "build_selector", return_value=_FakeSelector()),
            patch.object(departments.DepartmentService, "list", list_mock),
            patch.object(departments, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            response = await departments.list_admin_departments(
                db=None,
                user=user,
                is_active=False,
                is_public=False,
            )

        self.assertEqual([own], response["data"])
        self.assertEqual(1, response["meta"]["total"])
        self.assertIs(False, list_mock.call_args.kwargs["is_active"])
        self.assertIs(False, list_mock.call_args.kwargs["is_public"])

    async def test_create_department_rejects_unmanaged_parent_school(self):
        user = SimpleNamespace(id=uuid.uuid4())
        payload = DepartmentCreate(
            name="Computer Science",
            slug="computer-science",
            code="CS",
            school_id=uuid.uuid4(),
            department_type="academic",
        )

        with patch.object(departments, "can_access_scope", return_value=False, create=True):
            with self.assertRaises(HTTPException) as context:
                await departments.create_department(payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)


if __name__ == "__main__":
    unittest.main()
