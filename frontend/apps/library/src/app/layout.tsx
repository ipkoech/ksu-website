import type { Metadata } from "next";
import { ksuSans, ksuDisplay } from "@ksu/ui/fonts";
import { AccessibilityInitScript, AccessibilityShell } from "@ksu/ui";
import { MiniHeader } from "@ksu/ui/layout/public";
import { LibraryHeader } from "../components/library-header";
import { LibraryFooter } from "../components/library-footer";
import { LibraryAssistantLauncher } from "../components/library-assistant-launcher";
import { getLibraryTodayHours } from "../lib/library-public-data";
import { publicFrontendUrl } from "../lib/service-urls";
import "./globals.css";

const socialLinks = {
  facebook: "https://facebook.com/kisiiuniversity",
  twitter: "https://twitter.com/kisiiuniversity",
  instagram: "https://instagram.com/kisiiuniversity",
  youtube: "https://youtube.com/kisiiuniversity",
  linkedin: "https://linkedin.com/school/kisiiuniversity",
};

const contactInfo = {
  address: "Main Campus, Kisii",
  phone: "+254720875082",
  email: "info@kisiiuniversity.ac.ke",
};

const miniQuickLinks = [
  {
    label: "Main Site",
    href: publicFrontendUrl,
    external: true,
  },
  {
    label: "Catalog",
    href: "/catalog",
  },
  {
    label: "E-resources",
    href: "/electronic",
  },
  {
    label: "Branches",
    href: "/services#branches-heading",
  },
  { label: "Hours", href: "/contact#hours" },
  { label: "Repository", href: "/electronic#external-links" },
  { label: "Ask", href: "/ask" },
];

export const metadata: Metadata = {
  title: {
    default: "KSU Library",
    template: "%s | KSU Library",
  },
  description: "Kisii University Library - Digital Resources and Services",
  manifest: "/site.webmanifest",
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const todayHours = await getLibraryTodayHours();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ksuSans.variable} ${ksuDisplay.variable}`}
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AccessibilityInitScript />
        <AccessibilityShell mainContentId="library-main">
          <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,#ffffff_38%,hsl(var(--surface-muted))_100%)] text-foreground">
            <MiniHeader
              contactInfo={contactInfo}
              quickLinks={miniQuickLinks}
              socialLinks={socialLinks}
            />
            <LibraryHeader todayHours={todayHours.data[0] ?? null} />
            {children}
            <LibraryAssistantLauncher />
            <LibraryFooter contactInfo={contactInfo} />
          </div>
        </AccessibilityShell>
      </body>
    </html>
  );
}
