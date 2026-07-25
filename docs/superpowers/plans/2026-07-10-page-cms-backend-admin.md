# Page CMS Backend and Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dynamic, simple, approval-controlled page section CMS that supports university, school, research, and library homepages, with reusable media attachments and a partnership spotlight layer over research partner records.

**Architecture:** `services/main` owns page-section orchestration, workflow, composition, and public rendering contracts. Existing domain services remain source of truth for partners, programmes, news, events, media, roles, and users; the new CMS references those records and returns render-ready section payloads. Admin pages manage records through existing CRUD/resource patterns, while frontend landing sections keep curated visual variants instead of arbitrary editor-designed layouts.

**Tech Stack:** FastAPI, SQLAlchemy 2, Alembic, Pydantic v2, PostgreSQL JSONB, pytest, Next.js, React Query, existing `@ksu/api-client`, existing media and RBAC systems.

## Global Constraints

- Preserve existing theme and typography.
- Keep the backend dynamic but simple: editors manage content, order, workflow, CTAs, and media; developers control approved visual variants.
- Reuse existing `Media` and `MediaLink` for section images/videos/logos where possible.
- Reuse research partner records for Heri Africa and future partnerships; do not duplicate partner ownership in `services/main`.
- Public APIs only return enabled, published, non-archived records inside publication windows.
- Approval workflow is required: `draft -> in_review -> changes_requested -> approved -> published -> archived`.
- Roles and permissions must remain dynamic through DB-backed roles/permissions and attach/revoke flows.
- Commit via `scripts/commit-changes.sh`, not direct `git commit`.

---

## Files and Responsibilities

- Create `services/main/app/models/page_cms.py`: `PageSection`, `SectionItem`, `PartnershipSpotlight`, and shared enums/constants.
- Modify `services/main/app/models/__init__.py`: export new models.
- Create `services/main/app/schemas/page_cms.py`: create/update/read/composition/workflow schemas.
- Modify `services/main/app/schemas/__init__.py`: export schemas.
- Create `services/main/app/services/page_cms.py`: CRUD, visibility, workflow, scope validation, media grouping, and homepage composition.
- Modify `services/main/app/services/__init__.py`: export services.
- Create `services/main/app/api/v1/page_cms.py`: public composition and admin CRUD/workflow routes.
- Modify `services/main/app/api/v1/__init__.py`: register routes.
- Modify `services/common/ksu_common/roles.py`: add default page CMS permissions to appropriate roles.
- Create `services/main/migrations/versions/20260710_0010_add_page_cms_models.py`: tables, constraints, indexes.
- Add tests in `services/main/tests/test_page_cms_models.py`, `test_page_cms_workflow.py`, `test_page_cms_api.py`, `test_homepage_composition.py`, and `test_roles_page_cms_permissions.py`.
- Modify generated contract/client only after backend tests pass: run existing contract generation if required by repository workflow.
- Admin UI follow-up files under `frontend/apps/admin/src/app/(dashboard)/page-cms/...` and `frontend/apps/admin/src/lib/api/page-cms.ts`.
- Public frontend follow-up files under `frontend/apps/web/src/lib/homepage-sections.ts` and landing section components.

---

### Task 1: Page CMS Models and Migration

**Files:**
- Create: `services/main/app/models/page_cms.py`
- Modify: `services/main/app/models/__init__.py`
- Create: `services/main/migrations/versions/20260710_0010_add_page_cms_models.py`
- Test: `services/main/tests/test_page_cms_models.py`

**Interfaces:**
- Produces: `PageSection`, `SectionItem`, `PartnershipSpotlight`
- Produces enum constants: `PAGE_SCOPE_TYPES`, `PAGE_SECTION_STATUSES`, `SECTION_ITEM_TYPES`, `PARTNERSHIP_CTA_SOURCES`

- [ ] **Step 1: Write failing model tests**

Create tests that assert:
- school-scoped sections require `scope_id`;
- one section can have many items;
- spotlight records reference `source_type="research_partner"` and `source_id`;
- media is attached through existing `MediaLink` using entity types `page_section`, `section_item`, and `partnership_spotlight`.

Run:
```bash
cd services/main && pytest tests/test_page_cms_models.py -v
```
Expected: FAIL because models do not exist.

- [ ] **Step 2: Add models**

