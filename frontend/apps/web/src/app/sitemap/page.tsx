import { PublicSectionPage } from "@/components/public/section-page";
import { getSitemapPageConfig } from "@/lib/utility-page-data";

export default function SitemapPage() {
  return <PublicSectionPage config={getSitemapPageConfig()} />;
}

