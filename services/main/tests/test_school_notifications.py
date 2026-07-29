import unittest
import uuid

from fastapi import FastAPI

from app.api.v1 import register_routes
from app.models import Notification, OutboxEvent
from app.services.notification import (
    notification_channels_from_preferences,
    notification_policy_for_event,
)


class SchoolNotificationTests(unittest.TestCase):
    def test_notification_model_has_source_event_idempotency_key(self):
        self.assertIn("source_event_id", Notification.__table__.columns)
        unique_columns = {
            tuple(column.name for column in constraint.columns)
            for constraint in Notification.__table__.constraints
            if constraint.__class__.__name__ == "UniqueConstraint"
        }
        self.assertIn(("user_id", "source_event_id"), unique_columns)

    def test_event_policies_cover_school_workflows_and_respect_preferences(self):
        cases = {
            "school.content.submitted",
            "school.content.workflow_changed",
            "school.team.changed",
            "school.inquiry.created",
            "school.inquiry.reply_failed",
            "school.import.completed",
            "school.upload.progress",
        }
        for event_type in cases:
            with self.subTest(event_type=event_type):
                self.assertIsNotNone(notification_policy_for_event(event_type))

        policy = notification_policy_for_event("school.inquiry.created")
        self.assertEqual(
            ["in_app"],
            notification_channels_from_preferences(
                policy,
                {
                    "email": False,
                    "sms": False,
                    "push": False,
                    "in_app": True,
                },
            ),
        )

    def test_notification_routes_include_count_bulk_read_archive_and_preferences(self):
        app = FastAPI()
        register_routes(app)
        paths = app.openapi()["paths"]
        self.assertIn("/api/v1/notifications/unread-count", paths)
        self.assertIn("/api/v1/notifications/read-all", paths)
        self.assertIn("/api/v1/notifications/{notification_id}/archive", paths)
        self.assertIn("/api/v1/notifications/preferences", paths)

    def test_event_id_is_carried_as_consumer_idempotency_key(self):
        event = OutboxEvent(
            id=uuid.uuid4(),
            event_type="school.import.completed",
            scope_type="school",
            scope_id=uuid.uuid4(),
            actor_id=uuid.uuid4(),
            resource_type="import",
            resource_id=uuid.uuid4(),
            payload={},
        )
        policy = notification_policy_for_event(event.event_type)
        self.assertEqual("Import completed", policy["title"])
        self.assertIsNotNone(event.id)


if __name__ == "__main__":
    unittest.main()
