"""Transaction-aware wakeups; durable work must already exist in the database."""

import logging
from collections.abc import Callable

from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session

_KEY = "ksu_after_commit"
_logger = logging.getLogger(__name__)


def defer_after_commit(
    db: AsyncSession | Session, callback: Callable[[], None], *, recoverable: bool = False,
) -> None:
    """Defer a synchronous wakeup until the outer transaction commits.

    `recoverable` is only valid when a durable pending record and polling worker
    can recover a failed wakeup. This queue is not itself a transactional outbox.
    """
    session = db.sync_session if isinstance(db, AsyncSession) else db
    if not session.in_transaction():
        session.begin()
    transaction = session.get_nested_transaction() or session.get_transaction()
    session.info.setdefault(_KEY, []).append((transaction, callback, recoverable))


@event.listens_for(Session, "after_commit")
def _dispatch(session: Session) -> None:
    if session.in_nested_transaction():
        return
    for _transaction, callback, recoverable in session.info.pop(_KEY, []):
        try:
            callback()
        except Exception as exc:
            if not recoverable:
                raise
            # Do not log task arguments or exception text (may contain secrets).
            _logger.error("durable wakeup failed; polling must recover", extra={"exception_type": type(exc).__name__})


@event.listens_for(Session, "after_soft_rollback")
def _discard_rolled_back(session: Session, previous_transaction) -> None:
    def retained(transaction) -> bool:
        while transaction is not None:
            if transaction is previous_transaction:
                return False
            transaction = transaction.parent
        return True

    session.info[_KEY] = [entry for entry in session.info.get(_KEY, []) if retained(entry[0])]


@event.listens_for(Session, "after_transaction_end")
def _discard_closed(session: Session, transaction) -> None:
    if transaction.parent is None:
        session.info.pop(_KEY, None)
