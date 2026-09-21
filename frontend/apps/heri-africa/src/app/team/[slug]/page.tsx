import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { SiteShell } from "../../../components/site-shell";
import { Reveal } from "../../../components/motion/reveal";
import { TeamMemberDisplay } from "../../../components/data/team-member-display";
import { getTeamMember } from "../../../lib/api";
import { uncachedFallback } from "../../../lib/server-fallback";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = await getTeamMember(slug).catch(() => uncachedFallback(null));
  if (!member) return { title: "Team" };
  return {
    title: member.name,
    description: `${member.name}, ${member.role} at the HERI Africa Language Education Research Chair, Kisii University.`,
  };
}

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = await getTeamMember(slug).catch(() => uncachedFallback(null));
  if (!member) notFound();
  const isChair = member.role.toLowerCase().includes("chair");

  return (
    <SiteShell>
      <main className="bg-white">
        <section className="bg-heri-ink px-6 py-5 text-sm text-white/80">
          <div className="mx-auto max-w-7xl">
            <Link
              className="inline-flex items-center gap-2 hover:text-heri-lime"
              href="/team"
            >
              <ArrowLeft className="size-4" /> Back to Our Team
            </Link>
          </div>
        </section>
        <section>
          <TeamMemberDisplay member={member} isChair={isChair} />
        </section>
        <section className="bg-heri-cream/60 px-6 py-12">
          <Reveal className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold text-heri-blue">
              Working for language education equity
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              HERI Africa brings together evidence, policy and practice so every
              learner can read, understand and thrive in their language and in
              the world.
            </p>
          </Reveal>
        </section>
      </main>
    </SiteShell>
  );
}
