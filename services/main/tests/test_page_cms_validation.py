from __future__ import annotations

import uuid
from dataclasses import replace
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import PageSection, SectionItem
from app.schemas.page_cms import PageCmsSourceSummary, PageValidationIssue
from app.services.page_cms import (
    PageCmsValidationError,
    PageSectionValidationService,
    PageSectionWorkflowService,
    ResolvedSectionItem,
)
from app.services.page_cms_definitions import SECTION_DEFINITIONS


class _WorkflowDb:
    def __init__(self):
        self.added = []

    def add(self, record):
        self.added.append(record)


def _media_groups(**overrides):
    groups = {
        "heroImage": [],
        "mobileImage": [],
        "logos": [],
        "gallery": [],
        "video": [],
        "background": [],
        "poster": [],
        "signingPhoto": [],
    }
    groups.update(overrides)
    return groups


def _media(
    alt_text: str | None = "Descriptive text",
    *,
    media_type: str = "image",
    mime_type: str = "image/jpeg",
    role: str | None = None,
):
    return {
        "id": uuid.uuid4(),
        "role": role,
        "media": {
            "id": uuid.uuid4(),
            "alt_text": alt_text,
            "media_type": media_type,
            "mime_type": mime_type,
        },
    }


def _item(**overrides):
    values = {
        "page_section_id": uuid.uuid4(),
        "item_type": "card",
        "title": "Item",
        "display_order": 10,
        "is_enabled": True,
    }
    values.update(overrides)
    item = SectionItem(**values)
    item.id = overrides.get("id", uuid.uuid4())
    return item


def _section(
    layout_variant: str,
    *,
    title: str | None = "Section",
    items=None,
    status: str = "draft",
    scope_type: str = "university",
    scope_id: uuid.UUID | None = None,
    settings: dict | None = None,
):
    section = PageSection(
        page_key="homepage",
        scope_type=scope_type,
        scope_id=scope_id,
        section_key=layout_variant,
        layout_variant=layout_variant,
        title=title,
        status=status,
        workflow_status=status,
        settings=settings,
    )
    section.id = uuid.uuid4()
    section.items = list(items or [])
    for item in section.items:
        item.page_section = section
        item.page_section_id = section.id
    return section


def _summary(item: SectionItem, **overrides):
    values = {
        "id": item.source_id,
        "source_type": item.source_type,
        "label": "Resolved source",
        "status": "published",
        "metadata": {},
        "selectable": True,
    }
    values.update(overrides)
    return PageCmsSourceSummary(**values)


def test_hero_missing_mobile_image_is_blocking():
    section = _section("hero_admissions", items=[_item(item_type="cta", cta_label="Apply", cta_url="/apply")])

    issues = PageSectionValidationService.validate(
        section,
        [],
        _media_groups(heroImage=[_media()], mobileImage=[]),
    )

    assert any(issue.code == "missing_mobile_image" and issue.blocking for issue in issues)


def test_image_without_alt_text_is_a_non_blocking_warning():
    section = _section("media_mosaic")

    issues = PageSectionValidationService.validate(
        section,
        [],
        _media_groups(gallery=[_media(None)]),
    )

    issue = next(issue for issue in issues if issue.code == "missing_media_alt")
    assert issue.severity == "warning"
    assert issue.blocking is False
    assert issue.field == "gallery.alt_text"


def test_single_media_role_rejects_more_than_one_attachment():
    section = _section("hero_admissions", items=[_item(item_type="cta", cta_label="Apply", cta_url="/apply")])

    issues = PageSectionValidationService.validate(
        section,
        [],
        _media_groups(heroImage=[_media(), _media()], mobileImage=[_media()]),
    )

    assert any(issue.code == "too_many_media" and issue.field == "hero_image" and issue.blocking for issue in issues)


def test_invalid_cta_is_blocking():
    section = _section(
        "hero_admissions",
        items=[_item(item_type="cta", cta_label="Apply", cta_url="javascript:alert(1)")],
    )

    issues = PageSectionValidationService.validate(
        section,
        [],
        _media_groups(heroImage=[_media()], mobileImage=[_media()]),
    )

    assert any(
        issue.code == "invalid_cta"
        and issue.item_id == section.items[0].id
        and issue.blocking
        for issue in issues
    )


def test_empty_required_section_and_missing_required_field_are_blocking():
    section = _section("facts_strip", title="   ", items=[])

    issues = PageSectionValidationService.validate(section, [], _media_groups())

    assert any(issue.code == "missing_required_field" and issue.field == "title" and issue.blocking for issue in issues)
    assert any(issue.code == "empty_required_section" and issue.blocking for issue in issues)


def test_too_many_items_is_blocking():
    section = _section("news_grid", items=[_item() for _ in range(7)])

    issues = PageSectionValidationService.validate(section, [], _media_groups())

    assert any(issue.code == "too_many_items" and issue.blocking for issue in issues)


