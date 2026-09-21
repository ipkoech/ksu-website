from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import AsyncMock, Mock
from uuid import uuid4

import pytest

from app.tasks import digital_sync


class _Session:
    def __init__(self) -> None:
        self.committed = False

    async def __aenter__(self) -> "_Session":
        return self

    async def __aexit__(self, *_args: object) -> None:
        return None

    async def commit(self) -> None:
        self.committed = True


@pytest.mark.asyncio
async def test_digital_sync_worker_commits_after_service_flush(monkeypatch: pytest.MonkeyPatch) -> None:
    session = _Session()
    service = AsyncMock(return_value={"created": 1})
    monkeypatch.setattr(digital_sync, "AsyncSessionLocal", lambda: session)
    monkeypatch.setattr(digital_sync.DigitalLecturerSyncService, "sync", service)
    monkeypatch.setattr(
        digital_sync,
        "get_settings",
        lambda: SimpleNamespace(DIGITAL_LECTURERS_URL="https://digital.example.test/lecturers"),
    )

    result = await digital_sync._synchronize_lecturers()

    assert result == {"created": 1}
    assert session.committed is True
    service.assert_awaited_once_with(session, url="https://digital.example.test/lecturers")


@pytest.mark.asyncio
async def test_pending_dispatch_reopens_rows_when_broker_enqueue_fails(monkeypatch: pytest.MonkeyPatch) -> None:
    first = SimpleNamespace(id=uuid4(), status="PENDING", deleted_at=None)
    second = SimpleNamespace(id=uuid4(), status="PENDING", deleted_at=None)

    class _DB:
        def __init__(self, rows):
            self.rows = rows
            self.committed = False

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return None

        async def execute(self, _query):
            class _Scalars:
                def all(inner):
                    return self.rows

                def __iter__(inner):
                    return iter(self.rows)

            return SimpleNamespace(scalars=lambda: _Scalars())

        async def commit(self):
            self.committed = True

        def begin(self):
            return self

    claimed = _DB([first, second])
    repaired = _DB([second])
    sessions = iter((claimed, repaired))
    monkeypatch.setattr(digital_sync, "AsyncSessionLocal", lambda: next(sessions))
    enqueue = Mock(side_effect=[None, ConnectionError("broker unavailable")])
    monkeypatch.setattr(digital_sync.run_integration_job, "delay", enqueue)

    assert await digital_sync._dispatch_pending_jobs() == 1
    assert first.status == "DISPATCHED"
    assert second.status == "PENDING"
    assert claimed.committed is True
    enqueue.assert_any_call(str(first.id))
    enqueue.assert_any_call(str(second.id))
