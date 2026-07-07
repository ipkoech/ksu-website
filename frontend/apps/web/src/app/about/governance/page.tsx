import Link from "next/link";
import { ArrowRight, Landmark, ShieldCheck, Users } from "lucide-react";
import { BoardMemberGrid } from "@/components/about/BoardMemberGrid";
import { GovernanceChart } from "@/components/about/GovernanceChart";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getGovernanceData, type BackendBoard } from "@/lib/about-data";

function boardMatches(board: BackendBoard, terms: string[]) {
  const haystack = `${board.slug} ${board.name} ${board.board_type}`.toLowerCase();
  return terms.some((term) => haystack.includes(term));
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
      {label} has not been published yet.
    </div>
  );
}

export default async function GovernancePage() {
  const data = await getGovernanceData();
  const council = data.boards.find((board) =>
    boardMatches(board, ["council"]),
  );
  const senate = data.boards.find((board) => boardMatches(board, ["senate"]));
  const management = data.boards.find((board) =>
    boardMatches(board, ["management"]),
  );
  const visibleBoards = data.boards.slice().sort((first, second) => {
    const order = first.display_order - second.display_order;
    return order || first.name.localeCompare(second.name);
  });

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="border-b border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1440px]">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Governance" },
              ]}
            />

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary">
                  Governance
                </p>
                <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950 sm:text-4xl">
                  Public boards and accountability
                </h1>
                <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-700">
                  Governance information is rendered from public board records,
                  mandates, messages, and board-member assignments.
                </p>
              </article>

              <aside className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
                <ShieldCheck aria-hidden className="h-5 w-5 text-secondary" />
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-white/55">
                  Published Boards
                </p>
                <p className="mt-2 text-3xl font-semibold leading-none">
                  {visibleBoards.length}
                </p>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  Only active public board records are displayed.
                </p>
              </aside>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1440px] gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <GovernanceChart
                title="University governance structure"
                description="The chart uses public council, senate, and management board records where available."
                councilDescription={council?.description ?? council?.mandate}
                senateDescription={senate?.description ?? senate?.mandate}
                managementDescription={
                  management?.description ?? management?.mandate
                }
                councilMembers={council?.members ?? []}
                senateMembers={senate?.members ?? []}
                managementMembers={management?.members ?? []}
              />
            </div>

            <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-28 xl:self-start">
              <Landmark aria-hidden className="h-5 w-5 text-primary" />
              <h2 className="mt-3 text-xl font-semibold text-slate-950">
                Mandates
              </h2>
              <div className="mt-4 grid gap-3">
                {visibleBoards.length ? (
                  visibleBoards.map((board) => (
                    <Link
                      key={board.id}
                      href={`/about/governance/${board.slug}`}
                      className="rounded-md border border-slate-200 p-3 transition hover:border-primary/30"
                    >
                      <p className="text-sm font-semibold text-slate-950">
                        {board.name}
                      </p>
                      <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-600">
                        {board.mandate ??
                          board.description ??
                          "Mandate has not been published."}
                      </p>
                    </Link>
                  ))
                ) : (
                  <EmptyState label="Governance board records" />
                )}
              </div>
            </aside>
          </div>
        </section>

        <section className="bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div>
                <Users aria-hidden className="h-5 w-5 text-primary" />
                <h2 className="mt-3 text-xl font-semibold text-slate-950">
                  Council members
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Membership comes from public staff assignments attached to the
                  council board record.
                </p>
                {council?.slug ? (
                  <Link
                    href={`/about/governance/${council.slug}`}
                    className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary"
                  >
                    Open council detail
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                ) : null}
              </div>
              {council?.members.length ? (
                <BoardMemberGrid members={council.members} />
              ) : (
                <EmptyState label="Council member assignments" />
              )}
            </div>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