Implement:
- `PageSection`: page/scope/section identity, layout variant, workflow fields, publication window, audit user fields.
- `SectionItem`: flexible item content, CTA fields, media/video metadata, order, enabled flag.
- `PartnershipSpotlight`: source reference, CTA source fields, headline, summary, pillars/opportunities JSON, workflow fields.

Required constraints:
- `scope_type in ("university", "school", "research", "library")`
- `status in ("draft", "in_review", "changes_requested", "approved", "published", "archived")`
- `valid_to >= valid_from`
- `source_type in ("research_partner")`
- unique `page_key + scope_type + scope_id + section_key`

- [ ] **Step 3: Add migration**

Create tables:
- `page_sections`
- `section_items`
- `partnership_spotlights`

Add indexes:
- `ix_page_sections_scope_page`
- `ix_page_sections_status_window`
- `ix_section_items_section_order`
- `ix_partnership_spotlights_source`

Run:
```bash
cd services/main && alembic upgrade head
```
Expected: migration applies cleanly in local/test database.

- [ ] **Step 4: Run model tests**

Run:
```bash
cd services/main && pytest tests/test_page_cms_models.py -v
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
scripts/commit-changes.sh -m "Add page CMS models" --run-checks -- services/main/app/models/page_cms.py services/main/app/models/__init__.py services/main/migrations/versions/20260710_0010_add_page_cms_models.py services/main/tests/test_page_cms_models.py
```

---

### Task 2: Schemas and Validation

**Files:**
- Create: `services/main/app/schemas/page_cms.py`
- Modify: `services/main/app/schemas/__init__.py`
- Test: `services/main/tests/test_page_cms_schemas.py`

**Interfaces:**
- Produces: `PageSectionCreate`, `PageSectionUpdate`, `PageSectionRead`
- Produces: `SectionItemCreate`, `SectionItemUpdate`, `SectionItemRead`
- Produces: `PartnershipSpotlightCreate`, `PartnershipSpotlightUpdate`, `PartnershipSpotlightRead`
- Produces: `PageSectionWorkflowAction`, `PageCompositionResponse`

- [ ] **Step 1: Write failing schema tests**

Assert:
- `scope_type="school"` without `scope_id` raises validation error.
- invalid `layout_variant` raises validation error.
- `valid_to < valid_from` raises validation error.
- external CTA URLs must start with `http://` or `https://`; internal links must start with `/`.
- `primary_cta_source` accepts `manual`, `partner_website`, `generated_detail_page`.

Run:
```bash
cd services/main && pytest tests/test_page_cms_schemas.py -v
```
Expected: FAIL because schemas do not exist.

- [ ] **Step 2: Implement schemas**

Keep allowed `layout_variant` values explicit:
- `hero_admissions`
- `pulse_strip`
- `featured_partnership`
- `programme_finder`
- `date_timeline`
- `pillar_grid`
- `media_mosaic`
- `leadership_activity`
- `research_cards`
- `news_grid`
- `events_list`
- `logo_carousel`
- `alumni_story`
- `facts_strip`

- [ ] **Step 3: Run schema tests**

Run:
```bash
cd services/main && pytest tests/test_page_cms_schemas.py -v
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
scripts/commit-changes.sh -m "Add page CMS schemas" --run-checks -- services/main/app/schemas/page_cms.py services/main/app/schemas/__init__.py services/main/tests/test_page_cms_schemas.py
```

---

### Task 3: Services, Workflow, and Media Grouping

**Files:**
- Create: `services/main/app/services/page_cms.py`
- Modify: `services/main/app/services/__init__.py`
- Test: `services/main/tests/test_page_cms_workflow.py`
- Test: `services/main/tests/test_homepage_composition.py`

**Interfaces:**
- Produces: `PageSectionService.list_admin(...)`
- Produces: `PageSectionService.list_public(...)`
- Produces: `PageSectionWorkflowService.transition(section, action, user_id, note=None)`
- Produces: `HomepageCompositionService.compose(page_key, scope_type, scope_id=None)`
- Produces: `group_media_links(entity_type, entity_id) -> dict[str, list[dict]]`

- [ ] **Step 1: Write failing service tests**

Assert:
- public listing excludes `draft`, `approved`, disabled, expired, and archived sections;
- workflow rejects `draft -> published`;
- workflow accepts `draft -> in_review -> approved -> published`;
- publishing requires an approved section;
- composition returns sections sorted by `display_order`;
- composition groups media roles as `heroImage`, `mobileImage`, `logos`, `gallery`, `video`, `background`, and `poster`.

