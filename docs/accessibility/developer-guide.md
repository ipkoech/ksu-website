# Accessibility Developer Guide

This guide applies to the public web, admin, research, and library frontends.
The shared accessibility layer provides consistent preferences and navigation,
but each feature remains responsible for semantic markup, keyboard operation,
clear content, and assistive-technology testing.

## Install the shared shell

Every root layout must render `AccessibilityInitScript` before interactive
content and wrap the application with `AccessibilityShell`:

```tsx
import {
  AccessibilityInitScript,
  AccessibilityShell,
} from "@ksu/ui";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AccessibilityInitScript />
        <AccessibilityShell mainContentId="main-content">
          <main id="main-content">{children}</main>
        </AccessibilityShell>
      </body>
    </html>
  );
}
```

Use one stable, unique main-content ID per application. The shell supplies the
skip link, preference provider, accessibility panel, and floating page-tools
dock. Do not add a second skip link in an app shell.

The initialization script applies saved preferences before hydration to reduce
visual flashing. Preferences are versioned and stored locally under
`ksu:accessibility:v1`. Invalid or unavailable storage falls back safely to
defaults.

## Preferences and presets

The panel supports four starting presets:

- Low vision: larger text, increased contrast, emphasized links, and larger
  controls.
- Reduced motion: removes non-essential animation and pauses moving content.
- Reading support: readable font and increased line, letter, and word spacing.
- Motor assistance: larger controls and paused moving content.

Users may adjust individual settings after choosing a preset. Components that
need behavioral—not just visual—changes can use `useAccessibility()` and read
`effectiveReduceMotion`, which combines the user's setting with the operating
system's `prefers-reduced-motion` value.

Do not describe presets as disability diagnoses, lock a user into a preset, or
override browser zoom, screen-reader, forced-color, or operating-system
settings.

## Add contextual floating actions

The floating dock owns the accessibility icon. A page-level action such as
"Send message" should portal an icon-only button into
`KSU_CONTEXTUAL_ACTION_SLOT_ID`. The button must have a concise accessible name
and must not duplicate another floating action elsewhere on the page.

If the action opens a side panel:

- use a named dialog/sheet primitive;
- move focus into the panel;
- contain focus while it is open;
- support Escape;
- restore focus to the exact trigger when it closes;
- keep validation errors associated with their fields; and
- announce submission success or failure through a live region.

## Component requirements

- Prefer native elements before adding ARIA.
- Give every control an accessible name that describes its action.
- Keep focus order aligned with the visual and reading order.
- Never remove the visible focus indicator without an equally visible
  replacement.
- Use headings in a logical hierarchy and landmarks for page regions.
- Provide useful alternative text for informative images and empty alternative
  text for decorative images.
- Do not rely on color, position, shape, sound, or animation alone.
- Keep pointer targets at least 44 by 44 CSS pixels where practical.
- Make status, validation, and async updates perceivable without surprise focus
  changes.
- Test long text, 200% zoom, 400% reflow, reduced motion, and forced colors.

## Motion and high-contrast behavior

CSS animation and transition rules must honor both
`prefers-reduced-motion: reduce` and the root accessibility data attributes.
Critical information must never exist only in an animation. Carousels, tickers,
and other automatically moving regions require a keyboard-operable pause
control.

Avoid disabling native outlines or replacing semantic controls with styled
containers. In forced-colors mode, preserve boundaries, focus, selected state,
and icons using system colors or `currentColor`; test instead of assuming brand
colors will survive.

## Verification

From `frontend/`, run:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm test:e2e:accessibility
```

The Playwright suite checks the shared panel, skip-link focus, persistence,
reset, key focus behavior, and serious/critical axe findings across all four
frontends. Run a single project with `--project=web`, `admin`, `research`, or
`library`.

Automated checks cannot evaluate whether alternative text is useful, reading
order is understandable, keyboard interaction is efficient, zoomed layouts are
usable, or screen-reader announcements make sense. Record those checks in
`manual-test-matrix.md`. A zero-violation axe result is not a WCAG conformance
claim.

## Definition of done

A changed journey is complete only when relevant unit and browser checks pass,
keyboard behavior is verified, zoom/reflow and forced-colors behavior are
reviewed, and the applicable desktop and mobile screen-reader checks are
recorded. Findings need an owner or linked follow-up; do not mark an unperformed
manual check as passing.
