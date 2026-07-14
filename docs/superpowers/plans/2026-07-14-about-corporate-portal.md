# About KSU Corporate Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-ready Corporate Communication workspaces for editing About KSU content, history milestones, and hybrid yearly/evergreen Numbers & Facts.

**Architecture:** Add a typed admin API adapter for the existing About endpoints, then build two focused client workspaces inside the existing Corporate Communication shell. The About workspace owns the singleton narrative and its milestone collection; the Numbers & Facts workspace owns editions and nested evergreen/annual groups and items. Both use the existing permission, React Query, dialog, form-control, status, and workflow conventions.

**Tech Stack:** Next.js App Router, React 19, TypeScript, TanStack Query, Axios, shadcn/Radix components, Tailwind CSS, Lucide icons.

## Global Constraints

- Use the approved `about.manage`, `content.review`, and `content.publish` scopes.
- Keep About content and History in one workspace with clear tabs.
- Keep evergreen facts visibly separate from annual edition facts.
- Support create, update, workflow actions, enabled/public state, and ordered numeric positions.
- Do not add tests or run test suites, per the user request; verify with lint, typecheck, build, and live API/database checks.
- Preserve unrelated worktree changes and commit only explicit paths with `scripts/commit-changes.sh`.

---

### Task 1: Typed About Admin API

**Files:**
- Create: `frontend/apps/admin/src/lib/api/about-content.ts`

**Interfaces:**
- Produces typed records and payloads for About content, milestones, editions, groups, and items.
- Produces `aboutContentApi`, `historyMilestonesApi`, `factEditionsApi`, `factGroupsApi`, and `factItemsApi`.

- [ ] Define the shared workflow status/action types and exact backend field projections.
- [ ] Implement list, create, patch, delete, clone, nested-list, and workflow calls against the existing `/api/v1` routes.
- [ ] Keep response handling compatible with the existing `{ data }` success envelope.

### Task 2: Portal Navigation and Routes

**Files:**
- Modify: `frontend/apps/admin/src/lib/portals/registry.ts`
- Create: `frontend/apps/admin/src/app/(protected)/corporate-communication/page-cms/about/page.tsx`
- Create: `frontend/apps/admin/src/app/(protected)/corporate-communication/page-cms/numbers-facts/page.tsx`

**Interfaces:**
- Adds “About KSU” and “Numbers & Facts” beneath Corporate Communication → Website Content.
- Both routes render inside the existing `PortalShell` layout and require `about.manage` or administrator access.

- [ ] Add the two navigation destinations with distinct icons and the `about.manage` scope.
- [ ] Add thin App Router pages that render the focused workspaces.

### Task 3: About KSU Workspace

**Files:**
- Create: `frontend/apps/admin/src/components/about-content/about-ksu-workspace.tsx`
- Create: `frontend/apps/admin/src/components/about-content/about-workflow-actions.tsx`

**Interfaces:**
- Consumes `aboutContentApi` and `historyMilestonesApi`.
- Provides Page Content and History tabs, edit dialogs, state badges, workflow controls, and source-aware milestone management.

- [ ] Load the singleton About record and its milestone list in parallel where possible.
- [ ] Render an editorial overview with publication status and public-preview link.
- [ ] Implement narrative fields, video/transcript fields, media/document UUID fields, paired transformation IDs, and enabled state.
- [ ] Implement milestone create/edit/delete with chronology, source, image accessibility, visibility, and display order fields.
- [ ] Implement submit, approve, request changes, publish, unpublish, and archive actions according to current state and permission.
- [ ] Invalidate only About-related React Query keys after successful mutations.

### Task 4: Numbers & Facts Workspace

**Files:**
- Create: `frontend/apps/admin/src/components/about-content/numbers-facts-workspace.tsx`

**Interfaces:**
- Consumes `factEditionsApi`, `factGroupsApi`, and `factItemsApi`.
- Provides edition selection/cloning, evergreen and annual group sections, and nested fact item editing.

- [ ] Render edition cards with reporting year, workflow state, verification date, enabled/current badges, and clone action.
- [ ] Add edition create/edit forms and workflow actions.
- [ ] Load evergreen groups and selected-edition groups concurrently.
- [ ] Add group create/edit/delete for evergreen and edition-owned scopes.
- [ ] Add item create/edit/delete with display value, optional numeric/unit metadata, source, verification, link, featured/enabled state, and display order.
- [ ] Label evergreen versus annual ownership explicitly and prevent cross-scope creation in the UI.

### Task 5: Verification and Commit

**Files:**
- Verify all Task 1–4 files only.

- [ ] Run `pnpm --filter @ksu/admin lint` and confirm zero errors.
- [ ] Run `pnpm --filter @ksu/admin typecheck` and confirm success.
- [ ] Run `pnpm --filter @ksu/admin build` and confirm production compilation.
- [ ] Query Alembic current revision and About/facts row counts from PostgreSQL.
- [ ] Commit explicit portal files through `scripts/commit-changes.sh --run-full-checks` without staging unrelated edits.

## Completion Criteria

- Corporate Communication navigation exposes both approved workspaces.
- Editors can manage the About singleton and history milestones from one route.
- Editors can manage yearly editions, evergreen/annual groups, and fact items from one route.
- Workflow actions are state-aware and permission-aware.
- Migration `20260714_0024` and seeded launch records are present in PostgreSQL.
- Admin lint, typecheck, and production build complete without errors.
