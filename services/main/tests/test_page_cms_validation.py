from __future__ import annotations

import uuid
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
    }
    groups.update(overrides)
    return groups


def _media(alt_text: str | None = "Descriptive text"):
    return {"id": uuid.uuid4(), "media": {"id": uuid.uuid4(), "alt_text": alt_text}}


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


def _section(layout_variant: str, *, title: str | None = "Section", items=None, status: str = "draft"):
    section = PageSection(
        page_key="homepage",
        scope_type="university",
        section_key=layout_variant,
        layout_variant=layout_variant,
        title=title,
        status=status,
        workflow_status=status,
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
