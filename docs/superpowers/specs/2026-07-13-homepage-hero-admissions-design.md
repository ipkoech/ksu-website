# Homepage Hero and Admissions Design

## Context

The public homepage needs an image-led institutional hero inspired by the approved Kisii University reference design. The hero must combine stable, CMS-managed university messaging with time-sensitive admissions information without hard-coding application state in the frontend.

The current backend has two separate foundations:

- Page CMS exposes published homepage sections and media through `GET /api/v1/homepage`.
- `Intake` stores application dates plus `is_active` and `is_open`, and the frontend separately requests open intakes.

The composed homepage endpoint does not currently resolve an admissions state. The current composed hero renders only its background, subtitle, title, description, and first CTA. It does not render an intake panel, countdown, admission-letter action, secondary CTAs, verified facts, or the configured mobile image.

## Goals

- Preserve the existing Kisii University theme and approved cinematic hero direction.
- Keep institutional hero copy and media editable through Page CMS.
- Make application and admission-letter state authoritative in the backend.
- Return a complete resolved hero read model from `GET /api/v1/homepage`.
- Show an application countdown only when applications are genuinely open.
- Allow authorised administrators to publish admission-letter access for a specific intake.
- Hide the admissions panel when no useful action is available.
- Reuse admissions milestones in the hero, Important Academic Dates, intake pages, and University Pulse.
- Support preview, workflow, audit, scheduling, expiry, validation, accessibility, and deterministic conflict resolution.

## Non-Goals

- Building or replacing the applicant portal.
- Serving an applicant's private admission letter directly from the public homepage API.
- Showing an `Applications closed` state.
- Treating CMS copy such as `Admissions open` as operational truth.
- Calculating or publishing unverified institutional statistics.
- Redesigning homepage sections after the hero in this implementation slice.

## Clean Static Hero Revision

The approved visual direction for the next implementation slice is a clean, static media-led hero. The hero should use the Kisii University theme tokens, keep the campus background image or video clear, and avoid the current heavy darkened treatment.

The first viewport should prioritize institutional identity over dense operational widgets:

- Use one strong campus image or video as the full-bleed background.
- Prefer `hero.media.video` with `hero.media.poster` when supplied by `/api/v1/homepage`.
- Prefer `hero.media.desktop` and `hero.media.mobile` when supplied.
- Use the provided Kisii administration campus image as the local fallback.
- Render text directly over the media, not inside a card.
- Use a subtle directional primary overlay only where text needs contrast.
- Do not blur the background image.
- Keep copy short: eyebrow when available, "Kisii University" or the backend headline, one concise supporting sentence, and two primary actions.
- Keep CTAs limited to "Apply Now" and "Explore Programmes" unless the backend provides a stronger pair.
- Do not render a large admissions panel, countdown card, or hero metrics in this top section.
- Keep detailed admissions state in the following homepage band or pulse section.
- Keep institutional stats in the lower "Kisii University at a Glance" section.

Verification for this revision must confirm desktop and mobile readability, clear media rendering, theme-token colors, no horizontal overflow, and that the next section is visible or nearly visible below the hero.

## Approved Public Behaviour

The admissions panel has exactly three resolved states:

1. `applications_open`
2. `admission_letters_available`
3. `hidden`

### Applications Open

Show:

- active intake name;
- application closing timestamp;
- live countdown;
- Apply Now;
- Check Requirements;
- Explore Programmes;
- an explicit late-application indicator when applicable.

### Admission Letters Available

Show:

- intake name;
- `Admission letters are available`;
- reporting date when published;
- Download Admission Letter;
- Reporting Instructions when published;
- Student Portal or Contact Admissions when published.

Admission-letter availability is controlled by an authorised administrator through a published intake action. The destination should normally be an authenticated applicant portal, not a shared public PDF.

### Hidden

When neither applications nor admission letters qualify:

- do not render the admissions panel;
- do not render an empty placeholder column;
- do not show a zero countdown;
- do not show an Apply Now action;
- allow institutional hero content to use the available width.

