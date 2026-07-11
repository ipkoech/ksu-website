import unittest
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from fastapi import HTTPException

from app.api.v1 import me, persons
from app.api.v1._person_media import with_person_photo_urls
from app.schemas import MyProfileUpdate, PersonRead, PersonUpdate


class _FakeDb:
    async def flush(self):
        return None

    async def refresh(self, _record):
        return None


class _FakeSelector:
    load_options = ()

    def apply(self, value):
        return value


class _Upload:
    def __init__(self, content_type: str, filename: str = "cv.pdf"):
        self.content_type = content_type
        self.filename = filename


def _person(**overrides):
    now = datetime.now(timezone.utc)
    data = {
        "id": uuid.uuid4(),
        "created_at": now,
        "updated_at": now,
        "user_id": uuid.uuid4(),
        "department_id": None,
        "slug": "jane-mwangi",
        "title": None,
        "first_name": "Jane",
        "middle_name": None,
        "last_name": "Mwangi",
        "full_name": "Jane Mwangi",
        "email": "jane@example.com",
        "phone": None,
        "alternative_email": None,
        "alternative_phone": None,
        "photo_id": None,
        "photo": None,
        "photo_url": None,
        "bio": None,
        "full_bio": None,
        "qualifications": None,
        "employee_number": None,
        "employment_type": "full_time",
        "employment_start_date": None,
        "employment_end_date": None,
        "job_group": None,
        "date_of_appointment": None,
        "contract_type": None,
        "academic_rank": None,
        "tenure_status": None,
        "specialization": None,
        "research_interests": None,
        "teaching_areas": None,
        "publications_count": 0,
        "publication_records": None,
        "research_grants_won": None,
        "h_index": None,
        "office_location": None,
        "office_hours": None,
        "office_phone": None,
        "courses_taught": None,
        "institutional_role": None,
        "leadership_message": None,
        "website_url": None,
        "linkedin_url": None,
        "google_scholar_id": None,
        "google_scholar_url": None,
        "orcid": None,
        "researchgate_url": None,
        "scopus_id": None,
        "education_background": None,
        "professional_memberships": None,
        "awards_honors": None,
        "cv_file_id": None,
        "cv_file": None,
        "department": None,
        "assignments": None,
        "programme_tutorships": None,
        "alumni_profile": None,
        "is_active": True,
        "is_public": True,
        "is_researcher": False,
        "is_featured": False,
        "show_on_directory": True,
    }
    data.update(overrides)
    return SimpleNamespace(**data)


