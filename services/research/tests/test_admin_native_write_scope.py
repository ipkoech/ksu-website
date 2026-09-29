"""Regression assertions against native Pydantic fields and ORM ownership.

Runs in the repository's existing Research backend test environment. JWT and
PostgreSQL transaction concurrency remain separate integration acceptance tests.
"""
from types import SimpleNamespace
from uuid import UUID

from app.models import ResearchCenter, ResearchProject
from app.schemas import (
    ResearchCenterCreate,
    ResearchProjectCreate,
    ResearchProjectUpdate,
)
from app.services.admin_workspace_write_scope import (
    create_scope_targets,
    mutation_scope_targets,
)

A = UUID("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")
B = UUID("bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb")


def test_native_patch_distinguishes_omitted_center_from_explicit_null():
    record = SimpleNamespace(id=B, center_id=A)
    omitted = ResearchProjectUpdate(title="Updated title")
    cleared = ResearchProjectUpdate(center_id=None)
    assert "center_id" not in omitted.model_fields_set
    assert "center_id" in cleared.model_fields_set
    assert mutation_scope_targets("projects", ResearchProject, record, omitted) == (A,)
    assert mutation_scope_targets("projects", ResearchProject, record, cleared) == (A, None)


def test_native_move_checks_source_and_destination():
    record = SimpleNamespace(id=B, center_id=A)
    patch = ResearchProjectUpdate(center_id=B)
    assert mutation_scope_targets("projects", ResearchProject, record, patch) == (A, B)


def test_attaching_unassigned_native_project_requires_both_scopes():
    record = SimpleNamespace(id=B, center_id=None)
    patch = ResearchProjectUpdate(center_id=A)
    assert mutation_scope_targets("projects", ResearchProject, record, patch) == (None, A)


def test_center_record_is_owned_by_its_native_primary_key():
    assert not hasattr(ResearchCenter, "center_id")
    record = SimpleNamespace(id=A)
    assert mutation_scope_targets("centers", ResearchCenter, record) == (A,)


def test_native_new_center_requires_unassigned_creation_authority():
    payload = ResearchCenterCreate(name="A new research center", slug="new-center")
    assert create_scope_targets("centers", ResearchCenter, payload) == (None,)


def test_native_project_creation_uses_submitted_center():
    payload = ResearchProjectCreate(title="A research study", slug="a-study", center_id=A)
    assert create_scope_targets("projects", ResearchProject, payload) == (A,)
