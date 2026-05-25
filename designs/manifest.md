# Designs Manifest

## Purpose

This manifest classifies every public website design folder under `designs/` against the current frontend implementation. It is the first checkpoint before regenerating, revising, or implementing public website designs.

Use this with `designs/_system/frontend-visual-contract.md`.

Authenticated admin application designs are governed separately by `designs/admin-manifest.md`.

## Status Terms

| Term | Meaning |
| --- | --- |
| Canonical | The frontend route is implemented and should be treated as production target. |
| Redirected | The route exists only to redirect elsewhere. Treat designs as deferred unless architecture changes. |
| Alias | The folder or prompt name maps to another canonical frontend route. |
| Needs revision | The design direction may be useful, but assets or shell details must be corrected. |
| Deferred | Keep for reference, but do not implement yet. |

## Current Frontend Route Baseline

| Route | Frontend file | Current status |
| --- | --- | --- |
| `/` | `frontend/apps/web/src/app/page.tsx` | Canonical homepage |
| `/about` | `frontend/apps/web/src/app/about/page.tsx` | Canonical About overview |
| `/about/overview` | `frontend/apps/web/src/app/about/overview/page.tsx` | Redirects to `/about` |
| `/about/history` | `frontend/apps/web/src/app/about/history/page.tsx` | Canonical About history page |
| `/about/mission-vision` | `frontend/apps/web/src/app/about/mission-vision/page.tsx` | Canonical mission and vision page |
| `/about/governance` | `frontend/apps/web/src/app/about/governance/page.tsx` | Canonical governance page |
| `/about/leadership` | `frontend/apps/web/src/app/about/leadership/page.tsx` | Canonical standalone leadership page |
| `/about/governance-leadership` | `frontend/apps/web/src/app/about/governance-leadership/page.tsx` | Canonical combined governance and leadership page |
| `/about/governance/[slug]` | `frontend/apps/web/src/app/about/governance/[slug]/page.tsx` | Canonical board detail page |
| `/about/leadership/[slug]` | `frontend/apps/web/src/app/about/leadership/[slug]/page.tsx` | Canonical leader profile page |
| `/about/university-management` | `frontend/apps/web/src/app/about/university-management/page.tsx` | Canonical management page |
| `/about/administrative-division` | `frontend/apps/web/src/app/about/administrative-division/page.tsx` | Canonical administrative page |
| `/about/service-charter` | `frontend/apps/web/src/app/about/service-charter/page.tsx` | Canonical access page |
| `/about/quality-assurance` | `frontend/apps/web/src/app/about/quality-assurance/page.tsx` | Canonical quality assurance page |
| `/about/strategic-plan` | `frontend/apps/web/src/app/about/strategic-plan/page.tsx` | Redirects to `/about` |
| `/administration` and nested routes | `frontend/apps/web/src/app/administration/[[...segments]]/page.tsx` | Canonical public administration pages |
| `/admissions` and nested routes | `frontend/apps/web/src/app/admissions/[[...segments]]/page.tsx` | Canonical public admissions pages |
| `/academics` and nested routes | `frontend/apps/web/src/app/academics/[[...segments]]/page.tsx` | Canonical public academics pages |
| `/campus-life` and nested routes | `frontend/apps/web/src/app/campus-life/[[...segments]]/page.tsx` | Canonical public campus life pages |
| `/news` and nested routes | `frontend/apps/web/src/app/news/[[...segments]]/page.tsx` | Canonical public news pages |
| `/events` and nested routes | `frontend/apps/web/src/app/events/[[...segments]]/page.tsx` | Canonical public events pages |
| `/announcements` | `frontend/apps/web/src/app/announcements/page.tsx` | Canonical public announcements page |
| `/m/staff` | `frontend/apps/web/src/app/m/staff/page.tsx` | Canonical toolbar staff portal access page |
| `/alumni` | `frontend/apps/web/src/app/alumni/page.tsx` | Canonical toolbar alumni page |
| `/az-index` | `frontend/apps/web/src/app/az-index/page.tsx` | Canonical toolbar A-Z index page |
| `/search` | `frontend/apps/web/src/app/search/page.tsx` | Canonical toolbar search entry page |

## Design Folder Inventory

### `designs/landing-page`

