#!/usr/bin/env python3
"""Exercise webhook signing, target safety, configuration, and task registration."""

from __future__ import annotations

import asyncio
import os
import subprocess
import sys
from pathlib import Path
from unittest.mock import AsyncMock
from uuid import uuid4

import httpx

REPO = Path(__file__).resolve().parents[1]


def _probe() -> None:
    from ksu_common.internal_client import (
        IntegrationResponseTooLargeError,
        PooledIntegrationClient,
    )
    from app.services.system import WebhookService
    from app.tasks.celery_app import celery_app
    from app.tasks.webhooks import _target, verify_webhook_signature, webhook_signature

    secret = "integration-smoke-secret-at-least-32-characters"  # pragma: allowlist secret
    body = b'{"id":"event-1","version":1}'
    timestamp = 1_786_100_000
    signature = webhook_signature(secret, timestamp, body)
    assert signature.startswith("v1=")
    assert verify_webhook_signature(secret, timestamp, body, signature, now=timestamp)
    assert not verify_webhook_signature(secret, timestamp, body + b" ", signature, now=timestamp)
    assert not verify_webhook_signature(secret, timestamp, body, signature, now=timestamp + 301)

    async def prove_response_bound() -> None:
        async def handler(_request: httpx.Request) -> httpx.Response:
            return httpx.Response(200, content=b"x" * 33)

        pool = PooledIntegrationClient(transport=httpx.MockTransport(handler))
        try:
            try:
                await pool.request(
                    "bounded-smoke", "https://hooks.example.edu", "GET", "/hook",
                    max_response_bytes=32,
                )
            except IntegrationResponseTooLargeError:
                pass
            else:
                raise AssertionError("oversized integration response was buffered")
        finally:
            await pool.aclose()

    asyncio.run(prove_response_bound())

    assert _target("https://hooks.example.edu/events?source=ksu") == (
        "https://hooks.example.edu",
        "/events?source=ksu",
    )
    for unsafe in (
        "http://127.0.0.1/hook",
        "http://169.254.169.254/latest/meta-data",
        "https://user:password@example.edu/hook",  # pragma: allowlist secret
        "http://service.internal/hook",
    ):
        try:
            _target(unsafe)
        except ValueError:
            pass
        else:
            raise AssertionError(f"unsafe webhook target accepted: {unsafe}")

    fake_db = AsyncMock()
    fake_db.add = lambda _item: None
    item = asyncio.run(
        WebhookService.create(
            fake_db,
            created_by_id=uuid4(),
            name="Smoke",
            url="https://hooks.example.edu/events",
            events=["content.published", "content.published"],
            is_active=True,
        )
    )
    assert item.events == ["content.published"]
    assert item.secret and len(item.secret) >= 32
    assert "main.webhooks.dispatch_event" in celery_app.tasks
    assert "main.webhooks.dispatch_pending" in celery_app.tasks
    assert "main.webhooks.deliver" in celery_app.tasks
    print("integration infrastructure smoke: ok")


def main() -> int:
    if os.environ.get("KSU_INTEGRATION_SMOKE_PROBE") == "1":
        _probe()
        return 0

    from ci_environment import service_environment

    environment = service_environment("main")
    environment["JWT_SIGNING_ENABLED"] = "false"
    environment["KSU_INTEGRATION_SMOKE_PROBE"] = "1"
    environment["PYTHONPATH"] = os.pathsep.join(
        (str(REPO / "services" / "main"), str(REPO / "services" / "common"))
    )
    subprocess.run([sys.executable, __file__], cwd=REPO, env=environment, check=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
