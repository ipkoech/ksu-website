import { PublicSectionPage } from "@/components/public/section-page";
import { getAccessibilityPageConfig } from "@/lib/utility-page-data";

export default function AccessibilityPage() {
  return <PublicSectionPage config={getAccessibilityPageConfig()} />;
}

