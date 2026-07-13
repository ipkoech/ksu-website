# Homepage Hero Admissions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a backend-resolved homepage hero that shows applications, admission-letter access, or no admissions panel, with admin-managed intake actions and milestones.

**Architecture:** Page CMS remains responsible for hero presentation while the admissions domain owns operational timestamps, actions, milestones, workflow, and state resolution. `HomepageAdmissionStateService` resolves one authoritative public state and `HomepageCompositionService` merges it into `GET /api/v1/homepage`; the admin and public frontends consume typed APIs rather than duplicating state logic.

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy 2, Alembic, PostgreSQL, Pydantic 2, pytest, Next.js 16, React 19, TypeScript, TanStack Query, Zod, Tailwind CSS, Playwright.

## Global Constraints

- The admissions panel has exactly three resolved states: `applications_open`, `admission_letters_available`, and `hidden`.
- Never show `Applications closed`, a zero countdown, an empty admissions column, or an Apply Now action without a qualified published application action.
- `applications_open` takes precedence over `admission_letters_available` when both qualify.
- Admission-letter availability is controlled by an authorised administrator for a specific intake and normally points to an authenticated portal, not a shared public PDF.
- Operational timestamps are timezone-aware; default timezone is exactly `Africa/Nairobi`.
- Page CMS owns institutional hero copy and media; admissions owns operational dates and actions.
- The public frontend must not independently decide whether an intake is open.
- Preserve the existing Kisii University theme and approved cinematic hero direction.
- Hero facts render only when approved and source-backed; unknown, zero, stale, or unapproved values are omitted.
- Existing public `sections` and `partnership_spotlights` response fields remain backward compatible.
- Use `scripts/commit-changes.sh`; never call `git commit` directly.

---

## File Structure

### Backend

- `services/main/app/models/admissions.py`: intake lifecycle fields, `IntakePublicAction`, and `IntakeMilestone` persistence.
- `services/main/app/schemas/admissions.py`: validated intake/action/milestone create, update, read, workflow, preview, and public read models.
- `services/main/app/services/admissions.py`: action and milestone CRUD plus public loading.
- `services/main/app/services/homepage_admissions.py`: isolated state resolver and public hero admissions serialization.
- `services/main/app/services/page_cms.py`: composition of Page CMS hero with resolved admissions state.
- `services/main/app/api/v1/intakes.py`: resource-oriented action, milestone, workflow, and preview endpoints.
- `services/main/app/security/scopes.py`, `services/common/ksu_common/roles.py`, and `services/main/app/seeders/seed_rbac.py`: admissions permissions.
- `services/main/migrations/versions/20260713_0022_add_homepage_admissions_actions.py`: schema migration and safe legacy timestamp backfill; recheck immediately before implementation that `20260713_0021` remains the single Alembic head.
- `services/main/tests/test_homepage_admissions_models.py`: persistence and migration contracts.
- `services/main/tests/test_homepage_admissions_schemas.py`: validation contracts.
- `services/main/tests/test_homepage_admissions_resolver.py`: state boundary and precedence tests.
- `services/main/tests/test_homepage_admissions_api.py`: permissions, workflow, CRUD, preview, and public filtering.
- `services/main/tests/test_homepage_composition.py`: resolved hero response integration.

### Shared Frontend Client

- `frontend/packages/api-client/src/main/types.ts`: intake lifecycle, actions, milestones, and resolved hero types.
- `frontend/packages/api-client/src/main/api.ts`: admin and public admissions operations.
- `frontend/packages/api-client/src/hooks/use-intakes.ts`: queries and mutations with invalidation.
- `frontend/packages/api-client/src/hooks/query-keys.ts`: stable action and milestone keys.

### Admin Frontend

- `frontend/apps/admin/src/app/(dashboard)/admissions/intakes/[id]/client-page.tsx`: lifecycle, homepage eligibility, actions, milestones, workflow, and preview UI.
- `frontend/apps/admin/src/app/(dashboard)/admissions/intakes/page.tsx`: resolved eligibility/status visibility.
- `frontend/apps/admin/src/app/admissions-homepage-contract.test.mjs`: static admin integration contract.

