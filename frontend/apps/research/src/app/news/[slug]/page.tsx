import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
  ResearchRecordPanel,
} from "../../../components/research-detail";
import { Badge, ResearchSection, StatusMessage } from "../../../components/research-ui";
import { ResearchRichText } from "../../../components/research-rich-text";
import {
  compactText,
  formatDate,
  formatLabel,
  generateSlugParams,
  getArticleBySlug,
  getCenters,
  getInnovations,
  getProjects,
  getPublications,
} from "../../../lib/research-public-data";
import {
  getRecordSummary,
  getRecordTitle,
} from "../../../lib/research-page-model";

export const revalidate = 300;
const passthroughImageLoader = ({ src }: { src: string }) => src;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.articles.list);
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getArticleBySlug(slug);
  if (!data) notFound();

  const record = data as ResearchGenericRecord;
  const [centers, projects, publications, innovations] = await Promise.all([
    getCenters(),
    getProjects(),
    getPublications(),
    getInnovations(),
  ]);
  const isArticle = Boolean(record.article_type);
  const attachments = Array.isArray(record.attachments)
    ? (record.attachments as ResearchGenericRecord[])
    : [];
  const tags = Array.isArray(record.tags) ? (record.tags as string[]) : [];
  const center = findById(centers.data, record.center_id);
  const project = findById(projects.data, record.project_id);
  const publication = findById(publications.data, record.publication_id);
  const innovation = findById(innovations.data, record.innovation_id);
  const imageUrl = compactText(record.cover_image_url) || compactText(record.photo_url);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow={isArticle ? "Research Article" : "Research Update"}
        title={record.title ?? "Research update"}
        body={compactText(record.summary) || compactText(record.excerpt)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "News", href: "/news" },
          { label: record.title ?? "Update" },
        ]}
        labels={[record.article_type ?? record.news_type ?? "update", record.category, record.status]}
        facts={[
          { label: "Published", value: formatDate(record.published_at) },
          { label: "Author", value: compactText(record.author_name) },
          { label: "Source", value: compactText(record.source) },
          { label: "Reading time", value: record.reading_time_minutes ? `${record.reading_time_minutes} minutes` : "" },
        ]}
        actions={[
          { label: "Back to news", href: "/news", variant: "secondary" },
          ...(compactText(record.external_url) ? [{ label: "Open source link", href: compactText(record.external_url) }] : []),
          ...(compactText(record.video_url) ? [{ label: "Watch media", href: compactText(record.video_url), variant: "secondary" as const }] : []),
        ]}
        imageSrc="/images/research/research-home-hero.svg"
        imageAlt="Research news and public update context"
      />
      {error ? (
        <section className="px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ) : null}

      <ResearchSection
        eyebrow="Published Story"
        title="Summary, context, and full text"
        body="This page presents the public story and connects it to the research activity, unit, output, or innovation it references."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            {imageUrl ? (
              <figure className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
                <Image
                  loader={passthroughImageLoader}
                  unoptimized
                  src={imageUrl}
                  alt=""
                  width={1600}
                  height={900}
                  className="max-h-[520px] w-full object-cover"
                />
                {compactText(record.cover_image_caption) ? (
                  <figcaption className="border-t border-border px-5 py-3 text-sm text-muted-foreground">
                    {compactText(record.cover_image_caption)}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}
            <NewsEvidencePanel
              title="Story"
              fields={[
                ["Excerpt", record.excerpt],
                ["Summary", record.summary],
                ["Content", record.rich_text ?? record.content ?? record.body ?? record.plain_text],
              ]}
            />
            {tags.length > 0 ? (
              <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
                  Topics
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag}>{formatLabel(tag)}</Badge>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <ResearchDetailSidebar
            labels={[record.article_type ?? record.news_type ?? "update", record.category, record.status]}
            facts={[
              { label: "Published", value: formatDate(record.published_at) },
              { label: "Author", value: record.author_name },
              { label: "Source", value: record.source },
              { label: "Reading time", value: record.reading_time_minutes ? `${record.reading_time_minutes} minutes` : "" },
              { label: "Views", value: record.view_count },
            ]}
            actions={[
              ...(compactText(record.external_url) ? [{ label: "Open source link", href: compactText(record.external_url) }] : []),
              ...(compactText(record.video_url) ? [{ label: "Watch media", href: compactText(record.video_url), variant: "secondary" as const }] : []),
            ]}
          />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Research Context"
        title="Source records and next paths"
        body="When the update is linked to a project, center, publication, or innovation, those public records are shown as useful context."
      >
        <SourceContext
          project={project}
          center={center}
          publication={publication}
          innovation={innovation}
        />
      </ResearchSection>

      <ResearchSection
        eyebrow="Resources"
        title="Downloads and author notes"
        body="Downloadable and supporting resources appear only when attached to the published record."
        tone="white"
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <ResearchRecordPanel title="Attachments" records={attachments} empty="No downloadable resources are linked yet." />
          <NewsEvidencePanel title="Author" fields={[["Name", record.author_name], ["Bio", record.author_bio]]} />
          <NewsEvidencePanel title="Publication Window" fields={[["Published", formatDate(record.published_at)], ["Expires", formatDate(record.expires_at)]]} />
        </div>
      </ResearchSection>
    </main>
  );
}

function NewsEvidencePanel({ title, fields }: { title: string; fields: Array<[string, unknown]> }) {
  const entries = fields
    .map(([label, value]) => ({ label, value: compactText(value as string | number | null | undefined) }))
    .filter((entry) => entry.value);

  if (entries.length === 0) {
    return <StatusMessage>{title} details are not published yet.</StatusMessage>;
  }

  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-4 flex flex-col gap-4">
        {entries.map((entry) => (
          <div key={entry.label}>
            <p className="text-xs font-semibold uppercase text-muted-foreground">{entry.label}</p>
            <ResearchRichText content={entry.value} className="mt-1 text-sm leading-7 text-muted-foreground" />
          </div>
        ))}
      </div>
    </section>
  );
}

function findById<T extends { id?: string }>(records: T[], id: unknown) {
  const recordId = compactText(id as string | number | null | undefined);
  return recordId ? records.find((record) => record.id === recordId) : undefined;
}

function SourceContext({
  project,
  center,
  publication,
  innovation,
}: {
  project?: ResearchGenericRecord;
  center?: ResearchGenericRecord;
  publication?: ResearchGenericRecord;
  innovation?: ResearchGenericRecord;
}) {
  const cards = [
    project
      ? {
          label: "Research project",
          title: getRecordTitle(project, "Research project"),
          href: project.slug ? `/projects/${project.slug}` : "/projects",
          body: getRecordSummary(project),
        }
      : null,
    center
      ? {
          label: "Research center",
          title: getRecordTitle(center, "Research center"),
          href: center.slug ? `/centers/${center.slug}` : "/centers",
          body: getRecordSummary(center),
        }
      : null,
    publication
      ? {
          label: "Publication or output",
          title: getRecordTitle(publication, "Publication"),
          href: publication.slug ? `/publications/${publication.slug}` : "/publications",
          body: getRecordSummary(publication),
        }
      : null,
    innovation
      ? {
          label: "Innovation",
          title: getRecordTitle(innovation, "Innovation"),
          href: innovation.slug ? `/innovations/${innovation.slug}` : "/innovations",
          body: getRecordSummary(innovation),
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; title: string; href: string; body: string }>;

  if (cards.length === 0) {
    return <StatusMessage>No public source records are linked yet.</StatusMessage>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-4">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="rounded-lg border border-border bg-white p-5 shadow-sm transition hover:border-primary/30 hover:bg-primary/5"
        >
          <p className="text-xs font-semibold uppercase text-secondary">{card.label}</p>
          <h2 className="mt-3 text-base font-semibold leading-6 text-foreground">{card.title}</h2>
          {card.body ? (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{card.body}</p>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
