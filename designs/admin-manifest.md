# Admin Designs Manifest

## Purpose

This manifest classifies authenticated admin application routes under `frontend/apps/admin` against the current implementation. It is the first checkpoint before generating, revising, or implementing admin-page designs.

Use this manifest for admin-console design work. Use `designs/manifest.md` and `designs/_system/frontend-visual-contract.md` for the public website.

## Relationship To Public Website Manifest

- Public website pages are governed by `designs/manifest.md`.
- Authenticated admin pages are governed by this file.
- Public `/administration` pages are not admin-console pages. They use `PageShell` from the public web app.
- Authenticated admin pages use `DashboardShell`, auth card layouts, or service-selection layouts from `frontend/apps/admin`.

## Status Terms

| Term | Meaning |
| --- | --- |
| Canonical | The admin route is implemented and should be treated as a production design target. |
| Redirected | The route exists only to redirect elsewhere. Treat as deferred unless architecture changes. |
| Duplicate | The route is implemented but overlaps another implemented route. Design one shared pattern until routing is reconciled. |
| Advertised only | The route appears in navigation but has no route file in this checkout. Do not create final assets. |
| Unexposed | The route file exists, but the current sidebar does not expose it directly. Design only when the workflow is confirmed. |
| Dynamic state | The route is implemented as reusable create/edit/detail state. Designs should cover state variants rather than one literal record. |
| Needs data | The route exists, but current page content includes hard-coded demo values or lacks backing hooks. Use neutral or source-backed states only. |
| Deferred | Keep for reference, but do not generate final visual assets yet. |

## Controlling Sources

| Area | Source |
| --- | --- |
| Admin root redirect | `frontend/apps/admin/src/app/page.tsx` |
| Auth route layout | `frontend/apps/admin/src/app/(auth)/layout.tsx` |
| Login form | `frontend/apps/admin/src/components/auth/login-form.tsx` |
| Protected auth gate | `frontend/apps/admin/src/app/(protected)/layout.tsx` |
| Service picker | `frontend/apps/admin/src/app/(protected)/select-service/page.tsx` |
| Dashboard shell | `frontend/apps/admin/src/components/layout/dashboard-shell.tsx` |
| Sidebar and service navigation | `frontend/apps/admin/src/components/layout/sidebar.tsx` |
| Toolbar and breadcrumbs | `frontend/apps/admin/src/components/layout/toolbar.tsx` |
| Admin app globals | `frontend/apps/admin/src/app/globals.css` |
| Admin Tailwind theme | `frontend/apps/admin/tailwind.config.ts` |
| Shared UI tokens | `frontend/packages/ui/src/globals.css` |
| System access rules | `frontend/apps/admin/src/app/(protected)/system/_lib/access.ts` |
| Admin proxy helpers | `frontend/apps/admin/src/app/api/admin/_utils.ts` |
| Auth API helpers | `frontend/apps/admin/src/app/api/auth/_utils.ts` |
| Admin typed hooks | `frontend/packages/api-client/src/hooks/admin/` |
| Admin typed data | `frontend/packages/api-client/src/types/admin.ts` |
| Main app API clients | `frontend/apps/admin/src/lib/api/` |

## Admin Shell Contract

Admin workspace pages must preserve the actual admin shell:

1. `DashboardShell`
2. collapsible `Sidebar`
3. sticky `Toolbar`
4. page content in a scrollable `bg-muted/30` workspace

Admin auth pages must preserve the current centered card pattern:

1. `min-h-screen bg-muted/50 p-4`
2. KSU `LogoIcon`
3. form card with validation and error states

Service selection must preserve:

1. centered service grid
2. KSU `LogoIcon`
3. role-derived service cards
4. authorized services only

Do not put the public `Announcements`, `MiniHeader`, `PublicHeader`, or `PublicFooter` inside authenticated admin pages unless the admin application is intentionally redesigned to use them.

## Branding And Tokens

Admin designs must use:

