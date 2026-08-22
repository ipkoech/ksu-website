"""Shared cache invalidation for library mutations."""

from ksu_common.cache import invalidate_prefix


async def invalidate_library_caches() -> None:
    """Drop every cached library read after a mutation.

    Library reads are cached under two prefixes: ``public`` for anonymous
    responses (``cached_public``) and ``user`` for per-user responses
    (``cache_response``, e.g. loans, reservations, inquiries, tickets).
    Clearing only ``public`` left borrowers reading a stale loan list for the
    lifetime of the entry, so both prefixes are dropped together.
    """
    await invalidate_prefix("public")
    await invalidate_prefix("user")
