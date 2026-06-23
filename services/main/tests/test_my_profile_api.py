import unittest
import uuid
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException
from pydantic import ValidationError

from app.api.v1 import me, public_people
from app.schemas import MyProfileUpdate


class _FakeDb:
    async def flush(self):
        return None

    async def refresh(self, _record):
        return None


def _person(**overrides):
    now = datetime.now(timezone.utc)
    base = {
        "id": uuid.uuid4(),
        "created_at": now,
        "updated_at": now,
        "user_id": uuid.uuid4(),
        "title": "Dr.",
        "first_name": "Jane",
        "middle_name": None,
        "last_name": "Mwangi",
        "full_name": "Jane Mwangi",
        "email": "jane@example.com",
        "phone": "+254700000000",
        "alternative_email": None,
        "alternative_phone": None,
        "photo_id": None,
        "photo": None,
        "photo_url": None,
        "bio": "Existing bio",
        "full_bio": None,
        "qualifications": None,
        "employee_number": "EMP001",
        "employment_type": "full_time",
        "employment_start_date": None,
        "employment_end_date": None,
        "job_group": None,
        "date_of_appointment": None,
        "contract_type": None,
        "department_id": None,
        "academic_rank": "lecturer",
        "tenure_status": None,
        "specialization": None,
        "research_interests": None,
        "teaching_areas": None,
        "publications_count": 0,
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
        "slug": "person-slug",
    }
    base.update(overrides)
    return SimpleNamespace(**base)


