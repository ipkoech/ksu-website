"""Records created by non-publishers must not reach the public site.

The research models were left unchanged, so the draft/pending gate is expressed
with whatever visibility columns each model already has. These tests pin that
mapping down — particularly the invariant that every "hidden" state is genuinely
excluded by the public visibility filter.
"""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

import pytest

_SERVICES = Path(__file__).resolve().parents[1] / "app" / "services"


def _load(name: str, filename: str):
    spec = importlib.util.spec_from_file_location(name, _SERVICES / filename)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


wf = _load("research_workflow", "research_workflow.py")

#: Mirrors ``CRUDService.public_statuses``; duplicated rather than imported so
#: this test does not drag in the Settings-constructing service package.
PUBLIC_STATUSES = (
    "published",
    "active",
    "available",
    "open",
    "ongoing",
    "upcoming",
    "approved",
    "completed",
    "closed",
    "awarded",
    "building",
)


class _Record:
    def __init__(self, **values):
        self.__dict__.update(values)


@pytest.mark.parametrize("state", [wf.DRAFT, wf.PENDING, wf.REJECTED])
def test_non_public_states_are_never_public_statuses(state):
    """The gate only works because these values fall outside the public set."""
    assert state not in PUBLIC_STATUSES


@pytest.mark.parametrize("resource_key", sorted(wf.VISIBILITY_ADAPTERS))
def test_every_hidden_state_is_excluded_from_the_public_site(resource_key):
    adapter = wf.VISIBILITY_ADAPTERS[resource_key]
    hidden = adapter.hidden_values()
    if adapter.boolean_field:
        assert hidden[adapter.boolean_field] is False
    if adapter.status_field:
        assert hidden[adapter.status_field] not in PUBLIC_STATUSES


@pytest.mark.parametrize("resource_key", sorted(wf.VISIBILITY_ADAPTERS))
def test_published_state_is_publicly_visible(resource_key):
    adapter = wf.VISIBILITY_ADAPTERS[resource_key]
    public = adapter.public_values()
    if adapter.boolean_field:
        assert public[adapter.boolean_field] is True
    if adapter.status_field:
        assert public[adapter.status_field] in PUBLIC_STATUSES


def test_a_farm_is_gated_on_is_public_because_it_has_no_status_column():
    record = _Record(is_public=True, is_active=True)
    assert wf.workflow_state("farms", record) == wf.PUBLISHED
    wf.apply_workflow_state("farms", record, wf.DRAFT)
    assert record.is_public is False
    assert wf.workflow_state("farms", record) == wf.DRAFT


def test_a_sustainability_initiative_is_gated_on_status_because_it_has_no_is_public():
    record = _Record(status="active", is_active=True)
    assert wf.workflow_state("sustainability", record) == wf.PUBLISHED
    wf.apply_workflow_state("sustainability", record, wf.PENDING)
    assert record.status == wf.PENDING
    assert wf.workflow_state("sustainability", record) == wf.PENDING


def test_a_project_uses_both_of_its_columns():
    record = _Record(is_public=True, is_active=True, status="ongoing")
    wf.apply_workflow_state("projects", record, wf.PENDING)
    assert record.is_public is False
    assert record.status == wf.PENDING
    wf.apply_workflow_state("projects", record, wf.PUBLISHED)
    assert record.is_public is True
    assert wf.workflow_state("projects", record) == wf.PUBLISHED


def test_pending_collapses_to_draft_where_no_status_column_exists():
    """A documented limitation of gating without a schema change.

    ``research_farms`` has no ``status`` column, so "awaiting review" and
    "draft" are the same stored state.
    """
    record = _Record(is_public=True)
    wf.apply_workflow_state("farms", record, wf.PENDING)
    assert wf.workflow_state("farms", record) == wf.DRAFT


def test_new_records_are_held_for_review():
    payload = _Record(is_public=True, status="active")
    wf.hold_for_review("projects", payload)
    assert payload.is_public is False
    assert payload.status == wf.PENDING


def test_holding_a_farm_hides_it_even_without_a_status_column():
    payload = _Record(is_public=True)
    wf.hold_for_review("farms", payload)
    assert payload.is_public is False


def test_only_publications_can_record_review_provenance():
    """Everything else must report that no audit trail is available."""
    assert wf.workflow_audit_supported("publications")
    for resource_key in wf.VISIBILITY_ADAPTERS:
        if resource_key != "publications":
            assert not wf.workflow_audit_supported(resource_key)


def test_an_unknown_state_is_rejected():
    from fastapi import HTTPException

    with pytest.raises(HTTPException) as excinfo:
        wf.apply_workflow_state("projects", _Record(), "live")
    assert excinfo.value.status_code == 400
