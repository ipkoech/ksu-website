# Funding Backend Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align funding and grants backend APIs with the admin UI requirement for complete edit persistence and readable relationship-driven data.

**Architecture:** Keep the current generic CRUD router, but expand funding update schemas so edit sheets can persist full model fields. Add focused relationship services and routes only where the existing data model already supports relationships: grant projects, grant themes, funder projects, and application reports/reviews. Do not add a `grant.funder_id` migration in this pass because grants currently store `funder_name` only.

**Tech Stack:** FastAPI, Pydantic v2, SQLAlchemy async ORM, pytest.

## Global Constraints

- Do not expose raw UUIDs as primary UI data; backend relationship endpoints should return concise `{id, title/name, status/code}` records for chips/selectors.
- Do not add a direct grant-to-endowment endpoint because `EndowmentFund` has no `grant_id`.
- Do not add a `grant.funder_id` column in this pass.
- Keep routes under existing `/api/v1` research route modules.

---

### Task 1: Expand Funding Update Schemas

**Files:**
- Modify: `services/research/app/schemas/funding.py`
- Test: `services/research/tests/test_funding_backend_alignment.py`

**Interfaces:**
- Produces: `GrantUpdate`, `GrantGuidelineUpdate`, `GrantApplicationUpdate`, `GrantReviewUpdate`, `GrantReportUpdate`, `FundingUpdate`, and `EndowmentFundUpdate` accepting all editable fields already present in the matching create/base schemas.

- [ ] Write schema tests proving representative full-edit fields are accepted.
- [ ] Add optional fields to each update schema.
- [ ] Run the funding backend alignment tests.

### Task 2: Add Funding Relationship Services

**Files:**
- Modify: `services/research/app/services/funding.py`
- Test: `services/research/tests/test_funding_backend_alignment.py`

**Interfaces:**
- Produces: `GrantRelationshipService.list_projects(db, grant_id)`, `list_themes(db, grant_id)`, `add_theme(db, grant_id, theme_id)`, `remove_theme(db, grant_id, theme_id)`, `FundingRelationshipService.list_projects(db, funder_id)`, `ApplicationRelationshipService.list_reviews(db, application_id)`, and `list_reports(db, application_id)`.

- [ ] Write tests for relationship service query behavior where practical.
- [ ] Implement read methods returning compact dictionaries.
- [ ] Implement grant-theme bind/unbind using the existing `grant_themes` join table.

### Task 3: Add Funding Relationship Routes

**Files:**
- Modify: `services/research/app/routes/v1/grants.py`
- Test: `services/research/tests/test_api_security.py`

**Interfaces:**
- Produces:
  - `GET /grants/id/{grant_id}/projects`
  - `GET /grants/id/{grant_id}/themes`
  - `PUT /grants/id/{grant_id}/themes/{theme_id}`
  - `DELETE /grants/id/{grant_id}/themes/{theme_id}`
  - `GET /funders/id/{funder_id}/projects`
  - `GET /grant-applications/id/{application_id}/reviews`
  - `GET /grant-applications/id/{application_id}/reports`

- [ ] Add routes using existing auth scopes.
- [ ] Ensure security contract still sees mutating routes protected.
- [ ] Run backend tests for funding/security.

