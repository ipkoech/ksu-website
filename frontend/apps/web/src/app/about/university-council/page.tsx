import { notFound } from "next/navigation";
import { PageShell } from "@/components/site-shell";
import { UniversityCouncilPage } from "@/components/about/UniversityCouncilPage";
import { getUniversityCouncilPage } from "@/lib/about-data";

export default async function UniversityCouncilRoute() {
  const data = await getUniversityCouncilPage();

  if (!data) {
    notFound();
  }

  return (
    <PageShell>
      <UniversityCouncilPage data={data} />
    </PageShell>
  );
}
