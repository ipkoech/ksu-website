# Page CMS Admin Composer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current technical Page CMS record editor with a professional, scoped, relationship-driven section composer that CoCMS and delegated editors can use to assemble approved public pages without raw UUIDs or JSON editing.

**Architecture:** Keep `PageSection`, `SectionItem`, `PartnershipSpotlight`, `MediaLink`, and the shared content workflow as the persistence foundation. Add explicit section-definition metadata, typed source references, bulk reorder and validation APIs, and a draft preview contract. Build the admin as a page outline plus section inspector: editors select approved visual variants, curate existing domain records, apply limited editorial overrides, attach media by role, reorder with keyboard-accessible drag and drop, preview, and submit to CoCMS.

**Tech Stack:** FastAPI, SQLAlchemy 2, Alembic, Pydantic v2, PostgreSQL JSONB, pytest, Next.js 15, React 19, TypeScript, TanStack Query, shadcn-based `@ksu/ui`, `@dnd-kit`, existing `@ksu/api-client`, `MediaPicker`, `AttachmentManager`, RBAC, and content workflow services.

## Global Constraints

- Preserve the existing Kisii University theme, typography, colour tokens, admin shell, and public-site design system.
- Admin implementation comes first; this plan does not redesign the public homepage.
- Editors choose from developer-defined section variants; they cannot create arbitrary HTML or layouts.
- University, school, research, and library scopes use the same composer with backend-authoritative scope permissions.
- CoCMS remains the final reviewer and publisher for public content.
- Unpublish remains an Admin/CoCMS action.
- Existing domain records remain the source of truth for intakes, programmes, academic dates, people, research, news, events, partners, alumni, and verified statistics.
- Page sections store curation, ordering, display options, editorial overrides, and media; they do not duplicate complete domain records.
- Normal admin users never enter raw UUIDs or edit JSON.
- Reordering must support pointer, touch, and keyboard interaction and persist only after an explicit save.
- Every authoring edit to approved or published content must return it to the appropriate editable workflow state through `ContentWorkflowService.reset_after_authoring_edit`.
- Public and preview contracts must exclude deleted, inaccessible, inactive, expired, or unpublished source records unless the preview explicitly represents an authorised draft.
- All new backend mutations require scope-aware permission checks and workflow audit logs.
- Use `scripts/commit-changes.sh`, never `git commit` directly.

---

## File Structure And Responsibilities

### Backend

- Modify `services/main/app/models/page_cms.py`: add typed source references and optimistic revision fields.
- Create `services/main/migrations/versions/20260713_0022_add_page_cms_source_references.py`: migrate the new source-reference contract safely.
- Modify `services/main/app/schemas/page_cms.py`: expose definitions, source references, reorder, validation, and preview schemas.
- Create `services/main/app/services/page_cms_definitions.py`: central registry of supported variants, fields, media roles, source types, item limits, and completeness rules.
- Create `services/main/app/services/page_cms_sources.py`: search and resolve domain records into stable display summaries.
- Modify `services/main/app/services/page_cms.py`: bulk ordering, draft composition, resolved items, completeness validation, and optimistic concurrency.
- Modify `services/main/app/api/v1/page_cms.py`: definitions, source search, reorder, validate, stats, and preview endpoints.
- Modify `services/main/app/services/stats.py`: definite Page CMS operational counts.

### Admin frontend

- Modify `frontend/apps/admin/package.json` and `frontend/pnpm-lock.yaml`: add `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities`.
- Modify `frontend/apps/admin/src/lib/api/page-cms.ts`: typed composer contracts and API methods.
- Create `frontend/apps/admin/src/lib/page-cms/section-definitions.ts`: labels, icons, and frontend presentation metadata keyed by backend definition key.
- Create `frontend/apps/admin/src/components/page-cms/page-scope-picker.tsx`: labelled page/scope selection without UUID entry.
- Create `frontend/apps/admin/src/components/page-cms/source-record-picker.tsx`: searchable relationship picker with record summaries.
- Create `frontend/apps/admin/src/components/page-cms/sortable-section-outline.tsx`: accessible page-section ordering.
- Create `frontend/apps/admin/src/components/page-cms/sortable-item-list.tsx`: accessible ordering for section items.
- Create `frontend/apps/admin/src/components/page-cms/section-template-picker.tsx`: approved section template selection.
- Create `frontend/apps/admin/src/components/page-cms/section-inspector.tsx`: routes a selected section to a typed editor.
- Create `frontend/apps/admin/src/components/page-cms/editors/`: focused editors for hero/admissions, pulse, partnership, programmes/pathway, dates, pillars, campus media, leadership, research, news, events, partners, alumni, and facts.
- Create `frontend/apps/admin/src/components/page-cms/completeness-panel.tsx`: actionable errors and warnings.
- Create `frontend/apps/admin/src/components/page-cms/composer-preview.tsx`: desktop/tablet/mobile draft preview shell.
- Create `frontend/apps/admin/src/app/(dashboard)/page-cms/composer/page.tsx`: page and scope selection.
- Create `frontend/apps/admin/src/app/(dashboard)/page-cms/composer/[pageKey]/client-page.tsx`: main composer workspace.
- Create `frontend/apps/admin/src/app/(dashboard)/page-cms/composer/[pageKey]/page.tsx`: route wrapper.
- Modify existing Page CMS dashboard, sections, spotlight, CoCMS registry, and review queue links to make the composer the primary workflow while retaining record-list access.

---

### Task 1: Canonical Section Definition Registry

**Files:**
- Create: `services/main/app/services/page_cms_definitions.py`
- Modify: `services/main/app/schemas/page_cms.py`
- Modify: `services/main/app/api/v1/page_cms.py`
- Test: `services/main/tests/test_page_cms_definitions.py`