| Field | Value |
| --- | --- |
| Intended route | `/` |
| Frontend status | Canonical |
| Canonical design target | Yes |
| Desktop asset | `landing-page-desktop-final.png` - `863 x 1822` |
| Mobile asset | `landing-page-mobile-final.png` - `725 x 2170` |
| Source of truth | `frontend/apps/web/src/app/page.tsx`, `HomepageHeroFallback`, `AcademicSection`, public shell components |
| Decision | Needs revision |

Notes:

- The direction is usable, but the desktop asset is portrait-shaped and should not be treated as a desktop final.
- Regenerate or revise against the exact homepage shell: announcement, mini header, transparent `PublicHeader`, homepage hero, bento area, academic section, news/events, CTA, and footer.
- Keep the applicant journey and schools path, but make the asset dimensions and shell match the frontend.

### `designs/about-overview`

| Field | Value |
| --- | --- |
| Intended route | `/about` |
| Frontend status | Canonical for `/about`; `/about/overview` redirects to `/about` |
| Canonical design target | Yes, only as `/about` |
| Desktop asset | `about-overview-desktop-final.png` - `1536 x 1024` |
| Mobile asset | `about-overview-mobile-final.png` - `852 x 1846` |
| Source of truth | `frontend/apps/web/src/app/about/about-overview-content.tsx`, `frontend/apps/web/src/app/about/page.tsx`, `AboutUsSection`, `about-data.ts` |
| Decision | Keep, but reconcile |

Notes:

- Treat this as the About overview design for canonical `/about`, not as a standalone `/about/overview` route.
- Reconcile header, footer, side navigation, and component mapping with `PageShell` and the current `/about` implementation.
- Avoid duplicating facts already rendered by `AboutUsSection` unless the frontend page is intentionally simplified.

### `designs/about-history`

| Field | Value |
| --- | --- |
| Intended route | `/about/history` |
| Frontend status | Canonical About history page |
| Canonical design target | Yes |
| Desktop asset | `about-history-desktop-final.png` - `1536 x 1024` |
| Mobile asset | `about-history-mobile-final.png` - `862 x 1824` |
| Source of truth | `frontend/apps/web/src/app/about/history/page.tsx`, `frontend/apps/web/src/lib/about-data.ts`, `historyTimeline` |
| Decision | Implemented; keep source-backed |

Notes:

- `/about/history` is now a real public page instead of a redirect.
- Use `historyTimeline` and source-backed institutional facts only.
- Keep the same full-width section principles used by the implemented `/about` overview.

### `designs/about-mission-vision`

| Field | Value |
| --- | --- |
| Intended route | `/about/mission-vision` |
| Frontend status | Canonical mission and vision page |
| Canonical design target | Yes |
| Desktop asset | `about-mission-vision-desktop-final.png` - `1536 x 1024` |
| Mobile asset | `about-mission-vision-mobile-final.png` - `864 x 1821` |
| Source of truth | `frontend/apps/web/src/app/about/mission-vision/page.tsx`, `frontend/apps/web/src/lib/about-data.ts`, `officialMission`, `officialVision`, `officialPhilosophy`, `coreValues` |
| Decision | Implemented; keep source-backed |

Notes:

- `/about/mission-vision` is now a real public page instead of a redirect.
- The former `about-mission-vission` folder typo has been corrected to `about-mission-vision`.
- Keep mission, vision, philosophy, and values sourced from `about-data.ts`.

### `designs/about-leadership`

| Field | Value |
| --- | --- |
| Intended route | `/about/leadership` |
| Frontend status | Canonical standalone leadership page; `/about/leadership/[slug]` remains canonical for profiles |
| Canonical design target | Yes |
| Desktop asset | `about-leadership-desktop-final.png` - `1536 x 5261` |
| Mobile asset | `about-leadership-mobile-final.png` - `390 x 12569` |
| Source of truth | `frontend/apps/web/src/app/about/leadership/page.tsx`, `frontend/apps/web/src/app/about/leadership/[slug]/page.tsx`, `LeaderCard`, `getLeadershipData`, `about-data.ts` |
| Decision | Implemented; keep source-backed |

Notes:

- `/about/leadership` is now a real public page instead of a redirect.
- Use this page for executive leadership records, while `/about/governance` remains the governance body page and `/about/governance-leadership` remains available as a combined context page.
- Final assets are verified browser captures of the implemented frontend shell.
- Detail profile pages remain valid and may need separate design coverage later.

### `designs/about-governance`

