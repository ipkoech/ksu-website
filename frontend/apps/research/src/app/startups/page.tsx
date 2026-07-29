import type { Metadata } from "next";
import {
  InnovationPathwayPublicPage,
  startupPathwayConfig,
  type PathwaySearchParams,
} from "../../components/innovation-pathway-public-page";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research Startups",
  description: "Research-born startups, ventures, and field-ready enterprises from Kisii University innovation work.",
};

export default async function StartupsPage({
  searchParams,
}: {
  searchParams?: Promise<PathwaySearchParams>;
}) {
  return <InnovationPathwayPublicPage config={startupPathwayConfig} searchParams={searchParams} />;
}
