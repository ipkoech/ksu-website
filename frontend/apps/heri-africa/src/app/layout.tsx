import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  metadataBase: new URL("https://kisiiuniversity.ac.ke"),
  title: {
    default: "HERI Africa | Language Education Research Chair",
    template: "%s | HERI Africa",
  },
  description:
    "Africa-led language education and foundational literacy research. The HERI Africa Language Education Research Chair, hosted by Kisii University.",
  keywords: [
    "HERI Africa",
    "language education research",
    "foundational literacy",
    "Kisii University",
    "African languages",
    "education research Kenya",
  ],
  openGraph: {
    type: "website",
    siteName: "HERI Africa Language Education Research Chair",
    title: "HERI Africa | Language Education Research Chair",
    description:
      "Africa-led language education and foundational literacy research, hosted by Kisii University.",
    url: `${basePath}/`,
    images: [
      {
        url: `${basePath}/images/HERIAfricaLaunch.jpg`,
        width: 1200,
        height: 630,
        alt: "HERI Africa researchers and education leaders at the Chair launch",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HERI Africa | Language Education Research Chair",
    description:
      "Africa-led language education and foundational literacy research, hosted by Kisii University.",
  },
  icons: {
    icon: [
      { url: `${basePath}/logos/favicon-32x32.png`, sizes: "32x32" },
      { url: `${basePath}/logos/favicon-16x16.png`, sizes: "16x16" },
    ],
    apple: `${basePath}/logos/apple-touch-icon.png`,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
