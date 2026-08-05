# Entity-Aware Public Inquiries and School Overview Design

**Date:** 2026-07-18  
**Status:** Approved for implementation

## Purpose

Improve public entity pages without replacing the current Kisii University
visual language. The school overview will use its cover image as the primary
visual, remove repeated headings, surface programmes and departments, and
present a more useful mobile reading order.

The same release will add a public inquiry experience that is explicitly
addressed to a university, school, department, office, or person. Every
submission must resolve a real backend entity and an accountable inbox owner.

## Scope

This design covers:

- the public school overview page;
- a reusable floating inquiry launcher and responsive inquiry dialog;
- university, school, department, office, and person inquiry targets;
- backend target resolution, ownership, storage, spam controls, and replies;
- school-portal visibility for school-owned inquiries;
- a central administrative inbox for non-school-owned inquiries;
- responsive, accessibility, contract, API, and browser tests.

It does not introduce live chat, file attachments, anonymous reply tracking,
or manually curated programme and department feature flags.

## Design Principles

- Preserve the existing institutional header, palette, typography, cover-image
  treatment, rounded geometry, and three-column desktop rhythm.
- Show an entity name prominently once. Supporting sections use short labels
  such as "About this school" rather than repeating the full name.
- Resolve entity identity and ownership on the server. Client-supplied IDs or
  ownership fields are never trusted.
- Keep the inquiry target distinct from its inbox owner. A message may target
  a person while being owned by that person's school or university unit.
- Use one conversation model and reply workflow for every target type.
- Prefer existing public `display_order` values over new curation controls.

## School Overview Information Architecture

### Desktop

The existing three-column layout remains at extra-large breakpoints.

The left rail contains school quick links and university-level pathways. The
main column contains:

1. the school cover image;
2. a concise dean introduction and message preview;
3. the school overview;
4. mission, vision, and mandate.

The right rail contains:

1. up to four public programmes, ordered by `display_order` and then name;
2. up to four public departments, ordered by `display_order` and then name;
3. compact contact details and school facts;
4. links to the complete programme and department listings.

The entity header is the only prominent full school title. The breadcrumb may
retain the school name for navigation context, while the content card uses
"About this school" or the school code.

### Dean Message

The desktop card shows a bounded preview and a "Read full message" control when
the content exceeds the preview. The complete text is available without page
navigation. The control is absent when the complete text already fits.

On small screens the card begins with a compact portrait, name, title, and a
short preview. This prevents the dean message from consuming the entire first
viewport.

### Mobile and Tablet

Below the desktop three-column breakpoint, content becomes one column in this
order:

1. cover image;
2. short school introduction;
3. dean message preview;
4. school quick actions;
5. featured programmes;
6. departments;
7. mission, vision, and mandate;
8. contact details and secondary school facts.

Quick actions use two columns on phones and four on tablets. Programmes and
departments use compact stacked rows rather than horizontal carousels. Secondary
facts use an accessible disclosure on phones. No content requires horizontal
scrolling.

## Featured Programme and Department Selection

Featured content is automatic:

- include only active, public records belonging to the current school;
- order by `display_order` ascending and then name ascending;
- display at most four records in each list;
- do not render an empty section;
- show "View all" only when the complete collection contains more records.

This reuses current administration ordering and requires no schema or editorial
workflow changes.

## Entity-Aware Inquiry Data Model

`contact_inquiries` remains the single conversation root. Add:

- `target_entity_type`, constrained to `university`, `school`, `department`,
  `office`, or `person`;
- `target_entity_id`, containing the resolved entity UUID;
- `target_entity_name`, an immutable display snapshot used in historical
  records and outbound messages;
- `target_entity_slug`, the public identifier at submission time;
- `owner_scope_type`, containing `university`, `division`, `wing`, `school`,
  or `department`;
- `owner_scope_id`, nullable only when `owner_scope_type` is `university`;
- `source_page_url`, containing the normalized same-origin public page path.

The existing `school_id` becomes nullable and remains during the compatibility
period. It is populated whenever the owner is a school so current school-portal
queries and integrations remain safe while they migrate to owner-scope fields.

Existing records are backfilled as school targets and school owners using their
current `school_id`. The migration adds indexes for target lookup, owner inbox
queries, and owner/status/last-message sorting. It also adds database checks for
supported target and owner values.

## Target Resolution and Ownership

The public API accepts a target type and public slug, not a target ID:

`POST /api/v1/public/entities/{entity_type}/{entity_slug}/inquiries`

The server loads an active, public entity and derives its owner:

| Target | Owner |
| --- | --- |
| University | University |
| School | That school |
| Academic department | Its parent school |
| Administrative department | Its wing, division, or university parent |
| Office | Its represented wing, division, department, or university scope |
| Person | The owner of the person's primary active public assignment |

