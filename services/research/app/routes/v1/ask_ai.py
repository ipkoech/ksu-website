"""Read-only Ask AI advisor endpoints for research admins."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from ksu_common.schemas.responses import success

from ...core.auth import require_scope
from ...schemas.ask_ai import ResearchAskAIRequest
from ...services.ask_ai import ResearchAskAIService

router = APIRouter(tags=["Research Ask AI"], dependencies=[Depends(require_scope("research.view"))])


@router.post("/ask-ai")
async def ask_research_ai(request: ResearchAskAIRequest):
    context = request.context
    response = ResearchAskAIService.respond(
        message=request.message,
        path=context.path,
        section=context.section,
        resource_key=context.resource_key,
        record_id=context.record_id,
    )
    return success(data=response.model_dump(mode="json"))
