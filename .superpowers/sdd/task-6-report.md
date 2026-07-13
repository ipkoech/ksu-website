# Task 6 Report: Definite CMS Dashboard Statistics

## Delivered

- Added portal-wide Page CMS workflow aggregates for non-deleted sections, using timezone-aware publication window predicates.
- Added dynamic validation blocker counting across every non-archived section, with batched media/source resolution and scope-matching preview authorization.
- Added non-deleted partnership spotlight counting.
- Added the Page CMS stats API client and changed dashboard stat cards to use `/stats/portal/cocms` instead of paginated activity lists.
- Limited section and spotlight activity requests and rendering to six records.
- Rendered `0` for valid zero-valued stats and `Unavailable` only when the stats request fails.

## TDD Evidence

- RED: `services/main/.venv/bin/pytest tests/test_page_cms_stats.py -q` failed with `KeyError: 'in_review_count'` before the aggregate implementation.
- GREEN: the same backend test passes after implementation.
- RED: `node apps/admin/src/app/(dashboard)/page-cms/page-cms-admin-contract.test.mjs` failed because `pageCmsStatsApi.get()` was absent.
- GREEN: the frontend contract passes after the dedicated stats client and dashboard integration.

## Verification

- `cd services/main && ./.venv/bin/pytest tests/test_page_cms_stats.py -q`: 2 passed.
- `cd frontend && node apps/admin/src/app/(dashboard)/page-cms/page-cms-admin-contract.test.mjs`: passed.
- `cd frontend && pnpm --filter @ksu/admin typecheck`: passed.
- `git diff --check`: passed.

## Compatibility

- Updated `services/main/tests/test_portal_stats.py` to support the aggregate row interface and assert the expanded CoCMS contract, preserving the existing portal stats suite.
