# Responsive Landing And List Redesign

## Purpose

Create a consistent, responsive public interface across the main website, research portal, and library portal. The redesign should make the first screen direct and image-led, keep search visible on list pages, move filters and sorting out of the page body, and remove homepage sections that make the public site feel crowded or story-heavy.

## Scope

This design covers:

- Main website homepage hero and first content section.
- Research homepage hero.
- Library homepage hero.
- Public list-page search, filter, and sort controls.
- Responsive card density, empty states, and pagination-friendly layouts.

This design does not change backend schemas. It uses existing API data and existing environment-based cross-service URLs.

## Design Direction

The public landing pages should use one hero language:

- Full-width, image-led background.
- Strong readable overlay.
- Short eyebrow, headline, summary, and one or two clear actions.
- Stable container height so slide changes do not shift the page.
- No card-heavy first viewport.
- No decorative page-highlights section immediately after the hero.

The visual reference is the broad interaction model of NVIDIA-style product heroes: strong media, direct headline, controlled CTA group, restrained controls, and a clear next section visible below.

## Landing Hero Rules

Main, research, and library landing pages should use the same responsive hero proportions:

- Desktop: approximately `70vh`, with sensible min/max bounds so the hero is neither too short on laptops nor too tall on large monitors.
- Tablet: shorter but still image-led, with content kept above the fold.
- Mobile: controlled fixed/min height, compact text, smaller buttons, and no preview rail that competes with the headline.

Hero content rules:

- One primary CTA.
- Optional secondary CTA only when it supports a real user path.
- Text is clamped on small screens.
- Dots and arrows are compact and accessible.
- Autoplay pauses on hover and focus.
- Reduced-motion users do not get animated slide transitions.

Stats should not appear in the hero. If a service has no records, avoid showing `0` statistics in the first viewport.

## Main Homepage Structure

Remove the current stats/trust facts section after the hero.

Immediately after the hero, show a three-column section on desktop:

1. Schools and academics.
2. Message from the Vice Chancellor.
3. Quick actions, admissions, or service links.

Responsive behavior:

- Desktop: three equal or intentionally weighted columns.
- Tablet: two-column layout where the VC message can span or stack cleanly.
- Mobile: single-column compact cards with smaller buttons and tighter spacing.

The section should be direct and scannable. It should avoid long story copy and should hide empty record groups instead of filling the layout with generic placeholders.

## Research Homepage Structure

Research should adopt the same landing hero system and sizing as the main site while keeping its research color tone and imagery.

Research stats should be removed from the hero. If impact metrics are needed, they should appear later in a clean records section only when meaningful values exist.

The research homepage can keep workflow cards, but they should appear after the hero and quick pathway navigation in a compact grid.

## Library Homepage Structure

Library should adopt the same landing hero system and sizing as the main site and research portal.

The current library snapshot/stats block should be removed from the hero. Library workflows and quick access cards should follow the hero in compact grids.

## Search, Filter, And Sort

On list pages, search stays visible and takes the width of the content area. Filters and sorting move into a dialog interaction.

Desktop behavior:

- A `Filter` button opens a right-side drawer.
- The drawer contains filters, sorting, apply, reset, and close controls.
- The drawer width should be comfortable for forms without covering the whole page.

Mobile behavior:

- The same `Filter` button opens a bottom sheet.
- The bottom sheet should use large enough touch targets but compact vertical spacing.
- Search remains outside the sheet.

List page header behavior:

- Search field is first and full width.
- Filter button sits beside or below the search field depending on viewport width.
- Active filters render as removable chips below the search field.
- Result count remains visible but should not dominate the page.

Form behavior:

- Search uses existing URL query parameters.
- Apply submits or navigates with selected filter and sort parameters.
- Reset returns to the list route without filter parameters.
- The drawer or sheet closes after applying filters.
- Keyboard focus stays inside the dialog while open and returns to the trigger on close.

## List Cards And Empty States

List cards should be compact and grid-friendly:

- Desktop: two or three columns when records support card scanning.
- Tablet: two columns.
- Mobile: one column with smaller padding, smaller headings, and compact metadata rows.

For long record sets, the layout should be pagination-ready. If backend pagination exists, preserve it. If a page currently filters a local in-memory list, keep the redesign compatible with future pagination but do not invent backend behavior.

Empty states:

- Show a concise message.
- Offer a reset-filter action when filters are active.
- Do not show dummy records or fake stats.

## Component Boundaries

Main website:

- Keep `LandingHero` as the main homepage API.
- Refactor internal hero layout to match the shared landing rules.
- Replace the post-hero stats section with a new compact three-column homepage section.
- Update `PublicListFilterForm` to support visible search plus filter drawer/sheet.

Research:

- Update `ResearchImmersiveHero` to match the shared hero rules.
- Update `ResearchFilterForm` to use the drawer/sheet model.
- Preserve existing research data mapping and route query behavior.

Library:

- Update `LibraryHero` to match the shared hero rules.
- Remove hero stats usage from the library homepage.
- Add or adapt a library list toolbar pattern for search plus filter drawer/sheet where list pages expose filters.

Shared implementation:

- Prefer a small reusable client component for the responsive filter dialog if dependencies allow it.
- Avoid forcing all three apps into one large shared hero component until data shapes are better aligned.
- Keep colors and theme tokens from each app.

## Accessibility

- Dialogs need `role="dialog"` or a framework equivalent.
- The drawer/sheet must have a visible title.
- Escape closes the dialog.
- Focus is trapped while open and restored after close.
- Filter buttons must expose whether filters are active.
- Hero controls must remain keyboard accessible.
- Text and controls must not overlap at mobile, tablet, or desktop widths.

## Testing

Required verification:

- Typecheck and lint for affected frontend apps.
- Desktop screenshot for main, research, and library homepages.
- Mobile screenshot for main, research, and library homepages.
- Desktop and mobile test of at least one main list page and one research list page with filters.
- Verify empty state behavior for filtered zero-record results.
- Verify no hero stats render on the three landing pages.
- Verify no visible search/filter/sort controls overflow on mobile.

## Rollout

1. Build the shared filter drawer/sheet pattern.
2. Update main list-page filtering to visible search plus drawer/sheet filters.
3. Update research list-page filtering to the same interaction.
4. Align main `LandingHero` to the shared hero rules and remove the post-hero stats section.
5. Build the new three-column post-hero homepage section.
6. Align research and library heroes to the same responsive proportions.
7. Remove hero stats from research and library.
8. Run responsive browser verification before deployment.
