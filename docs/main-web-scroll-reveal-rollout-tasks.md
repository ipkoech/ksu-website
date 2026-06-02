# Main Web Scroll Reveal Rollout Tasks

Date: 2026-06-02

Scope: `frontend/apps/web` only. Research, Library, and Admin apps are out of scope for this rollout.

Goal: add restrained scroll reveal motion across the main public web app page by page, using the existing shared `ScrollReveal` primitive from `@ksu/ui/components`.

## Implementation Status

- [x] Shared `ScrollReveal` primitive hardened with reduced-motion support, `rootMargin`, fail-open behavior, smaller motion distance, and wrapper element support.
- [x] Homepage sections wired through shared reveal behavior.
- [x] Generic public section pages wired for section and card-grid reveal coverage.
- [x] Admissions catch-all content sections wired through the local reusable section component.
- [x] Campus Life catch-all content sections wired through the local reusable section component.
- [x] Content listing/detail templates wired for listing grids, detail bodies, structured details, and related content.
- [x] Academic and administration detail templates wired through their main public detail components.
- [x] Standalone About pages wired below their hero/first-viewport sections.
- [x] Search results and public person/staff detail content wired conservatively.
- [x] `pnpm --filter @ksu/web typecheck` passed.
- [x] `pnpm --filter @ksu/web lint` passed with warnings only.
- [x] `pnpm --filter @ksu/web build` passed. Build logged backend fetch warnings because `127.0.0.1:8000` was unavailable, but completed successfully.
- [x] Browser route verification completed against `http://127.0.0.1:3000` for `/`, `/about`, `/admissions`, `/academics`, `/campus-life`, `/news`, `/media`, `/contact`, `/sitemap`, and `/search`.
- [x] Browser smoke confirmed no horizontal overflow, no first-viewport hidden `data-scroll-reveal` wrappers, and reduced-motion content remains visible.

## Rollout Rules

- Animate content sections and repeated content cards, not headers, footers, skip links, loading skeletons, sticky navigation, or form controls.
- Keep above-the-fold content visible immediately unless the page already has intentional hero animation.
- Use one-time reveal by default.
- Respect `prefers-reduced-motion`.
- Avoid layout shift: reveal wrappers must not change section dimensions.
- Use subtle defaults: `fade-up`, short distance, 500-650ms duration, 60-90ms stagger for grids.
- Prefer shared route/content components before editing many page files individually.

## Phase 0: Shared Primitive Hardening

- [ ] Update `frontend/packages/ui/src/components/ui/scroll-reveal.tsx`.
  - [ ] Add reduced-motion detection and render content without hidden initial state when motion is reduced.
  - [ ] Add `rootMargin` prop with a default that reveals content slightly before it reaches the viewport.
  - [ ] Add `as` or wrapper flexibility only if needed by page semantics.
  - [ ] Fail open when `IntersectionObserver` is unavailable.
  - [ ] Keep existing `ScrollReveal` and `ScrollRevealGroup` exports backward compatible.
- [ ] Confirm existing homepage usages still compile.
- [ ] Run `pnpm --filter @ksu/ui typecheck` if available, otherwise use the consuming app typecheck.

## Phase 1: Homepage

- [ ] Route: `/`
- [ ] File: `frontend/apps/web/src/app/page.tsx`
- [ ] Replace the local no-op `LandingReveal` with the shared reveal behavior.
- [ ] Add reveal wrappers to homepage sections:
  - [ ] trust facts row
  - [ ] schools section
  - [ ] programmes/admissions section
  - [ ] latest content section
  - [ ] research section
  - [ ] campus life section
  - [ ] partners section
  - [ ] journey CTA
- [ ] Keep `LandingHero` animation as-is; do not double-wrap hero internals.
- [ ] Verify `/` desktop and mobile.

## Phase 2: About Pages

