import { notFound } from "next/navigation";
import { PublicAboutPage } from "@/components/about/public-about-page";
import { PageShell } from "@/components/site-shell";
import { getPublicAboutData } from "@/lib/public-about-data";

export const metadata = {
  title: "About Kisii University",
  description: "Discover Kisii University’s identity, purpose, history and institutional profile.",
};

export default async function AboutPage({ searchParams }: { searchParams: Promise<{ history?: string }> }) {
  const [data, params] = await Promise.all([getPublicAboutData(), searchParams]);
  if (!data) notFound();
  return <PageShell><PublicAboutPage data={data} historyInitiallyOpen={params.history === "open"} /></PageShell>;
}