| Field | Value |
| --- | --- |
| Intended route | `/about/governance` |
| Frontend status | Canonical governance page; `/about/governance/[slug]` remains canonical for board details |
| Canonical design target | Yes |
| Desktop asset | `about-governance-desktop-final.png` - `1536 x 1024` |
| Mobile asset | `about-governance-mobile-final.png` - `789 x 1994` |
| Source of truth | `frontend/apps/web/src/app/about/governance/page.tsx`, `frontend/apps/web/src/app/about/governance/[slug]/page.tsx`, `BoardMemberGrid`, `getGovernanceData`, `about-data.ts` |
| Decision | Implemented; keep source-backed |

Notes:

- `/about/governance` is now a real public page instead of a redirect.
- Use the page for governance bodies and board overview, while `/about/governance-leadership` remains available as a combined governance and leadership page.
- Board detail pages remain canonical under `/about/governance/[slug]`.

### `designs/about-quality-assurance`

| Field | Value |
| --- | --- |
| Intended route | `/about/quality-assurance` |
| Frontend status | Canonical quality assurance page |
| Canonical design target | Yes |
| Desktop asset | `about-quality-assurance-desktop-final.png` - `1536 x 5389` |
| Mobile asset | `about-quality-assurance-mobile-final.png` - `390 x 13579` |
| Source of truth | `frontend/apps/web/src/app/about/quality-assurance/page.tsx`, `frontend/apps/web/src/lib/about-data.ts`, `accreditations`, `strategicPlanHighlights`, `strategicDocuments`, `serviceCharterUrl` |
| Decision | Implemented; keep source-backed |

Notes:

- `/about/quality-assurance` is now a real public page instead of a redirect.
- Use the page as a public informational reference for quality, standards, and service accountability.
- Avoid unsupported ISO, live audit score, ranking, credential, dashboard, and certificate-download claims.
- Final assets are verified browser captures of the implemented frontend shell.

## Gaps

Canonical frontend pages without dedicated final design folders:

- `/about/governance-leadership`
- `/about/university-management`
- `/about/administrative-division`
- `/about/service-charter`
- `/about/governance/[slug]`
- `/about/leadership/[slug]`

The existing `about-leadership` and `about-governance` folders now track standalone canonical routes. A dedicated `about-governance-leadership` design is still useful for the combined context page.

## Immediate Correction Queue

1. Regenerate `landing-page-desktop-final.png` as a true desktop asset.
2. Continue moving restored standalone About routes out of redirect-only status only when implementation is updated first.
3. Create `designs/about-governance-leadership/` for the combined governance and leadership route if that page remains in the public navigation.
4. Continue revising restored standalone About routes against the visual contract.
5. Continue implementing canonical About pages with source-backed content and full-width public sections.

## Full Public Website Design Scope

This section expands the manifest beyond the current design folders. It combines:

- implemented canonical frontend routes in `frontend/apps/web`;
- redirect-only frontend routes that should stay deferred unless route architecture changes;
- planned public website routes from `docs/prompts/sections/*.md`.

The formerly planned public section routes now have canonical frontend coverage through `PublicSectionPage` and source-bounded route data in `frontend/apps/web/src/lib/public-page-data.ts`.

### Current Production Redesign Queue

These are the immediate production-oriented design tasks.

| Priority | Route | Design folder | Current state | Required action |
| ---: | --- | --- | --- | --- |
| 1 | `/` | `designs/landing-page` | Existing design, desktop asset is portrait-shaped | Regenerate/revise desktop and mobile against the frontend visual contract |
| 2 | `/about` | `designs/about-overview` | Existing design, needs frontend-shell reconciliation | Reconcile with actual `/about` implementation and `PageShell` |
| 3 | `/about/governance-leadership` | `designs/about-governance-leadership` | No dedicated folder; standalone governance and leadership designs now exist separately | Create a dedicated combined design |
| 4 | `/about/university-management` | `designs/about-university-management` | No dedicated design | Create desktop and mobile final assets |
| 5 | `/about/administrative-division` | `designs/about-administrative-division` | No dedicated design | Create desktop and mobile final assets |
| 6 | `/about/service-charter` | `designs/about-service-charter` | No dedicated design | Create desktop and mobile final assets |
| 7 | `/about/governance/[slug]` | `designs/about-governance-detail` | No dedicated design | Create reusable board detail design |
| 8 | `/about/leadership/[slug]` | `designs/about-leadership-profile` | No dedicated design | Create reusable leader profile design |

### Redirected About Routes

These routes have frontend files, but currently redirect. Do not treat them as production final design targets unless the frontend route architecture changes.

