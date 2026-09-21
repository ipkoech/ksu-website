# Authentication and workspace access

This focused change extends the existing workspace contract and uses Main's
accounts, active role assignments, sessions, preferences and audit outbox. No
migration, automatic role expansion, account changes, deployment or screens are
included. Existing login, refresh, logout and anonymous reads retain their routes.

## Authority mapping

Role names are provisioning templates, not runtime authority. Current active,
nondeleted, unexpired assignments and active role permissions determine access.
The following are permission families, not wildcard grants to existing accounts.
The exact catalog remains `contracts/ksu_contracts/roles.py` and existing Main
role provisioning. Domain ownership and workflow checks remain in their services.

| Workspace / existing templates | Permissions used | Permitted context scopes |
| --- | --- | --- |
| Web Master / explicitly reviewed platform assignment | `platform.admin`; all workspace capabilities | global or university; may select another workspace's valid scope |
| Communications / content-admin, content-manager, content-staff | assigned `content.*`, CMS/navigation, media, VC and editorial permissions | global/university |
| School / school_admin, school_editor, school-admin | assigned `school.*`, including separate integration permissions | assigned school; explicit global/university authority |
| Department / dept-admin, dept-staff, office roles | assigned academic, office, administration, staff permissions | assigned department; explicit global/university authority |
| Story Contributor / existing contributor assignment | `stories.view_own`, `stories.update_own`, `stories.submit`, upload | self or explicit global/university; record ownership still required |
| Library / library-admin, library-manager, library-staff | assigned `library.*` | assigned library branch; explicit global/university for central access |
| Research / Research roles | assigned Research permissions; oversight requires `research.oversight` | assigned research scope or explicit global/university |
| Research sub-workspaces / innovation-officer, university-farm-admin, sustainability-admin and aliases | assigned `innovation.*`, `farm.*`, `sustainability.*` | existing explicit global/domain grants; permissions alone never imply Research oversight |
| HERI / heri-admin and existing editor/publisher/viewer roles | assigned `heri.*`; publication remains separate | HERI or explicit global/university |
| Club / existing club assignment | own club operations and submission permissions | assigned club; explicit global/university authority |

Contributor/Club contexts never expose publication capabilities. Web Master
retains the real actor ID and an explicit `platform_authority` flag. Account
creation/edit/deletion and role/permission administration require platform
authority, including School account invitations and access changes. Existing
accounts are not automatically granted this authority.
The anonymous contributor account-request endpoint still records pending requests;
it does not register an account. Approval now requires Web Master authority.

Multiple School assignments can now be provisioned. School context still requires
verified `X-School-ID` selection when ambiguous. Missing local scope IDs and foreign
scope selections are denied. The existing database convention of a null role scope
meaning global is preserved; its identity snapshot explicitly emits `global`.
Missing scope in a structured authorization snapshot grants no scoped access.

## HTTP contract

`GET /api/v1/me/portal-access` preserves `data.portals` and adds `data.workspaces`
and `data.preferred_workspace`. The preferred context is null when its saved
selection is invalid or no longer authorized. `GET /api/v1/workspaces` returns
authorized choices. Discovery capabilities summarize choices; they are not a
credential. `selection_required` marks ambiguous unselected contexts.

`POST /api/v1/workspaces/{workspace}/activate` accepts:

```json
{"scope":{"scope_type":"library","scope_id":"<branch UUID>"},
 "previous_visit_id":"<optional prior visit UUID>"}
```

The response is `data: {context, visit_id}`. Context contains `workspace`,
`actor_id`, `scopes`, `selected_scope`, `capabilities`, `sub_workspaces`,
`reporting_capabilities`, `platform_authority`, and `selection_required`.
An omitted scope is resolved only when exactly one choice exists. Successful
entry/switch upserts `workspace / last_selected` in existing user preferences.
Concurrent tabs keep separate returned contexts; only the preference is shared.

`POST /api/v1/workspaces/{workspace}/exit` accepts the scope and `visit_id`, records
an explicit exit and returns the same envelope. It does not revoke authentication
or overwrite the preference. Browser closure is not a confirmed exit/logout.

Visit IDs, including caller-supplied IDs, are untrusted correlation metadata.
They do not prove a previous visit or authorize a request. Protected domain
requests continue using their existing scope selectors and current ownership,
permission and workflow checks. Activation does not bypass any of these checks.

Entry, switch, denied selection and exit events include actor, requested/verified
scope, workspace, outcome and visit/request correlation in the existing audit
outbox. Successful events participate in the request transaction. Denials use
independent capture so request rollback cannot discard the event.

New activation failures use HTTP 403 with `detail.code`:
`workspace_selection_required`, `access_not_assigned`, or `access_revoked` when
the caller supplies a prior visit correlation. The latter is a navigation hint,
not proof of a historical grant. Existing v1 error bodies are preserved elsewhere:
401 means sign in; 403 means reselect/check access; 503 means retry unavailable
identity validation. Discovery and activation responses use `Cache-Control: no-store`.

## Freshness and realtime

Main checks the live active account and refresh-session row on protected requests.
Research, Library and HERI reuse Main introspection on each authenticated request,
with a two-second deadline and no cached authorization fallback. Internal service
keys remain distinct from user access. There is no intentional HTTP stale-access
cache; a request already authorized before a concurrent revocation can finish.

Socket tickets now carry the originating session JTI. Admission rejects missing,
expired or revoked sessions. Refresh rotation requires a new socket ticket.
Before each queued frame is sent, the hub rechecks the session and derived rooms;
lost access or validation failure closes with 1008 / `access_revoked`. Idle
connections recheck at the existing heartbeat interval. School rooms require
School content read access and active local scopes. The shared editorial room
requires explicit global review/publication authority. New client subscriptions
cannot invent rooms. A revocation concurrent with a completed pre-send check may
race that one frame; no stale authorization cache is used.

## Verification and limits

Focused Main HTTP/service tests cover preserved portal fields, all nine Web Master
choices, activation/exit identity, tab independence, preferences, denied selections,
multiple School provisioning, account authority, workflow publication restrictions,
and socket session/revocation checks. Research tests cover restricted domains and
public Farm reads. Shared tests cover token transport and fail-closed introspection.
Main OpenAPI and frontend contract files were regenerated.

Recorded checks for this change: Contracts 49 passed; final Main HTTP/account
checkpoint 13 passed; final realtime checkpoint 5 passed; Research domain/context/
public Farm checkpoint 19 passed. Earlier focused Main workspace/workflow checks
passed 45 tests, and shared transport/introspection checks passed 15 tests.
Ruff passed on changed Python files; response-model coverage passed for all four
services; `git diff --check` passed for the tracked implementation/contract files.

Tests use mocks for workspace persistence and realtime database access. A disposable
PostgreSQL token lifecycle case was skipped because `KSU_TEST_DATABASE_URL` was not
provided; a live multi-service/browser integration run was not performed. Main
validates Main-owned School/Department/Club existence; Library/Research/HERI retain
their own record lifecycle checks on domain requests. Activation verifies remote
scope assignments without querying another service's database.
