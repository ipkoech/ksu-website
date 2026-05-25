# About Governance Design Notes

Status: Implemented / canonical for `/about/governance`

## Route Status

- `/about/governance` is now a canonical public About page.
- The route no longer redirects to `/about/governance-leadership`.
- `/about/governance/[slug]` remains canonical for board detail pages.
- `/about/governance-leadership` remains available as a combined governance and leadership page.

## Design-First Iteration

The May 19 pass used `imagegen` before implementation:

1. First generated reference explored the governance page structure but introduced shell and content drift.
2. Second generated reference tightened route status, public-shell constraints, source-backed governance bodies, and product truthfulness constraints.
3. Implementation used the second reference structurally while rejecting unsupported generated shell details, fake certificates, fake meeting dates, fake downloads, fake contact values, fake committees, and alternate branding.

## Latest Redesign Pass

The implemented page follows the same full-width principles used by the other About pages:

1. Hero and orientation: breadcrumb, About navigation, governance summary, CTAs, governance anchors, and related pages.
2. Governance structure: University Council at the top, with Senate and Management Board presented as distinct public functions.
3. University Council focus: high-contrast panel using the public council description and mandate, with a link to `/about/governance/university-council`.
4. Governance bodies: board overview cards for published public boards.
5. Council members: public member grid using names and roles from the existing fallback/API data.
6. Continue through About: route cards for About Overview, History, Mission & Vision, Governance & Leadership, University Management, Administrative Division, and Our Service Charter.

All page sections follow full-width composition rather than a narrow centered max-width canvas.

## Files Updated

- `frontend/apps/web/src/app/about/governance/page.tsx`
- `frontend/apps/web/src/lib/about-data.ts`
- `frontend/apps/web/src/app/about/about-overview-content.tsx`
- `designs/manifest.md`
- `designs/about-governance/design-notes.md`

## Frontend Constraints

The page keeps the real public shell from `PageShell`:

- `Announcements`
- `MiniHeader`
- `PublicHeader`
- page content
- `PublicFooter`

It preserves the frontend-owned logo, header, navigation, mini-header search placement, footer structure, route behavior, color tokens, typography, spacing, border radius, shadows, and card language.

## Backend And Data Constraints

The page uses existing About governance data and fallbacks:

- `getGovernanceData()`
- `governanceFallback`
- `BoardMemberGrid`
- `quickNavigation`

No new API, database model, admin state, voting state, meeting scheduler, or transactional workflow was added.

## Product Truthfulness Constraints

Future revisions should continue to avoid unsupported rankings, fake certifications, fake committee lists, fake meeting dates, fake dashboards, fake downloads, fake live votes, fake admin controls, fake phone numbers, fake photos, fake portraits, fake testimonials, fake metrics, unsupported legal claims, alternate crests, alternate slogans, and page-specific header/footer structures.

## Imagegen Use

The built-in `imagegen` tool was used twice before implementation. The latest generated reference remained in Codex's generated image cache and was not saved as a final production asset:

- `/home/egric/.codex/generated_images/019e3d41-b15b-7403-983f-b2184e670309/ig_08e9fecb718e89f9016a0ba8c83668819d8ce1c78a07ef6c1e.png`

The generated reference was used structurally only. Unsupported generated details were rejected.

## Verification

Passed:

- `pnpm --filter @ksu/web typecheck`
- `git diff --check` for touched Governance files
- `/about/governance` returns `200` and remains on `/about/governance`
- Playwright desktop render for `/about/governance`
- Playwright mobile render for `/about/governance`
- no horizontal overflow on desktop or mobile
- six page sections rendered inside `main`
- full-width section verification on desktop and mobile
- University Council, Senate, and Management Board render
- public council member names render
- public-facing copy does not include internal guardrail phrasing

Latest verification screenshots:

- `/tmp/ksu-about-governance-desktop-v2.png`
- `/tmp/ksu-about-governance-mobile-v2.png`