- [ ] Route: `/about`
- [ ] File: `frontend/apps/web/src/app/about/page.tsx`
- [ ] File: `frontend/apps/web/src/app/about/about-overview-content.tsx`
- [ ] Add reveals to overview content bands and card groups.
- [ ] Verify `/about`.

- [ ] Route: `/about/overview`
- [ ] File: `frontend/apps/web/src/app/about/overview/page.tsx`
- [ ] Reuse the same reveal approach as `/about`.
- [ ] Verify `/about/overview`.

- [ ] Route: `/about/history`
- [ ] File: `frontend/apps/web/src/app/about/history/page.tsx`
- [ ] Add reveals to timeline/content sections.
- [ ] Verify `/about/history`.

- [ ] Route: `/about/mission-vision`
- [ ] File: `frontend/apps/web/src/app/about/mission-vision/page.tsx`
- [ ] Add reveals to mission, vision, values, and card groups.
- [ ] Verify `/about/mission-vision`.

- [ ] Route: `/about/governance`
- [ ] File: `frontend/apps/web/src/app/about/governance/page.tsx`
- [ ] Add reveals to governance sections and repeated governance cards.
- [ ] Verify `/about/governance`.

- [ ] Route: `/about/governance/[slug]`
- [ ] File: `frontend/apps/web/src/app/about/governance/[slug]/page.tsx`
- [ ] Add reveals to detail sections below the hero/breadcrumb area.
- [ ] Verify one governance detail route.

- [ ] Route: `/about/university-management`
- [ ] File: `frontend/apps/web/src/app/about/university-management/page.tsx`
- [ ] Add reveals to leadership sections and people/card grids.
- [ ] Verify `/about/university-management`.

- [ ] Route: `/about/university-management/[slug]`
- [ ] File: `frontend/apps/web/src/app/about/university-management/[slug]/page.tsx`
- [ ] Add reveals to detail content and related links.
- [ ] Verify one management detail route.

- [ ] Route: `/about/quality-assurance`
- [ ] File: `frontend/apps/web/src/app/about/quality-assurance/page.tsx`
- [ ] Add reveals to quality-assurance content sections and cards.
- [ ] Verify `/about/quality-assurance`.

- [ ] Route: `/about/strategic-plan`
- [ ] File: `frontend/apps/web/src/app/about/strategic-plan/page.tsx`
- [ ] Add reveals to strategic-plan sections.
- [ ] Verify `/about/strategic-plan`.

- [ ] Route: `/about/service-charter`
- [ ] File: `frontend/apps/web/src/app/about/service-charter/page.tsx`
- [ ] Add reveals to service-charter sections.
- [ ] Verify `/about/service-charter`.

## Phase 3: Administration

- [ ] Route group: `/administration`, `/administration/organization`, and nested segments served by catch-all route.
- [ ] File: `frontend/apps/web/src/app/administration/[[...segments]]/page.tsx`
- [ ] Add reveals to route section layouts and repeated organization cards.
- [ ] Verify:
  - [ ] `/administration`
  - [ ] `/administration/organization`

## Phase 4: Admissions

- [ ] Route group: `/admissions` and all admissions subroutes served by catch-all route.
- [ ] File: `frontend/apps/web/src/app/admissions/[[...segments]]/page.tsx`
- [ ] File: `frontend/apps/web/src/app/admissions/[[...segments]]/admissions-content.tsx`
- [ ] Add reveals to applicant task panels, requirement sections, fee/intake sections, and repeated cards.
- [ ] Verify:
  - [ ] `/admissions`
  - [ ] `/admissions/undergraduate`
  - [ ] `/admissions/postgraduate`
  - [ ] `/admissions/international`
  - [ ] `/admissions/requirements`
  - [ ] `/admissions/fees`
  - [ ] `/admissions/how-to-apply`

## Phase 5: Academics

