from unittest.mock import MagicMock, patch

import pytest

from app.api.v1 import register_routes
from app.realtime.redis_subscriber import RedisRealtimeSubscriber
from app.services.domain_events import enqueue_domain_event


def test_school_portal_routes_can_be_disabled():
    app = MagicMock()

    with patch("app.api.v1.get_settings") as get_settings:
        get_settings.return_value.SCHOOL_PORTAL_ROUTES_ENABLED = False
        register_routes(app)

    included_routers = [call.args[0] for call in app.include_router.call_args_list]
    from app.api.v1.school_portal import router as school_portal_router

    assert school_portal_router not in included_routers


def test_domain_events_can_be_disabled_without_writing_outbox():
    db = MagicMock()

    with patch("app.services.domain_events.get_settings") as get_settings:
        get_settings.return_value.SCHOOL_PORTAL_EVENTS_ENABLED = False
        result = enqueue_domain_event(
            db,
            event_type="school.profile.updated",
            scope_type="school",
            scope_id=None,
            actor_id=None,
            resource_type="school",
            resource_id=MagicMock(),
        )

    assert result is None
    db.add.assert_not_called()


@pytest.mark.asyncio
async def test_websocket_fanout_subscriber_can_be_disabled():
    subscriber = RedisRealtimeSubscriber()

    with patch("app.realtime.redis_subscriber.get_settings") as get_settings:
        get_settings.return_value.SCHOOL_PORTAL_WEBSOCKET_FANOUT_ENABLED = False
        result = await subscriber.start()

    assert result is None
    assert subscriber.task is None