For a person with several current assignments, `is_primary` wins, followed by
the lowest `hierarchy_level`, then `display_order`. A school or department
assignment rolls up to its school inbox when a parent school exists. If no
eligible public assignment can be resolved, public inquiry submission is not
offered on that person's page and the endpoint returns a not-found response.

An office is resolved from the public administrative entity represented by the
page, including a division, wing, directorate-like department, or registered
contact-directory scope. It is exposed to the public contract as the normalized
target type `office`.

The existing school endpoint remains temporarily as a compatibility wrapper
around the new resolver.

## Submission Contract

The dialog submits:

- sender name;
- sender email;
- optional phone;
- category;
- subject;
- message;
- consent to contact;
- an empty honeypot field;
- the current same-origin page path.

The route keeps the existing five-submissions-per-five-minutes rate limit,
message spam classification, reference-number generation, requester message
creation, domain events, and audit metadata. Domain events use the derived
owner scope and include target type and target ID in event data.

The API returns the inquiry ID, public reference number, status, target display
name, and owner display label. It never returns private entity data or an
assigned staff member.

## Inbox and Reply Behavior

School-owned inquiries appear in the existing School Portal inquiry area.
Filters add target type and target name so staff can distinguish messages sent
to the school, a department, or a school-associated person. Existing school
permissions continue to control view, manage, and reply actions.

University-, division-, wing-, and administrative department-owned inquiries
appear in a central administrative inquiry view protected by the appropriate
scope-aware inquiry permissions or `admin:*`. The list and detail views reuse
the school inquiry conversation, assignment, status, note, reply, and retry
patterns rather than creating a second ticket workflow.

Outbound replies keep the requester as recipient and include the target entity
name in the subject and template context. Internal notes are never delivered.

## Public Inquiry Interface

### Launcher

An entity detail page renders the floating launcher only when it has a resolved
inquiry target. On desktop the control includes the message icon and "Send a
message." On narrow screens it becomes a labelled icon button for assistive
technology and respects bottom safe-area insets.

The launcher remains clear of persistent navigation and does not cover page
actions. It uses the current primary brand color, a visible focus state, and no
layout-shifting hover transform.

### Dialog

The heading names the target, for example:

- "Send a message to Kisii University";
- "Send a message to the School of Agriculture and Natural Resources
  Management";
- "Send a message to Dr. Judith Odhiambo."

Desktop uses a modal dialog. Phones use a near-full-screen sheet with a sticky
submit area and room for the on-screen keyboard. Both render the complete form,
entity badge, privacy explanation, and expected-response guidance.

The dialog traps focus, closes with Escape, restores focus to the launcher, and
uses sequential headings and explicit field labels. Validation errors are
associated with their fields and announced. Submission disables duplicate
actions without discarding form contents.

Success replaces the form with the reference number, target name, and a close
action. Rate-limit, validation, entity-unavailable, and server errors use
specific messages and retain user input where retrying is appropriate.

## Page Integration

The launcher is integrated into:

- the university public overview;
- school overview and school section pages;
- academic and administrative department pages;
- administration office pages;
- public person and staff profile pages.

Every integration passes a server-resolved public target descriptor containing
only type, slug, display name, and availability. The client dialog never
constructs ownership information.

## Accessibility and Performance

- Maintain a single page `h1` and sequential heading hierarchy.
- Keep body text at accessible contrast and touch targets at least 44px.
- Give the cover image a stable aspect ratio to prevent layout shift.
- Respect `prefers-reduced-motion` for reveal and dialog transitions.
- Lazy-load dialog implementation where practical while keeping the launcher
  immediately interactive.
- Validate at 375px, 390px, 768px, 1024px, and 1440px widths.

## Testing

Backend tests cover:

- migration backfill and constraints;
- resolution and ownership for every target type;
- person primary-assignment precedence;
- rejection of inactive, private, unknown, or unowned entities;
- spoofed IDs and owner fields being impossible through the public schema;
- spam classification, rate limiting, consent, reference numbers, and events;
- owner-scoped list, detail, assign, note, reply, and retry authorization;
- compatibility behavior of the legacy school endpoint.

Frontend tests cover:

- featured ordering, limits, empty states, and "View all" behavior;
- removal of repeated content headings;
- entity-specific dialog headings and request paths;
- complete form validation and retained values after retryable errors;
- success reference display;
- launcher availability for each supported detail page;
- keyboard focus, Escape behavior, accessible names, and mobile sheet layout.

Browser verification covers the school page and one page for every other target
type at phone, tablet, and desktop widths.

## Rollout

1. Add and backfill the inquiry target and owner columns.
2. Add resolver, generic public endpoint, and owner-scoped service queries.
3. Preserve the legacy school route as a wrapper.
4. Update School Portal filters and add the central administrative inbox.
5. Add the reusable public launcher and dialog.
6. Integrate entity pages and revise the school overview.
7. Run backend, frontend, accessibility, and responsive browser checks.
8. Remove the legacy school route and compatibility-only `school_id` behavior
   in a later release after all clients have migrated.
