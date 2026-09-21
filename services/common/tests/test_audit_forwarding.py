import asyncio
import json
import uuid

import httpx
import pytest

from ksu_common.audit import forward_audit_payload
from ksu_common.internal_client import PooledIntegrationClient


def test_forwarding_preserves_single_events_and_batches_with_stable_retry_keys(monkeypatch):
    async def exercise():
        requests = []

        async def handler(request):
            requests.append(request)
            body = json.loads(request.content)
            result = ({"received": len(body["events"]), "inserted": 0}
                      if "events" in body else {"id": body["id"]})
            return httpx.Response(202, json={"status": "accepted", **result})

        async with PooledIntegrationClient(transport=httpx.MockTransport(handler)) as pool:
            monkeypatch.setattr("ksu_common.internal_client.get_integration_pool", lambda: pool)
            kwargs = {"base_url": "https://main.example.edu", "api_key": "test-internal-key"}
            event = {"id": "event-1", "action": "create"}
            await forward_audit_payload(event, **kwargs)
            batch = [event, {"id": "event-2", "action": "update"}]
            await forward_audit_payload(batch, **kwargs)
            await forward_audit_payload(batch, **kwargs)
            await forward_audit_payload([dict(event, action="delete"), batch[1]], **kwargs)
            assert requests[0].url.path == "/api/v1/internal/audit"
            assert json.loads(requests[0].content) == event
            assert requests[0].headers["Idempotency-Key"] == "event-1"
            assert requests[1].url.path == "/api/v1/internal/audit/batch"
            assert json.loads(requests[1].content) == {"events": batch}
            assert requests[1].headers["Idempotency-Key"] == requests[2].headers["Idempotency-Key"]
            assert requests[1].headers["Idempotency-Key"] != requests[3].headers["Idempotency-Key"]

    asyncio.run(exercise())


@pytest.mark.parametrize("payload", [[], [{}], [{"id": "one"}] * 101,
                                      [{"id": "one", "details": "x" * (256 * 1024)}]])
def test_invalid_batches_do_not_attempt_network_delivery(payload, monkeypatch):
    def unexpected_pool():
        pytest.fail("invalid batch attempted network delivery")

    monkeypatch.setattr("ksu_common.internal_client.get_integration_pool", unexpected_pool)
    with pytest.raises(ValueError):
        asyncio.run(forward_audit_payload(payload, base_url="https://main.example.edu", api_key="test"))


@pytest.mark.parametrize("event_id", [
    "A20B30C0-1234-4567-890A-ABCDEF123456",
    "a20b30c012344567890aabcdef123456",
    "{a20b30c0-1234-4567-890a-abcdef123456}",
])
def test_canonical_uuid_acknowledgement_preserves_accepted_input(monkeypatch, event_id):
    async def exercise():
        async def handler(request):
            body = json.loads(request.content)
            assert body["id"] == event_id
            return httpx.Response(202, json={"status": "accepted", "id": str(uuid.UUID(body["id"]))})

        async with PooledIntegrationClient(transport=httpx.MockTransport(handler)) as pool:
            monkeypatch.setattr("ksu_common.internal_client.get_integration_pool", lambda: pool)
            await forward_audit_payload({"id": event_id, "action": "create"},
                                        base_url="https://main.example.edu", api_key="test")

    asyncio.run(exercise())


@pytest.mark.parametrize("batch,status,body", [
    (False, 200, {"status": "accepted", "id": "event-1"}),
    (False, 202, {"status": "accepted", "id": "wrong-event"}),
    (False, 202, "not an acknowledgement"),
    (True, 202, {"status": "accepted", "received": 2, "inserted": 1}),
    (True, 202, {"status": "accepted", "received": 1, "inserted": 2}),
    (True, 202, {"status": "accepted", "received": True, "inserted": 0}),
])
def test_ambiguous_acknowledgement_does_not_complete_delivery(monkeypatch, batch, status, body):
    async def exercise():
        async def handler(request):
            return httpx.Response(status, json=body)

        async with PooledIntegrationClient(transport=httpx.MockTransport(handler)) as pool:
            monkeypatch.setattr("ksu_common.internal_client.get_integration_pool", lambda: pool)
            event = {"id": "event-1", "action": "create"}
            with pytest.raises(ConnectionError, match="invalid acknowledgement"):
                await forward_audit_payload([event] if batch else event,
                                            base_url="https://main.example.edu", api_key="test")

    asyncio.run(exercise())
