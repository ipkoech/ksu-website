import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Circle,
  Mail,
  Network,
  Phone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { GovernanceChart } from "@/components/about/GovernanceChart";
import { PublicImage } from "@/components/public/public-image";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getManagementData } from "@/lib/about-data";
import type { BoardMember } from "@/components/about/BoardMemberGrid";
import type { LeaderCardData } from "@/components/about/LeaderCard";

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
      {label} has not been published yet.
    </div>
  );
}

function ManagementMetric({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
}) {
  return (
    <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:border-b-0 lg:border-r lg:px-8">
      <div className="flex items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <p className="text-3xl font-semibold leading-none text-slate-950">
            {value}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-secondary">
            {label}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function ManagementLegend({
  managementMembers,
  senateMembers,
}: {
  managementMembers: BoardMember[];
  senateMembers: BoardMember[];
}) {
  const items = [
    {
      label: "Vice Chancellor",
      description: "Executive lead for institutional implementation.",
      swatch: "bg-slate-950",
    },
    {
      label: "Management Board",
      description: `${managementMembers.length} published management assignment${
        managementMembers.length === 1 ? "" : "s"
      }.`,
      swatch: "bg-primary",
    },
    {
      label: "Senate",
      description: `${senateMembers.length} published senate assignment${
        senateMembers.length === 1 ? "" : "s"
      }.`,
      swatch: "bg-secondary",
    },
  ];

  return (
    <aside className="border-t border-slate-200 bg-white px-4 py-6 sm:px-6 lg:border-l lg:border-t-0 lg:px-8">
      <div className="flex items-center gap-3">
        <Circle aria-hidden className="h-4 w-4 fill-primary text-primary" />
        <h2 className="text-lg font-semibold text-slate-950">Chart legend</h2>
      </div>
      <div className="mt-5 grid gap-4">
        {items.map((item) => (
          <div key={item.label} className="flex gap-3">
            <span
              className={`mt-1 h-3 w-3 shrink-0 rounded-full ${item.swatch}`}
            />
            <div>
              <p className="text-sm font-semibold text-slate-950">
                {item.label}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function LeadershipDirectoryTable({ leaders }: { leaders: LeaderCardData[] }) {
  if (!leaders.length) {
    return <EmptyState label="Leadership profiles" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-950 text-xs uppercase tracking-[0.08em] text-white/70">
          <tr>
            <th className="px-4 py-4 font-semibold">Leader</th>
            <th className="px-4 py-4 font-semibold">Role</th>
            <th className="px-4 py-4 font-semibold">Contact</th>
            <th className="px-4 py-4 font-semibold">Profile</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {leaders.map((leader) => (
            <tr key={leader.slug} className="align-top">
              <td className="px-4 py-4">
                <p className="font-semibold text-slate-950">{leader.name}</p>
                {leader.credentials ? (
                  <p className="mt-1 text-xs text-slate-500">
                    {leader.credentials}
                  </p>
                ) : null}
              </td>
              <td className="px-4 py-4 text-slate-600">{leader.role}</td>
              <td className="px-4 py-4 text-slate-600">
                <div className="grid gap-1">
                  {leader.email ? (
                    <a
                      href={`mailto:${leader.email}`}
                      className="font-medium text-primary"
                    >
                      {leader.email}
                    </a>
                  ) : null}
                  {leader.phone ? <span>{leader.phone}</span> : null}
                  {!leader.email && !leader.phone ? (
                    <span>Not published</span>
                  ) : null}
                </div>
              </td>
              <td className="px-4 py-4">
                <Link
                  href={`/about/university-management/${leader.slug}`}
                  className="inline-flex min-h-9 items-center gap-2 font-semibold text-primary"
                >
                  Open
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function UniversityManagementPage() {
  const data = await getManagementData();
  const managementMembers = data.managementBoard?.members ?? [];
  const senateMembers = data.senate?.members ?? [];
  const featured = data.featuredLeader;
  const boardDescription =
    data.managementBoard?.description ??
    data.managementBoard?.mandate ??
    "Management structure from public leadership records.";

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="border-b border-slate-200 bg-slate-950 text-white">
          <div className="max-w-none px-4 py-8 sm:px-6 lg:px-8">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Management" },
              ]}
            />

            <div className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:py-14">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                  University Management
                </p>
                <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  Executive leadership and management structure
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/70">
                  This page is rendered from the published management board,
                  senate assignments, and public institutional leadership
                  profiles.
                </p>
              </div>

              <aside className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary/15 text-secondary">
                    <ShieldCheck aria-hidden className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/55">
                      Featured Leader
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {featured?.name ?? "Not published"}
                    </p>
                  </div>
                </div>
                {featured ? (
                  <p className="mt-4 text-sm leading-6 text-white/65">
                    {featured.role}
                  </p>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-white/65">
                    Vice Chancellor profile has not been published yet.
                  </p>
                )}
              </aside>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="grid max-w-none lg:grid-cols-4">
            <ManagementMetric
              label="Leadership profiles"
              value={data.leaders.length}
              detail="Public persons with institutional roles."
              icon={<Users aria-hidden className="h-5 w-5" />}
            />
            <ManagementMetric
              label="Management assignments"
              value={managementMembers.length}
              detail="Published management board member assignments."
              icon={<Building2 aria-hidden className="h-5 w-5" />}
            />
            <ManagementMetric
              label="Senate assignments"
              value={senateMembers.length}
              detail="Published senate member assignments included in the chart."
              icon={<Network aria-hidden className="h-5 w-5" />}
            />
            <ManagementMetric
              label="Management record"
              value={data.managementBoard ? "Live" : "Pending"}
              detail="Status reflects the public management board source."
              icon={<ShieldCheck aria-hidden className="h-5 w-5" />}
            />
          </div>
        </section>

        <section className="bg-slate-50">
          <div className="grid max-w-none lg:grid-cols-[420px_minmax(0,1fr)]">
            <aside className="border-b border-slate-200 bg-white px-4 py-8 sm:px-6 lg:border-b-0 lg:border-r lg:px-8">
              <h2 className="text-2xl font-semibold text-slate-950">
                Vice Chancellor
              </h2>
              {featured ? (
                <div className="mt-5">
                  {featured.photoUrl ? (
                    <PublicImage
                      src={featured.photoUrl}
                      alt={featured.name}
                      ratio="profile"
                      sizes="360px"
                      className="rounded-lg"
                    />
                  ) : null}
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">
                    {featured.name}
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-primary">
                    {featured.role}
                  </p>
                  {featured.summary ? (
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {featured.summary}
                    </p>
                  ) : null}
                  <div className="mt-5 grid gap-2">
                    {featured.email ? (
                      <a
                        href={`mailto:${featured.email}`}
                        className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-700"
                      >
                        <Mail aria-hidden className="h-4 w-4 text-primary" />
                        {featured.email}
                      </a>
                    ) : null}
                    {featured.phone ? (
                      <a
                        href={`tel:${featured.phone}`}
                        className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-slate-700"
                      >
                        <Phone aria-hidden className="h-4 w-4 text-primary" />
                        {featured.phone}
                      </a>
                    ) : null}
                  </div>
                  <Link
                    href={`/about/university-management/${featured.slug}`}
                    className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary"
                  >
                    Open profile
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="mt-5">
                  <EmptyState label="Vice Chancellor profile" />
                </div>
              )}
            </aside>

            <div className="min-w-0 px-4 py-8 sm:px-6 lg:px-8">
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary">
                  Structure
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Management structure and academic authority
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                  {boardDescription}
                </p>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <GovernanceChart
                  managementOnly
                  title="Management structure"
                  description={boardDescription}
                  managementDescription={
                    data.managementBoard?.description ??
                    data.managementBoard?.mandate
                  }
                  senateDescription={
                    data.senate?.description ?? data.senate?.mandate
                  }
                  managementMembers={managementMembers}
                  senateMembers={senateMembers}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="grid max-w-none lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 px-4 py-8 sm:px-6 lg:px-8">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary">
                    Directory
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Leadership directory
                  </h2>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-slate-600">
                  Public leadership profiles come from active person records
                  with institutional roles.
                </p>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
                <LeadershipDirectoryTable leaders={data.leaders} />
              </div>
            </div>
            <ManagementLegend
              managementMembers={managementMembers}
              senateMembers={senateMembers}
            />
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
