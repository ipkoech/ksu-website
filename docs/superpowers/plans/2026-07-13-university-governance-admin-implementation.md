# University Governance Administration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a backend-driven University Governance administration module for the University Council, including configurable roles, Council page content, workflow-managed appointments, drag-and-drop order, public listing/profile APIs, seamless admin pages, and public rendering with no hard-coded Council member data.

**Architecture:** Reuse `Person`, `Board`, and `StaffAssignment` as the core identity/body/appointment records. Add small governance-specific models and service methods around those records, then expose a focused admin/public API contract consumed by new admin workspace screens and the public University Council pages.

**Tech Stack:** FastAPI, SQLAlchemy, Alembic, Pydantic, pytest/unittest, Next.js App Router, React, TanStack Query, TypeScript, existing `@ksu/ui` components, existing admin portal/resource patterns.

## Global Constraints

- Do not replace existing `Person`, `Board`, or `StaffAssignment` models.
- Do not hard-code Council names, roles, portraits, categories, or ordering in the public frontend.
- Public endpoints return only approved and published Council content.
- Unpublish remains an admin action.
- Drag-and-drop saves exact official order through backend fields, not alphabetical/date/id/category sorting.
- Relationship selectors and admin displays must avoid raw UUID presentation.
- Public cards must be fully clickable, keyboard accessible, and responsive.
- Existing Kisii University theme and fonts must be preserved.
- Use `apply_patch` for manual file edits.
- Use the project commit helper after each reviewed task: `scripts/commit-changes.sh -m "<message>" --run-checks -- <paths>`, unless a docs path is ignored and must be force-staged first.

---

## File Structure

Backend schema and data:

- Modify `services/main/app/models/governance.py`: add `GovernanceRole` and `GovernancePageContent`.
- Modify `services/main/app/models/staff.py`: add governance appointment/workflow fields to `StaffAssignment`.
- Modify `services/main/app/models/__init__.py`: export new governance models.
- Create `services/main/migrations/versions/20260713_0021_add_governance_admin.py`: add new tables and assignment columns.
- Modify `services/main/app/schemas/governance.py`: add role, page content, member detail, dashboard, order, workflow, public listing, and public profile schemas.
- Modify `services/main/app/security/scopes.py`: add governance role/member/order/review/publish scopes if missing.
- Modify `services/main/app/seeders/seed_rbac.py`: seed new scopes into admin/cocms/governance-capable roles.
- Modify `services/main/app/seeders/seed_governance.py`: seed initial governance roles and Council page content.

Backend services and APIs:

- Modify `services/main/app/services/governance.py`: add governance admin dashboard, role CRUD, page content, member list/detail, order validation, workflow, and public response builders.
- Modify `services/main/app/api/v1/governance.py`: add admin endpoints under `/governance/admin/...` and public endpoints under existing router.
- Modify `services/main/app/api/v1/__init__.py`: only if public routing requires separate aliases.
- Modify `services/main/app/services/stats.py`: include governance workflow counts in CoCMS/admin stats if needed.
- Test `services/main/tests/test_university_governance_admin.py`: focused backend service/API contract tests.

Admin frontend:

- Modify `frontend/apps/admin/src/lib/api/organization.ts`: add governance admin TypeScript types and API methods.
- Create `frontend/apps/admin/src/app/(protected)/governance/university-council/page.tsx`: Council workspace entry page.
- Create `frontend/apps/admin/src/app/(protected)/governance/university-council/_components/council-dashboard.tsx`: seamless dashboard/client shell.
- Create `frontend/apps/admin/src/app/(protected)/governance/university-council/_components/council-member-editor.tsx`: guided member editor.
- Create `frontend/apps/admin/src/app/(protected)/governance/university-council/_components/council-order-manager.tsx`: accessible drag/drop and keyboard reorder UI.
- Create `frontend/apps/admin/src/app/(protected)/governance/university-council/_components/council-page-content-editor.tsx`: hero/mandate editor.
- Create `frontend/apps/admin/src/app/(protected)/governance/university-council/_components/council-preview.tsx`: admin public-card preview.
- Modify `frontend/apps/admin/src/lib/portals/registry.ts`: add University Council panel/link/stats and hide raw generic surfaces behind clearer labels.
- Test `frontend/apps/admin/src/app/(protected)/governance/university-council/university-council-admin-contract.test.mjs`: static contract tests for routes/API usage/accessibility labels.

Public frontend:

- Modify `frontend/apps/web/src/lib/about-data.ts`: add `getUniversityCouncilPage` and `getUniversityCouncilProfile`.
- Create `frontend/apps/web/src/app/about/university-council/page.tsx`: backend-driven public Council page.
- Create `frontend/apps/web/src/app/about/university-council/[slug]/page.tsx`: profile page.
- Create `frontend/apps/web/src/components/about/UniversityCouncilPage.tsx`: public page renderer.
- Create `frontend/apps/web/src/components/about/UniversityCouncilCard.tsx`: clickable accessible member card.
- Modify `frontend/apps/web/src/app/about/governance/page.tsx`: link to or delegate Council-specific display where appropriate.
- Test `frontend/apps/web/src/app/about/university-council-backend-contract.test.mjs`: static/rendering contract tests.

Verification:

- Run backend targeted tests from `services/main`.
- Run frontend lint/typecheck from root through project helper.
- Run the admin and web contract tests directly with Node where applicable.

---

### Task 1: Backend Governance Schema, Migration, Permissions, And Seed Data

