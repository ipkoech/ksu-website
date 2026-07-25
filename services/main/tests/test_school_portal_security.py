import unittest
import uuid

from fastapi import HTTPException
from pydantic import ValidationError

from app.schemas.school_portal import SchoolPortalProfileUpdate
from app.api.v1.school_portal.dashboard import get_school_dashboard
from app.schemas.school_portal_content import SchoolContentCreate
from app.services.school_portal_content import verify_school_content_owner
from app.services.school_portal_team import preview_school_team_import
from app.services.upload_batch import validate_file_signature


class SchoolPortalSecurityTests(unittest.IsolatedAsyncioTestCase):
    def test_expensive_dashboard_endpoint_has_a_rate_limit_wrapper(self):
        self.assertTrue(hasattr(get_school_dashboard, "__wrapped__"))

    def test_profile_and_content_forbid_scope_mass_assignment(self):
        with self.assertRaises(ValidationError):
            SchoolPortalProfileUpdate.model_validate(
                {"about": "About", "school_id": str(uuid.uuid4())}
            )
        with self.assertRaises(ValidationError):
            SchoolContentCreate(
                content_type="news",
                data={
                    "title": "Unsafe",
                    "slug": "unsafe",
                    "owner_scope_id": str(uuid.uuid4()),
                },
            )

    def test_cross_school_records_are_hidden_as_not_found(self):
        record = type(
            "Record",
            (),
            {
                "owner_scope_type": "school",
                "owner_scope_id": uuid.uuid4(),
            },
        )()
        with self.assertRaises(HTTPException) as caught:
            verify_school_content_owner(record, uuid.uuid4())
        self.assertEqual(404, caught.exception.status_code)

    def test_unsafe_rich_text_is_rejected_before_persistence(self):
        for payload in (
            "<script>alert(1)</script>",
            '<img src=x onerror="alert(1)">',
            '<a href="javascript:alert(1)">click</a>',
        ):
            with self.subTest(payload=payload), self.assertRaises(ValidationError):
                SchoolContentCreate(
                    content_type="news",
                    data={
                        "title": "Security update",
                        "slug": "security-update",
                        "rich_text": payload,
                    },
                )

    async def test_formula_cells_are_rejected_in_team_import_preview(self):
        preview = await preview_school_team_import(
            None,
            uuid.uuid4(),
            [
                {
                    "email": "safe@example.test",
                    "first_name": "=HYPERLINK(\"https://evil.test\")",
                    "last_name": "User",
                    "role": "lecturer",
                }
            ],
        )
        self.assertEqual("invalid", preview.rows[0].status)
        self.assertIn("spreadsheet formula", " ".join(preview.rows[0].errors))

    def test_upload_validation_uses_allowlisted_mime_and_magic_bytes(self):
        validate_file_signature("application/pdf", b"%PDF-1.7")
        with self.assertRaises(ValueError):
            validate_file_signature("application/x-executable", b"MZ")
        with self.assertRaises(ValueError):
            validate_file_signature("image/png", b"<svg onload=alert(1)>")


if __name__ == "__main__":
    unittest.main()
