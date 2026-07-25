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
- Profile images are crawled as page images in `PublicSitePage`, but the main staff profile seeder does not create `Media` rows or attach `Person.photo_id` because there is no current source-to-media import flow for remote profile images.
- External portals and service links, including help desk, tenders, repositories, e-learning, and other systems, are preserved as links on `PublicSitePage`; they are not modeled as first-class service integration records.
- Site error responses are recorded in the crawl audit but are not seeded because they do not provide successful public page content.
