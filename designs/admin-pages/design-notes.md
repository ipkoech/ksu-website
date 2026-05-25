# Admin Pages Design Notes

Status: Final visual design board / governed by `designs/admin-manifest.md`

## Route Status

- Requested surface: main admin pages in `frontend/apps/admin`.
- Governing route truth: `designs/admin-manifest.md`.
- The saved assets are not for the redirected admin root `/`.
- The desktop and mobile boards cover valid grouped admin patterns only:
  - canonical `/main` dashboard pattern;
  - implemented record-index patterns such as `/content/news` and `/system/users`;
  - canonical `/system` dashboard pattern;
  - mobile `DashboardShell` behavior;
  - neutral empty/loading/data-unavailable states.
- `/dashboard` is treated only as a duplicate route that should share the `/main` dashboard visual pattern. It is not represented as a separate final route design.
- Advertised-only routes and missing research/library child routes are intentionally excluded from final visual assets.

## Files

- `admin-pages-desktop-final.png`: desktop design board for the main dashboard, record index, and system dashboard patterns.
- `admin-pages-mobile-final.png`: mobile design board for the same approved admin patterns.
- `design-notes.md`: product audit, constraints, evaluation, and implementation notes.

## Visual Generation

- Visual generation was allowed after the admin route audit because `designs/admin-manifest.md` marks the represented patterns as valid design targets when source-backed or neutral data is used.
- The `imagegen` skill was used in built-in mode.
- Three directions were generated and evaluated:
  1. Conservative
  2. Modern polished
  3. Bold/experimental
- The modern polished direction was selected because it had the strongest frontend fit, clearest mobile structure, and best implementation feasibility.
- Failed or weaker directions were not saved into `designs/`.
- Final desktop and mobile assets were regenerated with stricter route-truth, neutral-data, sidebar, and no-fake-content constraints before saving.

## Product Audit Summary

The admin product is an authenticated Kisii University operations console for staff who manage portal content, academic records, people records, admissions intakes, media, and system administration.

Primary audiences:

- Main portal administrators.
- Content managers.
- Academic or department administrators.
- System administrators.
- Super admins with access to system tools.

Main user goals:

- Sign in and work inside the correct authorized service.
- Navigate quickly through role-filtered admin sections.
- Review operational status without relying on fake analytics.
- Find records through search, filters, status badges, and pagination.
- Create or edit records through structured forms.
- Manage system users, roles, audit activity, API keys, settings, webhooks, and notifications.

## Frontend Constraints

The assets follow the admin shell, not the public website shell:

- `DashboardShell`
- collapsible `Sidebar`
- sticky 64px `Toolbar`
- toolbar breadcrumbs
- toolbar search input
- notifications icon
- user avatar
- scrollable `bg-muted/30` workspace

Main-service sidebar labels are constrained to the current top-level rendered items:

- Dashboard
- Content
- Academic
- Admissions
- People
- Support
- Media
- Settings

System sidebar labels are constrained to:

- Dashboard
- Users
- Roles
- Permissions
- Audit Logs
- Settings
- API Keys
- Webhooks
- Notifications

The current `Sidebar` component does not render expanded nested children, so the final designs avoid nested sidebar menus.

## Backend And Data Constraints

No top-level `backend/` directory exists in this checkout. The usable backend contract comes from:

- `frontend/apps/admin/src/app/api/admin/_utils.ts`
- `frontend/apps/admin/src/app/api/auth/_utils.ts`
- `frontend/apps/admin/src/lib/api/`
- `frontend/packages/api-client/src/hooks/admin/`
- `frontend/packages/api-client/src/types/admin.ts`

The final designs use neutral values where source-backed live data is not guaranteed:

- `--`
- `Data unavailable`
- `No records found`
- `Not configured`

The designs include expected states for:

- loading;
- empty data;
- filtered empty results;
- permission-gated actions;
- 401/403/404/503 failure handling;
- validation errors;
- destructive confirmation patterns.

## Page Purpose

The design board is a reusable admin-page guide, not a single public page. It captures the main admin patterns needed before deeper page-specific work:

- dashboard overview;
- table/list record management;
- system administration dashboard;
- mobile admin layout.

## Product Truthfulness Constraints

The final assets intentionally avoid:

- fake metrics;
- fake trends;
- fake page views;
- fake funding;
- fake staff names;
- fake phone numbers;
- fake deadlines;
- fake certifications;
- fake rankings;
- fake integrations;
- fake activity rows;
- advertised-only or missing route pages;
- public website header/footer structure;
- nested sidebar behavior not rendered by the current component.

## Future Page Structure

Use these final boards as the visual foundation for more specific admin target folders:

- `designs/admin-auth`
- `designs/admin-service-selector`
- `designs/admin-main-dashboard`
- `designs/admin-record-index`
- `designs/admin-record-editor`
- `designs/admin-system-dashboard`
- `designs/admin-system-users`
- `designs/admin-system-roles`
- `designs/admin-system-settings`
- `designs/admin-system-audit`
- `designs/admin-system-notifications`
- `designs/admin-media`

Advertised-only routes should receive deferred design notes until route files exist.

## Implementation Notes For Future Developers

- Keep admin work inside the current admin shell. Do not import public `PageShell` into authenticated admin workspaces.
- Reconcile `/main` and `/dashboard` before implementing a major dashboard redesign.
- Replace hard-coded dashboard demo values with real hooks, neutral placeholders, or empty states.
- Preserve role/scope gating for create, edit, delete, revoke, send, and settings actions.
- Convert mobile tables into stacked record cards rather than squeezed tables.
- Keep destructive actions behind confirmation dialogs.
- Use `@ksu/ui` cards, tables, badges, buttons, dialogs, forms, inputs, `PageHeader`, `SearchFilter`, and `StatsCard` where available.

## Self-Evaluation

Final desktop and mobile assets passed the critical checks:

- They do not design the redirected root route as final.
- They do not include public website shell elements.
- They avoid advertised-only and missing routes.
- They use neutral data where backend data is uncertain.
- They preserve the admin shell, toolbar, sidebar, and role-gated workflow model.

Rubric scores:

| Category | Desktop | Mobile |
| --- | ---: | ---: |
| Product accuracy | 5 | 5 |
| Page purpose and user goal | 5 | 5 |
| Action hierarchy | 4 | 4 |
| Visual hierarchy | 4 | 4 |
| Brand consistency | 4 | 4 |
| Product storytelling and clarity | 4 | 4 |
| Trust, confidence, and usability | 5 | 5 |
| Responsiveness | 4 | 5 |
| Accessibility | 4 | 4 |
| Image quality | 4 | 4 |
| Feasibility for future implementation | 5 | 5 |

Residual risk:

- AI-rendered UI text and logo details should be treated as visual guidance only. Future implementation must use the real `Logo`/`LogoIcon` components and `/logos/ksu-logo.png`.

## Work Performed

- Repository audit completed.
- Admin route truth checked against `designs/admin-manifest.md`.
- Built-in `imagegen` used for visual generation.
- Final self-selected desktop and mobile assets saved.
- No frontend code was changed.
- No backend code was changed.
- No route, API, database, component, stylesheet, config, or production asset was modified.
- No implementation was performed.
