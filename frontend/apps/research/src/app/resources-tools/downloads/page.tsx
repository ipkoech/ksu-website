import type { Metadata } from "next";
import { ResourcesSectionPage } from "../_section-page";

export const metadata: Metadata = {
  title: "Downloads",
  description: "Public research downloads.",
  alternates: { canonical: "/resources-tools/downloads" },
};

export const revalidate = 300;

export default function ResourceDownloadsPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  return <ResourcesSectionPage searchParams={searchParams} activeItem="downloads" visibleSections={["downloads"]} />;
}
