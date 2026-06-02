import { PublicSectionPage } from "@/components/public/section-page";
import { getHelpDeskPageConfig } from "@/lib/utility-page-data";

export default function HelpDeskPage() {
  return <PublicSectionPage config={getHelpDeskPageConfig()} />;
}

