from types import SimpleNamespace
from uuid import uuid4

import pytest

from app.services.content_workflow import ContentWorkflowService, story_has_body


def test_story_has_body_rejects_empty_html():
    assert story_has_body("<p> </p>") is False


def test_story_has_body_accepts_rich_text_or_structured_content():
    assert story_has_body("<p>Published story</p>") is True
    assert story_has_body({"blocks": [{"type": "paragraph"}]}) is True


@pytest.mark.asyncio
async def test_empty_story_cannot_be_published():
    story = SimpleNamespace(
        id=uuid4(),
        status="approved",
        workflow_status="approved",
        rich_text=None,
        plain_text=None,
        structured_content=None,
    )

    with pytest.raises(ValueError, match="without body content"):
        await ContentWorkflowService.transition(
            SimpleNamespace(), story, "stories", "publish", uuid4()
        )
