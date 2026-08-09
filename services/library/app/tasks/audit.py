"""Off-request audit persistence for the library service.

The row is built inside the request — the Request and its body are gone
afterwards — but the database write happens in a Celery worker, so auditing
costs the response nothing.

The task and dispatcher are built by the shared factory; only the task name is
service-owned, because it is routed per service and already-queued messages
carry it.
"""

from __future__ import annotations

from ksu_common.audit import build_audit_tasks
from ksu_common.internal_client import get_integration_pool

from ..core.config import get_settings
from .celery_app import celery_app


async def _persist_in_main(payload: dict) -> None:
    settings = get_settings()
    response = await get_integration_pool().request_internal(
        "main-audit", settings.MAIN_SERVICE_URL, "POST", "/api/v1/internal/audit",
        api_key=settings.MAIN_SERVICE_API_KEY, json=payload,
        headers={"Idempotency-Key": str(payload.get("id") or payload.get("happened_at"))},
    )
    response.raise_for_status()

persist_audit, dispatch_audit = build_audit_tasks(
    celery_app,
    None,
    task_name="library.audit.persist",
    persist_payload=_persist_in_main,
)
