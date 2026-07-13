STATUS: DONE

commits:
- 1912491 Route logins to canonical portals

files changed:
- frontend/apps/admin/src/lib/auth-routing.ts
- frontend/apps/admin/src/lib/auth-routing-consolidation-contract.test.mjs
- .superpowers/sdd/task-1-report.md

tests run with results:
- `node frontend/apps/admin/src/lib/auth-routing-consolidation-contract.test.mjs` - passed after implementation; initially failed as expected because the Corporate Communication canonical route was absent.
- `pnpm typecheck` from `frontend/` - passed: 7 of 7 workspace typecheck tasks successful.
- `scripts/commit-changes.sh -m "Route logins to canonical portals" --run-checks -- frontend/apps/admin/src/lib/auth-routing.ts frontend/apps/admin/src/lib/auth-routing-consolidation-contract.test.mjs` - passed: whitespace check, frontend lint (warnings only), and frontend typecheck all completed successfully; committed as `1912491`.

self-review notes:
- Added the seven canonical portal routes and explicit `portalPriority` ordering.
- Main-service and multiple-portal post-login fallbacks no longer default to `/select-service`.
- `/select-service` was not removed or modified and remains an explicit portal-directory route elsewhere in the application.
- Multi-portal users select the highest-priority canonical portal; unknown-only portal records retain their first returned portal fallback.
- Kept scope to Task 1 routing and its required contract test.

concerns:
- The required frontend lint command reports pre-existing warnings across several packages, including 11 warnings in the admin app; it exits successfully with no lint errors.
