import { notFound } from "next/navigation";
import {
  AboutIllustratedHeading,
  aboutIllustrations,
} from "@/components/about/AboutIllustration";
import { BoardMemberGrid } from "@/components/about/BoardMemberGrid";
import { ScrollReveal } from "@ksu/ui/components";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { getGovernanceBoard } from "@/lib/about-data";

function present(value?: string | number | null) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function boardTypeLabel(value?: string | null) {
  return (
    present(value)
      ?.replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase()) ?? "Board"
  );
}

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

  const boardType = boardTypeLabel(board.board_type);
  const members = board.members ?? [];
  const facts = [
    { label: "Governance body", value: boardType },
    {
      label: "Published members",
      value: members.length ? `${members.length} member${members.length === 1 ? "" : "s"}` : null,
    },
    { label: "Public record", value: board.is_public === false ? null : "Published" },
  ].filter((item) => item.value);

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
            eyebrow={boardType}
            title={board.name}
            body={board.description || board.mandate || "Board overview"}
            illustration={aboutIllustrations.governance}
            alt="University governance body meeting in a council room"
          />
        </div>
      </section>

      <ScrollReveal
        as="section"
        className="container grid gap-6 pb-12 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]"
      >
        <div className="grid min-w-0 gap-6">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
              Mandate
            </p>
            <p className="mt-4 text-base leading-7 text-slate-600">
              {board.mandate ||
                "No public mandate details are currently published for this board."}
            </p>
          </article>
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
              Mission
            </p>
            <p className="mt-4 text-base leading-7 text-slate-600">
              {board.mission ||
                "No public mission details are currently published for this board."}
            </p>
          </article>
        </div>
        <aside className="rounded-[1.75rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-lg shadow-slate-200/40 lg:self-start">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
            Official Record
          </p>
          <dl className="mt-5 grid gap-4">
            {facts.map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/10 p-4">
                <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                  {item.label}
                </dt>
                <dd className="mt-2 text-sm font-semibold text-white">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </ScrollReveal>

      <ScrollReveal as="section" className="container pb-16">
        <div className="mb-6 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-secondary">
            Membership
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950">
            Published members
          </h2>
          <p className="mt-3 text-base leading-7 text-slate-600">
            The membership list is drawn from the current public governance
            record where board assignments are published.
          </p>
        </div>
        {members.length ? (
          <BoardMemberGrid members={members} />
        ) : (
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
            <p className="text-sm font-semibold text-slate-950">
              No public member records are currently published for this board.
            </p>
          </article>
        )}
      </ScrollReveal>
    </PageShell>
  );
}