**Interfaces:**
- Produces: `SECTION_DEFINITIONS: dict[str, SectionDefinition]`.
- Produces: `GET /api/v1/page-section-definitions` through the existing router mounted at `/api/v1`.
- Produces definition fields: `key`, `label`, `description`, `allowed_scopes`, `min_items`, `max_items`, `allowed_item_types`, `allowed_source_types`, `media_roles`, `settings_schema`, and `required_fields`.

- [ ] **Step 1: Write failing registry tests**

```python
def test_every_model_variant_has_one_admin_definition():
    assert set(PAGE_SECTION_LAYOUT_VARIANTS) == set(SECTION_DEFINITIONS)

def test_hero_definition_requires_desktop_and_mobile_media():
    hero = SECTION_DEFINITIONS["hero_admissions"]
    assert hero.media_roles["hero_image"].required is True
    assert hero.media_roles["mobile_image"].required is True
    assert hero.max_items == 3
```

- [ ] **Step 2: Run the test and confirm it fails because the registry does not exist**

Run: `cd services/main && pytest tests/test_page_cms_definitions.py -q`

Expected: FAIL with an import error for `page_cms_definitions`.

- [ ] **Step 3: Implement immutable definition dataclasses and one entry for every existing layout variant**

```python
@dataclass(frozen=True)
class MediaRoleDefinition:
    label: str
    media_type: str
    required: bool = False
    multiple: bool = False

@dataclass(frozen=True)
class SectionDefinition:
    key: str
    label: str
    description: str
    allowed_scopes: tuple[str, ...]
    min_items: int
    max_items: int
    allowed_item_types: tuple[str, ...]
    allowed_source_types: tuple[str, ...]
    media_roles: dict[str, MediaRoleDefinition]
    settings_schema: dict[str, Any]
    required_fields: tuple[str, ...]
```

Definitions must cover `hero_admissions`, `pulse_strip`, `featured_partnership`, `programme_finder`, `date_timeline`, `pillar_grid`, `media_mosaic`, `leadership_activity`, `research_cards`, `news_grid`, `events_list`, `logo_carousel`, `alumni_story`, and `facts_strip`.

- [ ] **Step 4: Add `SectionDefinitionRead` schemas and return definitions in stable label order**

```python
@router.get("/page-section-definitions")
async def list_page_cms_definitions(user: CurrentUser):
    _authorize_page_section_admin_list_access(user)
    return success(data=serialize_section_definitions())
```

- [ ] **Step 5: Run focused and existing schema tests**

Run: `cd services/main && pytest tests/test_page_cms_definitions.py tests/test_page_cms_schemas.py -q`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
scripts/commit-changes.sh -m "Define Page CMS section templates" --run-checks -- services/main/app/services/page_cms_definitions.py services/main/app/schemas/page_cms.py services/main/app/api/v1/page_cms.py services/main/tests/test_page_cms_definitions.py
```

### Task 2: Typed Domain Source References

**Files:**
- Modify: `services/main/app/models/page_cms.py`
- Modify: `services/main/app/schemas/page_cms.py`
- Create: `services/main/migrations/versions/20260713_0022_add_page_cms_source_references.py`
- Test: `services/main/tests/test_page_cms_source_reference_models.py`
- Test: `services/main/tests/test_page_cms_schemas.py`

**Interfaces:**
- Adds `SectionItem.source_type: str | None`, `source_id: UUID | None`, `editorial_overrides: JSONB | None`, and `revision: int`.
- Adds `PageSection.revision: int`.
- Source types: `intake`, `programme`, `academic_calendar`, `person`, `staff_assignment`, `research_project`, `publication`, `news`, `event`, `research_partner`, `alumni`, `testimonial`, `public_stat`, and `club_activity`.

- [ ] **Step 1: Write failing model and schema tests**

```python
def test_source_id_requires_source_type():
    with pytest.raises(ValidationError):
        SectionItemCreate(source_id=uuid.uuid4())

def test_manual_item_cannot_include_source_reference():
    with pytest.raises(ValidationError):
        SectionItemCreate(item_type="text", source_type="news", source_id=uuid.uuid4())

def test_editorial_overrides_are_limited_to_safe_fields():
    with pytest.raises(ValidationError):
        SectionItemCreate(
            item_type="reference",
            source_type="news",
            source_id=uuid.uuid4(),
            editorial_overrides={"unsafe_html": "<script>"},
        )
```

- [ ] **Step 2: Run tests and confirm failure for missing fields**

Run: `cd services/main && pytest tests/test_page_cms_source_reference_models.py tests/test_page_cms_schemas.py -q`

Expected: FAIL because source-reference fields and `reference` item type are absent.

- [ ] **Step 3: Add fields, constraints, and schema validation**

Use a check constraint requiring `source_type` and `source_id` to be both null or both non-null. Permit editorial override keys only from `title`, `subtitle`, `summary`, `cta_label`, `cta_url`, `badge`, and `image_media_id`.

- [ ] **Step 4: Write a reversible migration**

The upgrade adds nullable source fields and non-null `revision` columns with server default `1`, extends the item-type constraint with `reference`, and indexes `(source_type, source_id)`. The downgrade removes the index and columns and restores the original item-type constraint.

- [ ] **Step 5: Apply migration and run tests**

Run: `cd services/main && alembic upgrade head`

Expected: migration `20260713_0022` applies successfully.

Run: `cd services/main && pytest tests/test_page_cms_source_reference_models.py tests/test_page_cms_models.py tests/test_page_cms_schemas.py -q`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
scripts/commit-changes.sh -m "Add Page CMS source references" --run-full-checks -- services/main/app/models/page_cms.py services/main/app/schemas/page_cms.py services/main/migrations/versions/20260713_0022_add_page_cms_source_references.py services/main/tests/test_page_cms_source_reference_models.py services/main/tests/test_page_cms_schemas.py
```

