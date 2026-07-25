# University Programme Cover Rollout Design

## Goal

Extend the approved School of Information Science & Technology programme-cover workflow to every remaining Kisii University programme. Generate visually stronger, programme-specific editorial illustrations in controlled parallel batches, place them in school review folders, and publish only assets explicitly approved by a human reviewer.

The catalogue contains 285 programmes across eight schools. The 22 Information Science & Technology illustrations are complete, leaving 263 illustrations across seven schools:

| School | Code | Remaining programmes |
| --- | --- | ---: |
| School of Law | SOL | 2 |
| School of Health Sciences | SHS | 21 |
| School of Education and Human Resource Development | SEHRD | 25 |
| School of Agriculture and Natural Resources Management | SANRM | 43 |
| School of Pure and Applied Sciences | SPAS | 50 |
| School of Business and Economics | SBE | 60 |
| School of Arts and Social Sciences | SASS | 62 |

## Rollout model

Use a controlled parallel pipeline. The primary agent acts as the orchestrator, and one worker agent owns each school batch. Because the environment supports four concurrent agents including the orchestrator, school workers run in waves of no more than three at a time. An agent may prepare only the concepts, manifests, and review artifacts for its assigned school; it must not import or publish images.

The rollout order is:

1. School of Law, as a two-programme end-to-end validation batch.
2. School of Health Sciences and School of Education and Human Resource Development.
3. School of Agriculture and Natural Resources Management and School of Pure and Applied Sciences.
4. School of Business and Economics and School of Arts and Social Sciences.

Concept preparation for later schools may overlap with review of an earlier school, but publication remains school-by-school. The orchestrator does not open a school for human review until that school's catalogue, files, metadata, and quality checks pass as one complete batch.

## Visual system

All illustrations belong to the same Kisii University editorial family used for the ICT batch:

- 16:9 landscape composition at 1200 by 675 pixels;
- crisp institutional vector-like illustration rather than photography;
- deep royal-blue linework, pale-blue supporting shapes, white or near-white ground, and one restrained gold accent;
- a clear academic subject visible at scanning size;
- balanced visual density and generous clear space suitable for the programme hero;
- no embedded text, letters, numbers, university crest, third-party logos, people, faces, watermark, or decorative clutter.

Better visuals must come from discipline-specific scenes rather than generic school icons. Closely related programmes should share a visual family but vary their central subject, supporting objects, arrangement, or research depth. For example, a certificate may show foundational tools, a bachelor's programme an applied system, and a doctoral programme a research network or advanced analytical scene.

Each concept records the programme name, department code, school code, visual family, subject description, alternative text, final generation prompt, and a short distinctiveness note explaining how it differs from related programmes.

## Review workspace

Generated bitmap assets are local review artifacts and are not committed to Git. Source registries, orchestration code, validation code, and tests are committed. Each school uses this ignored workspace structure:

```text
tmp/programme-covers/<school-slug>/
├── generated/          # Raw generation results and retry candidates
├── review/             # Orchestrator-approved WebP candidates
├── approved/           # Files explicitly approved by the user
├── rejected/           # Human-rejected candidates retained for traceability
├── contact-sheets/     # Numbered school overview sheets
├── reports/            # Validation, duplicate, and unresolved-item reports
└── manifest.json       # Complete programme-to-asset review state
```

Every review image filename is the canonical programme slug plus `.webp`. Contact sheets show a stable sequence number and a short programme label outside the illustration; the illustration itself contains no text. The manifest maps the sequence number back to the full programme name and records generation attempts, validation results, review notes, and status.

Allowed statuses are `planned`, `generated`, `orchestrator_review`, `needs_regeneration`, `needs_manual_review`, `human_approved`, `human_rejected`, and `published`. State changes are append-only in a review history array so decisions remain traceable.

## Agent boundaries and orchestration

The orchestrator derives school inventories from `BROCHURE_PROGRAMMES` and `SCHOOL_SPECS`; worker agents do not maintain independent programme lists. Before a worker starts, the orchestrator creates a school assignment containing the exact expected slugs, department codes, shared art direction, output directory, and acceptance criteria.

Each school worker:

1. proposes one concept and accessible alternative text per assigned programme;
2. checks related concepts within its school for repetition;
3. issues one built-in image-generation call per distinct programme;
4. preserves every candidate in `generated/` and records its attempt number;
5. optimizes the selected candidate to a 1200 by 675 WebP;
6. writes only to its assigned school folder and manifest;
7. returns the batch to the orchestrator without importing it.

