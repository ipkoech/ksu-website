# About History Design Notes

Status: Implemented / canonical for `/about/history`

## Route Status

- `/about/history` is now a canonical public About page.
- The route no longer redirects to `/about`.
- `/about` remains the canonical About overview route.

## Latest Redesign Pass

The May 19 pass implements the History page with the same design principles used for the redesigned About overview:

1. Hero and orientation: breadcrumb, About navigation, source-backed history summary, primary/secondary actions, historical anchor facts, and related page rail.
2. Timeline journey: full-width guided milestone layout for 1965, 1983, 1994, 1999, 2007, and 2013.
3. Era synthesis: Foundations, Campus Growth, and Chartered University phase cards.
4. Charter and public mandate: high-contrast panel for the February 6, 2013 charter, Legal Notice No. 225, and Universities Act 2012.
5. Continue through About: route cards for About Overview, Governance & Leadership, University Management, Administrative Division, and Our Service Charter.

All page sections follow full-width composition rather than a narrow centered max-width canvas.

## Files Updated

- `frontend/apps/web/src/app/about/history/page.tsx`
- `frontend/apps/web/src/lib/about-data.ts`
- `frontend/apps/web/src/app/about/about-overview-content.tsx`
- `designs/manifest.md`
- `designs/about-history/design-notes.md`

## Frontend Constraints

The page keeps the real public shell from `PageShell`:

- `Announcements`
- `MiniHeader`
- `PublicHeader`
- page content
- `PublicFooter`

It preserves the frontend-owned logo, header, navigation, mini-header search placement, footer structure, route behavior, color tokens, typography, spacing, border radius, shadows, and card language.

## Backend And Data Constraints

The page uses existing About data and fallbacks:

- `getOverviewData()`
- `aboutIntro`
- `historyTimeline`
- `quickNavigation`

No new API, database model, admin state, or transactional workflow was added.

## Product Truthfulness Constraints

Future revisions should continue to avoid unsupported rankings, fake enrollment counts, fake testimonials, fake certifications, fake partner logos, fake downloadable archives, fake admissions deadlines, fake maps, fake application states, alternate crests, alternate slogans, and page-specific header/footer structures.

## Imagegen Use

The built-in `imagegen` tool was used for a fresh full-page UI reference before implementation. The latest generated reference remained in Codex's generated image cache and was not saved as a final production asset:

- `/home/egric/.codex/generated_images/019e3d41-b15b-7403-983f-b2184e670309/ig_08e9fecb718e89f9016a0ba3c06f00819da94ec6c34b2fa2ba.png`

The generated reference was used structurally only. Unsupported generated details were rejected.

## Verification

Passed:

- `pnpm --filter @ksu/web typecheck`
- `git diff --check` for the touched About History files
- `/about/history` returns `200` and remains on `/about/history`
- Playwright desktop render for `/about/history`
- Playwright mobile render for `/about/history`
- no horizontal overflow on desktop or mobile
- five page sections rendered inside `main`
- full-width section verification on desktop and mobile
- all six timeline years render: 1965, 1983, 1994, 1999, 2007, and 2013

Latest verification screenshots:

- `/tmp/ksu-about-history-desktop.png`
- `/tmp/ksu-about-history-mobile.png`
