# About Quality Assurance Design Notes

## Status

- Route: `/about/quality-assurance`
- Current status: Canonical standalone quality assurance page
- Implementation source: `frontend/apps/web/src/app/about/quality-assurance/page.tsx`
- Final desktop asset: `about-quality-assurance-desktop-final.png`
- Final mobile asset: `about-quality-assurance-mobile-final.png`
- Visual generation: `imagegen` was used for design iteration before implementation.
- Final asset source: verified browser captures of the implemented page, saved to preserve exact frontend shell fidelity.

## Product Audit Summary

The page is a public informational reference for quality, standards, and service accountability. It uses current About data for charter/CUE context, strategic plan priorities, QMS planning language, the public service charter, governance links, and administrative accountability pathways.

The route previously redirected to `/about`. The redesign restores `/about/quality-assurance` as a standalone route while keeping the page source-backed and non-transactional.

## Frontend Constraints

- Uses the real `PageShell` public sequence: `Announcements`, `MiniHeader`, `PublicHeader`, page content, and `PublicFooter`.
- Uses existing public navigation and footer behavior.
- Uses frontend tokens: primary blue, secondary orange, slate text, pale blue-gray bands, white cards, rounded `1.5rem` to `2rem` surfaces, and restrained shadows.
- Uses Playfair-style display headings and sans-serif body/UI text.
- Uses full-width page sections with internal responsive grids.

## Backend And Data Constraints

- Quality references come from `accreditations`, `strategicPlanHighlights`, `strategicDocuments`, `officialMission`, and `serviceCharterUrl` in `frontend/apps/web/src/lib/about-data.ts`.
- There is no dedicated Quality Assurance API in this implementation.
- Programme accreditation is framed as programme-record data for future programme pages, not as an institutional dashboard.
- No backend, database, or API changes were made.

## Page Structure

1. Full-width hero with breadcrumb, About navigation, page scope, and primary actions.
2. Quality framework cards for charter/CUE context, strategic plan priorities, service accountability, and governance/administration.
3. Official reference cards for CUE, QMS, and Service Charter.
4. Strategic plan priority cards.
5. Public accountability path linking Mission & Vision, Governance, Administrative Division, and Service Charter.
6. Programme records boundary note.
7. Continue Through About route cards.
8. Existing public footer.

## Product Truthfulness Constraints

Avoid ISO claims, rankings, testimonials, live audit scores, unsupported credentials, fake metrics, certificate-download language, fake dashboards, fake online workflows, fake phone numbers, fake emails, alternate crests, alternate slogans, and page-specific footer groups.

## Imagegen Iteration

`imagegen` was used to create a three-direction design board and a refined modern polished direction. Generated outputs were used as design direction only. The final saved assets are browser screenshots from the implemented page so the logo, header, footer, typography, and route behavior match the actual frontend.

## Verification

Verified on May 19, 2026:

- `/about/quality-assurance` returns `200` with no redirect.
- Desktop and mobile render the full quality assurance page.
- All seven main sections are full-width.
- No horizontal overflow on 1536px desktop or 390px mobile.
- Source-backed CUE, QMS, Service Charter, strategic plan, and programme-record content renders.
- Unsupported ISO, ranking, testimonial, dashboard, certificate, and live-audit-score language is absent.
- TypeScript check passes with `pnpm --filter @ksu/web typecheck`.