**Files:**
- Modify: `services/main/app/models/governance.py`
- Modify: `services/main/app/models/staff.py`
- Modify: `services/main/app/models/__init__.py`
- Modify: `services/main/app/schemas/governance.py`
- Modify: `services/main/app/security/scopes.py`
- Modify: `services/main/app/seeders/seed_rbac.py`
- Modify: `services/main/app/seeders/seed_governance.py`
- Create: `services/main/migrations/versions/20260713_0021_add_governance_admin.py`
- Test: `services/main/tests/test_university_governance_admin.py`

**Interfaces:**
- Produces SQLAlchemy models: `GovernanceRole`, `GovernancePageContent`.
- Produces `StaffAssignment` attributes: `governance_role_id`, `appointment_category`, `official_designation`, `public_role_label`, `represented_institution`, `current_office`, `appointing_authority`, `appointment_reference`, `term_number`, `is_ex_officio`, `is_voting_member`, `show_contact_publicly`, `profile_slug`, `profile_summary`, `appointment_status`, `workflow_status`, `submitted_by_id`, `approved_by_id`, `published_by_id`, `submitted_at`, `approved_at`, `published_at`, `unpublished_at`, `archived_at`, `publish_without_portrait_override`, `publication_notes`.
- Produces schemas later tasks consume: `GovernanceRoleCreate`, `GovernanceRoleUpdate`, `GovernanceRoleRead`, `GovernancePageContentUpdate`, `GovernancePageContentRead`, `CouncilMemberCreate`, `CouncilMemberUpdate`, `CouncilMemberRead`, `CouncilOrderUpdate`, `CouncilDashboardRead`.

- [ ] **Step 1: Write failing schema/model contract tests**

Add `services/main/tests/test_university_governance_admin.py` with these tests:

