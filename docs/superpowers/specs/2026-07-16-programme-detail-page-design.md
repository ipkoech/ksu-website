# Programme Detail Page Design

## Goal

Redesign the public programme detail page so applicants can scan it quickly while still seeing every field in the approved Programme Information Template. Preserve the existing Kisii University visual language: royal blue, white cards, slate text, restrained gold accents, rounded corners, subtle borders, and light shadows.

## Information architecture

The page displays the 12 required programme fields in this order:

1. The hero contains the programme name, a short excerpt from About the Programme, the primary application action, and an optional programme brief.
2. A single quick-facts strip contains programme level, mode of study, duration, and intake months.
3. The main column contains About the Programme, Entry Requirements, Career Opportunities, and Fees Structure.
4. A narrow sidebar contains Programme Code, Department, and Accreditation Status, followed by one application-support card.
5. Related programmes may appear after the required content when related records exist.

The hero excerpt and full About section come from the same field, but the excerpt is truncated and is not presented as a second independent section. Facts appear in one place only. The page does not show the previous section-navigation sidebar, learning-focus duplicate, curriculum placeholder, tutor cards, credits, capacity, updated date, intake cards, or four-step application pathway.

## Responsive layout

Desktop uses a wide content column and a narrow sticky details sidebar. Tablet and mobile use one column in reading order: hero, facts, About, Entry Requirements, Career Opportunities, Fees Structure, Programme Details, and application support. The four-item facts strip wraps into a two-by-two grid on small screens.

## Content behavior

- Rich text in About, Entry Requirements, and Career Opportunities retains paragraphs and lists.
- Fees Structure accepts the existing JSON field. The preferred shape is a row collection with `item`, `amount`, and `notes`. Compatible object shapes are normalized for display. If no usable fee rows exist, the section says that fees are to be confirmed.
- Intake months are joined into one readable value, including multiple months.
- Level and mode values are converted from stored identifiers such as `bachelor` and `full_time` into public labels.
- Accreditation is displayed as a status badge. Recognized public states are Accredited, Pending accreditation, Under review, and Not yet accredited; other published values remain readable rather than being discarded.
- Optional programme brief and related-programme areas are omitted when their data is absent.
- Required template fields without content receive one concise fallback in their section. Empty optional records never create multiple “Not published” rows.

## Programme illustration strategy

Every programme already supports `cover_image_id`. The public hero uses that media record when present and a deterministic academic-category icon treatment when absent. No image is generated at request time.

Custom illustrations are created as an editorial batch and uploaded through the existing admin media picker. Each asset follows one visual system:

- landscape composition suitable for the hero panel;
- one programme-specific academic symbol or still-life scene;
- royal-blue linework or simplified forms on white or pale blue;
- one restrained gold accent;
- no embedded text, logos, faces, watermarks, or photographic claims;
- generous clear space and strong contrast;
- descriptive media metadata and alt text based on the programme, not the filename.

Example concepts include scales and an open book for Law, a circuit board and terminal for Computer Science, crops and field tools for Agriculture, and a stethoscope with an anatomy book for Health Sciences. The generation prompt uses the programme name, department, and a short subject summary while keeping the shared art direction fixed. Editors review each result for subject accuracy and visual consistency before uploading it and selecting it as the programme cover image.

## Components and data flow

`getProgrammeDetailData` continues to fetch the programme and related programmes. It also requests the existing cover-image relation or resolves the existing media identifier for the hero. The page component normalizes public labels, fee rows, accreditation presentation, and rich-text content before rendering focused sections.

The current programme admin form remains the source of truth. Its existing Cover Image media picker supplies the custom illustration, and its existing Fees Structure JSON editor supplies structured rows. No database migration is required for this page redesign.

## Accessibility and interaction

- The page has one `h1` and sequential section headings.
- Rich-text lists remain semantic lists; fees use a semantic table with a mobile-safe overflow container.
- Status is communicated by text, not color alone.
- Buttons and links retain visible focus states and minimum touch targets.
- Decorative fallback icons are hidden from assistive technology; uploaded cover illustrations use meaningful alternative text.
- The layout avoids horizontal overflow and respects reduced-motion behavior already provided by the site shell.

## Verification

Add contract tests for the required labels, removal of duplicate legacy sections, fee normalization, public value formatting, cover-image preference, and fallback illustration behavior. Run the focused frontend tests, lint/type checks, and a production build as appropriate. Inspect the page at desktop and mobile widths with Playwright, verify the 12 template fields are represented, confirm there are no console errors or horizontal overflow, and compare the desktop result with the approved mockup.

