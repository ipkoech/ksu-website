# Backend transformation completion matrix

## Nine-workspace refactor — 7 September 2026

- **Library attachment authorization boundary (7 September 2026):** Library’s cross-service media resolver is intentionally limited to public media enrichment and does not authorize authenticated attachment references. User-owned upload validation therefore remains open pending a Main user-context media authorization contract.

- **Research workflow migration regression (verified 7 September 2026):** focused workflow provenance and canonical command tests passed (30 passed) after the schema-qualified/idempotent migration changes.

- **Library notification-outbox native regression (verified 7 September 2026):** disposable PostgreSQL coverage passed (1 test) for encrypted payload storage, rollback safety, concurrent leasing, delivery completion, retry backoff/failure classification, stale-claim protection, and terminal failure cleanup.

- **Admin API-client compatibility check (verified 7 September 2026):** `frontend/apps/admin` TypeScript compilation completed with `tsc --noEmit` and no diagnostics. This verifies current client typing against the changed API contracts; it does not establish full frontend behavior coverage.

- **Four-service clean migration gate (verified 7 September 2026):** after schema-qualifying Research revisions `0015`/`0016` and making Library revision `0012` idempotent, clean disposable upgrades for Main, Research, Library, and HERI all reached their heads successfully. Targeted migration Ruff passed; disposable schemas were removed afterward.

- **Library notification-outbox migration fix (verified 7 September 2026):** revision `20260907_0012` now uses idempotent schema-qualified table/index creation, avoiding the metadata-created table conflict in the fresh-chain harness. A clean disposable Library upgrade reached head `20260907_0012`; targeted Ruff passed. The disposable schema was removed afterward.

- **Research editorial migration schema fix (verified 7 September 2026):** revision `20260907_0015` now qualifies all column, data-update, constraint, and downgrade operations with the `research` schema. A clean disposable upgrade reached Research head `20260907_0016`; Main and HERI also reached head. Targeted Ruff passed. Library still has a separate fresh-chain `notification_outbox` ordering failure.

- **Native fresh-schema migration attempt (7 September 2026):** disposable schemas were created and cleaned up after the run. Main and HERI applied successfully; Research requires its `research_farms` bootstrap relation before a later editorial migration, and Library encountered a partial outbox-table prerequisite after the first failed pass. This confirms applied-chain verification needs the repository’s documented bootstrap sequence; no production or persistent shared schema was changed.

- **Applied-schema migration gate (7 September 2026):** all four Alembic graphs resolve to one head, but `current --check-heads` against the currently running native instance cannot proceed because its service schemas are absent (`InvalidSchemaNameError`). Existing isolated-cluster migration evidence remains separate; no production or shared-instance schema was created.

- **Main migration-head verification (verified 7 September 2026):** running Alembic with `service_environment("main")` and the service working directory resolves one head, `20260907_0022`. Together with the Research, Library, and HERI single-head checks, all four migration graphs currently have one head.

- **Shared authentication contract sweep (verified 7 September 2026):** token verification, bearer/cookie transport precedence, identity freshness failure handling, and private-cache authorization tests passed (35 passed). Only upstream deprecation warnings were emitted.

- **Native auth/session regression sweep (verified 7 September 2026):** with the disposable PostgreSQL URL exported, refresh rotation, MFA, workspace visits, and realtime access-revocation tests passed together (27 passed). This strengthens the lifecycle evidence beyond isolated unit coverage.

- **Refresh rotation native verification (verified 7 September 2026):** reran the Main refresh regression with `KSU_TEST_DATABASE_URL` explicitly pointed at the configured disposable PostgreSQL instance. Row-locked rotation, replay rejection, and concurrent single-use behavior passed (1 test), closing the earlier environment-only verification gap.

- **Authentication assurance audit (verified 7 September 2026):** MFA enrollment, replacement, recovery-code consumption, step-up, and session invalidation passed focused coverage (10 passed, 2 skipped). Refresh rotation inspection confirms row-locked single-use refresh sessions and logout revocation; the native refresh regression is environment-skipped in this run and remains a verification gap.

- **Generic-import scoped PBAC revalidation (verified 7 September 2026):** worker execution now builds a current actor payload from active role permissions and active scope grants, then evaluates the configured import capability through shared `authorize_permission`. Scoped Research assignments are no longer reduced to flat permission-name checks. Integration-job tests passed (2 passed, 1 skipped); Ruff passed.

- **Durable worker authorization audit (verified 7 September 2026):** Main digital-sync jobs lock their durable record, reload the actor and session, rederive current grants/MFA, and validate the scoped school before execution. HERI publication dispatch now uses durable queued rows with bounded locking and bounded Celery retries; provider delivery and retry reconciliation are implemented locally; deployed provider and broker validation remain open.

- **Main generic-import execution revalidation (verified 7 September 2026):** durable import workers now reload the initiating active account with current role assignments and require the configured resource permission immediately before committing rows. Missing or revoked actor context fails before mutation; integration-job tests passed (2 passed, 1 skipped) and Ruff passed. Cross-service Research import actor propagation is now covered by signed actor context; broader endpoint adoption remains open.

- **School-team import execution revalidation (verified 7 September 2026):** the durable worker now reloads the actor with active role/permission assignments, resolves the requested school through the canonical school-portal context, and requires `school.team.bulk` immediately before processing rows. Revoked or expired assignments therefore cannot continue a queued import. Integration-job tests passed (2 passed, 1 skipped); targeted Ruff passed.

- **Cross-service import context audit (verified 7 September 2026):** Main now signs the queued actor context with the Research internal credential at worker execution, and Research verifies it before assigning audit actor IDs. Signed-context regression coverage passed (2 passed).

- **Internal identity-introspection audit (verified 7 September 2026):** Main’s `/internal/auth/introspect` requires the internal service key, then resolves the caller through the active-session dependency before returning current person, MFA, and assignment data. Sibling-service freshness validation therefore cannot bypass revocation or stale grants. No code change was required.

- **Cross-service authentication lifecycle audit (verified 7 September 2026):** Research and Library current-user dependencies use Main-backed identity freshness validation, while Main’s authenticated dependencies require active, nonrevoked sessions. Shared identity-freshness coverage passed (8 tests). Logout/revocation behavior remains represented by the existing Main auth service and was not changed in this audit.

- **Main notification ownership audit (verified 7 September 2026):** user notification list, read, archive, delete, and preference paths bind queries or mutations to the authenticated user; school-portal notification detail paths additionally require the school scope and school ID. No cross-account notification path was found. Existing notification response-contract coverage remains green.

- **HERI public-cache mutation timing audit (verified 7 September 2026):** the service response hook invalidates the `public` cache prefix only after successful API mutations, while ignoring failed responses, reads, and audit writes. Focused timing coverage passed (1 test). This verifies hook timing; resource-specific cache-key coverage remains delegated to the shared cache implementation.

- **Main durable integration-job ownership audit (verified 7 September 2026):** `read_job` already binds status reads to the requesting actor, integration, and stored scope, with platform-admin override still requiring explicit authority and recent MFA. Native integration-job and digital-sync policy coverage passed (12 passed, 1 skipped); no change was required.

- **Main async import artifact ownership (verified 7 September 2026):** asynchronous import results now retain the queuing account in a private result field, and completed job status requests return 404 across accounts before result validation. Ruff and compilation checks pass. Pending broker state still has no durable account registry.

