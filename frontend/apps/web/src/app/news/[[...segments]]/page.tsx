import { PublicSectionPage } from "@/components/public/section-page";
import { getNewsPageConfig } from "@/lib/public-record-page-data";

export default async function NewsRoutePage({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;

  return <PublicSectionPage config={await getNewsPageConfig(segments)} />;
}
