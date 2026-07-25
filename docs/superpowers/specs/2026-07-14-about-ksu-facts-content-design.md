# About KSU and Numbers & Facts Content Design

## Context

The public About area currently exposes seven destinations, while the requested
information architecture needs a compact, responsive menu with six destinations:

1. About KSU
2. University Council
3. University Management
4. University Service Charter
5. Strategic Plan
6. KSU Numbers & Facts

The current `UniversityInfo` singleton already stores stable institutional
identity, but the richer About KSU experience needs ordered history milestones,
media, a promotional video, a before-and-after campus feature, publishing
workflow, and yearly facts. Service Charter and Strategic Plan currently redirect
to Quality Assurance and will receive their own designs in later slices.

The visual reference for Numbers & Facts is the information architecture of the
[University of Oslo facts page](https://www.uio.no/english/about/facts/): a dated
set of key figures supported by grouped institutional context. Kisii University
will use its own visual language, content, categories, and sources.

## Goals

- Preserve `UniversityInfo` as the authoritative institutional profile.
- Add first-class philosophy and strategic-plan summary fields.
- Make rich About KSU content editable, reviewable, and publishable.
- Seed verified history milestones for launch without inventing public records.
- Support evergreen facts and annual statistical editions in one model.
- Provide admin creation, ordering, preview, workflow, archiving, and source
  verification before public display.
- Return frontend-ready public payloads from normalized backend records.
- Build a responsive six-item About menu that fits its content and scrolls inside
  the viewport when necessary.
- Keep the About page visible behind a conditional History panel opened by the
  journey CTA or `/about?history=open`.
- Add a dedicated `/about/numbers-and-facts` page and link it from the right end
  of the About page's Institutional Profile strip.

## Non-Goals

- Redesigning University Council, University Management, Service Charter, or
  Strategic Plan pages in this implementation slice.
- Building Gallery, Documents, or Voices tabs before those content types exist.
- Adding animated counters or deriving official values in the frontend.
- Replacing the existing Media or Document systems.
- Supporting arbitrary page-builder layouts for About KSU.

## Approved Architecture

Use a hybrid institutional-profile and editorial-content architecture:

```text
UniversityInfo
  -> stable identity and institutional statements

AboutPageContent (one-to-one)
  -> About KSU editorial narrative, media, video, transformation, workflow
  -> HistoryMilestone (ordered, independently publishable)

FactEdition
  -> annual reporting release
  -> FactGroup -> FactItem

Evergreen FactGroup / FactItem
  -> composed into the current or selected annual edition

PublicAboutService
  -> frontend-ready About KSU payload

PublicFactsService
  -> current or selected edition plus evergreen groups
```

Normalized models own content that repeats, changes independently, has media or
sources, or requires publishing. Fixed interaction labels, icon mappings, layout,
and accessibility behavior remain frontend responsibilities.

## UniversityInfo Changes

Add two nullable text columns:

- `philosophy`: the canonical institutional philosophy. Migrate the existing
  value from `strategic_priorities.philosophy` when the new column is empty.
- `strategic_plan_summary`: a concise institutional summary of the current
  strategic direction. The detailed plan remains a Document-backed resource and
  will later drive the dedicated Strategic Plan page.

Retain these existing fields as canonical:

- name, short name, acronym, motto;
- overview, mission, vision, core values;
- founding year, institution type, charter summary, history summary;
- address, contact, campus, leadership, and existing quick-fact data.

`strategic_priorities` remains supported for backward compatibility. New public
About code reads `philosophy` first and uses the legacy nested value only during
the migration window.

## AboutPageContent

`about_page_content` has one active record per `university_info_id`.

Content fields:

- `university_info_id` foreign key;
- `hero_eyebrow`, `hero_headline`, `hero_introduction`;
- `identity_heading`, `identity_narrative`;
- `mandate_introduction`;
- `video_title`, `video_url`, `video_transcript_url`;
- `hero_media_id`, `identity_media_id`, `video_poster_media_id`;
- `old_campus_media_id`, `modern_campus_media_id`;
- `history_document_id`;
- `section_settings` JSON for visibility and ordering only.

Workflow fields follow the existing Page CMS vocabulary:

- `status` and `workflow_status`;
- `scheduled_publish_at`, `expires_at`;
- submitted, reviewed, approved, published, and unpublished timestamps;
- submitting, reviewing, approving, publishing, creating, and updating users;
- `rejection_reason` and `revision_notes`.

Rules:

- there may be only one non-archived record per university;
- publishing requires a hero headline, introduction, and identity narrative;
- public video display requires an HTTPS or internal URL and a transcript URL;
- transformation display requires both old and modern media;
- `section_settings` may hide or reorder known sections but cannot introduce an
  unknown component type;
- public APIs return only currently published, enabled content.

## HistoryMilestone

`history_milestones` belongs to `AboutPageContent`.

Fields:

- `about_page_content_id`;
- unique `slug` within the About page;
- `year_label`, which supports values such as `Today`;
- optional `event_date` for chronological sorting;
- `title`, `summary`, optional `expanded_body`;
- `image_id`, `image_alt_text`;
- `source_title`, `source_url`, optional `source_document_id`;
- `display_order`, `is_featured`, `is_public`;
- workflow, scheduling, ownership, and audit fields.

Public ordering uses `display_order`, then `event_date`, then stable ID. A
milestone is public only when it is active, public, published, inside its publish
window, and owned by a published About page.

Launch seeding creates the verified institutional milestones for 1965, 1983,
1994, 1999, 2007, 2013, and Today. Seed text comes from the existing handbook and
UniversityInfo history sources. Local frontend images may be used only as clearly
identified presentation fallbacks when an official milestone image is absent;
the frontend must not invent a milestone record.

The History panel has one view. Do not create tab records or render Gallery,
Documents, or Voices placeholders.

## Numbers & Facts Hybrid Model

### FactEdition

`fact_editions` represents an annual reporting release.

Fields:

- unique `reporting_year`;
- `title`, `introduction`, `methodology_note`;
- `verified_on`, optional `source_document_id`;
- `is_current`;
- workflow, scheduling, ownership, audit, and archive fields.

Rules:

- a partial unique index permits only one published current edition;
- publishing a new current edition atomically clears `is_current` from the old
  edition;
- published editions cannot be deleted and must be archived;
- archived editions remain addressable by reporting year;
- cloning copies annual groups and items into a new draft and never duplicates
  evergreen groups.

### FactGroup

`fact_groups` controls page sections.

Fields:

- optional `fact_edition_id`; null means evergreen;
- unique `slug` within its scope;
- `heading`, optional `summary`;
- optional `image_id`, `image_alt_text`;
- `display_order`, `is_enabled`;
- workflow and audit fields.

Suggested seed groups are Institutional Profile, People, Teaching & Learning,
Research & Innovation, Organisation, and Reach. Editors may rename, reorder, add,
disable, or archive groups.

### FactItem

`fact_items` belongs to a `FactGroup`.

Fields:

- `fact_kind`: `evergreen` or `annual`, consistent with its parent group;
- `label` and required `display_value`;
- optional decimal `numeric_value`;
- optional `prefix`, `suffix`, and `unit`;
- optional `explanation`;
- constrained `icon_key` resolved by the frontend;
- optional `link_url` and `link_label`;
- `source_title`, optional `source_url`, `verified_on`;
- `display_order`, `is_featured`, `is_enabled`;
- workflow and audit fields.

`display_value` supports non-numeric facts such as `Main Campus, Kisii County`.
`numeric_value` supports machine-readable export and future comparison without
forcing the public UI to use counters.

Validation requires a source title and verification date before publication.
External links must use HTTPS. Evergreen items cannot belong to annual groups,
and annual items must belong to an edition-owned group.

## Public API

### About KSU

`GET /api/v1/public/about`

Returns:

- canonical identity from `UniversityInfo`;
- resolved published About editorial content;
- mission, vision, philosophy, core values, strategic-plan summary, and mandate;
- institutional-profile facts needed for the compact About strip;
- published history milestones;
- resolved Media and Document projections with alt text;
- section visibility and order.

The response is composed server-side. The public frontend does not merge several
admin endpoints or determine publishability.

`GET /api/v1/public/about/history` returns the same published milestone projection
and history document for direct consumers. It does not return draft records.

### Numbers & Facts

`GET /api/v1/public/about/facts` returns the current published edition and all
published evergreen groups.

`GET /api/v1/public/about/facts?year=2025` returns the published edition for that
year plus the same evergreen groups. An unknown or unpublished year returns 404.

The payload contains edition metadata and ordered groups with ordered items. It
also contains available archived years for the year selector.

Public responses use existing success envelopes, field-selection conventions
where useful, cache headers, and cache invalidation after publication changes.

## Admin API

Authorised CRUD and workflow endpoints are grouped under:

- `/api/v1/about-content`;
- `/api/v1/about-content/history-milestones`;
- `/api/v1/fact-editions`;
- `/api/v1/fact-editions/{edition_id}/groups`;
- `/api/v1/fact-groups/{group_id}/items`.

Admin list endpoints include draft and archived records with filters for status,
year, group, and publishability. Reorder endpoints accept complete ordered ID
lists and update positions transactionally. Clone and publish are explicit
commands, not overloaded update flags.

Workflow transitions follow existing content permissions:

```text
draft -> in_review -> approved -> published
in_review -> changes_requested -> in_review
published -> approved through unpublish
eligible records -> archived
```

Publishing an edition validates every enabled group and item, sources,
verification dates, edition ownership, and current-edition uniqueness in one
transaction. A failed validation returns field-addressable 422 errors and changes
no publication state.

## Admin Experience

Add an **About KSU** workspace with tabs for:

- Page content;
- History milestones;
- Media and documents;
- Preview and publishing.

The milestone list supports create, edit, media selection, source entry,
drag/reorder controls, workflow state, and a preview of the conditional drawer.

Add a **Numbers & Facts** workspace with:

- edition list with year, state, verification date, and current badge;
- create edition and clone previous year actions;
- nested group and fact-item editing;
- evergreen-content area separate from annual editions;
- media and document pickers using existing components;
- source and verification validation;
- public-page preview for a draft edition;
- submit, approve, publish, unpublish, and archive actions according to scope.

The form uses `display_value` for all facts and reveals numeric/unit fields only
when needed. Reordering must remain keyboard accessible; drag-and-drop may be an
enhancement, not the only control.

## Public Navigation and Page Behaviour

The About dropdown contains exactly six items in the approved order. Its desktop
width fits the longest label subject to viewport padding. Its maximum height is
the available viewport below the trigger; overflowing items scroll within the
menu. The menu retains Escape dismissal, arrow/focus behavior, readable focus
indicators, and reduced-motion support.

The About KSU page includes:

- cinematic hero with a strong backend-managed introduction;
- `Discover Our Journey`, which opens History conditionally;
- `Watch Our Story`, which opens an accessible video dialog only when a published
  video exists;
- identity, beliefs, values and mandate, campus transformation, and institutional
  profile sections;
- a right-end `Explore KSU Numbers & Facts` action in the profile strip.

History is closed by default. `/about?history=open` opens it after hydration.
`/about/history` redirects to that canonical URL. Desktop uses a 40–45% right
drawer, tablet approximately 60%, and mobile a bottom sheet. Focus is trapped,
Escape closes it, focus returns to the trigger, the background is inert to input,
and the About page remains visible behind the overlay.

The dedicated Numbers & Facts page uses a reporting-year selector, a restrained
key-facts introduction, and backend-ordered thematic groups. It uses no animated
counters. Empty optional groups are omitted; absence of a current edition produces
a purposeful unavailable state rather than seeded frontend statistics.

## Error and Empty-State Behaviour

- The About page renders stable `UniversityInfo` content if optional About
  editorial content is unavailable.
- History CTA is hidden when there are no published milestones and no history
  document.
- Video CTA is hidden when no publishable video exists.
- Transformation is hidden unless both images exist.
- Missing milestone media uses a local visual fallback with accurate generic alt
  text; the milestone text remains backend-authored.
- A missing current facts edition returns a public unavailable response and does
  not fall back to an archived edition silently.
- Admin publication validation is transactional and reports exact failing fields.
- Public data helpers log fetch failures server-side without exposing internal
  details to visitors.

## Accessibility and Motion

- Meet WCAG 2.1 AA contrast and keyboard requirements.
- Use semantic headings, lists, buttons, and links.
- Require meaningful alt text for publishable editorial media.
- Provide video captions or transcript access before publication.
- Make the before/after slider keyboard and touch operable with an accessible
  range control and textual before/after labels.
- Respect `prefers-reduced-motion`; zoom, hover lift, drawer, and sheet motion
  become immediate or minimal.
- Keep scroll containers visibly bounded and avoid trapping page scroll outside
  an active modal surface.

## Migration and Seed Strategy

1. Add `philosophy` and `strategic_plan_summary` to `university_info`.
2. Backfill philosophy from `strategic_priorities.philosophy` where present.
3. Create About content, milestone, edition, group, and item tables with indexes
   and constraints.
4. Seed one published About page using verified UniversityInfo and handbook copy.
5. Seed the seven approved history milestones with source metadata.
6. Seed evergreen institutional facts and one initial annual edition only from
   verified existing backend records.
7. Leave values unavailable when no verified source exists; do not manufacture
   launch statistics to complete a layout.

Seeders are idempotent by stable slug and reporting year. They update managed seed
records without deleting editor-created records.

## Testing and Verification

Backend tests cover:

- schema validation and model constraints;
- philosophy migration and strategic-plan summary serialization;
- public filtering by workflow, visibility, and publish window;
- milestone ordering and source projection;
- evergreen plus annual facts composition;
- current-edition atomic replacement and uniqueness;
- edition clone behavior;
- transactional publication failure;
- permissions, field selection, cache invalidation, and 404 behavior;
- idempotent seed data and verified milestone years.

Frontend contract and component tests cover:

- exact six-item menu order and viewport-contained scrolling;
- conditional History rendering and canonical query URL;
- redirect from `/about/history`;
- one-view History panel without unused tabs;
- keyboard focus, Escape dismissal, bottom-sheet breakpoint, and reduced motion;
- video/transformation conditional rendering;
- Numbers & Facts year selection, group ordering, and empty state;
- absence of animated counters and invented static fact records.

Verification includes backend tests, frontend contract tests, lint, typecheck,
production build, and browser checks at desktop, tablet, and mobile widths.

## Delivery Slices

1. Institutional fields, normalized backend models, migrations, services, public
   and admin APIs, seed data, and backend tests.
2. Admin About KSU and Numbers & Facts workspaces.
3. Six-item responsive navigation, About KSU exhibition page, History drawer,
   transformation interaction, and legacy redirect.
4. KSU Numbers & Facts public page, year selection, responsive polish, and full
   accessibility/browser verification.

Each slice is independently testable and committed only after its relevant checks
pass through the project commit helper.
