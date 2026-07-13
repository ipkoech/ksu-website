# Task 7A Report: Local Page CMS Source Adapters

## Status

Implemented Main-service Page CMS adapters for `intake`, `academic_calendar`,
`staff_assignment`, `alumni`, `testimonial`, and `club_activity`.

## Changes

- Registered all six local source types in `SUPPORTED_SOURCE_TYPES` so canonical
  section definitions pass API compatibility validation.
- Added deterministic, paginated source searches capped at 50 records with
  public/deletion/workflow/window/scope predicates for each record type.
- Added sanitized summaries with public media and human metadata only; no
  relationship IDs are exposed in metadata.
- Added single and bulk resolution with eager loading and chunked SQL source-ID
  queries. Unavailable and inaccessible records return the existing typed
  resolution states without leaking private data.
- Preserved preview capability behavior for same-scope unpublished records and
  added a defense-in-depth guard that refuses deleted local records even when
  an authorized preview capability is supplied.
- Added focused local adapter and API compatibility coverage, including search,
  resolution, bulk resolution, wrong scope, unavailable, unpublished, and
  deleted-preview behavior.

## TDD Evidence

### Red

```bash
services/main/.venv/bin/pytest -q services/main/tests/test_page_cms_local_sources.py
```

Result: 10 expected failures because all six source types were unsupported.

```bash
services/main/.venv/bin/pytest -q \
  services/main/tests/test_page_cms_local_sources.py::test_preview_never_resolves_a_deleted_local_source
```

Result: expected failure because an authorized preview could summarize a
deleted testimonial supplied outside the SQL filter.

### Green

The full source/API/preview verification passed after implementation and the
deleted-record guard.

## Verification

```bash
services/main/.venv/bin/pytest -q \
  services/main/tests/test_page_cms_sources.py \
  services/main/tests/test_page_cms_local_sources.py \
  services/main/tests/test_page_cms_source_api.py \
  services/main/tests/test_page_cms_preview.py
services/main/.venv/bin/python -m compileall -q \
  services/main/app/services/page_cms_sources.py
git diff --check
```

## Scope

No frontend, Research service, Task 6/8, or `task-1-report.md` files were
modified by this task. Concurrent worktree changes remain excluded from the
scoped commit.