- **Research export artifact ownership (verified 7 September 2026):** completed Celery export results now carry the requesting account identifier, and status/download endpoints reject completed jobs whose owner differs from the authenticated Research reporting principal. This closes cross-account artifact retrieval while retaining the existing `research.manage_reports` gate. Ruff and the focused Research domain authorization suite pass (32 passed). Pending-job metadata remains broker-owned and is not exposed as an account-level listing.

This section tracks the current specification. The older checkpoint below is
historical evidence and does not establish completion of this refactor.

Library assistant message-pagination checkpoint (7 September): staff conversation
detail now accepts bounded message_limit (1–100) and message_offset (0–1000)
parameters while retaining the default newest 100 window. The SQL row-number
loader applies offset/limit per conversation, so older messages can be fetched
without unbounded relationship loads. Native PostgreSQL page-window coverage and
assistant policy checks passed (14), with targeted Ruff. List responses remain
bounded to the newest window and do not yet expose total/has-more metadata.

Library assistant message-bound checkpoint (7 September): staff conversation
detail and list reads now load at most the newest 100 messages per conversation
using a partitioned SQL row-number query. The previous unbounded select-in-load
was removed; ordering is stable by timestamp and ID, and relationship state is
set without triggering lazy N+1 reads. Native PostgreSQL bound-read coverage
passed (1), all assistant-focused tests passed (23, 3 environment skips), and
targeted Ruff passed. Older messages remain available through future pagination
work; current response contracts still return only this bounded window.

HERI public configuration authority checkpoint (7 September): generic create and
update now require publish authority and MFA for always-public configuration
resources (site settings, navigation, hero/footer, chair, team and impact
metrics), even where the model has no visibility flag. Visibility-flag checks
remain enforced for other records. Content-write alone is denied. Focused policy
and public-query checks passed (7 tests, one environment skip); targeted Ruff
passed. Per-resource editorial capabilities and cache invalidation evidence remain
open.

HERI visibility authority checkpoint (7 September): generic create/update now
requires heri.content.publish (and its MFA assurance) when changing status-less
public flags such as is_visible or is_active. Content-write alone cannot publish
navigation, hero, footer, team or chair records by toggling a flag. Focused policy
checks passed (6, one environment-skipped database case); targeted Ruff passed.
Delete/read cache invalidation and full visibility-field audit coverage remain
open.

HERI public deletion checkpoint (7 September): chair, site settings, navigation,
hero slides and footer queries now exclude soft-deleted records in SQL. Native
PostgreSQL verification covers all five underlying queries with an older deleted
record and a live record; focused public/response checks passed (3), as did
targeted Ruff. This check bypasses cache/rate-limit decorators to exercise the
queries and does not establish cache-invalidation timing. Publishing authority
for status-less visibility-flag records remains open.

HERI sync apply assurance checkpoint (7 September): sync rechecks permission and
MFA against its validated actor after external fetch and after acquiring the apply
lock. A five-second database lock timeout bounds contention; advisory-lock timeout
returns safe 503 with Retry-After and the caller rolls back. Focused sync tests
passed (22); a subsequent native held-lock regression passed (1), proving bounded
busy behavior. Targeted Ruff passed. This does not re-introspect assignments
mid-command; durable workers still need fresh execution-time identity validation.

HERI canonical sync checkpoint (7 September): fetch pagination/deadlines,
relationship validation, serialized apply and reconciliation now live in one
partner_sync service operation. It enforces HERI sync permission and recent MFA
before fetching, preserves the real actor, and leaves transaction ownership with
the caller. The existing HTTP endpoint is an adapter with unchanged path/method
and result shape. Focused/native sync tests passed after extraction (18); expanded
service-authority/adapter tests passed (20), with targeted Ruff. This prepares
worker reuse but does not implement durable jobs, leases, retries or scheduling.

HERI missing-source reconciliation checkpoint (7 September): after a complete
fetch, sync marks absent linked Research projections inactive in SQL, preserving
local notes and independently authored partners. Reappearing source records
reactivate the same projection. Pagination now rejects inconsistent totals and
unexpected page numbers. The additive deactivated result count is typed and shown
by the existing admin sync result. Focused/native sync and response tests passed
(18), final pagination checks passed (17), targeted Ruff and admin TypeScript
checks passed. Visibility removal still depends on a successful sync; automatic
refresh/freshness guarantees and durable reconciliation execution remain open.

HERI sync apply checkpoint (7 September): the existing synchronous command now
serializes apply phases with a transaction advisory lock and batches existing
projection loading in one ordered row-lock query. Canonical duplicate/invalid
source identities and existing duplicate projections fail before writes. Multiple
center links for a single-slot projection now require explicit reconciliation
instead of last-row-wins selection, including across fetch batches. Native
PostgreSQL competing sync proves one projection, later source updates preserve
local notes/order, and audits retain the real actor. Focused sync tests passed
(16); targeted Ruff passed. This is not durable job/retry implementation and does
not resolve multi-center projections or upstream snapshot freshness.

HERI sync pagination checkpoint (7 September): partner and center fetches now
follow Research's pages metadata, falling back to short-page termination for
legacy responses, within the existing total deadline. All collected centers feed
100-center relationship batches. Empty intermediate pages, repeated/missing IDs
and more than 100 pages fail before local changes rather than silently applying a
truncated snapshot. Relationship responses have a separate bounded capacity.
Focused pagination/failure/fallback tests passed (14), with targeted Ruff. Durable
large-snapshot execution, snapshot consistency during upstream changes, missing-
record reconciliation and relation cardinality semantics remain open.

HERI sync fetch boundary checkpoint (7 September): the complete external snapshot
phase now has a 30-second deadline before local writes. Partner, center and
relationship payloads accept bounded list/envelope collections; failed center or
relationship requests no longer masquerade as empty associations. Timeout maps
to 504, upstream/shape failures to a safe 502, and cancellation propagates without
starting local writes. Legacy relationship fallback remains within the deadline.
Focused sync tests passed (10), including no-write failure/cancellation checks;
targeted Ruff passed. Complete source pagination, durable jobs and reconciliation
remain unfinished; current first-page limits are not full-source synchronization.

HERI sync authority checkpoint (7 September): partner synchronization now requires
heri.integrations.sync in HERI scope, with recent MFA through the shared assurance
catalog. Content-write and foreign-scope grants no longer authorize sync. Main
migration 0022 registers the capability without changing assignments. Focused
route-dependency/assurance tests passed (13), native permission migration checks
passed (2), and targeted Ruff passed. Existing legitimate integration operators
need deliberate assignment before rollout. Durable job execution, bounded fetch
chains, retries and conflict reconciliation are still incomplete.

HERI partner field ownership checkpoint (7 September): generic payloads cannot
rewrite Research partner/center identifiers. Linked projections reject changes
to fields maintained by the current sync mapping, including through audit
restore, while same-value fields and local notes/display order remain supported.
Unlinked partners retain local editing. Sync locks and refreshes existing rows
before writes. Focused scalar/sync tests passed (12); resource policy/adapter tests
passed (5), including update and restore denial before mutation; targeted Ruff
passed. Durable integration jobs, separate sync authority, global time bounds and
conflict reconciliation remain incomplete.

HERI theme association checkpoint (7 September): generic project/publication
create/update/restore validate local nondeleted themes under shared parent locks.
Theme deletion locks its row and rejects any nondeleted project/publication
association. Clearing an association remains supported. Native PostgreSQL checks
passed for both child types, unavailable references, deletion denial and unlink-
then-delete; targeted Ruff passed. HERI research-like content is documented as
independently authored HERI-owned content, with local theme associations. Partner
Research projections and a dedicated association/deletion race check remain open.

