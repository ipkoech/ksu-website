# Designs Manifest

## Purpose

This manifest classifies every design folder under `designs/` against the current frontend implementation. It is the first checkpoint before regenerating, revising, or implementing public website designs.

Use this with `designs/_system/frontend-visual-contract.md`.

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
| `/about/history` | `frontend/apps/web/src/app/about/history/page.tsx` | Redirects to `/about` |
| `/about/mission-vision` | `frontend/apps/web/src/app/about/mission-vision/page.tsx` | Redirects to `/about` |
| `/about/governance` | `frontend/apps/web/src/app/about/governance/page.tsx` | Redirects to `/about/governance-leadership` |
| `/about/leadership` | `frontend/apps/web/src/app/about/leadership/page.tsx` | Redirects to `/about/governance-leadership` |
| `/about/governance-leadership` | `frontend/apps/web/src/app/about/governance-leadership/page.tsx` | Canonical combined governance and leadership page |
| `/about/governance/[slug]` | `frontend/apps/web/src/app/about/governance/[slug]/page.tsx` | Canonical board detail page |
| `/about/leadership/[slug]` | `frontend/apps/web/src/app/about/leadership/[slug]/page.tsx` | Canonical leader profile page |
| `/about/university-management` | `frontend/apps/web/src/app/about/university-management/page.tsx` | Canonical management page |
| `/about/administrative-division` | `frontend/apps/web/src/app/about/administrative-division/page.tsx` | Canonical administrative page |
| `/about/service-charter` | `frontend/apps/web/src/app/about/service-charter/page.tsx` | Canonical access page |
| `/about/quality-assurance` | `frontend/apps/web/src/app/about/quality-assurance/page.tsx` | Redirects to `/about` |
| `/about/strategic-plan` | `frontend/apps/web/src/app/about/strategic-plan/page.tsx` | Redirects to `/about` |

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
| Source of truth | `frontend/apps/web/src/app/about/page.tsx`, `AboutUsSection`, `about-data.ts` |
| Decision | Keep, but reconcile |

Notes:

- Treat this as the About overview design, not a standalone `/about/overview` route.
- Reconcile header, footer, side navigation, and component mapping with `PageShell` and the current `/about` implementation.
- Avoid duplicating facts already rendered by `AboutUsSection` unless the frontend page is intentionally simplified.

### `designs/about-history`

| Field | Value |
| --- | --- |
| Intended route | `/about/history` |
| Frontend status | Redirected to `/about` |
| Canonical design target | No |
| Desktop asset | `about-history-desktop-final.png` - `1536 x 1024` |
| Mobile asset | `about-history-mobile-final.png` - `862 x 1824` |
| Source of truth | `frontend/apps/web/src/lib/about-data.ts`, `Timeline`, redirect page |
| Decision | Deferred |

Notes:

- Keep as exploratory until the About architecture is changed.
- If standalone history is restored, use `historyTimeline` and the existing `Timeline` component family.
- If standalone history is not restored, fold the best timeline ideas into `/about`.

### `designs/about-mission-vision`

| Field | Value |
| --- | --- |
| Intended route | `/about/mission-vision` |
| Frontend status | Redirected to `/about` |
| Canonical design target | No |
| Desktop asset | `about-mission-vission-desktop-final.png` - `1536 x 1024` |
| Mobile asset | `about-mission-vission-mobile-final.png` - `864 x 1821` |
| Source of truth | `frontend/apps/web/src/lib/about-data.ts`, redirect page |
| Decision | Deferred; folder name needs correction if route is restored |

Notes:

- The folder name contains a typo: `vission`.
- If this becomes a canonical standalone page, rename the folder to `about-mission-vision` and update asset names.
- If not, fold mission, vision, philosophy, and core values into `/about`.

### `designs/about-leadership`

| Field | Value |
| --- | --- |
| Intended route | `/about/leadership` |
| Frontend status | Redirected to `/about/governance-leadership`; `/about/leadership/[slug]` is canonical for profiles |
| Canonical design target | No for listing; yes as input to combined page |
| Desktop asset | `about-leadership-desktop-final.png` - `1536 x 1024` |
| Mobile asset | `about-leadership-mobile-final.png` - `864 x 1821` |
| Source of truth | `frontend/apps/web/src/app/about/governance-leadership/page.tsx`, `LeaderCard`, `BoardMemberGrid`, `about-data.ts` |
| Decision | Merge into canonical combined page |

