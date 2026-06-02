import { PublicSectionPage } from "@/components/public/section-page";
import { getAzIndexPage } from "@/lib/public-page-data";

export default function AzIndexPage() {
  return <PublicSectionPage config={getAzIndexPage()} showHero={false} />;
}