HERI editorial creation/read correction (7 September): generic creation now
explicitly starts PublicationStatus resources in draft, and ResearchTheme's ORM
default is draft. A write-only creator cannot publish via the previous theme
default or supplied status. Seed themes already explicitly declare published
status and retain their behavior. Generic detail reads no longer invoke the
mutation-only parent draft guard, restoring authorized published-page section
reads. Restore treats an unchanged snapshot status as a no-op while retaining
field revision restrictions. Focused/native tests passed (22), including these
creation/read cases; targeted Ruff passed. Theme relationship validation remains
unfinished and is not established by this checkpoint.

HERI scalar contract checkpoint (7 September): generic create/update/restore now
share scalar validation derived from persistence types. UUID and timezone-aware
datetime wire values parse consistently; invalid scalar types, lengths and
required-field nulls return 422 before mutation. Protected fields remain filtered.
Focused scalar/workflow/resource tests passed (35), and native create-update-audit
restore of a serialized timestamp passed (1 expanded regression); targeted Ruff
passed. Structured JSON shapes and domain relationship/business validation remain
separate unfinished work; this is not full schema parity for generic CRUD.

HERI canonical restore checkpoint (7 September): explicit transitions and audit
restore now share one validator deriving status and timestamp changes before
mutation. Restore consequently uses current transition permission/assurance,
future schedule validation, publication timestamps, and cancellation cleanup.
Native restore verification confirms the saved schedule is cleared, visibility
stays private, and the restore audit preserves the prior timestamp and real actor.
Focused policy/concurrency tests passed (22), expanded restore regression passed
(1), and targeted Ruff passed. Non-workflow restore field typing and all domain
relationship validations still need review.

HERI schedule semantics checkpoint (7 September): scheduling now validates a
timezone-aware future instant, accepting optional scheduled_at on both transition
adapters or an existing record timestamp. Invalid/missing times are rejected;
schedule audit stores the normalized timestamp. Explicit publication records its
timestamp and cancelling a schedule clears it. Existing read-time due visibility
is preserved; no publication worker exists or was added. Once a scheduled record
is already public, cancellation requires unpublish authority, including restore.
Focused workflow/response tests passed (23); expanded native schedule/cancel and
visibility check passed (1); final policy tests passed (28), with targeted Ruff.
Durable scheduler provenance/freshness and full canonical restore remain open.

HERI editorial authority checkpoint (7 September): approval, scheduling/canceling
a schedule, publication, and unpublication now require distinct permissions.
Review no longer approves; publish no longer schedules or unpublishes. The shared
assurance catalog already enforces recent MFA for the new actions. Main migration
0021 registers approve/schedule/unpublish without modifying assignments; the
versioned publisher template includes these explicit capabilities for deliberate
future provisioning. Focused policy tests passed (21), native workflow regression
passed (1), and the native permission migration repeatability/retention check
passed (1); targeted Ruff passed. Legitimate existing assignments must be reviewed
before rollout. Scheduling execution semantics remain incomplete.

HERI integration verification (7 September): the complete current HERI service
test directory passed with native PostgreSQL enabled (31 tests). A subsequent
targeted PostgreSQL check adds overlapping parent transition and section edit:
the editor preloads a draft page, waits while the transition holds its lock,
then rejects the edit after the parent commits in_review; section data remains
unchanged. That updated test passed and targeted Ruff passed. This closes the
specific parent/child concurrency test gap below, not the remaining HERI feature
or cross-service completion gaps.

HERI page-section checkpoint (7 September): section create/update/delete/restore
now validate and lock the parent page before the child. Missing/deleted parents
are rejected and non-draft parents prevent section changes. Generic changes to
page_id are rejected pending an explicit authorized transfer command; same-page
updates remain supported. Canonical audit serialization now handles UUID/date
values so valid edits commit with their audit. Focused workflow and audit tests
passed (16), including native section creation and published-parent mutation
denials; targeted Ruff passed. Explicit section transfers remain unsupported,
and a dedicated parent-publication/section-edit race test remains outstanding.

HERI revision checkpoint (7 September): dedicated news edits and generic
edit/delete/restore load locked, refreshed records. Editorial content requires
draft state for field changes; deletion permits draft or archived records.
Restore rejects read-only resources and applies the same revision check before
restoring fields. These are intentional security corrections to write-only
access on submitted/published content. Focused state and PostgreSQL tests passed
(15); added native dedicated/generic edit and deletion parity checks also passed
(1 rerun). Targeted Ruff passed. The PostgreSQL fixture now isolates enum types
inside its disposable schema. Parent-owned page sections, full canonical restore
consolidation, and workflow capability separation remain open.

HERI transition checkpoint (7 September): dedicated news and generic editorial
transition endpoints now invoke one canonical service operation. It locks and
refreshes the record, derives permission from its current workflow state, checks
current assurance, and writes the real actor's audit in the caller transaction.
Native PostgreSQL competing publication checks prove one transition and one
audit; stale MFA is denied. Focused workflow suite passed (6 tests) and targeted
Ruff passed. Restore, edit/revision restrictions, scheduling semantics, and
remaining dedicated/generic parity are still incomplete.

Main person mapping verification (7 September): a native PostgreSQL HTTP check
now exercises introspection's actual lookup against a disposable persons
projection with the unique account-link constraint. Active linked persons are
returned; inactive, deleted, and unlinked persons are omitted, while the real
account subject is preserved. This test and the email replay regression passed
together (2 tests). Authentication dependencies are overridden in this focused
mapping check; it does not establish full migration or authentication coverage.

Library reply identity checkpoint (7 September): Main identity introspection
now resolves the active, nondeleted linked person in its own database. The
shared freshness client validates and replaces that mapping on every request,
including clearing stale links. Replies store the linked person or null, retain
the actual account in message provenance, and auto-assign only an active Library
staff person in the current branch. Account UUIDs are no longer written as person
UUIDs. Focused freshness/workflow tests passed (21), as did targeted Ruff. Existing
incorrect historical assignments still require a provenance-aware data audit;
bounded conversation message loading remains open.

Library maintenance checkpoint (7 September): expiry and overdue schedules now
invoke canonical service transitions with ordered, bounded row locking and
SKIP LOCKED. Concurrent collection/return operations cannot be overwritten by
stale maintenance reads. Tasks commit each 100-row batch, process at most 20
batches per run, and leave excess or locked work for the existing next schedule.
Native PostgreSQL maintenance and circulation tests passed (2 tests); the
maintenance test was rerun after adding task-adapter drain/idempotence coverage
(1 passed). Targeted Ruff passed. Broker execution and production backlog sizing
remain unverified; no new scheduler was introduced.

Main nested command replay checkpoint (7 September): the generic installer now
refreshes included-router contexts and injects Request into rebuilt dependency
graphs. Existing endpoint-owned receipts remain recognized through strict
response validation, preventing double wrapping and permanent caching of
transient email failures. Missing generic idempotency headers preserve legacy
behavior. Native PostgreSQL HTTP verification passes with production-order
strict validation: nested replay executes once, authorization dependencies run
on each request, no-key requests execute, and email failure/retry/conflict remain
correct. Full Main route adoption and ownership rechecks remain to audit.