### Public Frontend

- `frontend/apps/web/src/lib/homepage-sections.ts`: resolved hero response parsing and normalization.
- `frontend/apps/web/src/components/home/admissions-countdown.tsx`: accessible client countdown.
- `frontend/apps/web/src/components/home/sections/composed-section-variants.tsx`: responsive cinematic hero and conditional admissions panel.
- `frontend/apps/web/src/components/home/section-renderer.tsx`: pass the resolved hero only to the hero layout variant.
- `frontend/apps/web/src/app/page.tsx`: pass one resolved action to both hero and header.
- `frontend/apps/web/src/components/home/landing-hero.tsx`: safe institutional fallback without invented admissions actions.
- `frontend/apps/web/src/lib/landing-data.ts`: remove default Apply URLs from fallback slider normalization.
- `frontend/packages/ui/src/components/layout/public/public-header.tsx`: contextual admissions CTA prop and rendering.
- `frontend/apps/web/src/app/homepage-hero-admissions-contract.test.mjs`: state and contract assertions.
- `frontend/apps/web/page-cms-visual-audit.spec.ts`: responsive and accessibility coverage.

---

### Task 1: Admissions Persistence and Validation

**Files:**
- Modify: `services/main/app/models/admissions.py`
- Modify: `services/main/app/models/__init__.py`
- Modify: `services/main/app/schemas/admissions.py`
- Modify: `services/main/app/schemas/__init__.py`
- Create: `services/main/migrations/versions/20260713_0022_add_homepage_admissions_actions.py`
- Create: `services/main/tests/test_homepage_admissions_models.py`
- Create: `services/main/tests/test_homepage_admissions_schemas.py`

**Interfaces:**
- Produces: `IntakePublicAction`, `IntakeMilestone`, `IntakePublicActionCreate`, `IntakePublicActionUpdate`, `IntakePublicActionRead`, `IntakeMilestoneCreate`, `IntakeMilestoneUpdate`, `IntakeMilestoneRead`.
- Produces intake fields: `application_opens_at`, `application_closes_at`, `late_application_closes_at`, `application_override`, `override_expires_at`, `late_applications_enabled`, `is_featured_on_homepage`, `homepage_priority`, `timezone`.

- [ ] **Step 1: Write failing persistence tests**

Add tests that compile constraints and inspect the migration:

```python
def test_intake_public_action_types_are_constrained():
    sql = str(IntakePublicAction.__table__.constraints)
    assert "download_admission_letter" in sql
    assert "apply" in sql

def test_intake_has_timezone_aware_homepage_fields():
    assert Intake.__table__.c.application_opens_at.type.timezone is True
    assert Intake.__table__.c.application_closes_at.type.timezone is True
    assert Intake.__table__.c.timezone.server_default.arg == "Africa/Nairobi"
```

- [ ] **Step 2: Write failing schema validation tests**

```python
def test_public_action_rejects_unsafe_external_url():
    with pytest.raises(ValidationError):
        IntakePublicActionCreate(
            action_type="apply",
            label="Apply Now",
            target_url="javascript:alert(1)",
        )

def test_intake_rejects_unbounded_manual_override():
    with pytest.raises(ValidationError):
        IntakeUpdate(application_override="force_open", override_expires_at=None)
```

- [ ] **Step 3: Run focused tests and confirm failure**

Run:

```bash
docker compose exec -T main pytest tests/test_homepage_admissions_models.py tests/test_homepage_admissions_schemas.py -q
```

Expected: collection or assertion failures because the new models and schemas do not exist.

- [ ] **Step 4: Implement models and relationships**

Add controlled constants and focused SQLAlchemy models:

