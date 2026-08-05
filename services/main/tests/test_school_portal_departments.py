import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI, HTTPException
from pydantic import ValidationError

from app.api.v1 import register_routes
from app.models import Department
from app.schemas.school_portal_academics import (
    SchoolDepartmentCreate,
    SchoolDepartmentUpdate,
)
from app.services.school_portal_academics import (
    create_school_department,
    delete_school_department,
    get_school_department,
    update_school_department,
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


class SchoolPortalDepartmentTests(unittest.IsolatedAsyncioTestCase):
    def test_department_payload_forbids_caller_school_ownership(self):
        with self.assertRaises(ValidationError):
            SchoolDepartmentCreate(
                name="Computing",
                slug="computing",
                code="COMP",
                school_id=uuid.uuid4(),
            )

    async def test_create_stamps_school_and_emits_change_event(self):
        context = _context("school.departments.manage")
        department = Department(name="Computing", slug="computing", code="COMP")
        department.id = uuid.uuid4()
        db = _Db()
        with (
            patch(
                "app.services.school_portal_academics.ensure_department_identity_available",
                AsyncMock(),
            ),
            patch(
                "app.services.school_portal_academics.DepartmentService.create",
                AsyncMock(return_value=department),
            ) as create,
            patch(
                "app.services.school_portal_academics.record_school_portal_audit",
                AsyncMock(),
            ),
        ):
            result = await create_school_department(
                db,
                context,
                SchoolDepartmentCreate(
                    name="Computing",
                    slug="computing",
                    code="COMP",
                ),
            )

        self.assertIs(department, result)
        self.assertEqual(context.school.id, create.await_args.kwargs["school_id"])
        event = next(item for item in db.added if item.__class__.__name__ == "OutboxEvent")
        self.assertEqual("school.department.changed", event.event_type)

    async def test_cross_school_department_is_hidden(self):
        context = _context("school.departments.view")
        with patch(
            "app.services.school_portal_academics.get_school_record_or_404",
            AsyncMock(side_effect=HTTPException(status_code=404)),
        ):
            with self.assertRaises(HTTPException) as caught:
                await get_school_department(_Db(), context, uuid.uuid4())
        self.assertEqual(404, caught.exception.status_code)

    async def test_update_rejects_duplicate_code_or_slug_as_conflict(self):
        context = _context("school.departments.manage")
        department = SimpleNamespace(id=uuid.uuid4())
        with (
            patch(
                "app.services.school_portal_academics.get_school_record_or_404",
                AsyncMock(return_value=department),
            ),
            patch(
                "app.services.school_portal_academics.ensure_department_identity_available",
                AsyncMock(side_effect=HTTPException(status_code=409)),
            ),
        ):
            with self.assertRaises(HTTPException) as caught:
                await update_school_department(
                    _Db(),
                    context,
                    department.id,
                    SchoolDepartmentUpdate(code="OTHER"),
                )
        self.assertEqual(409, caught.exception.status_code)

    async def test_delete_with_history_deactivates_instead_of_hard_delete(self):
        context = _context("school.departments.manage")
        department = SimpleNamespace(id=uuid.uuid4(), is_active=True, is_public=False)
        db = _Db()
        with (
            patch(
                "app.services.school_portal_academics.get_school_record_or_404",
                AsyncMock(return_value=department),
            ),
            patch(
                "app.services.school_portal_academics.department_dependency_count",
                AsyncMock(return_value=3),
            ),
            patch(
                "app.services.school_portal_academics.record_school_portal_audit",
                AsyncMock(),
            ),
        ):
            disposition = await delete_school_department(
                db, context, department.id
            )

        self.assertEqual("deactivated", disposition)
        self.assertFalse(department.is_active)
        self.assertEqual([], db.deleted)

    async def test_unused_private_department_is_hard_deleted(self):
        context = _context("school.departments.manage")
        department = SimpleNamespace(id=uuid.uuid4(), is_active=True, is_public=False)
        db = _Db()
        with (
            patch(
                "app.services.school_portal_academics.get_school_record_or_404",
                AsyncMock(return_value=department),
            ),
            patch(
                "app.services.school_portal_academics.department_dependency_count",
                AsyncMock(return_value=0),
            ),
            patch(
                "app.services.school_portal_academics.record_school_portal_audit",
                AsyncMock(),
            ),
        ):
            disposition = await delete_school_department(db, context, department.id)

        self.assertEqual("deleted", disposition)
        self.assertEqual([department], db.deleted)

    async def test_cover_media_from_another_school_is_hidden(self):
        context = _context("school.departments.manage")
        media_id = uuid.uuid4()
        payload = SchoolDepartmentCreate(
            name="Computing",
            slug="computing",
            code="COMP",
            cover_image_id=media_id,
        )
        media = SimpleNamespace(
            id=media_id,
            media_type="image",
            folder=SimpleNamespace(scope_type="school", scope_id=uuid.uuid4()),
        )
        with (
            patch(
                "app.services.school_portal_academics.ensure_department_identity_available",
                AsyncMock(),
            ),
            patch(
                "app.services.school_portal_academics.MediaService.get_by_id",
                AsyncMock(return_value=media),
            ),
        ):
            with self.assertRaises(HTTPException) as caught:
                await create_school_department(_Db(), context, payload)

        self.assertEqual(404, caught.exception.status_code)

    def test_department_routes_are_school_scoped(self):
        app = FastAPI()
        register_routes(app)
        paths = app.openapi()["paths"]
        self.assertIn("/api/v1/school-portal/departments", paths)
        self.assertIn("/api/v1/school-portal/departments/{department_id}", paths)
        self.assertIn("/api/v1/school-portal/departments/imports", paths)


if __name__ == "__main__":
    unittest.main()
