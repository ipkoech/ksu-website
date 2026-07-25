# About KSU and Numbers & Facts Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the normalized backend, public APIs, admin CRUD/workflow APIs, and verified launch seed data for About KSU, history milestones, and yearly/evergreen Numbers & Facts.

**Architecture:** Keep stable identity in `UniversityInfo`, add a normalized `about_content` model family for editorial and statistical content, and compose only currently publishable records through dedicated public services. Admin writes use explicit workflow commands and transactional validation; public routes never infer or expose draft state.

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy 2 async ORM, Pydantic v2, Alembic, PostgreSQL, pytest.

## Global Constraints

- Add `philosophy` and `strategic_plan_summary` as first-class nullable `UniversityInfo` text fields.
- Keep existing `strategic_priorities` readable during migration.
- Use existing `Media`, `Document`, workflow, audit, soft-delete, field-selection, cache, and RBAC conventions.
- History has one public content view; do not model unused tabs.
- Facts support shared evergreen groups plus edition-owned annual groups.
- Permit only one published current fact edition.
- Do not publish records without required source and verification metadata.
- Seed only verified existing institutional information.
- Preserve unrelated worktree changes and commit explicit paths with `scripts/commit-changes.sh`.

---

## File Structure

- Modify `services/main/app/models/university.py`: first-class institutional fields and relationships.
- Create `services/main/app/models/about_content.py`: About page, history, fact edition/group/item ORM models and constraints.
- Modify `services/main/app/models/__init__.py`: public model exports.
- Modify `services/main/app/schemas/university.py`: institutional API fields.
- Create `services/main/app/schemas/about_content.py`: create/update/read/composed public schemas and validators.
- Modify `services/main/app/schemas/__init__.py`: schema exports.
- Create `services/main/migrations/versions/20260714_0024_add_about_facts_content.py`: columns, normalized tables, indexes, constraints, and philosophy backfill.
- Create `services/main/app/services/about_content.py`: public composition, admin CRUD, ordering, clone, and workflow services.
- Modify `services/main/app/services/__init__.py`: service exports.
- Create `services/main/app/api/v1/about_content.py`: public and authorised admin endpoints.
- Modify `services/main/app/api/v1/__init__.py`: route registration.
- Create `services/main/app/seeders/seed_about_content.py`: idempotent verified launch records.
- Modify `services/main/app/seeders/seed_runner.py`: run the new seeder after UniversityInfo.
- Modify `services/main/app/seeders/seed_university_info.py`: populate first-class philosophy and strategic-plan summary.
- Create focused tests under `services/main/tests/test_about_content_*.py`.

### Task 1: Institutional Fields and Normalized Models

**Files:**
- Modify: `services/main/app/models/university.py`
- Create: `services/main/app/models/about_content.py`
- Modify: `services/main/app/models/__init__.py`
- Create: `services/main/migrations/versions/20260714_0024_add_about_facts_content.py`
- Test: `services/main/tests/test_about_content_models.py`
- Test: `services/main/tests/test_about_content_migration.py`

**Interfaces:**
- Produces: `AboutPageContent`, `HistoryMilestone`, `FactEdition`, `FactGroup`, `FactItem`.
- Produces constants: `ABOUT_WORKFLOW_STATUSES`, `FACT_KINDS`.
- Adds `UniversityInfo.philosophy: str | None` and `UniversityInfo.strategic_plan_summary: str | None`.

- [ ] **Step 1: Write failing model and migration contract tests**

Cover model tables, foreign keys, cascading relationships, check constraints,
partial current-edition uniqueness, evergreen/annual ownership columns, required
source fields, migration revision `20260714_0024`, and SQL backfill from
`strategic_priorities ->> 'philosophy'`.

- [ ] **Step 2: Run tests and verify RED**

```bash
cd services/main
PYTHONPATH=../common:. .venv/bin/pytest tests/test_about_content_models.py tests/test_about_content_migration.py -q
```

Expected: collection fails because `app.models.about_content` and migration
`20260714_0024` do not exist.

- [ ] **Step 3: Implement ORM models and migration**

Use `WorkflowMetadataMixin` on all publishable records, explicit `status`,
`published_at`, `is_enabled`/`is_public`, and actor relationships only where they
are needed for serialization. Add these database constraints:

```python
sa.CheckConstraint(
    "workflow_status IN ('draft', 'in_review', 'changes_requested', 'approved', 'published', 'archived')",
    name="ck_<table>_workflow_status",
)
sa.CheckConstraint(
    "fact_kind IN ('evergreen', 'annual')",
    name="ck_fact_items_kind",
)
sa.Index(
    "uq_fact_editions_one_published_current",
    "is_current",
    unique=True,
    postgresql_where=sa.text(
        "is_current IS TRUE AND workflow_status = 'published' AND deleted_at IS NULL"
    ),
)
```

