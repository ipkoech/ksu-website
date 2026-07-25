# Public Contact Directory Read Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cached public Contact-directory aggregate endpoint, backend contact search/filter/sort before pagination, and make the public Contact-page loader consume the aggregate contract.

**Architecture:** Existing domain records remain canonical and existing CRUD routes remain unchanged. `ContactService.list` becomes the reusable filtered query, a focused composition service assembles public institution/contact/campus/FAQ records, and the frontend owns layout while loading the aggregate once and using `/contacts` for later searches.

**Tech Stack:** FastAPI, SQLAlchemy 2 async, Pydantic v2, pytest, Next.js 15, TypeScript, existing `@ksu/api-client`, Node contract tests, existing public-cache helpers.

## Global Constraints

- Do not create a backend `ContactPage` model or store layout instructions.
- Preserve compatibility for every existing `contactsApi.list` consumer.
- Public responses must exclude private, inactive, unpublished, and soft-deleted records.
- Apply search and authorization filters before pagination so totals remain accurate.
- Keep hero copy, section headings, component layout, and icons frontend-owned.
- Do not modify or commit unrelated Page CMS admin work already present in the worktree.
- Use `scripts/commit-changes.sh`, never `git commit` directly.

---

## File Structure and Responsibilities

### Backend

- Modify `services/main/app/services/support.py`: add reusable contact query filters and deterministic sort.
- Modify `services/main/app/api/v1/contacts.py`: expose validated public and admin search parameters with complete cache variance.
- Create `services/main/app/schemas/contact_directory.py`: define the restricted aggregate response contract.
- Modify `services/main/app/schemas/__init__.py`: export aggregate schemas.
- Create `services/main/app/services/public_contact_directory.py`: compose public institutional, contact, campus, and FAQ records.
- Modify `services/main/app/services/__init__.py`: export the composition service.
- Create `services/main/app/api/v1/contact_directory.py`: expose the cached aggregate route.
- Modify `services/main/app/api/v1/__init__.py`: register `/api/v1/contact-directory`.
- Create `services/main/tests/test_contact_directory_search.py`: verify filters are applied before pagination and private records never leak.
- Create `services/main/tests/test_public_contact_directory.py`: verify composition, schemas, route registration, and empty states.

### Shared frontend API client

- Modify `frontend/packages/api-client/src/main/types.ts`: add search parameters and aggregate response types.
- Modify `frontend/packages/api-client/src/main/api.ts`: extend `contactsApi.list` and add `contactDirectoryApi.get`.
- Create `frontend/packages/api-client/src/main/contact-directory-contract.test.mjs`: protect route and type/API exports.

### Public frontend

- Modify `frontend/apps/web/src/lib/utility-page-data.ts`: load the aggregate contract and map institution, contacts, campuses, and FAQs to existing public-page primitives with verified fallback data.
- Create `frontend/apps/web/src/app/contact/contact-directory-contract.test.mjs`: protect aggregate consumption and prevent regression to an initial `is_main` contacts-only request.

---

### Task 1: Searchable Contact Query

**Files:**
- Modify: `services/main/app/services/support.py`
- Modify: `services/main/app/api/v1/contacts.py`
- Create: `services/main/tests/test_contact_directory_search.py`

**Interfaces:**
- Produces: `ContactService.list(..., search: str | None = None, contact_type: str | None = None, sort: str = "name_asc") -> PaginatedResult`.
- Produces: public/admin query parameters `q`, `contact_type`, and `sort` on `/api/v1/contacts`.
- Preserves: current `scope_type`, `scope_id`, `is_main`, visibility, status, field-selection, and pagination behavior.

- [ ] **Step 1: Write failing service tests**

Create async tests that insert public active contacts plus private, inactive, and deleted controls, then assert search across `name`, `contact_type`, `email`, `extension`, `physical_address`, `building`, and `room_number`:

```python
@pytest.mark.asyncio
async def test_contact_search_filters_before_pagination(db):
    result = await ContactService.list(
        db,
        page=1,
        per_page=1,
        search="admissions",
        contact_type="admissions",
        sort="name_asc",
    )
    assert result.meta["total"] == 2
    assert len(result.items) == 1
    assert "Admissions" in result.items[0].name


@pytest.mark.asyncio
async def test_public_contact_search_excludes_non_public_records(db):
    result = await ContactService.list(db, search="hidden")
    assert result.items == []
    assert result.meta["total"] == 0
```

