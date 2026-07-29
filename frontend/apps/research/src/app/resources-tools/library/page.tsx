import type { Metadata } from "next";
import { ResourcesSectionPage } from "../_section-page";

export const metadata: Metadata = {
  title: "Resource Library",
  description: "Research resource library records.",
};

export default function ResourceLibraryPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  return <ResourcesSectionPage searchParams={searchParams} activeItem="resources" visibleSections={["resources"]} />;
}