```python
INTAKE_APPLICATION_OVERRIDES = ("automatic", "force_open", "force_hidden")
INTAKE_PUBLIC_ACTION_TYPES = (
    "apply", "check_requirements", "explore_programmes",
    "download_admission_letter", "reporting_instructions",
    "student_portal", "contact_admissions",
)
INTAKE_MILESTONE_TYPES = (
    "applications_open", "applications_close", "admission_letters_release",
    "reporting", "orientation", "registration", "semester_opening",
)
```

Use timezone-aware `DateTime`, workflow/audit fields consistent with `PageSection`, soft deletion from the base model, cascading intake relationships, indexes for public-window resolution, and a PostgreSQL partial unique index on `(intake_id, action_type)` for records that are neither deleted nor archived. This permits historical archived rows without permitting two current actions of the same type.

- [ ] **Step 5: Implement schemas and exact validation**

Use shared helpers that accept only `/...` or `https://...`, require `ends_at >= starts_at`, require override expiry for `force_open` and `force_hidden`, and validate all controlled values.

- [ ] **Step 6: Implement and inspect the migration**

Run `alembic heads` immediately before creating the migration and require `20260713_0021` to be the single current head. Create revision `20260713_0022` with `down_revision = "20260713_0021"`. Add both new tables, indexes, foreign keys, constraints, and intake fields. Backfill legacy dates at Nairobi midnight for opening and `23:59:59` for closing; retain legacy columns. If the head has changed, stop and renumber this migration before writing it rather than creating a second head.

Run:

```bash
docker compose exec -T main alembic upgrade head
docker compose exec -T main alembic downgrade -1
docker compose exec -T main alembic upgrade head
```

Expected: all three commands exit 0 without data-loss errors.

- [ ] **Step 7: Run focused tests**

Run the Task 1 pytest command again. Expected: PASS.

- [ ] **Step 8: Commit through the project helper**

```bash
scripts/commit-changes.sh -m "Add homepage admissions persistence" --run-checks -- services/main/app/models/admissions.py services/main/app/models/__init__.py services/main/app/schemas/admissions.py services/main/app/schemas/__init__.py services/main/migrations/versions services/main/tests/test_homepage_admissions_models.py services/main/tests/test_homepage_admissions_schemas.py
```

### Task 2: Admissions State Resolver and Workflow Services

**Files:**
- Modify: `services/main/app/services/admissions.py`
- Modify: `services/main/app/services/__init__.py`
- Create: `services/main/app/services/homepage_admissions.py`
- Create: `services/main/tests/test_homepage_admissions_resolver.py`

**Interfaces:**
- Consumes: Task 1 models and schemas.
- Produces: `HomepageAdmissionStateService.resolve(db, *, at=None) -> dict[str, Any]`.
- Produces: `IntakePublicActionService`, `IntakeMilestoneService`, `IntakeAdmissionsWorkflowService`.

- [ ] **Step 1: Write resolver boundary tests**

Cover before/open/exact-close/after windows, enabled late applications, expired override, missing Apply action, admissions-letter state, hidden state, precedence, and deterministic priority. Use aware Nairobi datetimes:

```python
NAIROBI = ZoneInfo("Africa/Nairobi")

async def test_open_applications_precede_admission_letters():
    result = await HomepageAdmissionStateService.resolve_records(
        [open_intake_with_apply(), older_intake_with_letters()],
        at=datetime(2026, 7, 13, 10, 0, tzinfo=NAIROBI),
    )
    assert result["state"] == "applications_open"
    assert result["primary_action"]["type"] == "apply"
```

- [ ] **Step 2: Run resolver tests and confirm failure**

```bash
docker compose exec -T main pytest tests/test_homepage_admissions_resolver.py -q
```

Expected: FAIL because the resolver is absent.

- [ ] **Step 3: Implement pure resolution and database loading**

Keep `resolve_records(records, at)` pure. `resolve(db, at)` batch-loads active featured intakes, actions, and milestones with `selectinload`; it must not issue per-intake queries. Return the explicit hidden contract when no state qualifies.

- [ ] **Step 4: Implement action, milestone, and workflow services**