- KSU logo components from `@ksu/ui/components`, backed by `/logos/ksu-logo.png`.
- `@ksu/ui` tokens from `frontend/packages/ui/src/globals.css`.
- Admin Tailwind theme tokens from `frontend/apps/admin/tailwind.config.ts`.
- Sidebar colors from `--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, and related token values.
- Compact sans-serif admin typography. Do not use public-site hero display treatments inside dense admin workspaces.
- Lucide icons already used by the admin app where a matching icon exists.

## Current Admin Route Baseline

### Root And Auth

| Route | Frontend file | Current status | Design target |
| --- | --- | --- | --- |
| `/` | `frontend/apps/admin/src/app/page.tsx` | Redirected to `/login` | No final asset |
| `/login` | `frontend/apps/admin/src/app/(auth)/login/page.tsx` | Canonical auth route | `designs/admin-auth` |
| `/forgot-password` | `frontend/apps/admin/src/app/(auth)/forgot-password/page.tsx` | Canonical auth route | `designs/admin-auth` |
| `/reset-password` | `frontend/apps/admin/src/app/(auth)/reset-password/page.tsx` | Canonical auth route | `designs/admin-auth` |
| protected non-public routes without `ksu_access` | `frontend/apps/admin/src/middleware.ts` | Redirected to `/login?redirect=...` | State in `designs/admin-auth` |

### Service Entry

| Route | Frontend file | Current status | Design target |
| --- | --- | --- | --- |
| `/select-service` | `frontend/apps/admin/src/app/(protected)/select-service/page.tsx` | Canonical protected route | `designs/admin-service-selector` |
| `/main` | `frontend/apps/admin/src/app/(protected)/main/page.tsx` | Canonical service entry, source-backed counts | `designs/admin-main-dashboard` |
| `/dashboard` | `frontend/apps/admin/src/app/(dashboard)/dashboard/page.tsx` | Redirected to `/main` | No final asset |
| `/research` | `frontend/apps/admin/src/app/(protected)/research/page.tsx` | Canonical service dashboard, source-backed counts | `designs/admin-research-dashboard` |
| `/library` | `frontend/apps/admin/src/app/(protected)/library/page.tsx` | Canonical service dashboard, source-backed and neutral states | `designs/admin-library-dashboard` |
| `/system` | `frontend/apps/admin/src/app/(protected)/system/page.tsx` | Canonical system dashboard | `designs/admin-system-dashboard` |

### Main Portal Navigation Routes

The main service sidebar currently exposes Dashboard, Content, Academic, Admissions, People, Support, Media, and Settings. Some exposed parent routes do not have route files yet.

| Route | Frontend file | Current status | Design target |
| --- | --- | --- | --- |
| `/content` | `frontend/apps/admin/src/app/(dashboard)/content/page.tsx` | Canonical | `designs/admin-content-dashboard` |
| `/content/news` | `frontend/apps/admin/src/app/(dashboard)/content/news/page.tsx` | Canonical record index | `designs/admin-record-index` |
| `/content/news/[slug]` | `frontend/apps/admin/src/app/(dashboard)/content/news/[slug]/page.tsx` | Dynamic create/edit state | `designs/admin-record-editor` |
| `/content/events` | `frontend/apps/admin/src/app/(dashboard)/content/events/page.tsx` | Canonical record index | `designs/admin-record-index` |
| `/content/events/[slug]` | `frontend/apps/admin/src/app/(dashboard)/content/events/[slug]/page.tsx` | Dynamic create/edit state | `designs/admin-record-editor` |
| `/content/announcements` | `frontend/apps/admin/src/app/(dashboard)/content/announcements/page.tsx` | Canonical record index | `designs/admin-record-index` |
| `/content/announcements/[id]` | `frontend/apps/admin/src/app/(dashboard)/content/announcements/[id]/page.tsx` | Dynamic neutral editor state | `designs/admin-record-editor` |
| `/content/blogs` | `frontend/apps/admin/src/app/(dashboard)/content/blogs/page.tsx` | Canonical record index | `designs/admin-record-index` |
| `/content/blogs/[id]` | `frontend/apps/admin/src/app/(dashboard)/content/blogs/[id]/page.tsx` | Dynamic neutral editor state | `designs/admin-record-editor` |
| `/content/sliders` | `frontend/apps/admin/src/app/(dashboard)/content/sliders/page.tsx` | Canonical record index | `designs/admin-record-index` |
| `/content/sliders/[id]` | `frontend/apps/admin/src/app/(dashboard)/content/sliders/[id]/page.tsx` | Dynamic neutral slider management state | `designs/admin-record-editor` |
| `/content/slider-groups/[id]` | `frontend/apps/admin/src/app/(dashboard)/content/slider-groups/[id]/page.tsx` | Dynamic neutral editor state | `designs/admin-record-editor` |
| `/academic` | `frontend/apps/admin/src/app/(dashboard)/academic/page.tsx` | Canonical parent overview | `designs/admin-main-sections` |
| `/academic/schools` | `frontend/apps/admin/src/app/(dashboard)/academic/schools/page.tsx` | Canonical record index | `designs/admin-record-index` |
| `/academic/schools/[id]` | `frontend/apps/admin/src/app/(dashboard)/academic/schools/[id]/page.tsx` | Dynamic create/edit state | `designs/admin-record-editor` |
| `/academic/departments` | `frontend/apps/admin/src/app/(dashboard)/academic/departments/page.tsx` | Canonical record index | `designs/admin-record-index` |
| `/academic/departments/[id]` | `frontend/apps/admin/src/app/(dashboard)/academic/departments/[id]/page.tsx` | Dynamic create/edit state | `designs/admin-record-editor` |
| `/academic/programmes` | `frontend/apps/admin/src/app/(dashboard)/academic/programmes/page.tsx` | Canonical record index | `designs/admin-record-index` |
| `/academic/programmes/[id]` | `frontend/apps/admin/src/app/(dashboard)/academic/programmes/[id]/page.tsx` | Dynamic create/edit state | `designs/admin-record-editor` |
| `/admissions` | `frontend/apps/admin/src/app/(dashboard)/admissions/page.tsx` | Canonical parent overview | `designs/admin-main-sections` |
| `/admissions/intakes` | `frontend/apps/admin/src/app/(dashboard)/admissions/intakes/page.tsx` | Canonical record index, not exposed directly by sidebar | `designs/admin-record-index` |
| `/admissions/intakes/[id]` | `frontend/apps/admin/src/app/(dashboard)/admissions/intakes/[id]/page.tsx` | Dynamic neutral editor state | `designs/admin-record-editor` |
| `/people` | `frontend/apps/admin/src/app/(dashboard)/people/page.tsx` | Canonical parent overview | `designs/admin-main-sections` |
| `/people/persons` | `frontend/apps/admin/src/app/(dashboard)/people/persons/page.tsx` | Canonical record index | `designs/admin-record-index` |
| `/people/persons/[id]` | `frontend/apps/admin/src/app/(dashboard)/people/persons/[id]/page.tsx` | Dynamic create/edit state | `designs/admin-record-editor` |
| `/people/persons/[id]/assignments` | `frontend/apps/admin/src/app/(dashboard)/people/persons/[id]/assignments/page.tsx` | Dynamic neutral deep-link state | `designs/admin-record-editor` |
| `/people/staff` | `frontend/apps/admin/src/app/(dashboard)/people/staff/page.tsx` | Canonical record index, not exposed directly by sidebar | `designs/admin-record-index` |
| `/people/staff/new` | `frontend/apps/admin/src/app/(dashboard)/people/staff/new/page.tsx` | Dynamic create state | `designs/admin-record-editor` |
| `/people/staff/[id]` | `frontend/apps/admin/src/app/(dashboard)/people/staff/[id]/page.tsx` | Dynamic detail/edit state | `designs/admin-record-editor` |
| `/support` | `frontend/apps/admin/src/app/(dashboard)/support/page.tsx` | Canonical parent overview | `designs/admin-main-sections` |
| `/support/faqs` | `frontend/apps/admin/src/app/(dashboard)/support/faqs/page.tsx` | Canonical record index | `designs/admin-record-index` |
| `/support/faqs/[id]` | `frontend/apps/admin/src/app/(dashboard)/support/faqs/[id]/page.tsx` | Dynamic create/edit state | `designs/admin-record-editor` |
| `/media` | `frontend/apps/admin/src/app/(dashboard)/media/page.tsx` | Canonical media page | `designs/admin-media` |
| `/reports` | `frontend/apps/admin/src/app/(dashboard)/reports/page.tsx` | Canonical reports page, not exposed by current sidebar | `designs/admin-reports` |
| `/settings` | `frontend/apps/admin/src/app/(dashboard)/settings/page.tsx` | Canonical parent overview | `designs/admin-main-sections` |
| `/settings/general` | `frontend/apps/admin/src/app/(dashboard)/settings/general/page.tsx` | Canonical settings page, not exposed directly by sidebar | `designs/admin-settings` |
| `/settings/api-keys` | `frontend/apps/admin/src/app/(dashboard)/settings/api-keys/page.tsx` | Redirected to `/system/settings/api-keys` | No final asset |
| `/settings/profile` | `frontend/apps/admin/src/app/(dashboard)/settings/profile/page.tsx` | Canonical read-only profile state | `designs/admin-settings` |

### Organization Routes

These routes exist in the main dashboard group but are not currently exposed by the main service sidebar.

| Route | Frontend file | Current status | Design target |
| --- | --- | --- | --- |
| `/organization/divisions` | `frontend/apps/admin/src/app/(dashboard)/organization/divisions/page.tsx` | Unexposed canonical route | `designs/admin-record-index` |
| `/organization/divisions/[id]` | `frontend/apps/admin/src/app/(dashboard)/organization/divisions/[id]/page.tsx` | Unexposed dynamic neutral editor state | `designs/admin-record-editor` |
| `/organization/governance` | `frontend/apps/admin/src/app/(dashboard)/organization/governance/page.tsx` | Unexposed canonical route | `designs/admin-record-index` |
| `/organization/governance/[id]` | `frontend/apps/admin/src/app/(dashboard)/organization/governance/[id]/page.tsx` | Unexposed dynamic detail state | `designs/admin-record-editor` |
| `/organization/governance/[id]/members` | `frontend/apps/admin/src/app/(dashboard)/organization/governance/[id]/members/page.tsx` | Unexposed dynamic neutral members state | `designs/admin-record-editor` |

### Research Routes

| Route | Frontend file | Current status | Design target |
| --- | --- | --- | --- |
| `/research` | `frontend/apps/admin/src/app/(protected)/research/page.tsx` | Canonical dashboard, source-backed counts | `designs/admin-research-dashboard` |
| `/research/projects` | `frontend/apps/admin/src/app/(protected)/research/projects/page.tsx` | Canonical source-backed preview | `designs/admin-record-index` |
| `/research/publications` | `frontend/apps/admin/src/app/(protected)/research/publications/page.tsx` | Canonical source-backed preview | `designs/admin-record-index` |
| `/research/grants` | `frontend/apps/admin/src/app/(protected)/research/grants/page.tsx` | Canonical source-backed preview | `designs/admin-record-index` |

### Library Routes

| Route | Frontend file | Current status | Design target |
| --- | --- | --- | --- |
| `/library` | `frontend/apps/admin/src/app/(protected)/library/page.tsx` | Canonical dashboard, source-backed and neutral states | `designs/admin-library-dashboard` |
| `/library/catalog` | `frontend/apps/admin/src/app/(protected)/library/catalog/page.tsx` | Canonical source-backed branch preview | `designs/admin-record-index` |
| `/library/circulation` | `frontend/apps/admin/src/app/(protected)/library/circulation/page.tsx` | Canonical source-backed preview | `designs/admin-record-index` |
| `/library/patrons` | `frontend/apps/admin/src/app/(protected)/library/patrons/page.tsx` | Canonical neutral state, missing dedicated backend endpoint | `designs/admin-record-index` |

### System Administration Routes

| Route | Frontend file | Current status | Design target |
| --- | --- | --- | --- |
| `/system` | `frontend/apps/admin/src/app/(protected)/system/page.tsx` | Canonical dashboard | `designs/admin-system-dashboard` |
| `/system/users` | `frontend/apps/admin/src/app/(protected)/system/users/page.tsx` | Canonical record index | `designs/admin-system-users` |
| `/system/users/new` | `frontend/apps/admin/src/app/(protected)/system/users/new/page.tsx` | Canonical create state | `designs/admin-system-users` |
| `/system/users/[id]` | `frontend/apps/admin/src/app/(protected)/system/users/[id]/page.tsx` | Dynamic detail/edit state | `designs/admin-system-users` |
| `/system/roles` | `frontend/apps/admin/src/app/(protected)/system/roles/page.tsx` | Canonical record index | `designs/admin-system-roles` |
| `/system/roles/new` | `frontend/apps/admin/src/app/(protected)/system/roles/new/page.tsx` | Canonical create state | `designs/admin-system-roles` |
| `/system/roles/[id]` | `frontend/apps/admin/src/app/(protected)/system/roles/[id]/page.tsx` | Dynamic detail/edit state | `designs/admin-system-roles` |
| `/system/permissions` | `frontend/apps/admin/src/app/(protected)/system/permissions/page.tsx` | Canonical reference page | `designs/admin-system-permissions` |
| `/system/audit` | `frontend/apps/admin/src/app/(protected)/system/audit/page.tsx` | Canonical audit index | `designs/admin-system-audit` |
| `/system/settings` | `frontend/apps/admin/src/app/(protected)/system/settings/page.tsx` | Canonical settings page | `designs/admin-system-settings` |
| `/system/settings/api-keys` | `frontend/apps/admin/src/app/(protected)/system/settings/api-keys/page.tsx` | Canonical API key page | `designs/admin-system-settings` |
| `/system/settings/webhooks` | `frontend/apps/admin/src/app/(protected)/system/settings/webhooks/page.tsx` | Canonical webhooks page | `designs/admin-system-settings` |
| `/system/notifications` | `frontend/apps/admin/src/app/(protected)/system/notifications/page.tsx` | Canonical notification templates page | `designs/admin-system-notifications` |
| `/system/notifications/send` | `frontend/apps/admin/src/app/(protected)/system/notifications/send/page.tsx` | Canonical send notification form | `designs/admin-system-notifications` |

## Admin Design Folder Inventory

### `designs/admin-pages`

| Field | Value |
| --- | --- |
| Purpose | Main admin pages design board and admin app audit notes |
| Frontend status | Grouped canonical/admin-pattern reference |
| Canonical design target | Yes, only for approved grouped patterns from this manifest |
| Desktop asset | `admin-pages-desktop-final.png` - `1487 x 1058` |
| Mobile asset | `admin-pages-mobile-final.png` - `862 x 1824` |
| Source of truth | `frontend/apps/admin`, `@ksu/ui`, `@ksu/api-client/hooks/admin` |
| Decision | Keep as a core admin design suite; use smaller target folders for page-specific follow-up designs |

## Recommended Admin Design Targets

Future visual assets should be generated in small, reusable groups. Do not create one oversized "all admin pages" image.

| Priority | Design folder | Scope | Current action |
| ---: | --- | --- | --- |
| 1 | `designs/admin-auth` | Login, forgot password, reset password, unauthenticated redirect state | Create desktop and mobile final assets |
| 2 | `designs/admin-service-selector` | Authorized service selection after login | Create desktop and mobile final assets |
| 3 | `designs/admin-main-dashboard` | `/main` and `/dashboard` shared dashboard direction | Create final assets after resolving duplicate route treatment in notes |
| 4 | `designs/admin-record-index` | Reusable admin table/list pages across content, academic, people, support, organization | Create component-faithful pattern assets |
| 5 | `designs/admin-record-editor` | Reusable create/edit/detail forms | Create component-faithful pattern assets |
| 6 | `designs/admin-system-dashboard` | `/system` dashboard | Create final assets using real hook states only |
| 7 | `designs/admin-system-users` | Users index, create, detail/edit, roles assignment | Create final assets |
| 8 | `designs/admin-system-roles` | Roles index, create, detail/edit, permissions assignment | Create final assets |
| 9 | `designs/admin-system-settings` | Settings, API keys, webhooks | Create final assets |
| 10 | `designs/admin-system-audit` | Audit log filtering and detail density | Create final assets |
| 11 | `designs/admin-system-notifications` | Templates and send notification flow | Create final assets |
| 12 | `designs/admin-media` | Media library page | Create final assets after API state audit |
| 13 | `designs/admin-reports` | Reports page | Create only after route purpose and data source are confirmed |
| 14 | `designs/admin-research-dashboard` | Research dashboard | Create only with neutral/source-backed states |
| 15 | `designs/admin-library-dashboard` | Library dashboard | Create only with neutral/source-backed states |

## Backend And API Constraints

Backend services exist under `services/`. Treat the following as the current backend contract available to frontend/admin design and implementation:

- Admin proxy routes use `MAIN_API_URL || http://localhost:8000`.
- Direct app API clients use `NEXT_PUBLIC_API_URL || http://localhost:8000/api/v1`.
- Main backend routes live under `services/main/app/api/v1`.
- Research backend routes live under `services/research/app/routes/v1`.
- Library backend routes live under `services/library/app/routes/v1`.
- Auth API routes support login, logout, me, refresh, forgot password, and reset password.
- Admin system proxy routes cover users, roles, permissions, audit, settings, API keys, webhooks, notification templates, notification send, and broadcast.
- Main admin API clients cover content, academic, admissions, organization, people, student life, support, marketing, media, and legacy system helpers.
- Typed admin hooks currently cover users, roles, permissions, audit, settings, API keys, and webhooks.