```python
import unittest
import uuid

from sqlalchemy.dialects import postgresql

from app.models import GovernancePageContent, GovernanceRole, StaffAssignment
from app.schemas import CouncilMemberCreate, CouncilOrderUpdate, GovernanceRoleCreate


class UniversityGovernanceAdminSchemaTests(unittest.TestCase):
    def test_governance_role_model_has_configurable_public_grouping_fields(self):
        columns = GovernanceRole.__table__.columns

        for name in (
            "name",
            "slug",
            "category",
            "display_group",
            "public_label",
            "default_hierarchy_level",
            "default_display_order",
            "badge_style",
            "is_active",
        ):
            self.assertIn(name, columns)

    def test_governance_page_content_model_has_hero_and_mandate_fields(self):
        columns = GovernancePageContent.__table__.columns

        for name in (
            "board_id",
            "page_key",
            "title",
            "intro",
            "hero_image_id",
            "hero_focal_point",
            "overlay_intensity",
            "mandate_label",
            "mandate_heading",
            "mandate_body",
            "document_cta_label",
            "document_cta_url",
            "workflow_status",
            "published_at",
        ):
            self.assertIn(name, columns)

    def test_staff_assignment_has_governance_appointment_fields(self):
        columns = StaffAssignment.__table__.columns

        for name in (
            "governance_role_id",
            "appointment_category",
            "official_designation",
            "public_role_label",
            "represented_institution",
            "appointing_authority",
            "term_number",
            "is_ex_officio",
            "is_voting_member",
            "profile_slug",
            "appointment_status",
            "workflow_status",
            "published_at",
            "publish_without_portrait_override",
        ):
            self.assertIn(name, columns)

    def test_council_member_schema_accepts_governance_metadata(self):
        payload = CouncilMemberCreate(
            person_id=uuid.uuid4(),
            governance_role_id=uuid.uuid4(),
            public_role_label="Government Representative",
            appointment_category="government_representative",
            profile_slug="hon-mary-mokua",
            display_order=20,
        )

        self.assertEqual("Government Representative", payload.public_role_label)
        self.assertEqual("government_representative", payload.appointment_category)

    def test_council_order_update_requires_nodes(self):
        order = CouncilOrderUpdate(
            nodes=[
                {
                    "assignment_id": uuid.uuid4(),
                    "display_group": "chairperson",
                    "display_order": 1,
                    "hierarchy_level": 1,
                    "reports_to_id": None,
                }
            ]
        )

        self.assertEqual(1, len(order.nodes))

    def test_governance_role_slug_is_schema_validated(self):
        role = GovernanceRoleCreate(
            name="Government Representative",
            slug="government-representative",
            category="representative",
            display_group="member",
            public_label="Government Representative",
        )

        self.assertEqual("government-representative", role.slug)

    def test_governance_migration_adds_unique_profile_slug_index_name(self):
        indexes = {index.name for index in StaffAssignment.__table__.indexes}

        self.assertIn("uq_staff_assignments_governance_profile_slug", indexes)

    def test_governance_role_table_compiles_for_postgres(self):
        statement = GovernanceRole.__table__.select()

        compiled = str(statement.compile(dialect=postgresql.dialect())).lower()

        self.assertIn("governance_roles", compiled)


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run the new tests to confirm failure**

Run:

```bash
cd services/main
pytest tests/test_university_governance_admin.py -q
```

Expected: failure because `GovernanceRole`, `GovernancePageContent`, and the new governance schemas/fields are not implemented.

- [ ] **Step 3: Add backend model fields**

Implement:

- `GovernanceRole` and `GovernancePageContent` in `services/main/app/models/governance.py`.
- Direct governance appointment fields on `StaffAssignment` in `services/main/app/models/staff.py`.
- Relationships:
  - `StaffAssignment.governance_role -> GovernanceRole`
  - `GovernancePageContent.board -> Board`
  - `GovernancePageContent.hero_image -> Media`
- Indexes:
  - `ix_governance_roles_group_order` on `display_group`, `default_display_order`
  - `uq_governance_page_content_board_page` on `board_id`, `page_key`
  - partial unique index `uq_staff_assignments_governance_profile_slug` for non-null `profile_slug` where `deleted_at IS NULL`
  - `ix_staff_assignments_governance_workflow` on `entity_type`, `entity_id`, `workflow_status`

Export `GovernanceRole` and `GovernancePageContent` from `services/main/app/models/__init__.py`.

- [ ] **Step 4: Add Alembic migration**

Create `services/main/migrations/versions/20260713_0021_add_governance_admin.py`.

Use `down_revision = "20260712_0020"` unless `alembic heads` shows a newer single head. The migration must:

- create `governance_roles`;
- create `governance_page_content`;
- add the StaffAssignment governance columns;
- add indexes and constraints listed in Step 3;
- drop them in reverse order in `downgrade`.

- [ ] **Step 5: Add Pydantic schemas**

In `services/main/app/schemas/governance.py`, add the schemas named in the Interfaces section. Use `BaseSchema`, `BaseReadSchema`, `SlugStr`, `Field`, `uuid.UUID`, `datetime`, `date`, and `Any` consistently with existing schemas.

Validation rules:

- `display_group`: max length 32, one of `chairperson`, `member`, `secretary`.
- `profile_slug`: `SlugStr | None`.
- `public_role_label`: required for `CouncilMemberCreate`.
- `display_order`: integer default `100`.
- `workflow_status`: default `draft`.
- `CouncilOrderNode.display_group`: one of `chairperson`, `member`, `secretary`.
- `CouncilOrderUpdate.nodes`: non-empty list.

Export the schemas from `services/main/app/schemas/__init__.py`.

- [ ] **Step 6: Add permissions and seed data**

Add or seed these scopes:

- `governance.manage_roles`
- `governance.manage_members`
- `governance.manage_order`
- `governance.review`
- `governance.approve`
- `governance.publish`
- `governance.archive`

Seed initial `GovernanceRole` records:

- Chairperson: `display_group="chairperson"`, `default_hierarchy_level=1`, `default_display_order=1`
- Council Member: `display_group="member"`, `default_hierarchy_level=2`, `default_display_order=10`
- Government Representative: `display_group="member"`, `default_hierarchy_level=2`, `default_display_order=20`
- Senate Representative: `display_group="member"`, `default_hierarchy_level=2`, `default_display_order=30`
- Student Representative: `display_group="member"`, `default_hierarchy_level=2`, `default_display_order=40`
- Industry Representative: `display_group="member"`, `default_hierarchy_level=2`, `default_display_order=50`
- External Representative: `display_group="member"`, `default_hierarchy_level=2`, `default_display_order=60`
- Secretary to Council: `display_group="secretary"`, `default_hierarchy_level=3`, `default_display_order=1000`

Seed default `GovernancePageContent` for board slug `university-council` when that board exists.

- [ ] **Step 7: Run backend schema tests**

Run:

```bash
cd services/main
pytest tests/test_university_governance_admin.py -q
```

Expected: all tests in this file pass.

- [ ] **Step 8: Commit**

Run from repo root:

```bash
scripts/commit-changes.sh -m "Add governance administration schema" --run-checks -- services/main/app/models/governance.py services/main/app/models/staff.py services/main/app/models/__init__.py services/main/app/schemas/governance.py services/main/app/schemas/__init__.py services/main/app/security/scopes.py services/main/app/seeders/seed_rbac.py services/main/app/seeders/seed_governance.py services/main/migrations/versions/20260713_0021_add_governance_admin.py services/main/tests/test_university_governance_admin.py
```

---

### Task 2: Backend Governance Admin/Public Services And Routes

**Files:**
- Modify: `services/main/app/services/governance.py`
- Modify: `services/main/app/services/__init__.py`
- Modify: `services/main/app/api/v1/governance.py`
- Modify: `services/main/app/services/stats.py`
- Modify: `services/main/tests/test_university_governance_admin.py`

**Interfaces:**
- Consumes Task 1 models and schemas.
- Produces service methods:
  - `GovernanceService.get_university_council_board(db)`
  - `GovernanceService.council_dashboard(db)`
  - `GovernanceService.list_governance_roles(db, active_only=True)`
  - `GovernanceService.upsert_council_page_content(db, board_id, data, user_id)`
  - `GovernanceService.list_council_members(db, public_only=False, workflow_status=None)`
  - `GovernanceService.get_council_member(db, assignment_id)`
  - `GovernanceService.create_council_member(db, data, user_id)`
  - `GovernanceService.update_council_member(db, assignment, data, user_id)`
  - `GovernanceService.update_council_order(db, nodes, user_id)`
  - `GovernanceService.transition_council_member(db, assignment, action, user_id, comment=None)`
  - `GovernanceService.public_university_council(db)`
  - `GovernanceService.public_university_council_profile(db, slug)`
- Produces API endpoints listed in the approved spec.

- [ ] **Step 1: Extend tests for service behavior**

Append tests to `services/main/tests/test_university_governance_admin.py`:

```python
from datetime import datetime, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from app.api.v1 import governance as governance_api
from app.services.governance import GovernanceService


