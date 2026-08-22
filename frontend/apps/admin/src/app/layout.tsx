import type { Metadata } from "next";
import { ksuBookman, ksuSans, ksuDisplay } from "@ksu/ui/fonts";
import { Providers } from "./providers";
import {
  AccessibilityInitScript,
  AccessibilityShell,
  Toaster,
} from "@ksu/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KSU Admin",
    template: "%s | KSU Admin",
  },
  description: "Kisii University Administration Portal",
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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${ksuBookman.variable} ${ksuSans.variable} ${ksuDisplay.variable}`}
    >
      <body className="font-sans antialiased">
        <AccessibilityInitScript />
        <Providers>
          <AccessibilityShell mainContentId="admin-main">
            {children}
          </AccessibilityShell>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