def test_layout_variant_rejects_disallowed_page_scope():
    section = _section(
        "featured_partnership",
        scope_type="library",
        scope_id=uuid.uuid4(),
        items=[_item()],
    )

    issues = PageSectionValidationService.validate(section, [], _media_groups())

    assert any(issue.code == "layout_scope_not_allowed" and issue.field == "scope_type" for issue in issues)


def test_manual_item_type_must_be_allowed_by_definition():
    section = _section("news_grid", items=[_item(item_type="stat")])

    issues = PageSectionValidationService.validate(section, [], _media_groups())

    assert any(issue.code == "item_type_not_allowed" and issue.item_id == section.items[0].id for issue in issues)


def test_reference_source_type_must_be_allowed_by_definition():
    item = _item(item_type="reference", title=None, source_type="event", source_id=uuid.uuid4())
    section = _section("news_grid", items=[item])

    issues = PageSectionValidationService.validate(section, [], _media_groups())

    assert any(issue.code == "source_type_not_allowed" and issue.item_id == item.id for issue in issues)


def test_media_role_rejects_document_for_hero_image():
    section = _section(
        "hero_admissions",
        items=[_item(item_type="cta", cta_label="Apply", cta_url="/apply")],
    )

    issues = PageSectionValidationService.validate(
        section,
        [],
        _media_groups(
            heroImage=[_media(media_type="document", mime_type="application/pdf")],
            mobileImage=[_media()],
        ),
    )

    assert any(issue.code == "invalid_media_type" and issue.field == "hero_image" for issue in issues)


def test_unknown_media_role_is_blocking_instead_of_silently_dropped():
    section = _section("news_grid", items=[_item()])

    issues = PageSectionValidationService.validate(
        section,
        [],
        {**_media_groups(), "mysteryRole": [_media(role="mysteryRole")]},
    )

    assert any(issue.code == "unknown_media_role" and issue.field == "mysteryRole" for issue in issues)


def test_unknown_settings_warn_but_known_invalid_settings_remain_blocking():
    section = _section(
        "programme_finder",
        items=[_item(item_type="cta", cta_label="Browse", cta_url="/programmes")],
        settings={"filters": "not-a-list", "unknown": True, "pathway_steps": [1, 2, 3, 4, 5, 6]},
    )

    issues = PageSectionValidationService.validate(section, [], _media_groups())

    unknown = next(issue for issue in issues if issue.code == "unknown_setting" and issue.field == "settings.unknown")
    assert unknown.severity == "warning"
    assert unknown.blocking is False
    assert next(issue for issue in issues if issue.code == "invalid_setting_type" and issue.field == "settings.filters").blocking is True
    assert next(issue for issue in issues if issue.code == "setting_limit_exceeded" and issue.field == "settings.pathway_steps").blocking is True


def test_settings_schema_enforces_required_enum_and_numeric_range():
    definition = replace(
        SECTION_DEFINITIONS["pulse_strip"],
        settings_schema={
            "mode": {"type": "string", "required": True, "enum": ["compact", "expanded"]},
            "label": {"type": "string", "required": True},
            "priority": {"type": "integer", "minimum": 1, "maximum": 5},
        },
    )
    section = _section("pulse_strip", items=[_item()], settings={"mode": "wide", "priority": 8})

    with patch.dict(SECTION_DEFINITIONS, {"pulse_strip": definition}):
        issues = PageSectionValidationService.validate(section, [], _media_groups())

    assert any(issue.code == "invalid_setting_value" and issue.field == "settings.mode" for issue in issues)
    assert any(issue.code == "missing_required_setting" and issue.field == "settings.label" for issue in issues)
    assert any(issue.code == "setting_out_of_range" and issue.field == "settings.priority" for issue in issues)


def test_duplicate_source_selection_is_blocking():
    source_id = uuid.uuid4()
    first = _item(item_type="reference", title=None, source_type="news", source_id=source_id)
    second = _item(item_type="reference", title=None, source_type="news", source_id=source_id)
    section = _section("news_grid", items=[first, second])
    resolved = [
        ResolvedSectionItem(first, _summary(first)),
        ResolvedSectionItem(second, _summary(second)),
    ]

    issues = PageSectionValidationService.validate(section, resolved, _media_groups())

    duplicate = next(issue for issue in issues if issue.code == "duplicate_source")
    assert duplicate.item_id in {first.id, second.id}
    assert duplicate.blocking is True


@pytest.mark.parametrize(
    ("failure", "code"),
    [
        ("unavailable", "source_unavailable"),
        ("expired", "source_expired"),
        ("inaccessible", "source_inaccessible"),
        ("provider_error", "source_provider_error"),
        ("unsupported_type", "source_unsupported_type"),
        ("preview_unsupported", "source_preview_unsupported"),
    ],
)
def test_source_resolution_failures_are_blocking(failure: str, code: str):
    item = _item(item_type="reference", title=None, source_type="news", source_id=uuid.uuid4())
    section = _section("news_grid", items=[item])

    issues = PageSectionValidationService.validate(
        section,
        [ResolvedSectionItem(item, failure=failure)],
        _media_groups(),
    )

    assert any(issue.code == code and issue.item_id == item.id and issue.blocking for issue in issues)