Main email handoff checkpoint (7 September): the internal email endpoint now
explicitly invokes canonical idempotency, namespaced by verified service-key
digest, with an optional stable request key. Successful receipts replay and
mismatched payloads conflict; failed SMTP calls roll back so retries can execute.
Native PostgreSQL HTTP test verifies transient failure followed by competing
retries produces one successful send/result; Ruff passed. Investigation found
the generic installer did not wrap the nested route in the test app despite
its intended coverage; broad installer/runtime adoption remains to audit. This
supersedes the earlier missing-receipt note. SMTP acceptance followed by process
failure before commit remains an unavoidable at-least-once duplicate window.

Library notification outbox checkpoint (7 September): verification/reply paths
enqueue encrypted payloads in their business transaction instead of sending
before commit or swallowing errors. Library migration 0012 and the existing
worker/Beat provide bounded polling, leases, fencing, five attempts, expiry and
safe terminal failures; delivered/terminal payloads are erased. Dedicated
NOTIFICATION_ENCRYPTION_KEY is required on API/worker (no real key configured).
Native PostgreSQL migration/rollback/encryption/concurrent claim/retry/fencing
checks passed; combined Library suite: 52 passed, no skips, three dependency
deprecation warnings. Changed-file Ruff passed. Main SMTP deduplication receipts,
real broker/delivery outage validation and operational replay tooling remain open;
delivery is at-least-once and uncertain acknowledgements may duplicate emails.

Assistant provider deadline checkpoint (7 September): provider calls have a
30-second outer timeout and use the existing local deterministic fallback on
timeout. Request cancellation propagates instead of becoming a persistable
fallback response. Two focused stalled-provider/cancellation tests and Ruff
passed. The deadline relies on cancellation-cooperative async providers; this
does not bound every database read, lock wait or complete assistant request.
Durable notifications and remaining workspace requirements remain open.

Library permission migration evidence (7 September): migrations 0018–0020 ran
against the real Permission table in an isolated PostgreSQL schema, twice each.
Eight catalog entries match the shared policy catalog; replay preserves an
existing disabled entry and a synthetic existing assignment, with no duplicate
entries or new grants. Downgrade retention behavior and revision linkage verified.
The native migration test and Ruff passed. This verifies those three catalog
migrations, not the full Main migration chain or production assignment rollout.

Assistant verification checkpoint (7 September): request/confirm serialize on
the guest row and reject repeat promotion; confirmation locks/reloads the newest
unused nondeleted challenge. Confirmation invokes the shared fail-closed Redis
limiter keyed to guest identity outside SQL rollback, so rolled-back attempt_count
increments are not the brute-force boundary. New conversations inherit their
context's Library branch instead of defaulting to central ownership. Native
PostgreSQL competing confirmations prove one conversation and correct branch;
the test substitutes the limiter and verifies calls across rollback, not Redis
runtime semantics. Focused test and Ruff passed. Real limiter integration,
notification outbox delivery and remaining ownership/recovery invariants remain
open.

Assistant recovery replay checkpoint (7 September): recovery locks the parent
conversation before locking and rechecking an unused, nondeleted recovery token,
matching reply/token-issuance lock order. Consumption and continuation rotation
remain in the caller's transaction. Native PostgreSQL competing recovery calls
prove one rotation only, rejection of the prior continuation, and continued
closed-thread enforcement after recovery. Expanded concurrency test and Ruff
passed. Email verification races/attempt accounting and durable notifications
remain open.

Assistant answer concurrency checkpoint (7 September): mutating guest and
continuation lookups now lock and refresh identity records before checking
expiry/consumption, while read-only lookups retain their prior nonlocking path.
Resolved/closed continuation threads reject answer generation before provider
work. Native PostgreSQL competing guest commands prove exactly one preview and
one provider call; closed continuation generates no message/provider call.
Focused test and changed-file Ruff passed. Verification/recovery token races,
provider lock duration budgets, durable notification delivery and remaining
workspace requirements remain open.

Assistant staff workflow checkpoint (7 September): generic status edits cannot
fabricate assignment or librarian-reply states; those require their commands.
Staff assignment/reply on resolved or closed threads requires an explicit reopen.
Whitespace-only replies fail before persistence. Ten focused staff policy and
workflow cases passed; changed-file Ruff passed. Guest/continuation answer races
and terminal-thread behavior, durable reply notifications and full identity
reconciliation remain open; these staff checks do not cover those paths.

Assistant conversation authority checkpoint (7 September): staff inbox/detail
requires private conversation-view authority. Assignment/status and reply
commands require their distinct manage/reply capability plus view authority in
the record's branch, with current row locking for mutations. Assignment targets
must be active Library staff in that branch. Inbox ordering includes an ID
tie-breaker. Migration 0020 registers capabilities without assignments. Four
focused policy/invalid-assignee cases and Ruff passed. Native conversation
concurrency, status transition invariants, reply outbox delivery, bounded message
loading and identity-to-person reconciliation remain open.

Assistant citation provenance checkpoint (7 September): retrieval uses current
public search titles/URLs instead of approval-time labels or URL overrides.
Approved source types are intersected with a configured allowed-type set; an
empty approved intersection avoids search entirely. Results remain restricted
to approved IDs, are deduplicated and use a consistent bounded limit. Two focused
tests and changed-file Ruff passed. Public context labels/URLs, broader source
loading bounds, assistant conversations and remaining workspace requirements
remain open.

Assistant public-source freshness checkpoint (7 September): public context lists
batch current source visibility/owner lookups across contexts, omitting revoked
public sources and incompatible branch references without altering stored
approvals. Public list/detail context queries require a public active parent
branch (central contexts remain supported). The public context-list endpoint
uses no-store instead of its prior 120-second cache. Native PostgreSQL checks
prove immediate source/parent privacy changes affect the response; seven focused
tests passed and Ruff passed. Source URL/title provenance, bounded context/source
loading and publication-time concurrent source changes remain open.

Assistant source approval checkpoint (7 September): canonical source replacement
validates record existence and same-branch ownership with batched per-type SQL;
central contexts remain subject to global context-management authority. Duplicate
references fail. Publishing revalidates approved sources against active/public
record and parent visibility, withdrawn catalogue status, public file access and
active policy/regulation state. Transfers recheck retained approved sources.
Context creation initializes its source collection to avoid implicit async lazy
loads. Seven focused authority/real-PostgreSQL relationship checks passed; Ruff
passed. Public context metadata freshness after source changes, concurrent source
visibility changes, source URL provenance and other assistant operations remain
open; this does not establish complete assistant safety/authorization.

Library service/assistant checkpoint (7 September): the combined Library suite
passed 29 tests with native PostgreSQL enabled before this assistant change.
Assistant context administration now uses separate view/manage/publish/unpublish
capabilities; canonical publishing and archiving enforce exact branch authority
and recent MFA. Canonical updates recheck locked ownership, enforce transfers,
and require unpublish authority before an active context is demoted by editing.
Migration 0019 registers capabilities without assignments. Six new canonical
authority/bypass cases and changed-file Ruff passed. Source ownership/approval,
conversation/assistant operations, migration execution and reviewed assignment
rollout remain open. The prior 29-test result does not include this later change.

Library nested public visibility checkpoint (7 September): guide list/detail
responses exclude inactive sections, deleted links and inactive/private or
foreign-owner specialists. Workflow list/detail responses exclude inactive
steps. Authorized editing projections retain inactive/private children.
Expanded native PostgreSQL guide test proves public/private projection separation
alongside the relationship invariants; it passed, and changed-file Ruff passed.
Attachment reference authorization and bounded relationship loading remain open.

