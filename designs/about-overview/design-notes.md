# About Overview Design Notes

Status: Implemented / canonical for `/about`

## Route Status

- `/about` is the canonical About overview route.
- `/about/overview` redirects to `/about`.
- `designs/about-overview` is valid only as the canonical `/about` design target, not as a standalone `/about/overview` page.

## Latest Redesign Pass

The May 19 section-by-section pass rebuilt the page as a full overview rather than a hero-only treatment:

1. Hero and orientation: breadcrumb, About route navigation, vision-led overview, primary/secondary CTAs, sourced facts, related pages, and institutional focus.
2. Story and timeline: dated milestone cards for 1965, 1983, 1994, 1999, 2007, and 2013.
3. Institutional mandate: separate mission, vision, and philosophy panels.
4. Core values: deep contrast panel using the four published values.
5. Explore pathways: route cards for Governance & Leadership, University Management, Administrative Division, and Our Service Charter.

The latest layout revision removes page-level centered max-width constraints from the About content so each section composition spans the full available viewport width.

## Files Updated

- `frontend/apps/web/src/app/about/about-overview-content.tsx`
- `frontend/apps/web/src/app/about/page.tsx`
- `frontend/apps/web/src/app/about/overview/page.tsx`
- `designs/manifest.md`
- `designs/about-overview/design-notes.md`

Related tooling updates from verification:

- `frontend/apps/web/package.json`
- `frontend/pnpm-lock.yaml`

## Frontend Constraints

The implementation keeps the real public shell from `PageShell`:

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
- `officialMission`
- `officialVision`
- `officialPhilosophy`
- `historyTimeline`
- `coreValues`
- `quickNavigation`

No API, database, route, admin state, or transactional workflow was added.

## Product Truthfulness Constraints

Future revisions should continue to avoid unsupported rankings, fake enrollment counts, fake testimonials, fake certifications, fake partner logos, fake downloadable documents, fake admissions deadlines, fake application states, alternate crests, alternate slogans, and page-specific header/footer structures.

## Imagegen Use

The built-in `imagegen` tool was used for a fresh full-page UI reference before implementation. The latest generated reference remained in Codex's generated image cache and was not saved as a final production asset:

- `/home/egric/.codex/generated_images/019e3d41-b15b-7403-983f-b2184e670309/ig_08e9fecb718e89f9016a0ba0c7663c819dbc2d6f7f1f1cbe2d.png`

The generated reference was used structurally only. Unsupported generated details were rejected.

## Verification

Passed:

- `pnpm --filter @ksu/web typecheck`
- Playwright desktop render for `/about`
- Playwright mobile render for `/about`
- no horizontal overflow on desktop or mobile
- five page sections rendered inside `main`
- full-width section verification on desktop and mobile
- `/about/overview` resolves to `/about`

Latest verification screenshots:

- `/tmp/ksu-about-desktop-full-width.png`
- `/tmp/ksu-about-mobile-full-width.png`

No backend implementation, route architecture change, database change, or public shell rewrite was performed in this pass.