Notes:

- Use this as one candidate for the canonical `/about/governance-leadership` design.
- Do not implement it as a separate `/about/leadership` listing unless the redirect is removed.
- Detail profile pages remain valid and may need separate design coverage later.

### `designs/about-governance`

| Field | Value |
| --- | --- |
| Intended route | `/about/governance` |
| Frontend status | Redirected to `/about/governance-leadership`; `/about/governance/[slug]` is canonical for board details |
| Canonical design target | No for listing; yes as input to combined page |
| Desktop asset | `about-governance-desktop-final.png` - `1536 x 1024` |
| Mobile asset | `about-governance-mobile-final.png` - `789 x 1994` |
| Source of truth | `frontend/apps/web/src/app/about/governance-leadership/page.tsx`, `frontend/apps/web/src/app/about/governance/[slug]/page.tsx`, `BoardMemberGrid`, `about-data.ts` |
| Decision | Merge into canonical combined page |

Notes:

- Use this as the governance half of `/about/governance-leadership`.
- Do not implement a standalone governance listing unless the redirect is removed.
- Board detail pages may still need their own visual design.

### `designs/about-quality-assurance`

| Field | Value |
| --- | --- |
| Intended route | `/about/quality-assurance` |
| Frontend status | Redirected to `/about` |
| Canonical design target | No |
| Desktop asset | `about-quality-assurance-desktop-final.png` - `1370 x 1148` |
| Mobile asset | `about-quality-assurance-mobile-final.png` - `853 x 1844` |
| Source of truth | `frontend/apps/web/src/lib/about-data.ts`, redirect page |
| Decision | Deferred |

Notes:

- The page concept is feasible, but the route is not currently canonical.
- If restored, use a document/reference page template and avoid unsupported ISO, live audit, ranking, or certificate-download claims.
- The desktop asset size is nonstandard and should be regenerated if the route becomes canonical.

## Gaps

Canonical frontend pages without dedicated final design folders:

- `/about/governance-leadership`
- `/about/university-management`
- `/about/administrative-division`
- `/about/service-charter`
- `/about/governance/[slug]`
- `/about/leadership/[slug]`

The existing `about-leadership` and `about-governance` folders should be consolidated into a single canonical `about-governance-leadership` design if the current frontend route architecture remains.

## Immediate Correction Queue

1. Regenerate `landing-page-desktop-final.png` as a true desktop asset.
2. Decide whether About remains consolidated or standalone pages are restored.
3. If About remains consolidated, create `designs/about-governance-leadership/` and move the best governance and leadership concepts there.
4. If standalone About routes are restored, update frontend routes first, then revise the deferred designs against the visual contract.
5. Rename `about-mission-vission` only after the route decision, to avoid creating churn around a deferred folder.

## Full Public Website Design Scope

This section expands the manifest beyond the current design folders. It combines:

- implemented canonical frontend routes in `frontend/apps/web`;
- redirect-only frontend routes that should stay deferred unless route architecture changes;
- planned public website routes from `docs/prompts/sections/*.md`.

The planned routes are approved design targets only as **prompt-guided exploratory public screens** until the frontend routes exist.

### Current Production Redesign Queue

These are the immediate production-oriented design tasks.

| Priority | Route | Design folder | Current state | Required action |
| ---: | --- | --- | --- | --- |
| 1 | `/` | `designs/landing-page` | Existing design, desktop asset is portrait-shaped | Regenerate/revise desktop and mobile against the frontend visual contract |
| 2 | `/about` | `designs/about-overview` | Existing design, needs frontend-shell reconciliation | Reconcile with actual `/about` implementation and `PageShell` |
| 3 | `/about/governance-leadership` | `designs/about-governance-leadership` | No dedicated folder; partial concepts exist in `about-governance` and `about-leadership` | Create a dedicated combined design |
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
| `/about/history` | `/about` | `designs/about-history` | Deferred/exploratory |
| `/about/mission-vision` | `/about` | `designs/about-mission-vission` | Deferred/exploratory; folder typo remains |
| `/about/governance` | `/about/governance-leadership` | `designs/about-governance` | Merge into combined page |
| `/about/leadership` | `/about/governance-leadership` | `designs/about-leadership` | Merge into combined page |
| `/about/quality-assurance` | `/about` | `designs/about-quality-assurance` | Deferred/exploratory |
| `/about/strategic-plan` | `/about` | none | Deferred; design only if route is restored |

