# Main/Web Institutional Design Standard

This document defines the design standard for the main public website in
`frontend/apps/web`. It is the Phase 1 reference for repositioning the site as a
higher learning institution platform while preserving the current public theme,
typography, spacing rhythm, imagery discipline, and component language.

## Design Position

The main public website should feel like an official university service and
academic discovery platform.

It should not feel like a generic marketing site, a dashboard, or a collection of
unrelated public pages. The standard is:

> Institutional, academic, service-oriented, image-supported, backend-backed, and
> easy to scan.

Every major page should help at least one of these audiences move forward:

- Prospective students comparing programmes and admissions steps.
- Current students looking for services, dates, forms, offices, and support.
- Staff and faculty looking for institutional records, offices, and people.
- Parents, partners, alumni, and public stakeholders checking official
  information.
- Visitors looking for contacts, governance, news, tenders, events, and public
  accountability.

## Current Main/Web Language To Preserve

The existing implementation already has a strong institutional base. New work
should extend these patterns rather than replace them.

### Layout

- Use full-width page bands with constrained inner content.
- The common wide container should remain close to the current `max-w-[1440px]`
  language.
- Prefer asymmetric institutional grids over centered brochure layouts.
- Use three-column thinking for cards, facts, pathways, and grouped services.
- Detail pages should use a clear content/sidebar or content/relationship
  structure on desktop and collapse cleanly on mobile.
- Every grid column that can hold dynamic content should use `minmax(0, 1fr)` or
  `min-w-0` where needed to prevent mobile overflow.

### Typography

- Major page and section headings should use the display font already used in
  main/web: `var(--font-display)`.
- Body copy should remain plain, public-facing, and service-oriented.
- Use short eyebrow labels to establish institutional context.
- Keep headings specific: "Undergraduate programmes" is stronger than "Explore".
- Avoid backend terms in public copy. Use public language such as "programmes",
  "offices", "downloads", "deadlines", "contacts", and "related information".

### Color

- Keep the existing institutional palette:
  - `primary` for university identity and key navigation.
  - `secondary` for emphasis and primary action moments.
  - slate neutrals for text and borders.
  - white and pale blue/slate section backgrounds.
- Color should communicate hierarchy and state, not decoration.
- Avoid introducing a new dominant palette for individual sections unless it is a
  restrained accent inside the existing theme.

### Imagery

- Images should represent real institutional context: campus, students,
  teaching, laboratories, offices, ceremonies, student life, facilities, and
  service points.
- Use imagery as content, not generic decoration.
- Homepage and high-value landing pages may use immersive image-led sections.
- Inner pages should use framed or contextual imagery where it helps explain the
  page.
- Use the existing image components and optimized Next image paths. For
  art-directed images, use the reusable `ArtDirectedImage` component.

### Cards And Surfaces

- Cards are for real repeated objects: programmes, schools, offices, people,
  news, events, downloads, services, and relationship links.
- Default card language:
  - white background
  - slate border
  - subtle shadow
  - small radius
  - hover border/shadow state
  - compact but readable spacing
- Do not wrap page sections in decorative cards.
- Avoid card-inside-card layouts.

### Motion

- Motion should support progressive reveal, hover affordance, or state change.
- Avoid heavy animation on official information pages.
- Scroll reveal is acceptable when it does not hide critical information from
  users or harm mobile readability.

## Page Archetypes

### 1. Homepage

Purpose: present Kisii University as an academic institution and route visitors
quickly into the most important journeys.

Required structure:

1. Full-width image-led hero with clear institutional positioning.
2. High-priority action strip:
   - Apply
   - Programmes
   - Admissions guide
   - Student portal or services
   - Contact
3. Academic discovery:
   - schools
   - programme categories
   - featured programmes
4. Admissions pathway.
5. Research, innovation, and community preview.
6. Campus life preview.
7. News, events, and announcements.
8. Institutional stats or trust signals.
9. Footer with service routes and official links.

Homepage sections should keep the existing wide, image-supported, three-column
rhythm.

### 2. Landing Pages

Examples: `/academics`, `/admissions`, `/campus-life`, `/administration`,
`/about`.

