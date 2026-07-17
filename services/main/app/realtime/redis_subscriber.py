"""One Redis domain-event subscriber per API process."""

from __future__ import annotations

import asyncio
import json
import logging
import re

from ksu_common.cache import get_redis

from .connection_manager import manager
from .events import protocol_event, rooms_for_event

logger = logging.getLogger("main.realtime")
CURSOR_PATTERN = re.compile(r"^\d+-\d+$")


class RedisRealtimeSubscriber:
    def __init__(self):
        self.task: asyncio.Task | None = None

    async def start(self):
        if self.task is None:
            self.task = asyncio.create_task(self._run())

    async def stop(self):
        if self.task:
            self.task.cancel()
            await asyncio.gather(self.task, return_exceptions=True)
            self.task = None

    async def _run(self):
        while True:
            pubsub = None
            try:
                redis = await get_redis()
                pubsub = redis.pubsub()
                await pubsub.subscribe("ksu:domain-events")
                async for message in pubsub.listen():
                    if message.get("type") != "message":
                        continue
                    payload = json.loads(message["data"])
                    event = payload.get("event", payload)
                    cursor = payload.get("cursor", "0-0")
                    await manager.broadcast(
                        rooms_for_event(event),
                        protocol_event(cursor, event),
                    )
            except asyncio.CancelledError:
                raise
            except Exception:
                logger.exception("realtime Redis subscriber failed; reconnecting")
                await asyncio.sleep(1)
            finally:
                if pubsub is not None:
                    await pubsub.aclose()

    async def resume(self, connection, last_event_id: str):
        if not CURSOR_PATTERN.fullmatch(last_event_id):
            await manager.send(connection, {"type": "sync.required", "reason": "invalid_cursor"})
            return
        redis = await get_redis()
        stream = await redis.xinfo_stream("ksu:domain-events")
        first_entry = stream.get("first-entry") if stream else None
        if first_entry:
            first_cursor = first_entry[0]
            if isinstance(first_cursor, bytes):
                first_cursor = first_cursor.decode()
            if _cursor_tuple(last_event_id) < _cursor_tuple(first_cursor):
                await manager.send(connection, {"type": "sync.required", "reason": "cursor_expired"})
                return
        records = await redis.xrange(
            "ksu:domain-events",
            min=f"({last_event_id}",
            max="+",
            count=500,
        )
        if not records:
            return
        for cursor, fields in records:
            event = json.loads(fields[b"event"] if b"event" in fields else fields["event"])
            cursor_value = cursor.decode() if isinstance(cursor, bytes) else cursor
            if connection.rooms.intersection(rooms_for_event(event)):
                await manager.send(connection, protocol_event(cursor_value, event))


def _cursor_tuple(cursor: str) -> tuple[int, int]:
    milliseconds, sequence = cursor.split("-", 1)
    return int(milliseconds), int(sequence)


subscriber = RedisRealtimeSubscriber()
