# Homepage Hero Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved Kisii University landing-page hero from `GET /api/v1/homepage`, using the supplied campus photograph and rendering only backend-resolved admissions actions.

**Architecture:** Extend the existing homepage composition types with the optional resolved `hero` read model, pass that model through the section renderer, and keep presentation inside the existing `hero_admissions` variant. A focused client countdown owns time-based visual updates and refreshes server data at expiry; the server component owns all admissions-state decisions.

**Tech Stack:** Next.js 15, React 19, TypeScript 5.8, Tailwind CSS 3.4, Lucide React, Node test runner.

## Global Constraints

- Use `GET /api/v1/homepage`; do not add a second homepage request.
- Use the existing `primary`, `secondary`, slate, border, typography, radius, and shadow tokens.
- Use `design/KSUUniversityInsfrastructureFeb17,2026-3898.jpg` as the hero background asset.
- Never infer whether applications are open in the browser.
- Render the admissions panel only when `hero.admissions.visible` is true and its resolved state is supported.
- Never invent an Apply action when the resolved hero is missing or hidden.
- Preserve backward compatibility with responses that contain only `sections` and `partnership_spotlights`.
- Support keyboard focus, reduced motion, mobile stacking, readable deadline text, and non-live per-second countdown output.
- Commit only through `scripts/commit-changes.sh` with explicit paths.

---

### Task 1: Homepage Hero Contract and Campus Asset

**Files:**
- Create: `frontend/apps/web/public/images/homepage/kisii-administration-campus.jpg`
- Modify: `frontend/apps/web/src/lib/homepage-sections.ts`
- Modify: `frontend/apps/web/src/app/homepage-page-cms-contract.test.mjs`

**Interfaces:**
- Produces: `HomepageResolvedHero`, `HomepageHeroContent`, `HomepageHeroAdmissions`, and `HomepageHeroAction`.
- Produces: optional `resolved_at` and `hero` fields on `HomepageCompositionResponse`.
- Produces: `/images/homepage/kisii-administration-campus.jpg`.

- [ ] **Step 1: Add failing endpoint-contract assertions**

Assert that the response exposes an optional resolved hero, that admissions has the three controlled states, and that the fetcher still makes one homepage request:

```js
assert.match(fetcherSource, /hero\?: HomepageResolvedHero \| null/);
assert.match(fetcherSource, /state: "applications_open" \| "admission_letters_available" \| "hidden"/);
assert.equal((fetcherSource.match(/"\/api\/v1\/homepage"/g) ?? []).length, 1);
```

- [ ] **Step 2: Run the contract test and verify RED**

Run:

```bash
cd frontend/apps/web
node --test src/app/homepage-page-cms-contract.test.mjs
```

Expected: FAIL because the resolved hero types are absent.

- [ ] **Step 3: Add exact TypeScript read models**

Add types matching the approved response contract, including content actions, intake identity, application phase, countdown target, reporting information, primary/secondary actions, media, and facts. Keep `hero` optional so the current backend response remains parseable while the resolver is deployed.

- [ ] **Step 4: Copy and validate the supplied image**

Copy the source without modifying it:

```bash
mkdir -p frontend/apps/web/public/images/homepage
cp design/KSUUniversityInsfrastructureFeb17,2026-3898.jpg frontend/apps/web/public/images/homepage/kisii-administration-campus.jpg
identify frontend/apps/web/public/images/homepage/kisii-administration-campus.jpg
```

Expected: a readable `6000x4000` JPEG.

- [ ] **Step 5: Run the focused contract and type checks**

```bash
cd frontend/apps/web
node --test src/app/homepage-page-cms-contract.test.mjs
pnpm typecheck
```

Expected: both commands pass.

---

### Task 2: Accessible Countdown and Resolved Hero Renderer

**Files:**
- Create: `frontend/apps/web/src/components/home/admissions-countdown.tsx`
- Modify: `frontend/apps/web/src/components/home/sections/composed-section-variants.tsx`
- Modify: `frontend/apps/web/src/components/home/section-renderer.tsx`
- Modify: `frontend/apps/web/src/app/page.tsx`
- Create: `frontend/apps/web/src/app/homepage-hero-frontend-contract.test.mjs`

**Interfaces:**
- Consumes: `HomepageResolvedHero` from Task 1.
- Produces: `AdmissionsCountdown({ target, resolvedAt, onExpiredLabel })`.
- Produces: `HeroAdmissionsSection({ section, hero })` with application-open, admission-letters, and hidden layouts.

- [ ] **Step 1: Add failing renderer-contract tests**

Assert that the page passes `composedHomepage.data?.hero`, that the renderer forwards it only to the selected section component, and that the hero:

```text
uses /images/homepage/kisii-administration-campus.jpg
renders admissions only behind admissions.visible
handles applications_open and admission_letters_available
uses AdmissionsCountdown for countdown_target
uses primary and secondary theme classes
contains no hard-coded operational Apply URL
```

- [ ] **Step 2: Run the renderer contract and verify RED**

```bash
cd frontend/apps/web
node --test src/app/homepage-hero-frontend-contract.test.mjs
```

Expected: FAIL because the endpoint hero is not wired to the renderer.

- [ ] **Step 3: Implement the countdown**

Create a client component that calculates remaining days, hours, minutes, and seconds from the backend target, shows a readable localized deadline to assistive technology, marks changing digits `aria-hidden`, stops at zero, and calls `router.refresh()` once when expired. Use a one-second interval only while time remains.

- [ ] **Step 4: Pass the resolved hero through the renderer**

Add an optional `hero` prop to `HomepageSections`, `HomepageSectionRenderer`, and the section component interface. Pass `composedHomepage.data?.hero` from `page.tsx`; other section variants may ignore it.

- [ ] **Step 5: Implement the approved hero layout**

Use the campus image as a full-bleed background with a primary/slate contrast overlay. Render CMS/backend eyebrow, headline, orange highlighted line, description, and up to two institutional actions on the left. On large screens place the admissions card on the right; stack it below copy on small screens. Render application countdown and resolved actions for `applications_open`, reporting/letter content for `admission_letters_available`, and reclaim the full text width for `hidden` or absent admissions.

- [ ] **Step 6: Run focused tests and checks**

```bash
cd frontend/apps/web
node --test src/app/homepage-page-cms-contract.test.mjs src/app/homepage-hero-frontend-contract.test.mjs
pnpm lint
pnpm typecheck
```

Expected: all commands pass.

- [ ] **Step 7: Run the production build**

```bash
cd frontend/apps/web
pnpm build
```

Expected: Next.js production build exits 0.

- [ ] **Step 8: Commit the verified hero slice**

```bash
scripts/commit-changes.sh -m "Build homepage admissions hero" --run-full-checks -- frontend/apps/web/public/images/homepage/kisii-administration-campus.jpg frontend/apps/web/src/lib/homepage-sections.ts frontend/apps/web/src/components/home/admissions-countdown.tsx frontend/apps/web/src/components/home/sections/composed-section-variants.tsx frontend/apps/web/src/components/home/section-renderer.tsx frontend/apps/web/src/app/page.tsx frontend/apps/web/src/app/homepage-page-cms-contract.test.mjs frontend/apps/web/src/app/homepage-hero-frontend-contract.test.mjs
```