Future designs must show only data states backed by these contracts or clearly neutral states such as `--`, "No records found", "Data unavailable", or "Not configured".

## Required Admin Page States

Every admin design target must account for these states where relevant:

- Authenticated default.
- Unauthenticated redirect.
- Loading gate and query loading.
- Empty record set.
- Filtered empty result.
- 401 unauthenticated API response.
- 403 unauthorized or missing scope.
- 404 missing record.
- 503 admin service unavailable.
- Form validation errors.
- Save/update pending.
- Create/update success.
- Delete/revoke/destructive confirmation.
- Delete/revoke/destructive failure.
- Permission-limited read-only view.
- Mobile sidebar drawer open and closed.
- Collapsed desktop sidebar.

## Product Truthfulness Rules

Admin designs must avoid:

- Fake metrics, fake growth rates, fake engagement, fake funding, fake page views, fake patron counts, fake active sessions, and fake recent activity.
- Fake staff names, phone numbers, office hours, room locations, deadlines, testimonials, certifications, rankings, or integrations.
- Unsupported research/library child pages as final production assets while route files are missing.
- Treating advertised-only parent routes as implemented pages.
- Showing privileged actions to users without required roles or scopes.
- Main-header or public-footer behavior from the public website.
- Unsupported search behavior beyond the current toolbar input.
- Unsupported notification workflows beyond the current templates/send routes.
- API key values after creation except as an explicit one-time reveal state.

