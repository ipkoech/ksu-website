# University Governance Administration Design

## Context

The Kisii University CMS needs a seamless University Governance administration module for the public University Council page. Administrators must create, organise, review, publish, preview, archive, and reorder Council members without code changes. The public page must render names, portraits, role labels, hierarchy, ordering, mandate, and profile links from backend-managed content only.

The existing backend already has the correct foundation:

- `Person` is the permanent human profile.
- `Board` represents governance bodies such as University Council, Senate, Management Board, and committees.
- `StaffAssignment` links a person to a board, office, school, department, research unit, library, or other entity.
- `StaffAssignment` already stores `hierarchy_level`, `reports_to_id`, `display_order`, term dates, status, and public visibility.

This design reuses those models instead of creating a duplicate governance-person table.

## Goals

- Add a professional University Governance admin workspace under `About -> University Governance -> University Council`.
- Let authorised users add and edit Council members through a guided form.
- Support configurable Council role categories and badge labels.
- Preserve appointment history across terms and role changes.
- Manage Council hero and mandate content from the backend.
- Provide a drag-and-drop Council ordering interface.
- Require review and publication workflow before public changes appear.
- Render the public University Council page and member profile pages from published backend data.
- Ensure public cards are clickable, accessible, responsive, and ordered exactly as configured.

## Non-Goals

- Replacing the existing `Person`, `Board`, or `StaffAssignment` models.
- Building a generic visual org-chart product for every portal in the first pass.
- Publishing unreviewed Council profile changes immediately.
- Hard-coding Council names, roles, portraits, or section ordering in the frontend.
- Creating separate public sections for every role category unless the backend configuration says to do so.

## Recommended Approach

Use existing records as the source of truth:

- `Person`: permanent profile, name, biography, portrait, CV, contact fields, qualifications, and external links.
- `Board`: University Council and other governance bodies.
- `StaffAssignment`: the Council appointment record and organogram node.

Add governance-specific support around those records:

- `GovernanceRole`: configurable role/category metadata.
- `GovernancePageContent`: hero, mandate, document CTA, and page-level media.
- Governance appointment and workflow fields on `StaffAssignment`.
- Governance audit/version logging through the existing content workflow/audit patterns.

This keeps one person identity, while allowing one person to serve multiple Council terms or return later in a different role.

## Data Model

### Existing Models To Reuse

`Person` remains the permanent member profile. It should carry or expose:

- full name and display name fields;
- salutation/title;
- professional title and post-nominals;
- short biography and full biography;
- portrait media reference;
- CV media reference;
- contact fields;
- qualifications, memberships, awards, and research/publication metadata;
- public profile slug support.

`Board` remains the governance body. The University Council is a `Board` with a stable slug such as `university-council`.

`StaffAssignment` represents a Council appointment. For Council members, it uses:

- `entity_type = "board"`;
- `entity_id = <university council board id>`;
- `person_id`;
- `role`;
- `title`;
- `hierarchy_level`;
- `reports_to_id`;
- `display_order`;
- `is_public`;
- `status`;
- term dates and appointment dates.

### New Model: GovernanceRole

`governance_roles` stores configurable role/category metadata.

Fields:

- `id`
- `name`
- `slug`
- `category`
- `display_group`: `chairperson`, `member`, `secretary`, or future groups
- `public_label`
- `default_hierarchy_level`
- `default_display_order`
- `badge_style`
- `description`
- `is_active`
- `created_by_id`
- `updated_by_id`
- `created_at`
- `updated_at`
- `deleted_at`

Initial roles:

- Chairperson
- Council Member
- Government Representative
- Senate Representative
- Student Representative
- Industry Representative
- External Representative
- Secretary to Council

### New Model: GovernancePageContent

`governance_page_content` stores page-specific Council content.

Fields:

