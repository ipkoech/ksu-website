# Access-assignment migration

`python scripts/migrate_access_assignments.py assignments.json --output plan.json`
produces a deterministic, dry-run-only plan. It preserves every source row in
the output for rollback. It never writes to a service database and rejects
`--apply`; a reviewed integration wrapper must call the existing assignment
service if conversion is approved.

Known mappings are `school-admin` → School, `dept-admin` → Department,
`library-admin` → Library, `research-admin` → Research, `heri-admin` → HERI,
`club-admin` → Club, `story-contributor` → Story Contributor, and content/admin
roles → Communications. Legacy administrator names that could imply global
authority are classified `expanded` and never auto-migrated.

Classification is `equivalent`, `narrowed`, `expanded`, `ambiguous`, or
`expired_or_inactive`. Only active, nondeleted equivalent rows are migratable.
The tool does not reactivate grants, invent expiry, create `platform.admin`, or
infer global access from unrelated permissions. Its output is a pure function of
the input, making reruns idempotent. Any future apply wrapper must use source row
identity as its idempotency key, audit each conversion, and retain the plan before
mutation.
