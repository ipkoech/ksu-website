import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import {
  EditorialPageHero,
  EditorialSection,
  TextActionLink,
} from "../../components/library-page-sections";
import { PrimaryLink, SecondaryLink, StatusMessage } from "../../components/library-ui";
import {
  compactText,
  formatLabel,
  getLibraryHoursData,
  getLibraryTodayHours,
  safeExternalUrl,
} from "../../lib/library-public-data";
import { AskLibrarianForm } from "../ask/ask-librarian-form";
import { ContactBranchSelector } from "./contact-branch-selector";

export const metadata = {
  title: "Contact & Hours",
  description:
    "Contact Kisii University Library branches, check opening hours, and ask a librarian for support.",
};

export const dynamic = "force-dynamic";

export default async function LibraryContactPage() {
  const [{ branches, groupedHours, errors }, todayHours] = await Promise.all([
    getLibraryHoursData(),
    getLibraryTodayHours(),
  ]);

  const todayByBranch = Object.fromEntries(
    todayHours.data.map((item) => [
      item.library_id,
      item.is_closed
        ? "Closed today"
        : item.opens_at && item.closes_at
          ? `Open today ${item.opens_at} - ${item.closes_at}`
          : (item.note ?? null),
    ]),
  );

  return (
    <main id="library-main" className="min-h-screen bg-background">
      <EditorialPageHero
        eyebrow="Contact & Hours"
        title="Reach a library branch and plan your visit."
        body="Choose a branch to see its published contact details and opening hours, or send a question to the Library team for catalog, e-resource, borrowing, and research support."
        imageSrc="/images/library/reading-veranda.jpg"
        imageAlt="Students studying on the veranda of the Kisii University Library"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Library", href: "/" }, { label: "Contact & Hours" }]}
        actions={<><PrimaryLink href="#contact-form">Send an inquiry</PrimaryLink><SecondaryLink href="#hours">View opening hours</SecondaryLink></>}
      />

      {errors.map((error) => (
        <section key={error} className="px-4 pt-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{error}</StatusMessage></div></section>
      ))}

      <EditorialSection title="Contact points across KSU" body="Select a published branch to see the contact details currently maintained by the Library team.">
        <ContactBranchSelector branches={branches.data} todayByBranch={todayByBranch} />
      </EditorialSection>

      <section id="hours" className="scroll-mt-24 border-y border-border bg-[color-mix(in_srgb,hsl(var(--primary))_6%,white)] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-[1680px]">
          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Opening hours</p>
            <h2 className="mt-3 text-balance font-[family-name:var(--app-font-display)] text-3xl font-normal leading-tight tracking-tight text-foreground sm:text-5xl">Branch operating hours</h2>
            <p className="mt-4 text-pretty text-base leading-8 text-muted-foreground">Hours are shown when the library team has published a schedule for the branch.</p>
          </div>
          {todayHours.data.length > 0 ? (
            <div className="mb-8 rounded-lg border border-primary/20 bg-primary/5 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Today</p>
              <dl className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {todayHours.data.map((item) => (
                  <div key={item.library_id} className="text-sm">
                    <dt className="font-semibold text-foreground">{item.library_name}</dt>
                    <dd className="text-muted-foreground">
                      {item.is_closed
                        ? "Closed today"
                        : item.opens_at && item.closes_at
                          ? `${item.opens_at} - ${item.closes_at}`
                          : (item.note ?? "Schedule pending")}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
          <div className="grid gap-5 lg:grid-cols-2">
            {groupedHours.length === 0 ? (
              <StatusMessage>No public library branches are available yet.</StatusMessage>
            ) : (
              groupedHours.map(({ branch, hours }) => (
                <article key={branch.id} className="rounded-2xl bg-card p-5 ring-1 ring-primary/10">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">{formatLabel(branch.library_type ?? "library")}</p>
                  <h3 className="mt-3 text-xl font-semibold text-foreground">{branch.name}</h3>
                  {hours.length === 0 ? (
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">Hours for this branch are being updated.</p>
                  ) : (
                    <dl className="mt-5 divide-y divide-slate-200 text-sm">
                      {hours.map((item) => (
                        <div key={item.id} className="grid gap-2 py-3 sm:grid-cols-[160px_1fr]">
                          <dt className="font-semibold text-foreground">{formatLabel(item.day_type)}</dt>
                          <dd className="text-muted-foreground">
                            {item.is_closed
                              ? "Closed"
                              : `${item.opens_at ?? "Opening time pending"} - ${item.closes_at ?? "Closing time pending"}`}
                            {item.note ? <span className="block text-xs text-muted-foreground">{item.note}</span> : null}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      </section>

      <EditorialSection title="We are here to help" body="Tell us what you are trying to find, the branch or resource involved, and any deadline that will help the team respond quickly.">
        <div id="contact-form" className="scroll-mt-24 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20"><AskLibrarianForm branches={branches.data} /><aside className="border-l-4 border-secondary bg-surface-subtle p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Good questions include</p><ul className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground"><li>Resource title, database name, ISBN, call number, or course context.</li><li>The branch or service desk you already contacted.</li><li>Any access error, deadline, or support you need from a librarian.</li></ul><div className="mt-7"><TextActionLink href="/services">Explore library services</TextActionLink></div></aside></div>
      </EditorialSection>

      <EditorialSection title="Use the published details for your branch" body="For urgent branch-specific questions, use the direct contacts below or visit the branch during its published hours." tone="soft">
        {branches.data.length === 0 ? <StatusMessage>No public branch contact details are available yet.</StatusMessage> : <div className="divide-y divide-border border-y border-border">{branches.data.map((branch) => <div key={branch.id} className="grid gap-5 py-6 lg:grid-cols-[1fr_1fr_auto] lg:items-center"><div><h3 className="text-xl font-semibold text-foreground">{branch.name}</h3><p className="mt-1 text-sm text-muted-foreground">{branch.address ?? branch.location ?? "Location being updated"}</p></div><div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2"><ContactLine icon={<Phone aria-hidden />} value={branch.phone} /><ContactLine icon={<Mail aria-hidden />} value={branch.email} /></div>{safeExternalUrl(branch.website_url) ? <a href={safeExternalUrl(branch.website_url)!} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">Visit branch site <ArrowRight aria-hidden className="h-4 w-4" /></a> : <Link href="#hours" className="text-sm font-semibold text-primary hover:text-secondary">View hours</Link>}</div>)}</div>}
      </EditorialSection>

      <section className="bg-primary px-4 py-14 text-white sm:px-6 lg:px-8"><div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Research support</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Not sure where to start?</h2><p className="mt-3 max-w-xl text-white/75">Search the catalog, browse e-resources, or ask a librarian for guidance.</p></div><div className="flex flex-wrap gap-3"><Link href="/search" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-secondary px-5 py-3 text-sm font-semibold text-white hover:bg-secondary/90">Search the Library <ArrowRight aria-hidden className="h-4 w-4" /></Link><Link href="/ask" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/35 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Ask a librarian <ArrowRight aria-hidden className="h-4 w-4" /></Link></div></div></section>
    </main>
  );
}

function ContactLine({ icon, value }: { icon: React.ReactNode; value?: string | null }) {
  if (!compactText(value)) return null;
  return <span className="inline-flex items-center gap-2"><span className="text-primary">{icon}</span>{value}</span>;
}
