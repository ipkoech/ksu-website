# Sitewide Public UI Review

## Status

Implemented and verified.

This review covers the public website sections that were previously planned or only partially implemented:

- `/administration` and nested administration routes
- `/admissions` and nested admissions routes
- `/academics` and nested academic routes
- `/campus-life` and nested campus life routes
- `/news` and nested news routes
- `/events` and nested event routes
- `/announcements`
- toolbar utility routes: `/m/staff`, `/alumni`, `/az-index`, `/search`, and `/academics/examinations`

The work uses the existing public shell: `Announcements`, `MiniHeader`, `PublicHeader`, `PageShell`, and `PublicFooter`. It keeps the real logo asset at `/logos/ksu-logo.png` and preserves the frontend navigation model.

## Design Process

The `imagegen` skill was used once as a design-direction aid before implementation. The prompt included the frontend visual contract, source-backed content constraints, route truth, shell requirements, responsive requirements, and prohibited claims. No generated bitmap was treated as a direct implementation source. The final implemented pages are code-native and browser verified.

## Product Audit

Kisii University public pages are informational, navigational, and source-backed. The public site should help prospective students, current students, staff, parents, partners, and visitors understand institutional structure, academic pathways, admissions preparation, campus life, and public communications.

The remaining public pages needed consistent structure more than page-specific novelty. The shared pattern now provides:

- a full-width public shell and page hero;
- breadcrumb and section navigation;
- primary and secondary actions;
- source-boundary cards;
- related-page pathways;
- section cards with clear empty or pending-data states;
- desktop and mobile layouts that use the same visual language as the restored About pages.

## Frontend Constraints

The implementation follows the active frontend shell and visual system:

- `PageShell` wraps every new section route.
- The current announcement, mini header, public header, and footer remain in place.
- Public pages use the existing blue/orange/slate palette, display typography, rounded cards, soft borders, and restrained shadows.
- Sections are rendered as full-width bands with constrained inner content.
- Card grids collapse responsively on mobile.
- Shared footer, breadcrumb, and announcement hit areas were enlarged for mobile accessibility.
- Toolbar, mini-header, dropdown, drawer, and toolbar search targets were normalized so the visible links have adequate hit areas.

## Backend And Data Constraints

The new pages are source-bounded until APIs publish richer records. They do not invent:

- fees, payment details, or application dates;
- named office holders not already in source data;
- phone numbers, rooms, office hours, or emergency contacts;
- article text, event schedules, or announcement urgency;
- rankings, audit scores, certificates, dashboards, testimonials, or unsupported online workflows.

Dynamic planned routes render useful public fallback states. Future API work can replace those states with records for units, schools, programmes, clubs, articles, events, and announcements.

## Route Truth

`designs/manifest.md` has been updated so formerly planned public section screens are marked canonical in this workspace. The only About routes that remain redirected/deferred are:

- `/about/overview`, which redirects to `/about`;
- `/about/strategic-plan`, which redirects to `/about`.

## Implementation Notes

Shared implementation lives in:

- `frontend/apps/web/src/components/public/section-page.tsx`
- `frontend/apps/web/src/lib/public-page-data.ts`
- `frontend/apps/web/src/app/administration/[[...segments]]/page.tsx`
- `frontend/apps/web/src/app/admissions/[[...segments]]/page.tsx`
- `frontend/apps/web/src/app/academics/[[...segments]]/page.tsx`
- `frontend/apps/web/src/app/campus-life/[[...segments]]/page.tsx`
- `frontend/apps/web/src/app/news/[[...segments]]/page.tsx`
- `frontend/apps/web/src/app/events/[[...segments]]/page.tsx`
- `frontend/apps/web/src/app/announcements/page.tsx`
- `frontend/apps/web/src/app/m/staff/page.tsx`
- `frontend/apps/web/src/app/alumni/page.tsx`
- `frontend/apps/web/src/app/az-index/page.tsx`
- `frontend/apps/web/src/app/search/page.tsx`

The shared renderer is intentionally conservative. Future developers should add API-backed cards and detail sections inside the route data layer before changing the visual shell.

## Final UI/UX Triage

Desktop route sample:

- 71 public routes checked.
- 71 returned HTTP 200.
- 0 route redirects in the canonical sample.
- 0 missing `h1` headings.
- 0 horizontal overflow failures.
- 0 prohibited public-claim text matches in frontend content.

Mobile route sample:

- 71 public routes checked at `390 x 844`.
- 71 returned HTTP 200.
- 0 missing `h1` headings.
- 0 horizontal overflow failures.
- 0 visible links or buttons below the audit hit-area threshold after the shared shell patches.

Toolbar link audit:

- 41 unique internal toolbar/header URLs were collected from the rendered desktop toolbar, dropdowns, and mobile drawer.
- Every collected internal toolbar URL returned HTTP 200 and rendered inside the public shell.
- Toolbar search submission resolved to `/search?q=toolbar%20audit` with HTTP 200.
- Newly added toolbar destinations passed mobile checks for `h1`, horizontal overflow, and visible tap targets.

Code verification:

- `pnpm --filter @ksu/web typecheck` passed after the implementation and shared-shell accessibility patches.
- `git diff --check` passed.
- Public frontend copy scan found no matches for prohibited unsupported-claim terms in `frontend/apps/web/src`.
