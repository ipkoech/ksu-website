# Frontend Visual Contract

## Purpose

This contract defines the frontend-controlled visual rules for public website designs. New design work in `designs/` must follow this contract unless the frontend implementation is intentionally changed first.

The goal is to stop generated page designs from inventing new shells, logos, navigation, footers, route behavior, or unsupported content while still allowing page-level layout improvements.

## Controlling Sources

| Area | Source |
| --- | --- |
| Public shell sequence | `frontend/apps/web/src/components/site-shell.tsx` |
| Homepage shell usage | `frontend/apps/web/src/app/page.tsx` |
| Header and navigation | `frontend/packages/ui/src/components/layout/public/public-header.tsx` |
| Mini header | `frontend/packages/ui/src/components/layout/public/mini-header.tsx` |
| Announcement bar | `frontend/packages/ui/src/components/layout/public/announcement-bar.tsx` |
| Footer | `frontend/packages/ui/src/components/layout/public/public-footer.tsx` |
| Global tokens | `frontend/packages/ui/src/globals.css` |
| Tailwind theme | `frontend/apps/web/tailwind.config.ts` |
| About data and fallbacks | `frontend/apps/web/src/lib/about-data.ts` |
| About shared components | `frontend/apps/web/src/components/about/` |
| Homepage academic section | `frontend/apps/web/src/components/home/academic-section.tsx` |

Designs may cite these files in notes. They should not override them silently.

## Global Shell

Public pages use this visual order:

1. `Announcements`
2. `MiniHeader`
3. `PublicHeader`
4. page content
5. `PublicFooter`

The standard page background is:

```txt
min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_38%,#f6f8fc_100%)] text-slate-950
```

Homepage may use a transparent header over the hero, but it must still use the same public header, mini header, announcement, and footer components.

## Logo And Brand Lockups

Use the frontend asset:

```txt
/logos/ksu-logo.png
```

Do not introduce alternate crests, redesigned seals, extra mottos, or inconsistent lockups in generated designs. Avoid slogans such as "Fons Scientiae", "Foundation of Knowledge", or "Fostering Innovation" unless those are added to the frontend component or approved as page content.

The visible header brand is currently `Kisii University`. The component controls its size, placement, and mobile behavior.

## Header Rules

The current `PublicHeader` is fixed, uses the real KSU logo, and has:

- `h-20` on base layouts and `lg:h-24` on large screens.
- white/backdrop header when solid.
- transparent mode only when the page passes `transparent`.
- mobile menu via a left `Sheet`.
- `Apply Now` linking to `/admissions/how-to-apply`.

Desktop navigation order:

1. About
2. Administration
3. Admissions
4. Academics
5. Campus Life
6. News
7. Research
8. Library

About menu order:

1. Overview
2. History
3. Mission & Vision
4. Governance
5. Leadership
6. Quality Assurance

The main header currently does not own a visible search button. Search appears in the mini header. Do not add a main-header search affordance in visual designs unless the frontend component is changed first.

## Mini Header Rules

`MiniHeader` is hidden below `sm`. It uses a dark background and contains:

- contact information on the left.
- quick links on the right.
- search.
- social links when provided.

Default contact values are frontend controlled:

```txt
P.O. Box 408-40200, Kisii
+254 XXX XXX XXX
info@kisiiuniversity.ac.ke
```

Do not invent precise phone numbers in designs unless they are in frontend data or approved source content.

## Announcement Rules

Announcement bars are component-driven. Designs may show an announcement strip, but they should not vary its structure page by page.

Current visual variants are:

- `info`: primary blue
- `warning`: secondary orange
- `urgent`: red
- `success`: green

The page design should remain valid whether an announcement is visible or dismissed.

## Footer Rules

Use the `PublicFooter` structure. Desktop footer columns are:

1. Brand/contact column
2. Quick Links
3. Academics
4. Admissions
5. Resources

Mobile footer uses accordion columns. Do not invent new footer group names per page unless the footer component changes.

## Color Tokens

Use frontend tokens and Tailwind classes rather than page-specific palettes.

| Role | Token / value |
| --- | --- |
| Primary | `hsl(var(--primary))`, brand blue `#3B82F6` |
| Secondary | `hsl(var(--secondary))`, orange `#F97316` |
| Foreground | `hsl(var(--foreground))`, slate-like navy |
| Background | `hsl(var(--background))`, white |
| Muted | `hsl(var(--muted))`, pale blue-gray |
| Border | `hsl(var(--border))` |
| Deep panels | `slate-950` or `gray-900` |

Green, purple, amber, and red may appear only as semantic/status accents. They should not become page-level brand themes.

## Typography

The app loads:

- Inter as `--font-sans`
- Playfair Display as `--font-display`

Use Playfair-style display typography for major page titles and hero headings. Use sans-serif UI typography for body copy, navigation, cards, labels, buttons, metadata, and forms.

Do not create page-specific type scales. Use the global token scale from `frontend/packages/ui/src/globals.css`.

## Layout Rules

Default content containers should follow frontend patterns:

- `max-w-7xl mx-auto px-4`
- `container`
- `px-4 sm:px-6 lg:px-8`
- section spacing near `py-10`, `py-14`, `py-16`, `py-20`, or `py-24` depending on page density.

Cards should use frontend-like treatments:

- white surface.
- `border border-slate-200`.
- rounded values close to `rounded-[1.5rem]`, `rounded-[1.75rem]`, or `rounded-[2rem]` where existing components use them.
- shadows from the frontend style family.

Avoid changing the shell width, header height, footer layout, or nav behavior per page.

## Reusable Component Vocabulary

Designs should map page regions to existing or intended frontend components.

Existing public/about components include:

- `PageShell`
- `BreadcrumbTrail`
- `PageHeading`
- `SectionHeading`
- `HomepageHeroFallback`
- `AcademicSection`
- `CTA`
- `LeaderCard`
- `BoardMemberGrid`
- `Timeline`
- `ValueCard`
- `AccreditationBadge`
- `AboutUsSection`

If a visual needs a new component, the design notes must name it and explain why existing components are insufficient.

## Route Truth

Do not design a route as canonical if the frontend redirects it.

Design notes must state one of:

- `Canonical`: route is implemented and should receive production design refinement.
- `Redirected`: route currently redirects; design is exploratory until architecture changes.
- `Aspirational`: route/page does not exist yet.
- `Deprecated`: design should be archived or folded into another page.

When a standalone route is redirected, the design should either target the canonical destination or be clearly marked deferred.

## Asset Requirements

Every design folder should contain:

- `design-notes.md`
- one desktop asset.
- one mobile asset.

Desktop assets must be landscape. Preferred sizes:

- `1536 x 1024`
- `1440 x 1024`
- `1440 x 1200`

Mobile assets should represent a phone-width layout and must be named clearly.

Do not label portrait assets as desktop. If an asset is intentionally a long-page desktop capture, the notes must say so explicitly.

## Review Checklist

Before a design is considered final:

- It uses the real frontend logo and shell.
- Header and footer match the component structure.
- Navigation order matches `PublicHeader`.
- Route status matches the frontend.
- Page CTAs link to supported routes.
- Contact data is sourced or explicitly placeholder.
- Colors and type follow frontend tokens.
- Page-level layout maps to existing components or named new components.
- Mobile ordering preserves the same information architecture.
- The desktop asset is actually desktop-shaped.
- The design avoids unsupported rankings, metrics, dashboards, forms, deadlines, testimonials, or admin controls.

