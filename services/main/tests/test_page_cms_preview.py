from __future__ import annotations

import inspect
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException

from app.api.v1 import page_cms
from app.models import PageSection, SectionItem
from app.schemas.page_cms import PageCmsSourceSummary
from app.services.page_cms import PagePreviewCompositionService, PageSectionService
from app.services.page_cms_source_errors import PageCmsSourcePreviewUnsupportedError


class _ScalarRows:
    def __init__(self, rows):
        self.rows = list(rows)

    def scalars(self):
        return self

    def all(self):
        return list(self.rows)


class _Db:
    def __init__(self, rows=()):
        self.rows = list(rows)
        self.statements = []

    async def execute(self, statement):
        self.statements.append(statement)
        return _ScalarRows(self.rows)


def _section(*, status="draft", scope_type="school", scope_id=None, source_type="news"):
    scope_id = scope_id or uuid.uuid4()
    section = PageSection(
        page_key="homepage",
        scope_type=scope_type,
        scope_id=scope_id,
        section_key="news",
        layout_variant="news_grid",
        title="School news",
        status=status,
        workflow_status=status,
        display_order=10,
    )
    section.id = uuid.uuid4()
    item = SectionItem(
        page_section=section,
        page_section_id=section.id,
        item_type="reference",
        source_type=source_type,
        source_id=uuid.uuid4(),
        display_order=10,
        is_enabled=True,
    )
    item.id = uuid.uuid4()
    section.items = [item]
    return section


@pytest.mark.asyncio
async def test_preview_query_excludes_archived_sections_before_authorization():
    db = _Db()

    await PageSectionService.list_preview_authorized(
        db,
        page_key="homepage",
        scope_type="university",
        scope_id=None,
        is_visible=AsyncMock(return_value=True),
    )

    query = str(db.statements[0]).lower()
    assert "page_sections.status !=" in query
    assert "archived" in db.statements[0].compile().params.values()


@pytest.mark.asyncio
async def test_preview_includes_authorized_draft_and_resolves_source_in_destination_scope():
    school_id = uuid.uuid4()
    section = _section(scope_id=school_id)
    capability = SimpleNamespace(allows=AsyncMock(return_value=True))
    source = PageCmsSourceSummary(
        id=section.items[0].source_id,
        source_type="news",
        label="Draft graduation update",
        status="draft",
        selectable=False,
    )

    with (
        patch.object(PageSectionService, "list_preview_authorized", AsyncMock(return_value=[section])),
        patch("app.services.page_cms.group_preview_media_links", AsyncMock(return_value={})),
        patch("app.services.page_cms.PageCmsSourceService.resolve", AsyncMock(return_value=source)) as resolve,
    ):
        result = await PagePreviewCompositionService.compose(
            object(),
            "homepage",
            "school",
            school_id,
            is_visible=AsyncMock(return_value=True),
            preview_capability=capability,
        )

    assert result["sections"][0]["status"] == "draft"
    assert result["sections"][0]["items"][0]["source"]["label"] == "Draft graduation update"
    assert resolve.await_args.kwargs == {
        "destination_scope_type": "school",
        "destination_scope_id": school_id,
        "preview_capability": capability,
    }


@pytest.mark.asyncio
async def test_preview_surfaces_unsupported_partner_draft_resolution():
    section = _section(scope_type="research", source_type="research_partner")

    with (
        patch.object(PageSectionService, "list_preview_authorized", AsyncMock(return_value=[section])),
        patch("app.services.page_cms.group_preview_media_links", AsyncMock(return_value={})),
        patch(
            "app.services.page_cms.PageCmsSourceService.resolve",
            AsyncMock(side_effect=PageCmsSourcePreviewUnsupportedError("Research partner preview is unsupported")),
        ),
    ):
        result = await PagePreviewCompositionService.compose(
            object(),
            "homepage",
            "research",
            section.scope_id,
            is_visible=AsyncMock(return_value=True),
            preview_capability=SimpleNamespace(),
        )

    issue = next(issue for issue in result["issues"] if issue["code"] == "source_preview_unsupported")
    assert issue["blocking"] is True
    assert "unsupported" in issue["message"].lower()


@pytest.mark.asyncio
async def test_preview_endpoint_checks_page_scope_before_composition():
    user = SimpleNamespace(id=uuid.uuid4())
    compose = AsyncMock()

    with (
        patch.object(page_cms, "_require_page_preview_access", AsyncMock(side_effect=HTTPException(403, "Denied"))),
        patch.object(page_cms.PagePreviewCompositionService, "compose", compose),
    ):
        with pytest.raises(HTTPException) as error:
            await page_cms.get_page_preview(
                "homepage",
                db=object(),
                user=user,
                scope_type="school",
                scope_id=uuid.uuid4(),
            )

    assert error.value.status_code == 403
    compose.assert_not_awaited()


@pytest.mark.asyncio
async def test_preview_endpoint_returns_standard_success_envelope():
    user = SimpleNamespace(id=uuid.uuid4())
    payload = {"page_key": "homepage", "scope_type": "university", "scope_id": None, "sections": [], "issues": []}

    with (
        patch.object(page_cms, "_require_page_preview_access", AsyncMock()),
        patch.object(page_cms.PagePreviewCompositionService, "compose", AsyncMock(return_value=payload)) as compose,
    ):
        response = await page_cms.get_page_preview(
            "homepage", db=object(), user=user, scope_type="university", scope_id=None,
        )

    assert response["status"] == "success"
    assert response["data"] == payload
    assert compose.await_args.kwargs["preview_capability"] is not None


@pytest.mark.asyncio
async def test_validate_endpoint_returns_only_authorized_preview_validation_contract():
    user = SimpleNamespace(id=uuid.uuid4())
    payload = {
        "page_key": "homepage",
        "scope_type": "university",
        "scope_id": None,
        "sections": [{"id": str(uuid.uuid4())}],
        "issues": [{"code": "missing_title"}],
    }

    with (
        patch.object(page_cms, "_require_page_preview_access", AsyncMock()),
        patch.object(page_cms.PagePreviewCompositionService, "compose", AsyncMock(return_value=payload)),
    ):
        response = await page_cms.validate_page(
            "homepage", db=object(), user=user, scope_type="university", scope_id=None,
        )

    assert response["data"] == {
        "page_key": "homepage",
        "scope_type": "university",
        "scope_id": None,
        "issues": payload["issues"],
    }


def test_public_homepage_has_no_preview_parameter():
    parameters = inspect.signature(page_cms.get_homepage).parameters

    assert "preview" not in parameters


@pytest.mark.asyncio
async def test_public_homepage_always_uses_published_composition_service():
    public_payload = {"page_key": "homepage", "scope_type": "university", "scope_id": None, "sections": []}
    db = object()

    with (
        patch.object(page_cms.HomepageCompositionService, "compose", AsyncMock(return_value=public_payload)) as public,
        patch.object(page_cms.PagePreviewCompositionService, "compose", AsyncMock()) as preview,
    ):
        response = await page_cms.get_homepage(db=db, scope_type="university", scope_id=None)

    assert response["data"] == public_payload
    public.assert_awaited_once_with(db, "homepage", "university", None)
    preview.assert_not_awaited()
