import type { Metadata } from "next";
import { ResourcesSectionPage } from "../_section-page";

export const metadata: Metadata = {
  title: "Downloads",
  description: "Public research downloads.",
};

export default function ResourceDownloadsPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  return <ResourcesSectionPage searchParams={searchParams} activeItem="downloads" visibleSections={["downloads"]} />;
}