| Route | Redirects to | Existing design folder | Current decision |
| --- | --- | --- | --- |
| `/about/overview` | `/about` | `designs/about-overview` | Alias into `/about` |
| `/about/strategic-plan` | `/about` | none | Deferred; design only if route is restored |

### Implemented Administration Screens

Source: `docs/prompts/sections/03_ADMINISTRATION.md`

| Route | Design folder | Status |
| --- | --- | --- |
| `/administration` | `designs/administration` | Canonical; implemented via `frontend/apps/web/src/app/administration/[[...segments]]/page.tsx` |
| `/administration/divisions` | `designs/administration-divisions` | Canonical; implemented via shared administration route data |
| `/administration/divisions/[slug]` | `designs/administration-division-detail` | Canonical; implemented as source-bounded division detail state |
| `/administration/units` | `designs/administration-units` | Canonical; implemented via shared administration route data |
| `/administration/units/[slug]` | `designs/administration-unit-detail` | Canonical; implemented as source-bounded unit detail state |
| `/administration/units/[slug]/staff` | `designs/administration-unit-staff` | Canonical; implemented as source-bounded staff state |
| `/administration/units/[slug]/services` | `designs/administration-unit-services` | Canonical; implemented as source-bounded services state |
| `/administration/units/[slug]/documents` | `designs/administration-unit-documents` | Canonical; implemented as source-bounded documents state |
| `/administration/directorates` | `designs/administration-directorates` | Canonical; implemented via shared administration route data |
| `/administration/directorates/[slug]` | `designs/administration-directorate-detail` | Canonical; implemented as source-bounded directorate detail state |
| `/administration/organization` | `designs/administration-organization` | Canonical; implemented as public organization structure page |

### Implemented Admissions Screens

Source: `docs/prompts/sections/04_ADMISSIONS.md`

| Route | Design folder | Status |
| --- | --- | --- |
| `/admissions` | `designs/admissions` | Canonical; implemented via `frontend/apps/web/src/app/admissions/[[...segments]]/page.tsx` |
| `/admissions/undergraduate` | `designs/admissions-undergraduate` | Canonical; implemented as undergraduate admissions guidance |
| `/admissions/postgraduate` | `designs/admissions-postgraduate` | Canonical; implemented as postgraduate admissions guidance |
| `/admissions/international` | `designs/admissions-international` | Canonical; implemented as international applicant guidance |
| `/admissions/requirements` | `designs/admissions-requirements` | Canonical; implemented as source-bounded requirements page |
| `/admissions/fees` | `designs/admissions-fees` | Canonical; implemented as source-bounded fee records page |
| `/admissions/scholarships` | `designs/admissions-scholarships` | Canonical; implemented as support and scholarship reference page |
| `/admissions/how-to-apply` | `designs/admissions-how-to-apply` | Canonical; implemented as application guidance page |
| `/admissions/intakes` | `designs/admissions-intakes` | Canonical; implemented as intake records page |
| `/admissions/intakes/[id]` | `designs/admissions-intake-detail` | Canonical; implemented as source-bounded intake detail state |

### Implemented Academics Screens

Source: `docs/prompts/sections/05_ACADEMICS.md`

| Route | Design folder | Status |
| --- | --- | --- |
| `/academics` | `designs/academics` | Canonical; implemented via `frontend/apps/web/src/app/academics/[[...segments]]/page.tsx` |
| `/academics/schools` | `designs/academics-schools` | Canonical; implemented as schools listing page |
| `/academics/schools/[slug]` | `designs/academics-school-detail` | Canonical; implemented as source-bounded school mini-site state |
| `/academics/schools/[slug]/departments` | `designs/academics-school-departments` | Canonical; implemented as school departments state |
| `/academics/schools/[slug]/departments/[dept-slug]` | `designs/academics-department-detail` | Canonical; implemented as department detail state |
| `/academics/schools/[slug]/departments/[dept-slug]/programmes` | `designs/academics-department-programmes` | Canonical; implemented as department programmes state |
| `/academics/schools/[slug]/departments/[dept-slug]/staff` | `designs/academics-department-staff` | Canonical; implemented as department staff state |
| `/academics/schools/[slug]/departments/[dept-slug]/publications` | `designs/academics-department-publications` | Canonical; implemented as department publications state |
| `/academics/schools/[slug]/programmes` | `designs/academics-school-programmes` | Canonical; implemented as school programmes state |
| `/academics/schools/[slug]/staff` | `designs/academics-school-staff` | Canonical; implemented as school staff state |
| `/academics/schools/[slug]/publications` | `designs/academics-school-publications` | Canonical; implemented as school publications state |
| `/academics/schools/[slug]/clubs` | `designs/academics-school-clubs` | Canonical; implemented as school clubs state |
| `/academics/schools/[slug]/documents` | `designs/academics-school-documents` | Canonical; implemented as school documents state |
| `/academics/programmes` | `designs/academics-programmes` | Canonical; implemented as programme discovery page |
| `/academics/programmes/[slug]` | `designs/academics-programme-detail` | Canonical; implemented as source-bounded programme detail state |
| `/academics/calendar` | `designs/academics-calendar` | Canonical; implemented as academic calendar reference page |

