# About Leadership Design Notes

## Status

- Route: `/about/leadership`
- Current status: Canonical standalone leadership listing
- Implementation source: `frontend/apps/web/src/app/about/leadership/page.tsx`
- Final desktop asset: `about-leadership-desktop-final.png`
- Final mobile asset: `about-leadership-mobile-final.png`
- Visual generation: `imagegen` was used for design iteration before implementation.
- Final asset source: verified browser captures of the implemented page, saved to preserve exact frontend shell fidelity.

## Product Audit Summary

The page presents Kisii University's public leadership structure without duplicating the governance page. It focuses on the Vice Chancellor, deputy vice chancellors, registrars, finance leadership, and school-level leadership records available from the current public data model.

The route previously redirected to `/about/governance-leadership`. The redesign restores `/about/leadership` as a standalone route while keeping `/about/governance-leadership` available as a combined context page and `/about/leadership/[slug]` as the profile route.

## Frontend Constraints

- Uses the real `PageShell` public sequence: `Announcements`, `MiniHeader`, `PublicHeader`, page content, and `PublicFooter`.
- Uses existing public navigation and footer behavior.
- Uses existing token patterns: primary blue, secondary orange, slate text, pale blue-gray bands, white cards, rounded `1.5rem` to `2rem` surfaces, and restrained shadows.
- Uses Playfair-style display headings and sans-serif body/UI text.
- Uses full-width page sections with internal responsive grids.
- Uses `LeaderCard` for leadership records and initials placeholders when no portrait is available.

## Backend And Data Constraints

- Leadership content comes from `getLeadershipData()` and `leadershipFallback` in `frontend/apps/web/src/lib/about-data.ts`.
- School leadership records are populated from school dean data when available; otherwise the page shows the source-backed school leadership placeholder.
- Profile links use `/about/leadership/[slug]`.
- No backend, database, or API changes were made.

## Page Structure

1. Full-width hero with breadcrumb, About navigation, leadership purpose, and primary actions.
2. Office of the Vice Chancellor feature with Prof. Dr. Nathan Oyori Ogechi and profile navigation.
3. Leadership structure cards separating executive, deputy, registrar/finance, and school records.
4. Deputy Vice Chancellors section.
5. Registrars and Finance section.
6. School Leadership Records source-backed state.
7. Continue Through About route cards.
8. Existing public footer.

## Product Truthfulness Constraints

Avoid fake leader photos, fake phone numbers, fake emails in page content, fake rankings, testimonials, certifications, dashboards, online workflows, unsupported application states, invented dean names, and governance member rosters on this leadership-focused page.

## Imagegen Iteration

`imagegen` was used to create a three-direction design board and a refined leadership-focused direction. Generated outputs with shell drift or invented claims were rejected. The final saved assets are browser screenshots from the implemented page so the logo, header, footer, typography, and route behavior match the actual frontend.

## Verification

Verified on May 19, 2026:

- `/about/leadership` returns `200` with no redirect.
- Desktop and mobile render the full leadership page.
- All seven main sections are full-width.
- No horizontal overflow on 1536px desktop or 390px mobile.
- Source-backed leader names render.
- Forbidden unsupported claims such as ISO/rankings/testimonials/dashboards are absent.
- TypeScript check passes with `pnpm --filter @ksu/web typecheck`.