### Planned Administration Screens

Source: `docs/prompts/sections/03_ADMINISTRATION.md`

| Route | Design folder | Status |
| --- | --- | --- |
| `/administration` | `designs/administration` | Planned exploratory; not implemented in web frontend |
| `/administration/divisions` | `designs/administration-divisions` | Planned exploratory; not implemented |
| `/administration/divisions/[slug]` | `designs/administration-division-detail` | Planned exploratory; not implemented |
| `/administration/units` | `designs/administration-units` | Planned exploratory; not implemented |
| `/administration/units/[slug]` | `designs/administration-unit-detail` | Planned exploratory; not implemented |
| `/administration/units/[slug]/staff` | `designs/administration-unit-staff` | Planned exploratory; not implemented |
| `/administration/units/[slug]/services` | `designs/administration-unit-services` | Planned exploratory; not implemented |
| `/administration/units/[slug]/documents` | `designs/administration-unit-documents` | Planned exploratory; not implemented |
| `/administration/directorates` | `designs/administration-directorates` | Planned exploratory; not implemented |
| `/administration/directorates/[slug]` | `designs/administration-directorate-detail` | Planned exploratory; not implemented |
| `/administration/organization` | `designs/administration-organization` | Planned exploratory; not implemented |

### Planned Admissions Screens

Source: `docs/prompts/sections/04_ADMISSIONS.md`

| Route | Design folder | Status |
| --- | --- | --- |
| `/admissions` | `designs/admissions` | Planned exploratory; not implemented |
| `/admissions/undergraduate` | `designs/admissions-undergraduate` | Planned exploratory; not implemented |
| `/admissions/postgraduate` | `designs/admissions-postgraduate` | Planned exploratory; not implemented |
| `/admissions/international` | `designs/admissions-international` | Planned exploratory; not implemented |
| `/admissions/requirements` | `designs/admissions-requirements` | Planned exploratory; not implemented |
| `/admissions/fees` | `designs/admissions-fees` | Planned exploratory; not implemented |
| `/admissions/scholarships` | `designs/admissions-scholarships` | Planned exploratory; not implemented |
| `/admissions/how-to-apply` | `designs/admissions-how-to-apply` | Planned exploratory; not implemented |
| `/admissions/intakes` | `designs/admissions-intakes` | Planned exploratory; not implemented |
| `/admissions/intakes/[id]` | `designs/admissions-intake-detail` | Planned exploratory; not implemented |

### Planned Academics Screens

Source: `docs/prompts/sections/05_ACADEMICS.md`

| Route | Design folder | Status |
| --- | --- | --- |
| `/academics` | `designs/academics` | Planned exploratory; not implemented |
| `/academics/schools` | `designs/academics-schools` | Planned exploratory; not implemented |
| `/academics/schools/[slug]` | `designs/academics-school-detail` | Planned exploratory; not implemented |
| `/academics/schools/[slug]/departments` | `designs/academics-school-departments` | Planned exploratory; not implemented |
| `/academics/schools/[slug]/departments/[dept-slug]` | `designs/academics-department-detail` | Planned exploratory; not implemented |
| `/academics/schools/[slug]/departments/[dept-slug]/programmes` | `designs/academics-department-programmes` | Planned exploratory; not implemented |
| `/academics/schools/[slug]/departments/[dept-slug]/staff` | `designs/academics-department-staff` | Planned exploratory; not implemented |
| `/academics/schools/[slug]/departments/[dept-slug]/publications` | `designs/academics-department-publications` | Planned exploratory; not implemented |
| `/academics/schools/[slug]/programmes` | `designs/academics-school-programmes` | Planned exploratory; not implemented |
| `/academics/schools/[slug]/staff` | `designs/academics-school-staff` | Planned exploratory; not implemented |
| `/academics/schools/[slug]/publications` | `designs/academics-school-publications` | Planned exploratory; not implemented |
| `/academics/schools/[slug]/clubs` | `designs/academics-school-clubs` | Planned exploratory; not implemented |
| `/academics/schools/[slug]/documents` | `designs/academics-school-documents` | Planned exploratory; not implemented |
| `/academics/programmes` | `designs/academics-programmes` | Planned exploratory; not implemented |
| `/academics/programmes/[slug]` | `designs/academics-programme-detail` | Planned exploratory; not implemented |
| `/academics/calendar` | `designs/academics-calendar` | Planned exploratory; not implemented |

