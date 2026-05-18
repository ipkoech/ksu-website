# About History Design Notes

## Final Design Summary

Selected direction: bold modern institutional timeline.

The final design presents `/about/history` as a public storytelling page for Kisii University's verified institutional journey from its 1965 teacher training origin to the 2013 charter. It keeps the current KSU public header, public actions, blue/orange/slate brand system, and About navigation logic while giving the timeline a clearer visual structure.

## Why This Direction Won

This direction scored highest for visual hierarchy, mobile clarity, and product truthfulness. The horizontal desktop year ribbon and grouped mobile era cards make the page easier to scan than the current redirected About experience, while staying feasible for the existing Next.js/Tailwind component system.

## Key Sections

- Public header with existing navigation and Apply Now action.
- Breadcrumb: Home / About / History.
- Dark slate hero with campus image, page title, verified summary, and action hierarchy.
- Timeline ribbon: 1965, 1983, 1994, 1999, 2007, 2013.
- Era sections: Foundations, Academic Growth, Chartered University.
- Trust note: public history content is read from university profile and fallback timeline data.
- Quick facts: 1965, 61 acres, Main Campus in Kisii, 8 published schools, 2013 charter.
- Related links: Governance & Leadership, University Management, Service Charter, Back to About, Explore programmes.

## Action Hierarchy

Primary: Explore programmes.

Secondary: View governance.

Tertiary: Back to About and related About links.

Header CTA: Apply Now remains available as in the existing public site.

## Visual Guidance

Use the existing KSU palette: deep slate, white, pale blue, primary blue `#3B82F6`, and orange `#F97316`. Headings should follow the current Playfair-style display treatment; body and navigation text should remain Inter-like. The design should avoid decorative orbs and keep cards implementable with existing border, shadow, and spacing conventions.

## Desktop Behavior

Desktop prioritizes the hero and full timeline ribbon, then groups content by era. Related links and quick facts sit below the timeline to keep the page focused on reading first and navigation second.

## Mobile Behavior

Mobile uses a stacked dark hero, large touch targets, a compact year selector, and grouped era cards. The primary and secondary actions stay near the top, while related links remain reachable after the timeline.

## Accessibility Notes

The design uses high-contrast slate/white surfaces, large headings, readable milestone rows, and touch-friendly mobile rows. Future implementation should preserve semantic headings, descriptive link labels, keyboard focus styles, and accessible contrast for orange-on-dark and blue-on-light states.

## Product Truthfulness Constraints

Do not add rankings, testimonials, awards, partner logos, admissions metrics, maps, downloads, donation flows, or admin controls. Do not claim the charter was granted by CUE. The 2007 milestone must remain Egerton University, not any other institution.

## Implementation Notes

No implementation was performed. A future build can source `UniversityInfo.history_summary`, `UniversityInfo.quick_facts`, and the existing `historyTimeline` fallback from `frontend/apps/web/src/lib/about-data.ts`.

## Self-Evaluation

Three directions were generated with the `imagegen` skill: conservative, modern polished, and bold/experimental. Weak assets were regenerated where they introduced nav drift, unsupported claims, or incorrect milestone text. The final desktop and mobile assets passed the satisfaction rubric with no critical failures.

