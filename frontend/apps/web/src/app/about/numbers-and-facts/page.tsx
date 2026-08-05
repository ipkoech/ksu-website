import { notFound } from "next/navigation";
import { NumbersFactsPage } from "@/components/about/numbers-facts-page";
import { PageShell } from "@/components/site-shell";
import { getPublicFactsData } from "@/lib/public-about-data";

export const metadata = {
  title: "KSU Numbers & Facts",
  description: "Verified institutional facts about Kisii University by reporting year.",
};

export default async function NumbersAndFactsRoute({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const params = await searchParams;
  const parsedYear = params.year ? Number(params.year) : undefined;
  const year = parsedYear && Number.isInteger(parsedYear) ? parsedYear : undefined;
  const data = await getPublicFactsData(year);
  if (!data) notFound();
  return <PageShell><NumbersFactsPage data={data} /></PageShell>;
}
