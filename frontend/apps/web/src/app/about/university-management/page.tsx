import Link from "next/link";
import { ArrowRight, Building2, Mail, Phone, Users } from "lucide-react";
import { GovernanceChart } from "@/components/about/GovernanceChart";
import { PublicImage } from "@/components/public/public-image";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { getManagementData } from "@/lib/about-data";
import type { BoardMember } from "@/components/about/BoardMemberGrid";

function leaderMembers(data: Awaited<ReturnType<typeof getManagementData>>) {
  if (data.managementBoard?.members.length) return data.managementBoard.members;

  return data.leaders.map(
    (leader): BoardMember => ({
      name: leader.name,
      role: leader.role,
      photoUrl: leader.photoUrl,
      note: leader.summary,
    }),
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm leading-6 text-slate-500">
      {label} has not been published yet.
    </div>
  );
}

export default async function UniversityManagementPage() {
  const data = await getManagementData();
  const members = leaderMembers(data);
  const featured = data.featuredLeader;

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="border-b border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1440px]">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "About", href: "/about" },
                { label: "Management" },
              ]}
            />

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary">
                  Management
                </p>
                <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950 sm:text-4xl">
                  Executive leadership and management board
                </h1>
                <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-700">
                  Management information is rendered from the published
                  management-board record, public member assignments, and public
                  person profiles with institutional roles.
                </p>
              </article>

              <aside className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
                <Building2 aria-hidden className="h-5 w-5 text-secondary" />
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-white/55">
                  Published Leadership
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-2xl font-semibold leading-none">
                      {members.length}
                    </p>
                    <p className="mt-1 text-xs text-white/60">Chart nodes</p>
                  </div>
                  <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-2xl font-semibold leading-none">
                      {data.leaders.length}
                    </p>
                    <p className="mt-1 text-xs text-white/60">Profiles</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-[1440px] gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-28 xl:self-start">
              <Users aria-hidden className="h-5 w-5 text-primary" />
              <h2 className="mt-3 text-xl font-semibold text-slate-950">
                Vice Chancellor
              </h2>
              {featured ? (
                <div className="mt-4">
                  {featured.photoUrl ? (
                    <PublicImage
                      src={featured.photoUrl}
                      alt={featured.name}
                      ratio="profile"
                      sizes="320px"
                      className="rounded-md"
                    />
                  ) : null}
                  <h3 className="mt-4 text-lg font-semibold text-slate-950">
                    {featured.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-primary">
                    {featured.role}
                  </p>
                  {featured.summary ? (
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {featured.summary}
                    </p>
                  ) : null}
                  <div className="mt-4 grid gap-2">
                    {featured.email ? (
                      <a
                        href={`mailto:${featured.email}`}
                        className="inline-flex min-h-10 items-center gap-2 text-sm text-slate-700"
                      >
                        <Mail aria-hidden className="h-4 w-4 text-primary" />
                        {featured.email}
                      </a>
                    ) : null}
                    {featured.phone ? (
                      <a
                        href={`tel:${featured.phone}`}
                        className="inline-flex min-h-10 items-center gap-2 text-sm text-slate-700"
                      >
                        <Phone aria-hidden className="h-4 w-4 text-primary" />
                        {featured.phone}
                      </a>
                    ) : null}
                  </div>
                  <Link
                    href={`/about/university-management/${featured.slug}`}
                    className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary"
                  >
                    Open profile
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <EmptyState label="Vice Chancellor profile" />
              )}
            </aside>

            <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              {members.length ? (
                <GovernanceChart
                  managementOnly
                  title="Management structure"
                  description={
                    data.managementBoard?.description ??
                    data.managementBoard?.mandate ??
                    "Management structure from public leadership records."
                  }
                  managementDescription={
                    data.managementBoard?.description ??
                    data.managementBoard?.mandate
                  }
                  senateDescription={data.senate?.description ?? data.senate?.mandate}
                  managementMembers={members}
                  senateMembers={data.senate?.members ?? []}
                />
              ) : (
                <EmptyState label="Management board members" />
              )}
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1440px]">
            <h2 className="text-xl font-semibold text-slate-950">
              Leadership directory
            </h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              {data.leaders.length ? (
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.08em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.leaders.map((leader) => (
                      <tr key={leader.slug}>
                        <td className="px-4 py-3 font-semibold text-slate-950">
                          {leader.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {leader.role}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {leader.email ?? "Not published"}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/about/university-management/${leader.slug}`}
                            className="font-semibold text-primary"
                          >
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState label="Leadership profiles" />
              )}
            </div>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
