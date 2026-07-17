import unittest
import uuid
import json
from datetime import date
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import FastAPI, HTTPException
from pydantic import ValidationError

from app.api.v1 import register_routes
from app.models import Media, MediaFolder, School
from app.schemas.school_portal import (
    SchoolPortalDeanUpdate,
    SchoolPortalMediaLinkCreate,
    SchoolPortalProfileUpdate,
)
from app.services.school_portal_context import SchoolPortalContext
from app.services.school_portal_profile import (
    link_school_profile_media,
    set_school_dean,
    update_school_profile,
)


EDITABLE_PROFILE_FIELDS = {
    "establishment_date",
    "about",
    "head_message",
    "mission",
    "vision",
    "mandate",
    "core_values",
    "email",
    "phone",
    "office_location",
    "website",
    "is_public",
}


class _Db:
    def __init__(self):
        self.added = []
        self.flush_count = 0

    def add(self, item):
        self.added.append(item)

    async def flush(self):
        self.flush_count += 1


def _school():
    school = School(
        name="School of Computing",
        slug="school-of-computing",
        code="SOC",
        school_type="school",
        about="Old about",
        mission="Old mission",
        is_active=True,
        is_public=True,
    )
    school.id = uuid.uuid4()
    return school


def _context(*permissions):
    user = SimpleNamespace(
        id=uuid.uuid4(),
        email="admin@example.test",
        full_name="School Admin",
    )
    return SchoolPortalContext(
        school=_school(),
        user=user,
        permissions=tuple(permissions),
        role_names=("school_admin",),
    )