- [ ] Route group: `/academics` and all academics subroutes served by catch-all route.
- [ ] File: `frontend/apps/web/src/app/academics/[[...segments]]/page.tsx`
- [ ] Add reveals to overview sections, schools/programmes grids, academic calendar panels, and detail-page sections.
- [ ] Verify:
  - [ ] `/academics`
  - [ ] `/academics/schools`
  - [ ] `/academics/programmes`
  - [ ] `/academics/calendar`
  - [ ] `/academics/examinations`
  - [ ] one school detail route
  - [ ] one programme detail route

## Phase 6: Campus Life

- [ ] Route group: `/campus-life` and all campus-life subroutes served by catch-all route.
- [ ] File: `frontend/apps/web/src/app/campus-life/[[...segments]]/page.tsx`
- [ ] File: `frontend/apps/web/src/app/campus-life/[[...segments]]/campus-life-content.tsx`
- [ ] Add reveals to overview cards, lifestyle sections, support sections, and image/content groups.
- [ ] Verify:
  - [ ] `/campus-life`
  - [ ] `/campus-life/student-life`
  - [ ] `/campus-life/clubs`
  - [ ] `/campus-life/sports`
  - [ ] `/campus-life/accommodation`
  - [ ] `/campus-life/support`

## Phase 7: News, Events, Announcements, Blogs, Media

- [ ] Route group: `/news` and news detail routes.
- [ ] File: `frontend/apps/web/src/app/news/[[...segments]]/page.tsx`
- [ ] Add reveals to listing grids, detail body sections, and related content.
- [ ] Verify `/news` and one news detail route.

- [ ] Route group: `/events` and event detail routes.
- [ ] File: `frontend/apps/web/src/app/events/[[...segments]]/page.tsx`
- [ ] Add reveals to event listing cards and detail sections.
- [ ] Verify `/events` and one event detail route.

- [ ] Route: `/announcements`
- [ ] File: `frontend/apps/web/src/app/announcements/page.tsx`
- [ ] Add reveals to announcement listing groups.
- [ ] Verify `/announcements`.

- [ ] Route: `/announcements/[slug]`
- [ ] File: `frontend/apps/web/src/app/announcements/[slug]/page.tsx`
- [ ] Add reveals to detail body and related navigation.
- [ ] Verify one announcement detail route.

- [ ] Route: `/announcements/category/[slug]`
- [ ] File: `frontend/apps/web/src/app/announcements/category/[slug]/page.tsx`
- [ ] Add reveals to category listing cards.
- [ ] Verify one announcement category route.

- [ ] Route group: `/blogs` and blog detail routes.
- [ ] File: `frontend/apps/web/src/app/blogs/[[...segments]]/page.tsx`
- [ ] Add reveals to blog listing cards and detail content.
- [ ] Verify `/blogs` and one blog detail route.

- [ ] Route group: `/media` and media detail/category routes.
- [ ] File: `frontend/apps/web/src/app/media/[[...segments]]/page.tsx`
- [ ] Add reveals to media grids and detail sections.
- [ ] Verify `/media` and one nested media route.

## Phase 8: Utility and Service Pages

- [ ] Route: `/contact`
- [ ] File: `frontend/apps/web/src/app/contact/page.tsx`
- [ ] Add reveals to contact sections, directory blocks, and location/service panels.
- [ ] Verify `/contact`.

- [ ] Route: `/downloads`
- [ ] File: `frontend/apps/web/src/app/downloads/page.tsx`
- [ ] Add reveals to download groups and list sections.
- [ ] Verify `/downloads`.

- [ ] Route: `/faq`
- [ ] File: `frontend/apps/web/src/app/faq/page.tsx`
- [ ] Add reveals to FAQ category sections without animating the open/close interaction itself.
- [ ] Verify `/faq`.

- [ ] Route: `/careers`
- [ ] File: `frontend/apps/web/src/app/careers/page.tsx`
- [ ] Add reveals to job/listing groups and CTA sections.
- [ ] Verify `/careers`.

- [ ] Route: `/tenders`
- [ ] File: `frontend/apps/web/src/app/tenders/page.tsx`
- [ ] Add reveals to tender/listing groups and CTA sections.
- [ ] Verify `/tenders`.

