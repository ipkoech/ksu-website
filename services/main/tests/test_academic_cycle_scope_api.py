import unittest
import uuid
from datetime import date
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app import schemas
from app.api.v1 import academic_calendars, intakes


class _FakeSelector:
    load_options = ()

    def apply(self, value):
        return value


class _Page:
    def __init__(self, items):
        self.items = items
        self.meta = {"total": len(items)}


class AcademicCycleScopeApiTests(unittest.IsolatedAsyncioTestCase):
    async def test_admin_calendar_list_requires_university_scope(self):
        user = SimpleNamespace(id=uuid.uuid4())

        with (
            patch.object(academic_calendars, "build_selector", return_value=_FakeSelector()),
            patch.object(academic_calendars, "can_access_scope", return_value=False, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await academic_calendars.list_admin_academic_calendars(db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_create_calendar_rejects_university_scope_without_permission(self):
        user = SimpleNamespace(id=uuid.uuid4())
        payload = schemas.AcademicCalendarCreate(
            academic_year="2026/2027",
            semester=1,
            start_date=date(2026, 9, 1),
            end_date=date(2026, 12, 20),
        )

        with patch.object(academic_calendars, "can_access_scope", return_value=False, create=True):
            with self.assertRaises(HTTPException) as context:
                await academic_calendars.create_academic_calendar(payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_admin_intakes_list_requires_university_scope(self):
        user = SimpleNamespace(id=uuid.uuid4())

        with (
            patch.object(intakes, "build_selector", return_value=_FakeSelector()),
            patch.object(intakes.IntakeService, "list", AsyncMock(return_value=_Page([]))),
            patch.object(intakes, "can_access_scope", return_value=False, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await intakes.list_admin_intakes(db=None, user=user)

        self.assertEqual(403, context.exception.status_code)

    async def test_create_intake_rejects_university_scope_without_permission(self):
        user = SimpleNamespace(id=uuid.uuid4())
        payload = schemas.IntakeCreate(
            name="September 2026",
            code="SEP2026",
            academic_calendar_id=uuid.uuid4(),
            application_start=date(2026, 6, 1),
            application_end=date(2026, 8, 15),
        )

        with patch.object(intakes, "can_access_scope", return_value=False, create=True):
            with self.assertRaises(HTTPException) as context:
                await intakes.create_intake(payload, db=None, user=user)

        self.assertEqual(403, context.exception.status_code)


if __name__ == "__main__":
    unittest.main()