- [ ] **Step 2: Run the focused tests and confirm failure**

Run:

```bash
cd services/main && pytest tests/test_contact_directory_search.py -q
```

Expected: FAIL because `ContactService.list` does not accept `search`, `contact_type`, or `sort`.

- [ ] **Step 3: Implement query filtering before pagination**

In `ContactService.list`, normalize whitespace-only search to `None`, reject unsupported sort values defensively, and apply an `or_` predicate before `paginate_query`:

```python
search_value = search.strip() if search else None
if search_value:
    pattern = f"%{search_value}%"
    query = query.where(
        or_(
            ContactDirectory.name.ilike(pattern),
            ContactDirectory.contact_type.ilike(pattern),
            ContactDirectory.email.ilike(pattern),
            ContactDirectory.extension.ilike(pattern),
            ContactDirectory.physical_address.ilike(pattern),
            ContactDirectory.building.ilike(pattern),
            ContactDirectory.room_number.ilike(pattern),
        )
    )
if contact_type:
    query = query.where(ContactDirectory.contact_type == contact_type)
if sort == "name_desc":
    query = query.order_by(ContactDirectory.name.desc(), ContactDirectory.id.asc())
elif sort == "name_asc":
    query = query.order_by(ContactDirectory.name.asc(), ContactDirectory.id.asc())
else:
    raise ValueError("Unsupported contact sort")
```

Remove the old unconditional contact ordering so only one deterministic ordering is applied.

- [ ] **Step 4: Expose validated API parameters and cache variance**

Add to both public and admin list routes:

```python
q: str | None = Query(default=None, max_length=120),
contact_type: str | None = Query(default=None, max_length=64),
sort: Literal["name_asc", "name_desc"] = "name_asc",
```

Pass `search=q`, `contact_type=contact_type`, and `sort=sort` to the service. Extend the public `cached_public(... vary_on=...)` tuple with `q`, `contact_type`, and `sort`.

- [ ] **Step 5: Run focused and existing support tests**

Run:

```bash
cd services/main && pytest tests/test_contact_directory_search.py tests/test_support_scope_api.py -q
```

Expected: PASS.

- [ ] **Step 6: Commit only Task 1 paths**

```bash
scripts/commit-changes.sh -m "Add searchable public contacts" --run-checks -- services/main/app/services/support.py services/main/app/api/v1/contacts.py services/main/tests/test_contact_directory_search.py
```

---

### Task 2: Public Contact-directory Aggregate

**Files:**
- Create: `services/main/app/schemas/contact_directory.py`
- Modify: `services/main/app/schemas/__init__.py`
- Create: `services/main/app/services/public_contact_directory.py`
- Modify: `services/main/app/services/__init__.py`
- Create: `services/main/app/api/v1/contact_directory.py`
- Modify: `services/main/app/api/v1/__init__.py`
- Create: `services/main/tests/test_public_contact_directory.py`

**Interfaces:**
- Consumes: searchable `ContactService.list` from Task 1.
- Produces: `PublicContactDirectoryService.compose(db, *, search, contact_type, scope_type, scope_id, page, per_page) -> PublicContactDirectoryRead`.
- Produces: `GET /api/v1/contact-directory` with the standard success envelope.

- [ ] **Step 1: Write failing schema and service tests**

Cover a complete composition and an empty database:

```python
@pytest.mark.asyncio
async def test_contact_directory_composes_only_public_records(db):
    result = await PublicContactDirectoryService.compose(db, page=1, per_page=20)
    assert result.institution is not None
    assert all(item.is_public and item.status == "active" for item in result.contacts.items)
    assert all(item.is_main for item in result.main_contacts)
    assert all(item.is_public and item.status == "published" for item in result.faqs)


@pytest.mark.asyncio
async def test_contact_directory_empty_state_is_stable(empty_db):
    result = await PublicContactDirectoryService.compose(empty_db, page=1, per_page=20)
    assert result.institution is None
    assert result.main_contacts == []
    assert result.contacts.items == []
    assert result.contacts.meta.total == 0
    assert result.campuses == []
    assert result.faqs == []
```