### Task 3: Searchable Source Catalog And Resolved Summaries

**Files:**
- Create: `services/main/app/services/page_cms_sources.py`
- Modify: `services/main/app/schemas/page_cms.py`
- Modify: `services/main/app/api/v1/page_cms.py`
- Test: `services/main/tests/test_page_cms_sources.py`
- Test: `services/main/tests/test_page_cms_source_api.py`

**Interfaces:**
- Produces: `PageCmsSourceService.search(db, source_type, query, scope_type, scope_id, page, per_page)`.
- Produces: `PageCmsSourceService.resolve(db, source_type, source_id, preview=False)`.
- Produces: `GET /api/v1/page-section-sources/{source_type}`.
- Produces summary fields: `id`, `source_type`, `label`, `secondary_label`, `status`, `published_at`, `thumbnail_url`, `metadata`, and `selectable`.

- [ ] **Step 1: Write failing service tests for programmes, news, events, people, partners, and statistics**

```python
@pytest.mark.asyncio
async def test_news_source_search_excludes_unpublished_records(db):
    result = await PageCmsSourceService.search(
        db, "news", query="graduation", scope_type="university", scope_id=None,
        page=1, per_page=20,
    )
    assert all(item.status == "published" for item in result.items)

@pytest.mark.asyncio
async def test_person_summary_uses_name_and_current_title(db, person):
    item = await PageCmsSourceService.resolve(db, "person", person.id, preview=True)
    assert item.label == person.full_name
    assert item.secondary_label
```

- [ ] **Step 2: Run tests and confirm failure for the missing service**

Run: `cd services/main && pytest tests/test_page_cms_sources.py tests/test_page_cms_source_api.py -q`

Expected: FAIL with an import error for `PageCmsSourceService`.

- [ ] **Step 3: Implement explicit adapters per source type**

Use SQLAlchemy queries for main-service models and existing proxy services for research records. Each adapter must enforce status, publication window, soft deletion, scope, deterministic ordering, and a maximum `per_page` of 50.

- [ ] **Step 4: Add the authenticated source-search endpoint with variant compatibility validation**

```python
@router.get("/page-section-sources/{source_type}")
async def search_page_cms_sources(
    source_type: str,
    db: DbSession,
    user: CurrentUser,
    q: str = Query("", max_length=120),
    scope_type: str = Query("university"),
    scope_id: uuid.UUID | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=50),
): ...
```

- [ ] **Step 5: Run focused API tests**

Run: `cd services/main && pytest tests/test_page_cms_sources.py tests/test_page_cms_source_api.py -q`

Expected: PASS, including 403 tests for inaccessible school/library/research scopes and 422 tests for unknown source types.

- [ ] **Step 6: Commit**

```bash
scripts/commit-changes.sh -m "Add Page CMS source catalog" --run-full-checks -- services/main/app/services/page_cms_sources.py services/main/app/schemas/page_cms.py services/main/app/api/v1/page_cms.py services/main/tests/test_page_cms_sources.py services/main/tests/test_page_cms_source_api.py
```

### Task 4: Bulk Reorder And Optimistic Concurrency APIs

**Files:**
- Modify: `services/main/app/schemas/page_cms.py`
- Modify: `services/main/app/services/page_cms.py`
- Modify: `services/main/app/api/v1/page_cms.py`
- Test: `services/main/tests/test_page_cms_reorder.py`

**Interfaces:**
- Produces: `PATCH /api/v1/pages/{page_key}/sections/reorder`.
- Produces: `PATCH /api/v1/page-sections/{section_id}/items/reorder`.
- Request entries: `{ "id": UUID, "display_order": int, "revision": int }`.
- Returns updated records in persisted order and HTTP 409 for stale revisions.

- [ ] **Step 1: Write failing reorder tests**

```python
@pytest.mark.asyncio
async def test_section_reorder_is_atomic_and_normalizes_order(client, sections, auth_headers):
    response = await client.patch(
        "/api/v1/pages/homepage/sections/reorder",
        headers=auth_headers,
        json={
            "scope_type": "university",
            "scope_id": None,
            "items": [
                {"id": str(sections[1].id), "display_order": 10, "revision": 1},
                {"id": str(sections[0].id), "display_order": 20, "revision": 1},
            ],
        },
    )
    assert response.status_code == 200
    assert [item["display_order"] for item in response.json()["data"]] == [10, 20]
```

Add cases for a record from another page/scope, duplicate IDs, missing IDs, stale revision, unauthorized scope, and workflow reset after changing published content.

- [ ] **Step 2: Run the test and confirm 404 or 405 for missing routes**

Run: `cd services/main && pytest tests/test_page_cms_reorder.py -q`

Expected: FAIL because reorder routes do not exist.

- [ ] **Step 3: Implement transactional reorder services**

Lock selected rows with `SELECT ... FOR UPDATE`, compare revisions, validate every record belongs to the requested parent, assign normalized increments of 10, increment revisions, and write one workflow audit event containing old and new order arrays.

- [ ] **Step 4: Add routes with existing scope authorization helpers**

Return HTTP 409 with `{ "detail": "Page composition changed; reload before saving order" }` when any revision is stale.

- [ ] **Step 5: Run reorder and workflow regression tests**

