# Frontend Typography Standard Design

## Context

The repository has four frontend apps: `web`, `admin`, `research`, and `library`.
The current typography is not fully standardized:

- `web` and `admin` import shared UI globals from `@ksu/ui`.
- `research` and `library` duplicate theme globals locally.
- Public-facing pages use `--font-display` for headings, currently mapped to Playfair Display in several apps.
- Body text uses `--font-sans`, currently mapped to Inter/system sans stacks.

The goal is to standardize all frontend apps on Arial for normal text, with a 12px body/default text size, while keeping headings and buttons free to scale up through existing typography utilities.

## Decision

Use a single typography contract across all frontends:

- Body/default font: `Arial, Helvetica, sans-serif`.
- Display/headline font: `Arial, Helvetica, sans-serif`.
- Body/default font size: `12px`, represented as `--font-size-base: 0.75rem`.
- Keep existing Tailwind `font-sans` and `font-mono` mappings, but make `font-sans` resolve to the standardized `--font-sans` value.
- Keep scaled heading and utility tokens so headings, hero text, buttons, labels, tables, and dense admin controls can still intentionally use larger or smaller sizes.

The fallback stack keeps Arial as the first-choice font while giving the browser explicit substitutions when Arial is unavailable on a client system.

## Architecture

The shared UI package should be the primary typography source:

- Update `frontend/packages/ui/src/globals.css` to define the canonical sans and display stacks.
- Update `--font-size-base` in the shared scale to `0.75rem`.
- Review related size tokens so the scale remains coherent around a 12px body default.
- Keep the body rule using `font-family: var(--font-sans, ui-sans-serif, system-ui, sans-serif)` and `font-size: var(--font-size-base)`.

App-level globals should not drift from the shared contract:

- `frontend/apps/web/src/app/globals.css` should keep importing shared globals and override only if necessary.
- `frontend/apps/admin/src/app/globals.css` should keep importing shared globals and override only if necessary.
- `frontend/apps/research/src/app/globals.css` should be aligned with the shared typography values.
- `frontend/apps/library/src/app/globals.css` should be aligned with the shared typography values.

If collapsing duplicated `research` and `library` globals into the shared import is low-risk, prefer that. If their local color/theme tokens still differ materially, keep local files but update their typography variables to match the shared standard.

## Components

No broad component rewrite is planned.

Existing Tailwind typography classes should keep working:

- `font-sans` resolves to Arial through `--font-sans`.
- `font-[family-name:var(--font-display)]` resolves to Arial through `--font-display`.
- `text-base` resolves to the 12px body/default size through `--font-size-base`.
- `text-sm`, `text-xs`, headings, and explicit `text-[...]` utilities remain intentional local choices.

This avoids a large risky pass over hundreds of components while still changing the site-wide defaults and display font behavior.

## Data Flow

Typography values flow from CSS variables into Tailwind utilities and global element styles:

1. App `globals.css` loads shared or local theme variables.
2. Tailwind `fontFamily.sans` points to `var(--font-sans)`.
3. The global `body` rule applies `var(--font-sans)` and `var(--font-size-base)`.
4. Headline classes using `var(--font-display)` resolve to the same Arial stack.

## Error Handling And Compatibility

Arial may not be installed on every operating system. The fallback stack handles that explicitly:

- Use Arial when available.
- Use Helvetica when Arial is unavailable.
- Use the platform sans-serif as a final fallback.

No runtime error handling is required because CSS font fallback is browser-native.

## Testing

Verification should cover:

- Static search confirming no app still maps `--font-sans` to Inter or `--font-display` to Playfair Display.
- Static search confirming `--font-size-base` is standardized to `0.75rem` where defined.
- Lint/typecheck checks for the affected frontend workspace.
- A quick browser or screenshot check of at least one public page and one admin page to catch obvious text overflow or layout regressions caused by the smaller default size.

## Out Of Scope

- Replacing every explicit `text-sm`, `text-base`, `text-lg`, or `text-[...]` class.
- Redesigning page hierarchy or spacing.
- Loading Arial as a webfont.
- Changing brand colors, layout, or content.
