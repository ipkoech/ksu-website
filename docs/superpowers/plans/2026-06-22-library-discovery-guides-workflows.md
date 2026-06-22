# Library Discovery, Guides, and Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build backend-backed university library discovery, research guides, subject specialists, workflows, repository support, digital scholarship support, and policy pages.

**Architecture:** Add focused library domain models and public/admin routes in the library service, then extend the shared API client and the library frontend server data layer. Public pages remain server components; client components are limited to interaction such as forms or URL-only filtering.

**Tech Stack:** FastAPI, SQLAlchemy, Alembic, Pydantic v2, shared `@ksu/api-client`, Next.js App Router, TypeScript, Tailwind, existing KSU public primitives.

## Global Constraints

- Public reads must only expose records with active/public visibility and active/public parent library branches.
- Admin management must continue through authenticated `library:write` / `library:admin` users.
- Public library pages must fetch page content in server components through server-side data helpers.
- Public routes must be backend-backed; no dummy/static business records.
- Use existing library service patterns: models in `services/library/app/models`, schemas in `services/library/app/schemas`, routes in `services/library/app/routes/v1`, services in `services/library/app/services`.
- Add targeted backend tests before implementation where executable.
- Run `python3 -m compileall services/library/app services/library/tests services/library/migrations`, frontend typechecks, and targeted Docker backend tests before commit.

---

## File Structure

- Create `services/library/app/models/guides.py`: `LibraryGuide`, `LibraryGuideSection`, `LibrarySpecialist`, `LibraryWorkflow`, `LibraryWorkflowStep`, `LibraryPolicyPage`.
- Modify `services/library/app/models/__init__.py`: export new models.
- Create `services/library/app/schemas/guides.py`: Pydantic create/update/out schemas for guides, specialists, workflows, and policy pages.
- Modify `services/library/app/schemas/__init__.py`: export new schemas.
- Create `services/library/app/services/guides.py`: query, detail, create, update, delete, public filtering, and search document builders.
- Create `services/library/app/routes/v1/guides.py`: public/admin-aware routes for guides, specialists, workflows, and policies.
- Modify `services/library/app/routes/v1/__init__.py`: register guide routes.
- Create Alembic migration under `services/library/migrations/versions/`.
- Modify `services/library/app/services/search.py`: include guides, specialists, workflows, policies, repository support, and digital scholarship records in unified search.
- Modify `frontend/packages/api-client/src/library/index.ts`: add types and endpoints.
- Modify `frontend/apps/library/src/lib/library-public-data.ts`: add public server-side helpers for new clusters and search.
- Create or upgrade public pages in `frontend/apps/library/src/app`: `/guides`, `/guides/[slug]`, `/specialists`, `/borrowing`, `/remote-access`, `/repository`, `/digital-scholarship`, `/policies`, `/policies/[slug]`, and `/search`.
- Modify admin registry/pages under `frontend/apps/admin/src` to expose CRUD for new records.

---

### Task 1: Backend Domain Models, Migration, and Schemas

**Files:**
- Create: `services/library/app/models/guides.py`
- Modify: `services/library/app/models/__init__.py`
- Create: `services/library/app/schemas/guides.py`
- Modify: `services/library/app/schemas/__init__.py`
- Create: `services/library/migrations/versions/20260622_0003_add_library_guides_workflows.py`
- Test: `services/library/tests/test_guides_schemas.py`

**Interfaces:**
- Produces model classes: `LibraryGuide`, `LibraryGuideSection`, `LibrarySpecialist`, `LibraryWorkflow`, `LibraryWorkflowStep`, `LibraryPolicyPage`.
- Produces schema classes: `LibraryGuideCreate`, `LibraryGuideUpdate`, `LibraryGuideOut`, `LibraryGuideSectionCreate`, `LibraryGuideSectionOut`, `LibrarySpecialistCreate`, `LibrarySpecialistOut`, `LibraryWorkflowCreate`, `LibraryWorkflowOut`, `LibraryPolicyPageCreate`, `LibraryPolicyPageOut`.

- [ ] **Step 1: Write failing schema tests**

Create `services/library/tests/test_guides_schemas.py`:

```python
import unittest
import uuid
from datetime import datetime, timezone

from app.schemas import (
    LibraryGuideCreate,
    LibraryGuideOut,
    LibrarySpecialistCreate,
    LibraryWorkflowCreate,
    LibraryPolicyPageCreate,
)


NOW = datetime(2026, 6, 22, 12, 0, tzinfo=timezone.utc)
LIBRARY_ID = uuid.UUID("00000000-0000-4000-8000-000000000101")
STAFF_ID = uuid.UUID("00000000-0000-4000-8000-000000000102")


class LibraryGuideSchemaTests(unittest.TestCase):
    def test_guide_create_accepts_subject_course_and_audience(self):
        guide = LibraryGuideCreate(
            library_id=LIBRARY_ID,
            title="Nursing Research Guide",
            slug="nursing-research",
            summary="Databases and research help for nursing.",
            guide_type="subject",
            subject="Nursing",
            course_code="NUR 301",
            audience="undergraduate",
            owner_staff_id=STAFF_ID,
        )

        self.assertEqual(guide.guide_type, "subject")
        self.assertEqual(guide.subject, "Nursing")
        self.assertTrue(guide.is_public)
        self.assertTrue(guide.is_active)

    def test_guide_rejects_unknown_type(self):
        with self.assertRaisesRegex(ValueError, "guide_type"):
            LibraryGuideCreate(title="Bad", slug="bad", guide_type="unknown")

    def test_specialist_create_maps_staff_to_subjects(self):
        specialist = LibrarySpecialistCreate(
            library_id=LIBRARY_ID,
            staff_id=STAFF_ID,
            subjects=["Nursing", "Public Health"],
            support_areas=["systematic_reviews", "citation_support"],
            booking_url="https://example.com/book",
        )

        self.assertIn("Nursing", specialist.subjects)
        self.assertIn("citation_support", specialist.support_areas)

    def test_workflow_create_accepts_remote_access_type(self):
        workflow = LibraryWorkflowCreate(
            library_id=LIBRARY_ID,
            workflow_type="remote_access",
            title="Off-campus access",
            slug="remote-access",
            summary="How to use databases away from campus.",
            audience="students",
        )

        self.assertEqual(workflow.workflow_type, "remote_access")

    def test_policy_page_create_accepts_privacy_type(self):
        policy = LibraryPolicyPageCreate(
            library_id=LIBRARY_ID,
            policy_type="privacy",
            title="Library Privacy",
            slug="privacy",
            content="Privacy guidance for library users.",
        )

        self.assertEqual(policy.policy_type, "privacy")

    def test_guide_out_serializes_sections_and_specialist_ids(self):
        guide = LibraryGuideOut.model_validate(
            {
                "id": uuid.UUID("00000000-0000-4000-8000-000000000103"),
                "library_id": LIBRARY_ID,
                "title": "Nursing Research Guide",
                "slug": "nursing-research",
                "summary": "Databases and research help for nursing.",
                "guide_type": "subject",
                "subject": "Nursing",
                "course_code": "NUR 301",
                "audience": "undergraduate",
                "owner_staff_id": STAFF_ID,
                "is_public": True,
                "is_active": True,
                "sort_order": 0,
                "created_at": NOW,
                "updated_at": NOW,
                "deleted_at": None,
                "sections": [],
                "specialists": [],
            }
        )

        self.assertEqual(guide.slug, "nursing-research")
        self.assertEqual(guide.sections, [])


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Verify tests fail**

Run:

```bash
docker compose exec -T library sh -lc 'cd /tmp/library-check && PYTHONPATH=/tmp/library-check:/common python -m unittest tests.test_guides_schemas'
```

Expected: import failure because schemas do not exist.

- [ ] **Step 3: Add models, schemas, and migration**

Implement:
- `LibraryGuide`: library_id nullable, title, slug, summary, guide_type, subject, course_code, audience, school_id, department_id, owner_staff_id, is_public, is_active, sort_order.
- `LibraryGuideSection`: guide_id, heading, content, section_type, resource_links JSON, file_ids JSON, sort_order, is_active.
- `LibrarySpecialist`: library_id nullable, staff_id, subjects JSON list, schools JSON list, departments JSON list, support_areas JSON list, booking_url, is_public, is_active, sort_order.
- `LibraryWorkflow`: library_id nullable, workflow_type, title, slug, summary, audience, is_public, is_active, sort_order.
- `LibraryWorkflowStep`: workflow_id, title, instructions, link_url, file_id, sort_order, is_active.
- `LibraryPolicyPage`: library_id nullable, policy_type, title, slug, content, related_regulation_id, file_id, is_public, status, sort_order.

- [ ] **Step 4: Run tests**

Run the same Docker copied-source test command after copying updated `app`, `tests`, and `migrations`.
Expected: `OK`.

---

### Task 2: Backend Services and Routes

**Files:**
- Create: `services/library/app/services/guides.py`
- Create: `services/library/app/routes/v1/guides.py`
- Modify: `services/library/app/routes/v1/__init__.py`
- Test: `services/library/tests/test_guides_services.py`

**Interfaces:**
- Produces service functions: `list_guides`, `get_guide_by_slug`, `list_specialists`, `list_workflows`, `get_workflow_by_slug`, `list_policy_pages`, `get_policy_page_by_slug`, create/update/delete variants.
- Produces routes:
  - `GET /api/v1/library/guides/`
  - `GET /api/v1/library/guides/{slug}`
  - `GET /api/v1/library/specialists/`
  - `GET /api/v1/library/workflows/`
  - `GET /api/v1/library/workflows/{slug}`
  - `GET /api/v1/library/policies/`
  - `GET /api/v1/library/policies/{slug}`

- [ ] **Step 1: Write failing service tests**

Create `services/library/tests/test_guides_services.py` with query-level tests:

```python
import unittest

