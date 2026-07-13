# Task 1 Report: Backend Governance Schema, Migration, Permissions, And Seed Data

## Status

Implemented the University Governance Administration backend schema foundation without adding services, routes, or frontend code.

## Changes

- Added `GovernanceRole` and `GovernancePageContent` SQLAlchemy models, relationships, public-page metadata, workflow fields, and required indexes.
- Extended `StaffAssignment` with governance appointment, publication workflow, and profile metadata, including the partial unique profile-slug index.
- Added the required governance Pydantic contracts, with constrained display groups, a validated optional profile slug, default display order/workflow status, and non-empty order nodes.
- Added Alembic revision `20260713_0021` from `20260712_0020`, including reverse-order downgrade operations.
- Seeded seven governance permissions into RBAC and granted them to `staff_admin`.
- Seeded the eight initial governance roles plus the University Council overview content idempotently.
- Added the prescribed model/schema contract test module.

## TDD Evidence

1. Added `services/main/tests/test_university_governance_admin.py` before production changes.
2. The prescribed `pytest tests/test_university_governance_admin.py -q` command could not run because `pytest` is absent from the shell `PATH`.
3. The managed virtual environment command initially failed during test collection because `GovernancePageContent` was not exported from `app.models`.
4. After implementation, `./.venv/bin/pytest tests/test_university_governance_admin.py -q` passed with `8 passed`.

## Verification

- `./.venv/bin/pytest tests/test_university_governance_admin.py -q`: 8 passed.
- `./.venv/bin/python -m py_compile ...`: passed for the changed Python modules and migration.
- `./.venv/bin/alembic -c alembic.ini heads`: reports `20260713_0021 (head)`.
- `git diff --check`: passed.

## Tooling Note

The service virtual environment does not provide Ruff, and no global `pytest` executable is installed. The project commit helper will run the repository’s required frontend lint and typecheck checks before creating the commit.

## Review Fixes

- Public governance member reads now require `is_public`, `workflow_status="published"`, and `appointment_status="published"`, preventing draft and otherwise unpublished appointments from appearing on public Council pages.
- Governance role and overview page-content seed records are now insert-only. Reruns create missing defaults but preserve administrator-managed values and page workflow state for existing records.
- Added focused regression coverage that compiles the public member query to assert both publication predicates, and runs the governance seeder against existing in-memory role/page objects to prove it does not mutate their values or workflow state.

## Review Fix Verification

- `cd services/main && ./.venv/bin/pytest tests/test_university_governance_admin.py tests/test_governance_hierarchy.py -q`: `14 passed in 3.40s`.
