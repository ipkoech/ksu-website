# Balanced Slider Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the main website and research homepage sliders into a balanced editorial hero design using existing application theming and backend-provided slide fields.

**Architecture:** Keep the existing public component APIs: `LandingHero` for the main site and `ResearchImmersiveHero` for research. Add focused internal helpers for CTA normalization, active media, editorial content, controls, and preview rails without introducing backend schema changes.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Framer Motion, lucide-react, existing KSU UI/theme tokens.

## Global Constraints

- Preserve the existing application theme and colors; use existing Tailwind tokens such as `primary`, `secondary`, `background`, `foreground`, and existing slate/white overlays already present in the app.
- Main sliders must use existing backend fields from `SliderGroup` and `Slider`.
- Research sliders must work with current static data and may later map to `research_sliders`.
- Links must support internal and external destinations.
- Hide a CTA when a slide has no usable link.
- Autoplay only when more than one slide exists.
- Pause autoplay on hover and keyboard focus.
- Respect `prefers-reduced-motion`.
- Keep hero dimensions stable across slide changes.
- Do not add new dependencies.

---

### Task 1: Main Hero Editorial Layout

**Files:**
- Modify: `frontend/apps/web/src/components/home/landing-hero.tsx`

**Interfaces:**
- Consumes: `LandingHeroData`, `LandingHeroSlide` from `frontend/apps/web/src/lib/landing-data.ts`.
- Produces: refreshed `LandingHero` component with the same exported prop interface.

- [ ] **Step 1: Add CTA helpers**

Add local helpers near the top of `landing-hero.tsx`:

```ts
function isExternalHref(value?: string | null) {
  return Boolean(value && /^https?:\/\//i.test(value));
}

function ctaRel(isExternal: boolean, openInNewTab?: boolean) {
  return isExternal && openInNewTab ? "noopener noreferrer" : undefined;
}
```

- [ ] **Step 2: Refactor the content area**

Replace the current centered text block with a left editorial panel that uses:

```tsx
<div className="relative z-10 flex min-h-[520px] w-full items-end px-4 pb-20 pt-24 sm:min-h-[580px] sm:px-6 lg:min-h-[640px] lg:px-8 xl:px-10 2xl:px-12">
  <div className="grid w-full max-w-[1680px] gap-8 lg:grid-cols-[minmax(0,760px)_minmax(320px,1fr)] lg:items-end">
    <HeroEditorialPanel slide={activeSlide} />
    <HeroPreviewRail slides={slides} activeIndex={activeIndex} onSelect={setActiveIndex} />
  </div>
</div>
```

- [ ] **Step 3: Add preview rail**

Create `HeroPreviewRail` inside the same file. It must render compact preview buttons using `slide.imageUrl`, `slide.eyebrow`, and `slide.title`, expose `aria-current`, and keep fixed item dimensions to avoid layout shift.

- [ ] **Step 4: Keep controls accessible**

Reuse existing arrow and dot behavior, but position arrows near the preview rail and keep dots/progress visible on mobile.

- [ ] **Step 5: Verify**

Run:

```bash
pnpm --dir frontend --filter @ksu/web lint
pnpm --dir frontend --filter @ksu/web typecheck
```

Expected: both pass.

---

### Task 2: Research Hero Editorial Layout

**Files:**
- Modify: `frontend/apps/research/src/components/research-immersive-hero.tsx`

**Interfaces:**
- Consumes: `ResearchHeroSlide`.
- Produces: refreshed `ResearchImmersiveHero` component with the same exported prop interface.

- [ ] **Step 1: Add link helpers**

Add local helpers:

```ts
function isExternalHref(value?: string | null) {
  return Boolean(value && /^https?:\/\//i.test(value));
}
```

- [ ] **Step 2: Update action links**

For `primaryAction` and `secondaryAction`, set `target="_blank"` and `rel="noopener noreferrer"` when `href` is external.

- [ ] **Step 3: Add research preview rail**

Add a bottom preview rail with compact buttons for all slides. Use `imageSrc`, `eyebrow`, and `title`. Preserve the existing darker research overlay and stats behavior.

- [ ] **Step 4: Preserve existing theming**

Keep existing `bg-slate-950`, `secondary`, white text, and current overlay approach. Do not introduce new brand colors.

- [ ] **Step 5: Verify**

Run:

```bash
pnpm --dir frontend --filter @ksu/research lint
pnpm --dir frontend --filter @ksu/research typecheck
```

Expected: both pass.

---

### Task 3: Visual and Regression Checks

**Files:**
- Inspect: `frontend/apps/web/src/components/home/landing-hero.tsx`
- Inspect: `frontend/apps/research/src/components/research-immersive-hero.tsx`

**Interfaces:**
- Consumes: completed Task 1 and Task 2 components.
- Produces: verified implementation commit.

- [ ] **Step 1: Run focused checks**

Run:

```bash
pnpm --dir frontend --filter @ksu/web lint
pnpm --dir frontend --filter @ksu/web typecheck
pnpm --dir frontend --filter @ksu/research lint
pnpm --dir frontend --filter @ksu/research typecheck
```

Expected: all pass.

- [ ] **Step 2: Commit**

Use the project helper:

```bash
scripts/commit-changes.sh -m "feat: refresh balanced slider heroes" --run-checks -- frontend/apps/web/src/components/home/landing-hero.tsx frontend/apps/research/src/components/research-immersive-hero.tsx
```

Expected: commit succeeds and unrelated local CSS/layout edits remain uncommitted.