class MyProfileApiTests(unittest.IsolatedAsyncioTestCase):
    async def test_get_my_profile_returns_linked_person(self):
        person = _person()
        user = SimpleNamespace(id=person.user_id)

        with patch.object(me.PersonService, "get_by_user_id", return_value=person) as get_by_user_id:
            response = await me.get_my_profile(_FakeDb(), user)

        self.assertEqual("success", response["status"])
        self.assertEqual(person.id, response["data"]["id"])
        self.assertEqual("Jane Mwangi", response["data"]["full_name"])
        get_by_user_id.assert_awaited_once()
        self.assertEqual(person.user_id, get_by_user_id.await_args.args[1])

    async def test_update_my_profile_updates_allowed_fields_only(self):
        person = _person()
        user = SimpleNamespace(id=person.user_id)
        payload = MyProfileUpdate(
            first_name="Janet",
            full_name="Janet Mwangi",
            email="JANET@EXAMPLE.COM",
            bio="Updated public bio",
            is_researcher=True,
            research_interests=["AI", "Education"],
        )

        with patch.object(me.PersonService, "get_by_user_id", return_value=person):
            response = await me.update_my_profile(payload, _FakeDb(), user)

        self.assertEqual("success", response["status"])
        self.assertEqual("Janet", person.first_name)
        self.assertEqual("janet@example.com", person.email)
        self.assertEqual("Updated public bio", person.bio)
        self.assertTrue(person.is_researcher)
        self.assertEqual(["AI", "Education"], person.research_interests)
        self.assertEqual("EMP001", person.employee_number)

    async def test_update_my_profile_changes_public_profile_payload(self):
        person = _person(assignments=[])
        user = SimpleNamespace(id=person.user_id)
        payload = MyProfileUpdate(
            bio="Public profile bio from staff portal",
            full_bio="Detailed public profile from staff portal",
            qualifications=[
                {
                    "degree": "PhD",
                    "field": "Education Technology",
                    "institution": "Kisii University",
                    "year": "2026",
                }
            ],
            research_interests=["Learning analytics", "AI in education"],
            teaching_areas=["Educational technology"],
            office_location="Block A, Room 12",
            office_hours={"Monday": "9:00 AM - 12:00 PM"},
            office_phone="+254700111222",
            courses_taught=["EDU 401"],
            website_url="https://example.edu/staff/jane",
            linkedin_url="https://www.linkedin.com/in/jane-mwangi",
            google_scholar_id="abc123",
            google_scholar_url="https://scholar.google.com/citations?user=abc123",
            orcid="0000-0002-1825-0097",
            researchgate_url="https://www.researchgate.net/profile/Jane-Mwangi",
            scopus_id="12345678900",
            education_background=[{"title": "PhD", "subtitle": "Kisii University"}],
            professional_memberships=[{"title": "Member", "subtitle": "Education Society"}],
            awards_honors=[{"title": "Teaching Award", "year": "2026"}],
            is_researcher=True,
        )

        with patch.object(me.PersonService, "get_by_user_id", return_value=person):
            await me.update_my_profile(payload, _FakeDb(), user)

        public_payload = await public_people._safe_person_payload(_FakeDb(), person)

        self.assertEqual("Public profile bio from staff portal", public_payload["bio"])
        self.assertEqual("Detailed public profile from staff portal", public_payload["full_bio"])
        self.assertEqual("PhD", public_payload["qualifications"][0]["degree"])
        self.assertEqual(["Learning analytics", "AI in education"], public_payload["research_interests"])
        self.assertEqual(["Educational technology"], public_payload["teaching_areas"])
        self.assertEqual("Block A, Room 12", public_payload["office_location"])
        self.assertEqual({"Monday": "9:00 AM - 12:00 PM"}, public_payload["office_hours"])
        self.assertEqual("+254700111222", public_payload["office_phone"])
        self.assertEqual(["EDU 401"], public_payload["courses_taught"])
        self.assertEqual("https://example.edu/staff/jane", public_payload["website_url"])
        self.assertEqual("https://www.linkedin.com/in/jane-mwangi", public_payload["linkedin_url"])
        self.assertEqual("abc123", public_payload["google_scholar_id"])
        self.assertEqual("https://scholar.google.com/citations?user=abc123", public_payload["google_scholar_url"])
        self.assertEqual("0000-0002-1825-0097", public_payload["orcid"])
        self.assertEqual("https://www.researchgate.net/profile/Jane-Mwangi", public_payload["researchgate_url"])
        self.assertEqual("12345678900", public_payload["scopus_id"])
        self.assertEqual([{"title": "PhD", "subtitle": "Kisii University"}], public_payload["education_background"])
        self.assertEqual([{"title": "Member", "subtitle": "Education Society"}], public_payload["professional_memberships"])
        self.assertEqual([{"title": "Teaching Award", "year": "2026"}], public_payload["awards_honors"])
        self.assertTrue(public_payload["is_researcher"])

    async def test_update_my_profile_rejects_unowned_profile_photo(self):
        person = _person()
        user = SimpleNamespace(id=person.user_id)
        media_id = uuid.uuid4()
        payload = MyProfileUpdate(photo_id=media_id)

        with (
            patch.object(me.PersonService, "get_by_user_id", return_value=person),
            patch.object(me.MediaService, "get_authorized_by_id", return_value=None),
            patch.object(me.PersonService, "update") as update_person,
        ):
            with self.assertRaises(HTTPException) as context:
                await me.update_my_profile(payload, _FakeDb(), user)

        self.assertEqual(400, context.exception.status_code)
        self.assertEqual("Choose a profile photo uploaded by your account.", context.exception.detail)
        update_person.assert_not_called()

    async def test_update_my_profile_rejects_non_image_profile_photo(self):
        person = _person()
        user = SimpleNamespace(id=person.user_id)
        media_id = uuid.uuid4()
        payload = MyProfileUpdate(photo_id=media_id)
        media = SimpleNamespace(id=media_id, uploaded_by_id=user.id, media_type="document")

        with (
            patch.object(me.PersonService, "get_by_user_id", return_value=person),
            patch.object(me.MediaService, "get_authorized_by_id", return_value=media),
            patch.object(me.PersonService, "update") as update_person,
        ):
            with self.assertRaises(HTTPException) as context:
                await me.update_my_profile(payload, _FakeDb(), user)

        self.assertEqual(400, context.exception.status_code)
        self.assertEqual("Profile photo must be an image.", context.exception.detail)
        update_person.assert_not_called()

    async def test_update_my_profile_rejects_non_document_cv(self):
        person = _person()
        user = SimpleNamespace(id=person.user_id)
        media_id = uuid.uuid4()
        payload = MyProfileUpdate(cv_file_id=media_id)
        media = SimpleNamespace(id=media_id, uploaded_by_id=user.id, media_type="image")

        with (
            patch.object(me.PersonService, "get_by_user_id", return_value=person),
            patch.object(me.MediaService, "get_authorized_by_id", return_value=media),
            patch.object(me.PersonService, "update") as update_person,
        ):
            with self.assertRaises(HTTPException) as context:
                await me.update_my_profile(payload, _FakeDb(), user)

        self.assertEqual(400, context.exception.status_code)
        self.assertEqual("CV file must be a document.", context.exception.detail)
        update_person.assert_not_called()

    async def test_my_profile_requires_linked_person(self):
        user = SimpleNamespace(id=uuid.uuid4())

        with patch.object(me.PersonService, "get_by_user_id", return_value=None):
            with self.assertRaises(HTTPException) as context:
                await me.get_my_profile(_FakeDb(), user)

        self.assertEqual(404, context.exception.status_code)
        self.assertEqual("No staff profile linked to this account", context.exception.detail)

    def test_update_schema_rejects_admin_only_fields(self):
        with self.assertRaises(ValidationError):
            MyProfileUpdate.model_validate(
                {
                    "bio": "Valid edit",
                    "department_id": str(uuid.uuid4()),
                    "academic_rank": "professor",
                    "is_public": False,
                }
            )


if __name__ == "__main__":
    unittest.main()
