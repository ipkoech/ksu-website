import { CampusLifeContent } from "./campus-life-content";
import { getCampusLifeData } from "@/lib/get-campus-life";

export default async function CampusLifeRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<{
    q?: string;
    type?: string;
    status?: string;
  }>;
}) {
  const { segments = [] } = await params;
  const filters = await searchParams;
  const data = await getCampusLifeData(segments, filters);

  return <CampusLifeContent segments={segments} data={data} filters={filters} />;
}
