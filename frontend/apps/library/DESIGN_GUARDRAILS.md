# Library Design Guardrails

These guardrails keep the library public pages aligned with the current Kisii University public design system while preserving useful structure from the previous library implementation.

## Shell

- Keep the shared public shell from `src/app/layout.tsx`: `MiniHeader`, `LibraryHeader`, page content, then `PublicFooter`.
- Do not replace the utility bar or footer with library-specific variants.
- Keep the main library navigation in `src/components/library-header.tsx`.
- Navigation labels should stay task-oriented and short: Overview, About, Catalog, E-resources, Services, Branches, Support, Hours, Leadership, Staff, Downloads.
- Add new public library routes to the main navbar only when they are first-class user journeys.

## Visual System

- Use the current public theme tokens from `src/app/globals.css`: `primary`, `secondary`, `background`, `foreground`, `muted`, `border`, and `ring`.
- Keep Inter/system sans typography through the Tailwind font tokens.
- Use restrained university blue/orange accents; avoid introducing a separate library palette.
- Use `max-w-[1320px]`, section padding, slate neutrals, and token colors used by `LibraryHero`, `LibrarySection`, and `IconCard`.
- Cards should remain `rounded-lg border border-slate-200 bg-white p-5 shadow-sm`; avoid nested cards.
- Use full-width page sections with constrained inner content. Do not create floating page-section cards.

## Page Composition

- Start public pages with `LibraryHero` and breadcrumbs.
- Follow heroes with `LibrarySection` blocks using alternating `tone="white"` and default light bands when a page has multiple sections.
- Keep page headings descriptive and user-task focused.
- Use compact dashboard-like summaries only when they are backed by real API data.
- Keep forms dense and functional: labels, controls, submit button, clear-filter link when filters are active.
- Empty states should use `StatusMessage` and explain what data is missing without exposing implementation details.

## Data Display

- Public pages should consume normalized data from `src/lib/library-public-data.ts`.
- Do not map legacy backend fields directly inside page components.
- Keep old data compatibility in the data layer only, including:
  - branch `location`, `contact_email`, `contact_phone`, `opening_hours`
  - catalog `author`, `type`, `quantity`, `available_quantity`, `is_available`
  - electronic resource `title`, `url`, `type`
  - staff `department_section` and nested `person` fields
- Page components should render current names such as `address`, `email`, `phone`, `authors`, `resource_type`, and `available_copies`.
- Use `compactText`, `formatLabel`, and `safeExternalUrl` for text cleanup, labels, and outbound URLs.

## Components

- Prefer shared library components from `src/components/library-ui.tsx` before adding page-local UI.
- Use lucide icons through existing component helpers when possible.
- Keep icon buttons square or circular with clear `aria-label` text.
- Links that leave the site should use `ExternalAnchor`.
- New repeated item layouts should be small reusable components only when more than one page needs them.

## Accessibility And Responsiveness

- Every page must keep `main id="library-main"` for the skip link.
- Form controls need visible labels connected with `htmlFor`.
- Interactive icon-only controls need `aria-label`.
- Maintain stable responsive grids with explicit breakpoints.
- Avoid text that can overflow compact cards; prefer wrapping and smaller headings inside cards.
- Do not use viewport-width font sizing.

## Avoid

- Do not reintroduce the old standalone library visual style.
- Do not add marketing-style split hero cards, decorative blobs, or oversized illustration-only sections.
- Do not use hard-coded colors when a theme token or existing slate utility fits.
- Do not duplicate the public footer, mini header, or navbar in page files.
- Do not put API calls directly in page components when the data belongs in the shared library data loader.

## Verification

Before committing library design changes, run the relevant targeted checks:

```bash
pnpm --filter @ksu/library lint
pnpm --filter @ksu/library typecheck
```

If API-client library types or endpoints changed, also run:

```bash
pnpm --filter @ksu/api-client typecheck
```
