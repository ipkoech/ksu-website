# Monitoring and alerting

The optional Compose `observability` profile runs Prometheus, Alertmanager, a PostgreSQL exporter, and a Redis exporter. It scrapes the four HTTP APIs, the four Celery worker exporters, PostgreSQL, and Redis. Prometheus and Alertmanager bind to loopback only; use an authenticated reverse proxy, VPN, or SSH tunnel for operator access rather than exposing either port publicly.

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

Set `REDIS_MAXMEMORY` to a positive deployment-appropriate capacity and choose `REDIS_MAXMEMORY_POLICY` deliberately (the current safe default is `noeviction`). A Redis instance without a memory limit triggers a configuration alert after thirty minutes and cannot produce a meaningful memory-utilization percentage.

Production deployment enables this profile automatically and requires
`ALERTMANAGER_CONFIG_FILE` to point to an operator-owned configuration outside
the repository. The deployment validates that it contains an external receiver;
the no-credential dashboard example is rejected. Do not commit notification
URLs, passwords, API keys, or routing tokens. Test both firing and resolved
notifications after deployment.

Included alerts cover unavailable APIs/workers/exporters, PostgreSQL and Redis availability, HTTP 5xx rate and p95 latency, Celery queue backlog/failures, PostgreSQL connection utilization, long-running queries, lock waits, and Redis memory utilization. The thresholds are intentionally conservative starting points and should be tuned after the first representative load test.

The PostgreSQL custom collector reports server connection utilization, active-query duration, and lock waits. It does not expose SQL text or bind values. It is server-level saturation, not application connection-pool saturation; application pool telemetry needs service-level instrumentation before it can be alerted on independently.

The shared JSON logger emits service, timestamp, level, message, and exception context; request IDs and deployment commit/version should be supplied by the gateway/runtime environment. Logs must go to stdout/stderr or approved mounted paths and must not include tokens, passwords, cookies, or full sensitive bodies.

Retain logs according to the VM/provider policy and record the policy with the deployment owner. Add infrastructure-provider alerts for backup/migration failure, disk exhaustion, certificate expiry, and host CPU/memory saturation; they cannot be measured from this Compose-only stack.

The VM overlay applies configurable CPU, memory, and PID ceilings to APIs and
workers. Docker log storage is also rotated independently of application files.
Tune these ceilings from measured staging usage; an OOM-killed container is a
capacity incident, not an automatic reason to remove the bound. See
`incident-response.md` for triage, rollback constraints, and drill cadence.