Run:
```bash
cd services/main && pytest tests/test_page_cms_workflow.py tests/test_homepage_composition.py -v
```
Expected: FAIL because services do not exist.

- [ ] **Step 2: Implement services**

Implement simple, explicit workflow transition map:
```py
ALLOWED_TRANSITIONS = {
    "draft": {"submit": "in_review", "archive": "archived"},
    "changes_requested": {"submit": "in_review", "archive": "archived"},
    "in_review": {"approve": "approved", "request_changes": "changes_requested", "archive": "archived"},
    "approved": {"publish": "published", "archive": "archived"},
    "published": {"archive": "archived", "unpublish": "approved"},
    "archived": set(),
}
```

Implement CTA resolution for partnership spotlights:
- `manual`: use stored label/href.
- `partner_website`: resolve website from research partner proxy payload.
- `generated_detail_page`: use `/partnerships/{partner.slug}` when slug exists.

- [ ] **Step 3: Run service tests**

Run:
```bash
cd services/main && pytest tests/test_page_cms_workflow.py tests/test_homepage_composition.py -v
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
scripts/commit-changes.sh -m "Add page CMS services" --run-checks -- services/main/app/services/page_cms.py services/main/app/services/__init__.py services/main/tests/test_page_cms_workflow.py services/main/tests/test_homepage_composition.py
```

---

### Task 4: API Routes and Security

**Files:**
- Create: `services/main/app/api/v1/page_cms.py`
- Modify: `services/main/app/api/v1/__init__.py`
- Modify: `services/common/ksu_common/roles.py`
- Test: `services/main/tests/test_page_cms_api.py`
- Test: `services/main/tests/test_roles_page_cms_permissions.py`

**Interfaces:**
- Public: `GET /api/v1/pages/{page_key}`
- Public alias: `GET /api/v1/homepage`
- Admin: `GET /api/v1/page-sections/admin`
- Admin: `POST /api/v1/page-sections`
- Admin: `PATCH /api/v1/page-sections/{section_id}`
- Admin workflow: `POST /api/v1/page-sections/{section_id}/{action}`
- Items: `POST /api/v1/page-sections/{section_id}/items`
- Items: `PATCH /api/v1/section-items/{item_id}`
- Spotlights: `POST /api/v1/partnership-spotlights`
- Spotlights: `PATCH /api/v1/partnership-spotlights/{spotlight_id}`

- [ ] **Step 1: Write failing API/security tests**

Assert:
- unauthenticated admin requests return 401;
- authenticated user without scope returns 403;
- user with `page_sections.manage` can create draft sections;
- user with `page_sections.review` can approve;
- user with `page_sections.publish` can publish;
- public homepage returns only published sections;
- school-scoped edits require school-scope access where existing scoped RBAC supports it.

Run:
```bash
cd services/main && pytest tests/test_page_cms_api.py tests/test_roles_page_cms_permissions.py -v
```
Expected: FAIL because routes and permissions do not exist.

- [ ] **Step 2: Add permissions**

Add DB-seeded/default role permissions:
- `page_sections.view`
- `page_sections.create`
- `page_sections.update`
- `page_sections.delete`
- `page_sections.review`
- `page_sections.publish`
- `section_items.manage`
- `partnership_spotlights.manage`
- `homepage.view`
- `homepage.manage`
- `homepage.publish`
- `school_homepage.manage`
- `research_homepage.manage`
- `library_homepage.manage`
- `media.attach`
- `media.detach`

- [ ] **Step 3: Implement routes**

Use existing dependency patterns:
- `CurrentUser`
- `DbSession`
- `require_scope(...)`
- existing success response helper.

Protect public routes with no auth but only return public composition.
Protect admin routes with the least required scope.

- [ ] **Step 4: Run API/security tests**

Run:
```bash
cd services/main && pytest tests/test_page_cms_api.py tests/test_roles_page_cms_permissions.py -v
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
scripts/commit-changes.sh -m "Add page CMS API and permissions" --run-checks -- services/main/app/api/v1/page_cms.py services/main/app/api/v1/__init__.py services/common/ksu_common/roles.py services/main/tests/test_page_cms_api.py services/main/tests/test_roles_page_cms_permissions.py
```

---

### Task 5: Admin UI for Sections, Items, Media, and Workflow

