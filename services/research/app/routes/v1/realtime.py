"""Research realtime configuration endpoints."""

from fastapi import APIRouter
from ksu_common import cached_public
from ksu_common.schemas.responses import success
from ...schemas.base import JsonObject, SuccessEnvelope

router = APIRouter(prefix="/realtime", tags=["Realtime"])
HEARTBEAT_SECONDS = 25


def research_realtime_config() -> dict[str, object]:
    return {
        "scope_type": "research",
        "websocket_path": "/api/v1/realtime",
        "heartbeat_seconds": HEARTBEAT_SECONDS,
        "channels": [
            "notifications",
            "research",
            "research.projects",
            "research.grants",
            "research.farm",
            "research.sustainability",
            "research.content",
            "research.donations",
            "research.capacity",
            "research.settings",
        ],
        "events": [
            "connected",
            "heartbeat",
            "notification.created",
            "research.record.changed",
            "research.project.changed",
            "research.grant.changed",
            "research.farm.changed",
            "research.sustainability.changed",
            "research.content.changed",
            "research.donation.changed",
            "research.capacity.changed",
            "research.setting.changed",
        ],
    }


async def get_research_realtime_config() -> dict:
    return success(data=research_realtime_config())


@router.get("/research/config", operation_id="get_research_realtime_config", response_model=SuccessEnvelope[JsonObject])
@cached_public(timeout=300)
async def _cached_research_realtime_config():
    return await get_research_realtime_config()
