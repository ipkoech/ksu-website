# Task 7B Report: Research Project and Publication Source Contract

## Status

Implemented a public-only Research service Page CMS source contract and an isolated Main service proxy. The canonical Main Page CMS source registry remains unchanged for the follow-up integration task.

## Changes

- Added public `GET /api/v1/page-cms-sources/{source_type}` search and `POST /api/v1/page-cms-sources/{source_type}/resolve` bulk resolution routes for `research_project` and `publication`.
- Enforced public visibility predicates: projects require non-deleted, active, public records in `approved`, `ongoing`, or `completed`; publications require non-deleted, active records in `published` status. Passing `center_id` applies an exact centre filter; omitting it supports university-wide results.
- Added a minimal summary schema with only display-safe fields: UUID, source type, labels, status, publication/start date, thumbnail URL, and sanitized metadata without relationship or storage IDs.
- Resolved cover media in one public-media query, filtering soft-deleted and non-public media and returning only public thumbnail/URL values.
- Added `ResearchContentSourcesProxyService`, using `RESEARCH_SERVICE_URL`, the established proxy timeout/header convention, bounded page and UUID limits, and `PageCmsSourceProviderError` mapping for network and contract failures.
- Kept draft preview unsupported by leaving the proxy public-read-only and making no integration changes to `page_cms_sources.py`.

## TDD Evidence

### Red

- `services/main/.venv/bin/pytest tests/test_research_content_sources.py -q` initially failed at collection with `ModuleNotFoundError: app.services.research_content_sources`.
- `services/research` contract test initially failed at collection with `ModuleNotFoundError: app.routes.v1.page_cms_source_contract`.

### Green

- `services/main/.venv/bin/pytest tests/test_research_content_sources.py -q`: `4 passed`.
- The Research environment has no worktree-local virtual environment and lacks `pytest-asyncio`, so its focused test uses `asyncio.run` and the existing Research virtual environment with explicit test-only settings:

```bash
DATABASE_URL='postgresql+asyncpg://test:test@localhost/test' \
JWT_SECRET_KEY='test-secret' \
PYTHONPATH="$PWD" \
/home/egric/Work/KSU/v1/services/research/.venv/bin/pytest \
  tests/test_page_cms_source_contract.py -q
```

Result: `7 passed`.

## Verification

- Ruff passed for all Task 7B Python modules and focused tests.
- `py_compile` passed for the new Research and Main proxy modules.
- `git diff --check` is run by the required commit helper before staging.

## Scope

No frontend files, `services/main/app/services/page_cms_sources.py`, Task 7A files, or `task-1-report.md` were modified by this task. Concurrent worktree changes remain unstaged.
