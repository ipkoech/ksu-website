import unittest
import uuid
from contextlib import asynccontextmanager
from unittest import mock

from app.tasks import retention


class _Result:
    def __init__(self, ids):
        self._ids = ids

    def scalars(self):
        return self

    def all(self):
        return self._ids


class _FakeSession:
    """Returns a scripted sequence of select batches and records deletes."""

    def __init__(self, batches):
        self._batches = list(batches)
        self.deleted_batches = []
        self.commit_count = 0
        self.statements = []

    async def execute(self, statement):
        self.statements.append(statement)
        # A select drives the loop; a delete just records what was removed.
        if statement.is_select:
            return _Result(self._batches.pop(0) if self._batches else [])
        self.deleted_batches.append(statement)
        return _Result([])

    async def commit(self):
        self.commit_count += 1


def _session_factory(session):
    @asynccontextmanager
    async def factory():
        yield session

    return factory


def _ids(count):
    return [uuid.uuid4() for _ in range(count)]


class PruneAuditLogsTests(unittest.IsolatedAsyncioTestCase):
    async def test_deletes_in_batches_until_a_batch_comes_back_empty(self):
        session = _FakeSession([_ids(3), _ids(2), []])

        with (
            mock.patch.object(retention, "AsyncSessionLocal", _session_factory(session)),
            mock.patch.object(retention.settings, "AUDIT_LOG_RETENTION_DAYS", 180),
        ):
            removed = await retention._prune_audit_logs()

        assert removed == 5
        assert len(session.deleted_batches) == 2
        # Each batch commits separately so no single long transaction is held.
        assert session.commit_count == 2

    async def test_retention_of_zero_disables_pruning_entirely(self):
        session = _FakeSession([_ids(3)])

        with (
            mock.patch.object(retention, "AsyncSessionLocal", _session_factory(session)),
            mock.patch.object(retention.settings, "AUDIT_LOG_RETENTION_DAYS", 0),
        ):
            removed = await retention._prune_audit_logs()

        assert removed == 0
        assert session.statements == []

    async def test_a_long_backlog_stops_at_the_per_run_batch_ceiling(self):
        # Always returns a full batch, so only the ceiling can stop the loop.
        session = _FakeSession([_ids(1)] * (retention.MAX_BATCHES_PER_RUN + 5))

        with (
            mock.patch.object(retention, "AsyncSessionLocal", _session_factory(session)),
            mock.patch.object(retention.settings, "AUDIT_LOG_RETENTION_DAYS", 180),
        ):
            removed = await retention._prune_audit_logs()

        assert removed == retention.MAX_BATCHES_PER_RUN


class PruneOutboxEventsTests(unittest.IsolatedAsyncioTestCase):
    async def test_only_published_events_are_considered(self):
        session = _FakeSession([_ids(4), []])

        with (
            mock.patch.object(retention, "AsyncSessionLocal", _session_factory(session)),
            mock.patch.object(retention.settings, "OUTBOX_RETENTION_DAYS", 7),
        ):
            removed = await retention._prune_outbox_events()

        assert removed == 4
        # Pending, failed, and dead-lettered rows must never be swept up.
        where_clause = str(session.statements[0].whereclause)
        assert "published_at IS NOT NULL" in where_clause
        assert "published_at <" in where_clause

    async def test_retention_of_zero_disables_pruning_entirely(self):
        session = _FakeSession([_ids(3)])

        with (
            mock.patch.object(retention, "AsyncSessionLocal", _session_factory(session)),
            mock.patch.object(retention.settings, "OUTBOX_RETENTION_DAYS", 0),
        ):
            removed = await retention._prune_outbox_events()

        assert removed == 0
        assert session.statements == []
