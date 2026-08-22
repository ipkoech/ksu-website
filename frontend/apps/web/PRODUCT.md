# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences read the campus-life surface with equal weight, confirmed by the
user rather than inferred:

- **Prospective students and their families**, deciding whether to come to Kisii
  University. They arrive from search or the homepage, know little about student
  life here, and are comparing Kisii against other Kenyan and regional
  universities.
- **Current students**, already enrolled, looking for what is happening now and
  how to join in: which club to register with, what is on this week, who
  represents them.

Neither audience is subordinate. The surface must give both a clear path from
the first viewport without labelling either group.

## Product Purpose

The public website for Kisii University (Kisii, Kenya). The campus-life section
answers "what is life here actually like, outside the lecture hall" and converts
that answer into an action: apply, visit, or join a club.

Success is a prospective student who can describe student life at Kisii in
concrete terms after one visit, and a current student who leaves having found a
club, an activity, or a student body to contact.

## Positioning

Kisii's student life is unusually **associational and county-rooted**. Of 71
registered clubs, 29 are county students' associations and 17 are professional
bodies. A student from any Kenyan county arrives to find a room of people from
home already meeting. No neighbouring university site can truthfully copy that
distribution — it is a fact of this institution's membership, not a claim.

Secondary, confirmed by seeded editorial: student organisations here reach
national recognition (Best University Tax Club, awarded at State House; the 95th
St. John Ambulance Annual Parade before the President), and the university ran
its first Innovation Week in April 2026 with 300+ participants and 97 exhibitors.

## Operating Context

- Next.js App Router monorepo. The public site is `frontend/apps/web`; shared UI
  is `@ksu/ui`; the typed backend client is `@ksu/api-client`.
- Campus life is served by one optional catch-all route,
  `app/campus-life/[[...segments]]`, dispatching a 12-value area union.
- Content is authored in an admin portal and seeded; the public site is a
  read-only consumer of the `main` service at `/api/v1/*`.
- Public list endpoints are cached 300s; the campus-life composition endpoint is
  cached 180s and accepts an `audience` parameter the frontend does not yet send.

## Capabilities and Constraints

Confirmed live backend state (verified against the running service, not assumed):

- **Clubs: 71 records**, all with `about` text. **Zero have a cover image or
  logo. Zero have a non-ize membership count.** Types: county 29, professional 17,
  edu-tainment 8, mentorship 8, religious 5, edu-service 4.
- **Stories: 10 seeded student-life records**, live at `GET /api/v1/stories`,
  each with a real editorial body (~3–4k characters), summary, category and
  reading time. **None has featured media.** Categories: Art & Culture, Careers
  (2), Student Health, Leadership (2), Research & Innovation, Clubs & Societies
  (2), Student Life.
- **Sports facilities, accommodation, arts & culture, student governance: zero
  records each.** The composition endpoint returns 0 for all four stats.
- **Club activities: zero.** The "this week" rail has no data.
- The CMS homepage composition has 8 enabled campus-life items, each with an
  image, including one titled "International Student Exchange".

Constraint: sections must degrade honestly. A collection with no records is
omitted, never shown as an empty state, because the page's job is persuasion and
an empty shelf argues against the institution.

## Brand Commitments

- Bookman Old Style is the institutional display and body face across all
  frontend apps, set at a 12pt = 16px baseline. It is system-wide and not up for
  reconsideration on this surface.
- Existing KSU design tokens govern: `--primary`, `--secondary`, `--brand-overlay`,
  `--surface-subtle`, plus the `ksu-l-*` landing type scale and `ksu-shell`
  container in `app/globals.css`.
- Two YouTube films are binding content, supplied by the user:
  - `tv2zAL4ry08` — student social life. Already used as `CAMPUS_FILM` in the
    homepage "Life at Kisii" section.
  - `CKeQVKib57o` — "KSU Internationalization Agenda 2025".
- Craft bar, confirmed: top-tier international university sites. Editorial and
  image-led rather than information-dense.

## Evidence on Hand

- Ten Corporate Communication story documents at `/home/egric/WP/student-life`,
  already extracted to
  `services/main/app/seeders/assets/student_life_stories.json` and seeded.
- Six thematic photographs at `public/images/student-life/Life-around-studies/`:
  `culture`, `health`, `innovation`, `leadership`, `career-mentorship`,
  `summer-exchange`.
- Nine campus landmark photographs at `public/images/about-us/`.
- Partial per-story imagery under `public/images/student-life/<slug>/`; most
  paths referenced by `student-life-content.ts` do not resolve to files.

Absences future work must not fabricate: club cover images, club membership
numbers, sports facilities, halls of residence, activity schedules, and student
testimonial attributions. Where a design needs one of these, it must either
degrade or be marked as awaiting real content.

## Product Principles

1. **Degrade by omission, not by empty state.** A persuasion surface never shows
   a visitor an empty shelf.
2. **The associational fact is the story.** County and professional associations
   are the differentiator; the design should make the distribution legible rather
   than hide it behind uniform cards.
3. **Serve both audiences from the first viewport** without naming either.
4. **Editorial content outranks record directories.** The ten stories carry more
   persuasive weight than any list of rows, and should be treated as the primary
   material.
5. **Design for content that is arriving.** Every slot that awaits real media must
   upgrade automatically when that media lands, never require a redesign.

## Accessibility & Inclusion

- Video must not autoplay unsolicited; the existing `YouTubeFacade` pattern
  (poster frame, click to load, `youtube-nocookie` host) is the established
  approach and is retained.
- `focusVisibleStyles` from `@ksu/ui/motion` is the project's keyboard focus
  convention.
- Motion must respect `prefers-reduced-motion`; the codebase already gates
  transforms behind `motion-safe:`.
