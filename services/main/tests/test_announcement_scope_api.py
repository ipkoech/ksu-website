import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.api.v1 import announcements
from app.models import Announcement
from app.schemas import AnnouncementCreate, AnnouncementUpdate
from app.services.change_tracking import begin_audit_context, reset_audit_context
from app.services.content import AnnouncementService


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
            patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access),
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

        with patch("app.api.v1._scoped._can_access_scope", return_value=False):
            with self.assertRaises(HTTPException) as context:
                await announcements.create_announcement(payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_get_announcement_by_id_rejects_unowned_scope(self):
        user = SimpleNamespace(id=uuid.uuid4())
        item = _announcement("department", uuid.uuid4())

        with (
            patch.object(announcements, "build_selector", return_value=_FakeSelector()),
            patch.object(announcements.AnnouncementService, "get_by_id", return_value=item),
            patch("app.api.v1._scoped._can_access_scope", return_value=False),
        ):
            with self.assertRaises(HTTPException) as context:
                await announcements.get_announcement_by_id(item.id, db=None, user=user)

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
            patch("app.api.v1._scoped._can_access_scope", side_effect=fake_can_access),
        ):
            with self.assertRaises(HTTPException) as context:
                await announcements.update_announcement(item.id, payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_update_stamps_updated_by_from_request_actor(self):
        actor_id = uuid.uuid4()
        item = Announcement(title="Old notice", slug="old-notice", summary="Old")
        db = SimpleNamespace(flush=AsyncMock())

        token = begin_audit_context(actor_id=actor_id)
        try:
            await AnnouncementService.update(db, item, title="New notice", slug="new-notice")
        finally:
            reset_audit_context(token)

        self.assertEqual("New notice", item.title)
        self.assertEqual(actor_id, item.updated_by_id)


if __name__ == "__main__":
    unittest.main()
