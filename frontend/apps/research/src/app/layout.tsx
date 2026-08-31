import type { Metadata } from "next";
import { ksuBookman, ksuSans, ksuDisplay } from "@ksu/ui/fonts";
import { AccessibilityInitScript, AccessibilityShell } from "@ksu/ui";
import { PublicFooter } from "@ksu/ui/layout/public";
import { Announcements } from "@ksu/ui/components";
import { announcementsApi } from "@ksu/api-client";
import { unstable_cache } from "next/cache";
import { ResearchHeader } from "../components/research-header";
import { getResearchSiteContext } from "../lib/research-site-context";
import "./globals.css";
import {
  institutionContact,
  institutionSocialLinks,
  researchSiteUrl,
} from "../config/institution";

const contactInfo: { address: string; phone: string; email: string } = {
  address: institutionContact.postalAddress,
  phone: institutionContact.phone,
  email: institutionContact.email,
};

const researchFooterColumns = [
  {
    title: "Research",
    links: [
      { label: "Projects", href: "/projects" },
      { label: "Publications", href: "/publications" },
      { label: "Research Centers", href: "/centers" },
      { label: "Expertise", href: "/expertise" },
      { label: "Community Impact", href: "/community-impact" },
    ],
  },
  {
    title: "Innovation",
    links: [
      { label: "Innovations", href: "/innovations" },
      { label: "Startups", href: "/startups" },
      { label: "Incubation", href: "/incubation" },
      { label: "Technology Transfer", href: "/technology-transfer" },
      { label: "Competitions", href: "/competitions" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Funding", href: "/funding" },
      { label: "Scholarships", href: "/scholarships" },
      { label: "Training", href: "/training" },
      { label: "Mentorship", href: "/mentorship" },
      { label: "Research Services", href: "/services" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Resources & Tools", href: "/resources-tools" },
      { label: "Policies", href: "/resources-tools/policies" },
      { label: "Downloads", href: "/resources-tools/downloads" },
      { label: "Forms", href: "/resources-tools/forms" },
      {
        label: "Apply NACOSTI",
        href: "https://research-portal.nacosti.go.ke/",
        external: true,
      },
    ],
  },
];

const researchLegalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Sitemap", href: "/sitemap" },
  { label: "Kisii University", href: "https://kisiiuniversity.ac.ke/", external: true },
];

const getResearchAnnouncements = unstable_cache(
  () =>
    announcementsApi.list({
      is_published: true,
      per_page: 3,
      fields: "id,title,slug",
    }),
  ["research-layout-announcements-v1"],
  { revalidate: 300, tags: ["research-content", "research-announcements"] },
);

export const metadata: Metadata = {
  metadataBase: new URL(
    researchSiteUrl,
  ),
  title: {
    default: "KSU Research Portal",
    template: "%s | KSU Research",
  },
  description: "Kisii University Research Portal - Projects, Publications, and Innovation",
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    siteName: "Kisii University Research",
    title: "KSU Research Portal",
    description: "Research, innovation, partnerships, and public impact at Kisii University.",
    images: [{ url: "/images/research/research-home-hero.webp", alt: "Kisii University research and innovation" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KSU Research Portal",
    description: "Research, innovation, partnerships, and public impact at Kisii University.",
    images: ["/images/research/research-home-hero.webp"],
  },
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
  let resolvedContactInfo = contactInfo;
  try {
    const [response, siteContext] = await Promise.all([
      getResearchAnnouncements(),
      getResearchSiteContext(),
    ]);
    announcements = (response.data ?? []).map((item) => ({
      id: item.id,
      message: item.title,
      linkText: "Read more",
      linkHref: `https://kisiiuniversity.ac.ke/media/announcements/${item.slug}`,
    }));
    const entity = getResearchContextEntity(siteContext);
    resolvedContactInfo = {
      address: compactText(entity?.office_location) || contactInfo.address,
      phone: compactText(entity?.phone) || contactInfo.phone,
      email: compactText(entity?.email) || contactInfo.email,
    };
  } catch {
    // announcements are optional
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ksuBookman.variable} ${ksuSans.variable} ${ksuDisplay.variable}`}
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AccessibilityInitScript />
        <AccessibilityShell mainContentId="research-main">
          <div className="research-canvas min-h-screen text-foreground">
            <Announcements
              announcements={announcements}
              rotating={announcements.length > 1}
              intervalMs={6500}
              background="secondary"
            />
            <ResearchHeader />
            {children}
            <PublicFooter
              columns={researchFooterColumns}
              contactInfo={resolvedContactInfo}
              socialLinks={institutionSocialLinks}
              legalLinks={researchLegalLinks}
              className="bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(var(--primary))_82%,hsl(var(--secondary))_155%)]"
            />
          </div>
        </AccessibilityShell>
      </body>
    </html>
  );
}

function compactText(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

function getResearchContextEntity(siteContext: Awaited<ReturnType<typeof getResearchSiteContext>>) {
  return (
    siteContext.researchContext?.entity ??
    siteContext.researchContext?.department ??
    siteContext.researchContext?.wing ??
    siteContext.researchContext?.division ??
    {}
  ) as Record<string, unknown>;
}
