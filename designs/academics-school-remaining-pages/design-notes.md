# Academics School Remaining Pages

## Status

- Route family: `/academics/schools/[slug]/*`
- Frontend status: canonical through `frontend/apps/web/src/app/academics/[[...segments]]/page.tsx`
- Final visual assets allowed: yes
- Implementation performed: no
- `imagegen` used: yes, built-in image generation

## Pages Covered

These design boards cover the remaining school mini-site states after the overview page:

- Team
- Programmes
- Publications
- News
- Downloads
- Clubs
- Contact

The school Departments item is not designed as a standalone index page. It remains a contextual `EntityHeader` dropdown whose entries link to department detail routes.

## Frontend Constraints

- Use the public shell sequence from `PageShell`: announcements, mini header, contextual school `EntityHeader`, page content, public footer.
- Keep the school header uniform with the implemented `EntityHeader`.
- Use the real `/logos/ksu-logo.png` crest and existing KSU brand lockup.
- Keep the school nav order: About, Departments dropdown, Team, Publications when available, News, Downloads, Clubs when available, Contact.
- Use frontend tokens, white cards, slate text, primary blue, secondary orange, subtle borders, and compact source-backed cards.
- Avoid invented names, phone numbers, dates, metrics, rankings, testimonials, and unsupported online workflows.

## Design Direction

The boards establish a compact, full-width school page system:

- Left rail: quick links and source notices on desktop.
- Main column: section-specific records, filters, empty states, and source-backed content areas.
- Right rail: contact, source, and school metadata where useful.
- Mobile: compact school header, single-column content, small filter controls, icon cards, and short source-backed empty states.

## Implementation Notes For Future Work

- Reuse the existing school detail data patterns and `EntityHeader`.
- Use included backend relationships where available, especially school departments.
- Hide Publications and Clubs when backend records are unavailable.
- Keep empty states explicit and source-backed.
- Avoid adding a `/academics/schools/[slug]/departments` index page unless the route decision changes.

## Assets

- `academics-school-remaining-pages-desktop-board.png`
- `academics-school-remaining-pages-mobile-board.png`
