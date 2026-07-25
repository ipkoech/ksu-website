# School Portal release and operations runbook

## Release controls

The portal has four independent, default-on controls:

| Flag | Scope | Disable effect |
| --- | --- | --- |
| `SCHOOL_PORTAL_ROUTES_ENABLED` | Main API | School Portal routes are not registered |
| `NEXT_PUBLIC_SCHOOL_PORTAL_ENABLED` | Admin build/runtime | `/schools` returns the application 404 |
| `SCHOOL_PORTAL_EVENTS_ENABLED` | Main API and worker | No new transactional outbox events are created |
| `SCHOOL_PORTAL_WEBSOCKET_FANOUT_ENABLED` | Main API replicas | Redis fan-out subscribers do not start |

The route and fan-out flags are startup decisions. The frontend flag is embedded by
Next.js at build time. The event flag adds only one in-process boolean check before
an outbox record is created.

## Required topology

- PostgreSQL hosts the `main` and `research` schemas and must have `pgcrypto`
  available for `gen_random_uuid()`.
- Redis DB 0 carries Celery queues, `ksu:domain-events` pub/sub, and the capped
  replay stream.
- At least one `celery-main` worker must consume `main.events`,
  `main.notifications`, `main.email`, `main.imports`, `main.media`, and
  `main.maintenance`. Celery Beat dispatches pending outbox records every 10
  seconds.
- Every Main API replica runs one Redis subscriber. Nginx must preserve
  `Upgrade` and `Connection: upgrade` for `/api/v1/realtime`; sticky routing is
  not required because event fan-out is Redis-backed.

For a two-replica rehearsal:

```bash
docker compose up -d postgres redis main celery-main gateway
docker compose up -d --scale main=2
docker compose ps
curl -fsS http://localhost:8080/health
curl -fsS http://localhost:8000/api/v1/health
```

## Migration and ownership backfill

Take a database snapshot, apply both Main and Research migrations, and verify
their current revisions before enabling backend routes.

The ownership script uses the same database transaction for its dry run and
apply paths. It fills only missing values:

- school-scoped news, blogs, announcements, and events gain school ownership;
- school-scoped documents gain ownership and normalized workflow state;
- publications missing `school_id` derive it from their Main department;
- recorded deans with user accounts gain an idempotent scoped `school_admin`
  role.

Run and review the counts:

```bash
cd services/main
.venv/bin/python scripts/backfill_school_portal_ownership.py
```

Apply the identical statements:

```bash
.venv/bin/python scripts/backfill_school_portal_ownership.py \
  --apply --confirm APPLY_SCHOOL_PORTAL_BACKFILL
```

Investigate unexpected counts before applying. Never infer ownership for a
publication without a department or grant access to a dean without a linked
user; those records require manual data correction.

## Event replay and dead-letter recovery

Clients acknowledge Redis stream cursors and request resume after reconnect.
The stream retains approximately 20,000 entries. A cursor older than its first
entry produces `sync.required`; the client then refetches context, unread
notifications, dashboard counters, and active portal queries.

Inspect outbox health:

```sql
SELECT delivery_status, count(*), min(occurred_at), max(occurred_at)
FROM main.outbox_events
WHERE deleted_at IS NULL
GROUP BY delivery_status;
```

Pending and failed records retry automatically. To replay an individual
non-dead-letter record:

```bash
cd services/main
.venv/bin/celery -A app.tasks.celery_app.celery_app call \
  main.outbox.publish_one --args='["EVENT_UUID"]'
```

For a dead-letter record, first correct the underlying Redis/configuration
failure. In one audited database transaction, clear `dead_lettered_at`, set
`delivery_status='failed'`, and set `next_attempt_at=now()`, then invoke the
task. Do not create a replacement event ID: notification deduplication uses the
original outbox ID.

## Inquiry delivery recovery

Replies persist before SMTP delivery and expose `queued`, `sending`, `sent`,
`failed`, or `dead_letter` state. Failed messages retry exponentially up to six
attempts. Correct SMTP configuration first, then use **Retry delivery** in the
inquiry conversation. The endpoint refuses already-sent messages, preventing
duplicate delivery.

Before retrying a dead-letter manually, confirm with the mail provider that no
message was accepted under the stored provider ID. Keep the original message
and idempotency key.

## Health, metrics, and alerts

Check:

- `/api/v1/health` on every Main replica and `/health` on the gateway;
- authenticated `/api/v1/realtime/metrics` for active connections, rejected
  connections, queue pressure, and fan-out state;
- Redis `PING`, stream length/age, pub/sub subscriber count, and memory policy;
- Celery queue depth and worker heartbeats for all Main queues;
- outbox pending age, failed/dead-letter counts, inquiry delivery failures,
  HTTP 403/404 rates on school routes, and p50/p95/p99 latency.

Alert when the oldest pending outbox event exceeds 30 seconds, any dead letter
appears, no Main worker is consuming, Redis subscribers fall below the number
of API replicas, or cross-school authorization tests fail.

Release acceptance gates:

- zero cross-school access;
- warm dashboard p95 below 500 ms;
- CRUD p95 below 300 ms excluding uploads;
- persisted notification visible within 2 seconds;
- WebSocket recovery within 10 seconds;
- every inquiry reply has an observable delivery state.

## Staged rollout

1. Back up PostgreSQL and deploy migrations.
2. Deploy Main API and workers with all four flags disabled.
3. Run the dry-run backfill, review counts, then apply it.
4. Enable routes and events while leaving the frontend and fan-out disabled;
   run API authorization and outbox checks.
5. Enable fan-out and verify two-replica reconnect/replay.
6. Build the admin frontend with the portal enabled for the internal pilot.
7. Run the School Portal Playwright suite with the required `SCHOOL_PORTAL_E2E_*`
   credentials and seeded fixture IDs.
8. Observe one pilot school for seven days, reviewing the metrics and audit log
   daily. Expand one school at a time only after every acceptance gate holds.

## Rollback

Disable the frontend flag first, then routes. Let already-committed outbox and
inquiry delivery work drain unless it is the incident source; in that case
disable events/fan-out and preserve the tables for diagnosis. Roll back the
application image, not the data migration. The ownership backfill is
non-destructive and should not be reversed during an incident. Restore the
database snapshot only for confirmed migration corruption and only under the
normal disaster-recovery procedure.
