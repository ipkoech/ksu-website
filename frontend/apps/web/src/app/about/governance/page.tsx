import Link from "next/link";
import {
  ArrowRight,
  Landmark,
  MessageSquareText,
  Network,
  ShieldCheck,
  Users,
} from "lucide-react";
import { GovernanceChart } from "@/components/about/GovernanceChart";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getGovernanceData, type BackendBoard } from "@/lib/about-data";
import type { BoardMember } from "@/components/about/BoardMemberGrid";

function boardMatches(board: BackendBoard, terms: string[]) {
  const haystack = `${board.slug} ${board.name} ${board.board_type}`.toLowerCase();
  return terms.some((term) => haystack.includes(term));
}

function boardSummary(board?: BackendBoard | null) {
  return (
    board?.description ??
    board?.mandate ??
    "Public governance details are shown when the board record is published."
  );
}

function boardMandate(board?: BackendBoard | null) {
  return board?.mandate ?? board?.description ?? "Mandate has not been published.";
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
      {label} has not been published yet.
    </div>
  );
}

function MessagePanel({ boards }: { boards: BackendBoard[] }) {
  const messages = boards
    .filter((board) => board.head_message)
    .map((board) => ({
      id: board.id,
      name: board.name,
      slug: board.slug,
      message: board.head_message,
    }));

  return (
    <section className="bg-white px-4 py-12 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-none">
        <div className="grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,2fr)]">
          <div>
            <MessageSquareText aria-hidden className="h-6 w-6 text-secondary" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-secondary">
              Board Messages
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950">
              Published guidance from governance bodies
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Messages are drawn from the public governance board records and
              are shown only where the backend has published them.
            </p>
          </div>

          {messages.length ? (
            <div className="grid gap-4 lg:grid-cols-3">
              {messages.map((item) => (
                <article
                  key={item.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-5"
                >
                  <p className="text-sm font-semibold text-slate-950">
                    {item.name}
                  </p>
                  <p className="mt-3 line-clamp-5 text-sm leading-7 text-slate-600">
                    {item.message}
                  </p>
                  <Link
                    href={`/about/governance/${item.slug}`}
                    className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary"
                  >
                    Read record
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState label="Governance board messages" />
          )}
        </div>
      </div>
    </section>
  );
}

function GovernanceMandateCard({ board }: { board: BackendBoard }) {
  return (
    <Link
      href={`/about/governance/${board.slug}`}
      className="group rounded-lg border border-slate-200 bg-white p-5 transition hover:border-primary/35 hover:shadow-lg hover:shadow-slate-200/50"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
            {board.board_type?.replace(/_/g, " ") ?? "Governance body"}
          </p>
          <h3 className="mt-3 text-lg font-semibold text-slate-950">
            {board.name}
          </h3>
        </div>
        <ArrowRight
          aria-hidden
          className="mt-1 h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-primary"
        />
      </div>
      <p className="mt-4 line-clamp-5 text-sm leading-7 text-slate-600">
        {boardMandate(board)}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Members
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">
            {board.members.length || board.member_count || "Not published"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Status
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-950">
            {board.status ?? "Published"}
          </dd>
        </div>
      </dl>
    </Link>
  );
}

function CouncilPreviewTable({
  members,
  boardSlug,
}: {
  members: BoardMember[];
  boardSlug?: string;
}) {
  if (!members.length) {
    return <EmptyState label="Council member assignments" />;
  }

  const previewMembers = members.slice(0, 8);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-4">
                Member
              </th>
              <th scope="col" className="px-5 py-4">
                Role
              </th>
              <th scope="col" className="px-5 py-4">
                Term / Note
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {previewMembers.map((member, index) => (
              <tr key={`${member.name}-${member.role}-${index}`}>
                <td className="px-5 py-4 font-semibold text-slate-950">
                  {member.name}
                </td>
                <td className="px-5 py-4 text-slate-600">{member.role}</td>
                <td className="px-5 py-4 text-slate-500">
                  {member.note ?? "Published member"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {boardSlug ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
          <p className="text-sm text-slate-600">
            Showing {previewMembers.length} of {members.length} published council
            members.
          </p>
          <Link
            href={`/about/governance/${boardSlug}`}
            className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary"
          >
            Open council detail
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
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
        <section className="bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-10 lg:py-14">
          <div className="mx-auto max-w-none">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Governance" },
              ]}
            />

            <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                  Governance
                </p>
                <h1 className="mt-4 max-w-5xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                  Public boards and accountability at Kisii University
                </h1>
                <p className="mt-5 max-w-4xl text-base leading-8 text-white/70">
                  The university governance page reflects public board records,
                  mandates, messages, and member assignments maintained in the
                  backend.
                </p>
              </div>

              <aside className="rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur">
                <ShieldCheck aria-hidden className="h-6 w-6 text-secondary" />
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-white/55">
                  Published Boards
                </p>
                <p className="mt-2 text-4xl font-semibold leading-none">
                  {visibleBoards.length}
                </p>
                <p className="mt-4 text-sm leading-6 text-white/65">
                  Council, senate, management, and any other active public board
                  records are displayed from backend data.
                </p>
              </aside>
            </div>
          </div>
        </section>

        <MessagePanel boards={visibleBoards} />

        <section className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-none">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.5fr)]">
              <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <GovernanceChart
                  title="University governance structure"
                  description="The chart uses public council, senate, and management board records where available."
                  councilDescription={boardSummary(council)}
                  senateDescription={boardSummary(senate)}
                  managementDescription={boardSummary(management)}
                  councilMembers={council?.members ?? []}
                  senateMembers={senate?.members ?? []}
                  managementMembers={management?.members ?? []}
                />
              </div>

              <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:self-start">
                <Network aria-hidden className="h-6 w-6 text-primary" />
                <h2 className="mt-4 text-xl font-semibold text-slate-950">
                  Governance structure
                </h2>
                <div className="mt-5 grid gap-4">
                  {[
                    ["Council", council],
                    ["Senate", senate],
                    ["Management Board", management],
                  ].map(([label, board]) => (
                    <div
                      key={label as string}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-950">
                        {label as string}
                      </p>
                      <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-600">
                        {boardSummary(board as BackendBoard | undefined)}
                      </p>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-12 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-none">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div className="max-w-3xl">
                <Landmark aria-hidden className="h-6 w-6 text-primary" />
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                  Mandates
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950">
                  Public governance mandates
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Mandates and descriptions are rendered from each published
                  board record.
                </p>
              </div>
            </div>

            {visibleBoards.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleBoards.map((board) => (
                  <GovernanceMandateCard key={board.id} board={board} />
                ))}
              </div>
            ) : (
              <EmptyState label="Governance board records" />
            )}
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-12 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-none">
            <div className="grid gap-6 lg:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.3fr)]">
              <div>
                <Users aria-hidden className="h-6 w-6 text-primary" />
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                  Council Members
                </p>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950">
                  Published council preview
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Membership comes from public staff assignments attached to the
                  council board record.
                </p>
              </div>
              <CouncilPreviewTable
                members={council?.members ?? []}
                boardSlug={council?.slug}
              />
            </div>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
