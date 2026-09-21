import asyncio
from contextlib import asynccontextmanager
from unittest.mock import AsyncMock

import pytest

from ksu_common.database import DatabaseRuntime


def test_request_transaction_commits_only_on_success():
    async def exercise(error):
        session = AsyncMock()

        @asynccontextmanager
        async def factory():
            yield session

        dependency = DatabaseRuntime(object(), factory).session()
        assert await anext(dependency) is session
        if error is None:
            with pytest.raises(StopAsyncIteration):
                await anext(dependency)
            session.commit.assert_awaited_once()
            session.rollback.assert_not_awaited()
        else:
            with pytest.raises(type(error)):
                await dependency.athrow(error)
            session.commit.assert_not_awaited()
            session.rollback.assert_awaited_once()

    for error in (None, ValueError("invalid"), asyncio.CancelledError()):
        asyncio.run(exercise(error))


def test_commit_failure_rolls_back_and_propagates():
    async def exercise():
        session = AsyncMock()
        session.commit.side_effect = RuntimeError("commit failed")

        @asynccontextmanager
        async def factory():
            yield session

        dependency = DatabaseRuntime(object(), factory).session()
        await anext(dependency)
        with pytest.raises(RuntimeError, match="commit failed"):
            await anext(dependency)
        session.rollback.assert_awaited_once()

    asyncio.run(exercise())
