# Monitoring and alerting

The shared JSON logger emits service, timestamp, level, message, and exception context; request IDs and deployment commit/version should be supplied by the gateway/runtime environment. Logs must go to stdout/stderr or approved mounted paths and must not include tokens, passwords, cookies, or full sensitive bodies.

Each API exposes its existing health route. Deployment must additionally check database, Redis, worker, and edge health. Configure the VM log collector and an error-tracking provider (for example Sentry) through secret configuration; provider setup cannot be verified without deployment credentials.

Minimum alerts: readiness failure, HTTP 5xx/error rate, latency, database/Redis failure, Celery backlog/task failures, backup failure, migration failure, disk exhaustion, certificate expiry, and CPU/memory saturation. Retain logs according to the VM/provider policy and record the policy with the deployment owner.
