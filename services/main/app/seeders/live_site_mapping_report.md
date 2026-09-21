# Kisii University Official Site Crawl Mapping Report

Generated from the full official-domain recrawl dated 2026-07-07.

## Crawl Coverage

- Official HTML pages captured: 1,676
- Official document links captured: 127
- Discovered URLs queued: 1,705
- Queue remaining after crawl: 0
- Site error/non-imported HTML responses: 29

The crawler exhausted every discovered `kisiiuniversity.ac.ke` HTML URL in its queue. The 29 uncaptured responses were returned by the live site as `404` or `500` responses, including some stale profile/update routes and legacy library/research routes.

## Page Types Captured

- `department`: 423
- `grpc`: 355
- `blog`: 283
- `departments_management`: 173
- `%D7%97%D7%96%D7%99%D7%AA%D7%99`: 127
- `grppc`: 71
- `%D7%97%D7%96%D7%99%D7%AA%D7%99l`: 62
- `profile`: 55
- `dptabout`: 47
- `event`: 23
- Other official sections: about, admissions, schools, offices, programme categories, student life, downloads, FAQ, contact, policy, library, tour, and management pages.

## Mapped To Existing Main-Service Models

- News/blog pages: `News`, `Blog`, and source-backed content seed records.
- Event pages: `Event`.
- Download/document links: `Document` and related public download seed records.
- Crawled public pages: `PublicSitePage`, preserving title, path, page type, summary, plain text, headings, links, images, source URL, and source hash.
- Staff profile pages: `Person`, preserving official name/title, role, research interests, education background text, work experience text, skills as teaching areas, publication count, full profile body, and source profile URL.
- Schools, departments, programmes, admissions, contacts, FAQs, clubs, governance, divisions, and administrative units: existing structured seeders where the current schema supports the source data, with the full crawl retained in `PublicSitePage` for traceability.

## Data Available But No Dedicated Main-Service Model

- Legacy `grpc`, `grppc`, `%D7%97%D7%96%D7%99%D7%AA%D7%99`, `%D7%97%D7%96%D7%99%D7%AA%D7%99l`, `departments_management`, and `dptabout` route families contain generated research/library/programme/department content. They are preserved as `PublicSitePage`; the main backend has no dedicated typed models for each of these legacy route families.
- Staff profile subrecords such as individual work-experience entries, research grants, skills, and publication bibliographies are available on some pages, but the main service has no dedicated `WorkExperience`, `ResearchGrant`, `Skill`, or `StaffPublication` tables. The seeder stores the available text in the closest existing `Person` fields.
- Profile images are retained on crawled `PublicSitePage` records; Digital Kisii avatar URLs are stored on `Person.external_avatar_url`, while confirmed local institutional/staff assets are represented by `Media` rows and attached where available.
- External portals and service links, including help desk, tenders, repositories, e-learning, and other systems, are preserved as links on `PublicSitePage`; they are not modeled as first-class service integration records.
- Site error responses are recorded in the crawl audit but are not seeded because they do not provide successful public page content.
# Current follow-up audit — 2026-09-08

- The live homepage links four additional August 2026 news records that were not
  previously present in the structured `news` model. They are now source-backed
  in `live_site_updates_20260908.py` and have been seeded.
- The live homepage mission and philosophy now take precedence in the active
  `UniversityInfo` record; the older handbook wording remains retained only in
  the historical `quick_facts` metadata.
- The live navigation links `/a-cat/service-charter`, but that source currently
  returns a Laravel `Target class [App\\Http\\Controllers\\AboutCategory] does
  not exist` error. It is intentionally not seeded with placeholder content.
  Recheck this route when the official source is repaired.
- External lecturer synchronization currently fetches 276 records. 269 have a
  Digital Kisii external-ID match in `Person`; seven email-only matches remain
  protected by existing source ownership conflicts. Profiles without a safe
  department match are retained with a null optional `department_id`; only the
  department assignment is left unresolved.

## Verified structured-source coverage — 2026-09-08

- All 1,697 current captured official page URLs are present in `PublicSitePage`.
- A fresh reconciliation of the live homepage, About, and Events navigation
  found 64 official links with zero unexpected missing records. The only
  excluded route is the live Service Charter URL, which currently returns an
  official-site HTTP 500 response.
- The typed content database contains 282 source-backed `News` records (290
  total) and
  286 source-backed `Blog` records. The 283 captured legacy blog pages are
  promoted into `Blog` when their official published marker can be parsed;
  curated current updates and retained historical source records are also
  included.
- Nine dated source records are present in `Event` (10 total). The other 16 event detail
  pages remain in `PublicSitePage` because the captured source does not expose
  a reliable required start date; no date is invented.
- Blog source URLs and slugs were checked for duplicates after promotion; both
  duplicate counts are zero.
- The current Digital Kisii programme pass fetched 352 rows and persisted 334
  source rows; the database contains 335 active Digital Kisii programme
  records including the previously stored `MAN13`. Verified duplicate codes
  are collapsed, while the two contradictory `MAN13` source rows remain
  explicitly reported for reconciliation. No unsupported department was
  guessed.
- The programme API currently returns non-empty values for `name` (352),
  `category` (352), `department` (352), `programme_code` (351),
  `curriculum_overview` (10), and `course_prospects` (10); each has a defined
  `Programme` destination. `details` is empty in all 352 source rows, so no
  `about` value is manufactured from it.
- The current Digital Kisii lecturer pass fetched 276 rows and persisted 236
  updates; source ownership conflicts remain explicitly reported for manual
  reconciliation.
