import unittest
import uuid
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import FastAPI, HTTPException

from app.api.v1 import register_routes
from app.models.contact_inquiry import ContactInquiryMessage
from app.schemas.contact_inquiry import InquiryReplyCreate
from app.services.contact_inquiry import ContactInquiryService
from app.helpers.email import _build_message


class _Db:
    def __init__(self):
        self.added = []

    def add(self, item):
        self.added.append(item)

    async def flush(self):
        return None

    async def refresh(self, item):
        return None


def _context(school_id=None):
    return SimpleNamespace(
        school=SimpleNamespace(id=school_id or uuid.uuid4()),
        user=SimpleNamespace(id=uuid.uuid4(), full_name="School Admin", email="admin@example.test"),
        permissions=("school.inquiries.view", "school.inquiries.manage", "school.inquiries.reply"),
    )


class SchoolPortalInquiryTests(unittest.IsolatedAsyncioTestCase):
    def test_outbound_reply_sets_monitored_reply_to(self):
        message = _build_message(
            to_email="requester@example.com",
            subject="Reply",
            text_body="Response",
            reply_to_email="school@example.com",
        )
        self.assertEqual("school@example.com", message["Reply-To"])

    def test_school_inquiry_routes_cover_conversation_actions(self):
        app = FastAPI()
        register_routes(app)
        paths = app.openapi()["paths"]
        base = "/api/v1/school-portal/inquiries"
        self.assertIn(base, paths)
        self.assertIn(f"{base}/{{inquiry_id}}", paths)
        self.assertIn(f"{base}/{{inquiry_id}}/assign", paths)
        self.assertIn(f"{base}/{{inquiry_id}}/status", paths)
        self.assertIn(f"{base}/{{inquiry_id}}/notes", paths)
        self.assertIn(f"{base}/{{inquiry_id}}/replies", paths)

    def test_cross_school_inquiry_is_hidden(self):
        with self.assertRaises(HTTPException) as caught:
            ContactInquiryService.verify_school(
                SimpleNamespace(school_id=uuid.uuid4()),
                uuid.uuid4(),
            )
        self.assertEqual(404, caught.exception.status_code)

    async def test_reply_is_persisted_pending_before_delivery_is_queued(self):
        db = _Db()
        context = _context()
        inquiry = SimpleNamespace(
            id=uuid.uuid4(),
            school_id=context.school.id,
            sender_name="Jane",
            sender_email="jane@example.test",
            subject="Question",
            status="open",
            first_response_at=None,
            last_message_at=None,
        )
        queued_states = []

        def capture_dispatch(*args, **kwargs):
            message = next(value for value in db.added if isinstance(value, ContactInquiryMessage))
            queued_states.append(message.delivery_status)

        with patch(
            "app.services.contact_inquiry.queue_inquiry_reply.apply_async",
            side_effect=capture_dispatch,
        ):
            message = await ContactInquiryService.reply(
                db,
                inquiry,
                context,
                InquiryReplyCreate(
                    body="The intake opens next month.",
                    idempotency_key="reply-001",
                ),
            )

        self.assertEqual("pending", message.delivery_status)
        self.assertEqual(["pending"], queued_states)
        self.assertEqual("replied", inquiry.status)
        self.assertIsNotNone(inquiry.first_response_at)


if __name__ == "__main__":
    unittest.main()
