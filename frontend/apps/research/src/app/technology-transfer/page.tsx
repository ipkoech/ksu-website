import type { Metadata } from "next";
import {
  InnovationPathwayPublicPage,
  technologyTransferPathwayConfig,
  type PathwaySearchParams,
} from "../../components/innovation-pathway-public-page";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Technology Transfer",
  description:
    "Technology transfer cases, licensing pathways, and partner agreements moving Kisii University research into use.",
};

export default async function TechnologyTransferPage({
  searchParams,
}: {
  searchParams?: Promise<PathwaySearchParams>;
}) {
  return (
    <InnovationPathwayPublicPage
      config={technologyTransferPathwayConfig}
      searchParams={searchParams}
    />
  );
}
