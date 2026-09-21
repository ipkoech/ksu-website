import asyncio

import pytest

from ksu_common.database import (
    DatabaseConcurrencyLimitExceeded, DatabaseRequestBudget, QueryBudgetExceeded,
    _record_query_count, current_query_count, query_budget_context, query_count_context,
)


def test_nested_budget_cannot_relax_outer_limit_and_restores_context():
    with query_budget_context(2):
        _record_query_count()
        with query_budget_context(100):
            _record_query_count()
            with pytest.raises(QueryBudgetExceeded) as raised:
                _record_query_count()
            assert raised.value.detail == "Database query budget of 2 exceeded."
        assert current_query_count() == 2
    assert current_query_count() == 0
    with query_budget_context(3):
        with query_budget_context(1):
            _record_query_count()
            with pytest.raises(QueryBudgetExceeded):
                _record_query_count()
        _record_query_count()
        assert current_query_count() == 2


def test_nested_observation_counts_delta_without_resetting_budget():
    with query_count_context() as total:
        with query_budget_context(2):
            _record_query_count()
            with query_count_context() as nested:
                _record_query_count()
                with pytest.raises(QueryBudgetExceeded):
                    _record_query_count()
            assert nested.count == 1
            assert current_query_count() == 2
            with pytest.raises(QueryBudgetExceeded):
                _record_query_count()
    assert total.count == 2
    assert current_query_count() == 0


def test_child_tasks_share_budget_but_independent_requests_do_not():
    async def query():
        await asyncio.sleep(0)
        _record_query_count()

    async def request():
        with query_budget_context(2) as observation:
            results = await asyncio.gather(*(query() for _ in range(10)), return_exceptions=True)
            assert sum(result is None for result in results) == 2
            assert sum(isinstance(result, QueryBudgetExceeded) for result in results) == 8
            assert current_query_count() == 2
        assert observation.count == 2
        assert current_query_count() == 0

    async def exercise():
        await asyncio.gather(request(), request())

    asyncio.run(exercise())


@pytest.mark.parametrize("timeout", [0, 0.01])
def test_saturation_and_cancelled_owner_restore_capacity(timeout):
    async def exercise():
        budget = DatabaseRequestBudget(max_concurrency=1, acquire_timeout_seconds=timeout)
        entered = asyncio.Event()

        async def owner():
            async with budget.limit():
                entered.set()
                await asyncio.Event().wait()

        task = asyncio.create_task(owner())
        try:
            await asyncio.wait_for(entered.wait(), 1)
            with pytest.raises(DatabaseConcurrencyLimitExceeded):
                async with budget.limit():
                    pytest.fail("saturated scope was admitted")
        finally:
            task.cancel()
            with pytest.raises(asyncio.CancelledError):
                await task
        async with budget.limit():
            _record_query_count()
            assert current_query_count() == 1
        assert current_query_count() == 0

    asyncio.run(exercise())
