# School Detail Overview Design Notes

## Status

- Page name: school detail overview
- Intended canonical route: `/academics/schools/[slug]`
- Requested output folder: `designs/school-detail-overview`
- Manifest route mapping: `/academics/schools/[slug]` maps to `designs/academics-school-detail`
- Route status: Canonical
- Final visual assets allowed: Yes
- Visual generation used: Yes, via the `imagegen` skill for three internal directions
- Implementation performed: No

The prompt included placeholder redirect text for `[page name]`, but the repository audit found the real target route in `designs/manifest.md` as canonical. The design therefore proceeds as a valid production design target.

## Files Saved

- `designs/school-detail-overview/school-detail-overview-desktop-final.png`
- `designs/school-detail-overview/school-detail-overview-mobile-final.png`
- `designs/school-detail-overview/design-notes.md`

## Product Audit

Kisii University public pages use a source-bounded public website shell. School detail pages are academic mini-site states under the shared academics catch-all route.

The school detail overview should help prospective students, current students, staff, and public visitors understand a specific school quickly, then continue to departments, programmes, team, news, downloads, and contact information.

The current frontend route is:

- `frontend/apps/web/src/app/academics/[[...segments]]/page.tsx`

The page currently composes:

- `PublicSectionPage`
- `getAcademicsPage(segments)`
- `getAcademicsEntityHeader(segments)`
- `EntityHeader` when the route is a school or department detail state

The current visual contract requires the route shell sequence:

1. `Announcements`
2. `MiniHeader`
3. `EntityHeader` for school detail routes
4. page content
5. `PublicFooter`

## Frontend Constraints

The design follows:

- Real logo asset: `/logos/ksu-logo.png`
- Contextual school header instead of the public header
- School header tabs: About, Departments, Team, Publications when available, News, Downloads, Clubs when available, Contact
- Primary brand blue: `#3B82F6`
- Secondary orange: `#F97316`
- Slate/white page surfaces
- Inter-style UI text and Playfair-style display headings
- Frontend-like rounded cards, borders, shadows, and responsive grids

The design does not introduce:

- alternate crest or logo treatment
- fake school rankings
- fake accreditation claims
- fake metrics
- fake deadlines
- fake dean names
- fake phone numbers
- unsupported dashboards or application workflows

## Backend And Data Constraints

Relevant source fields currently visible in the repo:

- `School.name`
- `School.code`
- `School.slug`
- `School.dean_id`
- `School.dean_name`
- `School.dean_email`
- `School.description`
- `School.about`
- `School.mission`
- `School.vision`
- `School.phone`
- `School.email`
- `School.website`
- `School.address`
- `School.cover_image_id`
- `School.departments_count`

Relevant leadership helper:

- `getDean(schoolId)` can return dean name, title, message, slug, and `photo_url` through the public leadership API.

Missing or unpublished values should render as neutral empty states or be hidden. The final mockup uses source-field placeholders rather than invented values.

## Recommended Page Structure

Desktop:

1. Announcement and mini header
2. School `EntityHeader`
3. Breadcrumb
4. Two-column overview layout:
   - Main content area
   - Right rail with quick links first, then contact/source information
5. Main content:
   - School overview title and short source-bounded introduction
   - compact school record summary
   - dean message block with dean profile image placeholder
   - about school
   - mission, vision, mandate cards
6. Public footer

Mobile:

1. Announcement
2. Compact `EntityHeader`
3. Main school overview card
4. Dean message card
5. About, mission, vision, mandate stack
6. Quick links grid
7. Contact/source info
8. Footer accordion-style stack

## Imagegen Directions

Three internal directions were generated using `imagegen`:

- Conservative: accurate but too close to the current generic section-card pattern.
- Modern polished: strongest balance of compact layout, school storytelling, and frontend feasibility.
- Bold/experimental: visually interesting but risked feeling less like the current public component system.

Final selected direction: Modern polished.

The saved final assets were produced from a scratch static mockup after direction selection so the final files could use the real KSU logo, exact frontend-like shell structure, and readable source-bounded text.

## Self-Evaluation

| Category | Desktop | Mobile |
| --- | ---: | ---: |
| Product accuracy | 5 | 5 |
| Page purpose and user goal | 5 | 5 |
| Action hierarchy | 5 | 4 |
| Visual hierarchy | 5 | 5 |
| Brand consistency | 5 | 5 |
| Product storytelling and clarity | 5 | 5 |
| Trust, confidence, and usability | 5 | 5 |
| Responsiveness | 5 | 5 |
| Accessibility | 5 | 4 |
| Image quality | 4 | 4 |
| Feasibility for future implementation | 5 | 5 |

No critical failure conditions were found in the saved final direction.

## Future Implementation Notes

Recommended future frontend work, if implemented later:

- Add a dedicated school overview component instead of using only generic `PublicSectionPage` cards.
- Fetch the full school record with about, mission, vision, contact fields, and `departments_count`.
- Fetch dean profile data through `getDean(school.id)`.
- Replace the placeholder dean image block with `dean.image` when available.
- Hide contact rows when their source fields are empty.
- Hide Publications and Clubs navigation when source records do not exist, consistent with `EntityHeader`.
- Keep quick links in the right rail on desktop and below main content on mobile.
- Keep the dean message as the first primary content block after the overview title.

No frontend code, backend code, route files, APIs, production assets, configs, or stylesheets were modified for this design task.
