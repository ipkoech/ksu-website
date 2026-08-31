import type { Metadata } from "next";
import { ResourcesSectionPage } from "../_section-page";

export const metadata: Metadata = {
  title: "Policies & Guidelines",
  description: "Research policy and guideline records.",
  alternates: { canonical: "/resources-tools/policies" },
};

export default function ResourcePoliciesPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  return <ResourcesSectionPage searchParams={searchParams} activeItem="policies" visibleSections={["policies"]} />;
}
