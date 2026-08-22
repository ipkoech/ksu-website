from __future__ import annotations

import ast
from pathlib import Path


MODULE = Path(__file__).parents[1] / "app/api/v1/academic_calendars.py"


def _function(name: str) -> ast.AsyncFunctionDef:
    module = ast.parse(MODULE.read_text())
    return next(
        node
        for node in module.body
        if isinstance(node, ast.AsyncFunctionDef) and node.name == name
    )


def _public_list_function() -> ast.AsyncFunctionDef:
    module = ast.parse(MODULE.read_text())
    return next(
        node
        for node in module.body
        if isinstance(node, ast.AsyncFunctionDef)
        and node.name == "list_academic_calendars"
    )


def test_public_calendar_status_filter_only_accepts_public_states() -> None:
    function = _public_list_function()
    status_arg = next(arg for arg in function.args.args if arg.arg == "status")
    annotation = ast.unparse(status_arg.annotation)

    assert "Literal['published', 'current']" in annotation


def test_public_calendar_query_defaults_to_public_states() -> None:
    source = ast.unparse(_public_list_function())

    assert "AcademicCalendar.status.in_(('published', 'current'))" in source


def test_composition_filters_normalized_events_by_publication_state() -> None:
    source = ast.unparse(_function("get_current_calendar_composition"))

    assert "event.is_public and event.is_published" in source
    assert "event.workflow_status == 'published'" in source
    assert "calendar_summary" in source


def test_authoring_cannot_set_calendar_status_directly() -> None:
    create = ast.unparse(_function("create_academic_calendar"))
    update = ast.unparse(_function("update_academic_calendar"))

    assert "exclude={'status'}" in create
    assert "status='draft'" in create
    assert "exclude={'status'}" in update
    assert "reset_after_authoring_edit" in update
