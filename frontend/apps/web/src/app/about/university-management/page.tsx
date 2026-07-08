import type { ReactNode } from "react";
import { Building2, Eye, ShieldCheck, Target, UsersRound, type LucideIcon } from "lucide-react";
import GovernanceChart from "@/components/about/GovernanceChart";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getManagementData, type BackendBoard } from "@/lib/about-data";

function present(value?: string | null) {
  const text = value?.trim();
  return text && text.length ? text : null;
}

function SectionHeading({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
        {title}
      </h1>
      <div className="mt-3 h-0.5 w-12 bg-secondary" />
      {children ? (
        <div className="mt-5 max-w-4xl text-sm leading-7 text-slate-700">
          {children}
        </div>
      ) : null}
    </div>
  );
}

function IdentityCard({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-primary">
        <Icon aria-hidden className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-bold leading-tight text-slate-950">
        {title}
      </h2>
      <div className="mt-3 h-0.5 w-10 bg-secondary" />
      <p className="mt-5 text-sm leading-7 text-slate-700">{body}</p>
    </article>
  );
}

function BoardIdentityGrid({
  board,
  mandateTitle,
}: {
  board?: BackendBoard | null;
  mandateTitle: string;
}) {
  const items = [
    present(board?.mandate) || present(board?.description)
      ? {
          title: mandateTitle,
          body: present(board?.mandate) || present(board?.description),
          icon: ShieldCheck,
        }
      : null,
    present(board?.mission)
      ? { title: "Mission", body: present(board?.mission), icon: Target }
      : null,
    present(board?.vision)
      ? { title: "Vision", body: present(board?.vision), icon: Eye }
      : null,
  ].filter(
    (item): item is { title: string; body: string; icon: LucideIcon } =>
      Boolean(item?.body),
  );

  if (!items.length) return null;

  return (
    <section className="border-t border-slate-200 bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid max-w-none gap-4 md:grid-cols-3">
        {items.map((item) => (
          <IdentityCard
            key={item.title}
            icon={item.icon}
            title={item.title}
            body={item.body}
          />
        ))}
      </div>
    </section>
  );
}

export default async function UniversityManagementPage() {
  const data = await getManagementData();
  const managementBoard = data.managementBoard;
  const managementMembers = managementBoard?.members ?? [];
  const boardDescription =
    present(managementBoard?.description) ??
    present(managementBoard?.mandate) ??
    "University management structure is shown from published backend board assignments.";

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="bg-white">
          <div className="max-w-none px-4 py-5 sm:px-6 lg:px-8">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Management" },
              ]}
            />

            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
              <SectionHeading title="University Management">
                <p>
                  {boardDescription}
                </p>
              </SectionHeading>

              <aside className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                <Building2 aria-hidden className="h-8 w-8 text-primary" />
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                  Management Board
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {managementMembers.length || managementBoard?.member_count || 0}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm leading-6 text-slate-600">
                  <UsersRound aria-hidden className="h-4 w-4 text-primary" />
                  Published management profiles ordered by hierarchy level.
                </p>
              </aside>
            </div>
          </div>
        </section>

        <BoardIdentityGrid
          board={managementBoard}
          mandateTitle="Management mandate"
        />

        <section className="bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-none rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <GovernanceChart
              managementOnly
              title="University Management organogram"
              description="Management Board members are grouped by the hierarchy levels published in the backend. Select a person card to open the staff detail page."
              managementDescription={boardDescription}
              managementMembers={managementMembers}
            />
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