Library guide relationship checkpoint (7 September): canonical guide/specialist
create and update validate active same-branch staff and specialist references;
duplicate specialist IDs fail before writes. Owner changes recheck retained
links, and specialist transfers reject incompatible linked guides. A shared
transaction advisory lock serializes guide/specialist graph mutations before
record locks. Existing rows are not rewritten; unrelated text edits do not
force legacy relationship reconciliation. Canonical exported guide schemas now
accept optional bounded sections/specialist IDs (previously discarded despite
service support), nested sections use the actual guide ID, and update responses
refresh replaced children. Native PostgreSQL rejection/reconciliation and
response checks passed; Ruff passed. Concurrent relationship stress evidence,
other linked fields (files/media/school/department) and full publication rules
remain open.

Library transfer locking follow-up (7 September): ownership-bearing updates now
lock the record and refresh its owner before the existing write/transfer guards;
corresponding engagement/context deletions and context transitions also lock.
Electronic deletion locks its owner; guide mutation ownership lookup locks the
parent electronic resource. Changed branch destinations must be active and
nondeleted and are held under a shared row lock for the transaction. Native
PostgreSQL competing-transfer test proves only one succeeds when both actors
started from the old owner; inactive destination denial verified. Six focused
tests passed, followed by the changed electronic-lock PostgreSQL test; Ruff
passed. Canonical-command adoption for all writers, related-child transfer
reconciliation and permission migration execution remain open.

Library transfer-capability checkpoint (7 September): seven existing owner-edit
adapters (electronic resources, assistant contexts, regulations, specialists,
guides, workflows and policy pages) require explicit library.transfer on both
old/new scopes plus recent MFA when ownership changes. Ordinary write checks
remain; unchanged ownership does not trigger step-up. Central destinations
require global authority. Main migration 0018 registers the permission only;
no real assignments changed. Five focused policy cases and changed-file Ruff
passed. Native migration execution, atomic ownership revalidation under competing
transfers, related-child ownership checks and full canonical-command adoption
remain open; endpoint guards alone do not establish those invariants.

Library electronic-resource checkpoint (7 September): private service reads can
load inactive resources for authorized editing/reactivation, while public reads
retain active-resource and public-parent predicates. Authorized private detail
responses include inactive guides; anonymous guide lists remain public-only.
Guide update/delete adapters now bind the guide to the resource in the URL.
The ownership lookup distinguishes valid central (NULL branch) resources from
missing/deleted parents without its former second-query fallback. Native
PostgreSQL visibility/reactivation/parent-mismatch test passed; changed-file Ruff
passed. Separate transfer/publishing capabilities and remaining field policies
are still required; this checkpoint does not establish complete Library PBAC.

Library snapshot follow-up (7 September): public resource/copy counters and
latest-snapshot selection now require an active, public, nondeleted parent
branch. Snapshot creation rejects reversed periods, negative counts/amounts,
and unavailable branches without modifying historical rows or response schemas.
Verified existing snapshot-list route checks exact branch authority; shared
authenticated caching includes current authorization claims. Focused checks:
7 passed including native PostgreSQL private-branch exclusion and HTTP guards;
changed-file Ruff passed. Full publication policy for manually entered statistics,
bounded snapshot history, provenance and reporting/export artifacts remain open.

Library operational reporting checkpoint (7 September): admin counters and latest
statistics selection now apply branch ownership in SQL. Loan/reservation and
electronic-guide ownership follows their resource; polymorphic tickets resolve
only supported branch/loan/electronic targets. Personal bookmarks have no branch
mapping and contribute no branch counts. Explicit platform authority resolves to
central scope; malformed missing-scope grants cannot widen valid branch grants.
Both existing admin stats URLs disable caching. Internal admin stats now requires
a current user token in addition to the service key (intentional security
correction; repository search found no caller of that internal URL). Public stats
URL/handler retained. Native PostgreSQL two-branch aggregate/snapshot test and
platform scope test passed; subsequent HTTP adapter tests passed (2 passed, 1
database skip in that invocation); missing-scope follow-up passed; Ruff passed.
These counters are not the full period reporting/evidence/export deliverable.

Library reservation checkpoint (7 September): canonical cancellation and staff
updates lock the resource before refreshing/locking the reservation, sharing
the creation lock order. Status transitions prevent reopening terminal holds
and prevent collection before readiness. Queue edits reject occupied active
positions and nonpositive/null positions; becoming ready supplies its timestamp.
Native PostgreSQL circulation test passed, extended to cover concurrent hold
creation, cancellation versus collection, terminal reopening, queue collision,
and foreign-requester cancellation. Changed-file Ruff passed. Branch field
policies, assistant operations, reports and full route adoption remain open.

Workspace scope availability checkpoint (7 September): Main discovery filters
inactive/deleted/missing School, Department and Club scope choices using one
bounded-ID query per represented entity type. Explicit selection checks apply
to platform actors too; shared context rejects unknown/incomplete scopes and
incompatible School/Department/Club scope types. Actor and session identity are
preserved without mutating the current authorization snapshot. Focused Main and
contract tests: 10 passed; changed-file Ruff passed. Other services' entity
availability remains their responsibility; this discovery correction does not
establish universal endpoint or selected-context enforcement.

| Area | Implemented in this pass | Verified in this pass | Remaining work / external blockers |
| --- | --- | --- | --- |
| Baseline and compatibility | Confirmed four services, contracts and consumers; preserved pre-existing worktree | Common 172, Contracts 31, Main 94, Research 76, Library 13, HERI 10 passed; 37 skipped, no failures | Inventory remaining policy paths |
| Uniform identity freshness | Main session introspection; downstream fail-closed checks with two-second total deadline; current assignments replace token grants; consistent header/cookie precedence | Shared identity/transport + contract focused checks: 39 passed; Main auth/internal checkpoint: 7 passed, 1 database case skipped at that checkpoint | MFA/step-up, recovery, integration-capacity and live-update adoption |
| PBAC and workspace discovery | Structured assignments authoritative; missing record scope denies; typed nine-workspace discovery/context routes | Contracts suite 34 passed including selected-school capability separation and actor preservation | Full selected-context endpoint enforcement, active entity discovery, field/action catalog and assignment review |
| Web Master | Explicit global platform.admin authority preserves real actor | Workspace context tests pass | Step-up and selected-scope audit adoption |
| Communications / Contributor / Club | Generic content/club approval, schedule, publish and unpublish guards require separate capabilities; separately authorized owners can publish | 21 new workflow policy cases passed; owning service checkpoint below passed | Remaining dedicated routes, canonical workflow and attachment policies |
| School / Department | School role shortcut removed; multi-school selection checked; Department SQL predicates precede pagination, private detail scoped, parent-change guard; publication forwarding preserves headers/errors | Department query tests 2 passed; forwarding cases 4 passed; School contract checkpoint 6 passed, 1 skipped | Hierarchy, scoped integrations, complete School-to-Research replay/ownership proof |
| Research / Innovation / Farm / Sustainability | SQL domain union, private detail guard, explicit oversight permission, domain-only context access; canonical workflow actions bind capability and record to the same grant; review queue uses action-specific SQL alternatives; transitions lock records; generic patches cannot publish or revise pending/live records; boolean-only models persist distinct draft/pending/rejected/published states and participate in the review queue | Domain/context checkpoint 36 passed; Research owning service checkpoint 82 passed, 2 skipped; subsequent action/transition/generic-bypass checkpoint 20 passed; persisted editorial-state checkpoint 40 passed; native PostgreSQL backfill/constraint migration test passed; contract/transition follow-up 14 passed; changed-file Ruff passed | Workflow provenance, ownership transfer, complete CRUD/dedicated adoption and reports; reviewed oversight assignments required before rollout |
| Library | Empty scope correction; current session adoption; loan/resource locks and reservation position correction | Real PostgreSQL competing issue/renew/return commands passed; focused scope+concurrency 3 passed | Reservation transition races, branch fields, assistant and reports |
| HERI | Current session adoption; generic resources require corresponding media/submission/analytics/social capabilities and HERI/global scope | Resource/workflow checkpoint 6 passed; HERI owning service checkpoint 14 passed, 1 skipped | Remaining generic/dedicated workflow parity, record relationships and reports |
| Reporting / events / workers | Existing infrastructure retained | Pending | Scoped summaries, artifacts, download rechecks, live-session handling |
| Migrations / final checkpoint | Additive authority-catalog migration; Research editorial-state migration preserves existing visibility; no account grants | Intermediate owning-service checkpoint: Main 121, Research 82, Library 13, HERI 14 passed; 11 skipped. Real PostgreSQL circulation run separately passed | Migration execution, assignment/data audit migrations, full implementation and final checks |