class PersonCvMediaTests(unittest.IsolatedAsyncioTestCase):
    def test_person_read_declares_cv_attachment_fields(self):
        self.assertIn("cv_file_id", PersonRead.model_fields)
        self.assertIn("cv_file", PersonRead.model_fields)
        self.assertIn("cv_file_url", PersonRead.model_fields)

    def test_person_media_helper_adds_browser_loadable_cv_url(self):
        payload = {"cv_file": {"public_url": "/uploads/persons/jane/cv/jane-cv.pdf"}}

        result = with_person_photo_urls(payload, SimpleNamespace(cv_file=None))

        self.assertEqual("/uploads/persons/jane/cv/jane-cv.pdf", result["cv_file_url"])

    async def test_self_service_cv_attachment_returns_file_details_and_url(self):
        cv_id = uuid.uuid4()
        person = _person(
            cv_file_id=cv_id,
            cv_file=SimpleNamespace(
                id=cv_id,
                original_filename="jane-cv.pdf",
                mime_type="application/pdf",
                public_url="/uploads/persons/jane/cv/jane-cv.pdf",
            ),
        )
        user = SimpleNamespace(id=person.user_id)

        with patch.object(me.PersonService, "get_by_user_id", return_value=person):
            response = await me.get_my_profile(_FakeDb(), user)

        self.assertEqual(cv_id, response["data"]["cv_file_id"])
        self.assertEqual("jane-cv.pdf", response["data"]["cv_file"]["original_filename"])
        self.assertEqual("/uploads/persons/jane/cv/jane-cv.pdf", response["data"]["cv_file_url"])

    async def test_self_service_can_replace_owned_pdf_cv(self):
        person = _person()
        user = SimpleNamespace(id=person.user_id)
        cv_id = uuid.uuid4()
        cv = SimpleNamespace(
            id=cv_id,
            uploaded_by_id=user.id,
            media_type="document",
            mime_type="application/pdf",
        )

        with (
            patch.object(me.PersonService, "get_by_user_id", return_value=person),
            patch.object(me.MediaService, "get_authorized_by_id", return_value=cv),
        ):
            response = await me.update_my_profile(MyProfileUpdate(cv_file_id=cv_id), _FakeDb(), user)

        self.assertEqual(cv_id, person.cv_file_id)
        self.assertEqual(cv_id, response["data"]["cv_file_id"])

    async def test_manager_can_attach_cv_for_person_in_managed_scope(self):
        person = _person(department_id=uuid.uuid4())
        user = SimpleNamespace(id=uuid.uuid4())
        cv_id = uuid.uuid4()
        cv = SimpleNamespace(id=cv_id, media_type="document", mime_type="application/pdf")
        db = _FakeDb()

        with (
            patch.object(persons.PersonService, "get_by_id", side_effect=[person, person]),
            patch.object(persons.PersonService, "update", new_callable=AsyncMock, return_value=person) as update,
            patch.object(persons.MediaService, "get_authorized_by_id", return_value=cv),
            patch.object(persons, "can_access_scope", return_value=True, create=True),
            patch.object(persons, "build_selector", return_value=_FakeSelector()),
            patch.object(persons, "with_person_photo_urls", side_effect=lambda data, _source: data),
        ):
            await persons.update_person(person.id, PersonUpdate(cv_file_id=cv_id), db, user)

        update.assert_awaited_once_with(db, person, cv_file_id=cv_id)

    async def test_manager_cannot_attach_non_cv_document(self):
        person = _person(department_id=uuid.uuid4())
        user = SimpleNamespace(id=uuid.uuid4())
        cv_id = uuid.uuid4()
        spreadsheet = SimpleNamespace(
            id=cv_id,
            media_type="document",
            mime_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )

        with (
            patch.object(persons.PersonService, "get_by_id", return_value=person),
            patch.object(persons.MediaService, "get_authorized_by_id", return_value=spreadsheet),
            patch.object(persons, "can_access_scope", return_value=True, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await persons.update_person(person.id, PersonUpdate(cv_file_id=cv_id), _FakeDb(), user)

        self.assertEqual(400, context.exception.status_code)
        self.assertEqual("CV file must be a PDF or Word document.", context.exception.detail)

    async def test_manager_cv_upload_attaches_pdf_using_person_cv_role(self):
        person = _person(department_id=uuid.uuid4())
        user = SimpleNamespace(id=uuid.uuid4())
        uploaded_cv = SimpleNamespace(id=uuid.uuid4())
        db = _FakeDb()

        with (
            patch.object(persons.PersonService, "get_by_id", side_effect=[person, person]),
            patch.object(persons.PersonService, "update", new_callable=AsyncMock, return_value=person) as update,
            patch.object(persons.MediaService, "upload", new_callable=AsyncMock, return_value=uploaded_cv) as upload,
            patch.object(persons, "can_access_scope", return_value=True, create=True),
            patch.object(persons, "build_selector", return_value=_FakeSelector()),
            patch.object(persons, "with_person_photo_urls", side_effect=lambda data, _source: data),
        ):
            await persons.upload_person_cv(person.id, db, user, _Upload("application/pdf"))

        upload.assert_awaited_once_with(
            db,
            file=unittest.mock.ANY,
            uploaded_by_id=user.id,
            is_public=person.is_public,
            entity_type="person",
            entity_id=person.id,
            role="cv",
        )
        update.assert_awaited_once_with(db, person, cv_file_id=uploaded_cv.id)

    async def test_manager_cv_upload_rejects_spreadsheet_mime_type(self):
        person = _person(department_id=uuid.uuid4())
        user = SimpleNamespace(id=uuid.uuid4())
        upload = _Upload("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "jane-cv.xlsx")

        with (
            patch.object(persons.PersonService, "get_by_id", return_value=person),
            patch.object(persons.MediaService, "upload", new_callable=AsyncMock) as upload_media,
            patch.object(persons, "can_access_scope", return_value=True, create=True),
        ):
            with self.assertRaises(HTTPException) as context:
                await persons.upload_person_cv(person.id, _FakeDb(), user, upload)

        self.assertEqual(400, context.exception.status_code)
        self.assertEqual("CV file must be a PDF or Word document.", context.exception.detail)
        upload_media.assert_not_awaited()

    async def test_manager_can_unlink_cv(self):
        person = _person(department_id=uuid.uuid4(), cv_file_id=uuid.uuid4())
        user = SimpleNamespace(id=uuid.uuid4())
        db = _FakeDb()

        with (
            patch.object(persons.PersonService, "get_by_id", return_value=person),
            patch.object(persons.PersonService, "update", new_callable=AsyncMock, return_value=person) as update,
            patch.object(persons, "can_access_scope", return_value=True, create=True),
            patch.object(persons, "build_selector", return_value=_FakeSelector()),
            patch.object(persons, "with_person_photo_urls", side_effect=lambda data, _source: data),
        ):
            await persons.remove_person_cv(person.id, db, user)

        update.assert_awaited_once_with(db, person, cv_file_id=None)


if __name__ == "__main__":
    unittest.main()
