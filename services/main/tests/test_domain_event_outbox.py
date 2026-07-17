import unittest
import uuid
from datetime import datetime, timezone
from pathlib import Path
from types import SimpleNamespace

from app.models import OutboxEvent
from app.services.domain_events import (
    domain_event_envelope,
    enqueue_domain_event,
)
from app.tasks.outbox import mark_publish_failed, mark_published


ROOT = Path(__file__).parents[1]
MIGRATION = (
    ROOT
    / "migrations"
    / "versions"
    / "20260717_0028_add_outbox_events.py"
)


class _TransactionalDb:
    def __init__(self):
        self.pending = []
        self.commit_count = 0
        self.flush_count = 0

    def add(self, item):
        self.pending.append(item)

    async def commit(self):
        self.commit_count += 1

    async def flush(self):
        self.flush_count += 1

    async def rollback(self):
        self.pending.clear()


class DomainEventOutboxTests(unittest.IsolatedAsyncioTestCase):
    def test_publish_state_retries_then_dead_letters(self):
        now = datetime.now(timezone.utc)
        event = OutboxEvent(
            event_type="school.profile.updated",
            scope_type="school",
            scope_id=uuid.uuid4(),
            resource_type="school",
            resource_id=uuid.uuid4(),
            publish_attempts=1,
            delivery_status="publishing",
        )
        mark_publish_failed(event, "redis unavailable", now=now, max_attempts=3)
        self.assertEqual("failed", event.delivery_status)
        self.assertIsNotNone(event.next_attempt_at)
        self.assertIsNone(event.dead_lettered_at)

        event.publish_attempts = 3
        mark_publish_failed(event, "still unavailable", now=now, max_attempts=3)
        self.assertEqual("dead_letter", event.delivery_status)
        self.assertEqual(now, event.dead_lettered_at)

    def test_published_event_clears_retry_state(self):
        now = datetime.now(timezone.utc)
        event = OutboxEvent(
            event_type="school.profile.updated",
            scope_type="school",
            scope_id=uuid.uuid4(),
            resource_type="school",
            resource_id=uuid.uuid4(),
            delivery_status="publishing",
            next_attempt_at=now,
            last_error="old",
        )
        mark_published(event, now=now)
        self.assertEqual("published", event.delivery_status)
        self.assertEqual(now, event.published_at)
        self.assertIsNone(event.next_attempt_at)
        self.assertIsNone(event.last_error)

    async def test_enqueue_uses_callers_transaction_without_commit_flush_or_network(self):
        db = _TransactionalDb()
        school_id = uuid.uuid4()
        actor_id = uuid.uuid4()
        resource_id = uuid.uuid4()

        event = enqueue_domain_event(
            db,
            event_type="school.profile.updated",
            scope_type="school",
            scope_id=school_id,
            actor_id=actor_id,
            resource_type="school",
            resource_id=resource_id,
            data={"changed_fields": ["about"]},
        )

        self.assertEqual([event], db.pending)
        self.assertEqual(0, db.commit_count)
        self.assertEqual(0, db.flush_count)
        self.assertEqual("pending", event.delivery_status)
        self.assertEqual(0, event.publish_attempts)

    async def test_business_change_and_event_share_rollback_fate(self):
        db = _TransactionalDb()
        business_change = SimpleNamespace(kind="school-update")
        db.add(business_change)
        event = enqueue_domain_event(
            db,
            event_type="school.profile.updated",
            scope_type="school",
            scope_id=uuid.uuid4(),
            actor_id=uuid.uuid4(),
            resource_type="school",
            resource_id=uuid.uuid4(),
            data={},
        )
        self.assertEqual([business_change, event], db.pending)

        await db.rollback()

        self.assertEqual([], db.pending)

    async def test_server_scope_cannot_be_overridden_by_payload(self):
        db = _TransactionalDb()
        server_school_id = uuid.uuid4()
        untrusted_school_id = uuid.uuid4()

        event = enqueue_domain_event(
            db,
            event_type="school.team.changed",
            scope_type="school",
            scope_id=server_school_id,
            actor_id=uuid.uuid4(),
            resource_type="staff_assignment",
            resource_id=uuid.uuid4(),
            data={
                "school_id": str(untrusted_school_id),
                "scope": {"type": "school", "id": str(untrusted_school_id)},
            },
        )

        self.assertEqual(server_school_id, event.scope_id)
        envelope = domain_event_envelope(event)
        self.assertEqual(server_school_id, envelope.scope.id)

    async def test_versioned_envelope_matches_realtime_contract(self):
        event_id = uuid.uuid4()
        occurred_at = datetime(2026, 7, 17, 12, 0, tzinfo=timezone.utc)
        event = OutboxEvent(
            id=event_id,
            event_type="school.content.workflow.changed",
            event_version=1,
            occurred_at=occurred_at,
            scope_type="school",
            scope_id=uuid.uuid4(),
            actor_id=uuid.uuid4(),
            resource_type="news",
            resource_id=uuid.uuid4(),
            payload={"status": "submitted"},
        )

        envelope = domain_event_envelope(event)
        payload = envelope.model_dump(mode="json")

        self.assertEqual(str(event_id), payload["id"])
        self.assertEqual("school.content.workflow.changed", payload["type"])
        self.assertEqual(1, payload["version"])
        self.assertEqual("school", payload["scope"]["type"])
        self.assertEqual("news", payload["resource"]["type"])
        self.assertEqual({"status": "submitted"}, payload["data"])

    def test_outbox_model_has_pending_and_scope_indexes(self):
        indexes = {index.name: index for index in OutboxEvent.__table__.indexes}

        self.assertIn("ix_outbox_events_pending", indexes)
        self.assertIn("ix_outbox_events_scope_occurred", indexes)
        predicate = str(
            indexes["ix_outbox_events_pending"].dialect_options["postgresql"]["where"]
        ).lower()
        self.assertIn("published_at is null", predicate)
        self.assertIn("dead_lettered_at is null", predicate)

    def test_migration_is_additive_and_reversible(self):
        source = MIGRATION.read_text(encoding="utf-8").lower()

        self.assertIn('revision = "20260717_0028"', source)
        self.assertIn('down_revision = "20260716_0027"', source)
        self.assertIn('op.create_table(', source)
        self.assertIn('"outbox_events"', source)
        self.assertIn('"ix_outbox_events_pending"', source)
        self.assertIn("postgresql_where=sa.text(", source)
        self.assertIn("published_at is null and dead_lettered_at is null", source)
        self.assertIn('op.drop_table("outbox_events")', source)


if __name__ == "__main__":
    unittest.main()
