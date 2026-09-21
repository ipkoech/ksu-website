"""Short, fenced database claims for service-owned durable audit forwarding.

Callers commit claims before network delivery and acknowledge only after Main's
validated response. A crash leaves the event eligible after its lease expires.
Service migrations must create this table before a relay is enabled.
"""

from dataclasses import dataclass
import asyncio
from collections.abc import Awaitable, Callable
from datetime import timedelta
import json
import math
from typing import Any
import uuid

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import AsyncSession


@dataclass(frozen=True)
class AuditRelayClaim:
    id: uuid.UUID
    payload: Any
    token: uuid.UUID
    attempt: int


async def oldest_ready_audit_age(session: AsyncSession, table: sa.Table) -> float:
    """Indexed eligibility lag; excludes active leases and receiver cooldowns.

    This is not end-to-end age since capture. It measures how long eligible
    delivery has waited, without scanning payloads or counting the backlog.
    """
    age = await session.scalar(
        sa.select(sa.func.extract("epoch", sa.func.now() - table.c.available_at))
        .where(table.c.failed_at.is_(None), table.c.available_at <= sa.func.now())
        .order_by(table.c.available_at, table.c.id).limit(1)
    )
    return max(0.0, float(age or 0))


def audit_relay_table(metadata: sa.MetaData, *, schema: str) -> sa.Table:
    """Compatible with capture_audit, with an indexed delivery eligibility time."""
    table = sa.Table(
        "audit_relay", metadata,
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("payload", JSONB, nullable=False),
        sa.Column("captured_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("available_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("claim_token", sa.Uuid),
        sa.Column("attempts", sa.Integer, nullable=False, server_default="0"),
        sa.Column("failed_at", sa.DateTime(timezone=True)),
        sa.Column("failure_code", sa.String(64)),
        schema=schema,
    )
    sa.Index("ix_audit_relay_available", table.c.available_at, table.c.id,
             postgresql_where=table.c.failed_at.is_(None))
    sa.Index("ix_audit_relay_failed", table.c.failed_at,
             postgresql_where=table.c.failed_at.is_not(None))
    return table


async def claim_audit_relay(
    session: AsyncSession, table: sa.Table, *, limit: int = 100, lease_seconds: int = 60,
) -> list[AuditRelayClaim]:
    """Claim one bounded batch; the caller must commit before sending it.

    Eligibility and lease expiry use database time. Concurrent claimers skip
    locked candidates. Every reclamation changes the token, fencing old tasks.
    After six attempts, expired records are retained for repair in this same
    bounded statement. An empty result can therefore mean exhausted candidates,
    not an empty backlog; periodic polling must continue. Operator replay must
    clear failure fields and reset attempts after correcting the cause.
    """
    if not 1 <= limit <= 100 or not 1 <= lease_seconds <= 300:
        raise ValueError("relay claims require limit 1-100 and lease 1-300 seconds")
    # Physical row addresses are safe only within this locked statement; never
    # persist them as event identity. Keep the candidate CTE to addresses only;
    # payload size is evaluated against the already selected target row below.
    row_address = sa.column("ctid", _selectable=table)
    candidates = (
        sa.select(row_address.label("row_address"))
        .where(table.c.failed_at.is_(None), table.c.available_at <= sa.func.now())
        .order_by(table.c.available_at, table.c.id).limit(limit).with_for_update(skip_locked=True)
    ).cte("audit_candidates").prefix_with("MATERIALIZED")
    token = uuid.uuid4()
    exhausted = table.c.attempts >= 6
    oversized = sa.func.octet_length(sa.cast(table.c.payload, sa.Text)) > 256 * 1024
    retained = sa.or_(exhausted, oversized)
    # Use a PostgreSQL ``ctid = ANY(array(SELECT ...))`` predicate rather than
    # an UPDATE semi-join. The latter is planner-dependent and can hash/scan
    # the whole relay table even though the candidate CTE is capped at 100
    # rows. The physical addresses are still used only inside this statement;
    # the returned event UUID remains the durable identity.
    candidate_addresses = sa.select(candidates.c.row_address).scalar_subquery()
    rows = (await session.execute(
        sa.update(table).where(row_address == sa.any_(sa.func.array(candidate_addresses)))
        .values(
            claim_token=sa.case((retained, None), else_=token),
            attempts=sa.case((retained, table.c.attempts), else_=table.c.attempts + 1),
            available_at=sa.func.now() + timedelta(seconds=lease_seconds),
            failed_at=sa.case((retained, sa.func.now()), else_=None),
            failure_code=sa.case((exhausted, "attempts_exhausted"), (oversized, "payload_too_large"), else_=None),
        )
        .returning(table.c.id, sa.case((table.c.failed_at.is_(None), table.c.payload), else_=None).label("payload"),
                   table.c.attempts, table.c.failed_at)
    )).all()
    return [AuditRelayClaim(row.id, row.payload, token, row.attempts) for row in rows if row.failed_at is None]


async def acknowledge_audit_relay(
    session: AsyncSession, table: sa.Table, claims: list[AuditRelayClaim],
) -> int:
    """Delete accepted events only while their exact claim still owns them."""
    if not claims:
        return 0
    if len(claims) > 100:
        raise ValueError("relay acknowledgement exceeds 100 events")
    rows = await session.execute(sa.delete(table).where(
        sa.tuple_(table.c.id, table.c.claim_token).in_([(claim.id, claim.token) for claim in claims]),
    ).returning(table.c.id))
    return len(rows.all())


async def relay_audit_batch(
    session_factory, table: sa.Table,
    send: Callable[[list[dict[str, Any]]], Awaitable[None]],
    *, owner_key: str | None = None,
) -> int:
    """Deliver at most 100 records with no transaction spanning HTTP.

    The supplied sender must validate Main's acknowledgement. Each HTTP body
    fits its 256 KiB envelope. Total execution is limited to 25 seconds, below
    the 60-second claim lease; failures leave unacknowledged claims recoverable.
    Invalid local records remain for repair. ``owner_key`` provides a
    nonblocking per-service/job advisory gate for duplicate scheduler ticks;
    ownership ends when the short claim transaction commits, before network
    delivery starts. Services own scheduling/metrics.
    """
    from .audit_outbox import limit_audit_transaction
    from .internal_client import retry_after_seconds
    from httpx import HTTPError, HTTPStatusError

    delivered = 0
    async with asyncio.timeout(25):
        async with session_factory.begin() as session:
            if not await limit_audit_transaction(session, owner_key=owner_key):
                return 0
            claims = await claim_audit_relay(session, table)
        batches: list[list[AuditRelayClaim]] = []
        invalid: list[AuditRelayClaim] = []
        batch: list[AuditRelayClaim] = []
        size = len(b'{"events":[]}')
        for claim in claims:
            try:
                if not isinstance(claim.payload, dict) or uuid.UUID(str(claim.payload.get("id"))) != claim.id:
                    raise ValueError("invalid audit identity")
                encoded = json.dumps(claim.payload, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()
                if len(encoded) + len(b'{"events":[]}') > 256 * 1024:
                    raise ValueError("oversized audit event")
            except (ValueError, TypeError, UnicodeError):
                invalid.append(claim)
                continue
            added = len(encoded) + int(bool(batch))
            if size + added > 256 * 1024:
                batches.append(batch)
                batch = []
                size = len(b'{"events":[]}')
                added = len(encoded)
            batch.append(claim)
            size += added
        if batch:
            batches.append(batch)
        if invalid:
            async with session_factory.begin() as session:
                await limit_audit_transaction(session)
                await release_audit_relay(session, table, invalid, permanent=True)
        for index, batch in enumerate(batches):
            try:
                await send([claim.payload for claim in batch])
            except (HTTPError, OSError) as exc:
                permanent = False
                cooldown_exceeds_policy = False
                delay = min(60, 2 ** max(claim.attempt for claim in batch))
                if isinstance(exc, HTTPStatusError):
                    permanent = exc.response.status_code not in {408, 429, 500, 502, 503, 504}
                    advised = retry_after_seconds(exc.response.headers.get("Retry-After"))
                    if advised is not None:
                        # Do not silently shorten a receiver's cooldown. Very
                        # long delays require operator recovery under this policy.
                        if advised > 86400:
                            permanent = True
                            cooldown_exceeds_policy = True
                        else:
                            delay = max(delay, math.ceil(advised))
                remaining = [claim for pending in batches[index + 1:] for claim in pending]
                async with session_factory.begin() as session:
                    await limit_audit_transaction(session)
                    await release_audit_relay(session, table, batch, retry_seconds=delay, permanent=permanent)
                    await release_audit_relay(session, table, remaining, retry_seconds=delay,
                                              permanent=cooldown_exceeds_policy, attempted=False)
                raise
            async with session_factory.begin() as session:
                await limit_audit_transaction(session)
                acknowledged = await acknowledge_audit_relay(session, table, batch)
            delivered += acknowledged
    return delivered


async def release_audit_relay(
    session: AsyncSession, table: sa.Table, claims: list[AuditRelayClaim],
    *, retry_seconds: int = 60, permanent: bool = False, attempted: bool = True,
) -> int:
    """Retain rejected events, or schedule a retry without holding connections.

    Callers classify failures; no exception text or remote body is persisted.
    Stale failures cannot change a newer claim's recovery state.
    """
    if not claims:
        return 0
    if len(claims) > 100 or not 1 <= retry_seconds <= 86400:
        raise ValueError("relay release exceeds bounded batch or retry delay")
    values = {"claim_token": None, "available_at": sa.func.now() + timedelta(seconds=retry_seconds)}
    if not attempted:
        values["attempts"] = sa.func.greatest(0, table.c.attempts - 1)
    if permanent:
        values.update(failed_at=sa.func.now(), failure_code="delivery_rejected")
    rows = await session.execute(sa.update(table).where(
        sa.tuple_(table.c.id, table.c.claim_token).in_([(claim.id, claim.token) for claim in claims]),
    ).values(**values).returning(table.c.id))
    return len(rows.all())
