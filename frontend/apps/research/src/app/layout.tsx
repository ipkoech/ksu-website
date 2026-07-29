import type { Metadata } from "next";
import { AccessibilityInitScript, AccessibilityShell } from "@ksu/ui";
import { PublicFooter } from "@ksu/ui/layout/public";
import { Announcements } from "@ksu/ui/components";
import { announcementsApi } from "@ksu/api-client";
import { ResearchHeader } from "../components/research-header";
import { getResearchSiteContext } from "../lib/research-site-context";
import "./globals.css";

const socialLinks = {
  facebook: "https://facebook.com/kisiiuniversity",
  twitter: "https://twitter.com/kisiiuniversity",
  instagram: "https://instagram.com/kisiiuniversity",
  youtube: "https://youtube.com/kisiiuniversity",
  linkedin: "https://linkedin.com/school/kisiiuniversity",
};

const contactInfo = {
  address: "408 - 40200 Kisii, Kenya",
  phone: "+254 773 452 323",
  email: "research@kisiiuniversity.ac.ke",
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

export const metadata: Metadata = {
  title: {
    default: "KSU Research Portal",
    template: "%s | KSU Research",
  },
  description: "Kisii University Research Portal - Projects, Publications, and Innovation",
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
      announcementsApi.list({
        is_published: true,
        per_page: 3,
        fields: "id,title,slug",
      }),
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
    <html lang="en">
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AccessibilityInitScript />
        <AccessibilityShell mainContentId="research-main">
          <div className="min-h-screen bg-background text-foreground">
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
              socialLinks={socialLinks}
              legalLinks={researchLegalLinks}
              className="bg-brand-overlay"
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
