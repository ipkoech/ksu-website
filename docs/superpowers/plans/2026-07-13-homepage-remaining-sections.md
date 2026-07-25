# Homepage Remaining Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the approved Kisii University landing page below the hero using sections and items returned by `GET /api/v1/homepage`.

**Architecture:** Page CMS remains the source of homepage structure, copy, links, item metadata, and media references. Expand the safe seed inventory to cover the approved page, enrich the existing section renderers to consume item `content` fields, and compose related variants into the designed admissions, editorial, and proof bands without adding a second homepage API request.

**Tech Stack:** Python 3.12, FastAPI, SQLAlchemy 2, pytest, Next.js 15, React 19, TypeScript 5.8, Tailwind CSS 3.4, Node test runner, Playwright.

## Global Constraints

- Use only the existing Kisii University `primary`, `secondary`, neutral, typography, radius, and shadow tokens.
- Keep `GET /api/v1/homepage` as the single composed-page request.
- Preserve editor-owned and published Page CMS records; seed only missing records or seed-owned drafts.
- Keep Heri Africa as the permanent strategic partnership spotlight.
- Render leadership with the Vice Chancellor and linked recent activities.
- Keep all institutional statistics in the bottom proof band.
- Avoid invented operational admissions state and invented external URLs.
- Use accessible headings, links, focus states, 44px targets, and responsive grids without horizontal overflow.
- Commit through `scripts/commit-changes.sh` with explicit paths.

---

### Task 1: Complete the Backend Homepage Section Inventory

**Files:**
- Modify: `services/main/app/seeders/seed_page_cms.py`
- Modify: `services/main/tests/test_page_cms_seeders.py`

**Interfaces:**
- Produces published Page CMS sections in this order: hero, pulse, pillars, featured partnership, programme finder, date timeline, campus mosaic, leadership activity, research cards, news grid, events list, logo carousel, alumni story, facts strip.
- Produces item `content` keys used by the frontend: `imageUrl`, `imageAlt`, `category`, `date`, `value`, `label`, `group`, `step`, and `icon`.

- [ ] Write failing seeder tests asserting the complete ordered inventory, Heri Africa placement, five application steps, five research themes, VC leadership items, alumni item, and seven bottom facts.
- [ ] Run `cd services/main && PYTHONPATH=../common .venv/bin/pytest tests/test_page_cms_seeders.py -q` and verify the new assertions fail.
- [ ] Expand `HOMEPAGE_SECTION_SPECS` with concise public copy, safe internal links, existing public image paths, and exact display order while preserving the existing editor-protection rules.
- [ ] Run the focused seeder tests and verify they pass.

### Task 2: Build the Remaining Data-Driven Section Layouts

**Files:**
- Modify: `frontend/apps/web/src/components/home/sections/composed-section-variants.tsx`
- Modify: `frontend/apps/web/src/components/home/section-renderer.tsx`
- Modify: `frontend/apps/web/src/app/page.tsx`
- Create: `frontend/apps/web/src/app/homepage-sections-design-contract.test.mjs`

**Interfaces:**
- Consumes only `HomepageSection`, `HomepageSectionItem`, and `HomepagePartnershipSpotlight` from the composed homepage response.
- Produces the approved University Pulse, Why Kisii, Heri Africa, admissions discovery, campus life, leadership/activity, research impact, news/events, partners, alumni/facts, and footer-adjacent layouts.

- [ ] Write failing contract tests for every approved section heading, grouped news/events and alumni/facts bands, item image metadata, full statistic count, and removal of the legacy homepage fallback below the new hero.
- [ ] Run the contract test and verify it fails for the missing layout behavior.
- [ ] Add small item metadata helpers and image-led card primitives inside the composed-section module.
- [ ] Upgrade each renderer to the approved responsive layout, using section items/media and graceful empty states.
- [ ] Make `HomepageSections` group adjacent news/events and alumni/facts variants while retaining generic ordering for editor-controlled sections.
- [ ] Replace the old multi-API legacy section fallback with composed-section output when Page CMS records exist; retain only a compact unavailable-content fallback when the endpoint is empty.
- [ ] Run focused Node tests, `pnpm lint`, and `pnpm typecheck`.

### Task 3: Seed, Audit, Verify, and Commit

**Files:**
- Modify only files from Tasks 1 and 2.

**Interfaces:**
- Verifies the live local homepage response and rendered desktop/mobile page.

- [ ] Run the main Page CMS seeder through the existing service seed runner and confirm `/api/v1/homepage` returns the ordered published sections.
- [ ] Audit 1440px and 390px layouts with Playwright for headings, links, overflow, and browser console errors.
- [ ] Run focused backend tests, focused frontend contract tests, full frontend lint/typecheck, and a production build using an isolated `NEXT_DIST_DIR`.
- [ ] Review `git diff --check` and confirm no unrelated worktree changes are staged.
- [ ] Commit with `scripts/commit-changes.sh -m "Complete homepage landing sections" --run-checks -- <explicit paths>`.