class UniversityGovernanceAdminServiceTests(unittest.IsolatedAsyncioTestCase):
    async def test_public_council_groups_members_by_display_group_in_order(self):
        board = SimpleNamespace(
            id=uuid.uuid4(),
            name="University Council",
            slug="university-council",
            description="Council description",
        )
        page = SimpleNamespace(
            title="University Council",
            intro="Council intro",
            mandate_label="Our Mandate",
            mandate_heading="Our Mandate",
            mandate_body="Council mandate text",
            document_cta_label="Council Charter",
            document_cta_url="/about/governance/documents",
            hero_image=None,
        )
        role_chair = SimpleNamespace(display_group="chairperson", public_label="Chairperson", badge_style="green")
        role_member = SimpleNamespace(display_group="member", public_label="Government Representative", badge_style="blue")
        role_secretary = SimpleNamespace(display_group="secretary", public_label="Secretary to Council", badge_style="gray")

        def member(name, role, order):
            return SimpleNamespace(
                id=uuid.uuid4(),
                person=SimpleNamespace(display_name=name, photo_url=None, photo=None),
                governance_role=role,
                public_role_label=role.public_label,
                role=role.public_label.lower().replace(" ", "_"),
                title=None,
                profile_slug=name.lower().replace(" ", "-"),
                profile_summary=None,
                display_order=order,
                hierarchy_level=1 if role.display_group == "chairperson" else 3 if role.display_group == "secretary" else 2,
                published_at=datetime.now(timezone.utc),
                is_acting=False,
            )

        with (
            patch.object(GovernanceService, "get_university_council_board", return_value=board),
            patch.object(GovernanceService, "get_council_page_content", return_value=page),
            patch.object(
                GovernanceService,
                "list_council_members",
                return_value=[
                    member("Prof Chair", role_chair, 1),
                    member("Hon Member", role_member, 20),
                    member("Mr Secretary", role_secretary, 1000),
                ],
            ),
        ):
            data = await GovernanceService.public_university_council(object())

        self.assertEqual("Prof Chair", data["chairperson"]["name"])
        self.assertEqual("Hon Member", data["members"][0]["name"])
        self.assertEqual("Mr Secretary", data["secretary"]["name"])

    async def test_order_update_rejects_duplicate_group_order(self):
        duplicate_id = uuid.uuid4()
        nodes = [
            {"assignment_id": uuid.uuid4(), "display_group": "member", "display_order": 10, "hierarchy_level": 2, "reports_to_id": None},
            {"assignment_id": duplicate_id, "display_group": "member", "display_order": 10, "hierarchy_level": 2, "reports_to_id": None},
        ]

        with self.assertRaisesRegex(ValueError, "Duplicate display order"):
            await GovernanceService.validate_council_order_nodes(nodes, assignments_by_id={})

    async def test_workflow_publish_requires_approved_status(self):
        assignment = SimpleNamespace(workflow_status="draft", appointment_status="draft")

        with self.assertRaisesRegex(ValueError, "Invalid workflow transition"):
            await GovernanceService.transition_council_member(object(), assignment, "publish", uuid.uuid4())

    async def test_workflow_submit_approve_publish_unpublish_sequence(self):
        user_id = uuid.uuid4()
        assignment = SimpleNamespace(
            workflow_status="draft",
            appointment_status="draft",
            submitted_by_id=None,
            submitted_at=None,
            approved_by_id=None,
            approved_at=None,
            published_by_id=None,
            published_at=None,
            unpublished_at=None,
        )

        await GovernanceService.transition_council_member(object(), assignment, "submit-review", user_id)
        self.assertEqual("submitted", assignment.workflow_status)

        await GovernanceService.transition_council_member(object(), assignment, "approve", user_id)
        self.assertEqual("approved", assignment.workflow_status)

        await GovernanceService.transition_council_member(object(), assignment, "publish", user_id)
        self.assertEqual("published", assignment.workflow_status)
        self.assertEqual("published", assignment.appointment_status)

        await GovernanceService.transition_council_member(object(), assignment, "unpublish", user_id)
        self.assertEqual("approved", assignment.workflow_status)
```

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
cd services/main
pytest tests/test_university_governance_admin.py -q
```

Expected: new service tests fail because service methods do not exist yet.

- [ ] **Step 3: Implement service methods**

In `services/main/app/services/governance.py`:

- Add imports for `datetime`, `timezone`, `func`, and new models.
- Add `_COUNCIL_SLUG = "university-council"`.
- Add helper `_role_group(assignment)` returning `assignment.governance_role.display_group` or a role-name fallback:
  - roles containing `chair` -> `chairperson`
  - roles containing `secretary` -> `secretary`
  - all others -> `member`
- Add helper `_member_card(assignment)` returning:
  - `id`, `name`, `role`, `slug`, `portrait`, `display_order`, `is_acting`, `profile_summary`
- Add dashboard counts with SQL aggregate queries against `StaffAssignment` scoped to the Council board.
- Add role CRUD/listing methods.
- Add page content get/upsert methods.
- Add member list/detail/create/update methods.
- Add `validate_council_order_nodes` as a static method for duplicate order, same-board presence, and reporting cycle checks.
- Add `update_council_order` to apply `display_order`, `hierarchy_level`, and `reports_to_id` in one transaction.
- Add workflow transition method:
  - `submit-review`: `draft` -> `submitted`
  - `approve`: `submitted` -> `approved`
  - `publish`: `approved` -> `published`
  - `unpublish`: `published` -> `approved`
  - `archive`: any non-published state -> `archived`
  - reject invalid transitions with `ValueError("Invalid workflow transition")`
