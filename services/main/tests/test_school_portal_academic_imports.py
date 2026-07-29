import unittest
import uuid

from app.services.imports import SCHOOL_PORTAL_IMPORT_RESOURCES
from app.services.school_portal_academics import (
    commit_school_academic_import,
    preview_school_academic_import,
    stamp_school_academic_import_row,
)
from app.schemas.school_portal_academics import SchoolAcademicImportRequest
from app.services.school_portal_context import SchoolPortalContext
from fastapi import HTTPException
from types import SimpleNamespace
from app.api.v1.school_portal.departments import preview_department_import


class SchoolPortalAcademicImportTests(unittest.IsolatedAsyncioTestCase):
    def test_school_academic_import_adapters_exclude_ownership_columns(self):
        for resource in ("departments", "programmes"):
            config = SCHOOL_PORTAL_IMPORT_RESOURCES[resource]
            self.assertEqual(("csv", "xlsx"), config["accepted_formats"])
            self.assertNotIn("school_id", config["columns"])

    def test_import_ownership_is_always_server_stamped(self):
        school_id = uuid.uuid4()
        row = stamp_school_academic_import_row(
            "departments",
            {
                "name": "Computing",
                "code": "COMP",
                "slug": "computing",
                "school_id": str(uuid.uuid4()),
            },
            school_id,
        )
        self.assertEqual(school_id, row["school_id"])

    async def test_department_preview_detects_duplicate_code(self):
        preview = await preview_school_academic_import(
            None,
            "departments",
            uuid.uuid4(),
            [
                {"name": "Computing", "code": "COMP", "slug": "computing"},
                {"name": "Other", "code": "COMP", "slug": "other"},
            ],
        )
        self.assertEqual("valid", preview.rows[0].status)
        self.assertEqual("duplicate", preview.rows[1].status)

    async def test_programme_preview_requires_department_but_ignores_school_id(self):
        preview = await preview_school_academic_import(
            None,
            "programmes",
            uuid.uuid4(),
            [
                {
                    "name": "BSc Computing",
                    "code": "BSCOMP",
                    "slug": "bsc-computing",
                    "level": "undergraduate",
                    "duration": "4 years",
                    "school_id": str(uuid.uuid4()),
                }
            ],
        )
        self.assertEqual("invalid", preview.rows[0].status)
        self.assertIn("department_id is required", preview.rows[0].errors)

    async def test_all_or_nothing_commit_rejects_invalid_preview(self):
        context = SchoolPortalContext(
            school=SimpleNamespace(id=uuid.uuid4()),
            user=SimpleNamespace(id=uuid.uuid4()),
            permissions=("school.departments.bulk",),
            role_names=("school_admin",),
        )
        request = SchoolAcademicImportRequest(
            resource="departments",
            rows=[{"name": "Missing identity"}],
            mode="all_or_nothing",
            idempotency_key="departments-0001",
        )

        with self.assertRaises(HTTPException) as caught:
            await commit_school_academic_import(None, context, request)

        self.assertEqual(422, caught.exception.status_code)

    async def test_preview_requires_resource_bulk_permission(self):
        context = SchoolPortalContext(
            school=SimpleNamespace(id=uuid.uuid4()),
            user=SimpleNamespace(id=uuid.uuid4()),
            permissions=("school.departments.view",),
            role_names=("school_editor",),
        )
        request = SchoolAcademicImportRequest(
            resource="departments",
            rows=[{"name": "Computing", "code": "COMP", "slug": "computing"}],
            idempotency_key="departments-0002",
        )

        with self.assertRaises(HTTPException) as caught:
            await preview_department_import(request, None, context)

        self.assertEqual(403, caught.exception.status_code)


if __name__ == "__main__":
    unittest.main()
