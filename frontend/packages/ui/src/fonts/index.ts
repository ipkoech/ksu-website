import localFont from "next/font/local";

/* Shared KSU brand faces, self-hosted — no build-time or runtime dependency
   on Google Fonts.

   Usage in an app's root layout:

     import { ksuBookman, ksuSans, ksuDisplay } from "@ksu/ui/fonts";
     <html className={`${ksuBookman.variable} ${ksuSans.variable} ${ksuDisplay.variable}`}>

   The variables feed --font-sans / --font-display in globals.css, which back
   the `font-sans` and `font-display` Tailwind utilities. Requires "@ksu/ui"
   in the app's transpilePackages (already true for all apps). */

/**
 * The institutional face.
 *
 * Bookman Old Style itself is a licensed Monotype font that ships with
 * Windows and Office, so it cannot be redistributed — on macOS, Linux and
 * Android it simply is not there, and the page silently fell back to Arial
 * for most visitors. These are URW Bookman (URW++ Base35), which is metric-
 * compatible with Bookman Old Style and is distributed under AGPL-3 *with
 * the font exception* that permits exactly this kind of embedding. See
 * fonts/LICENSE-bookman.md.
 *
 * Light and Demi are the two weights URW ships. They are mapped to 400 and
 * 600/700 so `font-medium` and `font-semibold` resolve to Demi instead of
 * being synthesised into a smeared faux-bold.
 */
export const ksuBookman = localFont({
  src: [
    { path: "./bookman-regular.woff2", weight: "400", style: "normal" },
    { path: "./bookman-italic.woff2", weight: "400", style: "italic" },
    { path: "./bookman-demi.woff2", weight: "600 700", style: "normal" },
    { path: "./bookman-demi-italic.woff2", weight: "600 700", style: "italic" },
  ],
  display: "swap",
  // Bookman runs large for its point size; the fallback metrics are adjusted
  // so the swap from Arial does not reflow the page.
  fallback: ["Arial", "Helvetica", "sans-serif"],
  variable: "--app-font-bookman",
});

export const ksuSans = localFont({
  src: "./inter-var.woff2",
  display: "swap",
  weight: "100 900",
  variable: "--app-font-sans",
});

export const ksuDisplay = localFont({
  src: [
    {
      path: "./fraunces-var.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "./fraunces-italic-var.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  display: "swap",
  variable: "--app-font-display",
});
