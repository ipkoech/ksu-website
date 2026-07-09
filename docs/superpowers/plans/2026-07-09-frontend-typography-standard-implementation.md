# Frontend Typography Standard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize all frontend apps on the shared Bookman Old Style typography and 10pt-24pt size scale from one shared theme source.

**Architecture:** `frontend/packages/ui/src/globals.css` becomes the canonical source for typography, color, radius, shadows, and shared base styles. App-level `globals.css` files import that shared file and keep only app-specific layout/utilities, so changing shared theme tokens affects `web`, `admin`, `research`, and `library`.

**Tech Stack:** Next.js apps, Tailwind CSS v3, shared `@ksu/ui` package CSS export, Node.js built-in test runner for source-contract verification.

## Global Constraints

- Body/default font: `"Bookman Old Style", Georgia, serif`.
- Display/headline font: `"Bookman Old Style", Georgia, serif`.
- Compact support sizes: `10pt` for `xs`, `11pt` for `sm`.
- Body/default size: `12pt`.
- Content and heading progression: `12pt`, `14pt`, `16pt`, `18pt`, `20pt`, `22pt`, `24pt`.
- Standard typography maximum: `24pt`.
- No app-level font-family or font-size token overrides.
- Keep explicit `text-[...]` component classes out of scope except for later review.

---

### Task 1: Add Typography Contract Test

**Files:**
- Create: `frontend/typography-tokens-contract.test.mjs`

**Interfaces:**
- Consumes: CSS files at `frontend/packages/ui/src/globals.css` and `frontend/apps/*/src/app/globals.css`.
- Produces: A contract test runnable with `node --test frontend/typography-tokens-contract.test.mjs`.

- [ ] **Step 1: Write the failing test**

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const root = process.cwd();
const sharedGlobals = readFileSync(join(root, "frontend/packages/ui/src/globals.css"), "utf8");
const appGlobalsPaths = [
  "frontend/apps/web/src/app/globals.css",
  "frontend/apps/admin/src/app/globals.css",
  "frontend/apps/research/src/app/globals.css",
  "frontend/apps/library/src/app/globals.css",
];

test("shared UI globals define the canonical frontend typography scale", () => {
  const expectedTokens = [
    ["--font-sans", '"Bookman Old Style", Georgia, serif'],
    ["--font-display", '"Bookman Old Style", Georgia, serif'],
    ["--font-size-xs", "10pt"],
    ["--font-size-sm", "11pt"],
    ["--font-size-base", "12pt"],
    ["--font-size-lg", "14pt"],
    ["--font-size-xl", "16pt"],
    ["--font-size-2xl", "18pt"],
    ["--font-size-3xl", "20pt"],
    ["--font-size-4xl", "22pt"],
    ["--font-size-5xl", "24pt"],
    ["--font-size-6xl", "24pt"],
  ];

  for (const [token, value] of expectedTokens) {
    assert.match(sharedGlobals, new RegExp(`${token}:\\\\s*${value.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")};`));
  }
});

test("frontend apps import shared globals without typography overrides", () => {
  for (const path of appGlobalsPaths) {
    const source = readFileSync(join(root, path), "utf8");
    assert.match(source, /@import "@ksu\/ui\/globals\.css";/);
    assert.doesNotMatch(source, /--font-sans\s*:/);
    assert.doesNotMatch(source, /--font-display\s*:/);
    assert.doesNotMatch(source, /--font-size-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)\s*:/);
    assert.doesNotMatch(source, /Inter|Playfair Display/);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test frontend/typography-tokens-contract.test.mjs`

Expected: FAIL because shared globals still use the old Inter/fluid scale and some app globals still override font tokens.

### Task 2: Centralize Typography And Theme Tokens

**Files:**
- Modify: `frontend/packages/ui/src/globals.css`
- Modify: `frontend/apps/web/src/app/globals.css`
- Modify: `frontend/apps/admin/src/app/globals.css`
- Modify: `frontend/apps/research/src/app/globals.css`
- Modify: `frontend/apps/library/src/app/globals.css`

**Interfaces:**
- Consumes: Contract test from Task 1.
- Produces: A single shared token source in `@ksu/ui/globals.css`.

- [ ] **Step 1: Update shared globals**

Set canonical typography tokens in `frontend/packages/ui/src/globals.css`:

```css
--font-sans: "Bookman Old Style", Georgia, serif;
--font-display: "Bookman Old Style", Georgia, serif;
--font-size-xs: 10pt;
--font-size-sm: 11pt;
--font-size-base: 12pt;
--font-size-lg: 14pt;
--font-size-xl: 16pt;
--font-size-2xl: 18pt;
--font-size-3xl: 20pt;
--font-size-4xl: 22pt;
--font-size-5xl: 24pt;
--font-size-6xl: 24pt;
```

- [ ] **Step 2: Remove app-level typography overrides**

Keep `@import "@ksu/ui/globals.css";` in app globals. Remove `--font-sans`, `--font-display`, and `--font-size-*` app overrides from `web`, `admin`, `research`, and `library`. For `research` and `library`, replace duplicated base theme blocks with the shared import and preserve only app-specific utilities.

- [ ] **Step 3: Run the contract test**

Run: `node --test frontend/typography-tokens-contract.test.mjs`

Expected: PASS.

### Task 3: Verify Frontend Checks And Commit

**Files:**
- Verify modified frontend CSS files and contract test.

**Interfaces:**
- Consumes: Passing contract test from Task 2.
- Produces: Committed implementation using the project helper.

- [ ] **Step 1: Run targeted contract test**

Run: `node --test frontend/typography-tokens-contract.test.mjs`

Expected: PASS.

- [ ] **Step 2: Run frontend checks**

Run: `cd frontend && pnpm lint && pnpm typecheck`

Expected: Commands exit 0. Existing lint warnings may be printed.

- [ ] **Step 3: Commit with project helper**

Run:

```bash
scripts/commit-changes.sh -m "Standardize frontend typography tokens" --run-checks -- \
  frontend/typography-tokens-contract.test.mjs \
  frontend/packages/ui/src/globals.css \
  frontend/apps/web/src/app/globals.css \
  frontend/apps/admin/src/app/globals.css \
  frontend/apps/research/src/app/globals.css \
  frontend/apps/library/src/app/globals.css \
  docs/superpowers/plans/2026-07-09-frontend-typography-standard-implementation.md
```

Expected: Commit succeeds.
