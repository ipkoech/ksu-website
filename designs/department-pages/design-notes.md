# Department Pages Design Notes

## Status

- Route family: academic and administrative department detail pages
- Academic route examples:
  - `/academics/schools/[school-slug]/departments/[department-slug]`
  - `/academics/departments/[department-slug]`
- Administrative route example:
  - `/administration/units/[slug]`
- Frontend status: Canonical through `frontend/apps/web/src/app/academics/[[...segments]]/page.tsx` and `frontend/apps/web/src/app/administration/[[...segments]]/page.tsx`
- Final visual assets allowed: yes
- Implementation performed: no
- `imagegen` used: yes, built-in image generation for visual direction

## Files

- `department-pages-desktop-board.png`
- `department-pages-mobile-board.png`
- `design-notes.md`

## Route And Shell Constraints

Department detail routes must use the public shell sequence:

1. `Announcements`
2. `MiniHeader`
3. contextual `EntityHeader`
4. page content
5. `PublicFooter`

The design does not use the global `PublicHeader` on department detail pages.

The real logo asset remains `/logos/ksu-logo.png`. The contextual header height, logo treatment, and navigation style follow `EntityHeader`.

## Variant Rules

Academic department navigation:

- About
- Team
- Programmes
- Publications, only when available
- Services
- News
- Downloads
- Contact

Administrative department navigation:

- About
- Team
- Services
- News
- Downloads
- Contact

Administrative pages do not show Programmes. Services are more prominent for administrative departments than for academic departments.

## Design Direction

The desktop board shows two parallel page variants:

- Academic department: balanced around leadership, about, mission/vision/mandate, programmes, services, and team organogram.
- Administrative department: balanced around unit lead, about/mandate, services, team organogram, documents/news/contact, and division metadata.

The mobile board shows the same distinction with compact tabs, single-column cards, and a visible hamburger for the contextual menu.

## Data And Product Truthfulness

The design avoids:

- fake precise phone numbers;
- fake email addresses;
- fake rankings or accreditation claims;
- fake deadlines;
- fake dashboards;
- fake online workflows;
- empty-state cards for missing data;
- “when available” placeholder rows.

Missing content should be hidden. Sections should render only when source records exist.

Relevant backend/frontend data sources include:

- department records from `/api/v1/departments/[slug]`
- administrative department records from `/api/v1/departments` or `/api/v1/administration`-scoped helpers
- staff assignments from `/api/v1/public/leadership/list` or staff assignment APIs
- programmes scoped to academic departments
- department services
- news scoped to the department/unit
- documents scoped to the department/unit

## Reusable Components Needed

Future implementation should reuse or adapt:

- `EntityHeader`
- `Organogram`
- the school detail three-column content layout
- quick-link rail
- contact/info rail
- compact record cards for programmes, services, news, and documents

Recommended new component family:

- `DepartmentDetailOverview`
- `DepartmentDetailSection`
- shared `DepartmentInfoPanel`
- shared `DepartmentContactPanel`

Academic and administrative variants should share the layout engine and differ through section availability, labels, and ordering.

## Implementation Notes

- Use `EntityHeader` for both academic and administrative department pages.
- Do not render Programmes for administrative departments.
- Keep Publications hidden unless records exist.
- Hide whole content sections when the backing array or field is empty.
- Prefer assignment-backed leadership and organogram records over flat staff lists.
- Keep contact rows conditional by field.
- Use real department codes, parent school/division, and reporting line values from source records.
- Keep page content full-width and compact, with responsive grids that do not require internal scroll.

## Self-Evaluation

| Category | Desktop | Mobile |
| --- | ---: | ---: |
| Product accuracy | 5 | 5 |
| Page purpose and user goal | 5 | 5 |
| Action hierarchy | 4 | 4 |
| Visual hierarchy | 4 | 4 |
| Brand consistency | 5 | 5 |
| Product storytelling and clarity | 4 | 4 |
| Trust, confidence, and usability | 5 | 5 |
| Responsiveness | 4 | 5 |
| Accessibility | 4 | 4 |
| Image quality | 5 | 5 |
| Feasibility for future implementation | 5 | 5 |

No implementation was performed for this design task.