**Files:**
- Create: `frontend/apps/admin/src/lib/api/page-cms.ts`
- Create: `frontend/apps/admin/src/app/(dashboard)/page-cms/page.tsx`
- Create: `frontend/apps/admin/src/app/(dashboard)/page-cms/sections/page.tsx`
- Create: `frontend/apps/admin/src/app/(dashboard)/page-cms/sections/[id]/page.tsx`
- Create: `frontend/apps/admin/src/app/(dashboard)/page-cms/spotlights/page.tsx`
- Modify: `frontend/apps/admin/src/components/layout/sidebar.tsx`
- Test: `frontend/apps/admin/src/app/(dashboard)/page-cms/page-cms-admin-contract.test.mjs`

**Interfaces:**
- Consumes backend routes from Task 4.
- Produces admin pages for section CRUD, item CRUD, media attachment by role, and workflow actions.

- [ ] **Step 1: Write failing admin contract test**

Assert static route files exist and export page components for:
- `/page-cms`
- `/page-cms/sections`
- `/page-cms/sections/[id]`
- `/page-cms/spotlights`

Assert API helper exports:
- `pageSectionsApi`
- `sectionItemsApi`
- `partnershipSpotlightsApi`

Run:
```bash
cd frontend && pnpm --filter @ksu/admin test -- page-cms-admin-contract.test.mjs
```
Expected: FAIL unless test runner script differs; if no app test script exists, run with `node` like existing contract tests.

- [ ] **Step 2: Implement admin API helper**

Expose list/create/update/delete/workflow methods, matching the backend contract exactly.

- [ ] **Step 3: Implement section list and detail forms**

Use existing admin form/table components.
Fields must include:
- page/scope identifiers;
- section key/layout variant;
- title/subtitle/description;
- enabled flag;
- order;
- valid window;
- status;
- settings JSON editor;
- workflow action buttons gated by permissions.

- [ ] **Step 4: Implement media attachment UI**

Use existing media picker/attachment manager.
Supported roles:
- `hero_image`
- `mobile_image`
- `logo`
- `signing_photo`
- `gallery`
- `video`
- `background`
- `poster`

- [ ] **Step 5: Run frontend checks**

Run:
```bash
cd frontend && pnpm --filter @ksu/admin typecheck
cd frontend && pnpm --filter @ksu/admin lint
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
scripts/commit-changes.sh -m "Add page CMS admin UI" --run-checks -- frontend/apps/admin/src/lib/api/page-cms.ts frontend/apps/admin/src/app/'(dashboard)'/page-cms frontend/apps/admin/src/components/layout/sidebar.tsx
```

---

### Task 6: Public Homepage Composition Client and Renderers

**Files:**
- Create: `frontend/apps/web/src/lib/homepage-sections.ts`
- Modify: `frontend/apps/web/src/app/page.tsx`
- Create: `frontend/apps/web/src/components/home/section-renderer.tsx`
- Create: section components as needed under `frontend/apps/web/src/components/home/sections/`
- Test: `frontend/apps/web/src/app/homepage-page-cms-contract.test.mjs`

**Interfaces:**
- Consumes: `GET /api/v1/homepage`
- Produces renderers for approved `layout_variant` values.

- [ ] **Step 1: Write failing frontend contract test**

Assert:
- homepage fetcher calls `/api/v1/homepage`;
- renderer supports all layout variants listed in Task 2;
- unknown layout variants render nothing and log a server-side warning;
- media payload supports images/videos/logos by role.

Run:
```bash
cd frontend/apps/web && node src/app/homepage-page-cms-contract.test.mjs
```
Expected: FAIL.

- [ ] **Step 2: Implement homepage fetcher**

Fetcher behavior:
- prefer composed API data;
- fall back to current homepage data only when the composed endpoint fails;
- preserve existing typography/theme;
- never render unpublished section records.

- [ ] **Step 3: Implement section renderer**

Keep dynamicity simple:
- section order comes from API;
- content comes from API;
- visual structure comes from fixed renderer variants.

- [ ] **Step 4: Run frontend checks**

Run:
```bash
cd frontend && pnpm --filter @ksu/web typecheck
cd frontend && pnpm --filter @ksu/web lint
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
scripts/commit-changes.sh -m "Render composed homepage sections" --run-checks -- frontend/apps/web/src/lib/homepage-sections.ts frontend/apps/web/src/app/page.tsx frontend/apps/web/src/components/home
```