Use `Document` foreign keys for the history and edition source documents and
`Media` foreign keys for all images. The migration must downgrade in reverse
dependency order.

- [ ] **Step 4: Run tests and verify GREEN**

Run the Task 1 command and expect all tests to pass.

- [ ] **Step 5: Commit Task 1**

```bash
scripts/commit-changes.sh -m "Add About and facts content models" --run-checks -- \
  services/main/app/models/university.py \
  services/main/app/models/about_content.py \
  services/main/app/models/__init__.py \
  services/main/migrations/versions/20260714_0024_add_about_facts_content.py \
  services/main/tests/test_about_content_models.py \
  services/main/tests/test_about_content_migration.py
```

### Task 2: Schemas and Validation

**Files:**
- Modify: `services/main/app/schemas/university.py`
- Create: `services/main/app/schemas/about_content.py`
- Modify: `services/main/app/schemas/__init__.py`
- Test: `services/main/tests/test_about_content_schemas.py`

**Interfaces:**
- Produces CRUD schemas for every new model.
- Produces `PublicAboutRead`, `PublicHistoryRead`, and `PublicFactsRead`.
- Produces `AboutWorkflowAction`, `FactEditionClone`, and reorder request schemas.

- [ ] **Step 1: Write failing schema tests**

Test URL rules, transcript requirement when video is published, transformation
image pairing, `year_label` support for `Today`, validity windows, annual versus
evergreen ownership, source/verification publication requirements, lifecycle
field rejection from normal create/update schemas, reporting-year bounds, and
UniversityInfo round-tripping of the two new fields.

- [ ] **Step 2: Run tests and verify RED**

```bash
cd services/main
PYTHONPATH=../common:. .venv/bin/pytest tests/test_about_content_schemas.py -q
```

Expected: import failure for missing About content schemas.

- [ ] **Step 3: Implement Pydantic schemas**

Use discriminated rules enforced with `model_validator`. Normal update schemas
must not accept workflow/audit fields. Public read schemas expose resolved media
and document projections as dictionaries without internal ownership metadata.

- [ ] **Step 4: Run tests and verify GREEN**

Run the Task 2 command and expect all tests to pass.

- [ ] **Step 5: Commit Task 2**

```bash
scripts/commit-changes.sh -m "Validate About and facts content" --run-checks -- \
  services/main/app/schemas/university.py \
  services/main/app/schemas/about_content.py \
  services/main/app/schemas/__init__.py \
  services/main/tests/test_about_content_schemas.py
```

### Task 3: Public Composition Services and Routes

**Files:**
- Create: `services/main/app/services/about_content.py`
- Modify: `services/main/app/services/__init__.py`
- Create: `services/main/app/api/v1/about_content.py`
- Modify: `services/main/app/api/v1/__init__.py`
- Test: `services/main/tests/test_about_content_public_service.py`
- Test: `services/main/tests/test_about_content_public_api.py`

**Interfaces:**
- Produces `AboutContentService.get_public_about(db, now=...)`.
- Produces `AboutContentService.get_public_history(db, now=...)`.
- Produces `FactsService.get_public_facts(db, year=None, now=...)`.
- Exposes `GET /api/v1/public/about`, `/public/about/history`, and `/public/about/facts`.

- [ ] **Step 1: Write failing service and route tests**

Test that public composition requires published parent and child state, filters
soft-deleted/disabled/out-of-window records, orders milestones and groups/items,
merges evergreen groups with the selected edition, returns available archived
years, returns 404 for missing/unpublished requested years, and never silently
falls back from a missing current edition.

- [ ] **Step 2: Run tests and verify RED**

```bash
cd services/main
PYTHONPATH=../common:. .venv/bin/pytest \
  tests/test_about_content_public_service.py \
  tests/test_about_content_public_api.py -q
```

Expected: import or route-registration failures.

- [ ] **Step 3: Implement public composition and cached routes**

Use SQLAlchemy `selectinload` for media/documents/children and one publishability
predicate shared by services. Return existing `success(data=...)` envelopes.
Cache public endpoints with year included in the vary key.

- [ ] **Step 4: Run tests and verify GREEN**

Run the Task 3 command and expect all tests to pass.

- [ ] **Step 5: Commit Task 3**

```bash
scripts/commit-changes.sh -m "Expose public About and facts APIs" --run-checks -- \
  services/main/app/services/about_content.py \
  services/main/app/services/__init__.py \
  services/main/app/api/v1/about_content.py \
  services/main/app/api/v1/__init__.py \
  services/main/tests/test_about_content_public_service.py \
  services/main/tests/test_about_content_public_api.py
```

### Task 4: Admin CRUD, Ordering, Clone, and Workflow

