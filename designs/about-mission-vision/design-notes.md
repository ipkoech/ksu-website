# About Mission & Vision Design Notes

Status: Implemented / canonical for `/about/mission-vision`

## Route Status

- `/about/mission-vision` is now a canonical public About page.
- The route no longer redirects to `/about`.
- `/about` remains the canonical About overview route.
- The former `designs/about-mission-vission` folder typo has been corrected to `designs/about-mission-vision`.

## Design-First Iteration

The May 19 pass used `imagegen` before implementation:

1. First generated reference explored a full Mission & Vision page direction but introduced shell/content drift.
2. Second generated reference tightened route status, shell rules, full-width sections, and product truthfulness constraints.
3. Implementation used the second reference structurally while rejecting unsupported generated shell details, fake contact values, fake claims, and alternate branding.

## Latest Redesign Pass

The implemented page follows the same full-width principles used by `/about` and `/about/history`:

1. Hero and orientation: breadcrumb, About navigation, source anchors, CTAs, institutional direction note, and related pages.
2. Mission and Vision feature: differentiated panels with exact source-backed statements.
3. Philosophy: full-width section with the exact philosophy statement and three derived concept pillars.
4. Core values: high-contrast panel using Transformative Thinking, Respect, Inclusivity, and Fairness.
5. Mandate in practice: grounded cards for training and learning, knowledge and research, student experience, and community engagement.
6. Continue through About: route cards for About Overview, History, Governance & Leadership, University Management, Administrative Division, and Our Service Charter.

All page sections follow full-width composition rather than a narrow centered max-width canvas.

## Files Updated

- `frontend/apps/web/src/app/about/mission-vision/page.tsx`
- `frontend/apps/web/src/lib/about-data.ts`
- `frontend/apps/web/src/app/about/about-overview-content.tsx`
- `designs/manifest.md`
- `designs/about-mission-vision/design-notes.md`

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
- `officialMission`
- `officialVision`
- `officialPhilosophy`
- `coreValues`
- `quickNavigation`

No new API, database model, admin state, or transactional workflow was added.

## Product Truthfulness Constraints

Future revisions should continue to avoid unsupported rankings, fake enrollment counts, fake testimonials, fake certifications, fake partner logos, fake downloadable documents, fake admissions deadlines, fake maps, fake application states, alternate crests, alternate slogans, and page-specific header/footer structures.

## Imagegen Use

The built-in `imagegen` tool was used twice before implementation. The latest generated reference remained in Codex's generated image cache and was not saved as a final production asset:

- `/home/egric/.codex/generated_images/019e3d41-b15b-7403-983f-b2184e670309/ig_08e9fecb718e89f9016a0ba64a53a0819da1b5c6144600a26c.png`

The generated reference was used structurally only. Unsupported generated details were rejected.

## Verification

Passed:

- `pnpm --filter @ksu/web typecheck`
- `git diff --check` for touched Mission & Vision files
- `/about/mission-vision` returns `200` and remains on `/about/mission-vision`
- Playwright desktop render for `/about/mission-vision`
- Playwright mobile render for `/about/mission-vision`
- no horizontal overflow on desktop or mobile
- six page sections rendered inside `main`
- full-width section verification on desktop and mobile
- exact mission, vision, philosophy, and core value content rendered
- public-facing copy does not include internal guardrail phrasing

Latest verification screenshots:

- `/tmp/ksu-about-mission-vision-desktop-v2.png`
- `/tmp/ksu-about-mission-vision-mobile-v2.png`