---

### Task 7: Seed Data and Heri Africa Spotlight

**Files:**
- Create: `services/main/app/seeders/seed_page_cms.py`
- Modify: `services/main/app/seeders/seed_runner.py`
- Test: `services/main/tests/test_page_cms_seeders.py`

**Interfaces:**
- Produces initial university homepage sections.
- Produces initial `featured_partnership` spotlight referencing a research partner when available.

- [ ] **Step 1: Write failing seeder tests**

Assert seed creates:
- homepage hero/admissions section;
- pulse section;
- featured partnership section;
- programme finder section;
- facts section;
- Heri Africa spotlight if a matching research partner can be resolved or a clear inactive draft if not.

Run:
```bash
cd services/main && pytest tests/test_page_cms_seeders.py -v
```
Expected: FAIL.

- [ ] **Step 2: Implement seeder**

Seeder must be idempotent:
- use stable `page_key`, `scope_type`, `section_key`;
- update existing seed-owned draft records without duplicating;
- never overwrite manually edited published records.

- [ ] **Step 3: Run seeder tests**

Run:
```bash
cd services/main && pytest tests/test_page_cms_seeders.py -v
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
scripts/commit-changes.sh -m "Seed page CMS homepage sections" --run-checks -- services/main/app/seeders/seed_page_cms.py services/main/app/seeders/seed_runner.py services/main/tests/test_page_cms_seeders.py
```

---

### Task 8: End-to-End Rendering Verification

**Files:**
- Create: `frontend/apps/web/page-cms-visual-audit.spec.ts`
- Optional output: screenshots under ignored audit output directory.

**Interfaces:**
- Consumes public homepage renderers and seeded backend data.
- Produces viewport and console verification.

- [ ] **Step 1: Add Playwright visual audit**

Use existing `@playwright/test` in `frontend/apps/web`.
Test viewports:
- 1440 x 1100
- 1280 x 900
- 768 x 1024
- 390 x 844
- 360 x 740

Assertions:
- no horizontal overflow;
- no console errors;
- no `_next/image` 400 responses;
- Heri/featured partnership section renders when published;
- partner logos or spotlight media render;
- mobile layout keeps major sections independent;
- section CTAs have accessible names.

- [ ] **Step 2: Run local backend/frontend stack**

Use the project’s existing local dev flow. If a port is occupied, use the next available port and document it in the test output.

- [ ] **Step 3: Run visual audit**

Run:
```bash
cd frontend/apps/web && npx playwright test page-cms-visual-audit.spec.ts
```
Expected: PASS.

- [ ] **Step 4: Run full relevant checks**

Run:
```bash
cd services/main && pytest tests/test_page_cms_models.py tests/test_page_cms_schemas.py tests/test_page_cms_workflow.py tests/test_page_cms_api.py tests/test_homepage_composition.py tests/test_page_cms_seeders.py -v
cd frontend && pnpm --filter @ksu/admin typecheck
cd frontend && pnpm --filter @ksu/web typecheck
cd frontend && pnpm --filter @ksu/admin lint
cd frontend && pnpm --filter @ksu/web lint
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
scripts/commit-changes.sh -m "Verify page CMS homepage rendering" --run-full-checks -- frontend/apps/web/page-cms-visual-audit.spec.ts
```

---

## Acceptance Criteria

- Communications/admin users can create, update, submit, approve, publish, archive, and reorder page sections.
- Page sections can target university, school, research, and library page scopes.
- Heri Africa is represented as a partnership spotlight layer over a research partner record.
- Sections and section items can attach images, videos, logos, gallery media, backgrounds, and posters through media roles.
- Public homepage composition returns render-ready sections and media grouped by role.
- Public API never exposes drafts, disabled records, expired records, archived records, or unapproved records.
- Roles and permissions can be seeded, attached, and revoked through the existing dynamic RBAC system.
- Frontend renderers stay simple: API controls content and ordering; approved components control the polished visual layout.
- Automated backend, admin, web, and visual rendering checks pass.

## Self-Review Notes

- Scope is intentionally split into backend foundation, admin UI, frontend renderers, seed data, and visual verification.
- Admissions closed/open computed state is not included as a core table in this first plan because it is a separate business workflow; it should be implemented after the page CMS base can render sections dynamically.
- No arbitrary drag-and-drop page builder is planned; `layout_variant` keeps visual quality consistent with the approved mockups.