When applications and admission letters overlap, `applications_open` controls the hero. Admission-letter access for an earlier cohort may still appear in University Pulse or admissions navigation.

## Architecture

Keep operational truth separate from presentation:

```text
Page CMS
  -> headline, highlighted line, description, media, visual CTAs

Admissions
  -> intake application window, public actions, milestones, priority, workflow

HomepageAdmissionStateService
  -> resolves applications_open, admission_letters_available, or hidden

HomepageCompositionService
  -> merges CMS hero, resolved admissions state, and approved facts
```

The public frontend consumes the resolved response. It must not independently decide whether an intake is open.

## Intake Changes

Extend `intakes` with:

- `application_opens_at`: timezone-aware timestamp;
- `application_closes_at`: timezone-aware timestamp;
- `late_application_closes_at`: optional timezone-aware timestamp;
- `application_override`: `automatic`, `force_open`, or `force_hidden`;
- `override_expires_at`: required for a non-automatic override;
- `late_applications_enabled`: explicit late-application control;
- `is_featured_on_homepage`: makes an intake eligible to control the hero;
- `homepage_priority`: deterministic selection among eligible intakes;
- `timezone`: defaults to `Africa/Nairobi`.

Existing date-only application fields remain readable during migration but are deprecated as the final countdown source. Existing `is_open` remains temporarily for compatibility and is not the resolved public state.

Validation:

- closing must follow opening;
- late closing must follow normal closing;
- a manual override must expire;
- a homepage-featured intake must be active;
- timezone must be a valid IANA timezone;
- conflicts between legacy and new fields must be surfaced during migration.

## New Model: IntakePublicAction

`intake_public_actions` stores operational public CTAs for an intake.

Fields:

- `id`
- `intake_id`
- `action_type`
- `label`
- `description`
- `target_url`
- `starts_at`
- `ends_at`
- `is_enabled`
- `priority`
- `open_in_new_tab`
- `status`
- `workflow_status`
- `scheduled_publish_at`
- `expires_at`
- `submitted_by_id`
- `reviewed_by_id`
- `approved_by_id`
- `published_by_id`
- `created_by_id`
- `updated_by_id`
- `submitted_at`
- `reviewed_at`
- `approved_at`
- `published_at`
- `unpublished_at`
- `rejection_reason`
- `revision_notes`
- base audit and soft-deletion fields.

Initial action types:

- `apply`
- `check_requirements`
- `explore_programmes`
- `download_admission_letter`
- `reporting_instructions`
- `student_portal`
- `contact_admissions`

Constraints and validation:

- one current action of a given type per intake;
- `ends_at` cannot precede `starts_at`;
- enabled published actions require a target URL and label;
- internal targets start with `/`;
- external targets use HTTPS;
- action publication cannot extend an application beyond its intake window unless late applications are enabled;
- draft, disabled, expired, archived, deleted, or unpublished actions never appear publicly;
- intake deletion cascades to its public actions.

Workflow statuses and transitions follow the existing Page CMS pattern:

```text
draft -> in_review -> approved -> published
in_review -> changes_requested -> in_review
published -> approved through unpublish
any permitted active state -> archived
```

## New Model: IntakeMilestone

`intake_milestones` stores cohort-specific admissions dates.

Fields:

- `id`
- `intake_id`
- `milestone_type`
- `title`
- `description`
- `starts_at`
- `ends_at`
- `location`
- `instructions_url`
- `is_public`
- `display_order`
- `status`
- `workflow_status`
- scheduling, expiry, workflow, audit, and soft-deletion fields.

Initial milestone types:

- `applications_open`
- `applications_close`
- `admission_letters_release`
- `reporting`
- `orientation`
- `registration`
- `semester_opening`

The academic calendar remains authoritative for general semester, teaching, examination, and results dates. Intake milestones cover cohort-specific admissions events.

## Admissions State Resolver

Add `HomepageAdmissionStateService` with a pure, testable resolver and a database-loading boundary.