Purpose: introduce a major institutional area and route users into sub-journeys.

Required pattern:

- Compact but authoritative hero or title band.
- Short public-facing explanation.
- Primary pathway cards.
- Key facts or service signals.
- Related content from backend-backed records where available.
- Clear next actions.

Landing pages should not become long text pages. They should act as structured
directories with context.

### 3. List Pages

Examples: programmes, schools, staff directories, news, events, downloads,
announcements.

Purpose: help users find a record quickly and understand what each record means.

Required pattern:

- Page title and short context.
- Search where records can grow beyond a small list.
- Module-specific filters.
- Sort options where useful.
- Backend-backed result count.
- Consistent card/list rows.
- Empty state that explains what is missing without inventing content.

Important filters by module:

- Programmes: level, school, department, mode, campus, intake, status.
- News/events/announcements: category, date, unit, audience, status.
- Downloads: category, office/unit, file type, audience.
- Staff/people: school, department, office, role, expertise.
- Campus life: type, location, status, audience.

### 4. Detail Pages

Examples: programme detail, school detail, department detail, office detail,
person profile, news article, event detail.

Purpose: present one official record with relationships and next actions.

Required pattern:

- Breadcrumbs.
- Clear title and summary.
- Fact grid for scannable metadata.
- Main content body.
- Relationship sections:
  - parent unit
  - related people
  - related programmes
  - related downloads
  - related news/events/announcements
- Contact/action section where relevant.
- Mobile-safe metadata rows and long-title handling.

Detail pages should make records feel official and connected, not isolated.

### 5. Office And Unit Pages

Examples: administration divisions, departments, schools, offices.

Purpose: explain mandate, leadership, services, contacts, and related records.

Required pattern:

- Official title and mandate.
- Leadership/profile block.
- Contact and location facts.
- Services or responsibilities.
- Staff/team where available.
- Related departments, schools, or offices.
- Downloads, news, events, and announcements connected to the unit.

### 6. Staff And People Pages

Purpose: support academic credibility and institutional transparency.

Required pattern:

- Profile identity: name, title, role, image or initials.
- Affiliation: school, department, office, or governance body.
- Contact details when published.
- Academic rank or institutional role.
- Expertise/research interests where available.
- Tabs or sections for biography, teaching, research, administration, and links
  when data exists.

Do not expose backend vocabulary. Translate relationships into public language.

### 7. News, Events, Announcements, And Media

Purpose: publish official institutional updates with date clarity and context.

Required pattern:

- Lists with filters and featured items.
- Date, category, and unit context.
- Detail pages with source, published date, related unit, attachments, and
  related updates.
- Events must show date, time, location, registration/action, and status.
- Announcements should feel official and should surface attachments clearly.

## Higher Learning Institution Content Relationships

The design should make relationships visible wherever backend data allows it.

Priority relationships:

- Programme belongs to school and department.
- Department belongs to school or administrative unit.
- Staff belongs to department, school, office, or governance body.
- School offers programmes and has departments, people, downloads, and updates.
- Office has mandate, leadership, staff, services, downloads, and updates.
- News, events, announcements, blogs, and media belong to categories and may
  relate to schools, departments, offices, or research.
- Downloads belong to a category, office, unit, or audience.
- Admissions content should point users toward programmes, requirements,
  deadlines, fees/funding, application links, and support.

When a relationship is not available, use a clear empty state. Do not fill gaps
with dummy content.

## Shared Component Direction

Phase work should consolidate repeated patterns into shared public components.
Candidate components:

- `PublicHero`
- `PublicSectionHeader`
- `PublicCard`
- `PublicListCard`
- `PublicFilterBar`
- `PublicFactGrid`
- `PublicProfileCard`
- `PublicDownloadRow`
- `PublicRelationshipSection`
- `PublicEmptyState`
- `PublicDetailShell`

Existing components to preserve and extend where practical:

- `PublicSectionPage`
- `PublicImage`
- `ArtDirectedImage`
- `SearchForm`
- `PublicTeamSection`
- `PublicPersonTabs`
- `MediaGalleryBento`
- `ProgrammeDetailPage`
- `SchoolDetailSection`
- `DepartmentDetailSection`
- `AdministrationOfficeDetailSection`

