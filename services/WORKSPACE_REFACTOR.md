# Nine administrative workspaces

This refactor is in progress. `BACKEND_COMPLETION_MATRIX.md` is the single
completion matrix; its September 6 section is historical, not new evidence.

## HERI record ownership

HERI projects, publications and research themes are independently authored HERI
website records. Their theme IDs refer only to HERI's local theme catalog; they
are not Research service project/publication identifiers or duplicated writable
Research records. Changing a theme association does not change canonical owner.
Generic create/update/restore validate nondeleted theme references, and deletion
requires all nondeleted project/publication associations to be removed. HERI
partner records have a separate Research projection relationship. Their Research
partner/center identifiers are synchronization-owned. For linked projections,
Research maintains name/slug, descriptive text, logo/website/country, partner type
and level, relationship status, active and featured flags. HERI can maintain
relationship notes, display order and other locally stored fields not supplied by
the current synchronization mapping. Generic edits and audit restores cannot
rewrite source-maintained fields. Unlinked locally authored partners retain local
editing. Sync authority, durable jobs and conflict reconciliation remain open.

## MFA enrollment and login checkpoint

Main exposes `/api/v1/auth/mfa/enroll`, `/confirm`, and `/step-up`. Enrollment
requires the password, expires after ten minutes, and activates only after an
authenticator proof. Confirmation issues ten random recovery codes once and
stores only account-bound digests. It revokes other sessions and marks the
current session verified. Enrolled login requires a current authenticator or
unused recovery code; refresh preserves the verification timestamp. Password
reset retains MFA and revokes sessions through the existing reset command.

