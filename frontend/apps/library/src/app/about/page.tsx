import Link from "next/link";
import { ArrowRight, Mail, Users } from "lucide-react";
import type { LibraryStaff } from "@ksu/api-client";
import {
  EditorialPageHero,
  EditorialSection,
} from "../../components/library-page-sections";
import {
  compactText,
  formatLabel,
  getLibraryAboutData,
  getLibraryLeadershipData,
  getLibraryStaffData,
} from "../../lib/library-public-data";
import { AboutTabs } from "./about-tabs";
import { PrimaryLink, SecondaryLink, StatusMessage } from "../../components/library-ui";

export const metadata = {
  title: "About & People",
  description: "About Kisii University Library: mandate, branches, leadership, and staff.",
};

export const dynamic = "force-dynamic";

export default async function LibraryAboutPage() {
  const [{ branches, primaryBranch, errors }, leadership, staffData] =
    await Promise.all([
      getLibraryAboutData(),
      getLibraryLeadershipData(),
      getLibraryStaffData(),
    ]);
  const tabs = [
    { label: "Mandate", value: primaryBranch?.mandates ?? primaryBranch?.regulations },
    { label: "Mission", value: primaryBranch?.mission },
    { label: "Vision", value: primaryBranch?.vision },
    { label: "Objectives", value: primaryBranch?.objectives },
  ];
  const leaders = leadership.data.filter((member) => member.is_public !== false);
  const featuredLeader = leaders[0];
  const staffGroups = staffData.groupedStaff
    .map((group) => ({
      branch: group.branch,
      staff: group.staff.filter(
        (member) => member.is_public !== false && member.is_active !== false,
      ),
    }))
    .filter((group) => group.staff.length > 0);

  return (
    <main id="library-main" className="min-h-screen bg-background">
      <EditorialPageHero
        eyebrow="About the Library"
        title="A library built around access, scholarship, and support."
        body="Learn how Kisii University Library supports teaching, learning, research, and community engagement through its people, spaces, collections, and services."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Library", href: "/" }, { label: "About" }]}
        actions={<><PrimaryLink href="/catalog">Search the catalog</PrimaryLink><SecondaryLink href="/services">Explore services</SecondaryLink></>}
      />

      {errors.map((error) => <section key={error} className="px-4 pt-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section>)}

      <EditorialSection title={primaryBranch?.name ?? "Kisii University Library"} body={compactText(primaryBranch?.description) || "Library overview content is being updated by the library team."}>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="border-l-4 border-secondary bg-surface-subtle p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">Library direction</p>
            <p className="mt-4 text-base leading-8 text-foreground">The Library connects the University community with reliable information, supportive expertise, and spaces for focused study and collaborative learning.</p>
          </div>
          <AboutTabs items={tabs} />
        </div>
      </EditorialSection>

      <div id="leadership" className="scroll-mt-24">
        <EditorialSection eyebrow="Leadership" title="People who support your academic journey" body="Meet the library leadership who guide services for students, researchers, and staff." tone="soft">
          {featuredLeader ? <LeadershipFeature member={featuredLeader} /> : <StatusMessage>No public library leadership records are available yet.</StatusMessage>}
          {leaders.length > 1 ? <div className="mt-10 grid gap-x-8 divide-y divide-border sm:grid-cols-2 sm:divide-y-0">{leaders.slice(1).map((member) => <StaffRow key={member.id} member={member} />)}</div> : null}
        </EditorialSection>
      </div>

      <div id="staff" className="scroll-mt-24">
        <EditorialSection title="Library team by branch" body="Public library staff records grouped by the branch where they are based.">
          {staffGroups.length === 0 ? (
            <StatusMessage>No public library staff records are available yet.</StatusMessage>
          ) : (
            <div className="grid gap-10">
              {staffGroups.map((group) => (
                <div key={group.branch.id}>
                  <h3 className="text-xl font-semibold text-foreground">{group.branch.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{formatLabel(group.branch.library_type ?? "library")}</p>
                  <div className="mt-4 grid gap-x-8 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-3">
                    {group.staff.map((member) => <StaffRow key={member.id} member={member} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </EditorialSection>
      </div>

      <EditorialSection title="Access points across the University" body="Each public branch record is maintained by the library team and reused across the catalog, services, and contact journeys.">
        <div className="divide-y divide-border border-y border-border">{branches.data.length === 0 ? <StatusMessage>No public library branches are available yet.</StatusMessage> : branches.data.map((branch) => <div key={branch.id} className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-lg font-semibold text-foreground">{branch.name}</h3><p className="mt-1 text-sm text-muted-foreground">{branch.address ?? branch.location ?? "Location being updated"}</p></div><Link href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">Contact this branch <ArrowRight aria-hidden className="h-4 w-4" /></Link></div>)}</div>
      </EditorialSection>

      <section className="bg-primary px-4 py-14 text-white sm:px-6 lg:px-8"><div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Stay connected</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Need help understanding the Library?</h2><p className="mt-3 max-w-xl text-white/75">Contact the library team or send a question to a librarian for guidance.</p></div><div className="flex flex-wrap gap-3"><Link href="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-secondary px-5 py-3 text-sm font-semibold text-white hover:bg-secondary/90">Contact the Library <ArrowRight aria-hidden className="h-4 w-4" /></Link><Link href="/ask" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/35 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Ask a librarian <ArrowRight aria-hidden className="h-4 w-4" /></Link></div></div></section>
    </main>
  );
}

function LeadershipFeature({ member }: { member: LibraryStaff }) {
  return <div className="grid gap-8 border-b border-border pb-10 lg:grid-cols-[220px_1fr] lg:items-center"><div className="grid h-52 w-52 place-items-center rounded-full bg-primary/10 text-primary"><Users aria-hidden className="h-16 w-16" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Library leadership</p><h3 className="mt-3 text-3xl font-semibold text-foreground">{member.person?.full_name ?? "Library leader"}</h3><p className="mt-2 text-base font-medium text-primary">{member.job_title ?? member.role ?? "Library leadership"}</p><p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground">{compactText(member.bio) || compactText(member.specialization) || "Leadership information is maintained by the library team."}</p>{member.person?.email ? <a href={`mailto:${member.person.email}`} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary"><Mail aria-hidden className="h-4 w-4" />{member.person.email}</a> : null}</div></div>;
}

function StaffRow({ member }: { member: LibraryStaff }) {
  return <div className="flex gap-3 border-b border-border py-4 last:border-b-0"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Users aria-hidden className="h-4 w-4" /></span><div><p className="font-semibold text-foreground">{member.person?.full_name ?? "Library staff member"}</p><p className="mt-1 text-sm text-muted-foreground">{member.job_title ?? member.role ?? member.department ?? "Library team"}</p></div></div>;
}
