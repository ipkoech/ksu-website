# Frontend Typography Standard Design

## Context

The repository has four frontend apps: `web`, `admin`, `research`, and `library`.
The current typography is not fully standardized:

- `web` and `admin` import shared UI globals from `@ksu/ui`.
- `research` and `library` duplicate theme globals locally.
- Public-facing pages use `--font-display` for headings, currently mapped to Playfair Display in several apps.
- Body text uses `--font-sans`, currently mapped to Inter/system sans stacks.

The goal is to standardize all frontend apps on Bookman Old Style for normal text, with a 12pt body/default text size, compact support text at 10pt and 11pt where appropriate, and a restrained heading scale that tops out at 24pt.

## Decision

Use a single typography contract across all frontends:

- Body/default font: `"Bookman Old Style", Georgia, serif`.
- Display/headline font: `"Bookman Old Style", Georgia, serif`.
- Body/default font size: `12pt`, represented as `--font-size-base: 12pt`.
- Keep existing Tailwind `font-sans` and `font-mono` mappings, but make `font-sans` resolve to the standardized `--font-sans` value.
- Keep compact support text tokens for captions, labels, badges, and metadata.
- Keep scaled heading and utility tokens, but cap the standard typography scale at 24pt.

The fallback stack keeps Bookman Old Style as the first-choice font while giving the browser explicit substitutions when Bookman Old Style is unavailable on a client system.

## Architecture

The shared UI package should be the primary typography source:

- Update `frontend/packages/ui/src/globals.css` to define the canonical sans and display stacks.
- Update `--font-size-base` in the shared scale to `12pt`.
- Update related size tokens so the scale supports compact 10pt and 11pt text, keeps body text at 12pt, and caps headings at 24pt.
- Keep the body rule using `font-family: var(--font-sans, "Bookman Old Style", Georgia, serif)` and `font-size: var(--font-size-base)`.

The standard size token scale should be:

| Token | Size | Use |
| --- | ---: | --- |
| `xs` | 10pt | Fine print, badges, dense metadata, table support text |
| `sm` | 11pt | Captions, labels, helper text, compact secondary controls |
| `base` | 12pt | Body/default text and normal paragraphs |
| `lg` | 14pt | Primary buttons, strong labels, small subheadings |
| `xl` | 16pt | Card titles and local section titles |
| `2xl` | 18pt | Subsection headings |
| `3xl` | 20pt | Section headings |
| `4xl` | 22pt | Page headings |
| `5xl` | 24pt | Alias to maximum standard size for compatibility |
| `6xl` | 24pt | Alias to maximum standard size for compatibility |

The standard semantic content and heading progression is `12pt`, `14pt`, `16pt`, `18pt`, `20pt`, `22pt`, `24pt`. The `10pt` and `11pt` values are reserved for supporting UI text such as captions, labels, badges, dense metadata, and helper text.

App-level globals should not drift from the shared contract:

- `frontend/apps/web/src/app/globals.css` should keep importing shared globals and override only if necessary.
- `frontend/apps/admin/src/app/globals.css` should keep importing shared globals and override only if necessary.
- `frontend/apps/research/src/app/globals.css` should be aligned with the shared typography values.
- `frontend/apps/library/src/app/globals.css` should be aligned with the shared typography values.

If collapsing duplicated `research` and `library` globals into the shared import is low-risk, prefer that. If their local color/theme tokens still differ materially, keep local files but update their typography variables to match the shared standard.

## Components

No broad component rewrite is planned.

Existing Tailwind typography classes should keep working:

- `font-sans` resolves to Bookman Old Style through `--font-sans`.
- `font-[family-name:var(--font-display)]` resolves to Bookman Old Style through `--font-display`.
- `text-base` resolves to the 12pt body/default size through `--font-size-base`.
- Standard Tailwind size utilities resolve within the 10pt to 24pt range.
- Explicit `text-[...]` utilities remain intentional local choices, but should be reviewed when they exceed 24pt.

This avoids a large risky pass over hundreds of components while still changing the site-wide defaults, display font behavior, and standard heading ceiling.

## Data Flow

Typography values flow from CSS variables into Tailwind utilities and global element styles:

1. App `globals.css` loads shared or local theme variables.
2. Tailwind `fontFamily.sans` points to `var(--font-sans)`.
3. The global `body` rule applies `var(--font-sans)` and `var(--font-size-base)`.
4. Headline classes using `var(--font-display)` resolve to the same Bookman Old Style stack.

## Error Handling And Compatibility

Bookman Old Style may not be installed on every operating system. The fallback stack handles that explicitly:

- Use Bookman Old Style when available.
- Use Georgia when Bookman Old Style is unavailable.
- Use the platform serif as a final fallback.

No runtime error handling is required because CSS font fallback is browser-native.

## Testing

Verification should cover:

- Static search confirming no app still maps `--font-sans` to Inter or `--font-display` to Playfair Display.
- Static search confirming `--font-size-base` is standardized to `12pt` where defined.
- Static search or visual review for standard tokens exceeding the 24pt maximum.
- Lint/typecheck checks for the affected frontend workspace.
- A quick browser or screenshot check of at least one public page and one admin page to catch obvious text overflow or layout regressions caused by the point-based default size.

## Out Of Scope

- Replacing every explicit `text-sm`, `text-base`, `text-lg`, or `text-[...]` class.
- Eliminating one-off oversized text where a page deliberately uses explicit arbitrary values; those should be reviewed separately.
- Redesigning page hierarchy or spacing.
- Loading Bookman Old Style as a webfont.
- Changing brand colors, layout, or content.
