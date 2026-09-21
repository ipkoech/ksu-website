import asyncio
from types import SimpleNamespace

import pytest

from app.services import assistant_conversations as svc


@pytest.mark.asyncio
async def test_stalled_provider_is_cancelled_and_uses_local_fallback(monkeypatch):
    stopped = asyncio.Event()
    async def answer(**kwargs):
        try:
            await asyncio.Event().wait()
        finally:
            stopped.set()
    monkeypatch.setattr(svc, "PROVIDER_DEADLINE_SECONDS", 0.01)
    draft, provider = await asyncio.wait_for(svc._call_provider(
        SimpleNamespace(name="stalled", answer=answer), message="Help", instructions="Instructions",
        sources=[], history=[], escalation_guidance=None,
    ), 1)
    assert stopped.is_set()
    assert provider == "deterministic-fallback" and draft.should_escalate


@pytest.mark.asyncio
async def test_request_cancellation_does_not_turn_into_a_persistable_fallback():
    started = asyncio.Event()
    stopped = asyncio.Event()
    async def answer(**kwargs):
        started.set()
        try:
            await asyncio.Event().wait()
        finally:
            stopped.set()
    task = asyncio.create_task(svc._call_provider(
        SimpleNamespace(name="cancelled", answer=answer), message="Help", instructions="Instructions",
        sources=[], history=[], escalation_guidance=None,
    ))
    await asyncio.wait_for(started.wait(), 1)
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task
    assert stopped.is_set()
