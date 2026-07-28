import Link from "next/link";
import { ArrowRight, Mail, Phone } from "lucide-react";
import {
  EditorialPageHero,
  EditorialSection,
  TextActionLink,
} from "../../components/library-page-sections";
import { PrimaryLink, SecondaryLink, StatusMessage } from "../../components/library-ui";
import { compactText, getPublicBranches, safeExternalUrl } from "../../lib/library-public-data";
import { AskLibrarianForm } from "../ask/ask-librarian-form";
import { ContactBranchSelector } from "./contact-branch-selector";

export const metadata = {
  title: "Contact the Library",
  description: "Contact Kisii University Library branches and ask a librarian for support.",
};

export const dynamic = "force-dynamic";

export default async function LibraryContactPage() {
  const branches = await getPublicBranches();

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <EditorialPageHero
        eyebrow="Contact the Library"
        title="Reach the right library team for your next question."
        body="Choose a branch, check its published contact details, or send a question to the Library team for catalog, e-resource, borrowing, and research support."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Library", href: "/" }, { label: "Contact" }]}
        actions={<><PrimaryLink href="#contact-form">Send an inquiry</PrimaryLink><SecondaryLink href="/hours">View opening hours</SecondaryLink></>}
      />

      {branches.error ? <section className="px-4 pt-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-[1680px]"><StatusMessage tone="error">{branches.error}</StatusMessage></div></section> : null}

      <EditorialSection eyebrow="Find a branch" title="Contact points across KSU" body="Select a published branch to see the contact details currently maintained by the Library team.">
        <ContactBranchSelector branches={branches.data} />
      </EditorialSection>

      <EditorialSection eyebrow="Send a question" title="We are here to help" body="Tell us what you are trying to find, the branch or resource involved, and any deadline that will help the team respond quickly." tone="soft">
        <div id="contact-form" className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20"><AskLibrarianForm branches={branches.data} /><aside className="border-l-4 border-secondary bg-white p-6 sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Good questions include</p><ul className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground"><li>Resource title, database name, ISBN, call number, or course context.</li><li>The branch or service desk you already contacted.</li><li>Any access error, deadline, or support you need from a librarian.</li></ul><div className="mt-7"><TextActionLink href="/services">Explore library services</TextActionLink></div></aside></div>
      </EditorialSection>

      <EditorialSection eyebrow="Contact alternatives" title="Use the published details for your branch" body="For urgent branch-specific questions, use the direct contacts below or visit the branch during its published hours.">
        {branches.data.length === 0 ? <StatusMessage>No public branch contact details are available yet.</StatusMessage> : <div className="divide-y divide-border border-y border-border">{branches.data.map((branch) => <div key={branch.id} className="grid gap-5 py-6 lg:grid-cols-[1fr_1fr_auto] lg:items-center"><div><h3 className="text-xl font-semibold text-foreground">{branch.name}</h3><p className="mt-1 text-sm text-muted-foreground">{branch.address ?? branch.location ?? "Location being updated"}</p></div><div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2"><ContactLine icon={<Phone aria-hidden />} value={branch.phone} /><ContactLine icon={<Mail aria-hidden />} value={branch.email} /></div>{safeExternalUrl(branch.website_url) ? <a href={safeExternalUrl(branch.website_url)!} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">Visit branch site <ArrowRight aria-hidden className="h-4 w-4" /></a> : <Link href="/hours" className="text-sm font-semibold text-primary hover:text-secondary">View hours</Link>}</div>)}</div>}
      </EditorialSection>

      <section className="bg-primary px-4 py-14 text-white sm:px-6 lg:px-8"><div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Research support</p><h2 className="mt-3 text-3xl font-semibold sm:text-4xl">Not sure where to start?</h2><p className="mt-3 max-w-xl text-white/75">Search the catalog, browse e-resources, or ask a librarian for guidance.</p></div><div className="flex flex-wrap gap-3"><Link href="/search" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-secondary px-5 py-3 text-sm font-semibold text-white hover:bg-secondary/90">Search the Library <ArrowRight aria-hidden className="h-4 w-4" /></Link><Link href="/ask" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/35 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">Ask a librarian <ArrowRight aria-hidden className="h-4 w-4" /></Link></div></div></section>
    </main>
  );
}

function ContactLine({ icon, value }: { icon: React.ReactNode; value?: string | null }) {
  if (!compactText(value)) return null;
  return <span className="inline-flex items-center gap-2"><span className="text-primary">{icon}</span>{value}</span>;
}