- [ ] **Step 2: Run tests and confirm missing imports**

Run:

```bash
cd services/main && pytest tests/test_public_contact_directory.py -q
```

Expected: FAIL because aggregate schemas and `PublicContactDirectoryService` do not exist.

- [ ] **Step 3: Define restricted response schemas**

Create `contact_directory.py` with:

```python
class PublicUniversityContactSummary(BaseReadSchema):
    name: str
    short_name: str | None = None
    acronym: str | None = None
    email: str | None = None
    phone: str | None = None
    alternate_phone: str | None = None
    website: str | None = None
    postal_address: str | None = None
    physical_address: str | None = None
    city: str | None = None
    county: str | None = None
    country: str | None = None
    social_links: dict | None = None


class ContactDirectoryPaginationMeta(BaseModel):
    page: int
    per_page: int
    total: int
    pages: int


class PublicContactDirectoryPage(BaseModel):
    items: list[ContactDirectoryRead] = Field(default_factory=list)
    meta: ContactDirectoryPaginationMeta


class PublicContactDirectoryRead(BaseModel):
    institution: PublicUniversityContactSummary | None = None
    main_contacts: list[ContactDirectoryRead] = Field(default_factory=list)
    contacts: PublicContactDirectoryPage
    campuses: list[CampusRead] = Field(default_factory=list)
    faqs: list[FAQRead] = Field(default_factory=list)
```

Export all four types from `schemas/__init__.py`.

- [ ] **Step 4: Implement the focused composition service**

Use existing services with public defaults and validate ORM values into the response schemas:

```python
class PublicContactDirectoryService:
    @staticmethod
    async def compose(db: AsyncSession, *, search=None, contact_type=None, scope_type=None, scope_id=None, page=1, per_page=20):
        institution = await UniversityInfoService.get_current(db, public_only=True)
        main_result = await ContactService.list(db, page=1, per_page=100, is_main=True)
        contact_result = await ContactService.list(
            db,
            page=page,
            per_page=per_page,
            search=search,
            contact_type=contact_type,
            scope_type=scope_type,
            scope_id=scope_id,
        )
        campuses = await CampusService.list(db, is_active=True)
        faq_result = await FAQService.list(db, page=1, per_page=100, is_main=True)
        return PublicContactDirectoryRead(
            institution=PublicUniversityContactSummary.model_validate(institution) if institution else None,
            main_contacts=[ContactDirectoryRead.model_validate(item) for item in main_result.items],
            contacts=PublicContactDirectoryPage(
                items=[ContactDirectoryRead.model_validate(item) for item in contact_result.items],
                meta=ContactDirectoryPaginationMeta(**contact_result.meta),
            ),
            campuses=[CampusRead.model_validate(item) for item in campuses],
            faqs=[FAQRead.model_validate(item) for item in faq_result.items],
        )
```

Export the service from `services/__init__.py`.

- [ ] **Step 5: Add and register the cached aggregate route**

Create a router with:

```python
@router.get("")
@cached_public(
    timeout=300,
    vary_on=("q", "contact_type", "scope_type", "scope_id", "page", "per_page"),
)
async def get_public_contact_directory(
    db: DbSession,
    q: str | None = Query(default=None, max_length=120),
    contact_type: str | None = Query(default=None, max_length=64),
    scope_type: str | None = None,
    scope_id: uuid.UUID | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    data = await PublicContactDirectoryService.compose(
        db,
        search=q,
        contact_type=contact_type,
        scope_type=scope_type,
        scope_id=scope_id,
        page=page,
        per_page=per_page,
    )
    return success(data=data)
```

Register it at `/api/v1/contact-directory` before the parameterized contacts router registration.

- [ ] **Step 6: Run aggregate and regression tests**

Run:

```bash
cd services/main && pytest tests/test_public_contact_directory.py tests/test_contact_directory_search.py tests/test_public_site_pages.py tests/test_support_scope_api.py -q
```

Expected: PASS.

- [ ] **Step 7: Commit only Task 2 paths**

