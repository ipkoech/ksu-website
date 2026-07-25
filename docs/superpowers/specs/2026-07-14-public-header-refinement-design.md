# Public Header Refinement Design

## Scope

Refine the shared public-site header across the homepage and every page rendered through `PageShell`. The announcement strip will be removed system-wide. Existing navigation content, menu behavior, responsive breakpoints, logo sizing, and header stickiness remain unchanged.

## Header Structure

The public header will contain two visible layers:

1. A primary-coloured mini-header containing contact details, utility links, and search.
2. The main white navigation header containing the university identity, navigation menus, and action buttons.

The announcement layer and its homepage data handoff will be removed rather than hidden. This avoids rendering and fetching content that is no longer displayed.

## Visual Changes

- Change the mini-header background from the secondary colour to the established `primary` theme token.
- Render contact details, utility links, and search in solid white for maximum contrast.
- Keep the existing subtle white border, divider, and hover states.
- Increase the main navigation height by exactly 20%:
  - Default/mobile height: 89px to 107px.
  - Large-screen height: 82px to 98px.
- Keep the current logo, typography, navigation, and button sizes so the additional height creates breathing room without changing hierarchy.

## Implementation Boundaries

- Remove `AnnouncementHeader` from the homepage and shared `PageShell`.
- Remove announcement-component imports and announcement-fetching code that become unused in `site-shell.tsx`.
- Keep homepage announcement data available to existing homepage data composition unless it is independently proven unused; this change only removes the header presentation.
- Update the shared `MiniHeader` and `PublicHeader` components so all public consumers receive the new styling.
- Do not modify announcement listing pages or links to official announcements elsewhere on the site.

## Verification

Per the user's instruction, no new automated tests will be added. Verification will consist of existing lint and type checks plus browser inspection at desktop and mobile widths, confirming:

- No announcement strip is present on the homepage or an internal public page.
- Mini-header text is visibly white on the primary background.
- Main-header heights are 107px and 98px at their respective breakpoints.
- Sticky navigation, menus, and mobile controls continue to work.
- There is no horizontal overflow or runtime console error.