Run: `cd services/main && pytest tests/test_page_cms_reorder.py tests/test_page_cms_workflow.py tests/test_content_workflow.py -q`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
scripts/commit-changes.sh -m "Add atomic Page CMS reordering" --run-full-checks -- services/main/app/schemas/page_cms.py services/main/app/services/page_cms.py services/main/app/api/v1/page_cms.py services/main/tests/test_page_cms_reorder.py
```

### Task 5: Completeness Validation And Draft Preview Contract

**Files:**
- Modify: `services/main/app/schemas/page_cms.py`
- Modify: `services/main/app/services/page_cms.py`
- Modify: `services/main/app/api/v1/page_cms.py`
- Test: `services/main/tests/test_page_cms_validation.py`
- Test: `services/main/tests/test_page_cms_preview.py`

**Interfaces:**
- Produces: `PageSectionValidationService.validate(section, resolved_items, media_groups)`.
- Produces: `GET /api/v1/pages/{page_key}/validate`.
- Produces: `GET /api/v1/pages/{page_key}/preview`.
- Issue shape: `code`, `severity`, `section_id`, `item_id`, `field`, `message`, and `blocking`.
- Preview includes draft/approved/published sections visible to the current user and resolves typed source records.

- [ ] **Step 1: Write failing validation tests**

```python
def test_hero_missing_mobile_image_is_blocking():
    issues = PageSectionValidationService.validate(hero, [], {"heroImage": [desktop], "mobileImage": []})
    assert any(issue.code == "missing_mobile_image" and issue.blocking for issue in issues)

def test_broken_source_reference_is_blocking():
    issues = PageSectionValidationService.validate(news_section, [unresolved_item], empty_media)
    assert any(issue.code == "source_unavailable" and issue.blocking for issue in issues)