Research provenance follow-up: canonical workflow routes now use a shared service
command that stores actor, session, previous/target state and note in the same
transaction. A scoped, paginated history endpoint omits session identifiers.
Migration `20260907_0016` and commit/rollback behavior passed against disposable
PostgreSQL; the focused workflow suite passed 39 tests and changed-file Ruff passed.
The Research row's provenance gap is narrowed to other write paths, automatic
create submissions and existing publication workflows; historical events are not
fabricated. Full migration-chain verification remains outstanding.

Research creation follow-up: authenticated generic editorial creation now invokes
a canonical service command and records initial-state provenance atomically.
Edit-only grants create drafts; automatic submission requires a matching submit
grant, and immediate publication requires matching publish authority. Unrelated
domain publication rights do not change this outcome. Focused workflow tests
passed 45 cases, and the PostgreSQL provenance test additionally verified actual
creation commit/rollback. Changed-file Ruff passed. Dedicated write paths still
require adoption; the automatic generic-create provenance gap above is closed.

MFA implementation checkpoint: Main has encrypted, expiring authenticator
enrollment, confirmation with single-use recovery codes, step-up endpoints,
factor-required login for enrolled accounts, and persisted session verification
time preserved during refresh. Confirmation revokes other sessions. Generic
serialization/audit redacts new credential fields. Admin login and shared client
types accept optional MFA codes. Eighteen focused auth checks passed, including
native PostgreSQL enrollment/recovery/concurrent proof consumption and refresh
rotation. Auth-package and admin typechecks passed; changed-file Ruff passed. Privileged-operation enforcement,
enrollment UI, recovery lifecycle hardening, assurance propagation, migration
execution and full compatibility checks remain open; MFA is not complete.

MFA assurance follow-up: Main derives assurance from the matching current session
and includes it in introspection; downstream freshness replaces signed assurance
claims. The versioned catalog requires MFA within 15 minutes for identity,
security/settings and publication/approval/transfer operations through the four
services' standard permission dependencies. Explicit platform authority does
not bypass this check. Contracts passed 40 tests; Common passed 187 with 27
infrastructure skips; Main focused auth/internal checks passed 13 with one
database skip (database behavior was tested at the preceding checkpoint).
Custom command guards and remaining privileged operations still need adoption;
this is partial enforcement, not completion of MFA coverage.

Custom workflow MFA follow-up: Research canonical creation/publication/withdrawal
requires current assurance before mutations. Main custom content and club-media
guards require it for approval, scheduling, publication and unpublication, using
assurance attached from the actual session. HERI's shared operation evaluator
also checks assurance, covering direct generic/dedicated transitions and restore
publication checks. Research focused checks passed 20 including real PostgreSQL;
Main custom guard checks passed 25; HERI service checks passed 14/1 skipped and
three additional workflow-assurance cases passed. Changed-file Ruff passed.
Remaining custom operations, worker assurance/revalidation and full route coverage
still need review; enrollment/recovery UI and lifecycle work remain open.

MFA account UI follow-up: existing profile settings now support authenticator
enrollment, confirmation, one-time recovery-code display and current-session
step-up. A no-store account status endpoint exposes only enabled state,
verification time and recovery-code count. The client avoids automatic refresh
retries for factor proofs. Two UI flow tests passed, admin typecheck passed,
three existing auth endpoint tests and the new safe-status test passed; Ruff
passed. Authenticator replacement/recovery lifecycle, migration execution,
full command coverage and the broader refactor requirements remain open.

MFA replacement/recovery follow-up: password plus a current factor or unused
recovery code can begin authenticator replacement. The previous factor remains
active until confirmation; confirmation rotates recovery codes and revokes other
sessions. Session confirmation and step-up now use canonical service commands.
PostgreSQL tests verify replacement, invalid-session rollback and consumed-code
rejection; 11 MFA/status tests passed. The additive MFA migration passed upgrade
and downgrade verification without inventing session assurance. Three UI flows,
admin typecheck, four generic-account MFA bypass tests and Ruff passed. Full
migration-chain verification, complete privileged/worker coverage and remaining
backend domains still require work.

Integration policy checkpoint: legacy Digital Kisii operations are explicitly
institution-wide and now reject school-only grants and password-only sessions.
Programme synchronization preserves local display name, descriptions, curriculum,
career text and imagery; external metadata/qualification level remain source
fields. Department mismatches are reported without transferring ownership.
Six integration policy/transaction checks and changed-file Ruff passed. Durable
actor/scope-bound jobs, School-specific commands, preview isolation, reconciliation
and lecturer field policies remain open; legacy task-ID result lookup is not yet
the required secure job implementation.

Durable global integration-job checkpoint: trigger/status adapters now create
and query Main-owned jobs with actor, session, integration, scope, attempts,
timestamps and safe result/error fields. Job creation and dispatch outbox commit
together. The existing integration queue runs a worker that rechecks current
authority, serializes duplicate delivery and commits business updates with the
result. Failed business transactions roll back before bounded failure/retry
accounting. Foreign actors and cross-integration IDs cannot read results without
explicit platform authority. Eight focused checks passed, including PostgreSQL
migration, atomic rollback, concurrent replay and revocation; Ruff passed.
School-scoped jobs, request idempotency/correlation, detailed retry history,
real broker recovery verification remains incomplete.

Integration request-replay checkpoint: optional Idempotency-Key is digested and
uniquely bound to actor/integration. Concurrent retries return the same job and
create one outbox event; the original session/scope/correlation record is retained.
Requests without a key retain existing create behavior. Migration 0014 and
concurrent trigger behavior passed on PostgreSQL; seven focused integration
checks and Ruff passed. School-scoped operations, detailed retry history,
scheduled-job adoption is implemented; real broker recovery remains open.

School programme integration checkpoint: dedicated preview/trigger/job routes
use verified School context and separate preview/sync permissions, registered
without assigning accounts. Source rows are matched unambiguously before school
filtering and counts. Scoped jobs retain scope through outbox/worker execution;
workers reject inactive schools and current-grant mismatches. Programme ownership
conflicts remain read-only reconciliation errors. Eleven integration checks
passed with PostgreSQL; after expanding scoped mutation cases, ten policy cases
passed; Contracts 40 and changed-file Ruff passed. Lecturer School integration,
preview snapshots/conflict-resolution commands, catalog migration execution,
detailed retry history and scheduled adoption are implemented; durable preview/reconciliation remains outstanding.

