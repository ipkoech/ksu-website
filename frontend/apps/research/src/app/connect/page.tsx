import type { Metadata } from "next";
import Link from "next/link";
import { ResearchSidePanel } from "../../components/research-detail";
import { ResearchPageHero, ResearchPageHeroStats } from "../../components/research-page-hero";
import {
  Badge,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatLabel,
  getDonationStories,
  getMentorship,
} from "../../lib/research-public-data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Connect & Engage",
  description: "Research contacts, media inquiries, donations, multimedia, and mentorship sign-up.",
};

const inquiryRequests = [
  {
    id: "research",
    title: "Research inquiry",
    body: "For project collaboration, publications, facilities, and research office support.",
    subject: "Research Inquiry",
    terms: ["research", "reirm", "directorate", "office"],
  },
  {
    id: "partnership",
    title: "Partnership inquiry",
    body: "For industry, foundation, government, community, and international partnership requests.",
    subject: "Research Partnership Inquiry",
    terms: ["partnership", "partner", "resource", "mobilization", "innovation"],
  },
  {
    id: "community",
    title: "Community inquiry",
    body: "For outreach, public forums, community impact, and engagement requests.",
    subject: "Community Impact Inquiry",
    terms: ["community", "extension", "outreach", "sustainability", "impact"],
  },
  {
    id: "media",
    title: "Media inquiry",
    body: "For press releases, researcher interviews, expert comments, and multimedia requests.",
    subject: "Research Media Inquiry",
    terms: ["communication", "communications", "media", "news", "publicity"],
  },
];

export default async function ConnectPage() {
  const [mentorship, donationStories] = await Promise.all([
    getMentorship(),
    getDonationStories(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ConnectMasthead
        mentorshipCount={mentorship.data.length}
        donationStoryCount={donationStories.data.length}
      />
      <section className="px-4 pt-8 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-[1680px]">
          <StatusMessage tone="neutral">
            Research office and team contact records have moved to the main university service. For the latest research office contacts, visit the university staff directory.
          </StatusMessage>
        </div>
      </section>
      <ResearchSection
        eyebrow="Get in Touch"
        title="Clear inquiry channels"
        body="These channels map to the requested research, partnership, community, and media contact forms."
      >
        <div id="get-in-touch" className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {inquiryRequests.map((item) => (
            <article
              id={item.id}
              key={item.id}
              className="rounded-lg border border-border bg-white p-5 shadow-sm"
            >
              <h2 className="font-display text-lg font-semibold text-foreground">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.body}</p>
              <span className="mt-5 inline-flex min-h-11 items-center rounded-md border border-border bg-surface-subtle px-4 py-2 text-sm font-semibold text-muted-foreground">
                Contact via main university directory
              </span>
            </article>
          ))}
        </div>
      </ResearchSection>
      <ResearchSection
        eyebrow="Research Mentorship Programme"
        title="Mentor and mentee sign-up"
        body="Public mentorship programmes are listed here with direct routes for prospective mentors and mentees to contact the research office."
        tone="white"
      >
        <div id="mentorship" className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <DirectoryPanel title="Available mentorship programmes" records={mentorship.data} error={mentorship.error} />
          <ResearchSidePanel title="Sign up" eyebrow="Mentorship route">
            <p className="text-sm leading-7 text-muted-foreground">
              Choose the route that matches your role. Programme coordinators can review the request and guide you to the right mentorship pathway.
            </p>
            <div className="mt-5">
              <StatusMessage>
                Mentorship sign-up is available through the main university contacts directory.
              </StatusMessage>
            </div>
          </ResearchSidePanel>
        </div>
      </ResearchSection>
      <ResearchSection
        eyebrow="Donate"
        title="Support research impact"
        body="Donation stories and impact records show why philanthropic support matters."
        tone="white"
      >
        <div id="donate" className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <DirectoryPanel title="Donation stories" records={donationStories.data} error={donationStories.error} />
          <ResearchSidePanel title="Donate to research" eyebrow="Research giving">
            <p className="text-sm leading-7 text-muted-foreground">
              Direct donor interest to scholarships, research facilities, innovation funds, community impact work, and endowed programmes.
            </p>
            <Link
              href="/donate"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Open donation page
            </Link>
          </ResearchSidePanel>
        </div>
      </ResearchSection>
    </main>
  );
}

function ConnectMasthead({
  mentorshipCount,
  donationStoryCount,
}: {
  mentorshipCount: number;
  donationStoryCount: number;
}) {
  const stats = [
    { label: "Mentorship programmes", value: mentorshipCount },
    { label: "Donation stories", value: donationStoryCount },
  ];

  return (
    <ResearchPageHero eyebrow="Connect & Engage" title="Reach research teams, partners, and programmes" description="Find inquiry routes, mentorship records, donation stories, media channels, and cross-service research pathways." breadcrumbs={[{ label: "Home", href: "/" }, { label: "Connect & Engage" }]} actions={[{ label: "Start an inquiry", href: "/connect#get-in-touch" }, { label: "Donate", href: "/donate", variant: "secondary" }]} imageSrc="/institutional-research-images/KSUGreenLandscapingWithoutWMJuly2026-3976.jpg" imageAlt="Kisii University research engagement">
      <ResearchPageHeroStats facts={stats} />
    </ResearchPageHero>
  );
}

function DirectoryPanel({
  title,
  records,
  error,
}: {
  title: string;
  records: Array<Record<string, any>>;
  error: string | null;
}) {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      {error ? <div className="mt-4"><StatusMessage tone="error">{error}</StatusMessage></div> : null}
      <div className="mt-4 divide-y divide-border">
        {records.slice(0, 8).map((record) => (
          <article key={record.id} className="py-4">
            <div className="flex flex-wrap gap-2">
              <Badge>{formatLabel(record.role ?? record.office_type ?? record.status ?? "contact")}</Badge>
            </div>
            <h3 className="mt-3 text-base font-semibold leading-6 text-foreground">
              {record.title ?? record.name ?? record.display_name}
            </h3>
            {compactText(record.summary) ||
            compactText(record.description) ||
            compactText(record.bio) ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {compactText(record.summary) ||
                  compactText(record.description) ||
                  compactText(record.bio)}
              </p>
            ) : null}
            {record.email || record.phone ? (
              <p className="mt-2 text-sm font-semibold text-primary">
                {compactText(record.email) || compactText(record.phone)}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