```

Cover missing alt text, invalid CTA, empty required section, too many items, duplicate source selection, unverified fact, expired source, and inaccessible source.

- [ ] **Step 2: Run tests and confirm failure for missing validation and preview services**

Run: `cd services/main && pytest tests/test_page_cms_validation.py tests/test_page_cms_preview.py -q`

Expected: FAIL with missing service or route errors.

- [ ] **Step 3: Implement validation from the canonical definition registry**

Blocking errors prevent `submit`, `approve`, and `publish`. Warnings remain visible but do not block workflow. Validation is recomputed server-side for every workflow transition.

- [ ] **Step 4: Implement draft composition without weakening the public composition filter**

Add a separate `compose_preview` service that applies user scope authorization, includes non-archived drafts, resolves source summaries, groups media, and returns validation issues. Do not add a query flag to the public `/homepage` endpoint.

- [ ] **Step 5: Add endpoint and workflow enforcement tests**

Run: `cd services/main && pytest tests/test_page_cms_validation.py tests/test_page_cms_preview.py tests/test_page_cms_workflow.py tests/test_homepage_composition.py -q`

Expected: PASS and public composition continues to return published records only.

- [ ] **Step 6: Commit**

```bash
scripts/commit-changes.sh -m "Validate and preview Page CMS drafts" --run-full-checks -- services/main/app/schemas/page_cms.py services/main/app/services/page_cms.py services/main/app/api/v1/page_cms.py services/main/tests/test_page_cms_validation.py services/main/tests/test_page_cms_preview.py
```

### Task 6: Definite CMS Dashboard Statistics

**Files:**
- Modify: `services/main/app/services/stats.py`
- Modify: `services/main/app/api/v1/stats.py`
- Test: `services/main/tests/test_page_cms_stats.py`
- Modify: `frontend/apps/admin/src/lib/api/page-cms.ts`
- Modify: `frontend/apps/admin/src/app/(dashboard)/page-cms/page.tsx`
- Test: `frontend/apps/admin/src/app/(dashboard)/page-cms/page-cms-admin-contract.test.mjs`

**Interfaces:**
- Produces `GET /api/v1/stats/portal/cocms` fields: `draft_count`, `in_review_count`, `changes_requested_count`, `approved_count`, `scheduled_count`, `published_count`, `expired_count`, `validation_blocker_count`, and `spotlight_count`.

- [ ] **Step 1: Add failing backend assertions for exact values and scope**

```python
assert payload["stats"]["draft_count"] == 2
assert payload["stats"]["in_review_count"] == 1
assert payload["stats"]["validation_blocker_count"] == 1
```

- [ ] **Step 2: Run backend test and confirm missing keys**

Run: `cd services/main && pytest tests/test_page_cms_stats.py -q`

Expected: FAIL because the CoCMS stats response lacks Page CMS counters.

- [ ] **Step 3: Implement aggregate queries that count all authorised rows rather than one fetched page**

Use SQL aggregate expressions and publication-window predicates. Return integer zero for a valid empty state; reserve `Unavailable` for request failure in the admin UI.

- [ ] **Step 4: Replace dashboard list-derived counters with the stats endpoint**

The dashboard may still fetch six recent records for activity, but stat values must come from the dedicated endpoint.

- [ ] **Step 5: Run backend and admin contract checks**

Run: `cd services/main && pytest tests/test_page_cms_stats.py -q`

Run: `cd frontend && node apps/admin/src/app/\(dashboard\)/page-cms/page-cms-admin-contract.test.mjs && pnpm --filter @ksu/admin typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
scripts/commit-changes.sh -m "Add definite Page CMS dashboard statistics" --run-checks -- services/main/app/services/stats.py services/main/app/api/v1/stats.py services/main/tests/test_page_cms_stats.py frontend/apps/admin/src/lib/api/page-cms.ts frontend/apps/admin/src/app/\(dashboard\)/page-cms/page.tsx frontend/apps/admin/src/app/\(dashboard\)/page-cms/page-cms-admin-contract.test.mjs
```

### Task 7: Typed Admin API And Reusable Relationship Pickers

**Files:**
- Modify: `frontend/apps/admin/src/lib/api/page-cms.ts`
- Create: `frontend/apps/admin/src/lib/page-cms/section-definitions.ts`
- Create: `frontend/apps/admin/src/components/page-cms/page-scope-picker.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/source-record-picker.tsx`
- Test: `frontend/apps/admin/src/components/page-cms/page-cms-picker-contract.test.mjs`

**Interfaces:**
- Produces hooks/API methods: `definitions`, `searchSources`, `previewPage`, `validatePage`, `reorderSections`, and `reorderItems`.
- Produces `PageScopePicker` values `{ scopeType, scopeId, scopeLabel }`.
- Produces `SourceRecordPicker` values `{ sourceType, sourceId, summary }`.

- [ ] **Step 1: Add failing static contract tests**

Assert that no `Input` is bound directly to `scope_id` or `source_id`, the source picker calls `/page-section-sources/{source_type}`, selected records render `label` and `secondary_label`, and inaccessible records cannot be selected.

- [ ] **Step 2: Run test and confirm components are missing**

Run: `cd frontend && node apps/admin/src/components/page-cms/page-cms-picker-contract.test.mjs`

Expected: FAIL because picker files do not exist.

- [ ] **Step 3: Add complete TypeScript contracts matching Tasks 1–5**

```ts
export type PageCmsSourceSummary = {
  id: string;
  source_type: PageCmsSourceType;
  label: string;
  secondary_label?: string | null;
  status?: string | null;
  thumbnail_url?: string | null;
  selectable: boolean;
  metadata: Record<string, string | number | boolean | null>;
};
```

- [ ] **Step 4: Implement debounced, accessible relationship pickers**

Use labelled combobox/dialog behavior, a 250 ms debounce, loading/empty/error states, selected-record summaries, clear action, keyboard navigation, and no UUID display in user-facing text.

- [ ] **Step 5: Run contract, lint, and type checks**

Run: `cd frontend && node apps/admin/src/components/page-cms/page-cms-picker-contract.test.mjs && pnpm --filter @ksu/admin lint && pnpm --filter @ksu/admin typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
scripts/commit-changes.sh -m "Add Page CMS relationship pickers" --run-checks -- frontend/apps/admin/src/lib/api/page-cms.ts frontend/apps/admin/src/lib/page-cms/section-definitions.ts frontend/apps/admin/src/components/page-cms/page-scope-picker.tsx frontend/apps/admin/src/components/page-cms/source-record-picker.tsx frontend/apps/admin/src/components/page-cms/page-cms-picker-contract.test.mjs
```

### Task 8: Accessible Drag-And-Drop Page Outline

**Files:**
- Modify: `frontend/apps/admin/package.json`
- Modify: `frontend/pnpm-lock.yaml`
- Create: `frontend/apps/admin/src/components/page-cms/sortable-section-outline.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/sortable-item-list.tsx`
- Test: `frontend/apps/admin/src/components/page-cms/page-cms-sortable-contract.test.mjs`

**Interfaces:**
- `SortableSectionOutline` accepts `sections`, `selectedSectionId`, `onSelect`, and `onOrderChange`.
- `SortableItemList` accepts `items`, `selectedItemId`, `onSelect`, and `onOrderChange`.
- Both emit normalized arrays with display orders `10, 20, 30, ...` without saving automatically.

- [ ] **Step 1: Add failing tests for pointer and keyboard contracts**

Assert presence of drag handles with accessible labels, `KeyboardSensor`, `sortableKeyboardCoordinates`, explicit Save Order integration callback, stable list dimensions, and no mutation call inside `onDragEnd`.

- [ ] **Step 2: Run test and confirm missing implementation**

Run: `cd frontend && node apps/admin/src/components/page-cms/page-cms-sortable-contract.test.mjs`

Expected: FAIL because sortable components are absent.

- [ ] **Step 3: Install focused dnd-kit dependencies**

Run: `cd frontend && pnpm --filter @ksu/admin add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`

Expected: `package.json` and `pnpm-lock.yaml` update without unrelated dependency changes.

- [ ] **Step 4: Implement keyboard-accessible sorting with local dirty state**

Use a grip icon button, `PointerSensor`, `TouchSensor`, `KeyboardSensor`, collision detection, announcements, an unsaved-order badge, and Cancel Order to restore the last server order.

- [ ] **Step 5: Run contract, lint, and type checks**

Run: `cd frontend && node apps/admin/src/components/page-cms/page-cms-sortable-contract.test.mjs && pnpm --filter @ksu/admin lint && pnpm --filter @ksu/admin typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
scripts/commit-changes.sh -m "Add accessible Page CMS ordering" --run-checks -- frontend/apps/admin/package.json frontend/pnpm-lock.yaml frontend/apps/admin/src/components/page-cms/sortable-section-outline.tsx frontend/apps/admin/src/components/page-cms/sortable-item-list.tsx frontend/apps/admin/src/components/page-cms/page-cms-sortable-contract.test.mjs
```

### Task 9: Main Page Composer Workspace

**Files:**
- Create: `frontend/apps/admin/src/components/page-cms/section-template-picker.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/completeness-panel.tsx`
- Create: `frontend/apps/admin/src/app/(dashboard)/page-cms/composer/page.tsx`
- Create: `frontend/apps/admin/src/app/(dashboard)/page-cms/composer/[pageKey]/page.tsx`
- Create: `frontend/apps/admin/src/app/(dashboard)/page-cms/composer/[pageKey]/client-page.tsx`
- Test: `frontend/apps/admin/src/app/(dashboard)/page-cms/composer/page-cms-composer-contract.test.mjs`

**Interfaces:**
- Composer layout: persistent page/scope context header, section outline, selected-section inspector slot, completeness panel, preview action, workflow actions, and explicit Save Order.
- Template picker consumes backend definitions and filters by scope.

- [ ] **Step 1: Write failing composer contract tests**

Assert the workspace has labelled regions for page outline, section editor, validation, and preview; uses `PageScopePicker`; loads definitions from the API; preserves current selection in the URL; and warns before navigation when order or form state is dirty.

- [ ] **Step 2: Run test and confirm composer routes are missing**

Run: `cd frontend && node apps/admin/src/app/\(dashboard\)/page-cms/composer/page-cms-composer-contract.test.mjs`

Expected: FAIL because composer files do not exist.

- [ ] **Step 3: Implement scope selection and route state**

Use query parameters `scope_type`, `scope_id`, and `section` for shareable admin state. Resolve scope labels through the picker and never render raw IDs.

- [ ] **Step 4: Implement the three-pane desktop workspace and stacked mobile workspace**

Desktop uses a constrained outline column, flexible inspector, and validation rail. Tablet collapses validation into a drawer. Mobile places the outline before the editor and uses a sticky bottom action bar. Do not nest cards; use bordered panels and full-height regions inside the existing admin shell.

- [ ] **Step 5: Connect create, select, reorder, validate, and workflow actions**

Publishing and unpublishing controls render only for authorised CoCMS/Admin users. Source-scope editors can save and submit but cannot publish. Display HTTP 409 as a reload-required conflict instead of silently overwriting.

- [ ] **Step 6: Run contract, lint, and type checks**

Run: `cd frontend && node apps/admin/src/app/\(dashboard\)/page-cms/composer/page-cms-composer-contract.test.mjs && pnpm --filter @ksu/admin lint && pnpm --filter @ksu/admin typecheck`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
scripts/commit-changes.sh -m "Build Page CMS composer workspace" --run-checks -- frontend/apps/admin/src/components/page-cms/section-template-picker.tsx frontend/apps/admin/src/components/page-cms/completeness-panel.tsx frontend/apps/admin/src/app/\(dashboard\)/page-cms/composer
```