Lecturer preview correction: dry-run execution now takes a read-only projection
branch with autoflush disabled. It neither changes entities nor flushes, commits
or rolls back caller work; workflow output reports zero persisted records.
New/existing lecturer cases and the worker transaction check passed (three tests),
and changed-file Ruff passed. Lecturer School scoping, field ownership and
durable preview/reconciliation work remain outstanding.

School lecturer integration checkpoint: lecturer preview/trigger/status now use
the same scoped job facade with separate lecturer preview/sync capabilities.
Matching rejects ambiguous/conflicting department sources; source rows outside
the selected school are excluded. Existing profile owner/source conflicts are
not applied. Source identity fields update while reviewed profile/research text
is retained. New profiles/assignments remain private, and source roles cannot
create accounts or workspace grants. Initial affected checkpoint passed 13 tests;
final lecturer scope cases passed four, preview follow-up passed five before the
new creation case, and PostgreSQL job/dispatch tests passed two. Ruff passed.
Durable preview snapshots, explicit conflict resolution, permission migration
execution, detailed retry history and scheduled adoption are implemented; durable preview/reconciliation remains incomplete.

Integration retry-history checkpoint: jobs now retain bounded, typed attempt
history and explicit retryability. Authorization failure stops with the actual
attempt count rather than setting a fictitious exhausted count. Terminal
redelivery adds no history. Infrastructure exceptions outside failure-accounting
also reach bounded Celery retries with safe error text. The additive migration
and PostgreSQL job/transaction checks passed (three tests); the focused worker
infrastructure-retry test passed; Ruff passed. Durable preview/reconciliation,
scheduled adoption is implemented; real broker-loss validation remains open.

Department hierarchy checkpoint: canonical create/structural-edit paths serialize
graph changes, reject self/ancestor cycles, inactive/missing parents and owner
mismatches. Stale structural edits fail rather than applying after a concurrent
move. Active children prevent parent deactivation; child records (including
inactive children) prevent silent owner transfer/hard-deletion via the School
facade. Existing support-under-wing shapes remain valid and ordinary edits do
not force legacy hierarchy rewrites. Six focused graph/query/School contract
checks passed; PostgreSQL graph follow-up passed; Ruff passed. Full data audit,
parent FK/constraint alignment and remaining hierarchy writers still need review.

No production data, real account access or deployments have been changed. No
external blocker has yet been established; locally actionable work remains.

Captured 6 September 2026 from the current worktree. `Implemented` means the code is
present and has local evidence. `Staging` means the implementation is present but the
required deployed or populated-data proof is not available on this host.

| Specification area | Status | Evidence | Remaining proof |
| --- | --- | --- | --- |
| Shared infrastructure and contracts | Implemented | `services/common/tests`, `services/contracts/tests`, lifecycle smoke, response-model validator, direct API metrics scrape (`services/prometheus-local-scrape-20260906.json`) | Deployed lifecycle plus worker/exporter metrics scrape and rule evaluation |
| Main authentication and authorization | Implemented | `scripts/request_correctness_smoke.py`; Main auth, refresh, failed-login and scope tests; representative missing-identity guard smoke across all services (`services/unauthorized-endpoint-smoke-20260906.json`); empty-scope forbidden smoke for Research, Library and HERI (`services/forbidden-scope-smoke-20260906.json`) | Multi-instance revocation and populated authorization matrix |
| Main domain migration | Implemented | Main response-contract tests, webhook outcome-service test, commit-gated cache invalidation test (including audit/internal exclusions), structural inventory, generated OpenAPI/frontend contracts | Populated consumer parsing and relationship serialization |
| Research | Implemented | Research security/public-visibility, response-contract, native-value and commit-gated cache invalidation tests | Populated v1 endpoint and cross-service consumer checks |
| Library | Implemented | Library contract, empty-scope, cache and audit tests; migration head `20260906_0011` | Populated endpoint and live worker checks |
| HERI Africa | Implemented | HERI workflow, response-contract and partner-sync tests; migration head `0011_public_news_listing_index` | Populated endpoint and live worker checks |
| V1 compatibility | Implemented locally | `contracts/*/openapi.json`, `*-contract.md`, fresh route inventory (`services/backend-contract-inventory-20260906c.json`) and access-shape inventory (`services/access-shape-inventory-20260906b.json`) | Anonymous/authenticated/forbidden/missing requests against populated records |
| Transactions and side effects | Implemented locally | PostgreSQL audit/outbox tests, rollback tests, idempotency tests, ownership verifier and spawned-worker lease-recovery test (`services/audit-process-loss-postgres-20260906.json`) | Deployed broker/database failure recovery and Celery visibility-timeout proof |
| Audit delivery without database overload | Implemented locally | Dedicated one-process/one-connection audit workers, bounded batches, queue smoke, Beat smoke, concurrency/storage artifacts | Deployed scheduler ownership, Redis visibility-timeout and sustained business-load capacity |
| Database/query optimization | Implemented locally | Main, Research, HERI and Library public-list/read indexes; rollback-only synthetic EXPLAIN artifact `services/domain-query-plan-postgres-20260906.json` plus seeded-data read-only plans `services/populated-domain-query-plans-20260906.json` | Production-like distribution, concurrent load and connection-starvation checks |
| Backup and recovery | Implemented locally | Checksummed custom-format backup and empty-database restore passed with current migration-head and ownership verification (`services/backup-restore-recovery-20260906.json`); atomic WAL archive helper and production Compose controls are checked in (`services/wal-archive-helper-20260906.json`); disposable PostgreSQL 18.6 archive/replay reached a named restore point and excluded the later marker (`services/postgres-pitr-smoke-20260906.json`); production validation now requires an absolute off-site backup target, `REQUIRE_OFFSITE_BACKUP=true` and positive retention (`services/offsite-backup-policy-20260906.json`) | Encrypted off-site retention service, scheduled backups and a deployed failover drill |
| Workers and schedules | Implemented locally | `scripts/validate_celery_schedules.py`, queue/Beat smoke, direct API metrics scrape and Compose/VM topology | Live scheduler overlap, retries, leases, worker/exporter scrape and missed-run behavior |
| Caching and scaling | Implemented locally | Redis cache/rate-limit tests, Main/Research/Library/HERI mutation invalidation timing tests, capacity validator (`74` possible / `80` budget), traffic validator (including standard and research-VM proxy address/alias checks) | Redis failover, multi-process stampede and realistic throughput |
| Lightweight verification | Implemented locally | Fast focused checks in `HANDOFF.md` section 9; bounded local runner plus current release checkpoint passed Common 199, Contracts 31, Main 97, Research 77, Library 14 and HERI 11 (429/0); real Redis cache/rate-limit, queue/Beat and spawned-worker process-loss checks pass. CI workflow design and hosted execution are outside this pass | Run the full matrix again only at the release checkpoint after rollout changes |
| Endpoint completion | Partial | Fresh effective route inventory: Main 780, Research 368, Library 143, HERI 50 (`services/backend-contract-inventory-20260906c.json`); dependency graph classifies public, identity/scope and internal-key shapes (`services/access-shape-inventory-20260906b.json`); representative unauthenticated/internal-key guards return expected 401/403 across all four services (`services/unauthorized-endpoint-smoke-20260906.json`); empty-scope forbidden guards pass for selected Research, Library and HERI routes (`services/forbidden-scope-smoke-20260906.json`); response coverage validator passes; representative seeded Main/Research/Library/HERI list/detail probes pass under concurrent reads with real Redis cache/rate-limit paths (`services/populated-endpoint-smoke-20260906b.json`); current consumer sweep adds 24/24 non-empty 200 reads, 5/5 missing-resource 404s and 2/2 anonymous 401s (`.tmp/seeded-contract-matrix-20260906.json`); full GET contract sweep adds 603/603 route responses with no transport errors or 5xx (`.tmp/seeded-openapi-get-*-20260906.json`); unauthenticated write-guard sweep adds 733/733 safe responses with no 5xx (`.tmp/seeded-openapi-write-*-20260906.json`) | Full populated v1 consumer matrix, authenticated/forbidden/missing-resource/ownership cases across registered consumers, mutation cache invalidation, and deployed cross-service checks |
| Final deliverables | Implemented locally | `BACKEND_TRANSFORMATION.md`, `AUDIT_OPERATIONS.md`, compatibility contracts, migrations, backup/restore and local PITR evidence, and runtime artifacts | Deployment migration, production WAL/PITR/off-site retention, staging evidence and external alert delivery |

