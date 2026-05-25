# Programme And School Detail Redesign

## Status

- Routes covered: `/academics/schools/[slug]` and `/academics/programmes/[slug]`
- Visual generation used: yes, built-in `imagegen`
- Reference board: `designs/programme-school-detail-redesign/programme-school-detail-redesign-imagegen-board.png`
- Implementation target: public web app only
- Implementation screenshots:
  - `designs/programme-school-detail-redesign/school-detail-desktop-implemented.png`
  - `designs/programme-school-detail-redesign/school-detail-mobile-implemented.png`
  - `designs/programme-school-detail-redesign/programme-detail-desktop-implemented.png`
  - `designs/programme-school-detail-redesign/programme-detail-mobile-implemented.png`

## Context Passed To Imagegen

The prompt used the current school detail screenshot, the existing school detail design board, the school remaining pages board, and the frontend visual contract. It kept the real public shell sequence: orange announcement bar, dark mini header, contextual entity header for school detail, page body, and public footer.

The generated direction emphasized:

- a dedicated page body instead of generic back-office cards
- a strong top summary panel with compact source fields
- a facts rail for codes, counts, departments, duration, modes, and contacts
- a deep navy emphasis block for dean or admissions guidance
- mobile-first single-column content with compact quick actions

## Implementation Notes

- School detail remains under the contextual `EntityHeader`.
- Programme detail keeps the public header but now has a dedicated record layout.
- Public copy avoids implementation language such as API, guardrail, or source boundaries.
- Unknown or unpublished fields are hidden or shown as neutral "not published yet" states.