- The live Digital Kisii lecturer response exposes 276 records. Available
  fields are mapped into the defined `Person`, `PersonWorkExperience`, and
  `StaffAssignment` models: identity/email/avatar, biography, education, work
  history, publications, research grants, research interests, skills,
  department, and position metadata where supplied. The source's
  `current_position` field is empty for all 276 records, so no position value
  is fabricated.
- The live website profile seeder currently represents 78 profile-linked
  `Person` records, 60 official portrait media attachments, 70 complete
  profile bodies, and 28 source biography sections. Website work-history data
  is represented in `PersonWorkExperience`; profiles without a source
  biography are not given fabricated biography text.
- The current official University Council and Management Board pages identify
  14 leadership profiles. All 14 are present locally with portrait media; the
  six profiles for which the source publishes biographies are populated with
  those biographies, while the remaining eight retain no fabricated biography.
- The 14 leadership records also have their current Council, Board, University,
  Division, Wing, Finance Officer, or Registrar assignments represented in
  `StaffAssignment` where the source identifies a person and role.
- Document links are canonicalized before seeding. All 85 unique normalized
  source document links from the live crawl are covered by the current 101
  active document/media rows; the larger total includes previously seeded
  static and URL-variant records retained for backward compatibility.
- The typed About content currently contains one published About page, seven
  history milestones, two active institutional pages, nine active institutional
  sections, seven fact groups, and 26 fact items. The inaccessible Service Charter
  placeholder is archived, and the institutional image seed
  attached to the relevant hero/identity sections.
- The linked English, Kiswahili, and sign-language Service Charter routes were
  rechecked: each returns HTTP 200 but contains only the shared site shell and
  no charter text, document, or video source. They remain represented as
  source pages, while the typed placeholder stays archived.
- The three supplied institutional originals are copied without recompression
  at 1024×682 (1.501466:1, approximately 3:2); their dimensions and aspect
  ratio are recorded in `Media` metadata, and all three URLs are exposed by
  the public About response.
- A fresh reconciliation of the homepage, About, and Events HTML found 79
  internal hrefs. The only content route not represented is the broken Service
  Charter route; the other 12 misses are legacy WordPress/stylesheet/oEmbed/
  XML-RPC asset endpoints, not migratable public content pages.

## Current live-site reconciliation - 2026-09-14

- The live `/news` index exposes 330 article URLs. All 330 have a source-backed
  representation across the seeded `News`/`Blog` content and crawled
  `PublicSitePage` records.
- The current exact article delta contains 52 newly reconciled pages, including
  the August 26, 2026 `General Library Rules And Regulations` page and its two
  official image resources. Empty article bodies remain empty where the source
  publishes only an image or a heading; no copy is generated.
- The live `/our_past_events` index exposes 22 event detail URLs. All 22 are
  represented by exact source-backed `Event` records with the published title,
  description, date, location where supplied, and official event image.
- The current event set also retains the live upcoming conference source from
  `/our_events`, for 23 typed event records in total.
- Twelve current article-linked official downloads are promoted into
  `Document`/`Media` records. PDF and DOCX MIME types and canonical download
  URLs are preserved.
- The homepage and targeted internal-link audit found three broken content
  routes (one 404 and two 500 responses, including `/a-cat/service-charter`).
  They are not seeded with placeholder content until the official source
  returns a published page.

## Full navigation rescan - 2026-09-14

- A second crawl of the live [Kisii University site](https://kisiiuniversity.ac.ke/)
  reached 1,705 successful official HTML pages and recorded 41 non-success
  responses. The latter were errors, timeouts, or stale routes; no failed
  route was turned into synthetic content.
- Twelve successful routes not present in the prior current-source union are
  now represented in the public-page seeder: ten staff profiles and two
  programme detail pages. The raw source-page union contains 1,745 unique
  page records after source-URL deduplication; six historical routes that
  returned errors in this rescan are excluded, leaving 1,739 publishable
  source-page records.
- The ten profile routes are also represented in the structured `Person`
  seeder. The two programme pages preserve their published level, department,
  title, and related-programme links; duration, fees, and entry requirements
  are left to the separate brochure-backed catalogue when the page does not
  publish them.
- The current [Downloads index](https://kisiiuniversity.ac.ke/page_downloads)
  exposes 14 document links. Existing snapshot and article-linked records
  cover 13 of them; the missing `Call for Student Essay Competition` PDF is
  now included in the document seeder.
- The eight school seed records now follow the department lists on the live
  school pages. Handbook-only department additions are retained as source
  metadata rather than being materialized as current public departments, and
  previously materialized departments absent from the live lists are marked
  inactive and non-public.
- Admission information now projects the eight official admission pages into
  `AdmissionInfo` with their source URLs and published page text. Generic
  application guidance, FAQ answers, pathway steps, and fee estimates were
  removed or disabled when the live site did not publish those values. The
  live [FAQ page](https://kisiiuniversity.ac.ke/faq) currently says that no
  FAQ has been added.
- The public-record FAQ fixtures and fictional testimonial fixtures are no
  longer published. A repeat seed run archives the old generated rows, while
  leaving those models available for future source-backed or consented data.
- The four former homepage leadership-activity placeholder stories are also
  archived; current stories come from the live-site content import.
- The brochure-backed catalogue retains only source-provided narrative,
  accreditation, and fee values. Generated programme descriptions,
  curriculum text, career claims, and accreditation defaults are no longer
  seeded as if they were official page content.
