import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  EditorialPageHero,
  EditorialSection,
} from "../../components/library-page-sections";
import {
  compactText,
  getLibraryAboutData,
  getLibraryLeadershipData,
  getLibraryStaffData,
} from "../../lib/library-public-data";
import { AboutTabs } from "./about-tabs";
import { AboutRecordDisplay } from "./about-record-display";
import { PrimaryLink, SecondaryLink, StatusMessage } from "../../components/library-ui";

export const metadata = {
  title: "About & People",
  description: "About Kisii University Library: mandate, branches, leadership, and staff.",
};

export const revalidate = 300;

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

      <AboutRecordDisplay
        branches={branches.data}
        leaders={leaders}
        staffGroups={staffGroups}
      />

      <section className="bg-primary px-4 py-14 text-white sm:px-6 lg:px-8"><div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Stay connected</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Need help understanding the Library?</h2><p className="mt-3 max-w-xl text-white/75">Contact the library team or send a question to a librarian for guidance.</p></div><div className="flex flex-wrap gap-3"><Link href="/contact" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[hsl(var(--secondary-deep))] px-5 py-3 text-sm font-semibold text-white hover:bg-secondary/90">Contact the Library <ArrowRight aria-hidden className="h-4 w-4" /></Link><Link href="/ask" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/35 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Ask a librarian <ArrowRight aria-hidden className="h-4 w-4" /></Link></div></div></section>
    </main>
  );
}