The goal is not to force every page into one component. The goal is to remove
structurally identical local implementations and keep module-specific design
where the content truly differs.

## Route Cluster Standards

### Homepage

Should become the strongest academic routing surface. It must prioritize
programmes, admissions, schools, research, student life, news/events, and public
services before secondary content.

### Academics And Programmes

Must support discovery first:

- searchable programme catalogue
- filters and sorting
- programme facts
- school/department relationship
- application next step
- related programmes

### Admissions

Must read as a workflow:

- choose applicant type
- find programme
- check requirements
- review fees/funding
- apply
- monitor deadlines
- contact admissions

### Schools, Departments, And Staff

Must read as academic unit profiles:

- leadership
- programmes
- departments
- staff
- expertise
- research/activity where available
- downloads and updates

### Governance And Administration

Must read as official public accountability:

- governance hierarchy
- council/senate/management structure
- leadership profiles
- mandates
- charters/policies/downloads
- office services and contacts

### Campus Life

Must read as practical student support:

- accommodation
- clubs and societies
- sports
- health and counselling
- disability support
- student governance
- safety and practical contacts

### News, Events, And Announcements

Must read as official institutional publishing:

- searchable/filterable lists
- date and status clarity
- attachments
- related unit/category
- related updates

## Accessibility And Responsive Requirements

Every phase must preserve these requirements:

- Mount the shared `AccessibilityInitScript` in the root document and wrap the
  application in `AccessibilityShell` with the page's real main-content ID.
- Keep one functional "Skip to main content" link. The target must accept
  programmatic focus so keyboard users are moved past repeated navigation.
- Support the shared low-vision, reduced-motion, reading-support, and
  motor-assistance preferences without replacing native browser or operating
  system accessibility settings.
- No horizontal overflow at mobile widths.
- Content and controls must reflow without loss of information or function at
  400% zoom; do not require two-dimensional scrolling for ordinary page content.
- Long titles, names, emails, URLs, and metadata must wrap safely.
- Interactive controls must have visible focus states.
- Icon-only actions need unique accessible labels and a minimum 44 by 44 CSS
  pixel target where practical.
- Images require meaningful alt text unless decorative.
- Buttons and links must have clear action language.
- Do not use color alone to communicate meaning, errors, selection, or status.
- Respect `prefers-reduced-motion`, the shared reduced-motion preference, and
  forced-colors mode. Automatically moving content must provide a pause control.
- Dialogs and side panels must trap focus while open, close with Escape, name
  their purpose, and return focus to their trigger.
- Dynamic errors and success messages must be announced without unexpectedly
  moving focus.
- Cards and rows must remain readable at 390px viewport width.
- Desktop layouts must not depend on content being short.
- Run the shared Playwright accessibility suite and complete the applicable
  manual-test matrix before considering a high-value journey verified.

Automated axe checks are regression protection, not proof of WCAG conformance.
Keyboard, zoom/reflow, forced-colors, and screen-reader checks remain required.

## Backend-Backed Content Rule

Main/web should use backend-backed data whenever an entity exists in the service
contracts. Static copy may provide institutional framing, but lists, counts,
relationships, people, records, downloads, news, events, and programme data
should come from the backend when available.

Empty states are preferred over dummy data.

## Acceptance Criteria For Future Phases

A route or cluster can be considered aligned with this standard only when:

- It uses the current main/web visual language.
- It has a clear higher-education user journey.
- It exposes backend relationships where available.
- It has module-specific filters or navigation when records are list-like.
- It has clear calls to action.
- It handles empty backend states.
- It has no mobile horizontal overflow.
- It passes lint and typecheck.
- It has been checked visually on desktop and mobile.

## Phase Handoff

The implementation sequence should be:

1. Homepage repositioning.
2. Academics and programmes.
3. Admissions journey.
4. Schools, departments, and staff.
5. Governance and administration.
6. Campus life.
7. News, events, and announcements.
8. Shared component consolidation.
9. Full visual QA.

Do not start a later cluster by changing the visual language. Later phases should
adopt this standard while preserving the current public theme.
