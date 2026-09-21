from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.services.system import WebhookService


@pytest.mark.asyncio
async def test_record_delivery_counts_transport_failure_and_resets_on_success():
    webhook = SimpleNamespace(failure_count=2, last_status=503, last_triggered_at=None)
    db = SimpleNamespace(flush=AsyncMock())

    await WebhookService.record_delivery(db, webhook, status_code=None)
    assert webhook.last_status is None
    assert webhook.failure_count == 3

    await WebhookService.record_delivery(db, webhook, status_code=204)
    assert webhook.last_status == 204
    assert webhook.failure_count == 0
    assert db.flush.await_count == 2


@pytest.mark.asyncio
async def test_record_delivery_can_classify_a_success_status_as_rejected():
    webhook = SimpleNamespace(failure_count=0, last_status=None, last_triggered_at=None)
    db = SimpleNamespace(flush=AsyncMock())

    await WebhookService.record_delivery(db, webhook, status_code=202, failed=True)

    assert webhook.last_status == 202
    assert webhook.failure_count == 1