- Add public listing/profile builders returning the contract in the spec.

- [ ] **Step 4: Implement API endpoints**

In `services/main/app/api/v1/governance.py`, add endpoints:

- `GET /governance/admin/council/dashboard`
- `GET /governance/admin/roles`
- `POST /governance/admin/roles`
- `PATCH /governance/admin/roles/{role_id}`
- `GET /governance/admin/council/members`
- `POST /governance/admin/council/members`
- `GET /governance/admin/council/members/{assignment_id}`
- `PATCH /governance/admin/council/members/{assignment_id}`
- `DELETE /governance/admin/council/members/{assignment_id}`
- `GET /governance/admin/council/order`
- `PUT /governance/admin/council/order`
- `GET /governance/admin/council/page-content`
- `PATCH /governance/admin/council/page-content`
- `GET /governance/admin/council/preview`
- `POST /governance/admin/council/members/{assignment_id}/submit-review`
- `POST /governance/admin/council/members/{assignment_id}/approve`
- `POST /governance/admin/council/members/{assignment_id}/publish`
- `POST /governance/admin/council/members/{assignment_id}/unpublish`
- `POST /governance/admin/council/members/{assignment_id}/archive`
- `GET /governance/admin/council/audit-log`
- `GET /governance/public/university-council`
- `GET /governance/public/university-council/{slug}`

Use `require_scope`:

- dashboard/list/preview: `governance.view`
- roles: `governance.manage_roles`
- members create/update/delete: `governance.manage_members`
- order: `governance.manage_order`
- submit: `governance.manage_members`
- approve: `governance.approve`
- publish/unpublish: `governance.publish`
- archive: `governance.archive`

- [ ] **Step 5: Add stats integration**

In `services/main/app/services/stats.py`, include Council draft/submitted/published counts under admin/governance-compatible stats if a relevant contract already exists. Keep existing stat keys stable. Add new keys only if the admin portal registry will consume them in Task 3.

- [ ] **Step 6: Run backend tests**

Run:

```bash
cd services/main
pytest tests/test_university_governance_admin.py tests/test_governance_hierarchy.py tests/test_portal_stats.py -q
```

Expected: all selected tests pass.

- [ ] **Step 7: Commit**

Run:

```bash
scripts/commit-changes.sh -m "Add governance administration APIs" --run-checks -- services/main/app/services/governance.py services/main/app/services/__init__.py services/main/app/api/v1/governance.py services/main/app/services/stats.py services/main/tests/test_university_governance_admin.py
```

---

### Task 3: Admin Governance API Client And University Council Workspace Shell

**Files:**
- Modify: `frontend/apps/admin/src/lib/api/organization.ts`
- Modify: `frontend/apps/admin/src/lib/portals/registry.ts`
- Create: `frontend/apps/admin/src/app/(protected)/governance/university-council/page.tsx`
- Create: `frontend/apps/admin/src/app/(protected)/governance/university-council/_components/council-dashboard.tsx`
- Test: `frontend/apps/admin/src/app/(protected)/governance/university-council/university-council-admin-contract.test.mjs`

**Interfaces:**
- Consumes Task 2 endpoints.
- Produces `governanceAdminApi` methods:
  - `dashboard()`
  - `listRoles()`
  - `createRole(data)`
  - `updateRole(id, data)`
  - `listCouncilMembers(params?)`
  - `createCouncilMember(data)`
  - `getCouncilMember(id)`
  - `updateCouncilMember(id, data)`
  - `deleteCouncilMember(id)`
  - `getCouncilOrder()`
  - `updateCouncilOrder(data)`
  - `getCouncilPageContent()`
  - `updateCouncilPageContent(data)`
  - `previewCouncil()`
  - `transitionCouncilMember(id, action, data?)`

- [ ] **Step 1: Write failing admin static contract test**

Create `frontend/apps/admin/src/app/(protected)/governance/university-council/university-council-admin-contract.test.mjs`:

```javascript
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

test("governance admin api exposes council workspace endpoints", () => {
  const source = read("src/lib/api/organization.ts");

  for (const fragment of [
    "governanceAdminApi",
    "/governance/admin/council/dashboard",
    "/governance/admin/council/members",
    "/governance/admin/council/order",
    "/governance/admin/council/page-content",
    "/governance/admin/council/preview",
  ]) {
    assert.match(source, new RegExp(fragment.replaceAll("/", "\\/")));
  }
});

test("university council workspace route renders seamless primary actions", () => {
  const source = read("src/app/(protected)/governance/university-council/_components/council-dashboard.tsx");

  for (const label of [
    "Add Council Member",
    "Manage Display Order",
    "Preview Public Page",
    "Publish Changes",
    "View Archived Members",
  ]) {
    assert.match(source, new RegExp(label));
  }

  assert.doesNotMatch(source, /raw uuid/i);
});

test("portal registry links to university council workspace", () => {
  const source = read("src/lib/portals/registry.ts");

  assert.match(source, /University Council/);
  assert.match(source, /\/governance\/university-council/);
});
```

- [ ] **Step 2: Run test and confirm failure**

Run:

```bash
cd frontend/apps/admin
node --test "src/app/(protected)/governance/university-council/university-council-admin-contract.test.mjs"
```

Expected: failure because files/API methods do not exist.

