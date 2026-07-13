# Task 7C Report: Research Content Source Integration

## Changes

- Registered `research_project` and `publication` in Main Page CMS source support.
- Delegated research catalog search and single/bulk resolution to
  `ResearchContentSourcesProxyService` with university-wide reads and exact
  research-centre filtering.
- Returned empty paginated catalogs for school and library ownership without a
  provider request.
- Re-validated provider summaries as `PageCmsSourceSummary` values, including
  display metadata sanitization.
- Used one bulk provider request per research source type, kept unique input
  reference order in resolution results, and mapped provider failures to
  `provider_error` without leaking provider details.
- Kept research content public-only. Missing or non-public records requested by
  preview produce `preview_unsupported`; no draft summary is exposed.
- Expanded the frontend catalog source list to all fourteen canonical backend
  types and updated the picker contract to require exact catalog equality while
  retaining the unknown-source guard.

## TDD Evidence

### Red

- New Main research-source tests initially failed because
  `PageCmsSourceService` did not expose `ResearchContentSourcesProxyService`.
- The canonical source API test initially returned `422` for
  `research_project` and `publication`.
- The frontend picker contract initially failed because its catalog listed only
  six source types.

### Green

- Added the Main adapter and reran the focused service, API, preview, and
  frontend checks.

## Verification

```bash
PYTHONPATH="$PWD" /home/egric/Work/KSU/v1/services/main/.venv/bin/pytest -q \
  tests/test_page_cms_sources.py \
  tests/test_page_cms_research_sources.py \
  tests/test_page_cms_source_api.py \
  tests/test_page_cms_preview.py
```

Result: `87 passed`.

```bash
cd frontend
pnpm --filter @ksu/admin lint
pnpm --filter @ksu/admin typecheck
node apps/admin/src/components/page-cms/page-cms-picker-contract.test.mjs
```

Result: lint and typecheck completed successfully; the picker contract passed.

`ruff check` was also run after installing the missing local runner. It reports
two existing `E731` lambda assignments in `page_cms_sources.py` outside Task
7C; the scoped commit helper does not run Ruff.

## Commit

Recorded after the required scoped commit helper completes.