```bash
scripts/commit-changes.sh -m "Add public contact directory aggregate" --run-full-checks -- services/main/app/schemas/contact_directory.py services/main/app/schemas/__init__.py services/main/app/services/public_contact_directory.py services/main/app/services/__init__.py services/main/app/api/v1/contact_directory.py services/main/app/api/v1/__init__.py services/main/tests/test_public_contact_directory.py
```

---

### Task 3: Typed Frontend API Contract

**Files:**
- Modify: `frontend/packages/api-client/src/main/types.ts`
- Modify: `frontend/packages/api-client/src/main/api.ts`
- Create: `frontend/packages/api-client/src/main/contact-directory-contract.test.mjs`

**Interfaces:**
- Consumes: backend route and response from Task 2.
- Produces: `ContactDirectoryListParams`, `PublicUniversityContactSummary`, `PublicContactDirectoryPage`, `PublicContactDirectory`, and `contactDirectoryApi.get(params)`.

- [ ] **Step 1: Write a failing contract test**

Create a Node test that reads `types.ts` and `api.ts` and asserts the new exported symbols and exact route string:

```javascript
test("contact directory client exposes aggregate and search contracts", () => {
  assert.match(typesSource, /export interface PublicContactDirectory/);
  assert.match(typesSource, /q\?: string/);
  assert.match(apiSource, /export const contactDirectoryApi/);
  assert.match(apiSource, /"\/api\/v1\/contact-directory"/);
  assert.match(apiSource, /contact_type\?: string/);
  assert.match(apiSource, /sort\?: "name_asc" \| "name_desc"/);
});
```

- [ ] **Step 2: Run the contract test and confirm failure**

Run:

```bash
node --test frontend/packages/api-client/src/main/contact-directory-contract.test.mjs
```

Expected: FAIL because the aggregate client contract is absent.

- [ ] **Step 3: Add response and parameter types**

Define:

```typescript
export interface ContactDirectoryListParams {
  q?: string;
  contact_type?: string;
  scope_type?: string;
  scope_id?: string;
  is_main?: boolean;
  sort?: "name_asc" | "name_desc";
}

export interface PublicUniversityContactSummary {
  id: string;
  name: string;
  short_name?: string | null;
  acronym?: string | null;
  email?: string | null;
  phone?: string | null;
  alternate_phone?: string | null;
  website?: string | null;
  postal_address?: string | null;
  physical_address?: string | null;
  city?: string | null;
  county?: string | null;
  country?: string | null;
  social_links?: Record<string, string> | null;
}

export interface PublicContactDirectory {
  institution: PublicUniversityContactSummary | null;
  main_contacts: ContactDirectory[];
  contacts: {
    items: ContactDirectory[];
    meta: {
      page: number;
      per_page: number;
      total: number;
      pages: number;
    };
  };
  campuses: Campus[];
  faqs: FAQ[];
}
```

- [ ] **Step 4: Extend the API methods compatibly**

Change both contact list parameter generics to `ContactDirectoryListParams`, then add:

```typescript
export const contactDirectoryApi = {
  get: (params?: ListParams<Omit<ContactDirectoryListParams, "is_main" | "sort">>) =>
    mainApi.get<{ data: PublicContactDirectory }>(
      "/api/v1/contact-directory",
      params,
    ),
};
```

- [ ] **Step 5: Run contract, lint, and typecheck**

Run:

```bash
node --test frontend/packages/api-client/src/main/contact-directory-contract.test.mjs
cd frontend && pnpm --filter @ksu/api-client lint && pnpm --filter @ksu/api-client typecheck
```

Expected: PASS, with only pre-existing lint warnings permitted.

- [ ] **Step 6: Commit only Task 3 paths**

```bash
scripts/commit-changes.sh -m "Expose contact directory client contract" --run-checks -- frontend/packages/api-client/src/main/types.ts frontend/packages/api-client/src/main/api.ts frontend/packages/api-client/src/main/contact-directory-contract.test.mjs
```

---

### Task 4: Public Contact-page Loader Integration

**Files:**
- Modify: `frontend/apps/web/src/lib/utility-page-data.ts`
- Create: `frontend/apps/web/src/app/contact/contact-directory-contract.test.mjs`

