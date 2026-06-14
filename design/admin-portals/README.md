# Admin Portal Design Set

These concepts treat each admin area as an individual portal rather than one crowded dashboard. The same backend identity, RBAC, media, audit, and workflow services can power all portals, but each portal should have its own navigation, landing dashboard, role context, and approval queues.

## Portal Concepts

| Portal | Design | Backend alignment |
| --- | --- | --- |
| Governance Portal | [governance-portal.png](./governance-portal.png) | `governance.*`, `policy.*`, `workflow.*`, `persons.*`, `staff.*` |
| Schools Portal | [schools-portal.png](./schools-portal.png) | `academic.manage_schools`, `academic.manage_departments`, `academic.manage_programmes`, `publications.review` |
| Departmental Portal | [departmental-portal.png](./departmental-portal.png) | `academic.manage_departments`, `staff.manage_assignments`, `content.*`, `media.upload` |
| Corporate Communication Portal | [corporate-communication-portal.png](./corporate-communication-portal.png) | `content.*`, `content.publish`, `media.*`, `marketing.manage_sliders`, `workflow.approve` |
| Research Portal | [research-portal.png](./research-portal.png) | `research.*`, `funding.*`, `innovation.*`, `partnerships.*` |
| Library Portal | [library-portal.png](./library-portal.png) | `library.*`, `external_publications.view` |
| Publications Portal | [publications-portal.png](./publications-portal.png) | `publications.submit`, `publications.review`, `publications.approve`, `publications.manage`, `research.manage_publications` |

## Design Direction

- Each portal should feel like a separate workspace with its own sidebar, dashboard, queues, and settings.
- Cross-portal users keep one account, but their visible tools depend on service, scope, and permission.
- Publication submission should be its own portal flow, not buried inside the research office dashboard.
- Governance, school, department, and publication records should keep explicit ownership, status, reviewer, approver, and audit trail fields.
- Corporate Communication can act as the final public-facing publishing layer for newsroom, notices, homepage features, and media-sensitive content.

## Implementation Routes

The admin app now exposes these individual portal entry points:

| Portal | Admin route |
| --- | --- |
| Governance Portal | `/governance` |
| Schools Portal | `/schools` |
| Departmental Portal | `/departments` |
| Corporate Communication Portal | `/corporate-communication` |
| Research Portal | `/research` |
| Library Portal | `/library` |
| Publications Portal | `/publications` |

Each route uses its own portal shell and portal-specific navigation. CRUD resources are registered in `frontend/apps/admin/src/lib/portals/registry.ts` and rendered through the shared editable resource page, with domain-specific fields, list filters, scopes, and confirmation dialogs for destructive or workflow actions.

## Suggested Additional Portals

- Admissions Portal
- Student Affairs Portal
- Alumni Portal
- Partnerships & Internationalization Portal
- System Administration Portal
