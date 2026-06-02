import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import {
  AnalyticsConsentBanner,
  AnalyticsTracker,
} from "@/components/analytics/analytics-tracker";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

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
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${playfairDisplay.variable} font-sans antialiased`}
      >
        <AnalyticsTracker />
        <AnalyticsConsentBanner />
        {children}
      </body>
    </html>
  );
}