def test_resolved_but_non_selectable_published_source_is_expired():
    item = _item(item_type="reference", title=None, source_type="news", source_id=uuid.uuid4())
    section = _section("news_grid", items=[item])
    source = _summary(item, status="published", selectable=False)

    issues = PageSectionValidationService.validate(
        section,
        [ResolvedSectionItem(item, source)],
        _media_groups(),
    )

    assert any(issue.code == "source_expired" and issue.item_id == item.id and issue.blocking for issue in issues)


def test_unverified_fact_source_is_blocking():
    item = _item(item_type="reference", title=None, source_type="public_stat", source_id=uuid.uuid4())
    section = _section("facts_strip", items=[item])
    source = _summary(item, status="draft", metadata={"verified": False}, selectable=False)

    issues = PageSectionValidationService.validate(
        section,
        [ResolvedSectionItem(item, source)],
        _media_groups(),
    )

    assert any(issue.code == "unverified_fact" and issue.item_id == item.id and issue.blocking for issue in issues)


@pytest.mark.asyncio
async def test_blocking_issues_prevent_submit_before_workflow_state_changes():
    section = _section("facts_strip", items=[])
    issue = PageValidationIssue(
        code="empty_required_section",
        severity="error",
        section_id=section.id,
        field="items",
        message="At least one item is required.",
        blocking=True,
    )

    with patch.object(
        PageSectionValidationService,
        "validate_for_section",
        AsyncMock(return_value=[issue]),
    ) as validate:
        with pytest.raises(PageCmsValidationError) as error:
            await PageSectionWorkflowService.transition(
                section,
                "submit",
                uuid.uuid4(),
                db=_WorkflowDb(),
                preview_capability=SimpleNamespace(),
            )

    validate.assert_awaited_once()
    assert error.value.issues == [issue]
    assert section.status == "draft"


@pytest.mark.asyncio
async def test_non_blocking_warnings_do_not_prevent_submit():
    section = _section("media_mosaic")
    warning = PageValidationIssue(
        code="missing_media_alt",
        severity="warning",
        section_id=section.id,
        field="gallery.alt_text",
        message="Image alt text is missing.",
        blocking=False,
    )

    with patch.object(
        PageSectionValidationService,
        "validate_for_section",
        AsyncMock(return_value=[warning]),
    ):
        await PageSectionWorkflowService.transition(
            section,
            "submit",
            uuid.uuid4(),
            db=_WorkflowDb(),
            preview_capability=SimpleNamespace(),
        )

    assert section.status == "in_review"


@pytest.mark.asyncio
@pytest.mark.parametrize(("status", "action"), [("draft", "submit"), ("in_review", "approve"), ("approved", "publish")])
async def test_each_forward_workflow_transition_recomputes_validation(status: str, action: str):
    section = _section("pulse_strip", status=status, items=[_item()])

    with patch.object(
        PageSectionValidationService,
        "validate_for_section",
        AsyncMock(return_value=[]),
    ) as validate:
        await PageSectionWorkflowService.transition(
            section,
            action,
            uuid.uuid4(),
            db=_WorkflowDb(),
            preview_capability=SimpleNamespace(),
        )

    validate.assert_awaited_once()


@pytest.mark.asyncio
async def test_real_database_workflow_recomputes_validation_without_preview_capability():
    section = _section("pulse_strip", items=[_item()])
    db = MagicMock(spec=AsyncSession)

    with patch.object(
        PageSectionValidationService,
        "validate_for_section",
        AsyncMock(return_value=[]),
    ) as validate:
        await PageSectionWorkflowService.transition(
            section,
            "submit",
            uuid.uuid4(),
            db=db,
        )

    validate.assert_awaited_once_with(db, section, None)


@pytest.mark.asyncio
async def test_forward_workflow_transition_requires_database_dependency():
    section = _section("pulse_strip", items=[_item()])

    with pytest.raises(TypeError):
        await PageSectionWorkflowService.transition(section, "submit", uuid.uuid4())


@pytest.mark.asyncio
async def test_forward_workflow_validates_with_non_asyncsession_database_adapter():
    section = _section("pulse_strip", items=[_item()])
    db = _WorkflowDb()

    with patch.object(
        PageSectionValidationService,
        "validate_for_section",
        AsyncMock(return_value=[]),
    ) as validate:
        await PageSectionWorkflowService.transition(section, "submit", uuid.uuid4(), db=db)

    validate.assert_awaited_once_with(db, section, None)
