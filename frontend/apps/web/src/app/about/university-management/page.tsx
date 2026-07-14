import { Building2, Eye, ShieldCheck, Target, UsersRound, type LucideIcon } from "lucide-react";
import GovernanceChart from "@/components/about/GovernanceChart";
import Link from "next/link";
import { PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getManagementData, type BackendBoard } from "@/lib/about-data";

function present(value?: string | null) {
  const text = value?.trim();
  return text && text.length ? text : null;
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
        <section className="relative isolate overflow-hidden bg-primary text-white">
          <div aria-hidden className="absolute inset-0 bg-[url('/images/backgrounds/KSUGreenLandscapingMay2026-9664.jpg')] bg-cover bg-center opacity-65" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-primary via-primary/88 to-primary/25" />
          <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-24">
            <nav aria-label="Breadcrumb" className="text-sm text-white/75"><Link href="/" className="hover:text-white">Home</Link><span className="mx-2">/</span><Link href="/about" className="hover:text-white">About KSU</Link><span className="mx-2">/</span><span>University Management</span></nav>
            <div className="mt-14 grid min-h-[360px] items-end gap-8 lg:grid-cols-[1fr_18rem]">
              <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Leadership</p><h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl font-semibold leading-tight text-white sm:text-6xl">University Management</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">{boardDescription}</p></div>
              <aside className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur"><Building2 aria-hidden className="h-7 w-7 text-secondary" /><p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-white/65">Published leadership</p><p className="mt-2 text-4xl font-semibold text-white">{managementMembers.length || managementBoard?.member_count || 0}</p><p className="mt-3 flex items-start gap-2 text-sm leading-6 text-white/70"><UsersRound aria-hidden className="mt-1 h-4 w-4 shrink-0 text-secondary" />Profiles ordered by the official management hierarchy.</p></aside>
            </div>
          </div>
        </section>

        <BoardIdentityGrid
          board={managementBoard}
          mandateTitle="Management mandate"
        />

        <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
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
