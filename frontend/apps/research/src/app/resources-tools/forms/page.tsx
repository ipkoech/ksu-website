import type { Metadata } from "next";
import { ResourcesSectionPage } from "../_section-page";

export const metadata: Metadata = {
  title: "Forms & Templates",
  description: "Research forms and templates.",
};

export default function ResourceFormsPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  return <ResourcesSectionPage searchParams={searchParams} activeItem="forms" visibleSections={["forms"]} />;
}
