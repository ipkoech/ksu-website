# Public Header Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the public announcement strip system-wide, improve mini-header contrast, and increase the main navigation height by 20%.

**Architecture:** Remove the announcement presentation from the homepage and shared `PageShell`, then make the visual changes in the shared UI package so every public consumer receives them consistently. Keep announcement content pages and homepage data composition unchanged.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, shared `@ksu/ui` layout components.

## Global Constraints

- Remove the announcement strip from all public pages.
- Use the established `primary` theme token for the mini-header background.
- Use solid white text for mini-header contacts, utility links, and search.
- Set the main-header default/mobile height to 107px and large-screen height to 98px.
- Keep existing navigation content, responsive breakpoints, logo sizing, stickiness, and menu behavior unchanged.
- Do not add automated tests, per the user's explicit instruction.
- Preserve unrelated worktree changes.

---

### Task 1: Remove the announcement strip system-wide

**Files:**
- Modify: `frontend/apps/web/src/components/site-shell.tsx`
- Modify: `frontend/apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: `PageShell` and the homepage's explicit public-shell composition.
- Produces: Public pages whose first visible header layer is `MiniHeader`.

- [ ] **Step 1: Remove the shared announcement component**

Delete the `Announcements`, `getLandingAnnouncements`, and `LandingAnnouncement` imports; delete the exported `AnnouncementHeader` function; and remove `<AnnouncementHeader />` from `PageShell`.

- [ ] **Step 2: Remove the homepage announcement rendering**

Delete the `AnnouncementHeader` import and `<AnnouncementHeader announcements={homepage.announcements} />` call from `frontend/apps/web/src/app/page.tsx`. Keep `homepage.announcements` in the broader homepage data contract because this header-only change does not redesign legacy fallback data composition.

- [ ] **Step 3: Check for remaining header usage**

Run:

```bash
rg -n "AnnouncementHeader|<Announcements" frontend/apps/web/src
```

Expected: no shared-header or homepage matches.

### Task 2: Refine shared header styling

**Files:**
- Modify: `frontend/packages/ui/src/components/layout/public/mini-header.tsx`
- Modify: `frontend/packages/ui/src/components/layout/public/public-header.tsx`

**Interfaces:**
- Consumes: Existing `MiniHeaderProps` and `PublicHeaderProps`; no interface changes.
- Produces: Primary mini-header with solid white content and a 107px/98px main header.

- [ ] **Step 1: Update mini-header colours**

Change the mini-header container from `bg-secondary` to `bg-primary`. Replace every `text-white/80` class on contact details, quick links, and search with `text-white`, retaining existing hover, border, divider, and shadow classes.

- [ ] **Step 2: Increase main-header height**

Change:

```tsx
<div className="flex h-[89px] items-center justify-between lg:h-[82px]">
```

to:

```tsx
<div className="flex h-[107px] items-center justify-between lg:h-[98px]">
```

- [ ] **Step 3: Format the modified TypeScript files**

Run:

```bash
cd frontend
pnpm exec prettier --write \
  apps/web/src/components/site-shell.tsx \
  apps/web/src/app/page.tsx \
  packages/ui/src/components/layout/public/mini-header.tsx \
  packages/ui/src/components/layout/public/public-header.tsx
```

Expected: Prettier completes without errors.

### Task 3: Verify and commit

**Files:**
- Verify: the four modified TypeScript/TSX files from Tasks 1 and 2.

**Interfaces:**
- Consumes: Running web application and existing project checks.
- Produces: Verified, committed system-wide header refinement.

- [ ] **Step 1: Run existing static checks**

Run:

```bash
cd frontend/apps/web
pnpm typecheck
pnpm lint
```

Expected: typecheck succeeds; lint has no new errors.

- [ ] **Step 2: Inspect desktop and mobile rendering**

Use Playwright against the homepage and one internal `PageShell` page at 1440px and 390px. Confirm the announcement strip is absent, mini-header colours and text contrast are correct, main-header heights are 98px and 107px at their respective breakpoints, navigation remains usable, and neither viewport has horizontal overflow or console errors.

- [ ] **Step 3: Commit only scoped files**

Run:

```bash
scripts/commit-changes.sh -m "Refine public site headers" --run-checks -- \
  frontend/apps/web/src/components/site-shell.tsx \
  frontend/apps/web/src/app/page.tsx \
  frontend/packages/ui/src/components/layout/public/mini-header.tsx \
  frontend/packages/ui/src/components/layout/public/public-header.tsx
```

Expected: commit succeeds without staging unrelated worktree changes.
