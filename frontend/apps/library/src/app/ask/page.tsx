import {
  LibraryHero,
  LibrarySection,
  PrimaryLink,
  SecondaryLink,
  StatusMessage,
} from "../../components/library-ui";
import { getPublicAssistantContexts, getPublicBranches } from "../../lib/library-public-data";
import { AskLibraryClient } from "./ask-library-client";

export const metadata = {
  title: "Ask the Library",
  description:
    "Ask the Kisii University Library assistant a question, find grounded guidance, and continue with a librarian.",
};

export const dynamic = "force-dynamic";

export default async function AskLibrarianPage() {
  const [contexts, branches] = await Promise.all([
    getPublicAssistantContexts(),
    getPublicBranches(),
  ]);

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow="Ask the Library"
        title="Start with a question. Continue with a person when you need one."
        body="The Library assistant searches approved Kisii University Library guidance and shows its sources. You get one free answer, then an email-verified conversation you can return to later."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library", href: "/" },
          { label: "Ask the Library" },
        ]}
        actions={
          <>
            <PrimaryLink href="#assistant">Ask a question</PrimaryLink>
            <SecondaryLink href="/services">Explore services</SecondaryLink>
          </>
        }
      />

      {contexts.error ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            <StatusMessage tone="error">{contexts.error}</StatusMessage>
          </div>
        </section>
      ) : null}

      <LibrarySection
        eyebrow="Conversational support"
        title="Find the next useful step"
        body="Ask naturally about a resource, service, database, policy, branch, or research task. The assistant will use the Library’s published knowledge and explain when a librarian should take over."
        tone="white"
      >
        <div id="assistant">
          <AskLibraryClient contexts={contexts.data} />
        </div>
      </LibrarySection>

      <section className="bg-primary px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1320px] flex-col justify-between gap-7 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Human support</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">Your question can continue beyond the assistant.</h2>
            <p className="mt-3 max-w-xl text-white/75">Verify your email to keep the thread, or contact a branch directly for urgent help.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/contact#contact-form" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-secondary px-5 py-3 text-sm font-semibold text-white hover:bg-secondary/90">Contact the Library</a>
            <a href="/hours" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-white/35 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">View opening hours</a>
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1320px] border-t border-border pt-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Privacy by design</p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">Your first question is held temporarily for the preview. We only create a persistent conversation after you verify your email. Do not share passwords, payment details, or confidential personal information.</p>
          {branches.data.length > 0 ? <p className="mt-4 text-sm font-semibold text-primary">For urgent branch support, use the contacts published on the <a href="/contact" className="underline underline-offset-4">Contact the Library</a> page.</p> : null}
        </div>
      </section>
    </main>
  );
}