class SchoolPortalProfileTests(unittest.IsolatedAsyncioTestCase):
    def test_profile_update_exposes_every_editable_field_and_forbids_identity(self):
        self.assertEqual(EDITABLE_PROFILE_FIELDS, set(SchoolPortalProfileUpdate.model_fields))

        with self.assertRaises(ValidationError):
            SchoolPortalProfileUpdate(
                about="Updated",
                id=uuid.uuid4(),
                code="OTHER",
                school_id=uuid.uuid4(),
            )

    async def test_partial_update_changes_only_supplied_fields_and_enqueues_event(self):
        context = _context("school.profile.view", "school.profile.manage")
        db = _Db()
        payload = SchoolPortalProfileUpdate(
            about="New about",
            phone="+254700000000",
        )

        with patch(
            "app.services.school_portal_profile.record_school_portal_audit",
            new_callable=AsyncMock,
        ) as audit:
            school, changes = await update_school_profile(db, context, payload)

        self.assertEqual("New about", school.about)
        self.assertEqual("+254700000000", school.phone)
        self.assertEqual("Old mission", school.mission)
        self.assertEqual(
            {
                "about": {"old": "Old about", "new": "New about"},
                "phone": {"old": None, "new": "+254700000000"},
            },
            changes,
        )
        event = next(item for item in db.added if item.__class__.__name__ == "OutboxEvent")
        self.assertEqual("school.profile.updated", event.event_type)
        self.assertEqual(context.school.id, event.scope_id)
        audit.assert_awaited_once()

    async def test_profile_update_requires_manage_permission(self):
        context = _context("school.profile.view")

        with self.assertRaises(HTTPException) as caught:
            await update_school_profile(
                _Db(),
                context,
                SchoolPortalProfileUpdate(about="Forbidden"),
            )

        self.assertEqual(403, caught.exception.status_code)

    async def test_profile_event_and_audit_diff_are_json_serializable(self):
        context = _context("school.profile.manage")
        db = _Db()

        with patch(
            "app.services.school_portal_profile.record_school_portal_audit",
            new_callable=AsyncMock,
        ) as audit:
            await update_school_profile(
                db,
                context,
                SchoolPortalProfileUpdate(establishment_date=date(2020, 1, 2)),
            )

        event = next(item for item in db.added if item.__class__.__name__ == "OutboxEvent")
        json.dumps(event.payload)
        json.dumps(audit.await_args.args[1].changed_fields)

    async def test_dean_from_another_school_requires_explicit_reassignment(self):
        context = _context("school.profile.manage")
        person_id = uuid.uuid4()
        other_school_id = uuid.uuid4()
        person = SimpleNamespace(id=person_id, user_id=None, is_active=True)
        other_assignment = SimpleNamespace(
            id=uuid.uuid4(),
            entity_type="school",
            entity_id=other_school_id,
            role="dean",
            status="active",
        )

        with (
            patch("app.services.school_portal_profile.Person.get_by_id", AsyncMock(return_value=person)),
            patch(
                "app.services.school_portal_profile.StaffService.get_assignments_for_person",
                AsyncMock(return_value=[other_assignment]),
            ),
        ):
            with self.assertRaises(HTTPException) as caught:
                await set_school_dean(
                    _Db(),
                    context,
                    SchoolPortalDeanUpdate(person_id=person_id),
                )

        self.assertEqual(409, caught.exception.status_code)

    async def test_dean_assignment_updates_school_and_staff_lifecycle(self):
        context = _context("school.profile.manage")
        db = _Db()
        person_id = uuid.uuid4()
        person = SimpleNamespace(id=person_id, user_id=uuid.uuid4(), is_active=True)
        old_dean = SimpleNamespace(id=uuid.uuid4(), person_id=uuid.uuid4())

        with (
            patch("app.services.school_portal_profile.Person.get_by_id", AsyncMock(return_value=person)),
            patch(
                "app.services.school_portal_profile.StaffService.get_assignments_for_person",
                AsyncMock(return_value=[]),
            ),
            patch(
                "app.services.school_portal_profile.StaffService.get_assignments_for_entity",
                AsyncMock(return_value=[old_dean]),
            ),
            patch(
                "app.services.school_portal_profile.StaffService.end_assignment",
                AsyncMock(),
            ) as end_assignment,
            patch(
                "app.services.school_portal_profile.StaffService.assign",
                AsyncMock(return_value=SimpleNamespace(id=uuid.uuid4())),
            ) as assign,
            patch(
                "app.services.school_portal_profile.record_school_portal_audit",
                AsyncMock(),
            ),
        ):
            school = await set_school_dean(
                db,
                context,
                SchoolPortalDeanUpdate(person_id=person_id),
            )

        self.assertEqual(person_id, school.dean_id)
        end_assignment.assert_awaited_once()
        assign.assert_awaited_once()
        event = next(item for item in db.added if item.__class__.__name__ == "OutboxEvent")
        self.assertEqual("school.profile.updated", event.event_type)

    async def test_profile_media_must_belong_to_current_school_folder(self):
        context = _context("school.profile.manage")
        media = Media(
            filename="logo.png",
            original_filename="logo.png",
            mime_type="image/png",
            file_size=10,
            storage_path="logo.png",
            media_type="image",
        )
        media.id = uuid.uuid4()
        media.folder = MediaFolder(
            name="Other school",
            slug="other-school",
            scope_type="school",
            scope_id=uuid.uuid4(),
        )

        with patch(
            "app.services.school_portal_profile.MediaService.get_by_id",
            AsyncMock(return_value=media),
        ):
            with self.assertRaises(HTTPException) as caught:
                await link_school_profile_media(
                    _Db(),
                    context,
                    SchoolPortalMediaLinkCreate(media_id=media.id, role="logo"),
                )

        self.assertEqual(404, caught.exception.status_code)

    async def test_replacing_singleton_profile_media_removes_its_old_link(self):
        context = _context("school.profile.manage")
        old_media_id = uuid.uuid4()
        context.school.logo_image_id = old_media_id
        media = Media(
            filename="logo.png",
            original_filename="logo.png",
            mime_type="image/png",
            file_size=10,
            storage_path="logo.png",
            media_type="image",
        )
        media.id = uuid.uuid4()
        media.folder = MediaFolder(
            name="School media",
            slug="school-media",
            scope_type="school",
            scope_id=context.school.id,
        )
        old_link = SimpleNamespace(id=uuid.uuid4())

        with (
            patch(
                "app.services.school_portal_profile.MediaService.get_by_id",
                AsyncMock(return_value=media),
            ),
            patch(
                "app.services.school_portal_profile.MediaService.get_link_for_media",
                AsyncMock(return_value=old_link),
            ) as get_old_link,
            patch(
                "app.services.school_portal_profile.MediaService.delete_link",
                AsyncMock(),
            ) as delete_old_link,
            patch(
                "app.services.school_portal_profile.MediaService.link_media",
                AsyncMock(),
            ),
            patch(
                "app.services.school_portal_profile.record_school_portal_audit",
                AsyncMock(),
            ),
        ):
            await link_school_profile_media(
                _Db(),
                context,
                SchoolPortalMediaLinkCreate(media_id=media.id, role="logo"),
            )

        get_old_link.assert_awaited_once()
        delete_old_link.assert_awaited_once_with(unittest.mock.ANY, old_link)
        self.assertEqual(media.id, context.school.logo_image_id)

    def test_profile_routes_are_registered_without_school_id_parameters(self):
        app = FastAPI()
        register_routes(app)
        paths = app.openapi()["paths"]

        self.assertIn("/api/v1/school-portal/profile", paths)
        self.assertIn("get", paths["/api/v1/school-portal/profile"])
        self.assertIn("patch", paths["/api/v1/school-portal/profile"])
        self.assertIn("/api/v1/school-portal/profile/dean", paths)
        self.assertIn("/api/v1/school-portal/profile/media", paths)


if __name__ == "__main__":
    unittest.main()