- [ ] Route: `/visitors`
- [ ] File: `frontend/apps/web/src/app/visitors/page.tsx`
- [ ] Add reveals to visitor guide sections and cards.
- [ ] Verify `/visitors`.

- [ ] Route: `/sitemap`
- [ ] File: `frontend/apps/web/src/app/sitemap/page.tsx`
- [ ] Add reveals to sitemap groups with conservative stagger.
- [ ] Verify `/sitemap`.

- [ ] Route: `/search`
- [ ] File: `frontend/apps/web/src/app/search/page.tsx`
- [ ] Add reveals only to static shell/results containers; do not animate typing or input controls.
- [ ] Verify `/search`.

- [ ] Route: `/az-index`
- [ ] File: `frontend/apps/web/src/app/az-index/page.tsx`
- [ ] Add reveals to alphabetized link groups.
- [ ] Verify `/az-index`.

- [ ] Route: `/accessibility`
- [ ] File: `frontend/apps/web/src/app/accessibility/page.tsx`
- [ ] Add reveals to policy/content sections.
- [ ] Verify `/accessibility`.

- [ ] Route: `/privacy`
- [ ] File: `frontend/apps/web/src/app/privacy/page.tsx`
- [ ] Add reveals to policy/content sections.
- [ ] Verify `/privacy`.

- [ ] Route: `/data-privacy`
- [ ] File: `frontend/apps/web/src/app/data-privacy/page.tsx`
- [ ] Add reveals to policy/content sections.
- [ ] Verify `/data-privacy`.

- [ ] Route: `/terms`
- [ ] File: `frontend/apps/web/src/app/terms/page.tsx`
- [ ] Add reveals to policy/content sections.
- [ ] Verify `/terms`.

- [ ] Route: `/help-desk`
- [ ] File: `frontend/apps/web/src/app/help-desk/page.tsx`
- [ ] Add reveals to support panels and contact routes.
- [ ] Verify `/help-desk`.

- [ ] Route: `/alumni`
- [ ] File: `frontend/apps/web/src/app/alumni/page.tsx`
- [ ] Add reveals to alumni sections and cards.
- [ ] Verify `/alumni`.

- [ ] Route: `/conferences`
- [ ] File: `frontend/apps/web/src/app/conferences/page.tsx`
- [ ] Add reveals to conference sections and cards.
- [ ] Verify `/conferences`.

- [ ] Route: `/m/staff`
- [ ] File: `frontend/apps/web/src/app/m/staff/page.tsx`
- [ ] Add reveals only if this page is public-facing and not a compact staff tool.
- [ ] Verify `/m/staff`.

## Phase 9: People and Staff Detail Pages

- [ ] Route: `/people/[personId]`
- [ ] File: `frontend/apps/web/src/app/people/[personId]/page.tsx`
- [ ] Add reveals to profile detail sections and related records.
- [ ] Verify one person route.

- [ ] Route: `/staff/[personId]`
- [ ] File: `frontend/apps/web/src/app/staff/[personId]/page.tsx`
- [ ] Add reveals to profile detail sections and related records.
- [ ] Verify one staff route.

## Phase 10: Final Verification

- [ ] Run `pnpm --filter @ksu/web typecheck`.
- [ ] Run `pnpm --filter @ksu/web lint`.
- [ ] Run `pnpm --filter @ksu/web build`.
- [x] Browser-check representative desktop and mobile routes:
  - [x] `/`
  - [x] `/about`
  - [x] `/admissions`
  - [x] `/academics`
  - [x] `/campus-life`
  - [x] `/news`
  - [x] `/media`
  - [x] `/contact`
  - [x] `/sitemap`
- [x] Browser-check reduced-motion behavior.
- [x] Confirm no route starts with main content hidden below a failed observer.
- [x] Confirm no horizontal overflow from reveal translations on mobile.
- [x] Confirm cards do not jump or resize during reveal.