CRUD services filter soft-deleted records. Public queries apply enabled, published, scheduled, expiry, and action-window filters. Workflow transitions mirror the Page CMS transition map and record `ContentWorkflowLog` entries using content types `intake-public-actions` and `intake-milestones`.

- [ ] **Step 5: Run resolver tests**

Run the Task 2 pytest command. Expected: PASS.

- [ ] **Step 6: Commit**

```bash
scripts/commit-changes.sh -m "Resolve homepage admissions state" --run-checks -- services/main/app/services/admissions.py services/main/app/services/homepage_admissions.py services/main/app/services/__init__.py services/main/tests/test_homepage_admissions_resolver.py
```

### Task 3: Admissions APIs, Permissions, and Homepage Composition

**Files:**
- Modify: `services/main/app/api/v1/intakes.py`
- Modify: `services/main/app/services/page_cms.py`
- Modify: `services/common/ksu_common/roles.py`
- Modify: `services/main/app/seeders/seed_rbac.py`
- Modify: `services/main/tests/test_roles_page_cms_permissions.py`
- Create: `services/main/tests/test_homepage_admissions_api.py`
- Modify: `services/main/tests/test_homepage_composition.py`

**Interfaces:**
- Consumes: Task 2 services.
- Produces resource endpoints from the design specification.
- Produces `GET /api/v1/homepage.data.hero` while retaining `sections` and `partnership_spotlights`.

- [ ] **Step 1: Write failing permission and CRUD tests**

Test `403` without scope, create/list/update/delete success with scope, invalid workflow `409`, public draft exclusion, and preview `at` handling. Assert the scopes:

```python
PUBLIC_ACTION_SCOPES = {
    "admissions.view_intakes",
    "admissions.manage_public_actions",
    "admissions.review_public_actions",
    "admissions.publish_public_actions",
}
```

- [ ] **Step 2: Write failing homepage composition tests**

Patch the resolver and assert:

```python
assert composition["hero"]["admissions"]["state"] == "hidden"
assert "sections" in composition
assert "partnership_spotlights" in composition
assert composition["resolved_at"].utcoffset() is not None
```

- [ ] **Step 3: Run focused tests and confirm failure**

```bash
docker compose exec -T main pytest tests/test_homepage_admissions_api.py tests/test_homepage_composition.py tests/test_roles_page_cms_permissions.py -q
```

Expected: FAIL on absent routes, scopes, and hero contract.

- [ ] **Step 4: Implement permissions and resource APIs**

Add exact routes under `/api/v1`, reuse `success(...)`, project-standard permission checks, Pydantic payloads, `404`, `403`, `409`, and `422` semantics. Correct the existing invalid `academic.manage_intakes` checks to canonical `admissions.view_intakes` and `admissions.manage_intakes`. Preview accepts an ISO-8601 aware timestamp and returns the resolver result plus internal reason code only to authorised users.

- [ ] **Step 5: Compose the resolved hero**

Find the first published `hero_admissions` section, serialize CMS content/media into `hero.content` and `hero.media`, call the resolver once, include `resolved_at`, and return an explicit safe hero with hidden admissions when no hero section exists. Remove operational meaning from seeded `Admissions open` copy.

- [ ] **Step 6: Run focused tests**

Run the Task 3 pytest command. Expected: PASS.

- [ ] **Step 7: Commit**

```bash
scripts/commit-changes.sh -m "Expose resolved homepage admissions APIs" --run-checks -- services/main/app/api/v1/intakes.py services/main/app/services/page_cms.py services/common/ksu_common/roles.py services/main/app/seeders/seed_rbac.py services/main/tests/test_roles_page_cms_permissions.py services/main/tests/test_homepage_admissions_api.py services/main/tests/test_homepage_composition.py
```

### Task 4: Shared TypeScript Admissions Client

