import asyncio
import threading

import pytest
from billiard.exceptions import SoftTimeLimitExceeded

from ksu_common.task_queue import _WorkerAsyncRuntime


def test_soft_time_limit_cancels_work_on_persistent_async_loop(monkeypatch):
    runtime = _WorkerAsyncRuntime()
    started = threading.Event()
    cancelled = threading.Event()
    real_submit = asyncio.run_coroutine_threadsafe

    async def operation():
        try:
            started.set()
            await asyncio.Event().wait()
        finally:
            cancelled.set()

    class InterruptedWait:
        def __init__(self, future):
            self.future = future

        def result(self):
            assert started.wait(timeout=2)
            raise SoftTimeLimitExceeded()

        def cancel(self):
            return self.future.cancel()

    def submit(coroutine, loop):
        return InterruptedWait(real_submit(coroutine, loop))

    monkeypatch.setattr(asyncio, "run_coroutine_threadsafe", submit)
    try:
        with pytest.raises(SoftTimeLimitExceeded):
            runtime.run(operation())
        assert cancelled.wait(timeout=2)
    finally:
        runtime.close()