Resolution sequence:

1. Load active, homepage-featured intakes and their currently publishable actions and milestones.
2. Evaluate the effective instant using timezone-aware timestamps and `Africa/Nairobi` as the default.
3. Apply a valid administrative override.
4. Determine whether the standard or explicitly enabled late application window is open.
5. Require a published, enabled, valid `apply` action.
6. If qualified, return `applications_open`.
7. Otherwise find a qualified `download_admission_letter` action.
8. If found, return `admission_letters_available` with a public reporting milestone when available.
9. Otherwise return `hidden`.

Eligible intake precedence:

1. application state before admission-letter state;
2. lower `homepage_priority` value first;
3. nearest relevant closing or reporting time;
4. most recently published configuration;
5. stable ID as the final tie-breaker.

The resolver returns an internal reason code for preview and diagnostics, such as `NO_ELIGIBLE_PUBLIC_ACTION`, but the public UI never displays it.

## Homepage API Contract

Enhance `GET /api/v1/homepage` without removing the existing `sections` or `partnership_spotlights` fields.

```json
{
  "success": true,
  "data": {
    "page_key": "homepage",
    "scope_type": "university",
    "scope_id": null,
    "resolved_at": "2026-07-13T10:00:00+03:00",
    "hero": {
      "content": {
        "eyebrow": "Kisii University",
        "headline": "Shaping Tomorrow. Inspiring Innovation.",
        "highlight": "Transforming Communities.",
        "description": "A leading public university committed to academic excellence, innovative research and transforming communities.",
        "actions": [
          {
            "key": "explore-university",
            "label": "Explore Kisii University",
            "href": "/about-us",
            "style": "primary"
          },
          {
            "key": "explore-programmes",
            "label": "Explore Programmes",
            "href": "/programmes",
            "style": "secondary"
          }
        ]
      },
      "media": {
        "desktop": {},
        "mobile": {},
        "video": null,
        "poster": null,
        "focal_point": null
      },
      "admissions": {
        "state": "applications_open",
        "visible": true,
        "intake": {
          "id": "uuid",
          "name": "September 2026 Intake",
          "slug": "september-2026"
        },
        "application_phase": "standard",
        "closing_at": "2026-09-30T23:59:59+03:00",
        "countdown_target": "2026-09-30T23:59:59+03:00",
        "primary_action": {
          "type": "apply",
          "label": "Apply Now",
          "href": "https://application.kisiiuniversity.ac.ke",
          "open_in_new_tab": true
        },
        "secondary_actions": []
      },
      "facts": []
    },
    "sections": [],
    "partnership_spotlights": []
  }
}
```

The hidden response is explicit and predictable:

```json
{
  "state": "hidden",
  "visible": false,
  "intake": null,
  "application_phase": null,
  "closing_at": null,
  "countdown_target": null,
  "primary_action": null,
  "secondary_actions": []
}
```

Hero facts are returned only from approved, source-backed statistics. Unknown, zero, stale, or unapproved values are omitted.

## Administrative APIs

Resource-oriented endpoints:

```http
GET    /api/v1/intakes/{intake_id}/public-actions
POST   /api/v1/intakes/{intake_id}/public-actions
GET    /api/v1/intake-public-actions/{action_id}
PATCH  /api/v1/intake-public-actions/{action_id}
DELETE /api/v1/intake-public-actions/{action_id}
POST   /api/v1/intake-public-actions/{action_id}/workflow

GET    /api/v1/intakes/{intake_id}/milestones
POST   /api/v1/intakes/{intake_id}/milestones
GET    /api/v1/intake-milestones/{milestone_id}
PATCH  /api/v1/intake-milestones/{milestone_id}
DELETE /api/v1/intake-milestones/{milestone_id}
POST   /api/v1/intake-milestones/{milestone_id}/workflow

GET    /api/v1/intakes/{intake_id}/homepage-preview?at=<ISO-8601 timestamp>
```

