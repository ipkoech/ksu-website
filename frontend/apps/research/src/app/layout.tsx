import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MiniHeader, PublicFooter } from "@ksu/ui/layout/public";
import { ResearchHeader } from "../components/research-header";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
    label: "Student Portal",
    href: "https://portal.kisiiuniversity.ac.ke",
    external: true,
  },
  { label: "Staff Portal", href: "/m/staff" },
  {
    label: "E-Learning",
    href: "https://elearning.kisiiuniversity.ac.ke",
    external: true,
  },
  { label: "A-Z Index", href: "/az-index" },
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_38%,#f6f8fc_100%)] text-slate-950">
          <a href="#research-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-md focus:ring-2 focus:ring-ring">
            Skip to research content
          </a>
          <MiniHeader
            contactInfo={contactInfo}
            quickLinks={miniQuickLinks}
            socialLinks={socialLinks}
          />
          <ResearchHeader />
          {children}
          <PublicFooter contactInfo={contactInfo} socialLinks={socialLinks} />
        </div>
      </body>
    </html>
  );
}
