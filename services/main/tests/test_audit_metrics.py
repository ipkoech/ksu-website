import asyncio
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, Mock

import pytest

from app.tasks import audit


@pytest.mark.parametrize("count,commit_failure", [(0, False), (100, False), (100, True)])
def test_audit_transfer_metrics_require_a_successful_commit(monkeypatch, count, commit_failure):
    @asynccontextmanager
    async def begin():
        yield object()
        if commit_failure:
            raise RuntimeError("commit failure")

    metrics = Mock()
    monkeypatch.setattr(audit, "AsyncSessionLocal", Mock(begin=begin))
    monkeypatch.setattr(audit, "limit_audit_transaction", AsyncMock())
    monkeypatch.setattr(audit, "drain_audit_batch", AsyncMock(return_value=count))
    monkeypatch.setattr(audit.celery_app, "_ksu_metrics", metrics)
    if commit_failure:
        with pytest.raises(RuntimeError, match="commit failure"):
            asyncio.run(audit._drain_pending())
        assert not any(call.args[0] == "audit.transferred" for call in metrics.increment.call_args_list)
        outcome = "failed"
    else:
        assert asyncio.run(audit._drain_pending()) == count
        metrics.increment.assert_any_call("audit.transferred", count, tags={"service": "main"})
        outcome = "transferred" if count else "no_transfer"
    tags = {"service": "main", "outcome": outcome}
    metrics.increment.assert_any_call("audit.drain", tags=tags)
    duration = metrics.observe_latency.call_args
    assert duration.args[0] == "audit.drain.duration"
    assert duration.args[1] >= 0 and duration.kwargs["tags"] == tags


def test_overlapping_audit_poll_skips_transfer(monkeypatch):
    @asynccontextmanager
    async def begin():
        yield object()

    metrics = Mock()
    transfer = AsyncMock()
    monkeypatch.setattr(audit, "AsyncSessionLocal", Mock(begin=begin))
    monkeypatch.setattr(audit, "limit_audit_transaction", AsyncMock(return_value=False))
    monkeypatch.setattr(audit, "drain_audit_batch", transfer)
    monkeypatch.setattr(audit.celery_app, "_ksu_metrics", metrics)
    assert asyncio.run(audit._drain_pending()) == 0
    transfer.assert_not_awaited()
    metrics.increment.assert_called_once_with(
        "audit.drain", tags={"service": "main", "outcome": "overlap_skipped"},
    )
