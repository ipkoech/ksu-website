# Internal audit contract v1

Main owns the canonical request-audit store. Sibling services never query or
write `main.audit_logs`; their workers call `POST /api/v1/internal/audit` with
`X-Internal-Key`. The event UUID is the idempotency key and duplicate delivery
is accepted without creating a second row.

Authenticated sibling consoles read only their own stream through
`GET /api/v1/internal/audit?service_name=<service>`. Main applies service,
actor, resource, status, and pagination filters. Callers must treat returned
records as snapshots and must not depend on Main's SQL model.

Breaking field or semantic changes require a `/api/v2/internal/audit` endpoint
and a coordinated producer migration.