- `id`
- `board_id`
- `page_key`
- `title`
- `intro`
- `breadcrumb_label`
- `hero_image_id`
- `hero_focal_point`
- `overlay_intensity`
- `mandate_label`
- `mandate_heading`
- `mandate_body`
- `mandate_icon`
- `document_cta_label`
- `document_cta_url`
- `status`
- `workflow_status`
- `submitted_by_id`
- `approved_by_id`
- `published_by_id`
- `submitted_at`
- `approved_at`
- `published_at`
- `unpublished_at`
- `created_by_id`
- `updated_by_id`
- `created_at`
- `updated_at`

### Governance Appointment Fields

Add governance appointment metadata directly to Council `StaffAssignment` records. This keeps each appointment/term as the auditable node and avoids a second appointment table that would mirror existing assignment semantics.

Fields:

- `governance_role_id`
- `appointment_category`
- `official_designation`
- `public_role_label`
- `represented_institution`
- `current_office`
- `appointing_authority`
- `appointment_reference`
- `term_number`
- `is_ex_officio`
- `is_voting_member`
- `is_acting`
- `show_contact_publicly`
- `profile_slug`
- `profile_summary`
- `appointment_status`
- `workflow_status`
- `submitted_by_id`
- `approved_by_id`
- `published_by_id`
- `submitted_at`
- `approved_at`
- `published_at`
- `unpublished_at`
- `archived_at`
- `publish_without_portrait_override`
- `publication_notes`

Appointment statuses:

- `draft`
- `submitted`
- `approved`
- `published`
- `inactive`
- `term_ended`
- `archived`
- `vacant`

## Admin Dashboard

Add a University Governance dashboard with clear operational stats:

- Total active Council members
- Chairperson
- Council members
- Government representatives
- Other representatives
- Secretary to Council
- Draft profiles
- Published profiles
- Inactive profiles
- Vacant positions
- Last update date

Primary actions:

- Add Council Member
- Manage Display Order
- Preview Public Page
- Preview Member Profile
- Publish Changes
- View Archived Members

The UI should avoid raw UUIDs. Relationship fields must use searchable selectors showing human names, role labels, board names, and statuses.

## Member Editor

The add/edit flow should be a guided side panel or full editor with sections:

- Personal information: name, display name, salutation, profile slug, short summary, full biography.
- Council designation: role, appointment category, official designation, public role label, display group, display order.
- Appointment information: appointment date, start date, end date, term number, appointing authority, reference, ex-officio state, voting state, current/former state.
- Portrait: upload, select from media library, replace, remove, alt text, caption, photographer, copyright owner, approval state.
- Profile sections: biography, qualifications, career history, governance experience, public service experience, council responsibilities, committees, awards, publications, memberships.
- Contact details: official email, telephone, office location, postal address, plus public visibility toggle.
- External links: LinkedIn, ORCID, Google Scholar, ResearchGate, professional website, government profile, institutional profile.

The editor should show public-card preview while editing.

## Display Order And Organogram

Add a drag-and-drop order manager for the University Council board.

The standard public grouping is:

1. Chairperson
2. Council Members
3. Secretary to Council

The Council Members group contains all configured member roles, including government, senate, student, industry, and external representatives. Their role appears as a badge, not a separate public section unless the backend role configuration requests a separate section.

Saving drag-and-drop changes updates:

- `display_order` for exact sibling order;
- `hierarchy_level` for chairperson/member/secretary grouping;
- `reports_to_id` only when an explicit hierarchy relationship is configured.

The backend must validate that:

- all reordered assignments belong to the same Council board;
- no inactive, deleted, or unrelated assignments are included;
- order values are unique within the relevant public grouping;
- there is no reporting cycle;
- only one active published chairperson exists unless explicitly configured;
- only one active published secretary exists unless explicitly configured.

## Workflow

Use the shared content workflow style already present in the codebase.

Workflow:

1. Draft
2. Submitted for Review
3. Approved
4. Published
5. Inactive or Archived

Editing a published profile should move the editable draft state back into review unless the user has explicit publish authority. Public endpoints should return only approved and published Council content.

Required workflow actions:

- submit for review
- request changes
- approve
- publish
- unpublish
- archive
- restore archived version from recorded workflow/audit history

Unpublish remains an admin action.

## Permissions

Suggested permissions:

- `governance.view`
- `governance.manage_boards`
- `governance.manage_roles`
- `governance.manage_members`
- `governance.manage_order`
- `governance.review`
- `governance.approve`
- `governance.publish`
- `governance.archive`
- `media.manage`
- `workflow.approve`

Suggested role mapping:

- Super Administrator: full access.
- Admin: manage boards, roles, members, ordering, approval, publication where granted.
- Corporate Communications: create/edit profiles, upload portraits, preview, submit for review.
- Council Secretariat: manage official names, roles, appointment information, display order, terms, and appointment state.
- ICT Administrator: technical support, media support, publication only where authorised.
- Reviewer/Approver: review, comment, approve, reject, or return changes.

## API Design

### Admin APIs

Use existing `/api/v1` style and response envelopes.

Endpoints:

- `GET /api/v1/governance/admin/council/dashboard`
- `GET /api/v1/governance/admin/roles`
- `POST /api/v1/governance/admin/roles`
- `PATCH /api/v1/governance/admin/roles/{role_id}`
- `GET /api/v1/governance/admin/council/members`
- `POST /api/v1/governance/admin/council/members`
- `GET /api/v1/governance/admin/council/members/{assignment_id}`
- `PATCH /api/v1/governance/admin/council/members/{assignment_id}`
- `DELETE /api/v1/governance/admin/council/members/{assignment_id}`
- `GET /api/v1/governance/admin/council/order`
- `PUT /api/v1/governance/admin/council/order`
- `GET /api/v1/governance/admin/council/page-content`
- `PATCH /api/v1/governance/admin/council/page-content`
- `GET /api/v1/governance/admin/council/preview`
- `POST /api/v1/governance/admin/council/members/{assignment_id}/submit-review`
- `POST /api/v1/governance/admin/council/members/{assignment_id}/approve`
- `POST /api/v1/governance/admin/council/members/{assignment_id}/publish`
- `POST /api/v1/governance/admin/council/members/{assignment_id}/unpublish`
- `POST /api/v1/governance/admin/council/members/{assignment_id}/archive`
- `GET /api/v1/governance/admin/council/audit-log`

### Public APIs

Endpoints:

- `GET /api/v1/public/university-council`
- `GET /api/v1/public/university-council/{slug}`

The existing public governance endpoints may delegate to this service to avoid duplicate response logic.

### Public Listing Contract

```json
{
  "page": {
    "title": "University Council",
    "description": "The University Council is the governing body of Kisii University.",
    "hero_image": {
      "url": "/media/university-council-hero.webp",
      "alt": "University Council boardroom"
    },
    "breadcrumb": ["Home", "About KSU", "University Council"]
  },
  "mandate": {
    "label": "Our Mandate",
    "heading": "Our Mandate",
    "description": "To provide strategic oversight, ensure good governance and uphold accountability.",
    "document_cta": {
      "label": "Council Charter & Governance Documents",
      "href": "/about/governance/documents"
    }
  },
  "chairperson": {
    "name": "Prof. Jane A. Onyango",
    "role": "Chairperson",
    "slug": "prof-jane-a-onyango",
    "portrait": {
      "url": "/media/council/jane-onyango.webp",
      "alt": "Prof. Jane A. Onyango, Chairperson"
    }
  },
  "members": [
    {
      "name": "Hon. Mary N. Mokua",
      "role": "Government Representative",
      "slug": "hon-mary-n-mokua",
      "portrait": {
        "url": "/media/council/mary-mokua.webp",
        "alt": "Hon. Mary N. Mokua, Government Representative"
      },
      "display_order": 1
    }
  ],
  "secretary": {
    "name": "Mr. Nathan Oyori Ogechi",
    "role": "Secretary to Council",
    "slug": "nathan-oyori-ogechi",
    "portrait": {
      "url": "/media/council/nathan-ogechi.webp",
      "alt": "Mr. Nathan Oyori Ogechi, Secretary to Council"
    }
  }
}
```

