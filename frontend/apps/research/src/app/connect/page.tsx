import type { Metadata } from "next";
import { HeartHandshake, Mail, Newspaper, Users } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchSidePanel } from "../../components/research-detail";
import {
  Badge,
  IconCard,
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

const engageLinks = [
  {
    label: "Research Inquiry",
    href: "/connect#get-in-touch",
    description: "Project collaboration, research support, and office help.",
    icon: Mail,
  },
  {
    label: "Mentorship",
    href: "/connect#mentorship",
    description: "Mentor and mentee pathways connected to published programmes.",
    icon: Users,
  },
  {
    label: "Media",
    href: "/connect#media",
    description: "Research interviews, expert comments, multimedia, and press routes.",
    icon: Newspaper,
  },
  {
    label: "Donate",
    href: "/donate",
    description: "Support research projects, scholarships, endowments, and impact.",
    icon: HeartHandshake,
  },
];

export default async function ConnectPage() {
  const [mentorship, donationStories] = await Promise.all([
    getMentorship(),
    getDonationStories(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero
        eyebrow="Connect & Engage"
        title="Reach research teams, partners, and programmes."
        body="Research office and staff contacts are now managed through the main university directory. Find mentorship, donation, and media channels below."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Research", href: "/" },
          { label: "Connect & Engage" },
        ]}
        imageSrc="/images/research/research-about-hero.svg"
        imageAlt="Research office contacts, engagement channels, mentorship, and donor support"
        links={engageLinks}
        primaryAction={{ label: "Start an inquiry", href: "/connect#get-in-touch" }}
        stats={[
          { label: "Mentorship programmes", value: mentorship.data.length },
          { label: "Donation stories", value: donationStories.data.length },
        ]}
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
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
              <span className="mt-5 inline-flex min-h-11 items-center rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-500">
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
            <p className="text-sm leading-7 text-slate-600">
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
        eyebrow="Multimedia & Integration Links"
        title="Tours, media, and cross-service pathways"
        body="This section gives the portal the requested virtual tours, interviews, galleries, academic links, alumni links, career links, and cross-promoted events."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <IconCard
            icon="news"
            title="Research multimedia"
            body="Feature virtual tours, explainer videos, researcher interview podcasts, and photo galleries."
            href="/resources-tools"
            action="Open media"
          />
          <IconCard
            icon="book"
            title="Academic programs"
            body="Connect research themes and projects to relevant academic programmes."
            href="/m/programmes"
            action="View programs"
          />
          <IconCard
            icon="users"
            title="Alumni network"
            body="Cross-promote alumni expertise, mentors, founders, and research ambassadors."
            href="/m/alumni"
            action="Open alumni"
          />
          <IconCard
            icon="target"
            title="Career services"
            body="Connect partner demand, research talent pipelines, internships, and graduate opportunities."
            href="/m/careers"
            action="Open careers"
          />
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
            <p className="text-sm leading-7 text-slate-600">
              Direct donor interest to scholarships, research facilities, innovation funds, community impact work, and endowed programmes.
            </p>
            <a
              href="/donate"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              Open donation page
            </a>
          </ResearchSidePanel>
        </div>
      </ResearchSection>
    </main>
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
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      {error ? <div className="mt-4"><StatusMessage tone="error">{error}</StatusMessage></div> : null}
      <div className="mt-4 divide-y divide-slate-200">
        {records.slice(0, 8).map((record) => (
          <article key={record.id} className="py-4">
            <div className="flex flex-wrap gap-2">
              <Badge>{formatLabel(record.role ?? record.office_type ?? record.status ?? "contact")}</Badge>
            </div>
            <h3 className="mt-3 text-base font-semibold leading-6 text-slate-950">
              {record.title ?? record.name ?? record.display_name}
            </h3>
            {compactText(record.summary) ||
            compactText(record.description) ||
            compactText(record.bio) ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
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

