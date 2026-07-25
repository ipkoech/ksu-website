# Public About Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the six public About routes as a cohesive, backend-driven museum-style experience matching the approved Kisii University designs.

**Architecture:** Server routes fetch the published About and facts payloads, then pass serializable view data into focused client components only where interaction is required. The shared public header owns the six-link responsive menu; the About page owns the URL-driven history drawer and media interactions. Council and management continue to use governance APIs, while the charter and strategic-plan routes use published university information and documents.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Lucide icons, existing `@ksu/api-client` and public layout components.

## Global Constraints

- Use exactly six About links: About KSU, University Council, University Management, University Service Charter, Strategic Plan, KSU Numbers & Facts.
- Keep the menu width fitted to its contents, constrained to viewport padding, and vertically scrollable when content exceeds the available viewport.
- Open history only after explicit interaction or when `/about?history=open` is requested; redirect `/about/history` to the canonical query URL.
- Use a right drawer on desktop, a wider drawer on tablet, and a bottom sheet on mobile.
- Use backend-published content and facts with graceful visual fallbacks; do not animate factual counters.
- Meet WCAG AA interaction expectations, including focus management, keyboard dismissal, semantic controls, alt text, and reduced-motion behavior.
- Do not add or run tests, per the user's explicit instruction; verify with lint, typecheck, build or route-level manual checks.

---

### Task 1: Public About data contract

**Files:**
- Create: `frontend/apps/web/src/lib/public-about-data.ts`
- Modify: `frontend/apps/web/src/lib/about-data.ts`

**Interfaces:**
- Consumes: `mainApi.get<T>()` and `/api/v1/public/about`, `/api/v1/public/about/facts`.
- Produces: `getPublicAboutData()`, `getPublicFactsData(year?)`, and serializable public About/facts types.

- [ ] Define exact TypeScript shapes for university information, content media, milestones, fact editions, groups, and items.
- [ ] Fetch published payloads with null-safe fallbacks so a temporary API failure does not break the public route.
- [ ] Replace the legacy `aboutNavigation` export with the approved six links.
- [ ] Run the web app typecheck and resolve errors in these files.

### Task 2: Responsive six-link About menu

**Files:**
- Modify: `frontend/packages/ui/src/components/layout/public/public-header.tsx`

**Interfaces:**
- Consumes: the shared `NavItem` dropdown behavior.
- Produces: an About dropdown that fits the longest label, remains viewport-constrained, scrolls vertically, and renders within the mobile accordion.

- [ ] Replace the legacy About children with the exact approved routes and descriptions.
- [ ] Treat About as a compact menu instead of a full-width structured mega-menu.
- [ ] Preserve Escape, Arrow Down, focus, hover, route-close, mobile accordion, and reduced-motion behavior.
- [ ] Run scoped lint and typecheck for the UI package and web app.

### Task 3: About KSU exhibition page

**Files:**
- Create: `frontend/apps/web/src/components/about/public-about-page.tsx`
- Create: `frontend/apps/web/src/components/about/history-drawer.tsx`
- Create: `frontend/apps/web/src/components/about/image-comparison.tsx`
- Modify: `frontend/apps/web/src/app/about/page.tsx`
- Modify: `frontend/apps/web/src/app/about/history/page.tsx`

**Interfaces:**
- Consumes: `PublicAboutData`, search param `history=open`, and local fallback campus imagery.
- Produces: the complete hero, identity, beliefs, values/mandate, transformation, profile, video-dialog, and conditional history experiences.

- [ ] Render the cinematic hero with the approved headline, concise backend introduction, history CTA, and a conditional video CTA.
- [ ] Implement history as an accessible modal drawer/bottom sheet with milestone imagery, expandable descriptions, document action, Escape dismissal, focus restoration, and URL synchronization.
- [ ] Render identity, Mission/Vision/Philosophy, values, mandate, and institutional facts from the published payload without repeating history.
- [ ] Render the keyboard/touch accessible before-and-after comparison only when both images exist, with a tasteful fallback visual section otherwise.
- [ ] Add the KSU Numbers & Facts action at the right end of Institutional Profile.
- [ ] Redirect `/about/history` to `/about?history=open`.
- [ ] Run scoped lint and typecheck.

### Task 4: KSU Numbers & Facts

**Files:**
- Create: `frontend/apps/web/src/app/about/numbers-and-facts/page.tsx`
- Create: `frontend/apps/web/src/components/about/numbers-facts-page.tsx`

**Interfaces:**
- Consumes: `getPublicFactsData(year?)`, its current edition, grouped fact items, and available years.
- Produces: a factual, non-animated, grouped facts page with a URL-based year selector.

- [ ] Build an academic hero that states the reporting year and publication context.
- [ ] Render a year selector linked through `?year=YYYY` and retain a clear current-edition option.
- [ ] Render backend group headings, narrative context, values, units, sources, and notes with empty-state handling.
- [ ] Run scoped lint and typecheck.

### Task 5: Remaining public About routes

**Files:**
- Modify: `frontend/apps/web/src/components/about/UniversityCouncilPage.tsx`
- Modify: `frontend/apps/web/src/app/about/university-management/page.tsx`
- Modify: `frontend/apps/web/src/app/about/service-charter/page.tsx`
- Modify: `frontend/apps/web/src/app/about/strategic-plan/page.tsx`
- Create: `frontend/apps/web/src/components/about/institutional-document-page.tsx`

**Interfaces:**
- Consumes: council page data, management board data, public About university information, strategic priorities, and published documents.
- Produces: four dedicated, visually consistent public routes instead of redirects.

- [ ] Retain the backend-driven council roster while aligning its hero, mandate strip, chairperson, member, and secretary hierarchy with the approved design.
- [ ] Recompose management around a cinematic hero and readable leadership hierarchy using published assignments.
- [ ] Build a dedicated Service Charter route with summary, commitments, and downloadable published resources.
- [ ] Build a dedicated Strategic Plan route with the UniversityInfo summary, priorities, and downloadable published resources.
- [ ] Run scoped lint and typecheck.

### Task 6: Verification and commit

**Files:**
- Verify only the public About and shared header files changed by this plan.

**Interfaces:**
- Consumes: completed implementation and project scripts.
- Produces: a verified, committed public About experience.

- [ ] Inspect `git diff` and exclude all unrelated shared-worktree changes.
- [ ] Run frontend lint and typecheck checks without executing tests.
- [ ] Build the web app when feasible and record any pre-existing unrelated blocker exactly.
- [ ] Manually check the six routes and `about?history=open` against the running application when available.
- [ ] Commit explicit implementation paths with `scripts/commit-changes.sh -m "Build public About experience" --run-checks -- <paths>`.
