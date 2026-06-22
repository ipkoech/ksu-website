import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from app.api.v1 import announcements
from app.schemas import AnnouncementCreate, AnnouncementUpdate


class _FakeSelector:
    load_options = ()

    def apply(self, value):
        return value


class _Page:
    def __init__(self, items):
        self.items = items
        self.meta = {"total": len(items)}


def _announcement(scope_type, scope_id):
    return SimpleNamespace(
        id=uuid.uuid4(),
        scope_type=scope_type,
        scope_id=scope_id,
    )


class AnnouncementScopeApiTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_announcements_list_filters_by_user_scope(self):
        own_department_id = uuid.uuid4()
        other_department_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        page = _Page([
            _announcement("department", own_department_id),
            _announcement("department", other_department_id),
        ])

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own_department_id

        with (
            patch.object(announcements, "build_selector", return_value=_FakeSelector()),
            patch.object(announcements.AnnouncementService, "list_admin", return_value=page),
            patch.object(announcements, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            response = await announcements.list_admin_announcements(db=None, user=user)

        self.assertEqual([page.items[0]], response["data"])
        self.assertEqual(1, response["meta"]["total"])

    async def test_create_announcement_rejects_unowned_scope(self):
        user = SimpleNamespace(id=uuid.uuid4())
        payload = AnnouncementCreate(
            title="Department Notice",
            slug="department-notice",
            scope_type="department",
            scope_id=uuid.uuid4(),
        )

        with patch.object(announcements, "can_access_scope", return_value=False, create=True):
            with self.assertRaises(HTTPException) as context:
                await announcements.create_announcement(payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_update_announcement_checks_existing_and_next_scope(self):
        own_department_id = uuid.uuid4()
        other_department_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        item = _announcement("department", own_department_id)
        payload = AnnouncementUpdate(scope_type="department", scope_id=other_department_id)

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own_department_id

        with (
            patch.object(announcements.AnnouncementService, "get_by_id", return_value=item),
            patch.object(announcements, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await announcements.update_announcement(item.id, payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)


if __name__ == "__main__":
    unittest.main()
