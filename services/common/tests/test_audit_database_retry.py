import os
from unittest.mock import Mock

from celery import Celery
from celery.exceptions import Retry
import pytest
import sqlalchemy as sa
from sqlalchemy.ext.asyncio import create_async_engine

from ksu_common.audit import build_audit_tasks


@pytest.mark.parametrize("code,retryable", [("40001", True), ("40P01", True), ("22000", False)])
def test_postgres_sqlstate_controls_audit_retry(code, retryable, monkeypatch):
    url = os.environ.get("KSU_TEST_DATABASE_URL")
    if not url:
        pytest.skip("disposable KSU_TEST_DATABASE_URL required")

    async def persist(payload):
        engine = create_async_engine(url, pool_size=1, max_overflow=0)
        try:
            async with engine.begin() as connection:
                # Exercise actual asyncpg/SQLAlchemy exception translation;
                # no application tables or data are involved.
                await connection.execute(sa.text(
                    f"DO $$ BEGIN RAISE EXCEPTION 'synthetic conflict' USING ERRCODE = '{code}'; END $$"
                ))
        finally:
            await engine.dispose()

    app = Celery("database_retry_probe", broker="memory://")
    task, _ = build_audit_tasks(app, None, task_name="audit.database.retry", persist_payload=persist)
    retry = Mock(side_effect=Retry())
    monkeypatch.setattr(task, "retry", retry)
    try:
        with pytest.raises(Retry if retryable else sa.exc.DBAPIError):
            task.run({"id": "stable"})
        if retryable:
            retry.assert_called_once()
            assert retry.call_args.kwargs["max_retries"] == 5
        else:
            retry.assert_not_called()
    finally:
        app.close()
