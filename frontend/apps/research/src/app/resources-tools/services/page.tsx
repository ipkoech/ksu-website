import type { Metadata } from "next";
import { ResourcesSectionPage } from "../_section-page";

export const metadata: Metadata = {
  title: "Research Services",
  description: "Research services and support records.",
};

export default function ResourceServicesPage({ searchParams }: { searchParams?: Promise<Record<string, string | undefined>> }) {
  return <ResourcesSectionPage searchParams={searchParams} activeItem="services" visibleSections={["services"]} />;
}
