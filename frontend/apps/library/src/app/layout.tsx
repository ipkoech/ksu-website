import type { Metadata } from "next";
import { MiniHeader, PublicFooter } from "@ksu/ui/layout/public";
import { Announcements } from "@ksu/ui/components";
import { announcementsApi } from "@ksu/api-client";
import { LibraryHeader } from "../components/library-header";
import { libraryFrontendUrl, publicFrontendUrl, researchFrontendUrl } from "../lib/service-urls";
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
  { label: "Hours", href: "/hours" },
  { label: "Repository", href: "/repositories" },
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
  let announcements: Array<{ id: string; message: string; linkText?: string; linkHref?: string }> = [];
  try {
    const response = await announcementsApi.list({
      is_published: true,
      per_page: 3,
      fields: "id,title,slug",
    });
    announcements = (response.data ?? []).map((item) => ({
      id: item.id,
      message: item.title,
      linkText: "Read more",
      linkHref: `/media/announcements/${item.slug}`,
    }));
  } catch {
    // announcements are optional
  }

  return (
    <html lang="en">
      <body className="font-sans antialiased" suppressHydrationWarning>
        <div className="min-h-screen bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,#ffffff_38%,hsl(var(--surface-muted))_100%)] text-foreground">
          <a href="#library-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-md focus:ring-2 focus:ring-ring">
            Skip to library content
          </a>
          <Announcements
            announcements={announcements}
            rotating={announcements.length > 1}
            intervalMs={6500}
            background="secondary"
          />
          <MiniHeader
            contactInfo={contactInfo}
            quickLinks={miniQuickLinks}
            socialLinks={socialLinks}
          />
          <LibraryHeader />
          {children}
          <PublicFooter
            contactInfo={contactInfo}
            libraryHref={libraryFrontendUrl}
            researchHref={researchFrontendUrl}
            socialLinks={socialLinks}
          />
        </div>
      </body>
    </html>
  );
}