- [ ] **Step 3: Add admin API methods and types**

In `frontend/apps/admin/src/lib/api/organization.ts`, add:

- `GovernanceRole`
- `CouncilDashboard`
- `CouncilMember`
- `CouncilPageContent`
- `CouncilOrderNode`
- `CouncilPublicPreview`
- `governanceAdminApi`

Use existing `api.get`, `api.post`, `api.patch`, `api.put`, `api.delete` style.

- [ ] **Step 4: Add workspace route**

Create `frontend/apps/admin/src/app/(protected)/governance/university-council/page.tsx`:

```tsx
import { CouncilDashboard } from "./_components/council-dashboard";

export default function UniversityCouncilPage() {
  return <CouncilDashboard />;
}
```

- [ ] **Step 5: Implement dashboard shell**

Create `council-dashboard.tsx` as a client component that:

- uses `useQuery` for `governanceAdminApi.dashboard`;
- displays stats with labels from the spec;
- shows clear primary actions;
- includes tabs or segmented controls for `Members`, `Order`, `Page Content`, `Preview`, `Archive`;
- lazy-renders placeholder panels with clear empty/loading/error states for Task 4 components to replace.

Do not use nested cards for every item; use a calm admin workspace layout with a top summary strip, an action bar, and section panels.

- [ ] **Step 6: Add portal registry link**

Modify `frontend/apps/admin/src/lib/portals/registry.ts`:

- Add dashboard panel `University Council` pointing to `/governance/university-council`.
- Add description: `Manage Council members, page content, official order, preview, and publication workflow.`
- Keep existing generic `boards` and `staff-assignments` resources available but position the Council workspace as the preferred path.

- [ ] **Step 7: Run admin contract test**

Run:

```bash
cd frontend/apps/admin
node --test "src/app/(protected)/governance/university-council/university-council-admin-contract.test.mjs"
```

Expected: pass.

- [ ] **Step 8: Commit**

Run:

```bash
scripts/commit-changes.sh -m "Add university council admin workspace shell" --run-checks -- frontend/apps/admin/src/lib/api/organization.ts frontend/apps/admin/src/lib/portals/registry.ts "frontend/apps/admin/src/app/(protected)/governance/university-council"
```

---

### Task 4: Seamless Admin Member Editor, Page Content Editor, Order Manager, And Preview

**Files:**
- Modify: `frontend/apps/admin/src/app/(protected)/governance/university-council/_components/council-dashboard.tsx`
- Create: `frontend/apps/admin/src/app/(protected)/governance/university-council/_components/council-member-editor.tsx`
- Create: `frontend/apps/admin/src/app/(protected)/governance/university-council/_components/council-order-manager.tsx`
- Create: `frontend/apps/admin/src/app/(protected)/governance/university-council/_components/council-page-content-editor.tsx`
- Create: `frontend/apps/admin/src/app/(protected)/governance/university-council/_components/council-preview.tsx`
- Modify: `frontend/apps/admin/src/app/(protected)/governance/university-council/university-council-admin-contract.test.mjs`

**Interfaces:**
- Consumes Task 3 `governanceAdminApi`.
- Produces reusable admin components imported by `CouncilDashboard`.

- [ ] **Step 1: Extend static contract test**

Append to `university-council-admin-contract.test.mjs`:

```javascript
test("member editor uses readable relationship and media controls", () => {
  const source = read("src/app/(protected)/governance/university-council/_components/council-member-editor.tsx");

  for (const fragment of [
    "PersonPicker",
    "MediaPicker",
    "Public role label",
    "Appointment category",
    "Represented institution",
    "Publish without approved portrait",
  ]) {
    assert.match(source, new RegExp(fragment));
  }
});

test("order manager persists explicit backend order and supports keyboard users", () => {
  const source = read("src/app/(protected)/governance/university-council/_components/council-order-manager.tsx");

  for (const fragment of [
    "updateCouncilOrder",
    "Move up",
    "Move down",
    "Chairperson",
    "Council Members",
    "Secretary to Council",
  ]) {
    assert.match(source, new RegExp(fragment));
  }
});

test("page content editor manages hero and mandate content", () => {
  const source = read("src/app/(protected)/governance/university-council/_components/council-page-content-editor.tsx");

  for (const fragment of [
    "Hero background image",
    "Overlay intensity",
    "Our Mandate",
    "Council Charter",
    "updateCouncilPageContent",
  ]) {
    assert.match(source, new RegExp(fragment));
  }
});

test("preview shows clickable public-style member cards", () => {
  const source = read("src/app/(protected)/governance/university-council/_components/council-preview.tsx");

  assert.match(source, /Preview Public Page/);
  assert.match(source, /View profile of/);
  assert.match(source, /chairperson/i);
  assert.match(source, /secretary/i);
});
```

- [ ] **Step 2: Run test and confirm failure**

Run:

```bash
cd frontend/apps/admin
node --test "src/app/(protected)/governance/university-council/university-council-admin-contract.test.mjs"
```

Expected: failure because detailed components do not exist.

- [ ] **Step 3: Implement member editor**

Create `council-member-editor.tsx`:

- Use `PersonPicker` for member selection.
- Use `MediaPicker` for portrait selection if the current media API supports image picking; otherwise expose `photo_id` selection through existing media picker component.
- Use `governanceAdminApi.listRoles`.
- Fields:
  - person
  - governance role
  - public role label
  - appointment category
  - official designation
  - represented institution
  - current office
  - appointing authority
  - appointment reference
  - profile slug
  - profile summary
  - start date
  - end date
  - term number
  - acting
  - ex-officio
  - voting member
  - show contact publicly
  - publish without approved portrait
