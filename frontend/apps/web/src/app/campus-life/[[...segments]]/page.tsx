import { CampusLifeContent } from "./campus-life-content";
import { getCampusLifeData } from "@/lib/get-campus-life";

export default async function CampusLifeRoutePage({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  const data = await getCampusLifeData(segments);

  return <CampusLifeContent segments={segments} data={data} />;
}