### Planned Campus Life Screens

Source: `docs/prompts/sections/06_CAMPUS_LIFE.md`

| Route | Design folder | Status |
| --- | --- | --- |
| `/campus-life` | `designs/campus-life` | Planned exploratory; not implemented |
| `/campus-life/student-life` | `designs/campus-life-student-life` | Planned exploratory; not implemented |
| `/campus-life/clubs` | `designs/campus-life-clubs` | Planned exploratory; not implemented |
| `/campus-life/clubs/[slug]` | `designs/campus-life-club-detail` | Planned exploratory; not implemented |
| `/campus-life/sports` | `designs/campus-life-sports` | Planned exploratory; not implemented |
| `/campus-life/sports/[slug]` | `designs/campus-life-sport-detail` | Planned exploratory; not implemented |
| `/campus-life/accommodation` | `designs/campus-life-accommodation` | Planned exploratory; not implemented |
| `/campus-life/support` | `designs/campus-life-support` | Planned exploratory; not implemented |
| `/campus-life/support/counseling` | `designs/campus-life-support-counseling` | Planned exploratory; not implemented |
| `/campus-life/support/health` | `designs/campus-life-support-health` | Planned exploratory; not implemented |
| `/campus-life/support/disability` | `designs/campus-life-support-disability` | Planned exploratory; not implemented |
| `/campus-life/gallery` | `designs/campus-life-gallery` | Planned exploratory; not implemented |
| `/campus-life/gallery/photos` | `designs/campus-life-gallery-photos` | Planned exploratory; not implemented |
| `/campus-life/gallery/photos/[album]` | `designs/campus-life-gallery-album` | Planned exploratory; not implemented |
| `/campus-life/gallery/videos` | `designs/campus-life-gallery-videos` | Planned exploratory; not implemented |

### Planned News And Events Screens

Source: `docs/prompts/sections/07_NEWS.md`

| Route | Design folder | Status |
| --- | --- | --- |
| `/news` | `designs/news` | Planned exploratory; not implemented |
| `/news/[slug]` | `designs/news-article` | Planned exploratory; not implemented |
| `/news/category/[category]` | `designs/news-category` | Planned exploratory; not implemented |
| `/events` | `designs/events` | Planned exploratory; not implemented |
| `/events/[slug]` | `designs/event-detail` | Planned exploratory; not implemented |
| `/announcements` | `designs/announcements` | Planned exploratory; not implemented |

## Batch Counts

| Category | Count |
| --- | ---: |
| Existing design folders with final PNG assets | 7 |
| Current production redesign tasks | 8 |
| Redirected/deferred About routes | 7 |
| Planned Administration screens | 11 |
| Planned Admissions screens | 10 |
| Planned Academics screens | 16 |
| Planned Campus Life screens | 15 |
| Planned News and Events screens | 6 |
| Planned exploratory screens total | 58 |
| Active full public design workload, excluding redirected/deferred routes | 66 |

## Batch Production Order

1. Production redesign queue: homepage, About overview, and the six canonical About support/detail pages.
2. Planned Administration screens.
3. Planned Admissions screens.
4. Planned Academics screens.
5. Planned Campus Life screens.
6. Planned News and Events screens.
7. Deferred redirected About pages only after route architecture changes, or only as explicitly marked exploratory concepts.
