import asyncio
import unittest
import uuid
from types import SimpleNamespace

from app.realtime.connection_manager import ConnectionManager
from app.realtime.events import rooms_for_event, rooms_for_user
from app.realtime.redis_subscriber import RedisRealtimeSubscriber


class _Socket:
    def __init__(self, ip="127.0.0.1"):
        self.client = SimpleNamespace(host=ip)
        self.accepted = False
        self.closed = None
        self.sent = []

    async def accept(self):
        self.accepted = True

    async def send_json(self, payload):
        self.sent.append(payload)

    async def close(self, **kwargs):
        self.closed = kwargs


class SchoolRealtimeRoomTests(unittest.TestCase):
    def test_user_joins_own_school_and_permission_derived_cocms_rooms(self):
        user_id = uuid.uuid4()
        school_id = uuid.uuid4()
        permission = SimpleNamespace(name="content:review", is_active=True)
        role = SimpleNamespace(
            role_permissions=[SimpleNamespace(permission=permission)]
        )
        assignment = SimpleNamespace(
            is_active=True,
            scope_type="school",
            scope_id=school_id,
            role=role,
        )

        rooms = rooms_for_user(
            SimpleNamespace(id=user_id, role_assignments=[assignment])
        )

        self.assertEqual(
            {f"user:{user_id}", f"school:{school_id}", "portal:cocms"},
            rooms,
        )

    def test_school_content_event_routes_to_school_and_cocms(self):
        school_id = uuid.uuid4()

        rooms = rooms_for_event(
            {
                "type": "school.content.submitted",
                "scope": {"type": "school", "id": str(school_id)},
                "data": {},
            }
        )

        self.assertEqual({f"school:{school_id}", "portal:cocms"}, rooms)


class ConnectionManagerTests(unittest.IsolatedAsyncioTestCase):
    async def test_enforces_per_user_connection_limit(self):
        manager = ConnectionManager(max_per_user=1, max_per_ip=10, queue_size=2)
        user_id = uuid.uuid4()
        connection = await manager.connect(_Socket(), user_id, {"room"})
        with self.assertRaises(PermissionError):
            await manager.connect(_Socket("127.0.0.2"), user_id, {"room"})
        await manager.disconnect(connection)

    async def test_slow_consumer_is_closed_when_bounded_queue_is_full(self):
        manager = ConnectionManager(max_per_user=2, max_per_ip=2, queue_size=1)
        socket = _Socket()
        connection = await manager.connect(socket, uuid.uuid4(), {"room"})
        connection.sender_task.cancel()
        await asyncio.gather(connection.sender_task, return_exceptions=True)

        self.assertTrue(await manager.send(connection, {"type": "event"}))
        self.assertFalse(await manager.send(connection, {"type": "event"}))
        self.assertEqual(1013, socket.closed["code"])
        self.assertEqual(1, manager.metrics()["dropped_events"])

    async def test_invalid_resume_cursor_requires_controlled_sync(self):
        subscriber = RedisRealtimeSubscriber()
        connection = SimpleNamespace()
        messages = []

        async def capture_send(target, payload):
            messages.append(payload)
            return True

        import app.realtime.redis_subscriber as module

        original_send = module.manager.send
        module.manager.send = capture_send
        try:
            await subscriber.resume(connection, "not-a-stream-id")
        finally:
            module.manager.send = original_send

        self.assertEqual("sync.required", messages[0]["type"])
        self.assertEqual("invalid_cursor", messages[0]["reason"])

    async def test_fanout_handles_one_thousand_concurrent_connections(self):
        manager = ConnectionManager(
            max_per_user=1,
            max_per_ip=1_100,
            queue_size=2,
        )
        connections = []
        for index in range(1_000):
            connection = await manager.connect(
                _Socket(),
                uuid.uuid4(),
                {"school:load-test"},
            )
            connections.append(connection)

        delivered = await manager.broadcast(
            {"school:load-test"},
            {"type": "event", "cursor": "1-0"},
        )

        self.assertEqual(1_000, delivered)
        self.assertEqual(1_000, manager.metrics()["connections"])
        await manager.close_all()


if __name__ == "__main__":
    unittest.main()
