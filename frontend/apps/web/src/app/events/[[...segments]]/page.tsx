import { PublicSectionPage } from "@/components/public/section-page";
import { getEventsPageConfig } from "@/lib/public-record-page-data";

export default async function EventsRoutePage({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;

  return <PublicSectionPage config={await getEventsPageConfig(segments)} />;
}
