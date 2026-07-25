# School Cover Panorama Design

## Goal

Replace the eight current abstract school covers with richer academic panoramas that immediately communicate each school's combined disciplines. Attach each reviewed image to the canonical school record so it appears through the existing `cover_image_id` relationship on school detail pages, academic listings, and homepage school cards.

## Scope

Create one cover for each canonical public school:

1. School of Agriculture and Natural Resources Management (`SANRM`)
2. School of Business and Economics (`SBE`)
3. School of Education and Human Resource Development (`SEHRD`)
4. School of Health Sciences (`SHS`)
5. School of Information Science & Technology (`SIST`)
6. School of Pure and Applied Sciences (`SPAS`)
7. School of Arts and Social Sciences (`SASS`)
8. School of Law (`SOL`)

## Visual direction

School covers use an “academic panorama” rather than a single programme symbol. Each image combines three to five defining disciplines into one coherent scene with layered depth, restrained lighting, and a subtle institutional architectural anchor. The artwork remains an editorial illustration rather than a photograph or literal claim about a campus building.

Shared rules:

- 16:9 landscape WebP at 1600 by 900 pixels;
- refined institutional vector-like illustration with more depth and detail than programme covers;
- royal-blue structure and linework, pale-blue supporting forms, white or near-white negative space, and restrained Kisii University gold;
- one subtle school-specific secondary accent that does not overpower the institutional palette;
- central subject safety within the middle 70 percent so both hero and card crops remain readable;
- clear hierarchy at thumbnail size and enough detail for a wide school hero;
- no embedded text, letters, numbers, logos, university crest, people, faces, watermark, photorealism, dark background, or decorative clutter.

## School concepts

| School | Defining panorama |
| --- | --- |
| Agriculture and Natural Resources | Terraced crops and soil layers flowing into an irrigation channel, aquatic ecosystem, livestock-science element, and conservation canopy |
| Business and Economics | Enterprise architecture linking an analytics dashboard, finance ledger, market network, hospitality setting, and strategic growth forms |
| Education and Human Resource Development | Open knowledge centre connecting curriculum design, educational psychology, inclusive learning tools, early-childhood materials, and leadership planning |
| Health Sciences | Anatomy volume, stethoscope, molecular model, pharmacy vessel, clinical monitor, and community-health network arranged as one accurate care-and-research environment |
| Information Science & Technology | Processor and software pathways connecting cloud systems, digital archives, media production, data networks, and information discovery |
| Pure and Applied Sciences | Microscope, molecular structure, mathematical geometry, physics orbit, biological forms, and laboratory inquiry integrated around one research platform |
| Arts and Social Sciences | Heritage archive, language and literature, geography, governance, peace studies, philosophy, and social-research pathways expressed through objects and maps |
| Law | Courthouse architecture, balanced scales, legal volumes, precedent documents, and a clear justice pathway |

Closely related objects must be composed into a single environment rather than appearing as disconnected icon tiles. The final eight images should feel like one collection while remaining recognizable without reading the school name.

## Review workspace

Generated assets remain ignored local artifacts:

```text
tmp/school-covers/
├── generated/<school-code>/<attempt>.png
├── review/<school-slug>.webp
├── approved/<school-slug>.webp
├── contact-sheets/school-covers.html
├── contact-sheets/school-covers.png
├── reports/quality.json
└── manifest.json
```

The manifest stores school code, canonical slug, concept, prompt, alternative text, candidate attempts, hashes, deterministic checks, visual-review notes, and status. Statuses follow the programme-cover review model. The orchestrator may request no more than two automatic regenerations after the initial candidate. A third failure becomes `needs_manual_review` and cannot be attached.

The user's approval of this design authorizes attachment of every complete orchestrator-passing school cover. Any unresolved item remains unapproved and is reported rather than forced through.

## Quality and review gates

Deterministic validation requires:

- exactly eight expected WebP files and no unexpected files;
- valid WebP codec and 1600 by 900 dimensions;
- canonical school filename and unique SHA-256 hash;
- no perceptually near-duplicate pair;
- non-empty prompt, concept, distinctiveness note, and accessible alternative text;
- manifest hash matching the reviewed file.

Visual review checks discipline coverage, composition, crop safety, style consistency, malformed objects, accidental text or logos, medically or scientifically misleading content, and confusing similarity between schools. A single contact sheet is reviewed alongside each full-resolution image.

## Attachment and storage

Approved files use:

```text
seed/school-covers/<school-slug>.webp
```

For each school, the attachment importer:

1. validates the complete approved eight-school set before mutation;
2. finds the canonical `School` by code;
3. upserts one public `Media` record with 1600 by 900 metadata, descriptive alt text, school tags, and source metadata `generated-school-panorama`;
4. upserts one published `MediaLink` with `entity_type="school"` and `role="cover-image"`;
5. assigns `School.cover_image_id`;
6. commits all eight attachments in one database transaction;
7. supports idempotent reruns without duplicate media or links.

The existing generic `seed_cover_images` workflow must preserve a school cover whose media metadata identifies it as a reviewed school panorama. Future seed runs must not replace these covers with the older abstract PNG fallback.

## Public behavior

No new public component or database migration is required. Existing school detail, academic listing, and homepage data loaders already resolve `cover_image_id`. After attachment, verify:

- all eight school records have the expected new media IDs;
- media endpoints return `image/webp`;
- school detail pages and academic school cards load the new covers;
- desktop and mobile layouts retain readable crops and no horizontal overflow;
- alternative text describes the academic panorama rather than repeating the filename.

## Verification

Add tests for exact eight-school registry coverage, prompt constraints, dimensions and duplicate detection, approval enforcement, complete-batch refusal, media/link upsert behavior, idempotency, rollback, and preservation against the generic seed-cover workflow. Run focused backend tests, lint/type checks, and representative public page checks. Inspect the eight-image contact sheet and at least one desktop and mobile school page before marking the batch complete.
