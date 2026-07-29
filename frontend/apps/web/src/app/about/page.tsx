import { notFound } from "next/navigation";
import { PublicAboutPage } from "@/components/about/public-about-page";
import { PageShell } from "@/components/site-shell";
import { EntityInquiryLauncher } from "@/components/public/entity-inquiry-launcher";
import { getPublicAboutData, getPublicFactsData } from "@/lib/public-about-data";

export const metadata = {
  title: "About Kisii University",
  description: "Discover Kisii University’s identity, purpose, history and institutional profile.",
};

export default async function AboutPage({ searchParams }: { searchParams: Promise<{ history?: string }> }) {
  const [data, facts, params] = await Promise.all([getPublicAboutData(), getPublicFactsData(), searchParams]);
  if (!data) notFound();
  return (
    <PageShell>
      <PublicAboutPage data={data} facts={facts} historyInitiallyOpen={params.history === "open"} />
      <EntityInquiryLauncher
        target={{ type: "university", slug: "kisii-university", name: data.university.name }}
      />
    </PageShell>
  );
}
