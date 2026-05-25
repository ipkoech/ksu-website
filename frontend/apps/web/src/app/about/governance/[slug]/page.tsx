import { notFound } from "next/navigation";
import {
  AboutIllustratedHeading,
  aboutIllustrations,
} from "@/components/about/AboutIllustration";
import { BoardMemberGrid } from "@/components/about/BoardMemberGrid";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { getGovernanceBoard } from "@/lib/about-data";

export default async function GovernanceBoardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const board = await getGovernanceBoard(slug);

  if (!board) {
    notFound();
  }

  return (
    <PageShell>
      <section className="container py-10 md:py-14">
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
            { label: "Governance", href: "/about/governance" },
            { label: board.name },
          ]}
        />
        <div className="mt-8">
          <AboutIllustratedHeading
            eyebrow={board.board_type}
            title={board.name}
            body={board.description || board.mandate || "Board overview"}
            illustration={aboutIllustrations.governance}
            alt="University governance body meeting in a council room"
          />
        </div>
      </section>

      <section className="container grid gap-6 pb-12 lg:grid-cols-3">
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
            Mandate
          </p>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {board.mandate || "No public mandate details are currently published for this board."}
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
            Mission
          </p>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {board.mission || "No public mission details are currently published for this board."}
          </p>
        </article>
        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
            Meetings
          </p>
          <p className="mt-4 text-base leading-7 text-slate-600">
            {board.meeting_schedule || "Meeting schedule not published."}
          </p>
        </article>
      </section>

      <section className="container pb-16">
        <article className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">
            Board Members
          </p>
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-slate-950">
            Public-facing board composition.
          </h2>
          <div className="mt-10">
            <BoardMemberGrid members={board.members} />
          </div>
        </article>
      </section>
    </PageShell>
  );
}
