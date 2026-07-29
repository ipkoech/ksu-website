import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "HERI Africa", template: "%s | HERI Africa" },
  description: "Africa-led language education research hosted by Kisii University.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