**Files:**
- Modify: `frontend/packages/api-client/src/main/types.ts`
- Modify: `frontend/packages/api-client/src/main/api.ts`
- Modify: `frontend/packages/api-client/src/hooks/use-intakes.ts`
- Modify: `frontend/packages/api-client/src/hooks/query-keys.ts`
- Create: `frontend/packages/api-client/src/homepage-admissions-contract.test.mjs`

**Interfaces:**
- Consumes: Task 3 JSON contracts.
- Produces: `IntakePublicAction`, `IntakeMilestone`, `HomepageHero`, and mutation hooks used by Tasks 5 and 6.

- [ ] **Step 1: Write failing static contract tests**

Assert action/milestone endpoint strings, query-key factories, state union, and intake lifecycle field names.

- [ ] **Step 2: Run and confirm failure**

```bash
cd frontend && node --test packages/api-client/src/homepage-admissions-contract.test.mjs
```

Expected: FAIL because contracts are absent.

- [ ] **Step 3: Implement exact types**

```typescript
export type HomepageAdmissionState =
  | "applications_open"
  | "admission_letters_available"
  | "hidden";

export interface HomepageAdmissions {
  state: HomepageAdmissionState;
  visible: boolean;
  intake: Pick<Intake, "id" | "name" | "slug"> | null;
  application_phase: "standard" | "late" | null;
  closing_at: string | null;
  countdown_target: string | null;
  primary_action: HomepageAdmissionAction | null;
  secondary_actions: HomepageAdmissionAction[];
}
```

- [ ] **Step 4: Implement APIs, hooks, and invalidation**

Add resource-oriented calls and query keys nested by intake. Every mutation invalidates its intake, action/milestone list, admin intake list, and homepage composition key where applicable.

- [ ] **Step 5: Run focused tests and package typecheck**

```bash
cd frontend && node --test packages/api-client/src/homepage-admissions-contract.test.mjs
cd frontend && pnpm --filter @ksu/api-client typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
scripts/commit-changes.sh -m "Add homepage admissions client contracts" --run-checks -- frontend/packages/api-client/src/main/types.ts frontend/packages/api-client/src/main/api.ts frontend/packages/api-client/src/hooks/use-intakes.ts frontend/packages/api-client/src/hooks/query-keys.ts frontend/packages/api-client/src/homepage-admissions-contract.test.mjs
```

### Task 5: Admissions Administration UI

**Files:**
- Modify: `frontend/apps/admin/src/app/(dashboard)/admissions/intakes/[id]/client-page.tsx`
- Modify: `frontend/apps/admin/src/app/(dashboard)/admissions/intakes/page.tsx`
- Modify: `frontend/apps/admin/src/hooks/use-permissions.ts`
- Create: `frontend/apps/admin/src/app/admissions-homepage-contract.test.mjs`

**Interfaces:**
- Consumes: Task 4 hooks and types.
- Produces: admin controls for lifecycle fields, one action of each type, milestones, workflow, and timestamped preview.

- [ ] **Step 1: Write failing admin contract tests**

Assert visible labels and integrations for `Homepage priority`, `Feature on homepage`, `Application override`, `Download Admission Letter`, `Reporting`, workflow actions, and `Preview homepage state`.

- [ ] **Step 2: Run and confirm failure**

```bash
cd frontend && node --test apps/admin/src/app/admissions-homepage-contract.test.mjs
```

Expected: FAIL because the controls are absent.

- [ ] **Step 3: Extend intake lifecycle form**

Replace operational reliance on the `is_open` switch with timezone-aware datetime inputs, override plus required expiry, late-applications switch, homepage feature switch, priority, and timezone. Preserve legacy read fields during migration but do not present them as authoritative.

- [ ] **Step 4: Add public action management**

Render actions as focused cards/forms with action type, label, safe destination, window, enabled state, new-tab setting, status, workflow controls, and deletion confirmation. Prevent duplicate action types client-side and surface API validation messages.

- [ ] **Step 5: Add milestone management and preview**

Render cohort milestone forms with type, title, timestamps, location, instructions URL, public state, order, and workflow. Preview accepts an aware instant and displays state, selected intake, primary action, countdown target, and resolver reason without publishing changes.

