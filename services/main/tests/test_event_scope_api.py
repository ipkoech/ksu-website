import unittest
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from app.api.v1 import events
from app.schemas import EventCreate, EventUpdate


class _FakeSelector:
    load_options = ()

    def apply(self, value):
        return value


class _Page:
    def __init__(self, items):
        self.items = items
        self.meta = {"total": len(items)}


def _event(scope_type, scope_id):
    return SimpleNamespace(
        id=uuid.uuid4(),
        scope_type=scope_type,
        scope_id=scope_id,
    )


class EventScopeApiTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_events_list_filters_by_user_scope(self):
        own_department_id = uuid.uuid4()
        other_department_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        page = _Page([
            _event("department", own_department_id),
            _event("department", other_department_id),
        ])

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own_department_id

        with (
            patch.object(events, "build_selector", return_value=_FakeSelector()),
            patch.object(events.EventService, "list_admin", return_value=page),
            patch.object(events, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            response = await events.list_admin_events(db=None, user=user)

        self.assertEqual([page.items[0]], response["data"])
        self.assertEqual(1, response["meta"]["total"])

    async def test_create_event_rejects_unowned_scope(self):
        user = SimpleNamespace(id=uuid.uuid4())
        payload = EventCreate(
            title="Department Event",
            slug="department-event",
            start_date=datetime(2026, 7, 1, tzinfo=timezone.utc),
            scope_type="department",
            scope_id=uuid.uuid4(),
        )

        with patch.object(events, "can_access_scope", return_value=False, create=True):
            with self.assertRaises(HTTPException) as context:
                await events.create_event(payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_update_event_checks_existing_and_next_scope(self):
        own_department_id = uuid.uuid4()
        other_department_id = uuid.uuid4()
        user = SimpleNamespace(id=uuid.uuid4())
        item = _event("department", own_department_id)
        payload = EventUpdate(scope_type="department", scope_id=other_department_id)

        async def fake_can_access(_db, _user, _permission, _scope_type, scope_id):
            return scope_id == own_department_id

        with (
            patch.object(events.EventService, "get_by_id", return_value=item),
            patch.object(events, "can_access_scope", side_effect=fake_can_access, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await events.update_event(item.id, payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)


if __name__ == "__main__":
    unittest.main()
