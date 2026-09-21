# School Admin operations API contract

All routes require an authenticated session and a verified school workspace context. The backend applies the active school and scope to every read and write; clients must not send a school id to widen scope. Responses use the standard `{ status, message, data, meta? }` envelope.

## Evidence

Base path: `/api/v1/school-portal/evidence`

- `GET /` — list evidence. Query: `status`, `document_type`, `department_id`, `expires_before`, `page`, `per_page`.
- `POST /` — create an evidence request or register an uploaded document. Body: `{ document_type, title, description?, department_id?, subject_type?, subject_id?, due_at?, file_id? }`.
- `GET /{evidence_id}` — evidence detail, verification history, related records, and audit links.
- `PATCH /{evidence_id}` — replace metadata only. Body: `{ title?, description?, due_at?, expires_at? }`.
- `POST /{evidence_id}/verify` — reviewer decision. Body: `{ decision: "approved" | "rejected" | "replacement_requested", reviewer_notes?, expires_at? }`.
- `POST /{evidence_id}/replace` — attach a replacement upload. Body: `{ file_id, reviewer_notes? }`.

Permissions: `school.evidence.view`, `school.evidence.manage`, and `school.evidence.review` (the backend evaluates each action independently).

## Work queue

Base path: `/api/v1/school-portal/work-queue`

- `GET /` — list derived and assigned work. Query: `view=all|mine|overdue|awaiting_response|completed`, `status`, `priority`, `owner_id`, `department_id`, `due_before`, `search`, pagination.
- `POST /` — create a follow-up task linked to an authorized resource. Body: `{ title, description?, priority, owner_id?, due_at?, resource_type?, resource_id?, evidence_ids?: [] }`.
- `GET /{task_id}` — task detail, linked evidence/resources, notes, reminders, and activity timeline.
- `PATCH /{task_id}` — edit title, description, priority, owner, and due date.
- `POST /{task_id}/notes` — add a note. Body: `{ body }`.
- `POST /{task_id}/reminders` — schedule a reminder. Body: `{ remind_at }`.
- `POST /{task_id}/resolve` and `POST /{task_id}/reopen` — transition task state with an audit event.

Permissions: `school.work_queue.view`, `school.work_queue.manage`, and `school.work_queue.assign`.

## Reports

- `GET /api/v1/school-portal/reports` — list saved/recent reports. Query: `page`, `per_page`.
- `POST /api/v1/school-portal/reports` — create a report definition. Body: `{ report_type, range, comparison_range?, department_id?, sections: [], format: "pdf" | "csv" }`.
- `GET /api/v1/school-portal/reports/{report_id}` — report definition and generation status.
- `POST /api/v1/school-portal/reports/{report_id}/generate` — enqueue generation; returns `{ job_id, status }`.
- `GET /api/v1/school-portal/reports/{report_id}/download` — stream the generated PDF/CSV after authorization.

Permission: `school.reports.view` and `school.reports.export`.

## Audit and synchronization metadata

- `GET /api/v1/school-portal/audit/{event_id}/related` — related events for an authorized event.
- `GET /api/v1/school-portal/integrations/{integration}/runs` — synchronization runs with `run_id`, `started_at`, `finished_at`, `status`, counts, errors, and source cursor.
- `GET /api/v1/school-portal/integrations/{integration}/runs/{run_id}` — run detail and paginated attempt history.

Permissions: existing `school.audit.view` and integration-specific view permission; exports continue to require the existing audit/report export policy.

Every mutation emits the existing audit event with request id, trace id, actor, workspace, scope, policy decision, and before/after values. Sensitive values remain redacted by the audit service.
