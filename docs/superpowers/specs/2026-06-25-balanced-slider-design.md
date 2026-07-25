# Balanced Slider Design

## Purpose

Create a polished, flexible slider presentation for the main Kisii University website and the research portal. The design should feel modern and image-led, while keeping official university updates readable and easy to act on.

The visual direction is inspired by 21st.dev-style React and Tailwind hero, carousel, slider, and animated hero patterns: strong first-viewport imagery, crisp editorial hierarchy, restrained motion, and clear controls.

## Scope

This design covers:

- Main website homepage hero slider.
- Research homepage hero slider.
- Per-slide read-more links that can point to internal routes or external official pages.
- Responsive desktop and mobile presentation.
- Accessible controls, pause behavior, and reduced-motion handling.

This design does not require backend schema changes for the first implementation.

## Backend Fit

The main website slider backend already supports the full design through `SliderGroup` and `Slider`.

Main slider group fields used:

- `max_slides`
- `auto_play`
- `auto_play_duration`
- `show_navigation_dots`
- `show_arrows`
- `transition_effect`
- `location`
- `is_main`
- `is_public`
- `is_active`

Main slider fields used:

- `title`
- `subtitle`
- `plain_text`
- `rich_text`
- `desktop_media`
- `mobile_media`
- `external_url`
- `link_text`
- `open_in_new_tab`
- `start_datetime`
- `end_datetime`
- `archived_at`
- `display_order`

Research sliders have a simpler backend model but still support the required presentation:

- `title`
- `subtitle`
- `description`
- `cover_image_url`
- `thumbnail_url`
- `link_url`
- `link_text`
- `link_target`
- `overlay_color`
- `overlay_opacity`
- `text_color`
- `text_alignment`
- `starts_at`
- `ends_at`
- `display_order`

Research can use frontend defaults for autoplay, arrows, dots, and max slide behavior until a slider-group model is needed.

## Main Website Design

Use an editorial showcase hero.

Desktop layout:

- Full-width background image.
- Left-aligned content panel with strong contrast.
- Eyebrow from `subtitle`.
- Headline from `title`.
- Summary from `plain_text`, falling back to stripped `rich_text`.
- Primary CTA from `link_text`, falling back to `Read more`.
- CTA target from `external_url`.
- Bottom preview rail with the other slides, using thumbnails and short titles.
- Active slide progress indicator.
- Arrow controls when enabled by the slider group.

Mobile layout:

- Image remains full-bleed.
- Content moves into a bottom editorial panel.
- Preview rail becomes horizontal scroll.
- Arrows can be hidden if the preview rail and dots are enough.
- Text is clamped to avoid crowding the viewport.

The existing fixed secondary CTA such as `Explore Programmes` should be reduced or removed on official-update slides so the user action is focused on the active story.

## Research Design

Use the same design language with a darker research tone.

Desktop layout:

- Full-width image background.
- Dark overlay tuned from `overlay_color` and `overlay_opacity` when available.
- Editorial content panel with title, subtitle, and description.
- Primary CTA from `link_text`, falling back to `Read more`.
- CTA target from `link_url`.
- Preview rail showing upcoming research slides or events.
- Stats can remain, but should not crowd event-focused slides.

Mobile layout:

- Keep the image prominent.
- Move stats below the text or hide them when the slide is event-focused.
- Preserve one clear primary CTA.

Research should first support the existing static slides and then optionally load backend research sliders for `placement=homepage` and `slider_type=hero`.

## Link Behavior

Links must be normalized in one place.

- If the URL starts with `/`, use internal Next.js navigation.
- If the URL starts with `http://` or `https://`, treat it as external.
- For main sliders, `open_in_new_tab` controls `target="_blank"` and `rel="noopener noreferrer"`.
- For research sliders, `link_target="_blank"` controls external tab behavior.
- If no link exists, hide the CTA instead of rendering a dead button.

## Interaction

- Autoplay only when more than one slide exists.
- Pause autoplay on hover and keyboard focus.
- Respect `prefers-reduced-motion`.
- Keep arrow buttons keyboard accessible.
- Dots or preview buttons should expose `aria-current`.
- Slide changes should not resize the hero container.
- Long titles and summaries should be clamped responsively.

## Component Shape

Main site:

- Keep `LandingHero` as the public API used by the homepage.
- Add internal subcomponents for:
  - active slide media
  - editorial content
  - preview rail
  - controls
  - CTA link normalization

Research:

- Keep `ResearchImmersiveHero` as the public API used by research pages.
- Add matching subcomponents where useful.
- Extend the action type only if needed to carry external-link behavior.

Avoid a broad shared component until the two implementations settle. The main and research heroes have different data shapes and visual tone, so premature sharing would add mapping complexity.

## Fallbacks

Main site:

- If no API slides are returned, use the existing fallback Kisii University slide.
- If a slide lacks media, use the current fallback background.
- If a slide lacks body text, use a concise default institutional summary.

Research:

- If backend research sliders are unavailable, keep the current static slides.
- If an image is missing, use the current research hero image.

## Testing

Required checks:

- Main and research lint.
- Main and research typecheck.
- Existing seeder tests.
- Manual desktop and mobile review with three main slides and four research slides.

Visual cases to verify:

- Long title.
- Missing summary.
- Missing CTA.
- External official URL.
- Internal URL.
- Reduced motion.
- Keyboard navigation.
- Mobile preview rail.

## Rollout

1. Implement main `LandingHero` visual refresh using existing backend data.
2. Implement normalized CTA behavior.
3. Add the preview rail and active progress indicator.
4. Refresh `ResearchImmersiveHero` to match the balanced visual language.
5. Optionally wire research hero to backend `research_sliders` while preserving static fallback slides.

