import asyncio
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, Mock

import pytest

from app.tasks import retention


@pytest.mark.parametrize("owns,counts,expected", [
    (False, [], 0),
    (True, [5000, 0], 5000),
    (True, [5000] * 20, 100000),
])
def test_audit_retention_bounds_work_and_skips_overlap(monkeypatch, owns, counts, expected):
    session = Mock(commit=AsyncMock(), rollback=AsyncMock())

    @asynccontextmanager
    async def factory():
        yield session

    claim = AsyncMock(return_value=owns)
    prune = AsyncMock(side_effect=counts)
    monkeypatch.setattr(retention, "AsyncSessionLocal", factory)
    monkeypatch.setattr(retention, "limit_audit_transaction", claim)
    monkeypatch.setattr(retention, "prune_audit_batch", prune)
    monkeypatch.setattr(retention.settings, "AUDIT_LOG_RETENTION_DAYS", 90)
    assert asyncio.run(retention._prune_audit_logs()) == expected
    assert prune.await_count == len(counts)
    assert session.commit.await_count == len(counts)
    assert session.rollback.await_count == int(not owns)
    assert all(call.kwargs == {"owner_key": "main.audit.prune"} for call in claim.await_args_list)