from app.services import guides


class LibraryGuidesServiceTests(unittest.TestCase):
    def test_public_guides_query_requires_public_active_records(self):
        query = guides.public_guides_query()
        whereclause = str(query.whereclause)

        self.assertIn("library_guides.is_public", whereclause)
        self.assertIn("library_guides.is_active", whereclause)

    def test_public_workflows_query_requires_public_active_records(self):
        query = guides.public_workflows_query()
        whereclause = str(query.whereclause)

        self.assertIn("library_workflows.is_public", whereclause)
        self.assertIn("library_workflows.is_active", whereclause)

    def test_public_policy_pages_query_requires_public_published_records(self):
        query = guides.public_policy_pages_query()
        whereclause = str(query.whereclause)

        self.assertIn("library_policy_pages.is_public", whereclause)
        self.assertIn("library_policy_pages.status", whereclause)
```

- [ ] **Step 2: Verify tests fail**

Expected: `ImportError` for missing `app.services.guides`.

- [ ] **Step 3: Implement services and routes**

Use the existing auth-aware public/admin pattern:
- Anonymous users get public active records with public active parent branch.
- `library:write` users can list/manage internal records.
- Mutations call `invalidate_prefix("public")`.
- Public detail routes resolve by slug, not internal ID.

- [ ] **Step 4: Run tests and compile**

Run:

```bash
python3 -m compileall services/library/app services/library/tests services/library/migrations
```

Run targeted Docker copied-source tests.

---

### Task 3: Unified Search Upgrade

**Files:**
- Modify: `services/library/app/services/search.py`
- Modify: `services/library/app/routes/v1/search.py` if result type list needs expansion.
- Modify: `services/library/app/schemas/search.py`
- Test: `services/library/tests/test_library_search_contract.py`

**Interfaces:**
- Search `types` supports: `branch,catalog,database,download,external_link,regulation,service,staff,guide,specialist,workflow,policy,news,event,article`.
- Result URLs map to public pages: `/guides/[slug]`, `/specialists`, `/borrowing`, `/remote-access`, `/repository`, `/digital-scholarship`, `/policies/[slug]`.

- [ ] **Step 1: Write failing search contract test**

Create a query helper test asserting supported type constants include the new types.

- [ ] **Step 2: Implement new search branches**

Search:
- guide title, summary, subject, course_code, audience.
- specialist subjects and support_areas.
- workflow title, summary, workflow_type.
- policy title, content, policy_type.

- [ ] **Step 3: Preserve existing search behavior**

Run existing search tests plus new search test.

---

### Task 4: API Client Types and Helpers

**Files:**
- Modify: `frontend/packages/api-client/src/library/index.ts`

**Interfaces:**
- Add TS interfaces matching backend schemas.
- Add `libraryServiceApi.guides`, `specialists`, `workflows`, and `policies` CRUD helpers.

- [ ] **Step 1: Add compile-time usage in API client types**

Add interfaces and ensure list/get/create/update/delete signatures match current `crudApi` style.

- [ ] **Step 2: Run typecheck**

Run:

```bash
pnpm --filter @ksu/api-client typecheck
```

Expected: pass.

---

### Task 5: Public Server Data Helpers

**Files:**
- Modify: `frontend/apps/library/src/lib/library-public-data.ts`

**Interfaces:**
- Add `getLibraryGuidesData`, `getLibraryGuideDetail`, `getLibrarySpecialistsData`, `getLibraryWorkflowDetail`, `getLibraryPoliciesData`, `getLibraryPolicyDetail`.
- Extend `getLibrarySearchData` to request unified grouped results.

- [ ] **Step 1: Implement server-only data helpers**

Use `safeList`, `safeRecord`, field filters, and normalized public error messages.

- [ ] **Step 2: Run typecheck**

Run:

```bash
pnpm --filter @ksu/library typecheck
```

Expected: pass.

---

### Task 6: Public Pages by Cluster

**Files:**
- Create: `frontend/apps/library/src/app/guides/page.tsx`
- Create: `frontend/apps/library/src/app/guides/[slug]/page.tsx`
- Create: `frontend/apps/library/src/app/specialists/page.tsx`
- Create: `frontend/apps/library/src/app/borrowing/page.tsx`
- Create: `frontend/apps/library/src/app/remote-access/page.tsx`
- Modify: `frontend/apps/library/src/app/repositories/page.tsx`
- Create: `frontend/apps/library/src/app/digital-scholarship/page.tsx`
- Create: `frontend/apps/library/src/app/policies/page.tsx`
- Create: `frontend/apps/library/src/app/policies/[slug]/page.tsx`
- Modify: `frontend/apps/library/src/app/search/page.tsx`
- Modify: `frontend/apps/library/src/components/library-header.tsx`

**Interfaces:**
- Public pages use server components and helpers from Task 5.
- New pages use existing `LibraryHero`, `LibraryContentBand`, `LibrarySectionHeading`, `CompactRecord`, `SidePanel`, `StatusMessage`.

- [ ] **Step 1: Implement guides and specialists pages**

Add list/detail pages with filters by subject, course, audience, and support area.

- [ ] **Step 2: Implement workflow pages**

Map:
- `/borrowing` to workflow type `borrowing_access`.
- `/remote-access` to workflow type `remote_access`.
- `/repositories` to workflow type `repository_deposit`.
- `/digital-scholarship` to workflow type `digital_scholarship`.

- [ ] **Step 3: Implement policies pages**

Map policy types: `accessibility`, `copyright`, `privacy`, `acceptable_use`, `conduct`.

- [ ] **Step 4: Upgrade search page**

Render grouped result sections for catalog, e-resources, guides, specialists, workflows, policies, and editorial content.

- [ ] **Step 5: Run library checks**

Run:

```bash
pnpm --filter @ksu/library lint
pnpm --filter @ksu/library typecheck
```

Expected: pass.

---

### Task 7: Admin Management Pages

**Files:**
- Modify: `frontend/apps/admin/src/lib/portals/registry.ts`
- Create or modify admin library pages under `frontend/apps/admin/src/app/(protected)/library`.

**Interfaces:**
- Admin can CRUD guides, sections, specialists, workflows, workflow steps, and policies.
- Relationship pickers can select branch, staff, regulation, file/media, and guide/workflow parent records.

- [ ] **Step 1: Add registry modules**

Create admin metadata for:
- Library Guides
- Guide Sections
- Specialists
- Workflows
- Workflow Steps
- Policy Pages

- [ ] **Step 2: Add list filters**

Filters:
- guide_type, subject, audience, is_public, is_active.
- workflow_type, audience, is_public, is_active.
- policy_type, status, is_public.

- [ ] **Step 3: Run admin checks**

Run:

```bash
pnpm --filter @ksu/admin lint
pnpm --filter @ksu/admin typecheck
```

Expected: pass.

---

### Task 8: End-to-End Verification and Commit

**Files:**
- All files from Tasks 1-7.

- [ ] **Step 1: Run backend syntax and copied-container tests**

Run:

```bash
python3 -m compileall services/library/app services/library/tests services/library/migrations
docker compose exec -T library rm -rf /tmp/library-check
docker compose exec -T library mkdir -p /tmp/library-check
docker compose cp services/library/app library:/tmp/library-check/app
docker compose cp services/library/tests library:/tmp/library-check/tests
docker compose cp services/library/migrations library:/tmp/library-check/migrations
docker compose exec -T library sh -lc 'cd /tmp/library-check && PYTHONPATH=/tmp/library-check:/common python -m unittest discover tests'
```

- [ ] **Step 2: Run frontend checks**

Run:

```bash
pnpm --filter @ksu/api-client typecheck
pnpm --filter @ksu/library lint
pnpm --filter @ksu/library typecheck
pnpm --filter @ksu/admin lint
pnpm --filter @ksu/admin typecheck
```

- [ ] **Step 3: Commit with project helper**

Run:

```bash
scripts/commit-changes.sh -m "Add library discovery guides and workflows" --run-checks -- services/library frontend/packages/api-client/src/library/index.ts frontend/apps/library/src frontend/apps/admin/src
```

---

## Self-Review

- Spec coverage: unified discovery, guides, specialists, borrowing, remote access, repository workflow, digital scholarship, and policies each has a task.
- Placeholder scan: no TBD/TODO placeholders remain.
- Type consistency: backend model/schema names match API client and frontend helper names.
