import asyncio
from builtins import BaseExceptionGroup

import pytest

from ksu_common.lifecycle import close_resources


@pytest.mark.parametrize("failure", [RuntimeError("close failed"), asyncio.CancelledError()])
def test_cleanup_attempts_every_resource_after_failure(failure):
    events = []

    async def first():
        events.append("first")
        raise failure

    async def second():
        events.append("second")

    with pytest.raises(BaseExceptionGroup) as caught:
        asyncio.run(close_resources(first, second))
    assert events == ["first", "second"]
    assert caught.value.exceptions == (failure,)
