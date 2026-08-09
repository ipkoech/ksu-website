# Incident response and safe operations

The production deployment starts the observability profile automatically and
refuses to deploy with the repository's dashboard-only Alertmanager receiver.
Keep the configured receiver file outside Git, owned by the deployment account,
mode `0600`, and test both firing and resolved notifications after any change.

## First response

Treat API/database unavailability, sustained 5xx responses, and data-integrity
or credential incidents as critical. Treat latency, queue backlog, capacity, and
single-worker failures as warnings unless user impact makes them critical.

1. Acknowledge the alert and record its start time, affected service, release id,
   and request or correlation ids. Health responses expose the deployed release.
2. Run `scripts/deploy.sh vm-status --host HOST --env production --path /srv/ksu`
   and inspect only the affected service with `vm-logs`. Do not paste secrets or
   complete request bodies into incident notes.
3. Check PostgreSQL connections/locks, Redis memory, Celery queue depth, disk,
   host memory and CPU before restarting anything. A restart can erase evidence
   and amplify a dependency outage.
4. If a new release caused the incident, stop further deployments. The verified
   release is recorded in `.deploy/production.release`; its predecessor is in
   `.deploy/production.release.previous`.

## Application rollback

Read the previous `git_sha` and `image_tag`, verify that those images still exist,
and redeploy that reviewed revision with `--skip-build --pull-images --image-tag`.
Never run an Alembic downgrade during an incident. An application rollback is
safe only when the deployed database migration was explicitly reviewed as
backward compatible with the previous application. Otherwise restore service by
forward-fixing the application or database; use the recovery runbook only for
actual data loss or corruption.

The release record is replaced only after backend health, gateway route probes,
frontend/proxy deployment, and optional HTTPS configuration succeed. A failed
deployment therefore does not become the last-known-good release.

## Routine operator schedule

- Daily: confirm alerts are quiet for understood reasons, backup/off-site copy
  completed, disk has headroom, and no queue grows continuously.
- Weekly: review 5xx, p95 latency, database connections and slow queries, Redis
  memory, worker failures, certificate lifetime, and host security updates.
- Monthly: send a synthetic Alertmanager notification and test operator receipt;
  rehearse one API/container failure and confirm alert and recovery timing.
- Quarterly: run the documented restore drill and an application rollback drill
  in staging, then record actual RPO/RTO and corrective actions.

Do not claim coverage for VM death, disk exhaustion, certificate expiry, backup
freshness, or provider networking from Prometheus alone. Configure those alerts
at the VM/provider layer and route them to the same owned receiver.
