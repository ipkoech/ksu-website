"""Request-local authentication scope used by Research command idempotency."""

from __future__ import annotations

from contextvars import ContextVar

_authenticated_scope: ContextVar[str | None] = ContextVar(
    "research_authenticated_scope", default=None
)


def set_authenticated_scope(subject: str | None) -> None:
    _authenticated_scope.set(f"user:{subject}" if subject else None)


def current_scope(*, fallback: str = "anonymous") -> str:
    return _authenticated_scope.get() or fallback
