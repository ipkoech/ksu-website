# Internal media resolution contract v1

Main owns media records. An authenticated sibling service resolves up to 100
public media UUIDs with `POST /api/v1/internal/media/resolve` and
`X-Internal-Key`. The response contains browser-safe snapshots only: id, URL,
thumbnail URL, title, alternative text, description, caption, media type, and
public status.

Unknown, deleted, and non-public identifiers are omitted. Consumers keep the
original ordering by matching response UUIDs and must not map `main.media` as a
local ORM table.

Breaking field or semantic changes require a `/api/v2/internal/media/resolve`
endpoint and a coordinated consumer migration.
