"""Service-owned durable audit capture and bounded local PostgreSQL draining."""

import uuid
import logging
from typing import Any

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import DataError, IntegrityError

from .audit import insert_audit_batch
from .audit_metadata import prepare_audit_metadata

logger = logging.getLogger(__name__)


async def prune_audit_batch(session: AsyncSession, audit_model, cutoff, *, limit: int = 5000) -> int:
    """Delete one expired batch; the caller owns commit and run limits.

    Competing retention workers skip claimed rows instead of waiting on them.
    A zero result can mean eligible rows are locked; a later schedule retries.
    """
    if not 1 <= limit <= 5000:
        raise ValueError("audit retention batch must be between 1 and 5000")
    table = audit_model.__table__
    candidates = (
        sa.select(table.c.id).where(table.c.happened_at < cutoff)
        .order_by(table.c.happened_at, table.c.id)
        .limit(limit).with_for_update(skip_locked=True)
    )
    deleted = await session.execute(
        sa.delete(table).where(table.c.id.in_(candidates)).returning(table.c.id)
    )
    return len(deleted.all())


async def limit_audit_transaction(session: AsyncSession, *, owner_key: str | None = None) -> bool:
    """Bound waits and optionally claim nonblocking transaction ownership.

    Use a stable service/job key across replicas. Ownership ends on commit,
    rollback or connection loss; this prevents overlap, not sequential repeats.
    Combine the claim with timeout setup to avoid another database round trip.
    """
    statement = (
        "SELECT set_config('lock_timeout', '1000', true), "
        "set_config('statement_timeout', '5000', true)"
    )
    if owner_key is None:
        await session.execute(sa.text(statement))
        return True
    result = await session.execute(sa.text(
        statement + ", pg_try_advisory_xact_lock(hashtextextended(:owner_key, 0))"
    ), {"owner_key": owner_key})
    return bool(result.one()[2])


async def has_retained_audit_failure(session: AsyncSession, table: sa.Table) -> bool:
    """Probe the partial failure index without counting or loading payloads."""
    return bool(await session.scalar(sa.select(sa.exists(
        sa.select(table.c.failed_at).where(table.c.failed_at.is_not(None)),
    ))))


async def oldest_pending_audit_age(session: AsyncSession, table: sa.Table) -> float:
    """Read one indexed pending timestamp instead of counting the backlog."""
    age = await session.scalar(
        sa.select(sa.func.extract("epoch", sa.func.now() - table.c.captured_at))
        .where(table.c.failed_at.is_(None))
        .order_by(table.c.captured_at, table.c.id).limit(1)
    )
    return max(0.0, float(age or 0))


def audit_outbox_table(metadata: sa.MetaData, *, schema: str) -> sa.Table:
    """Declare the service's staging table; migrations own its creation.

    Keep capture inexpensive: a primary key and partial pending/failure indexes,
    without the audit log's many reader-facing indexes or payload indexing.
    """
    table = sa.Table(
        "audit_outbox", metadata,
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("payload", JSONB, nullable=False),
        sa.Column("captured_at", sa.DateTime(timezone=True), nullable=False,
                  server_default=sa.func.now()),
        sa.Column("failed_at", sa.DateTime(timezone=True)),
        sa.Column("failure_code", sa.String(64)),
        schema=schema,
    )
    sa.Index("ix_audit_outbox_pending", table.c.captured_at, table.c.id,
             postgresql_where=table.c.failed_at.is_(None))
    sa.Index("ix_audit_outbox_failed", table.c.failed_at,
             postgresql_where=table.c.failed_at.is_not(None))
    return table


async def capture_audit(
    session: AsyncSession, table: sa.Table, payload: dict[str, Any],
) -> None:
    """Stage a stable event in the caller's business transaction; never commit."""
    event_id = uuid.UUID(str(payload["id"]))
    payload = {
        key: prepare_audit_metadata(value) if key in {"details", "changes"} else value
        for key, value in payload.items()
    }
    await session.execute(
        insert(table).values(id=event_id, payload=payload)
        .on_conflict_do_nothing(index_elements=[table.c.id])
    )


async def drain_audit_batch(
    session: AsyncSession, table: sa.Table, audit_model: type[Any], *, limit: int = 100,
) -> int:
    """Transfer a bounded batch within one caller-owned local transaction.

    Competing workers skip locked rows. Both the audit insertion and source
    deletion roll back on failure, including cancellation or a failed commit.
    This function performs no network publication while holding database locks.
    """
    if not 1 <= limit <= 100:
        raise ValueError("audit drain limit must be between 1 and 100")
    rows = (await session.execute(
        sa.select(table.c.id, table.c.payload)
        .where(table.c.failed_at.is_(None))
        .order_by(table.c.captured_at, table.c.id)
        .limit(limit).with_for_update(skip_locked=True)
    )).all()
    if not rows:
        return 0
    async def transfer(batch) -> int:
        try:
            async with session.begin_nested():
                for row in batch:
                    if not isinstance(row.payload, dict):
                        raise ValueError("staged audit payload must be an object")
                    if uuid.UUID(str(row.payload.get("id"))) != row.id:
                        raise ValueError("staged audit identity does not match its payload")
                await insert_audit_batch(session, [row.payload for row in batch], audit_model)
        except (DataError, IntegrityError, ValueError, TypeError) as exc:
            if len(batch) > 1:
                middle = len(batch) // 2
                # Split only failed batches, preserving bulk insertion for the
                # healthy path and isolating malformed events without dropping.
                left = await transfer(batch[:middle])
                return left + await transfer(batch[middle:])
            await session.execute(
                sa.update(table).where(table.c.id == batch[0].id)
                .values(failed_at=sa.func.now(), failure_code=type(exc).__name__)
            )
            logger.error("audit event retained for repair", extra={
                "event_id": str(batch[0].id), "failure_code": type(exc).__name__,
            })
            return 0
        await session.execute(sa.delete(table).where(table.c.id.in_([row.id for row in batch])))
        return len(batch)

    return await transfer(rows)
