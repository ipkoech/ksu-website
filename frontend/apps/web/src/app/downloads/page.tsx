import { PublicSectionPage } from "@/components/public/section-page";
import { getDownloadsPageConfig } from "@/lib/utility-page-data";

export default async function DownloadsPage() {
  return <PublicSectionPage config={await getDownloadsPageConfig()} />;
}

