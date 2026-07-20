import unittest
import uuid
from types import SimpleNamespace

from fastapi import FastAPI

from app.api.v1 import register_routes
from app.models.contact_inquiry import ContactInquiry, ContactInquiryMessage
from app.schemas.contact_inquiry import PublicSchoolInquiryCreate
from app.services.contact_inquiry import (
    ContactInquiryService,
    classify_inquiry_spam,
)


class _Db:
    def __init__(self):
        self.added = []

    def add(self, item):
        self.added.append(item)

    async def flush(self):
        return None

    async def refresh(self, item):
        return None


class PublicSchoolInquiryTests(unittest.IsolatedAsyncioTestCase):
    def test_public_route_and_conversation_models(self):
        app = FastAPI()
        register_routes(app)
        self.assertIn(
            "/api/v1/public/schools/{school_slug}/inquiries",
            app.openapi()["paths"],
        )
        inquiry_fields = {
            "school_id",
            "reference_number",
            "sender_name",
            "sender_email",
            "category",
            "priority",
            "assigned_to_user_id",
            "status",
            "consent_to_contact",
            "source",
            "last_message_at",
            "first_response_at",
        }
        message_fields = {
            "inquiry_id",
            "sender_type",
            "body",
            "is_internal_note",
            "delivery_status",
            "delivery_attempts",
            "idempotency_key",
            "provider_message_id",
            "delivery_error",
        }
        self.assertTrue(inquiry_fields <= set(ContactInquiry.__table__.columns.keys()))
        self.assertTrue(message_fields <= set(ContactInquiryMessage.__table__.columns.keys()))

    def test_honeypot_and_obvious_link_spam_are_detected(self):
        self.assertTrue(classify_inquiry_spam("hello", honeypot="bot-filled")[0])
        self.assertTrue(
            classify_inquiry_spam(
                " ".join(f"https://spam.example/{number}" for number in range(7)),
                honeypot="",
            )[0]
        )
        self.assertFalse(classify_inquiry_spam("Please send application details", honeypot="")[0])

    async def test_public_create_stamps_school_and_persists_initial_message(self):
        school_id = uuid.uuid4()
        school = SimpleNamespace(id=school_id, name="School of Business", slug="business")
        db = _Db()
        item = await ContactInquiryService.create_public(
            db,
            school=school,
            data=PublicSchoolInquiryCreate(
                sender_name="Jane Student",
                sender_email="jane@example.com",
                subject="Admissions question",
                message="When does the intake open?",
                consent_to_contact=True,
            ),
            source_ip="127.0.0.1",
            user_agent="test",
        )
        self.assertEqual(school_id, item.school_id)
        self.assertEqual("new", item.status)
        messages = [value for value in db.added if isinstance(value, ContactInquiryMessage)]
        self.assertEqual(1, len(messages))
        self.assertEqual("requester", messages[0].sender_type)
        self.assertEqual("received", messages[0].delivery_status)


if __name__ == "__main__":
    unittest.main()