- [ ] **Step 6: Run contract, lint, and typecheck**

```bash
cd frontend && node --test apps/admin/src/app/admissions-homepage-contract.test.mjs
cd frontend && pnpm --filter @ksu/admin lint
cd frontend && pnpm --filter @ksu/admin typecheck
```

Expected: PASS; existing unrelated warnings may remain.

- [ ] **Step 7: Commit**

```bash
scripts/commit-changes.sh -m "Manage homepage admissions actions" --run-checks -- 'frontend/apps/admin/src/app/(dashboard)/admissions/intakes/[id]/client-page.tsx' 'frontend/apps/admin/src/app/(dashboard)/admissions/intakes/page.tsx' frontend/apps/admin/src/hooks/use-permissions.ts frontend/apps/admin/src/app/admissions-homepage-contract.test.mjs
```

### Task 6: Public Cinematic Hero and Contextual CTA

**Files:**
- Modify: `frontend/apps/web/src/lib/homepage-sections.ts`
- Create: `frontend/apps/web/src/components/home/admissions-countdown.tsx`
- Modify: `frontend/apps/web/src/components/home/sections/composed-section-variants.tsx`
- Modify: `frontend/apps/web/src/components/home/section-renderer.tsx`
- Modify: `frontend/apps/web/src/app/page.tsx`
- Modify: `frontend/apps/web/src/components/home/landing-hero.tsx`
- Modify: `frontend/apps/web/src/lib/landing-data.ts`
- Modify: `frontend/packages/ui/src/components/layout/public/public-header.tsx`
- Create: `frontend/apps/web/src/app/homepage-hero-admissions-contract.test.mjs`
- Modify: `frontend/apps/web/page-cms-visual-audit.spec.ts`

**Interfaces:**
- Consumes: `HomepageHero` from Task 4.
- Produces: responsive hero, accessible countdown, conditional panel, and header CTA sharing `hero.admissions.primary_action`.

- [ ] **Step 1: Write failing hero contract tests**

Assert all three states, no closed copy, no hard-coded Apply fallback, use of the actual mobile image, countdown component, shared header action, and safe hidden fallback.

- [ ] **Step 2: Run and confirm failure**

```bash
cd frontend && node --test apps/web/src/app/homepage-hero-admissions-contract.test.mjs
```

Expected: FAIL on current one-CTA hero behavior.

- [ ] **Step 3: Parse the resolved hero safely**

Extend homepage response types and normalizers so missing or malformed admissions data becomes the explicit hidden contract. Pass the resolved hero through `HomepageSections` and `HomepageSectionRenderer` only to `hero_admissions`. Do not infer open state from the separate intake feed.

- [ ] **Step 4: Implement accessible countdown**

`AdmissionsCountdown` accepts `resolvedAt`, `target`, and `onExpire`. It exposes a static readable closing date to assistive technology, marks per-second visual changes `aria-hidden`, refreshes on expiry, and disables animation under reduced motion.

- [ ] **Step 5: Implement approved cinematic hero**

Use responsive desktop/mobile sources, CMS headline/highlight/description/actions, existing theme tokens, readable overlay, verified facts, and a desktop side panel that stacks below copy on mobile. Render no panel markup when hidden and reclaim its grid column.

- [ ] **Step 6: Implement contextual header CTA**

Pass the same resolved primary action to `PublicHeader`: Apply Now for open applications, Download Admission Letter when enabled, or no admissions CTA. Remove unconditional Apply fallbacks from the homepage path.

Update `landing-hero.tsx` and `landing-data.ts` so composition/API failure falls back to institutional presentation and Explore Programmes, never an invented Apply Now destination.

- [ ] **Step 7: Extend responsive visual tests**

Test large desktop, tablet portrait, a common Android viewport, and a small phone for no horizontal overflow, readable panel, hidden-state reclaimed width, keyboard focus, and no console errors.

- [ ] **Step 8: Run focused verification**