### Task 10: Critical Section-Specific Editors

**Files:**
- Create: `frontend/apps/admin/src/components/page-cms/section-inspector.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/editors/shared-section-fields.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/editors/hero-admissions-editor.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/editors/pulse-editor.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/editors/partnership-editor.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/editors/programme-pathway-editor.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/editors/academic-dates-editor.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/editors/pillar-grid-editor.tsx`
- Test: `frontend/apps/admin/src/components/page-cms/page-cms-critical-editors-contract.test.mjs`

**Interfaces:**
- `SectionInspector` dispatches by `layout_variant` and receives `section`, `definition`, `onSave`, `onDirtyChange`, and `readOnly`.
- Shared fields cover title, subtitle, description, enabled state, publication window, CTA, and role-specific media attachment.

- [ ] **Step 1: Write failing editor contract tests**

Assert:

- Hero editor selects an intake, derives open/closed state fields, supports desktop/mobile/video/poster media, and exposes three CTA slots.
- Pulse editor selects announcement/news/event/research/intake sources and supports priority, expiry, icon key, and order.
- Partnership editor selects a research partner by label and edits pillars/opportunities as repeatable rows.
- Programme editor configures source filters and five pathway steps without JSON.
- Dates editor selects intake or academic-calendar records and displays timezone-aware dates.
- Pillar editor supports exactly four recommended pillars by default while permitting two to six items.

- [ ] **Step 2: Run test and confirm editor files are missing**

Run: `cd frontend && node apps/admin/src/components/page-cms/page-cms-critical-editors-contract.test.mjs`

Expected: FAIL because typed editors do not exist.

- [ ] **Step 3: Implement shared fields and SectionInspector dispatch**

Unknown backend definitions render a non-destructive unsupported-template message with section identity and no editable JSON fallback.

- [ ] **Step 4: Implement each critical editor with relationship pickers and sortable rows**

All forms must show field-level validation, media previews, alt-text controls, explicit Save, and Reset. Saving an existing published section must display that approval is reset before the mutation is confirmed.

- [ ] **Step 5: Remove raw JSON controls from these variants**

Persist structured settings through typed form adapters. Existing unknown settings keys must be preserved on save so deployment does not erase data written by older versions.

- [ ] **Step 6: Run contract, lint, and type checks**

Run: `cd frontend && node apps/admin/src/components/page-cms/page-cms-critical-editors-contract.test.mjs && pnpm --filter @ksu/admin lint && pnpm --filter @ksu/admin typecheck`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
scripts/commit-changes.sh -m "Add critical Page CMS section editors" --run-checks -- frontend/apps/admin/src/components/page-cms/section-inspector.tsx frontend/apps/admin/src/components/page-cms/editors frontend/apps/admin/src/components/page-cms/page-cms-critical-editors-contract.test.mjs
```

### Task 11: Remaining Domain Section Editors

**Files:**
- Create: `frontend/apps/admin/src/components/page-cms/editors/media-mosaic-editor.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/editors/leadership-editor.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/editors/research-editor.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/editors/news-editor.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/editors/events-editor.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/editors/partner-carousel-editor.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/editors/alumni-editor.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/editors/facts-editor.tsx`
- Modify: `frontend/apps/admin/src/components/page-cms/section-inspector.tsx`
- Test: `frontend/apps/admin/src/components/page-cms/page-cms-domain-editors-contract.test.mjs`

**Interfaces:**
- All remaining variants use source references and editorial override fields defined in Tasks 2–3.
- Facts use verified `public_stat` summaries and display source date/verification status.

- [ ] **Step 1: Write failing editor contract tests**

Assert media mosaic uses attachment roles and alt text; leadership selects person/staff assignment plus activities; research distinguishes projects and publications; news and events use separate source types; partner carousel selects active partners and controls logo order; alumni selects alumni/testimonial records; facts rejects unverified statistics from selection.

- [ ] **Step 2: Run test and confirm missing editors**

Run: `cd frontend && node apps/admin/src/components/page-cms/page-cms-domain-editors-contract.test.mjs`

Expected: FAIL because remaining typed editors do not exist.

- [ ] **Step 3: Implement typed editors with shared picker, sortable list, media, CTA, and override controls**

Each editor must enforce the definition's item limit before mutation and explain why an unavailable record cannot be selected.

- [ ] **Step 4: Register every backend definition in SectionInspector**

Add a static exhaustiveness assertion so TypeScript fails when a new `PageSectionLayoutVariant` lacks an editor.

- [ ] **Step 5: Run contract, lint, and type checks**

Run: `cd frontend && node apps/admin/src/components/page-cms/page-cms-domain-editors-contract.test.mjs && pnpm --filter @ksu/admin lint && pnpm --filter @ksu/admin typecheck`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
scripts/commit-changes.sh -m "Complete Page CMS domain editors" --run-checks -- frontend/apps/admin/src/components/page-cms/editors frontend/apps/admin/src/components/page-cms/section-inspector.tsx frontend/apps/admin/src/components/page-cms/page-cms-domain-editors-contract.test.mjs
```