**Files:**
- Modify: `services/main/app/services/about_content.py`
- Modify: `services/main/app/api/v1/about_content.py`
- Test: `services/main/tests/test_about_content_admin_service.py`
- Test: `services/main/tests/test_about_content_admin_api.py`

**Interfaces:**
- Adds create/update/list/get/soft-delete for About content, milestones, editions,
  groups, and items.
- Adds complete-list reorder commands.
- Adds `clone_fact_edition(source_id, reporting_year, actor_id)`.
- Adds explicit submit, request-changes, approve, publish, unpublish, archive.

- [ ] **Step 1: Write failing admin service and route tests**

Test permissions, lifecycle-field stripping, published-record edit reset, source
validation, transformation/video validation, reorder membership checks,
evergreen/annual ownership, clone behavior, transactional current-edition
replacement, published deletion prohibition, and audit actor/timestamp changes.

- [ ] **Step 2: Run tests and verify RED**

```bash
cd services/main
PYTHONPATH=../common:. .venv/bin/pytest \
  tests/test_about_content_admin_service.py \
  tests/test_about_content_admin_api.py -q
```

Expected: missing admin methods/endpoints.

- [ ] **Step 3: Implement admin services and routes**

Use `about.manage` for CRUD, `content.review` for review decisions, and
`content.publish` for publish/unpublish. Publish methods call `await db.flush()`
only after all validation succeeds. Edition publication locks current published
edition rows before switching `is_current`.

- [ ] **Step 4: Run tests and verify GREEN**

Run the Task 4 command and expect all tests to pass.

- [ ] **Step 5: Commit Task 4**

```bash
scripts/commit-changes.sh -m "Manage About and facts publishing" --run-checks -- \
  services/main/app/services/about_content.py \
  services/main/app/api/v1/about_content.py \
  services/main/tests/test_about_content_admin_service.py \
  services/main/tests/test_about_content_admin_api.py
```

### Task 5: Verified Launch Seeds and Full Backend Verification

**Files:**
- Modify: `services/main/app/seeders/seed_university_info.py`
- Create: `services/main/app/seeders/seed_about_content.py`
- Modify: `services/main/app/seeders/seed_runner.py`
- Test: `services/main/tests/test_about_content_seeders.py`

**Interfaces:**
- Seeds one published About page, seven sourced milestones, evergreen profile
  facts, and one verified current annual edition.
- Populates `UniversityInfo.philosophy` and `strategic_plan_summary`.

- [ ] **Step 1: Write failing idempotency and source tests**

Require milestone labels `1965`, `1983`, `1994`, `1999`, `2007`, `2013`, and
`Today`; stable slugs; source titles; verification dates for facts; no invented
statistics; and two-run idempotency without deleting editor-created content.

- [ ] **Step 2: Run tests and verify RED**

```bash
cd services/main
PYTHONPATH=../common:. .venv/bin/pytest tests/test_about_content_seeders.py -q
```

Expected: missing seeder and UniversityInfo seed fields.

- [ ] **Step 3: Implement idempotent seed data**

Use handbook and existing `UniversityInfo.quick_facts` values. Mark seed-owned
records in a reserved metadata field or stable slug catalog and update only those
records on repeated runs. Do not seed unverifiable student, staff, programme,
research-centre, ranking, or finance totals.

- [ ] **Step 4: Run focused and full backend verification**

```bash
cd services/main
PYTHONPATH=../common:. .venv/bin/pytest tests/test_about_content_*.py -q
PYTHONPATH=../common:. .venv/bin/pytest -q
```

Expected: all focused and full Main service tests pass.

- [ ] **Step 5: Run migration and repository checks**

```bash
cd services/main
PYTHONPATH=../common:. .venv/bin/alembic heads
PYTHONPATH=../common:. .venv/bin/alembic upgrade head --sql >/dev/null
cd ../..
git diff --check
```

Expected: one head at `20260714_0024`, offline upgrade SQL succeeds, and diff
check is clean.

- [ ] **Step 6: Commit Task 5**

```bash
scripts/commit-changes.sh -m "Seed verified About and facts content" --run-full-checks -- \
  services/main/app/seeders/seed_university_info.py \
  services/main/app/seeders/seed_about_content.py \
  services/main/app/seeders/seed_runner.py \
  services/main/tests/test_about_content_seeders.py
```

## Completion Criteria

- Migration has a single valid head and reversible downgrade.
- Focused and full Main service test suites pass.
- Frontend lint, typecheck, and production build pass through the final commit
  helper invocation.
- Public APIs expose only publishable content and support current/yearly facts.
- Admin APIs support creation through publication with audit fields and scopes.
- Seeded history and facts are verified, source-labelled, and idempotent.
- Work is committed in explicit, reviewable commits without unrelated changes.
