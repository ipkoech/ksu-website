"""Bounded, leased delivery of committed encrypted notifications."""

import asyncio
import json
from datetime import datetime, timedelta, timezone
from uuid import uuid4

import sqlalchemy as sa
from cryptography.fernet import Fernet
from fastapi import HTTPException
from ksu_common.internal_client import get_integration_pool

from ..core.config import get_settings
from ..models.notification import notification_outbox as table


def _cipher(settings):
    try:
        return Fernet((settings.NOTIFICATION_ENCRYPTION_KEY or "").encode())
    except (ValueError, TypeError):
        raise HTTPException(status_code=503, detail="Notification encryption is unavailable") from None


async def enqueue_notification(db, payload, *, expires_at, settings=None):
    settings = settings or get_settings()
    encoded = json.dumps(payload, separators=(",", ":")).encode()
    if len(encoded) > 32768:
        raise ValueError("Notification exceeds the delivery size limit")
    identifier = uuid4()
    await db.execute(sa.insert(table).values(
        id=identifier, encrypted_payload=_cipher(settings).encrypt(encoded).decode(), expires_at=expires_at,
    ))
    return identifier


async def _claim(db):
    candidate = await db.execute(sa.select(table).where(
        table.c.status == "pending", table.c.available_at <= sa.func.now(),
    ).order_by(table.c.available_at, table.c.id).limit(1).with_for_update(skip_locked=True))
    row = candidate.mappings().one_or_none()
    if row is None:
        return None
    if row["expires_at"] <= datetime.now(timezone.utc) or row["attempts"] >= 5:
        await db.execute(sa.update(table).where(table.c.id == row["id"]).values(
            status="failed", failure_code="expired_or_exhausted", encrypted_payload=None, claim_token=None,
        ))
        return None
    token = uuid4()
    await db.execute(sa.update(table).where(table.c.id == row["id"]).values(
        claim_token=token, attempts=table.c.attempts + 1,
        available_at=sa.func.now() + timedelta(seconds=60),
    ))
    return {**row, "claim_token": token, "attempts": row["attempts"] + 1}


async def _send(payload, identifier, settings):
    response = await get_integration_pool().request_internal(
        "main-library-durable-email", settings.MAIN_SERVICE_URL.rstrip("/"), "POST",
        "/api/v1/internal/email/send", api_key=settings.MAIN_SERVICE_API_KEY, timeout=10,
        headers={"Idempotency-Key": str(identifier)}, json=payload,
    )
    response.raise_for_status()


async def deliver_pending(session_factory, *, settings=None, send=None, limit=10):
    if not 1 <= limit <= 20:
        raise ValueError("Notification delivery batch must be between 1 and 20")
    settings = settings or get_settings()
    cipher = _cipher(settings)
    delivered = 0
    for _ in range(limit):
        async with session_factory.begin() as db:
            claim = await _claim(db)
        if claim is None:
            break
        try:
            payload = json.loads(cipher.decrypt(claim["encrypted_payload"].encode()))
            async with asyncio.timeout(12):
                await (send or _send)(payload, claim["id"], settings)
            values = {"status": "delivered", "failure_code": None, "encrypted_payload": None, "claim_token": None}
        except Exception:
            terminal = claim["attempts"] >= 5
            values = {"status": "failed" if terminal else "pending", "failure_code": "delivery_failed",
                      "claim_token": None, "available_at": sa.func.now() + timedelta(seconds=30 * claim["attempts"])}
            if terminal:
                values["encrypted_payload"] = None
        async with session_factory.begin() as db:
            result = await db.execute(sa.update(table).where(
                table.c.id == claim["id"], table.c.claim_token == claim["claim_token"],
            ).values(**values))
            if result.rowcount and values["status"] == "delivered":
                delivered += 1
    return delivered
