from unittest.mock import Mock

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.services.domain_events import enqueue_celery_after_commit
from app.tasks.celery_app import celery_app


def test_main_wakeup_adapter_preserves_task_arguments_and_waits_for_outer_commit(monkeypatch):
    send = Mock()
    monkeypatch.setattr(celery_app, "send_task", send)
    with Session(create_engine("sqlite://")) as session:
        with session.begin_nested():
            enqueue_celery_after_commit(session, "main.outbox.publish_one", args=["event-1"], recoverable=True)
        send.assert_not_called()
        session.commit()
    send.assert_called_once_with("main.outbox.publish_one", args=["event-1"], kwargs={})


def test_main_recoverable_wakeup_does_not_turn_commit_into_failure(monkeypatch):
    monkeypatch.setattr(celery_app, "send_task", Mock(side_effect=ConnectionError("test outage")))
    with Session(create_engine("sqlite://")) as session:
        enqueue_celery_after_commit(session, "main.outbox.publish_one", args=["event-1"], recoverable=True)
        session.commit()
        assert not session.in_transaction()
