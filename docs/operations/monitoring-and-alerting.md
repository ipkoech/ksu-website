# Monitoring and alerting

The optional Compose `observability` profile runs Prometheus, Alertmanager, a PostgreSQL exporter, and separate Redis exporters for the durable Celery broker and disposable application cache. It scrapes the four HTTP APIs, the four Celery worker exporters, PostgreSQL, and both Redis instances. Prometheus and Alertmanager bind to loopback only; use an authenticated reverse proxy, VPN, or SSH tunnel for operator access rather than exposing either port publicly.

Start it with the same production environment file used by the backend:

```bash
docker compose --env-file .deploy/production.compose.env --profile observability up -d
```

For a VM deployment, include the VM overlay as well:

```bash
docker compose --env-file .deploy/production.compose.env \
  -f docker-compose.yml -f docker-compose.vm.yml \
  --profile observability up -d
```

Prometheus is then available at `http://127.0.0.1:${PROMETHEUS_PORT:-9090}` and Alertmanager at `http://127.0.0.1:${ALERTMANAGER_PORT:-9093}`. Set `PROMETHEUS_RETENTION_TIME` to control local retention (default: `30d`).

Set `POSTGRES_EXPORTER_USER` and `POSTGRES_EXPORTER_PASSWORD` to a dedicated database login with the `pg_monitor` role before production cutover. Provision it with `GRANT pg_monitor TO ksu_metrics;` and `GRANT CONNECT ON DATABASE ksu_services_db TO ksu_metrics;`. The Compose fallback to the application database user exists only for local development; it must not be relied on in production. `DATA_SOURCE_URI`, `DATA_SOURCE_USER`, and `DATA_SOURCE_PASS` keep passwords out of a URL, so reserved password characters cannot corrupt the exporter connection string.

Set `REDIS_BROKER_MAXMEMORY` and `REDIS_CACHE_MAXMEMORY` to independently measured capacities. The broker is durable, uses AOF, and is fixed to `noeviction` so queued work is never silently discarded. The cache is non-durable and defaults to `allkeys-lru`; override it with `REDIS_CACHE_MAXMEMORY_POLICY` only after reviewing the eviction behavior. A Redis instance without a memory limit triggers a configuration alert after thirty minutes.

Production deployment enables this profile automatically and requires
`ALERTMANAGER_CONFIG_FILE` to point to an operator-owned configuration outside
the repository. The deployment validates that it contains an external receiver;
the no-credential dashboard example is rejected. Do not commit notification
URLs, passwords, API keys, or routing tokens. Test both firing and resolved
notifications after deployment.

For this deployment, render the email receiver from Main's existing SMTP
settings without printing its password:

```bash
python3 scripts/render_alertmanager_email_config.py \
  --env-file services/main/.env \
  --recipient rkyegon@kisiiuniversity.ac.ke \
  --output .deploy/alertmanager.generated.yml
```

Set `ALERTMANAGER_CONFIG_FILE=./.deploy/alertmanager.generated.yml`. The rendered
file is Git-ignored and group-readable only. Set `ALERTMANAGER_CONFIG_GID` to the
deployment operator's numeric group ID when it is not `1000`, then recreate
Alertmanager. Rotate the generated file whenever the SMTP credential changes.

Included alerts cover unavailable APIs/workers/exporters, PostgreSQL and both Redis roles, HTTP 5xx rate and p95 latency, Celery queue backlog/failures, PostgreSQL connection utilization, long-running queries, lock waits, and per-role Redis memory utilization. The thresholds are intentionally conservative starting points and should be tuned after the first representative load test.

Verify the profile after startup:

```bash
docker compose --profile observability ps
curl -fsS http://127.0.0.1:${PROMETHEUS_PORT:-9090}/-/ready
curl -fsS http://127.0.0.1:${ALERTMANAGER_PORT:-9093}/-/ready
curl -fsS 'http://127.0.0.1:9090/api/v1/query?query=up' | python -m json.tool
```

The PostgreSQL custom collector reports server connection utilization, active-query duration, and lock waits. It does not expose SQL text or bind values. It is server-level saturation, not application connection-pool saturation; application pool telemetry needs service-level instrumentation before it can be alerted on independently.

The shared JSON logger emits service, timestamp, level, message, and exception context; request IDs and deployment commit/version should be supplied by the gateway/runtime environment. Logs must go to stdout/stderr or approved mounted paths and must not include tokens, passwords, cookies, or full sensitive bodies.

Retain logs according to the VM/provider policy and record the policy with the deployment owner. Add infrastructure-provider alerts for backup/migration failure, disk exhaustion, certificate expiry, and host CPU/memory saturation; they cannot be measured from this Compose-only stack.

The VM overlay applies configurable CPU, memory, and PID ceilings to APIs and
workers. Docker log storage is also rotated independently of application files.
Tune these ceilings from measured staging usage; an OOM-killed container is a
capacity incident, not an automatic reason to remove the bound. See
`incident-response.md` for triage, rollback constraints, and drill cadence.