### Implemented Campus Life Screens

Source: `docs/prompts/sections/06_CAMPUS_LIFE.md`

| Route | Design folder | Status |
| --- | --- | --- |
| `/campus-life` | `designs/campus-life` | Canonical; implemented via `frontend/apps/web/src/app/campus-life/[[...segments]]/page.tsx` |
| `/campus-life/student-life` | `designs/campus-life-student-life` | Canonical; implemented as student life page |
| `/campus-life/clubs` | `designs/campus-life-clubs` | Canonical; implemented as clubs and societies page |
| `/campus-life/clubs/[slug]` | `designs/campus-life-club-detail` | Canonical; implemented as source-bounded club detail state |
| `/campus-life/sports` | `designs/campus-life-sports` | Canonical; implemented as sports and recreation page |
| `/campus-life/sports/[slug]` | `designs/campus-life-sport-detail` | Canonical; implemented as source-bounded sport detail state |
| `/campus-life/accommodation` | `designs/campus-life-accommodation` | Canonical; implemented as accommodation guidance page |
| `/campus-life/support` | `designs/campus-life-support` | Canonical; implemented as student support page |
| `/campus-life/support/counseling` | `designs/campus-life-support-counseling` | Canonical; implemented as counseling support page |
| `/campus-life/support/health` | `designs/campus-life-support-health` | Canonical; implemented as health support page |
| `/campus-life/support/disability` | `designs/campus-life-support-disability` | Canonical; implemented as disability support page |
| `/campus-life/gallery` | `designs/campus-life-gallery` | Canonical; implemented as gallery landing page |
| `/campus-life/gallery/photos` | `designs/campus-life-gallery-photos` | Canonical; implemented as photo gallery page |
| `/campus-life/gallery/photos/[album]` | `designs/campus-life-gallery-album` | Canonical; implemented as source-bounded album detail state |
| `/campus-life/gallery/videos` | `designs/campus-life-gallery-videos` | Canonical; implemented as video gallery page |

### Implemented News And Events Screens

Source: `docs/prompts/sections/07_NEWS.md`

| Route | Design folder | Status |
| --- | --- | --- |
| `/news` | `designs/news` | Canonical; implemented via `frontend/apps/web/src/app/news/[[...segments]]/page.tsx` |
| `/news/[slug]` | `designs/news-article` | Canonical; implemented as source-bounded article detail state |
| `/news/category/[category]` | `designs/news-category` | Canonical; implemented as category-filter public state |
| `/events` | `designs/events` | Canonical; implemented via `frontend/apps/web/src/app/events/[[...segments]]/page.tsx` |
| `/events/[slug]` | `designs/event-detail` | Canonical; implemented as source-bounded event detail state |
| `/announcements` | `designs/announcements` | Canonical; implemented via `frontend/apps/web/src/app/announcements/page.tsx` |

## Batch Counts

| Category | Count |
| --- | ---: |
| Existing design folders with final PNG assets | 7 |
| Current production redesign tasks | 8 |
| Redirected/deferred About routes | 2 |
| Implemented Administration screens | 11 |
| Implemented Admissions screens | 10 |
| Implemented Academics screens | 16 |
| Implemented Campus Life screens | 15 |
| Implemented News and Events screens | 6 |
| Implemented formerly planned public screens total | 58 |
| Planned exploratory screens total | 0 |

## Batch Production Status

1. Homepage, About overview, and canonical About support/detail pages are implemented in the public frontend.
2. Administration, Admissions, Academics, Campus Life, News, Events, and Announcements now have canonical route coverage through shared public section pages.
3. `/about/overview` and `/about/strategic-plan` remain redirect/deferred route truths until the frontend route architecture changes.
4. Dynamic detail pages are source-bounded: real records should replace placeholder/fallback states as APIs publish canonical data.