The local checkpoint used disposable PostgreSQL 18.6 and Redis 8.0.5 only. No production
database or external service was modified. Do not mark the remaining `Staging` rows complete
until their named runtime evidence exists.

- 2026-09-07: Main queued Research bulk imports now propagate a short-lived HMAC-signed actor context using the shared Research internal credential; Research verifies it before assigning audit actor IDs. Main import contract/integration tests (3 passed, 1 skipped), Ruff, compileall, and actor-context tamper check passed. Remaining open: broader endpoint adoption and Library media ownership contract.

- 2026-09-07: Library electronic resource guide create/update now validates every linked Main media ID through the bounded public resolver and rejects missing/private media before persistence. Ruff and compileall passed. Other Library linked-document/media write paths remain to be audited.

- 2026-09-07: Audited Library engagement linked fields; document_id refers Main documents rather than media and needs a separate signed document-authorization contract. Public media validation remains applied to electronic guides.

- 2026-09-07: Converted Library electronic-guide media ownership failures into explicit HTTP 422 validation responses instead of uncaught service errors; Ruff and compileall passed.

- 2026-09-07: Added bounded Main internal public-document resolution and Library regulation create/update validation for document_id references; invalid/private documents return HTTP 422. Ruff and compileall passed.

- 2026-09-07: Full Library test suite passed after document-reference changes: 47 passed, 10 skipped. Main internal route test path was absent; Ruff and compileall passed for all affected modules.

- 2026-09-07: Removed Main internal route circular-import blocker by lazily loading field-selection helpers; internal response contract now passes (1 passed), Ruff passes.

- 2026-09-07: Main internal response and contact/media contract smoke tests passed together (2 passed); Research workflow provenance suite rerun after cross-service changes.

- 2026-09-07: Added signed actor-context regression coverage (round-trip, tamper rejection, expiry); common test suite target passed.

- 2026-09-07: HERI due-publication dispatcher now includes queued jobs with null scheduled_at for immediate dispatch while deferring future jobs; Ruff and compilation passed.

- 2026-09-07: Full HERI Africa suite passed after durable publication-dispatch changes: 73 passed, 4 skipped.


- 2026-09-07: HERI social publication Celery task now has bounded exponential retry policy (five retries, 300s cap); full HERI suite remains 73 passed, 4 skipped.


- 2026-09-07: Full Research suite passed after signed actor-context integration changes: 111 passed, 4 skipped; Main import response/integration subset passed 3 passed, 1 skipped.

- 2026-09-07: Full Common test suite passed with signed actor-context coverage: 191 passed, 27 skipped, 2 upstream deprecation warnings.

- 2026-09-07: Made actor-context issuance timestamps atomic within the signer, eliminating boundary skew; actor-context tests (2 passed) and Ruff passed.

- 2026-09-07: Actor-context verification now rejects materially future-issued tokens (30-second clock-skew allowance); regression suite 3 passed.

- 2026-09-07: Common suite rerun after future-issuance hardening: 192 passed, 27 skipped, 2 upstream deprecation warnings.

- 2026-09-07: Main queued-import and internal-route regression subset passed after actor-context timestamp hardening: 4 passed, 1 skipped.

- 2026-09-07: Library document-reference validation now maps Main transport failures to fail-closed HTTP 422 responses; full Library suite passed 47 passed, 10 skipped.

- 2026-09-07: Full Main test suite passed after cross-service validation changes: 172 passed, 15 skipped, 2 upstream deprecation warnings.


- 2026-09-07: Audited Main IntegrationJob retry state: attempts, retryable, and JSONB retry_history are persisted and worker-populated; scheduled dispatch is implemented; broker-outage validation remains open in this area.

- 2026-09-07: Added Main scheduled integration-job reconciliation: bounded PENDING rows are locked, marked DISPATCHED, and re-enqueued every 30 seconds through the existing worker. Integration-job tests 2 passed, 1 skipped; Ruff and compilation passed.

- 2026-09-07: Scheduled integration dispatcher now reverts DISPATCHED jobs to PENDING when broker enqueue fails, preventing stranded work; Ruff and integration tests passed (2 passed, 1 skipped).

Scheduled integration dispatcher checkpoint (2026-09-07): Main Beat now reconciles up to 50 pending IntegrationJob rows every 30 seconds using row locks, marks rows DISPATCHED before enqueue, and reopens rows whose broker enqueue fails. Celery worker retries remain bounded and durable retry history is preserved. Ruff and compile checks pass; full suite requires the repository's generated JWT test environment.
2026-09-07: Added a focused regression test for pending IntegrationJob broker-enqueue failure: successfully queued rows remain DISPATCHED while failed rows return to PENDING for reconciliation. Digital sync transaction tests pass (2), Ruff passes.
2026-09-07: Library media resolution regression coverage now verifies missing/private Main media references are rejected by the write-side guard; bounded batching and rolling-upgrade fallback remain covered. Media resolution tests pass (3), Ruff passes.
2026-09-07: HERI social publication worker now locks queued/publishing records, calls the provider seam, persists external IDs on success, and records bounded failure state before Celery autoretry. Ruff and compilation pass; full HERI collection in this shell still requires generated RS256/JWT settings.
2026-09-07: HERI due-social dispatcher now requeues rows when broker enqueue fails after the publishing mark, preventing stranded jobs; reconciliation Beat can safely pick them up. Ruff and compilation pass.
2026-09-07: Added environment-independent HERI social provider contract tests covering successful external ID generation and unsupported-platform rejection (2 passed); Ruff and diff checks pass.


2026-09-07: Main IntegrationJob transaction regression suite rerun with generated RS256/JWT environment: 2 passed, including broker-failure requeue coverage.
2026-09-07: Full Main backend suite rerun with generated RS256/JWT environment after scheduled IntegrationJob dispatcher changes: 173 passed, 15 skipped, 2 deprecation warnings.
2026-09-07: Full cross-service suites rerun with generated RS256/JWT environment: Research 111 passed/4 skipped; Library 48 passed/10 skipped/2 warnings; HERI 75 passed/4 skipped. This includes the new provider and media regression coverage.
2026-09-07: Shared Common suite rerun: 192 passed, 27 skipped, 2 deprecation warnings, including actor-context signing/verification coverage.

2026-09-07: Added services/BACKEND_FINAL_REPORT.md as the concise final deliverable required by the specification, grounded only in current test evidence and explicitly tracked limitations.
