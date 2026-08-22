import type { Metadata } from "next";
import { ksuBookman, ksuSans, ksuDisplay } from "@ksu/ui/fonts";
import { AccessibilityInitScript, AccessibilityShell } from "@ksu/ui";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://kisiiuniversity.ac.ke"),
  title: {
    default: "Kisii University",
    template: "%s | Kisii University",
  },
  description:
    "Kisii University public website focused on teaching, research, and community service.",
  keywords: [
    "Kisii University",
    "KSU",
    "Kenya",
    "University",
    "Admissions",
    "Academics",
    "Research",
    "Inclusivity and Borderlessness",
  ],
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Kisii University",
    description:
      "A public university platform centered on teaching, research, and community service.",
    url: "/",
    siteName: "Kisii University",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kisii University",
    description:
      "Explore academics, research, admissions, and public university life at Kisii University.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ksuBookman.variable} ${ksuSans.variable} ${ksuDisplay.variable}`}
    >
      <body
        suppressHydrationWarning
        className="font-sans antialiased"
      >
        <AccessibilityInitScript />
        <AccessibilityShell mainContentId="main-content">
          {children}
        </AccessibilityShell>
      </body>
    </html>
  );
}
