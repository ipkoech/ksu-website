from __future__ import annotations

import inspect
import uuid
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from app.api.v1 import page_cms
from app.models import Media, MediaLink, PageSection, SectionItem
from app.schemas.page_cms import (
    PageCmsSourceSummary,
    PagePreviewItem,
    PagePreviewMediaLink,
    PagePreviewResolvedSource,
    PagePreviewResponse,
    PagePreviewSection,
)
from app.services.page_cms import (
    PagePreviewCompositionService,
    PageSectionService,
    PageSectionValidationService,
    group_preview_media_links_many,
)
from app.services import page_cms as page_cms_service
from app.services.page_cms_sources import (
    PageCmsSourceResolution,
    PageCmsSourceResolutionState,
)


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


def _section(
    *,
    status="draft",
    scope_type="school",
    scope_id=None,
    source_type="news",
    layout_variant="news_grid",
):
    scope_id = scope_id or uuid.uuid4()
    section = PageSection(
        page_key="homepage",
        scope_type=scope_type,
        scope_id=scope_id,
        section_key="news",
        layout_variant=layout_variant,
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

    await PageSectionService.list_preview(
        db,
        page_key="homepage",
        scope_type="university",
        scope_id=None,
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
        patch.object(PageSectionService, "list_preview", AsyncMock(return_value=[section])),
        patch(
            "app.services.page_cms.group_preview_media_links_many",
            AsyncMock(return_value={section.id: {}}),
        ),
        patch(
            "app.services.page_cms.PageCmsSourceService.resolve_many",
            AsyncMock(return_value={
                ("news", section.items[0].source_id): PageCmsSourceResolution(
                    source_type="news",
                    source_id=section.items[0].source_id,
                    state=PageCmsSourceResolutionState.RESOLVED,
                    source=source,
                ),
            }),
        ) as resolve,
    ):
        result = await PagePreviewCompositionService.compose(
            object(),
            "homepage",
            "school",
            school_id,
            preview_capability=capability,
        )

    assert result.sections[0].status == "draft"
    assert result.sections[0].items[0].source.label == "Draft graduation update"
    assert resolve.await_args.kwargs == {
        "destination_scope_type": "school",
        "destination_scope_id": school_id,
        "preview_capability": capability,
    }


@pytest.mark.asyncio
async def test_preview_surfaces_unsupported_partner_draft_resolution():
    section = _section(
        scope_type="research",
        source_type="research_partner",
        layout_variant="featured_partnership",
    )

    with (
        patch.object(PageSectionService, "list_preview", AsyncMock(return_value=[section])),
        patch(
            "app.services.page_cms.group_preview_media_links_many",
            AsyncMock(return_value={section.id: {}}),
        ),
        patch(
            "app.services.page_cms.PageCmsSourceService.resolve_many",
            AsyncMock(return_value={
                ("research_partner", section.items[0].source_id): PageCmsSourceResolution(
                    source_type="research_partner",
                    source_id=section.items[0].source_id,
                    state=PageCmsSourceResolutionState.PREVIEW_UNSUPPORTED,
                ),
            }),
        ),
    ):
        result = await PagePreviewCompositionService.compose(
            object(),
            "homepage",
            "research",
            section.scope_id,
            preview_capability=SimpleNamespace(),
        )

    issue = next(issue for issue in result.issues if issue.code == "source_preview_unsupported")
    assert issue.blocking is True
    assert "unsupported" in issue.message.lower()


def _media_link(entity_id: uuid.UUID, role: str, *, media_type: str = "image", mime_type: str = "image/jpeg"):
    media = Media(
        filename=f"{role}.bin",
        original_filename=f"{role}.bin",
        mime_type=mime_type,
        file_size=100,
        storage_path=f"uploads/{role}.bin",
        media_type=media_type,
        is_public=False,
    )
    media.id = uuid.uuid4()
    link = MediaLink(
        media=media,
        media_id=media.id,
        entity_type="page_section",
        entity_id=entity_id,
        role=role,
        display_order=10,
    )
    link.id = uuid.uuid4()
    return link


@pytest.mark.asyncio
async def test_preview_media_bulk_query_filters_lifecycle_and_preserves_signing_and_unknown_roles():
    section_id = uuid.uuid4()
    db = _Db([
        _media_link(section_id, "signing_photo"),
        _media_link(section_id, "custom_editorial_role"),
    ])

    grouped = await group_preview_media_links_many(db, "page_section", [section_id])

    assert len(db.statements) == 1
    query = str(db.statements[0]).lower()
    assert "media_links.archived_at is null" in query
    assert "media_links.deleted_at is null" in query
    assert "media.deleted_at is null" in query
    assert grouped[section_id]["signingPhoto"][0]["role"] == "signing_photo"
    assert grouped[section_id]["custom_editorial_role"][0]["role"] == "custom_editorial_role"


@pytest.mark.asyncio
async def test_preview_bulk_loads_media_once_and_resolves_all_sources_once():
    school_id = uuid.uuid4()
    first = _section(scope_id=school_id)
    second = _section(scope_id=school_id)
    source_resolutions = {
        ("news", section.items[0].source_id): PageCmsSourceResolution(
            source_type="news",
            source_id=section.items[0].source_id,
            state=PageCmsSourceResolutionState.RESOLVED,
            source=PageCmsSourceSummary(
                id=section.items[0].source_id,
                source_type="news",
                label=f"Source {index}",
                status="published",
            ),
        )
        for index, section in enumerate((first, second), start=1)
    }
    resolve_many = AsyncMock(return_value=source_resolutions)
    media_many = AsyncMock(return_value={first.id: {}, second.id: {}})
    db = object()

    with (
        patch.object(PageSectionService, "list_preview", AsyncMock(return_value=[first, second])),
        patch("app.services.page_cms.PageCmsSourceService.resolve_many", resolve_many),
        patch("app.services.page_cms.group_preview_media_links_many", media_many),
    ):
        result = await PagePreviewCompositionService.compose(
            db,
            "homepage",
            "school",
            school_id,
            preview_capability=SimpleNamespace(),
        )

    assert len(result.sections) == 2
    resolve_many.assert_awaited_once()
    media_many.assert_awaited_once_with(db, "page_section", [first.id, second.id])


@pytest.mark.asyncio
async def test_source_resolution_rejects_mixed_section_scopes_before_reusing_source_result():
    source_id = uuid.uuid4()
    first = _section(scope_id=uuid.uuid4())
    second = _section(scope_id=uuid.uuid4())
    first.items[0].source_id = source_id
    second.items[0].source_id = source_id

    with patch(
        "app.services.page_cms.PageCmsSourceService.resolve_many",
        AsyncMock(),
    ) as resolve_many:
        with pytest.raises(page_cms_service.PageCmsMixedScopeError):
            await PageSectionValidationService.resolve_items_for_sections(
                object(),
                [first, second],
                SimpleNamespace(),
            )

    resolve_many.assert_not_awaited()


@pytest.mark.asyncio
async def test_preview_media_bulk_query_chunks_more_than_one_thousand_section_ids():
    section_ids = [uuid.uuid4() for _ in range(1001)]
    db = _Db()

    grouped = await group_preview_media_links_many(db, "page_section", section_ids)

    assert len(db.statements) == 3
    assert list(grouped) == section_ids
    for statement in db.statements:
        parameter_sizes = [
            len(value)
            for value in statement.compile().params.values()
            if isinstance(value, (list, tuple))
        ]
        assert parameter_sizes
        assert max(parameter_sizes) <= page_cms_service.PAGE_CMS_BULK_CHUNK_SIZE


def test_preview_response_uses_typed_section_item_media_and_source_contracts():
    assert PagePreviewResponse.model_fields["sections"].annotation == list[PagePreviewSection]
    assert PagePreviewSection.model_fields["items"].annotation == list[PagePreviewItem]
    assert PagePreviewItem.model_fields["source"].annotation == PagePreviewResolvedSource | None
    assert PagePreviewSection.model_fields["media"].annotation == dict[str, list[PagePreviewMediaLink]]


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
async def test_preview_endpoint_rejects_malformed_service_payload_at_typed_boundary():
    user = SimpleNamespace(id=uuid.uuid4())
    malformed = {
        "page_key": "homepage",
        "scope_type": "university",
        "scope_id": None,
        "sections": [{"id": str(uuid.uuid4()), "items": "not-a-list"}],
        "issues": [],
    }

    with (
        patch.object(page_cms, "_require_page_preview_access", AsyncMock()),
        patch.object(page_cms.PagePreviewCompositionService, "compose", AsyncMock(return_value=malformed)),
    ):
        with pytest.raises(ValidationError):
            await page_cms.get_page_preview(
                "homepage", db=object(), user=user, scope_type="university", scope_id=None,
            )


@pytest.mark.asyncio
async def test_validate_endpoint_returns_only_authorized_preview_validation_contract():
    user = SimpleNamespace(id=uuid.uuid4())
    section_id = uuid.uuid4()
    payload = {
        "page_key": "homepage",
        "scope_type": "university",
        "scope_id": None,
        "sections": [],
        "issues": [{
            "code": "missing_title",
            "severity": "error",
            "section_id": str(section_id),
            "item_id": None,
            "field": "title",
            "message": "Title is required.",
            "blocking": True,
        }],
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
        "issues": [{**payload["issues"][0], "section_id": str(section_id)}],
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
