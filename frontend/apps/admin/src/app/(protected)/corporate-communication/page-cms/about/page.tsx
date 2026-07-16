import { AboutKsuWorkspace } from "@/components/about-content/about-ksu-workspace";
import { InstitutionalPageWorkspace } from "@/components/about-content/institutional-page-workspace";

export default function AboutKsuAdminPage() {
  return <div className="space-y-8"><AboutKsuWorkspace /><InstitutionalPageWorkspace slug="about" /></div>;
}
