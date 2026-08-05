import localFont from "next/font/local";

/* Shared KSU brand faces, self-hosted variable fonts — no build-time or
   runtime dependency on Google Fonts. Latin subsets, full weight ranges.

   Usage in an app's root layout:

     import { ksuSans, ksuDisplay } from "@ksu/ui/fonts";
     <html className={`${ksuSans.variable} ${ksuDisplay.variable}`}>

   The variables feed --font-sans / --font-display in globals.css, which
   back the `font-sans` and `font-display` Tailwind utilities. Requires
   "@ksu/ui" in the app's transpilePackages (already true for all apps). */

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
