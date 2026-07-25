"""Read-only Ask AI advisor endpoints for research admins."""

from __future__ import annotations

import uuid
import asyncio
import json

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from ksu_common.schemas.responses import success

from ...core.auth import require_scope
from ...core.database import get_db
from ...schemas.ask_ai import ResearchAskAIRequest
from ...services.ask_ai import ResearchAskAIService

router = APIRouter(tags=["Research Ask AI"], dependencies=[Depends(require_scope("research.view"))])


@router.post("/ask-ai")
async def ask_research_ai(
    request: ResearchAskAIRequest,
    db=Depends(get_db),
    user=Depends(require_scope("research.view")),
):
    context = request.context
    response = await ResearchAskAIService.ask(
        db,
        user_id=uuid.UUID(str(user.sub)),
        message=request.message,
        path=context.path,
        section=context.section,
        resource_key=context.resource_key,
        record_id=context.record_id,
        scope=request.scope,
        intent_mode=request.intent_mode,
        request_references=[reference.model_dump(mode="json") for reference in request.references],
        conversation_id=request.conversation_id,
    )
    return success(data=response.model_dump(mode="json"))


@router.post("/ask-ai/stream")
async def stream_research_ai(
    request: ResearchAskAIRequest,
    db=Depends(get_db),
    user=Depends(require_scope("research.view")),
):
    async def event_stream():
        context = request.context
        response = await ResearchAskAIService.ask(
            db,
            user_id=uuid.UUID(str(user.sub)),
            message=request.message,
            path=context.path,
            section=context.section,
            resource_key=context.resource_key,
            record_id=context.record_id,
            scope=request.scope,
            intent_mode=request.intent_mode,
            request_references=[reference.model_dump(mode="json") for reference in request.references],
            conversation_id=request.conversation_id,
        )
        payload = response.model_dump(mode="json")
        yield _sse(
            "metadata",
            {
                "conversation_id": payload.get("conversation_id"),
                "user_message_id": payload.get("user_message_id"),
                "assistant_message_id": payload.get("assistant_message_id"),
                "content_format": payload.get("content_format"),
                "context": payload.get("context"),
                "references": payload.get("references", []),
                "suggested_prompts": payload.get("suggested_prompts", []),
            },
        )
        for chunk in ResearchAskAIService.markdown_chunks(response.answer):
            yield _sse("delta", {"text": chunk})
            await asyncio.sleep(0)
        yield _sse("done", payload)

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.get("/ask-ai/conversations")
async def list_ask_ai_conversations(
    db=Depends(get_db),
    user=Depends(require_scope("research.view")),
):
    conversations = await ResearchAskAIService.list_conversations(db, uuid.UUID(str(user.sub)))
    return success(data=[conversation.model_dump(mode="json") for conversation in conversations])


@router.get("/ask-ai/conversations/{conversation_id}/messages")
async def list_ask_ai_messages(
    conversation_id: uuid.UUID,
    db=Depends(get_db),
    user=Depends(require_scope("research.view")),
):
    messages = await ResearchAskAIService.list_messages(db, uuid.UUID(str(user.sub)), conversation_id)
    return success(data=[message.model_dump(mode="json") for message in messages])


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False, default=str)}\n\n"
