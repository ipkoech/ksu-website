# Task 5 Report: Admin UI for Sections, Items, Media, and Workflow

Date: 2026-07-11

## Scope Delivered

- Added `frontend/apps/admin/src/lib/api/page-cms.ts`
- Added dashboard routes under `frontend/apps/admin/src/app/(dashboard)/page-cms/`
- Added sidebar navigation entry for `Page CMS`
- Implemented section list/detail UI, nested item editing, media-role attachment UI, section workflow actions, and spotlight management UI

## RED Evidence

Contract test added first:

`frontend/apps/admin/src/app/(dashboard)/page-cms/page-cms-admin-contract.test.mjs`

Command:

```bash
node 'frontend/apps/admin/src/app/(dashboard)/page-cms/page-cms-admin-contract.test.mjs'
```

Result:

```text
Error: Expected route file to exist: page.tsx
```

Exit code: `1`

## GREEN Evidence

Command:

```bash
node 'frontend/apps/admin/src/app/(dashboard)/page-cms/page-cms-admin-contract.test.mjs'
```

Result: no output, exit code `0`

## Verification Commands

### Contract test

```bash
node 'frontend/apps/admin/src/app/(dashboard)/page-cms/page-cms-admin-contract.test.mjs'
```

Result: pass

### Admin typecheck

```bash
cd frontend && pnpm --filter @ksu/admin typecheck
```

Result: pass

### Admin lint

```bash
cd frontend && pnpm --filter @ksu/admin lint
```

Result: pass with pre-existing warnings outside Task 5 files:

- `src/app/(protected)/main/main-dashboard-client.tsx`
- `src/app/(protected)/research/_components/research-detail-relationships.tsx`
- `src/app/(protected)/research/_components/research-resource-page.tsx`
- `src/app/(protected)/research/grants/[slug]/page.tsx`
- `src/app/(protected)/research/projects/[slug]/page.tsx`
- `src/components/analytics/chart-cards.tsx`

## Re-review Follow-up Fixes

- Updated the section detail workflow action gate so `archive` is available to users with `page_sections.delete` as well as broader page/homepage manage permissions.
- Hid the dashboard `Open Sections` and `Open Spotlights` links when the matching permissions are missing so users are not sent to known 403 routes.
- Filtered out truly empty unsaved starter items before creating section items, while preserving edited or attachment-backed drafts.
- Expanded the page CMS admin contract test to pin the archive permission gate, dashboard link gating, and blank-item filter logic.

## Re-review RED/GREEN Evidence

### Admin contract test

Command:

```bash
node 'frontend/apps/admin/src/app/(dashboard)/page-cms/page-cms-admin-contract.test.mjs'
```

RED result before implementation:

```text
Error: Expected section detail page to include: "page_sections.delete"
```

Exit code: `1`

GREEN result after implementation: pass, exit code `0`

### Admin typecheck

Command:

```bash
cd frontend && pnpm --filter @ksu/admin typecheck
```

Result: pass

### Admin lint

Command:

```bash
cd frontend && pnpm --filter @ksu/admin lint
```

Result: pass with pre-existing warnings outside Task 5 files:

- `src/app/(protected)/main/main-dashboard-client.tsx`
- `src/app/(protected)/research/_components/research-detail-relationships.tsx`
- `src/app/(protected)/research/_components/research-resource-page.tsx`
- `src/app/(protected)/research/grants/[slug]/page.tsx`
- `src/app/(protected)/research/projects/[slug]/page.tsx`
- `src/components/analytics/chart-cards.tsx`

## Files Changed

- `frontend/apps/admin/src/lib/api/page-cms.ts`
- `frontend/apps/admin/src/app/(dashboard)/page-cms/page.tsx`
- `frontend/apps/admin/src/app/(dashboard)/page-cms/sections/page.tsx`
- `frontend/apps/admin/src/app/(dashboard)/page-cms/sections/[id]/page.tsx`
- `frontend/apps/admin/src/app/(dashboard)/page-cms/spotlights/page.tsx`
- `frontend/apps/admin/src/app/(dashboard)/page-cms/page-cms-admin-contract.test.mjs`
- `frontend/apps/admin/src/components/layout/sidebar.tsx`

## Self-Review

- The new files typecheck and lint cleanly.
- The section detail editor covers section configuration, nested item editing, settings JSON, media attachments, and workflow actions.
- The UI keeps scope narrow to Task 5 surfaces and the existing sidebar.

## Findings / Concerns

1. The current backend contract does not expose a single-section read route, so the section detail page resolves existing records through the admin list endpoint.
2. The current backend contract does not expose a spotlight admin list/get route, so the spotlight page loads visible records from homepage composition and preserves newly created drafts only in the current session list after save.
3. The current backend contract does not expose dedicated delete routes for section items or spotlights; the UI uses disable/archival behavior supported by the existing endpoints instead.

## Follow-up Fixes After Review

- Added backend admin read endpoints for single page sections and admin spotlight list/detail reads.
- Added section-level `subtitle`, `description`, and `settings` fields across model, schema, migration, API payloads, and admin UI.
- Updated admin section detail to load a single record instead of scanning page 1 of the list endpoint.
- Updated spotlight admin pages to use admin spotlight data instead of public homepage composition.
- Aligned sidebar/dashboard permission checks with backend-authorized homepage scopes and prevented spotlight-only users from tripping the section overview fetch.
- Renamed misleading frontend helper aliases so archive/disable behavior matches the actual backend contract.

## Follow-up RED/GREEN Evidence

### Backend page CMS regressions

Command:

```bash
services/main/.venv/bin/python -m pytest services/main/tests/test_page_cms_api.py services/main/tests/test_page_cms_schemas.py services/main/tests/test_page_cms_models.py
```

RED result before implementation: 5 failures covering missing section/spotlight admin reads and missing section editor fields.

GREEN result after implementation: `52 passed`

### Additional backend verification

Command:

```bash
services/main/.venv/bin/python -m pytest services/main/tests/test_page_cms_workflow.py services/main/tests/test_roles_page_cms_permissions.py services/main/tests/test_homepage_composition.py
```

Result: `15 passed`

### Admin contract test

Command:

```bash
node 'frontend/apps/admin/src/app/(dashboard)/page-cms/page-cms-admin-contract.test.mjs'
```

RED result before implementation: failed on missing `pageSectionsApi.get(...)` usage and updated contract snippets.

GREEN result after implementation: pass, exit code `0`

### Admin typecheck

Command:

```bash
cd frontend && pnpm --filter @ksu/admin typecheck
```

Result: pass

### Admin lint

Command:

```bash
cd frontend && pnpm --filter @ksu/admin lint
```

Result: pass with pre-existing warnings outside Task 5 files:

- `src/app/(protected)/main/main-dashboard-client.tsx`
- `src/app/(protected)/research/_components/research-detail-relationships.tsx`
- `src/app/(protected)/research/_components/research-resource-page.tsx`
- `src/app/(protected)/research/grants/[slug]/page.tsx`
- `src/app/(protected)/research/projects/[slug]/page.tsx`
- `src/components/analytics/chart-cards.tsx`
