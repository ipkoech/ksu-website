import asyncio
from unittest.mock import AsyncMock, Mock

from celery import Celery, Task

from ksu_common.audit import build_audit_tasks


def test_dispatch_hides_argument_representation_and_fallback_exception(monkeypatch, caplog):
    app = Celery("audit_dispatch_probe", broker="memory://")
    persist = AsyncMock()
    task, dispatch = build_audit_tasks(app, None, task_name="probe.audit.persist", persist_payload=persist)
    publish = Mock()
    monkeypatch.setattr(task, "apply_async", publish)
    payload = {"id": "stable-id", "details": {"label": "private audit content"}}
    try:
        asyncio.run(dispatch(payload))
        assert publish.call_args.kwargs == {
            "args": [payload], "argsrepr": "(<audit payload>,)", "kwargsrepr": "{}",
        }
        persist.assert_not_awaited()
        publish.side_effect = ConnectionError("redis://user:secret@private-host")
        asyncio.run(dispatch(payload))
        persist.assert_awaited_once_with(payload)
        assert "secret" not in caplog.text and "private audit content" not in caplog.text
        assert caplog.records[-1].error_type == "ConnectionError"
        assert caplog.records[-1].exc_info is None
    finally:
        app.close()


def test_audit_task_preserves_application_task_publication_hook(monkeypatch):
    seen = []

    class ServiceTask(Task):
        def apply_async(self, args=None, kwargs=None, **options):
            seen.append(options.copy())
            return "published"

    app = Celery("custom_audit_probe", broker="memory://", task_cls=ServiceTask)
    try:
        task, _ = build_audit_tasks(app, None, task_name="probe.custom.audit", persist_payload=AsyncMock())
        assert isinstance(task, ServiceTask)
        assert task.apply_async(args=[{"id": "event"}], argsrepr="sensitive", countdown=2) == "published"
        assert seen == [{"argsrepr": "(<audit payload>,)", "kwargsrepr": "{}", "countdown": 2}]
    finally:
        app.close()