Public intake serialization may expose only active, published actions and milestones. Administrative reads include workflow and audit metadata.

## Permissions

Add or align permissions:

- `admissions.view_intakes`
- `admissions.manage_intakes`
- `admissions.manage_public_actions`
- `admissions.review_public_actions`
- `admissions.publish_public_actions`

Admissions staff own operational dates and actions. Communications staff own hero presentation. A communications role cannot force applications open without the admissions permission.

## Frontend Design

The composed hero must render:

- actual desktop and mobile media using a responsive picture source;
- CMS-managed headline, highlighted line, description, and institutional CTAs;
- the resolved admissions panel when `visible` is true;
- an accessible countdown derived from `countdown_target`;
- no admissions markup when `visible` is false;
- verified hero facts only when provided.

The countdown must:

- announce the closing date in readable text;
- avoid announcing every second to screen readers;
- update visual units client-side;
- periodically correct against `resolved_at` and the target;
- stop at zero and trigger a data refresh;
- respect reduced-motion preferences.

If homepage composition fails, the institutional hero may use safe presentation fallback content, but it must not invent an admissions state or display Apply Now.

## Caching and Performance

- Resolve state at request time; no scheduled job is required merely to open or close a window.
- Cache the homepage briefly, approximately 30 to 60 seconds, while a timed admissions state is active.
- Permit a longer cache when the resolved state is hidden.
- Invalidate homepage cache after intake, action, milestone, or hero publication changes.
- Cache timestamps and targets, never a precomputed number of seconds remaining.
- Batch-load section media and admissions relationships to avoid per-section and per-action query loops.

## Error Handling

- Invalid admin payloads return the project's standard validation envelope.
- Missing intake or action records return `404`.
- Invalid workflow transitions return `409`.
- Insufficient permissions return `403`.
- Public composition suppresses invalid or incomplete actions and resolves to the next eligible state.
- Resolver diagnostics record why an action was rejected without leaking administrative details publicly.

## Migration and Compatibility

1. Create `intake_public_actions` and `intake_milestones`.
2. Add new timestamp, override, feature, priority, and timezone fields to `intakes`.
3. Backfill timestamp fields from legacy application dates using `Africa/Nairobi` and an explicitly documented closing time.
4. Seed or migrate valid Apply, Requirements, and Explore Programmes actions for genuinely active intakes only.
5. Do not migrate hard-coded `Admissions open` CMS copy as operational state.
6. Add the resolved `hero` field to the homepage response while retaining existing composition fields.
7. Update the frontend to consume the resolved contract.
8. Deprecate frontend open-intake reconciliation and later remove reliance on legacy `is_open`.

## Testing and Acceptance Criteria

Backend tests must cover:

- standard application window before, during, and after its boundaries;
- late applications disabled and enabled;
- force-open and force-hidden override expiry;
- application action missing, disabled, draft, scheduled, expired, or malformed;
- admission-letter action missing, enabled, scheduled, expired, and unpublished;
- application precedence over admission letters;
- overlapping intakes with deterministic priority;
- Nairobi timezone and daylight-offset-safe serialization;
- reporting milestone inclusion;
- hidden-state contract;
- workflow permissions and transitions;
- public exclusion of drafts and soft-deleted records;
- homepage composition query count and response shape.

Frontend tests must cover:

- applications-open panel;
- admission-letters panel;
- hidden panel with reclaimed layout space;
- countdown reaching zero and refreshing;
- desktop and mobile imagery;
- keyboard navigation and focus visibility;
- screen-reader countdown behavior;
- reduced motion;
- absent media and API failure without a false admissions CTA;
- responsive behavior from small phones through large desktop.

The feature is accepted when:

- the backend is the only authority deciding the public admissions state;
- administrators can publish and schedule admission-letter access per intake;
- no closed or misleading countdown state is visible;
- the homepage returns a predictable resolved hero response;
- the contextual header CTA and hero panel use the same resolved primary action;
- all relevant checks pass and implementation is committed through the project commit helper.