- Submit through create/update API.
- Show public card preview.
- Show loading, save error, and validation messaging.

- [ ] **Step 4: Implement order manager**

Create `council-order-manager.tsx`:

- Load `governanceAdminApi.getCouncilOrder`.
- Render three independent groups:
  - Chairperson
  - Council Members
  - Secretary to Council
- Support mouse drag where simple to implement, plus reliable keyboard `Move up` and `Move down` buttons.
- Save by sending `{ nodes: [...] }` to `updateCouncilOrder`.
- Keep visible labels: person display name, public role label, status.
- Do not show raw UUIDs.

- [ ] **Step 5: Implement page content editor**

Create `council-page-content-editor.tsx`:

- Load and save `getCouncilPageContent`/`updateCouncilPageContent`.
- Fields:
  - title
  - intro
  - breadcrumb label
  - hero background image
  - image focal point
  - overlay intensity
  - mandate label
  - mandate heading
  - mandate body
  - document CTA label
  - document CTA URL
- Include preview strip for hero and mandate content.

- [ ] **Step 6: Implement preview**

Create `council-preview.tsx`:

- Load `governanceAdminApi.previewCouncil`.
- Render public-like cards:
  - Chairperson centered.
  - Members grid.
  - Secretary centered.
- Cards use `aria-label={`View profile of ${name}, ${role}`}`.
- Entire card is clickable in preview mode, using `href={`/about/university-council/${slug}`}`.

- [ ] **Step 7: Integrate components into dashboard**

Modify `council-dashboard.tsx`:

- Replace placeholders with the member list/editor, order manager, content editor, and preview.
- Add workflow action buttons for submit/approve/publish/unpublish/archive based on member `workflow_status`.
- Add refresh/invalidation after mutations.

- [ ] **Step 8: Run admin contract test and typecheck**

Run:

```bash
cd frontend/apps/admin
node --test "src/app/(protected)/governance/university-council/university-council-admin-contract.test.mjs"
cd ../../..
pnpm --dir frontend --filter @ksu/admin typecheck
```

Expected: tests pass and admin typecheck passes.

- [ ] **Step 9: Commit**

Run:

```bash
scripts/commit-changes.sh -m "Build university council admin workflow" --run-checks -- "frontend/apps/admin/src/app/(protected)/governance/university-council"
```

---

### Task 5: Public University Council Page And Profile Rendering

**Files:**
- Modify: `frontend/apps/web/src/lib/about-data.ts`
- Create: `frontend/apps/web/src/components/about/UniversityCouncilCard.tsx`
- Create: `frontend/apps/web/src/components/about/UniversityCouncilPage.tsx`
- Create: `frontend/apps/web/src/app/about/university-council/page.tsx`
- Create: `frontend/apps/web/src/app/about/university-council/[slug]/page.tsx`
- Modify: `frontend/apps/web/src/app/about/governance/page.tsx`
- Test: `frontend/apps/web/src/app/about/university-council-backend-contract.test.mjs`

**Interfaces:**
- Consumes Task 2 public endpoints through web API helper style.
- Produces public URL `/about/university-council`.
- Produces profile URL `/about/university-council/{slug}`.

- [ ] **Step 1: Write failing web contract test**

Create `frontend/apps/web/src/app/about/university-council-backend-contract.test.mjs`:

```javascript
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

test("about data fetches university council from backend public endpoint", () => {
  const source = read("src/lib/about-data.ts");

  assert.match(source, /getUniversityCouncilPage/);
  assert.match(source, /governance\/public\/university-council/);
  assert.match(source, /getUniversityCouncilProfile/);
});

test("public council page does not hard-code member names or portraits", () => {
  const source = read("src/components/about/UniversityCouncilPage.tsx");

  for (const forbidden of ["Prof. Jane", "Hon. Mary", "Nathan Oyori", "jane-onyango.webp"]) {
    assert.doesNotMatch(source, new RegExp(forbidden, "i"));
  }

  for (const required of ["chairperson", "members", "secretary", "aria-label"]) {
    assert.match(source, new RegExp(required));
  }
});

test("public council card is fully clickable and accessible", () => {
  const source = read("src/components/about/UniversityCouncilCard.tsx");

  assert.match(source, /href/);
  assert.match(source, /View profile of/);
  assert.match(source, /focus:/);
});

test("profile route consumes backend profile contract", () => {
  const source = read("src/app/about/university-council/[slug]/page.tsx");

  assert.match(source, /getUniversityCouncilProfile/);
  assert.match(source, /notFound/);
});
```

- [ ] **Step 2: Run test and confirm failure**

Run:

```bash
cd frontend/apps/web
node --test src/app/about/university-council-backend-contract.test.mjs
```

Expected: failure because public page files do not exist.

- [ ] **Step 3: Add web data functions**

Modify `frontend/apps/web/src/lib/about-data.ts`:

- Add TypeScript types for `UniversityCouncilPageData`, `UniversityCouncilMemberCard`, `UniversityCouncilProfileData`.
- Add `getUniversityCouncilPage()` fetching `/governance/public/university-council`.
- Add `getUniversityCouncilProfile(slug)` fetching `/governance/public/university-council/${slug}`.
- Follow existing response-envelope handling in this file.

- [ ] **Step 4: Implement public card**

