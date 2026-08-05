"""Off-request audit persistence for the research service.

The audit middleware used to open a session and commit an INSERT before the
response reached the client. The row is still built inside the request (the
Request and its body are gone afterwards), but the write happens in a worker.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from ksu_common.audit import persist_audit_payload

from ..core.database import AsyncSessionLocal
from .celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="research.audit.persist", ignore_result=True)
def persist_audit(payload: dict[str, Any]) -> None:
    asyncio.run(persist_audit_payload(AsyncSessionLocal, payload))


async def dispatch_audit(payload: dict[str, Any]) -> None:
    """Hand the entry to a worker instead of writing it in the request.

    ``delay`` publishes to the broker over a blocking socket, so it runs in a
    worker thread to keep the event loop free. A broker outage falls back to an
    inline write — accepting the original cost rather than losing the row.
    """
    try:
        await asyncio.to_thread(persist_audit.delay, payload)
    except Exception:
        logger.exception("failed to queue audit entry; writing inline")
        await persist_audit_payload(AsyncSessionLocal, payload)
