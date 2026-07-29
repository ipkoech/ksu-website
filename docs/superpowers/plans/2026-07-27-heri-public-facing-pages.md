# HERI Africa Public-Facing Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a polished, data-backed HERI Africa public website matching the supplied visual direction across the homepage, institutional pages, research, news, events, partnerships, contact, and supporting legal/accessibility pages.

**Architecture:** Keep the existing Next.js App Router application in `frontend/apps/heri-africa` as the public surface. Consolidate shared shell, navigation, footer, SEO metadata, loading/error states, and content card patterns into reusable components; consume the HERI public API through typed server-side helpers with graceful fallbacks. Preserve the existing admin and backend contracts, extending public endpoints only where page requirements need data that is not currently exposed.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, server components, Playwright, HERI FastAPI public API.

## Global Constraints

- Use the supplied HERI visual language: deep teal/blue, lime accents, generous white space, rounded cards, editorial photography, and strong accessible contrast.
- Use real API-backed content; fallback copy may keep the page usable when the API is unavailable but must never hide request failures silently in interactive forms.
- Preserve keyboard navigation, skip links, focus states, reduced-motion behavior, semantic headings, image alt text, and responsive layouts.
- Do not change admin behavior or commit generated assets, local databases, uploads, or test artifacts.
- Validate each task with focused tests, then run the relevant frontend lint/typecheck and Playwright project checks before committing.

---

### Task 1: Establish the public design system and shared shell

**Files:**
- Modify: `frontend/apps/heri-africa/src/app/globals.css`
- Modify: `frontend/apps/heri-africa/src/components/site-shell.tsx`
- Modify: `frontend/apps/heri-africa/src/app/layout.tsx`
- Create: `frontend/apps/heri-africa/src/components/public/section-heading.tsx`
- Create: `frontend/apps/heri-africa/src/components/public/cta-button.tsx`
- Test: `frontend/apps/heri-africa/e2e/public-shell.spec.ts`

- [ ] **Step 1: Write the failing shell tests** for desktop/mobile primary navigation, skip link, footer links, visible focus rings, and the responsive menu.
- [ ] **Step 2: Run** `cd frontend && pnpm exec playwright test apps/heri-africa/e2e/public-shell.spec.ts --project=heri`; confirm failures identify missing shell behavior.
- [ ] **Step 3: Implement** a data-driven shell accepting navigation items, active-link state, configurable CTA, and site settings; add reusable heading/button primitives and CSS tokens for type scale, motion, focus, and section spacing.
- [ ] **Step 4: Run** the focused shell test and `pnpm --filter @ksu/heri-africa typecheck`; expect both to pass.
- [ ] **Step 5: Commit** with `scripts/commit-changes.sh -m "feat(heri-public): establish shared public shell" --run-checks -- ...`.

### Task 2: Make public API data typed, cached, and failure-tolerant

**Files:**
- Modify: `frontend/apps/heri-africa/src/lib/api.ts`
- Create: `frontend/apps/heri-africa/src/lib/content-types.ts`
- Create: `frontend/apps/heri-africa/src/components/public/content-state.tsx`
- Modify: `services/heri_africa/app/routes/v1/public.py` only if a missing response is required
- Test: `frontend/apps/heri-africa/e2e/public-api-states.spec.ts`

- [ ] **Step 1: Write tests** for successful typed responses, empty collections, API errors, and form error responses.
- [ ] **Step 2: Run** the focused test to capture current inconsistent states.
- [ ] **Step 3: Implement** typed response models, a shared fetch helper that distinguishes empty data from request errors, `loading.tsx`/`error.tsx` boundaries where needed, and stable cache/revalidation behavior. Keep public response shapes backward-compatible.
- [ ] **Step 4: Run** the focused tests, frontend typecheck, and `python3 -m compileall -q services/heri_africa/app`.
- [ ] **Step 5: Commit** the API/state foundation.

### Task 3: Rebuild the homepage as the public conversion surface

**Files:**
- Modify: `frontend/apps/heri-africa/src/app/page.tsx`
- Create: `frontend/apps/heri-africa/src/components/home/hero.tsx`
- Create: `frontend/apps/heri-africa/src/components/home/impact-pillars.tsx`
- Create: `frontend/apps/heri-africa/src/components/home/research-ambition.tsx`
- Create: `frontend/apps/heri-africa/src/components/home/latest-insights.tsx`
- Create: `frontend/apps/heri-africa/src/components/public/partner-strip.tsx`
- Test: `frontend/apps/heri-africa/e2e/homepage.spec.ts`

- [ ] **Step 1: Write tests** asserting the hero heading/CTA, four impact pillars, research ambition, latest API-backed story cards, partner strip, and CTA links.
- [ ] **Step 2: Implement** the sections with responsive image treatment, explicit alt text, safe empty states, and links to the relevant public routes.
- [ ] **Step 3: Run** the homepage test at desktop and mobile projects; verify no horizontal overflow and that the CTA remains reachable.
- [ ] **Step 4: Commit** the homepage implementation.

### Task 4: Deliver About, Our Work, Team, and Partners pages

**Files:**
- Modify: `frontend/apps/heri-africa/src/app/about/page.tsx`
- Modify: `frontend/apps/heri-africa/src/app/our-work/page.tsx`
- Modify: `frontend/apps/heri-africa/src/app/team/page.tsx`
- Modify: `frontend/apps/heri-africa/src/app/partners/page.tsx`
- Create: `frontend/apps/heri-africa/src/components/public/vision-mission.tsx`
- Create: `frontend/apps/heri-africa/src/components/public/value-grid.tsx`
- Test: `frontend/apps/heri-africa/e2e/institutional-pages.spec.ts`