## Public Frontend

The public University Council page should render:

- backend-managed hero;
- short mandate panel;
- centered Chairperson card;
- Council Members grid in official backend order;
- centered Secretary to Council card;
- clickable cards and portraits;
- individual profile links;
- footer and existing Kisii University theme.

The page must not infer order alphabetically, by creation date, by database ID, or by category name.

Profile URL:

- `/about/university-council/{slug}`

Profile pages show only published and public fields.

## Accessibility And Responsiveness

Cards must be keyboard accessible and open with Enter or Space. Focus states must be visible. Portrait alt text should include the person name and role. Role labels must not rely on colour alone.

Responsive layout:

- desktop: centered chairperson, spacious member grid, centered secretary;
- tablet: two or three cards per row;
- mobile: one or two cards per row with no horizontal overflow.

Do not compress all members into one row.

## Validation

Required for publication:

- full name;
- profile slug;
- public role label;
- appointment category;
- display order;
- valid appointment status;
- approved portrait unless override is recorded;
- valid appointment dates;
- unique active profile slug;
- no duplicate display order in the same public group.

Warnings:

- term has expired;
- missing portrait;
- missing biography;
- government representative has no represented institution;
- multiple active chairpersons;
- multiple active secretaries;
- incomplete appointment authority/reference.

The first implementation should surface expired terms as dashboard warnings and filters. It should not automatically change public appointment state without an explicit administrator action.

## Audit And Version History

Track:

- profile created;
- name changed;
- designation changed;
- category changed;
- portrait replaced;
- appointment dates changed;
- display order changed;
- submitted, approved, published, unpublished, archived;
- reason/comment and approval reference where supplied.

Audit entries should record user, timestamp, previous value, new value, action, and target record.

## Testing

Backend tests:

- create role and list active roles;
- create Council member assignment with governance metadata;
- reject duplicate active chairperson publication;
- reject duplicate active secretary publication;
- save drag-and-drop order and preserve exact order;
- reject order payloads containing records from another board;
- reject reporting cycles;
- public listing returns only published records;
- archived and draft members are hidden publicly;
- profile endpoint hides internal fields;
- workflow actions enforce permissions;
- portrait requirement blocks publication unless override is present.

Frontend/admin tests:

- dashboard stats render definite counts;
- add/edit member form submits shaped payloads without raw UUID display;
- relationship selectors show readable labels;
- drag-and-drop order persists after reload;
- preview uses the public data contract;
- publish/unpublish/archive actions update visible state.

Public frontend tests:

- Council page renders hero and mandate from API;
- chairperson, members, and secretary render in backend order;
- card links point to profile pages;
- keyboard focus and accessible labels are present;
- mobile layouts have no horizontal overflow.

## Implementation Decomposition

This work should be implemented subagent-driven after the implementation plan is approved:

- Backend schema/service/API subagent.
- Admin dashboard/editor/order-manager subagent.
- Public page/profile rendering subagent.
- Test and verification subagent.

Subagents should share the written API contracts and avoid overlapping edits to the same files where possible.

## Acceptance Criteria

The module is complete when:

- administrators can create and edit Council members;
- roles and representative categories are configurable;
- official order can be managed by drag-and-drop;
- only approved and published profiles appear publicly;
- chairperson, members, representatives, and secretary are clearly displayed;
- every card is clickable and accessible;
- individual Council profile pages exist;
- government representative details are editable and visible only where appropriate;
- appointment history is retained;
- acting, inactive, former, archived, and vacant states are supported;
- portraits are centrally managed through media;
- desktop, tablet, and mobile views render cleanly;
- all workflow changes are logged;
- future Council changes do not require frontend code changes;
- no member names, roles, categories, portraits, or hierarchy are hard-coded in the public frontend.
