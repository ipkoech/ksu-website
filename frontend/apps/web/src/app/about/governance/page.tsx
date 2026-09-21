import { notFound } from "next/navigation";
import { CampusPageHeader } from "@ksu/ui/components";
import GovernanceChart from "@/components/about/GovernanceChart";
import { PageShell } from "@/components/site-shell";
import { getUniversityCouncilPage } from "@/lib/about-data";

export const revalidate = 300;
export const metadata = { title: "University Governance" };

export default async function GovernancePage() {
  const data = await getUniversityCouncilPage();
  if (!data) notFound();
  return (
    <PageShell>
      <CampusPageHeader image="main-admin" variant="feature" titleWeight="normal"
        eyebrow="University Council" title="Governance" description={data.mandate?.description ?? data.page.description ?? undefined}
        breadcrumbs={[{label:"Home",href:"/"},{label:"About",href:"/about"},{label:"Governance"}]} />
      <section className="bg-white px-5 py-10 sm:px-8 lg:px-10"><GovernanceChart data={data} /></section>
    </PageShell>
  );
}