### Task 12: Responsive Draft Preview

**Files:**
- Create: `frontend/apps/admin/src/components/page-cms/composer-preview.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/preview/section-preview-renderer.tsx`
- Create: `frontend/apps/admin/src/components/page-cms/preview/section-preview-shells.tsx`
- Modify: `frontend/apps/admin/src/app/(dashboard)/page-cms/composer/[pageKey]/client-page.tsx`
- Test: `frontend/apps/admin/src/components/page-cms/page-cms-preview-contract.test.mjs`

**Interfaces:**
- Preview modes: `desktop`, `tablet`, and `mobile` using a segmented control.
- Consumes authorised draft preview response from Task 5.
- Preview is representative of content hierarchy and media selection; the public frontend remains responsible for final visual rendering.

- [ ] **Step 1: Write failing preview contract tests**

Assert segmented viewport controls, stable width constraints, loading/empty/error states, validation overlays, missing-media placeholders, external-link safety, and no direct use of unpublished public endpoints.

- [ ] **Step 2: Run test and confirm preview components are missing**

Run: `cd frontend && node apps/admin/src/components/page-cms/page-cms-preview-contract.test.mjs`

Expected: FAIL because preview files do not exist.

- [ ] **Step 3: Implement preview shells for all approved variants**

Use existing admin/public theme tokens and the actual resolved content contract. Keep preview components compact and structurally faithful without duplicating the final public landing-page CSS.

- [ ] **Step 4: Add refresh and dirty-state behavior**

Unsaved local changes show an `Unsaved changes are not in preview` notice. After Save, refresh preview and validation together. Preview failures must not discard editor state.

- [ ] **Step 5: Run contract, lint, typecheck, and build**

Run: `cd frontend && node apps/admin/src/components/page-cms/page-cms-preview-contract.test.mjs && pnpm --filter @ksu/admin lint && pnpm --filter @ksu/admin typecheck && pnpm --filter @ksu/admin build`

Expected: PASS and static export completes.

- [ ] **Step 6: Commit**

```bash
scripts/commit-changes.sh -m "Add responsive Page CMS preview" --run-checks -- frontend/apps/admin/src/components/page-cms/composer-preview.tsx frontend/apps/admin/src/components/page-cms/preview frontend/apps/admin/src/app/\(dashboard\)/page-cms/composer/\[pageKey\]/client-page.tsx frontend/apps/admin/src/components/page-cms/page-cms-preview-contract.test.mjs
```

### Task 13: CoCMS Workflow And Navigation Integration

**Files:**
- Modify: `frontend/apps/admin/src/app/(dashboard)/page-cms/page.tsx`
- Modify: `frontend/apps/admin/src/app/(dashboard)/page-cms/sections/page.tsx`
- Modify: `frontend/apps/admin/src/app/(dashboard)/page-cms/spotlights/page.tsx`
- Modify: `frontend/apps/admin/src/components/workflow/review-queue.tsx`
- Modify: `frontend/apps/admin/src/lib/portals/registry.ts`
- Test: `frontend/apps/admin/src/app/(dashboard)/page-cms/page-cms-admin-contract.test.mjs`
- Test: `frontend/apps/admin/src/components/workflow/page-cms-review-contract.test.mjs`

**Interfaces:**
- Composer becomes the primary CoCMS navigation entry.
- Record lists remain available under an `Advanced records` action.
- Review queue links directly to the composer with page, scope, and section selected.

- [ ] **Step 1: Add failing navigation and permission tests**

Assert CoCMS sees Compose Pages, Review Queue, Media, and Advanced Records; school/research/library editors see only authorised scopes; content owners cannot see publish/unpublish; and review links preserve section context.

- [ ] **Step 2: Run tests and confirm current links target record pages**

Run: `cd frontend && node apps/admin/src/app/\(dashboard\)/page-cms/page-cms-admin-contract.test.mjs && node apps/admin/src/components/workflow/page-cms-review-contract.test.mjs`

Expected: FAIL until composer routes become primary.

- [ ] **Step 3: Update navigation, dashboard actions, and review deep links**

Do not remove legacy page-section routes. Label them `Advanced records` and preserve bookmarks.

- [ ] **Step 4: Tighten action visibility using backend-aligned permissions**

Use `page_sections.review`, `page_sections.publish`, `homepage.publish`, scoped homepage manage permissions, and `admin:*`. UI checks supplement but never replace backend enforcement.

- [ ] **Step 5: Run admin checks**