TOTP uses [RFC 6238](https://www.rfc-editor.org/rfc/rfc6238) with six digits,
30-second steps and one-step clock drift. Row locks and a consumed-counter
watermark prevent concurrent reuse. Shared rate limits bound proof attempts.
Secrets are encrypted with a separately configured Fernet `MFA_ENCRYPTION_KEY`;
missing/invalid keys fail closed with 503 and no ephemeral fallback. No real key
or enrollment was configured. Existing populated legacy MFA fields must be
audited before rollout; plaintext legacy secrets are not accepted as ciphertext.

Migration `20260907_0012` adds pending enrollment, recovery and session assurance
columns. The admin login form and shared types accept an optional code. Eighteen
focused authentication tests passed, including PostgreSQL proof races, recovery
reuse and session rotation. Auth-package and admin TypeScript checks passed;
changed Python files passed Ruff. The new migration itself has not yet been run.

Privileged-operation enforcement, enrollment/recovery account UI, complete
recovery/session lifecycle tests and downstream assurance propagation remain
open. This checkpoint does not establish privileged MFA enforcement.

## Ownership and contracts

Department graph mutations now share a transaction advisory lock and validate
ancestors with one recursive SQL query. UNION makes the inspection terminate
even for a pre-existing cycle. Self/ancestor cycles, inactive parents and
incompatible explicit owners are rejected. Concurrent opposite moves cannot
both commit. Structural edits detect stale hierarchy state after acquiring the
lock. Support sub-departments under the same wing remain valid; no existing
hierarchy or type data is rewritten by migration.

Active children block parent deactivation. Owner changes require reconciling all
nondeleted children, and School deletion counts child dependencies so inactive
sub-departments are not detached by hard deletion. The Main create route also
checks authority over a supplied parent department. Six graph/query/School
contract tests passed; the native PostgreSQL child/owner follow-up passed; Ruff
passed. Full data auditing, constraints/FK behavior and remaining direct writers
are still outstanding.

Integration attempt history is persisted by migration `20260907_0017` and
exposed through additive typed job fields (`attempts`, `retryable`, `history`).
Each observed completion/failure records its actual attempt number, finish time,
status and safe error. Existing jobs receive no invented history. Authorization
failure is terminal without manufacturing four attempts; terminal redelivery
does not append entries. Infrastructure failures that prevent error accounting
still reach the existing task's bounded retry path with sanitized error text.

The migration and PostgreSQL job/transaction checks passed (three tests), and
the focused infrastructure retry check passed; Ruff passed. Actual broker-loss
recovery and scheduled synchronization adoption still require verification/work.

School integration routes now support both programmes and lecturers with
separate `school.integrations.lecturers.preview` / `.sync` permissions (migration
`20260907_0016`, no account grants). Lecturer source filtering precedes returned
counts and execution. Duplicate department mappings and conflicting external
identifiers are not resolved arbitrarily. Existing profile department/source
conflicts require explicit reconciliation.

Lecturer identity names/email and source identifiers/avatar metadata are source
fields. Existing biography, qualifications, education, interests, skills and
publication/grant records remain locally maintained. Sync does not alter linked
accounts. New profiles and lecturer assignments are private pending review;
fixed lecturer assignments grant no workspace privileges and cannot import a
source-provided leadership role. Existing public visibility is retained.

Checks: affected checkpoint 13 passed, lecturer scope follow-up four passed,
preview follow-up five passed before the additional creation test, PostgreSQL
job/dispatch tests two passed; Ruff passed. Durable snapshots, explicit conflict
resolution and catalog migration execution remain outstanding.

Lecturer preview no longer executes mutations then rolls back the entire caller
transaction. Dry runs disable autoflush, calculate proposed create/update and
experience counts, and skip every entity mutation. They report zero persisted
records. New/existing lecturer preview cases and the worker transaction check
passed (three tests); Ruff passed. Lecturer scope and field-ownership policies
remain to be completed before exposing this operation to School users.

School programme integration endpoints are available under the School Portal's
`/integrations/programmes` prefix: preview, trigger and job status. They use
verified selected School context and separate
`school.integrations.programmes.preview` / `.sync` capabilities; programme
management alone grants neither. Migration `20260907_0015` registers permissions
without assigning them. Scope survives durable dispatch, and the worker checks
current grants and active School state before executing the canonical service.

The external programme feed identifies departments by name. Matching therefore
resolves a unique canonical department (including aliases) before selecting the
school; ambiguous names require reconciliation rather than last-row-wins
matching. Only selected-school source rows contribute to preview counts and
apply results. Existing ownership mismatches cannot transfer a programme.
Internal department metadata is used for ambiguity resolution; foreign source
records and their aggregate counts are not returned to school callers.

Verification: 11 integration tests with PostgreSQL passed; expanded scoped
mutation/preview policy follow-up passed 10; Contracts passed 40; Ruff passed.
Lecturer scoping, durable preview snapshots, explicit conflict resolution and
the new permission migration's execution remain to be completed.

Integration triggers accept optional `Idempotency-Key` and `X-Request-ID` headers
without changing existing payloads. Migration `20260907_0014` stores a digest
unique per actor/integration and the original correlation ID. PostgreSQL conflict
handling returns the existing authorized command without generating another
outbox event. Replay does not replace the initiating session or revive an expired
command; an intentionally new synchronization needs a new key. The same-key
concurrent trigger test proves one job and one outbox row. Seven focused
integration tests, including both job migrations, and Ruff passed.

Global integration triggers now create `integration_jobs` and an outbox dispatch
record atomically. Migration `20260907_0013` adds actor/session, integration,
authorized scope, safe results, attempts and execution timestamps. Status reads
use the owning job record instead of arbitrary Celery result IDs and require
current authority plus ownership or explicit platform authority. Old task IDs
without a durable job return 404; consumed response envelopes remain compatible.

The new command uses the existing `main.integrations` queue. It rechecks current
account/session/assignments/MFA, locks the job against duplicate execution, and
commits business mutations and success together. Failures roll back business
updates, retain safe errors, and retry at most three times after the initial
attempt. Late acknowledgment permits worker-loss redelivery; completed jobs
return their stored result. This behavior has local database evidence but has
not yet been tested against a real broker loss. Dispatch is private and does
not publish the job payload to the public domain-event stream.

Eight focused tests passed, including actual migration, atomic rollback,
concurrent replay and revocation. Ruff passed. School-specific jobs, request
idempotency/correlation, detailed attempt history and scheduled-task adoption
remain outstanding.

Digital Kisii integration checkpoint: existing global endpoints require matching
global authority plus recent MFA. A school assignment no longer authorizes a
global fetch/apply/status operation. School-specific integration commands remain
to be implemented. Programme updates treat code, external source identifiers,
external name and qualification level as externally authoritative. Existing
display name, editorial descriptions, curriculum/career text and imagery remain
locally maintained. A department mismatch is reported for explicit reconciliation
without mutating the record's owner. Six focused policy/transaction tests and
Ruff passed. Durable scoped jobs and lecturer field policies remain incomplete.

Authenticator replacement is now supported from account security using the
password and an existing authenticator or unused recovery code. The existing
factor remains active during the ten-minute pending replacement. Confirmation
atomically installs the new factor, replaces recovery codes, verifies the
current session and revokes other sessions. Session assurance mutations have
moved into the canonical MFA service. An invalid session rolls back proof
consumption. Generic user updates still cannot toggle MFA.

Verification: 11 MFA/status checks passed with PostgreSQL, plus the MFA migration
upgrade/downgrade test; three UI flows, admin typecheck, four generic-account
bypass tests and Ruff passed. Migration verification preserved synthetic legacy
credentials without creating assurance for old sessions. Full migration-chain
and remaining privileged-operation coverage are still unverified.

The existing profile settings page now contains authenticator enrollment and
step-up controls. Setup keys and recovery codes stay in component state; setup
keys are removed after confirmation and recovery codes after acknowledgment.
The status endpoint exposes no secrets or recovery digests and sends no-store.
Factor submission requests retain cookies while disabling automatic refresh
retries, so invalid proofs do not trigger an unintended repeated command.
Two UI flow tests, admin typecheck, three auth endpoint tests, the safe-status
test and changed Python lint passed. Authenticator replacement and remaining
recovery lifecycle behavior are still pending.

Custom workflow assurance adoption: Research canonical creation, publish and
withdrawal reject insufficient assurance before changing visibility or recording
provenance. Main custom content/club-media approval and publication guards use
current session assurance attached to the authenticated User. HERI's common
operation evaluator checks assurance for direct transitions and audit restores.
This extends coverage beyond standard dependencies; it does not prove every
custom command or worker path has adopted the policy.

Checks: Research 20 passed with PostgreSQL; Main custom guards 25 passed; HERI
14 passed/1 skipped plus three new workflow-assurance cases passed; Ruff passed.

MFA assurance now travels through the fresh internal identity snapshot, replacing
any signed `mfa_enabled` or `mfa_verified_at` claim. Main obtains the timestamp
from the session matching the current token JTI. `ksu_contracts.assurance` defines
the initial privileged-operation catalog; all four services' standard permission
dependencies require an enrolled factor verified within 900 seconds. Missing,
future, malformed and expired timestamps deny with 403 and an
`X-Authentication-Action` enrollment/step-up hint. Refresh cannot extend this age.
Custom command guards and remaining privilege surfaces still need adoption.

Verification: Contracts 40 passed; Common 187 passed/27 skipped; Main focused
authentication/internal checks 13 passed/1 skipped. The skips in this follow-up
were infrastructure cases, not newly verified database behavior.

Main owns users, sessions, assignments, organization, academics, people, CMS,
communications, admissions, inquiries, clubs and institutional integrations.
Research owns research, publications, funding, innovation, Farm and Sustainability.
Library owns branches, resources, circulation and assistant operations. HERI owns
its website content and submissions. Workspaces are views over these applications,
not separate identities, databases or copies of canonical records.

`ksu_contracts.workspaces` defines the nine workspace identities, capability
surfaces, scope choices and context response. `/api/v1/workspaces` and
`/api/v1/workspaces/{workspace}/context` derive context from current assignments.
The catalog describes available capabilities; it does not provision them.
Staff self-profile remains an account capability. Assignment to a workspace
does not itself permit all actions in that workspace.

The explicit `platform.admin` permission represents platform authority. It must
have a global/institutional scope. Selecting another workspace preserves the
original actor ID. Business validation and database integrity still apply.
Privileged MFA and full workspace/scope audit adoption remain unfinished.

School publications continue through Main's v1 facade into Research's canonical
publication endpoints. Both services validate school assignments. `X-School-ID`
is optional for a single assignment and resolves ambiguity for multiple schools.
The facade forwards actor authorization, selected school, request correlation and
an existing `Idempotency-Key`. It preserves downstream error status and details.

HERI's research-like tables currently represent independently authored HERI
website content. They do not replace Research's canonical operational records.
Existing linked partner projections require further information-flow review;
no new dual writes were introduced.

## Authentication and freshness

Accepted transports are Bearer, `ksu_access`, then legacy `access_token` cookie.
An explicitly malformed Authorization header does not fall back to cookies.
Signature, configured key ID, issuer, audience, expiry, activation time, subject,
JTI and access-token type are verified. Anonymous public reads retain their
existing behavior. Optional identity falls back only to public authority.

Research, Library and HERI then POST the user token to Main's internal
`/api/v1/internal/auth/introspect`, with their existing `MAIN_SERVICE_API_KEY`.
Main checks the active, unrevoked, unexpired session and active account, and
returns current assignments. The service key alone is insufficient. Downstream
services replace all stale role/permission claims with this result.

There is no authorization cache or stale fallback. Maximum cached stale access
is zero; a request already authorized before a concurrent revocation may finish.
The entire introspection request has a two-second deadline with no retry or
redirect. Invalid sessions return 401; inability to establish freshness returns
503. Failure cannot authorize private data. This adds one bounded Main call per
authenticated downstream request; capacity and deployment validation remain open.

Structured assignments are authoritative. Empty assignments cannot gain access
from role names or flat JWT permissions. Missing scope denies record authorization.
Existing role templates remain available for provisioning, not runtime escalation.

## Security corrections implemented so far

- Department list predicates run before counts/pagination; detail access checks
  ownership. Ordinary edits no longer require unrelated parent authority, while
  parent/type changes require separate checks. Hierarchy constraints still need work.
- Research domain alternatives compile as SQL OR predicates. Unrelated management
  and review permissions cannot remove domain restrictions. `research.oversight`
  is an explicit capability; migration of legitimate existing assignments is pending.
- School context no longer expands capabilities just because a role is named
  `school_admin`; active assigned schools and explicit permissions are required.
- Content approval, schedule, publication and unpublication use separate checks.
  Club/contributor authority does not publish. A separate publishing assignment
  permits the real actor to publish even when they own the record.
- Library returns and renewals lock the loan row; copy updates also lock the
  resource row. Pending/ready reservation positions use the maximum existing
  position rather than a count that can reuse a live position after cancellation.
- HERI generic resource routes use media/submission/analytics/social capabilities
  equivalent to those resources. HERI capabilities must have global or HERI scope.

## Reproducible checks and local infrastructure

Run services in separate processes because each application imports as `app`:

```powershell
python scripts/run_backend_tests.py --parallel --max-workers 2 common contracts main research library heri_africa
python scripts/ci_environment.py main python -m pytest services/main/tests/test_department_query_policy.py services/main/tests/test_school_publication_forwarding.py services/main/tests/test_workspace_workflow_policy.py -q
python scripts/ci_environment.py research python -m pytest services/research/tests/test_workspace_domains.py services/research/tests/test_research_domains.py -q
python scripts/ci_environment.py heri_africa python -m pytest services/heri_africa/tests/test_resource_policy.py services/heri_africa/tests/test_workflow_security.py -q
```

For material database behavior, set `KSU_TEST_DATABASE_URL` to a disposable
PostgreSQL database, then run
`python scripts/ci_environment.py library python -m pytest services/library/tests/test_circulation_concurrency.py -q`.
Tests create and remove uniquely named schemas and must never target production.

This task started an isolated native PostgreSQL 18 cluster at
`.tmp/workspace-policy-pg-20260907/data`, bound only to `127.0.0.1:55449`, with
16 maximum connections and a test-only `workspace_test` identity. It contains no
real accounts. Keep it available while the refactor runs and stop it afterward
with PostgreSQL 18 `pg_ctl -D <that absolute path> -m fast -w stop`.
Docker returned HTTP 500; native PostgreSQL allowed the circulation concurrency
test to run successfully without Docker.

Remaining implementation includes privileged MFA and recovery, complete selected
workspace enforcement/audit, action-specific Research workflows and relationships,
scoped durable integration jobs, remaining domain policies/field rules, secure
reports/exports/live updates, migrations and final compatibility verification.

## Subsequent Research command checkpoint

Research workflow commands now evaluate action and record within the same grant.
Farm publishing plus Sustainability viewing cannot publish Sustainability records.
The legacy approve-and-publish command requires both review and publish rights;
submit and withdrawal enforce current state. Commands lock the target row, and
the review queue applies action-specific SQL ownership alternatives before paging.
Generic CRUD cannot directly change publication state or revise pending/live
records. Twenty focused action, transition and generic-bypass tests passed.
Boolean-only models still need separately persisted pending/rejected states and
workflow provenance; full domain adoption and reports remain incomplete.

## Persisted Research editorial-state checkpoint

Research migration `20260907_0015` adds editorial_state to research_farms,
focus_areas and impact_metrics. Existing public rows backfill to published and
hidden rows to draft; it does not invent submission history. A database check
constraint restricts the state vocabulary. Approval now requires pending state
for every model, including these three. The review queue includes their pending
records, and public SQL requires both published state and existing visibility.
The new internal column is omitted from generic v1 field-selected responses.

Native PostgreSQL migration testing verified the backfill and rejection of
invalid states. Affected workflow/public tests passed (40), and the subsequent
contract/transition checks passed (14). Workflow provenance, remaining canonical
service adoption, domain associations, MFA, integrations and reporting remain open.

## Research workflow provenance checkpoint

Canonical Research workflow routes now delegate to a reusable service command.
The command locks the record, checks action and ownership, changes state and
inserts a ResearchWorkflowEvent in the caller's transaction. Events retain the
actual actor/session, previous and target state, and optional note. Migration
`20260907_0016` adds the service-owned event table and history index.

The paginated record-history endpoint rechecks access to the underlying record
and excludes session identifiers from its response. Existing records receive no
invented history. Automatic create submissions, dedicated publication workflows
and other write paths still need provenance adoption.

The native PostgreSQL test executed the migration and verified successful commit,
atomic rollback, recorded actor/note and cross-domain history denial. Together
with workflow and transition policy tests, 39 tests passed. Changed-file Ruff
passed. This checkpoint does not establish completion of the overall refactor.
## Research creation authority and provenance

Authenticated generic editorial creation uses create_editorial_record, which
records the initial state with previous_state `absent` in the caller's transaction.
Creation/edit authority alone produces a draft. Automatic submission requires
the same domain's submit capability; publication requires its publish capability.
This corrects the prior behavior that submitted every nonpublisher's new record
without checking submit authority. Existing payloads and envelopes are retained.

The focused workflow checks passed 45 tests. The native PostgreSQL provenance
test also passed after exercising the real Partner service for creation commit
and rollback. Changed-file Ruff passed. Dedicated workflows, other domains and
the remaining completion-matrix requirements remain outstanding.
# Library durable assistant notifications (7 September 2026)

Library migration `20260907_0012` adds an encrypted notification outbox. The API
commits verification/recovery credentials and delivery intent together; the
existing Library worker/Beat drains `library.notifications.deliver` every five
seconds. Claims use a 60-second lease, fencing tokens, five bounded attempts and
safe failure codes. Successful, expired and exhausted jobs erase the encrypted
payload. No notification payload or recovery credential is published as a live
event or returned by an administrative queue endpoint.

Set `NOTIFICATION_ENCRYPTION_KEY` to the same Fernet secret on Library API and
workers before enabling these mail flows, and apply the migration before the
worker task runs. Missing/invalid encryption configuration fails enqueue with
503 instead of storing plaintext or claiming delivery. Retain the key until its
pending queue drains; changing it strands encrypted jobs. No deployment or real
secret was configured during this task.

The SMTP handoff remains at-least-once: a stable Idempotency-Key is forwarded to
Main, whose email endpoint now explicitly persists successful canonical command
receipts and rejects mismatched replay payloads. Transient failures roll back the
receipt so a retry can send again. A crash after SMTP acceptance but before the
receipt commits can still cause a duplicate; SMTP cannot atomically join the DB
transaction. Operational replay tooling remains unfinished. Existing
HTTP success means queued delivery; provider failures are retained/retried by the
worker rather than swallowed in the request transaction.
