import type { Metadata } from "next";
import {
  InnovationPathwayPublicPage,
  competitionPathwayConfig,
  type PathwaySearchParams,
} from "../../components/innovation-pathway-public-page";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Competitions & Hackathons",
  description: "Innovation competitions, hackathons, showcases, demo days, and challenge entries from Kisii University research.",
};

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams?: Promise<PathwaySearchParams>;
}) {
  return <InnovationPathwayPublicPage config={competitionPathwayConfig} searchParams={searchParams} />;
}
