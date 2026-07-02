import type { Metadata } from "next";
import { ResourcesSectionPage } from "../_section-page";

export const metadata: Metadata = {
  title: "Research Outputs",
  description: "Research output records.",
};

export default function ResourceOutputsPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  return <ResourcesSectionPage searchParams={searchParams} activeItem="outputs" visibleSections={["outputs"]} />;
}
