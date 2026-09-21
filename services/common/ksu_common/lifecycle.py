"""Ordered cleanup that attempts every resource even when one close fails."""

from builtins import BaseExceptionGroup
from collections.abc import Awaitable, Callable


async def close_resources(*hooks: Callable[[], Awaitable[None]]) -> None:
    errors: list[BaseException] = []
    for hook in hooks:
        try:
            await hook()
        except BaseException as exc:
            errors.append(exc)
    if errors:
        raise BaseExceptionGroup("resource cleanup failed", errors)
