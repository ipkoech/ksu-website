import type { Metadata } from "next";
import {
  InnovationPathwayPublicPage,
  incubationPathwayConfig,
  type PathwaySearchParams,
} from "../../components/innovation-pathway-public-page";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Innovation Incubation",
  description: "Incubation, mentorship, accelerator, and commercialization support records for Kisii University research innovation.",
};

export default async function IncubationPage({
  searchParams,
}: {
  searchParams?: Promise<PathwaySearchParams>;
}) {
  return <InnovationPathwayPublicPage config={incubationPathwayConfig} searchParams={searchParams} />;
}
