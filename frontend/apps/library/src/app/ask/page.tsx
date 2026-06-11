import {
  IconCard,
  LibraryHero,
  LibrarySection,
  PrimaryLink,
  SecondaryLink,
  StatusMessage,
} from "../../components/library-ui";
import {
  compactText,
  formatLabel,
  getPublicBranches,
} from "../../lib/library-public-data";
import { AskLibrarianForm } from "./ask-librarian-form";

export const metadata = {
  title: "Ask a Librarian",
  description:
    "Send a question to Kisii University Library for catalog, e-resource, borrowing, and research support.",
};

export const dynamic = "force-dynamic";

export default async function AskLibrarianPage() {
  const branches = await getPublicBranches();
  const contactBranches = branches.data
    .filter((branch) => branch.phone || branch.email || branch.address)
    .slice(0, 3);

  return (
    <main id="library-main" className="min-h-screen bg-white">
      <LibraryHero
        eyebrow="Ask a Librarian"
        title="Send your question to the library team."
        body="Use this form for catalog help, database access, borrowing guidance, research support, training requests, and questions about library rules."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Library", href: "/" },
          { label: "Ask a Librarian" },
        ]}
        actions={
          <>
            <PrimaryLink href="#ask-form">Send question</PrimaryLink>
            <SecondaryLink href="/services">View services</SecondaryLink>
          </>
        }
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
            Support channel
          </p>
          <p className="mt-3 text-5xl font-bold">Ask</p>
          <p className="mt-2 text-sm leading-6 text-white/75">
            Questions are routed to library staff through the Library inquiries
            endpoint.
          </p>
        </div>
      </LibraryHero>

      {branches.error ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            <StatusMessage tone="error">{branches.error}</StatusMessage>
          </div>
        </section>
      ) : null}

      <LibrarySection
        eyebrow="Inquiry"
        title="Ask a library question"
        body="Choose a branch if your question belongs to a specific service point. For general catalog, electronic resource, or research questions, the general library desk option is fine."
        tone="white"
      >
        <div
          id="ask-form"
          className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"
        >
          <AskLibrarianForm branches={branches.data} />

          <aside className="space-y-5">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                Good questions include
              </p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li>Resource title, database name, ISBN, or call number.</li>
                <li>The branch or service desk you already contacted.</li>
                <li>Any deadline, access error, or course context.</li>
              </ul>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                Response route
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                The library team replies using the email address you submit.
                Urgent branch-specific requests should also use the published
                branch contacts below.
              </p>
            </section>
          </aside>
        </div>
      </LibrarySection>

      <LibrarySection
        eyebrow="Support Areas"
        title="What you can ask about"
        body="The inquiry form is for library support questions that need a staff response."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <IconCard
            icon="search"
            title="Catalog help"
            body="Ask about finding items, reading catalog records, call numbers, and availability."
            href="/catalog"
            action="Search first"
          />
          <IconCard
            icon="database"
            title="E-resource access"
            body="Report database access issues or ask how to use electronic journals, e-books, and platforms."
            href="/electronic"
            action="Browse platforms"
          />
          <IconCard
            icon="book"
            title="Borrowing"
            body="Ask about circulation, renewals, reference-only items, and branch service desks."
            href="/services"
            action="View services"
          />
          <IconCard
            icon="help"
            title="Research support"
            body="Request help with searching, training, research tools, and using library resources for coursework."
            href="#ask-form"
            action="Ask now"
          />
        </div>
      </LibrarySection>

      {contactBranches.length > 0 ? (
        <LibrarySection
          eyebrow="Branch Contacts"
          title="Published branch contact points"
          body="Use these contacts when your question is urgent or tied to a specific branch visit."
          tone="white"
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {contactBranches.map((branch) => (
              <article
                key={branch.id}
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                  {formatLabel(branch.library_type ?? "library")}
                </p>
                <h2 className="mt-3 text-xl font-semibold text-slate-950">
                  {branch.name}
                </h2>
                <dl className="mt-5 grid gap-3 text-sm text-slate-600">
                  <Meta label="Phone" value={branch.phone} />
                  <Meta label="Email" value={branch.email} />
                  <Meta label="Location" value={branch.address} />
                </dl>
              </article>
            ))}
          </div>
        </LibrarySection>
      ) : null}
    </main>
  );
}

function Meta({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  if (!compactText(value)) return null;
  return (
    <div>
      <dt className="font-semibold text-slate-950">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}