Run: `cd frontend && node apps/admin/src/app/\(dashboard\)/page-cms/page-cms-admin-contract.test.mjs && node apps/admin/src/components/workflow/page-cms-review-contract.test.mjs && pnpm --filter @ksu/admin lint && pnpm --filter @ksu/admin typecheck && pnpm --filter @ksu/admin build`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
scripts/commit-changes.sh -m "Integrate Page CMS composer with CoCMS" --run-checks -- frontend/apps/admin/src/app/\(dashboard\)/page-cms frontend/apps/admin/src/components/workflow/review-queue.tsx frontend/apps/admin/src/components/workflow/page-cms-review-contract.test.mjs frontend/apps/admin/src/lib/portals/registry.ts
```

### Task 14: End-To-End Verification And Admin Acceptance

**Files:**
- Modify: `frontend/apps/admin/package.json`
- Modify: `frontend/pnpm-lock.yaml`
- Create: `frontend/apps/admin/e2e/page-cms-composer.spec.ts`
- Create: `frontend/apps/admin/playwright.config.ts`
- Create: `frontend/apps/admin/e2e/auth.setup.ts`
- Modify: `docs/superpowers/plans/2026-07-13-page-cms-admin-composer.md` only to mark completed checkboxes during execution.

**Interfaces:**
- Verifies one complete university homepage authoring flow and one scoped school-page flow.

- [ ] **Step 1: Write Playwright scenarios before final UI adjustments**

Cover:

1. CoCMS opens the homepage composer, creates a Hero section, selects an intake, attaches desktop/mobile media, saves, reorders, validates, previews mobile, submits, approves, publishes, and then unpublishes.
2. A school editor opens only their school scope, creates a News section, selects published school news, submits it, and cannot publish.
3. CoCMS opens the review queue, deep-links to that school section, edits the summary, approves, and publishes.
4. Keyboard-only ordering moves a section and saves the normalized order.
5. A stale revision produces a conflict notice and preserves unsaved local content.

- [ ] **Step 2: Install and configure Playwright for the admin app**

Run: `cd frontend && pnpm --filter @ksu/admin add -D @playwright/test && pnpm exec playwright install chromium`

Configure `playwright.config.ts` with `testDir: "./e2e"`, `baseURL: "http://127.0.0.1:3001"`, trace on first retry, screenshots on failure, and a setup project that signs in using `KSU_E2E_EMAIL` and `KSU_E2E_PASSWORD` and writes `e2e/.auth/admin.json`. Add `apps/admin/e2e/.auth/` to `frontend/.gitignore` because it contains session state.

- [ ] **Step 3: Run targeted backend suites**

Run: `cd services/main && pytest tests/test_page_cms_definitions.py tests/test_page_cms_source_reference_models.py tests/test_page_cms_sources.py tests/test_page_cms_source_api.py tests/test_page_cms_reorder.py tests/test_page_cms_validation.py tests/test_page_cms_preview.py tests/test_page_cms_workflow.py tests/test_homepage_composition.py tests/test_page_cms_stats.py -q`

Expected: PASS.

- [ ] **Step 4: Run complete backend Page CMS regression suite**

Run: `cd services/main && pytest tests/test_page_cms_models.py tests/test_page_cms_schemas.py tests/test_page_cms_api.py tests/test_page_cms_workflow.py tests/test_homepage_composition.py tests/test_roles_page_cms_permissions.py tests/test_content_workflow.py tests/test_media_attachments_contract.py -q`

Expected: PASS.

- [ ] **Step 5: Start the backend and admin development servers and run Playwright**

Run: `docker compose up -d postgres redis main`

Run: `cd frontend && pnpm --filter @ksu/admin dev`

Expected: the main API is healthy on its configured local port and the admin app listens on `http://127.0.0.1:3001`.

Run: `cd frontend && pnpm exec playwright test apps/admin/e2e/page-cms-composer.spec.ts --project=chromium`

Expected: all composer scenarios PASS.

- [ ] **Step 6: Capture and inspect desktop, tablet, and mobile screenshots**

Required viewports: `1440x900`, `1024x768`, `768x1024`, `390x844`, and `360x800`. Confirm no horizontal overflow, obscured sticky actions, clipped labels, raw UUIDs, inaccessible drag handles, or nested-card clutter.

- [ ] **Step 7: Run final frontend verification**

Run: `cd frontend && pnpm --filter @ksu/admin lint && pnpm --filter @ksu/admin typecheck && pnpm --filter @ksu/admin build`

Expected: PASS.

- [ ] **Step 8: Commit the acceptance suite and any verified corrections**

```bash
scripts/commit-changes.sh -m "Verify Page CMS admin composer" --run-full-checks -- frontend/apps/admin/package.json frontend/pnpm-lock.yaml frontend/apps/admin/playwright.config.ts frontend/apps/admin/e2e frontend/.gitignore
```

---

## Acceptance Criteria

- An authorised editor can select a university, school, research, or library page without entering an ID.
- An editor can add only approved section templates and receives a tailored form for every supported variant.
- An editor can select existing domain content by name, title, date, status, and thumbnail without seeing raw UUIDs.
- Sections and items can be reordered with mouse, touch, or keyboard; order is saved atomically and conflicts do not overwrite newer work.
- Media can be uploaded or selected by role with preview, alt text, visibility, order, and replacement controls.
- Partnership pillars, opportunities, pathways, and other structured values use repeatable fields instead of JSON editors.
- Validation identifies missing media, invalid links, inaccessible sources, expired sources, unverified facts, empty required sections, and item-limit violations.
- Desktop, tablet, and mobile draft previews use authorised unpublished content and never expose drafts through public endpoints.
- Content owners can save and submit; CoCMS can edit, request changes, approve, schedule/publish through the shared workflow, and authorised Admin/CoCMS users can unpublish.
- Every authoring and workflow mutation is scope-authorised and audit logged.
- The Page CMS dashboard shows definite backend counts, not counts derived from the first list page.
- The composer works within the existing theme and admin shell at all required viewports.
- Existing public homepage behavior and published-only filtering remain unchanged until the separate public landing-page implementation begins.

## Recommended Execution Order

Execute Tasks 1–6 as the backend contract milestone, Tasks 7–9 as the reusable composer foundation, Tasks 10–11 as section editor milestones, and Tasks 12–14 as preview, workflow integration, and acceptance. Do not begin the public landing-page redesign until Task 14 passes.
