import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI, HTTPException
from pydantic import ValidationError

from app.api.v1 import register_routes
from app.models import Programme
from app.schemas.school_portal_academics import (
    SchoolProgrammeCreate,
    SchoolProgrammeUpdate,
)
from app.services.school_portal_academics import (
    create_school_programme,
    delete_school_programme,
    get_school_programme,
    update_school_programme,
)
from app.services.school_portal_context import SchoolPortalContext


class _Db:
    def __init__(self):
        self.added = []
        self.deleted = []

    def add(self, item):
        self.added.append(item)

    async def delete(self, item):
        self.deleted.append(item)

    async def flush(self):
        return None


def _context(*permissions):
    return SchoolPortalContext(
        school=SimpleNamespace(id=uuid.uuid4()),
        user=SimpleNamespace(id=uuid.uuid4()),
        permissions=permissions,
        role_names=("school_admin",),
    )


def _payload(department_id):
    return SchoolProgrammeCreate(
        name="BSc Computer Science",
        code="BSCS",
        slug="bsc-computer-science",
        level="undergraduate",
        duration="4 years",
        department_id=department_id,
        curriculum_overview="Eight semesters",
        entry_requirements="KCSE requirements",
        fees_structure={"currency": "KES", "annual": 120000},
        accreditation_status="accredited",
        tutor_ids=[uuid.uuid4()],
        intake_ids=[uuid.uuid4()],
    )


class SchoolPortalProgrammeTests(unittest.IsolatedAsyncioTestCase):
    def test_programme_payload_forbids_school_id(self):
        with self.assertRaises(ValidationError):
            SchoolProgrammeCreate(
                **_payload(uuid.uuid4()).model_dump(),
                school_id=uuid.uuid4(),
            )

    async def test_create_rejects_department_from_another_school(self):
        context = _context("school.programmes.manage")
        with patch(
            "app.services.school_portal_academics.get_school_record_or_404",
            AsyncMock(side_effect=HTTPException(status_code=404)),
        ):
            with self.assertRaises(HTTPException) as caught:
                await create_school_programme(
                    _Db(), context, _payload(uuid.uuid4())
                )
        self.assertEqual(404, caught.exception.status_code)

    async def test_create_adds_tutors_intakes_and_emits_event(self):
        context = _context("school.programmes.manage")
        department = SimpleNamespace(id=uuid.uuid4(), school_id=context.school.id)
        payload = _payload(department.id)
        programme = Programme(
            name=payload.name,
            code=payload.code,
            slug=payload.slug,
            level=payload.level,
            duration=payload.duration,
            department_id=department.id,
        )
        programme.id = uuid.uuid4()
        db = _Db()
        with (
            patch(
                "app.services.school_portal_academics.get_school_record_or_404",
                AsyncMock(return_value=department),
            ),
            patch(
                "app.services.school_portal_academics.ensure_programme_identity_available",
                AsyncMock(),
            ),
            patch(
                "app.services.school_portal_academics.ProgrammeService.create",
                AsyncMock(return_value=programme),
            ),
            patch(
                "app.services.school_portal_academics.ensure_person_in_school",
                AsyncMock(),
            ),
            patch(
                "app.services.school_portal_academics.ProgrammeService.add_tutor",
                AsyncMock(),
            ) as add_tutor,
            patch(
                "app.services.school_portal_academics.Intake.get_by_id",
                AsyncMock(return_value=SimpleNamespace(id=payload.intake_ids[0])),
            ),
            patch(
                "app.services.school_portal_academics.ProgrammeService.attach_intake",
                AsyncMock(),
            ) as attach_intake,
            patch(
                "app.services.school_portal_academics.record_school_portal_audit",
                AsyncMock(),
            ),
        ):
            result = await create_school_programme(db, context, payload)

        self.assertIs(programme, result)
        add_tutor.assert_awaited_once()
        attach_intake.assert_awaited_once()
        event = next(item for item in db.added if item.__class__.__name__ == "OutboxEvent")
        self.assertEqual("school.programme.changed", event.event_type)

    async def test_cross_school_programme_is_hidden(self):
        context = _context("school.programmes.view")
        with patch(
            "app.services.school_portal_academics.get_school_record_or_404",
            AsyncMock(side_effect=HTTPException(status_code=404)),
        ):
            with self.assertRaises(HTTPException) as caught:
                await get_school_programme(_Db(), context, uuid.uuid4())
        self.assertEqual(404, caught.exception.status_code)

    async def test_programme_with_history_is_deactivated(self):
        context = _context("school.programmes.manage")
        programme = SimpleNamespace(id=uuid.uuid4(), is_active=True)
        db = _Db()
        with (
            patch(
                "app.services.school_portal_academics.get_school_record_or_404",
                AsyncMock(return_value=programme),
            ),
            patch(
                "app.services.school_portal_academics.programme_dependency_count",
                AsyncMock(return_value=1),
            ),
            patch(
                "app.services.school_portal_academics.record_school_portal_audit",
                AsyncMock(),
            ),
        ):
            disposition = await delete_school_programme(
                db, context, programme.id
            )
        self.assertEqual("deactivated", disposition)
        self.assertFalse(programme.is_active)

    async def test_active_unused_programme_is_deactivated_not_hard_deleted(self):
        context = _context("school.programmes.manage")
        programme = SimpleNamespace(id=uuid.uuid4(), is_active=True)
        db = _Db()
        with (
            patch(
                "app.services.school_portal_academics.get_school_record_or_404",
                AsyncMock(return_value=programme),
            ),
            patch(
                "app.services.school_portal_academics.programme_dependency_count",
                AsyncMock(return_value=0),
            ),
            patch(
                "app.services.school_portal_academics.record_school_portal_audit",
                AsyncMock(),
            ),
        ):
            disposition = await delete_school_programme(
                db, context, programme.id
            )

        self.assertEqual("deactivated", disposition)
        self.assertEqual([], db.deleted)

    async def test_update_rejects_duplicate_programme_identity(self):
        context = _context("school.programmes.manage")
        programme = SimpleNamespace(id=uuid.uuid4())
        with (
            patch(
                "app.services.school_portal_academics.get_school_record_or_404",
                AsyncMock(return_value=programme),
            ),
            patch(
                "app.services.school_portal_academics.ensure_programme_identity_available",
                AsyncMock(side_effect=HTTPException(status_code=409)),
            ),
        ):
            with self.assertRaises(HTTPException) as caught:
                await update_school_programme(
                    _Db(),
                    context,
                    programme.id,
                    SchoolProgrammeUpdate(code="OTHER"),
                )
        self.assertEqual(409, caught.exception.status_code)

    def test_programme_routes_are_school_scoped(self):
        app = FastAPI()
        register_routes(app)
        paths = app.openapi()["paths"]
        self.assertIn("/api/v1/school-portal/programmes", paths)
        self.assertIn("/api/v1/school-portal/programmes/{programme_id}", paths)
        self.assertIn("/api/v1/school-portal/programmes/imports", paths)


if __name__ == "__main__":
    unittest.main()
