# Task 2A Report: Admin Portal UX Contracts And Definite Stats

## Implemented

- Added authenticated Main-service portal stats at `GET /api/v1/stats/portal/{portal}` for Admin, CoCMS, Schools, Departments, and Student Clubs.
- Defined named dashboard counters rather than deriving the affected portal counters from broad list calls. The contracts cover the full portal set: Admin, CoCMS, Schools, Departments, Student Clubs, Research, Library, and Publications.
- Added Main-service portal stats tests for exact keys and the complete portal contract inventory.
- Updated the Admin, CoCMS, Schools, Departments, and Student Clubs dashboard cards to consume the new stats endpoint.
- Normalized dashboard stat query contracts to return a number. Loading uses a skeleton; `Unavailable` is only displayed when the query fails or violates its response contract.
- Kept Research and Library dashboard stats on their existing service-owned admin stats endpoints, while mapping their dashboard keys to the shared named-counter contract.
- Kept Publications dashboard stage counts on the research service's paginated endpoint, which supplies an exact `meta.total` for each workflow stage.
- Replaced the generic resource-page create wording with context-aware primary actions for publication submission, review queues, and media workspaces.

## Existing Reusable UX Support

- Portal forms already use relationship adapters and entity pickers for people, boards, schools, departments, clubs, media, and folders. This keeps editable relationship fields from being UUID-first.
- Existing workflow actions are surfaced before edit actions, and existing record-detail routes continue to provide focused detail views where configured.

## Deferred

- A generic selected-record preview panel for every portal table was not added. Building it safely requires resource-specific relationship display data so it does not reintroduce raw UUID labels. Existing detail routes and entity pickers remain in place.

## Verification

- `services/main/.venv/bin/pytest tests/test_portal_stats.py -q` - 2 passed.
- `services/main/.venv/bin/python -m compileall -q app/services/stats.py app/api/v1/stats.py app/schemas/stats.py` - passed.
- `pnpm --filter @ksu/admin typecheck` - passed.