- [ ] **Step 1: Write tests** for page headings, vision/mission/value sections, API-backed team/partner cards, empty collections, and profile/image accessibility.
- [ ] **Step 2: Implement** the supplied editorial hierarchy: who we are, hosted-by partnership, why language education matters, vision/mission, values, approach, team leadership, and partner ecosystem.
- [ ] **Step 3: Run** the institutional test and inspect mobile card wrapping at 390px.
- [ ] **Step 4: Commit** the institutional pages.

### Task 5: Complete Research, News, Events, and Opportunities journeys

**Files:**
- Modify: `frontend/apps/heri-africa/src/app/research/page.tsx`
- Modify: `frontend/apps/heri-africa/src/app/research/projects/page.tsx`
- Modify: `frontend/apps/heri-africa/src/app/research/publications/page.tsx`
- Modify: `frontend/apps/heri-africa/src/app/news-insights/page.tsx`
- Modify: `frontend/apps/heri-africa/src/app/news-insights/[slug]/page.tsx`
- Modify: `frontend/apps/heri-africa/src/app/events/page.tsx`
- Create: `frontend/apps/heri-africa/src/app/opportunities/page.tsx`
- Create: `frontend/apps/heri-africa/src/components/public/filter-bar.tsx`
- Test: `frontend/apps/heri-africa/e2e/research-content-pages.spec.ts`

- [ ] **Step 1: Write tests** for collection rendering, search/filter controls, empty/error states, news detail not-found behavior, event metadata, and opportunity CTA links.
- [ ] **Step 2: Add or extend** public API methods for opportunities and detail records only where needed; preserve published-status filtering server-side.
- [ ] **Step 3: Implement** editorial cards, dates, categories, pagination or load-more behavior, metadata, and related-content links.
- [ ] **Step 4: Run** focused tests plus backend compile/tests for any endpoint changes.
- [ ] **Step 5: Commit** the research and knowledge-exchange journeys.

### Task 6: Polish Contact and Partner With Us conversion flows

**Files:**
- Modify: `frontend/apps/heri-africa/src/app/contact/page.tsx`
- Modify: `frontend/apps/heri-africa/src/app/partner-with-us/page.tsx`
- Create: `frontend/apps/heri-africa/src/components/forms/form-field.tsx`
- Create: `frontend/apps/heri-africa/src/components/forms/submission-status.tsx`
- Test: `frontend/apps/heri-africa/e2e/conversion-forms.spec.ts`

- [ ] **Step 1: Write tests** for required fields, consent, successful submission, server error, duplicate-submit prevention, and accessible status announcements.
- [ ] **Step 2: Implement** shared form primitives, inline validation, loading states, success/error summaries, and the supplied contact/partnership information hierarchy.
- [ ] **Step 3: Run** conversion tests on desktop/mobile and verify keyboard-only completion.
- [ ] **Step 4: Commit** the conversion flows.

### Task 7: SEO, metadata, structured data, and supporting pages

**Files:**
- Modify: `frontend/apps/heri-africa/src/app/layout.tsx`
- Modify: each public route `page.tsx` metadata export
- Create: `frontend/apps/heri-africa/src/app/sitemap.ts`
- Create: `frontend/apps/heri-africa/src/app/robots.ts`
- Modify: `frontend/apps/heri-africa/src/app/privacy/page.tsx`
- Modify: `frontend/apps/heri-africa/src/app/accessibility/page.tsx`
- Test: `frontend/apps/heri-africa/e2e/seo-accessibility.spec.ts`

- [ ] **Step 1: Write tests** for title templates, canonical URLs, Open Graph fields, sitemap/robots responses, and required privacy/accessibility links.
- [ ] **Step 2: Implement** route-specific metadata, Organization/Article/Event JSON-LD where data exists, sitemap entries for published slugs, and accessible policy copy.
- [ ] **Step 3: Run** metadata tests and the existing accessibility foundation checks.
- [ ] **Step 4: Commit** SEO and supporting-page work.

### Task 8: Visual regression, browser matrix, and release verification

**Files:**
- Modify: `frontend/playwright.config.ts`
- Modify: `frontend/apps/heri-africa/e2e/*.spec.ts`
- Create: `frontend/apps/heri-africa/e2e/visual-regression.spec.ts`
- Create: `frontend/apps/heri-africa/README.md`

- [ ] **Step 1: Add** mobile and desktop HERI projects, reduced-motion coverage, API-mocked deterministic fixtures, and screenshot checkpoints for homepage, about, news, contact, and partner pages.
- [ ] **Step 2: Run** `cd frontend && pnpm exec playwright test --project=heri`; expect the full public matrix to pass with the public app running on `HERI_E2E_BASE_URL`.
- [ ] **Step 3: Run** `pnpm --filter @ksu/heri-africa lint`, `pnpm --filter @ksu/heri-africa typecheck`, and `git diff --check`.
- [ ] **Step 4: Document** required environment variables, API mocking conventions, and local commands in the app README.
- [ ] **Step 5: Commit** the release verification additions.

## Self-review

- Covered the supplied public pages and visual sections: homepage, About, Our Work, research, team, partners, news, events, partnership, contact, footer, privacy, and accessibility.
- Covered the data/API layer, forms, responsive shell, SEO, accessibility, error states, and browser verification.
- No unresolved placeholders or unspecified implementation steps are required; each task names concrete files, tests, commands, and deliverables.
