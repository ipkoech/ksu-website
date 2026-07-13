# Public Contact Directory Read Model Design

## Goal

Provide one public aggregate endpoint for the initial Contact page load and extend the existing public contacts endpoint with server-side search and filtering. The backend remains the owner of canonical institutional, contact, campus, and FAQ records; the frontend remains the owner of page layout and presentation.

## Scope

This design delivers the read path for the records that already exist:

- institutional contact information from `UniversityInfo`;
- public active contacts from `ContactDirectory`;
- public active campuses from `Campus`;
- public published main-site FAQs from `FAQ`;
- server-side contact search, filtering, sorting, and pagination;
- a typed API client and Contact-page data loader using the aggregate endpoint.

This design does not create a `ContactPage` model, store frontend layout in the backend, or add category, service-channel, form-configuration, visitor-information, and placement models. Those are separate record-management enhancements and can be added to the aggregate response without changing its top-level contract.

## Architecture

### Canonical records

Existing resource endpoints remain responsible for administrative CRUD. No writes pass through the aggregate endpoint.

The public read flow is:

1. `GET /api/v1/contact-directory` loads the initial institutional contact payload.
2. The frontend renders its fixed Contact-page layout from that payload.
3. Subsequent directory searches and pagination call `GET /api/v1/contacts` so campuses, FAQs, and institutional data are not downloaded again.

### Aggregate endpoint

Add:

```http
GET /api/v1/contact-directory
```

Supported query parameters:

```text
q
contact_type
scope_type
scope_id
page
per_page
```

The endpoint returns the standard success envelope with this data shape:

```json
{
  "institution": {
    "id": "uuid",
    "name": "Kisii University",
    "short_name": "KSU",
    "email": "info@kisiiuniversity.ac.ke",
    "phone": "+254 720 875 082",
    "alternate_phone": null,
    "postal_address": "P.O. Box 408-40200, Kisii, Kenya",
    "physical_address": "Main Campus, Kisii",
    "city": "Kisii",
    "county": "Kisii",
    "country": "Kenya",
    "website": "https://kisiiuniversity.ac.ke",
    "social_links": {}
  },
  "main_contacts": [],
  "contacts": {
    "items": [],
    "meta": {
      "page": 1,
      "per_page": 20,
      "total": 0,
      "pages": 0
    }
  },
  "campuses": [],
  "faqs": []
}
```

`institution` may be `null`. Collections are always arrays, and `contacts.meta` is always present. This lets the frontend render partial but valid content when optional datasets are empty.

`main_contacts` contains all public active contacts marked `is_main`, ordered deterministically by name. `contacts.items` contains the filtered and paginated public directory, including main contacts when they match the filters.

`campuses` contains active campuses ordered by `display_order` and name. `faqs` contains public, published, main-site FAQs ordered by `display_order` and creation time.

### Searchable contacts endpoint

Extend:

```http
GET /api/v1/contacts
```

with:

```text
q
contact_type
sort=name_asc|name_desc
```

Existing parameters remain compatible.

Search is case-insensitive and matches:

- `name`;
- `contact_type`;
- `email`;
- `extension`;
- `physical_address`;
- `building`;
- `room_number`.

Whitespace-only queries are treated as absent. Search input is limited to 120 characters. Public search always enforces `is_public = true`, `status = active`, and `deleted_at IS NULL`; callers cannot override those constraints.

The default ordering is ascending contact name. Only the two documented sort values are accepted, keeping query behavior deterministic and indexable.

### Service layer

Extend `ContactService.list` with `search`, `contact_type`, and `sort`. Filtering is applied before pagination.

Add `PublicContactDirectoryService.compose`, which fetches institution information, main contacts, the filtered contact page, campuses, and FAQs. Independent reads may run concurrently only if the session usage remains safe; otherwise they execute sequentially within one request session.

The aggregate service returns a typed composition object rather than ORM instances assembled ad hoc in the route.

### Schemas

Add explicit Pydantic read schemas for:

- the restricted public institutional contact summary;
- paginated contact results;
- the aggregate contact-directory response.

The institutional summary intentionally excludes leadership, strategic priorities, internal identifiers unrelated to rendering, and unpublished media metadata.

### Frontend integration

Add a typed API-client method for `GET /contact-directory` and update `getContactPageConfig` to use it for the initial page request.

The public frontend continues to own:

- hero and section copy;
- visual ordering and responsive layout;
- icons and card variants;
- loading, empty, and error presentation;
- later interactive directory controls.

Existing hardcoded institutional contact values remain only as a failure fallback. When aggregate data is available, the page uses the backend institution and main-contact records.

This implementation does not build the full supplied visual redesign or its interactive directory UI. It establishes and consumes the backend contract required for that later frontend work.

## Authorization and visibility

Both public endpoints are unauthenticated read endpoints.

They expose only:

- active and public `UniversityInfo`;
- active and public `ContactDirectory` records;
- active campuses;
- published, public, main-site FAQs;
- non-deleted records where soft deletion applies.

Administrative contact listing continues to use the existing permission-aware endpoint. The public aggregate service must not reuse an admin query mode that permits unpublished records.

## Caching and invalidation

Cache the aggregate endpoint and searchable public contacts endpoint using the existing public-cache mechanism.

Cache variance includes every filtering and pagination parameter. Existing mutation-driven public cache invalidation clears stale results after contact, FAQ, campus, or university changes.

## Error handling

- Invalid sort values or overlong search text return validation errors.
- Missing optional institution data does not fail the aggregate response.
- Database failures fail the request normally and are recorded by existing service logging and audit middleware.
- The frontend catches aggregate request failures and uses its current verified fallback values.
- Empty contacts, campuses, or FAQs are represented by empty collections, not fabricated backend records.

## Testing

Backend tests cover:

- case-insensitive search across every documented contact field;
- contact-type and scope filters combined with search;
- filtering before pagination and accurate totals;
- deterministic ascending and descending sorting;
- exclusion of private, inactive, and deleted contacts;
- aggregate visibility rules for institution, contacts, campuses, and FAQs;
- stable empty-state response shape;
- route validation and response-envelope shape;
- cache variance for search and filter parameters.

Frontend/API-client tests cover:

- the typed aggregate request path;
- mapping institution and main-contact data into the current Contact page configuration;
- fallback behavior when the aggregate request fails;
- no regression to other users of `contactsApi.list`.

## Acceptance criteria

- Initial Contact-page record data is available from one aggregate endpoint.
- Contact search and filtering happen on the backend before pagination.
- Search results report accurate pagination metadata.
- Only public, active, published records appear in public responses.
- The aggregate endpoint does not store or expose layout instructions.
- Existing contact API consumers remain compatible.
- The public Contact-page loader consumes the aggregate endpoint.
- Focused backend and frontend checks pass.

## Future-compatible extensions

Future record types can be added as optional top-level collections without introducing a backend Contact-page entity:

- `categories`;
- `service_channels`;
- enriched campus visitor information;
- featured-contact placement metadata;
- public form configuration.

Clients must tolerate additional response fields, and new collections must default to empty arrays during rollout.
