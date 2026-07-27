# WCAG 2.2 Accessibility Assessment

## Assessment status

**Outcome: conformance not determined.**

This report records a representative technical assessment against WCAG 2.2
Level AA. It is release evidence, not a certification or a claim that every
page, state, document, or item of media conforms. A conformance claim can only
follow completion of the outstanding manual, assistive-technology,
authenticated, media-alternative, and data-backed checks listed below.

- Assessment date: 2026-07-27
- Code baseline: `8d9593c4` plus the remediations described in this report
- Browser: Google Chrome 150.0.7871.46, driven by Playwright CLI
- Target: WCAG 2.2 Level AA

## Scope and method

The product scope is the four user-facing frontends:

- Public website
- Administration frontend
- Research frontend
- Library frontend

This assessment followed the representative-sample approach in WCAG-EM:
define the scope and target, explore the product, select varied journeys,
evaluate the sample, record findings, and identify untested states. The current
session sampled public programme, admissions, media, research, catalogue,
search, support, donation, and detail journeys. Earlier automated coverage
included all four frontend shells and shared accessibility controls.

The browser review used these effective viewport widths:

- 1280 CSS pixels for the desktop baseline
- 640 CSS pixels as a 200% zoom equivalent
- 320 CSS pixels as a 400% reflow equivalent
- Chromium forced-colours emulation for a preliminary high-contrast review

At each sampled width, the review checked document-level horizontal overflow,
heading presence, labelled form controls, visible and operable navigation, and
content clipping. Forced-colour review checked the continued visibility of
text, controls, boundaries, icons, selected states, and focus treatment.

## Representative sample

| Frontend | Sampled journeys |
| --- | --- |
| Public website | `/academics/programmes`, `/admissions`, `/media`, `/media/gallery`, shared content detail and programme detail templates |
| Research | `/projects`, `/search`, `/publications`, `/resources-tools`, `/donate`, shared research detail template |
| Library | `/catalog`, `/search`, `/electronic`, `/ask` |
| Administration | Shared shell and data-table behaviour covered by the earlier automated baseline; authenticated journeys were unavailable in this session |

## Results and remediations

### Reflow and zoom

- The sampled public, research, and library pages had no document-level
  horizontal overflow at 640 or 320 CSS pixels.
- The admissions comparison table retains horizontal scrolling because its
  two-dimensional relationships require a table. Its scroll container is now a
  labelled, keyboard-focusable region with a visible focus indicator.
- The library section navigation clipped later links at 320 CSS pixels. It now
  wraps onto additional lines so every destination remains visible and
  operable.

### Structure and navigation

- The Media Desk overview lacked a level-one heading. It now has a single,
  descriptive `h1` and introductory text.
- Nested `main` landmarks were removed from admissions, academic listings,
  programme details, media listings, and content details. The shared public
  shell remains the single primary `main` landmark.
- The selected admissions pathway now exposes `aria-current="page"` and an
  explicit keyboard focus indicator.
- Research detail breadcrumbs now expose the current page and hide decorative
  separators from assistive technology.

### Controls and focus

- Research detail hero actions and gallery-detail actions now meet the shared
  minimum control-height convention and have explicit focus-visible styling.
- Gallery media links now state that the destination opens in a new tab.
- Sampled research and library forms did not expose unlabelled input elements
  in the rendered states reviewed.

### Forced colours

Chromium forced-colours emulation was reviewed on representative public,
research, and library pages. Text, control boundaries, form controls, icons,
and primary actions remained distinguishable in the sampled states. This is a
preliminary pass only; native Windows High Contrast testing remains required.

## WCAG evidence summary

| Principle | Sampled evidence | Status |
| --- | --- | --- |
| Perceivable | Heading hierarchy, labelled inputs, 200%/400% reflow, and forced-colour visibility reviewed; media alternatives remain incomplete evidence | Partial |
| Operable | Skip links and panel focus were covered earlier; sampled navigation, focus indicators, target sizing, and keyboard-scrollable table were remediated | Partial |
| Understandable | Current-page state, breadcrumb context, explicit new-tab wording, validation/status work from the earlier remediation | Partial |
| Robust | Landmark structure and programmatic states improved; desktop and mobile screen-reader interoperability remains unverified | Partial |

No frontend currently has enough completed evidence for a WCAG 2.2 Level AA
conformance claim.

## Limitations and required follow-up

- The isolated browser session could not successfully load every API-backed
  data set. Data-rich results, populated detail records, submission
  success/failure, and pagination states therefore require a connected retest.
- The administration frontend requires an authenticated test account and
  representative user roles.
- Chromium forced-colours emulation is not a substitute for native Windows High
  Contrast mode.
- Viewport-width equivalence was used for reflow review. Manual browser zoom at
  200% and 400% on supported desktop browsers is still required.
- NVDA, JAWS, VoiceOver, and TalkBack sessions have not been completed.
- Published videos require an asset-by-asset captions, audio-description, and
  transcript review. The application cannot infer or generate accurate
  alternatives from the current media records.
- PDFs and other downloadable documents require their own accessibility
  assessment.
- Testing with people with disabilities is strongly recommended before a
  conformance decision because technical checks do not establish real-world
  usability.

Detailed outstanding sessions and evidence fields are maintained in
`docs/accessibility/manual-test-matrix.md`.