The orchestrator is the only authority allowed to move candidates into `review/`, produce contact sheets, mark `needs_manual_review`, accept human approval, and invoke the importer. Worker agents never edit the shared importer or another school's registry while generation is underway. Source changes from completed schools are integrated sequentially to avoid shared-worktree conflicts.

## Automated and visual quality gates

The orchestrator validates a school batch as an exact set. A batch fails if a catalogue programme is missing, an unexpected file exists, two programmes resolve to the same slug, or a manifest/file mapping disagrees.

Deterministic checks verify:

- valid WebP signature, 1200 by 675 dimensions, and 16:9 aspect ratio;
- canonical filename and one file per expected programme;
- non-empty subject, prompt, visual-family, distinctiveness, and alternative-text fields;
- alternative text describes the academic visual without repeating a filename;
- file hashes are unique;
- perceptual similarity remains below the configured near-duplicate threshold;
- no asset is already linked to another programme;
- review status and attempt history are internally consistent.

The orchestrator then visually inspects individual images and school contact sheets for discipline relevance, malformed objects, accidental text or logos, poor composition, weak contrast, excessive clutter, style drift, and confusing similarity between related programmes.

An image that fails visual review is regenerated with one targeted correction. The orchestrator may make at most two automatic regeneration attempts after the initial candidate. If the third candidate still fails, the manifest status becomes `needs_manual_review`, the best candidate and failure notes remain in the review report, and generation continues for the rest of the school. An unresolved image cannot be published.

## Human review and approval

Human review occurs school-by-school. The reviewer receives the school's contact sheets, manifest summary, and unresolved-item report. Approval is explicit at programme level; a school-level approval command may mark all currently passing items approved, but it must not include `needs_manual_review` or rejected items.

Rejected images return to generation with the reviewer's note as a prompt correction. Human-requested regenerations are separate from the two automatic orchestrator retries. An approved image is copied from `review/` to `approved/` without overwriting its history or deleting prior candidates.

Publication is blocked until every expected programme in that school is `human_approved`. Partial-school publication is deliberately excluded from this rollout to prevent inconsistent public presentation.

## Registry and importer generalization

Replace the ICT-only concept constant with school-keyed registries while preserving the existing `ProgrammeCoverConcept` contract and prompt system. The registry must expose exact concepts by school code and validate that the union of all registered slugs matches the catalogue scope selected for generation.

Generalize the importer so `--school <code>` selects a school registry, review source, tags, and storage path. Published files use:

```text
seed/programme-covers/<school-slug>/<programme-slug>.webp
```

The importer reads only from the school's `approved/` folder, verifies a complete exact batch and `human_approved` manifest state, then upserts media records, media links, and `Programme.cover_image_id` in one database transaction. Any missing programme, invalid image, unapproved status, unexpected file, or database error rolls back the entire school import. Re-running an import updates the existing media records without creating duplicates.

No generated review bitmap, upload-volume content, cache, or contact sheet is committed to Git.

## Failure handling and resumability

Generation is resumable from the manifest. A restart skips `human_approved` and valid `orchestrator_review` items unless an explicit regeneration flag is supplied. Interrupted or invalid outputs remain recorded but do not advance state. Each write uses a temporary sibling file followed by an atomic rename so incomplete WebP files never appear in `review/` or `approved/`.

A worker failure affects only its assigned school. The orchestrator records the error, allows other active school workers to finish, and may restart the failed school from its manifest. Import failures never change review files or approval state.

## Verification

Automated tests cover:

- exact catalogue partitioning across all eight schools and the remaining count of 263;
- unique programme slugs, filenames, concepts, and alternative text;
- school registry lookup and CLI selection;
- review-folder validation and status transitions;
- dimension, signature, hash, and near-duplicate checks;
- retry limits and unresolved-item behavior;
- refusal to import incomplete, rejected, or unresolved school batches;
- transaction rollback and idempotent re-import behavior;
- media metadata, school tags, storage paths, media links, and cover assignments.

For every school, the orchestrator produces a machine-readable validation report and contact sheets before requesting human review. After approval and import, verify the database cover count against the expected school count, request representative programme APIs and image endpoints, and inspect at least one desktop and one mobile programme page. The university-wide rollout is complete only when all 285 catalogue programmes have valid programme-cover media assignments and all seven new school manifests show `published` for every item.