**Interfaces:**
- Consumes: `contactDirectoryApi.get` and `PublicContactDirectory` from Task 3.
- Produces: `getContactPageConfig()` backed by one aggregate initial request with current verified constants used only on request failure or absent optional fields.

- [ ] **Step 1: Write a failing frontend contract test**

Assert the loader imports and calls the aggregate API, maps all four collections, and no longer makes the initial `contactsApi.list({ is_main: true })` request:

```javascript
test("contact page loader consumes the aggregate contact directory", () => {
  assert.match(source, /contactDirectoryApi/);
  assert.match(source, /contactDirectoryApi\.get\(/);
  assert.match(source, /main_contacts/);
  assert.match(source, /contacts\.items/);
  assert.match(source, /campuses/);
  assert.match(source, /faqs/);
  assert.doesNotMatch(source, /contactsApi\.list\(\{\s*is_main:\s*true/);
});
```

- [ ] **Step 2: Run the contract test and confirm failure**

Run:

```bash
node --test frontend/apps/web/src/app/contact/contact-directory-contract.test.mjs
```

Expected: FAIL because the loader still calls `contactsApi.list` directly.

- [ ] **Step 3: Add safe aggregate loading**

Import `contactDirectoryApi`, `Campus`, and `PublicContactDirectory`. Add:

```typescript
async function getPublicContactDirectory(): Promise<PublicContactDirectory | null> {
  try {
    const response = await contactDirectoryApi.get({ page: 1, per_page: 20 });
    return response.data ?? null;
  } catch (error) {
    console.error("Failed to fetch public contact directory:", error);
    return null;
  }
}
```

Replace the old main-contact request in `getContactPageConfig` with this single call.

- [ ] **Step 4: Map aggregate records to existing presentation primitives**

Use `main_contacts` first, falling back to `contacts.items`, then verified constants. Build optional campus and FAQ sections only when records exist:

```typescript
const directory = await getPublicContactDirectory();
const contacts = directory?.main_contacts.length
  ? directory.main_contacts
  : directory?.contacts.items ?? [];
const institution = directory?.institution;
const campuses = directory?.campuses ?? [];
const faqs = directory?.faqs ?? [];
```

Use `institution.email`, `institution.phone`, and `institution.postal_address` ahead of `officialLinks` for hero actions and fallback cards. Map campuses to informational cards using name, city/county/address, and map FAQs through the existing `faqCard` helper. Do not add new layout components.

- [ ] **Step 5: Run focused frontend checks**

Run:

```bash
node --test frontend/apps/web/src/app/contact/contact-directory-contract.test.mjs
cd frontend && pnpm --filter @ksu/web lint && pnpm --filter @ksu/web typecheck
```

Expected: PASS, with only pre-existing lint warnings permitted.

- [ ] **Step 6: Run the complete feature regression set**

Run:

```bash
cd services/main && pytest tests/test_contact_directory_search.py tests/test_public_contact_directory.py tests/test_support_scope_api.py -q
cd ../../frontend && pnpm --filter @ksu/api-client typecheck && pnpm --filter @ksu/web typecheck
node --test packages/api-client/src/main/contact-directory-contract.test.mjs apps/web/src/app/contact/contact-directory-contract.test.mjs
```

Expected: all tests and typechecks PASS.

- [ ] **Step 7: Commit only Task 4 paths**

```bash
scripts/commit-changes.sh -m "Load public contact directory aggregate" --run-full-checks -- frontend/apps/web/src/lib/utility-page-data.ts frontend/apps/web/src/app/contact/contact-directory-contract.test.mjs
```

---

## Final Verification

- [ ] Run `git status --short` and confirm unrelated Page CMS admin changes remain uncommitted and untouched.
- [ ] Run `git log -5 --oneline` and confirm each feature task has an intentional helper-created commit.
- [ ] Run `git diff --check HEAD~4..HEAD` and confirm no whitespace errors.
- [ ] Confirm `GET /api/v1/contact-directory` appears in generated OpenAPI or route-registration tests.
- [ ] Confirm public contact search cannot return private, inactive, or deleted records.
- [ ] Confirm the Contact-page loader makes one aggregate initial request and retains verified fallback behavior.
