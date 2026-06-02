import { PublicSectionPage } from "@/components/public/section-page";
import { getVisitorsPageConfig } from "@/lib/utility-page-data";

export default function VisitorsPage() {
  return <PublicSectionPage config={getVisitorsPageConfig()} />;
}