## Design Readiness Rules

Before final admin PNG assets are saved:

1. Confirm the target route status in this manifest.
2. If status is Canonical, Dynamic state, or Needs data, final visual assets are allowed only when the design states source-backed or neutral data.
3. If status is Redirected, Advertised only, Duplicate, Unexposed, or Deferred, produce design notes only unless this manifest is updated first.
4. Use `imagegen` only after this status check passes and the task asks for visual design assets.
5. Save only final self-approved assets in the target design folder.
6. Do not save rejected, exploratory, or intermediate generations in `designs/`.
7. Do not implement admin code from a design task unless the user explicitly changes the task from design to implementation.

## Current Route Concerns

These should be resolved before broad admin visual generation:

- `/dashboard` redirects to canonical `/main`.
- Main sidebar parent links now have route files and should be designed as section overview pages.
- Research and library child links now resolve to source-backed preview or neutral states.
- Some create/edit states are intentionally neutral until schema-complete forms are wired.
- Reports remain neutral until a reporting API is introduced.

## Batch Counts

| Category | Count |
| --- | ---: |
| Redirected admin root routes | 3 |
| Canonical auth routes | 3 |
| Canonical protected entry/dashboard routes | 5 |
| Duplicate main dashboard routes | 0 |
| Canonical main portal record/workflow routes | 41 |
| Unexposed implemented organization routes | 5 |
| Advertised-only main parent routes | 0 |
| Advertised-only research/library child routes | 0 |
| Canonical system administration routes | 14 |
| Existing admin design folders | 1 |
| Recommended admin design target folders | 15 |

## Batch Production Status

1. Admin app route truth now has a dedicated manifest separate from public website route truth.
2. Future admin visual generation may proceed only for routes or grouped patterns marked design-ready by this file.
3. Neutral editor routes should receive schema-aligned design notes before final form assets.
4. Reports should remain neutral until reporting endpoints are available.
5. This manifest now reflects the implementation pass that made advertised admin routes resolve.
