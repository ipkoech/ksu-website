# URW Bookman — licence and provenance

`bookman-regular.woff2`, `bookman-italic.woff2`, `bookman-demi.woff2` and
`bookman-demi-italic.woff2` are **URW Bookman** from the URW++ Base35 font
set, converted to WOFF2 with no other modification.

| WOFF2 file                  | Source OTF                    |
| --------------------------- | ----------------------------- |
| `bookman-regular.woff2`     | `URWBookman-Light.otf`        |
| `bookman-italic.woff2`      | `URWBookman-LightItalic.otf`  |
| `bookman-demi.woff2`        | `URWBookman-Demi.otf`         |
| `bookman-demi-italic.woff2` | `URWBookman-DemiItalic.otf`   |

- Upstream: https://github.com/ArtifexSoftware/urw-base35-fonts
- Copyright: 2015 URW Software; 2013, 2014 (URW)++ Design & Development
- Licence: **AGPL-3 with the URW font exception**

## Why not Bookman Old Style itself

Bookman Old Style is a Monotype font bundled with Windows and Microsoft
Office. It is not licensed for redistribution and is absent on macOS, Linux
and Android, so naming it in a CSS font stack silently fell through to Arial
for most visitors.

URW Bookman is metric-compatible with Bookman Old Style: the same widths and
proportions, so a page set in either occupies the same space. Machines that
do have Bookman Old Style installed still use it — it is listed first in the
`--font-sans` / `--font-display` stacks in `packages/ui/src/globals.css`, and
this webfont serves everyone else.

## The font exception

> As a special exception, permission is granted to include these font
> programs in a Postscript or PDF file that consists of a document that
> contains text to be displayed or printed using this font, regardless of the
> conditions or license applying to the document itself.

Serving the font files to a browser so it can render text is the ordinary,
intended use of the package and does not place the site's own source under
the AGPL. Keep this notice alongside the files if they are moved.