```bash
cd frontend && node --test apps/web/src/app/homepage-hero-admissions-contract.test.mjs
cd frontend && pnpm --filter @ksu/ui typecheck
cd frontend && pnpm --filter @ksu/web lint
cd frontend && pnpm --filter @ksu/web typecheck
```

Expected: PASS; existing unrelated warnings may remain.

- [ ] **Step 9: Commit**

```bash
scripts/commit-changes.sh -m "Render resolved homepage admissions hero" --run-checks -- frontend/apps/web/src/lib/homepage-sections.ts frontend/apps/web/src/components/home/admissions-countdown.tsx frontend/apps/web/src/components/home/sections/composed-section-variants.tsx frontend/apps/web/src/components/home/section-renderer.tsx frontend/apps/web/src/components/home/landing-hero.tsx frontend/apps/web/src/lib/landing-data.ts frontend/apps/web/src/app/page.tsx frontend/packages/ui/src/components/layout/public/public-header.tsx frontend/apps/web/src/app/homepage-hero-admissions-contract.test.mjs frontend/apps/web/page-cms-visual-audit.spec.ts
```

### Task 7: Seed Data, Contracts, and End-to-End Verification

**Files:**
- Modify: `services/main/app/seeders/seed_page_cms.py`
- Modify: `services/main/tests/test_page_cms_seeders.py`
- Regenerate: `contracts/main/openapi.json`
- Regenerate: `contracts/main/frontend-contract.md`
- Modify: `CHANGELOG.md`

**Interfaces:**
- Consumes all earlier tasks.
- Produces a deployable, documented, verified feature without misleading seed state.

- [ ] **Step 1: Write failing seeder assertions**

Assert the hero seed contains institutional presentation only, uses valid plural admissions/programme routes, and never seeds operational `Admissions open` copy.

- [ ] **Step 2: Run and confirm failure**

```bash
docker compose exec -T main pytest tests/test_page_cms_seeders.py -q
```

Expected: FAIL against the old hard-coded eyebrow and singular route.

- [ ] **Step 3: Correct safe seed content**

Seed the approved institutional headline, highlight, description, Explore Kisii University, and Explore Programmes CTAs. Do not seed an open application action unless a real intake window and destination are configured.

- [ ] **Step 4: Regenerate API contracts**

Run the repository contract generator and confirm the new intake resources and homepage hero schema appear while unrelated routes remain stable:

```bash
python scripts/generate_api_contracts.py
```

- [ ] **Step 5: Run backend verification**

```bash
docker compose exec -T main pytest tests/test_homepage_admissions_models.py tests/test_homepage_admissions_schemas.py tests/test_homepage_admissions_resolver.py tests/test_homepage_admissions_api.py tests/test_homepage_composition.py tests/test_page_cms_seeders.py tests/test_roles_page_cms_permissions.py -q
```

Expected: PASS.

- [ ] **Step 6: Run frontend verification**

```bash
cd frontend && node --test packages/api-client/src/homepage-admissions-contract.test.mjs apps/admin/src/app/admissions-homepage-contract.test.mjs apps/web/src/app/homepage-hero-admissions-contract.test.mjs
cd frontend && pnpm lint
cd frontend && pnpm typecheck
```

Expected: PASS; existing unrelated warnings may remain.

- [ ] **Step 7: Run the homepage visual audit**

```bash
cd frontend && pnpm --filter @ksu/web exec playwright test page-cms-visual-audit.spec.ts
```

Expected: PASS at all configured viewports with no horizontal overflow or console errors.

- [ ] **Step 8: Update changelog and commit all generated contracts**

```bash
scripts/commit-changes.sh -m "Finalize homepage admissions hero" --run-full-checks -- services/main/app/seeders/seed_page_cms.py services/main/tests/test_page_cms_seeders.py contracts/main/openapi.json contracts/main/frontend-contract.md CHANGELOG.md
```

Expected: lint, typecheck, build, commit, and all prior focused tests pass.