Create `UniversityCouncilCard.tsx`:

- Props: `member`, optional `variant`.
- Entire card is a `Link`.
- Accessible label: `View profile of ${member.name}, ${member.role}`.
- Uses `PublicImage` or existing image helper.
- Shows portrait, name, role badge.
- Includes visible focus ring and hover elevation.

- [ ] **Step 5: Implement public page renderer**

Create `UniversityCouncilPage.tsx`:

- Render hero from `data.page`.
- Render mandate panel from `data.mandate`.
- Render chairperson centered when present.
- Render members in order as provided by backend.
- Render secretary centered when present.
- Include empty states for missing optional groups without showing development placeholders.
- Use spacious independent sections, not compressed multi-purpose cards.

- [ ] **Step 6: Add public routes**

Create:

- `frontend/apps/web/src/app/about/university-council/page.tsx`
- `frontend/apps/web/src/app/about/university-council/[slug]/page.tsx`

The listing page calls `getUniversityCouncilPage()` and renders `UniversityCouncilPage`.

The profile page calls `getUniversityCouncilProfile(params.slug)`, calls `notFound()` when absent, and renders only public fields.

- [ ] **Step 7: Link governance page**

Modify `frontend/apps/web/src/app/about/governance/page.tsx` to include a clear link to `/about/university-council` or delegate Council-specific section to the new route.

- [ ] **Step 8: Run web test and typecheck**

Run:

```bash
cd frontend/apps/web
node --test src/app/about/university-council-backend-contract.test.mjs
cd ../../..
pnpm --dir frontend --filter @ksu/web typecheck
```

Expected: contract test and web typecheck pass.

- [ ] **Step 9: Commit**

Run:

```bash
scripts/commit-changes.sh -m "Render backend-driven university council pages" --run-checks -- frontend/apps/web/src/lib/about-data.ts frontend/apps/web/src/components/about/UniversityCouncilCard.tsx frontend/apps/web/src/components/about/UniversityCouncilPage.tsx frontend/apps/web/src/app/about/university-council frontend/apps/web/src/app/about/governance/page.tsx frontend/apps/web/src/app/about/university-council-backend-contract.test.mjs
```

---

### Task 6: End-To-End Verification, Polish, And Launch Readiness Fixes

**Files:**
- Modify only files touched by Tasks 1-5 if verification finds defects.
- Test: all targeted tests listed below.

**Interfaces:**
- Consumes complete backend/admin/public implementation.
- Produces verified feature branch with clean targeted tests and committed fixes.

- [ ] **Step 1: Run backend targeted tests**

Run:

```bash
cd services/main
pytest tests/test_university_governance_admin.py tests/test_governance_hierarchy.py tests/test_portal_stats.py tests/test_auth_permissions.py -q
```

Expected: all selected tests pass.

- [ ] **Step 2: Run frontend contract tests**

Run:

```bash
cd frontend/apps/admin
node --test "src/app/(protected)/governance/university-council/university-council-admin-contract.test.mjs"
cd ../web
node --test src/app/about/university-council-backend-contract.test.mjs
```

Expected: both contract tests pass.

- [ ] **Step 3: Run frontend typechecks**

Run:

```bash
pnpm --dir frontend --filter @ksu/admin typecheck
pnpm --dir frontend --filter @ksu/web typecheck
```

Expected: both typechecks pass.

- [ ] **Step 4: Run project helper checks**

Run:

```bash
scripts/commit-changes.sh -m "Verify university governance administration" --run-checks -- services/main/app frontend/apps/admin/src frontend/apps/web/src
```

Expected: if there are no staged source changes, helper may exit with "no staged changes to commit" after checks. That is acceptable for this verification step only. If fixes were made, it should commit them.

- [ ] **Step 5: Manual source checks**

Run:

```bash
rg "Prof\\. Jane|Hon\\. Mary|Nathan Oyori|jane-onyango|mary-mokua|nathan-ogechi" frontend/apps/web/src frontend/apps/admin/src services/main/app
rg "profile_slug|public_role_label|governance_role_id|updateCouncilOrder|getUniversityCouncilPage" services/main/app frontend/apps/admin/src frontend/apps/web/src
```

Expected:

- First command returns no hard-coded member sample names/assets in implementation files.
- Second command returns relevant backend/admin/web implementation references.

- [ ] **Step 6: Commit any verification fixes**

If Step 4 did not commit because no changes were needed, do not create an empty commit.

If fixes were needed, run:

```bash
scripts/commit-changes.sh -m "Polish university governance administration" --run-checks -- <exact fixed paths>
```

---

## Plan Self-Review

Spec coverage:

- Backend models and migrations: Task 1.
- Configurable categories and roles: Tasks 1-2.
- Council member creation/editing and appointment history: Tasks 1-2 and Task 4.
- Drag-and-drop/order management: Tasks 2 and 4.
- Workflow and unpublish admin action: Tasks 1-2 and Task 4.
- Dashboard stats and seamless admin workspace: Tasks 3-4.
- Hero/mandate page content: Tasks 1-2 and Task 4.
- Public listing/profile pages: Task 5.
- Accessibility/responsive public cards: Task 5.
- Data quality and no hard-coded public data: Task 6.

Placeholder scan: this plan defines exact target files, endpoints, methods, commands, and expected results.

Type consistency:

- API names in admin tasks match the `governanceAdminApi` interface from Task 3.
- Public web data names match Task 5 route usage.
- Backend method names match Task 2 endpoint responsibilities.
