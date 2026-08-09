# Load testing

Use the standard-library harness for a repeatable smoke benchmark and safe
query-plan capture:

```bash
python3 scripts/performance_harness.py \
  --base-url http://127.0.0.1:8000 \
  --scenario-file docs/operations/performance-scenarios.json \
  --requests 200 --concurrency 20 --output tmp/main-perf.json
```

The scenario file is intentionally GET-only. It supports a relative path,
optional label, and an optional `expected_status` list. Do not put bearer
tokens or other secrets in scenario files; pass short-lived test headers with
`--header` when an authenticated test deployment is explicitly intended.

Capture a plan from a disposable/local PostgreSQL database, not a production
database:

```bash
export DATABASE_URL=postgresql://ksu_ci:ksu_ci_password@127.0.0.1:5432/ksu_ci # pragma: allowlist secret
python3 scripts/performance_harness.py \
  --base-url http://127.0.0.1:8000 \
  --endpoint health=/health \
  --database-url "$DATABASE_URL" \
  --explain-file publication-list=tmp/queries/publication-list.sql \
  --output tmp/main-perf-with-plan.json
```

EXPLAIN input must be one comment-free `SELECT`, `WITH`, or `VALUES` query.
The harness runs `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` inside a read-only
transaction with bounded statement and lock timeouts, then rolls it back. It
still executes the query, so use a disposable dataset and avoid volatile
functions. The database URL is never written to the report. `psql` must be
installed and available on `PATH`.

Non-local targets are rejected unless `--allow-nonlocal` is supplied. That
flag is an explicit operator acknowledgement for an approved test/staging
deployment; it is not a production load-testing authorization. The harness
does not create data, authenticate users, or claim production capacity.

The report records request count, errors, throughput, min/p50/p95/p99/max
latency, and edge-cache hit ratio per endpoint and overall. Scenario budgets
(`max_p95_ms`, `max_error_rate`, and `min_cache_hit_ratio`) make the command
exit non-zero when a staging run regresses. EXPLAIN results include planning time,
execution time, a query hash, and the JSON plan. Pair the report with host,
PostgreSQL, Redis, and Celery measurements from the deployment.

Initial budgets are assumptions pending staging measurement: public reads p95
≤500 ms, authentication p95 ≤750 ms, error rate <1%, no pool exhaustion, and
no unbounded memory growth. A baseline must be captured from a representative
staging deployment before claiming compliance.

Run at 20, 50, then 100 concurrent requests. Stop increasing load when database
pool utilization remains above 80%, Redis or Celery latency rises continuously,
host CPU remains above 85%, memory swaps, or the error budget fails. Capacity is
the highest stage that stays within budgets for 15 minutes, not the brief peak
RPS printed by a short run.

Anonymous successful GET responses are cached by nginx for 30 seconds. Requests
with any Authorization header, Cookie, or supported integration-key header
bypass edge caching, responses with Set-Cookie are never stored, and mutations
are never cacheable. `X-Edge-Cache` must move from `MISS` to `HIT`; the default
staging scenarios require an 80% hit ratio after warmup.

API replicas can be added with Compose scaling because nginx re-resolves Docker
DNS. Recalculate the PostgreSQL connection budget before changing replicas:

```bash
API_REPLICAS=2 CELERY_REPLICAS=1 python scripts/validate_database_capacity.py
docker compose up -d --scale main=2 --scale research=2 --scale library=2 --scale heri=2
```

Cache, realtime/pub-sub, Celery broker, and Celery result URLs are separately
configurable per service. Split the Celery broker from request caching before a
large public event so background backlog cannot evict hot public responses.
