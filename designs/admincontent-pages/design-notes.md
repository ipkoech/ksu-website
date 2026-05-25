# Admincontent Pages Design Notes

Status: Deferred / non-canonical admin route target

Governing manifest: `designs/admin-manifest.md`

## Route Status

- Requested page name: `admincontent pages`.
- Normalized design folder: `designs/admincontent-pages`.
- Prompt route truth: `[page name]` currently redirects to an empty or unspecified destination.
- Public route manifest: `designs/manifest.md` delegates authenticated admin application designs to `designs/admin-manifest.md`.
- Admin route manifest: `designs/admin-manifest.md` is the controlling source for this target. It marks `/content` and the implemented content child routes as canonical, but it does not define a canonical `/content/pages` or `admincontent pages` route.
- Current route files: no `frontend/apps/admin/src/app/(dashboard)/content/pages/page.tsx` route exists in this checkout.
- Current sidebar: Content exposes News, Blogs, Events, Announcements, and Sliders. It does not expose Pages.
- Final visual assets allowed: No.
- Reason final assets are blocked: the requested target is redirected, ambiguous, or not canonical in the current route architecture.

## Visual Generation

- `imagegen` was skipped.
- Reason: route truth blocks visual generation. The task explicitly forbids final PNG assets for redirected or non-canonical routes unless the route architecture has changed or exploratory assets are explicitly approved.
- No desktop PNG was generated.
- No mobile PNG was generated.
- No exploratory or intermediate drafts were saved in `designs/`.

## Product Audit Summary

This target belongs to the authenticated admin console in `frontend/apps/admin`, so `designs/admin-manifest.md` is the applicable route and shell contract. The admin console is governed by `DashboardShell`, a role-filtered sidebar, sticky toolbar, breadcrumbs, and compact admin workspace patterns.

The requested target name points to an admin content-management concept. The implemented admin content area currently manages:

- News
- Blogs
- Announcements
- Events
- Sliders and slider groups

There is no confirmed page-management route, page-management API, or sidebar entry for generic CMS pages.

## Target Page Purpose

If a future `admincontent pages` route is restored or created, its likely purpose would be to let authorized admin users manage reusable public website page records. That purpose is not currently backed by a canonical route or data contract, so it must remain deferred.

Primary future audience:

- Authenticated content administrators.
- Main portal administrators.
- Users with an approved content-management scope.

Primary future user goal:

- Review, search, create, edit, publish, unpublish, archive, and safely delete page records only after those workflows are backed by route files, permissions, and API endpoints.

## Frontend Constraints

No final design should be created until the route is canonical in `designs/admin-manifest.md`.

This target must use the admin shell, not the public website shell:

- `DashboardShell`
- collapsible `Sidebar`
- sticky `Toolbar`
- toolbar breadcrumbs
- toolbar search behavior
- scrollable `bg-muted/30` workspace
- KSU logo components backed by `/logos/ksu-logo.png`
- admin Tailwind tokens and compact sans-serif typography

Do not use public `Announcements`, `MiniHeader`, `PublicHeader`, `PageShell`, or `PublicFooter` inside this admin target unless the admin application architecture is intentionally changed first.

## Backend And Data Constraints

Current content-management data sources found in the frontend are source-backed for:

- `/api/v1/news`
- `/api/v1/blogs`
- `/api/v1/events`
- `/api/v1/announcements`
- `/api/v1/sliders`
- `/api/v1/media`

The current admin `/content` page uses:

- `useNewsList`
- `useEvents`
- `blogsApi.list`
- `announcementsApi.list`
- `slidersApi.listGroups`
- `formatCount` for neutral count display

No generic Pages API endpoint, typed hook, table page, editor page, or permission scope was confirmed for this target. A future design must not invent live counts, activity streams, workflow states, preview URLs, publishing rules, or page templates unless they are backed by implementation.

Allowed neutral states for future work:

- `--`
- `No records found`
- `Data unavailable`
- `Not configured`
- disabled or hidden create/edit/delete actions when scope is missing

## Current Route Behavior

Relevant current route truth:

- Admin root `/` redirects to `/login`.
- Admin `/dashboard` redirects to `/main`.
- Admin `/settings/api-keys` redirects to `/system/settings/api-keys`.
- Admin `/content` is canonical, but it is a content dashboard, not a generic pages manager.
- Admin `/content/news`, `/content/blogs`, `/content/events`, `/content/announcements`, and `/content/sliders` are canonical record indexes or related dynamic editor states.
- No canonical route for `admincontent pages` or `/content/pages` was found.

## Recommended Future Page Structure

Before final visual assets are produced, the product should first decide and implement the canonical route architecture.

Recommended route if this is an admin CMS pages feature:

- `/content/pages`
- `/content/pages/new`
- `/content/pages/[id]` or `/content/pages/[slug]`

Recommended UI structure after route approval:

- `DashboardShell` with Content active in the sidebar.
- `PageHeader` with title `Pages`, a source-backed description, and a gated create action.
- Search and filters for status, visibility, section, and last updated only if backend fields exist.
- Record index using the admin `DataTable` pattern.
- Empty, loading, filtered-empty, error, and permission-denied states.
- Create/edit form using existing form, card, input, textarea, switch, select, and confirmation-dialog components.
- Publish/unpublish/archive/delete actions only if backend endpoints and permissions exist.
- Mobile layout that converts table rows into readable stacked record cards.

## Product Truthfulness Constraints

Future designs must avoid:

- treating this redirected or missing route as production-ready;
- fake page counts;
- fake page names;
- fake owners;
- fake approval workflows;
- fake preview URLs;
- fake publication schedules;
- fake activity logs;
- fake analytics;
- fake permissions;
- unsupported page-builder controls;
- unsupported AI writing tools;
- public header/footer elements inside the admin console;
- dashboard metrics not backed by real hooks.

## Opportunities For Improvement

If the route becomes canonical, the strongest design direction would be a restrained admin record-management surface rather than a marketing-style page:

- clearer separation between content type dashboard and page index;
- consistent bulk actions and status badges across record indexes;
- better mobile record cards for content managers working on small screens;
- explicit empty/error/loading states;
- preview/publish affordances only when implementation supports them;
- route-level notes that distinguish public website pages from admin-managed content records.

## Implementation Notes For Future Developers

- Add the route to `designs/admin-manifest.md` only after the frontend route exists.
- Add a route file under `frontend/apps/admin/src/app/(dashboard)/content/pages/` before design generation is treated as production-bound.
- Add backend or API-client support before rendering data-backed states.
- Add permission/scope handling before exposing create, edit, publish, archive, or delete actions.
- Keep implementation aligned with existing admin components: `DashboardShell`, `Sidebar`, `Toolbar`, `PageHeader`, `DataTable`, cards, forms, switches, badges, dialogs, and toasts.
- Keep any future visual generation focused on the smallest approved target folder rather than expanding `designs/admin-pages`.

## Work Performed

- Read `designs/admin-manifest.md` as the governing manifest for this authenticated admin target.
- Checked `designs/manifest.md` only to confirm it delegates admin-console routes to `designs/admin-manifest.md`.
- Read `designs/_system/frontend-visual-contract.md` only because the original task listed it as required; it is not the controlling shell contract for authenticated admin pages.
- Audited relevant admin route files, including admin root redirect, dashboard redirect, content dashboard, dashboard shell, sidebar, toolbar, layout, admin tokens, and content API clients.
- Confirmed no canonical `admincontent pages` or `/content/pages` route exists in the current checkout.
- Created this deferred design note only.
- No implementation was performed.
- No frontend code was changed.
- No backend code was changed.
- No routes, APIs, database files, components, stylesheets, configs, or production assets were modified.
