import { notFound } from "next/navigation";
import Image from "next/image";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
  ResearchRecordPanel,
  ResearchRelationshipCard,
  ResearchTextPanel,
} from "../../../components/research-detail";
import { Badge, ResearchSection, StatusMessage } from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getArticleBySlug,
  getCenters,
  getInnovations,
  getProjects,
  getPublications,
} from "../../../lib/research-public-data";

export const revalidate = 300;
const passthroughImageLoader = ({ src }: { src: string }) => src;

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
              <figure className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
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
                  <figcaption className="border-t border-slate-200 px-5 py-3 text-sm text-slate-600">
                    {compactText(record.cover_image_caption)}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}
            <ResearchTextPanel
              title="Story"
              fields={[
                ["Excerpt", record.excerpt],
                ["Summary", record.summary],
                ["Content", record.content ?? record.body],
              ]}
            />
            {tags.length > 0 ? (
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
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
        title="Connected research records"
        body="When the update is linked to a research project, center, publication, or innovation, those relationships are shown as public context rather than internal database fields."
      >
        <div className="grid gap-5 lg:grid-cols-4">
          <ResearchRelationshipCard title="Research project" record={project} hrefBase="/projects" empty="No public related record is linked yet." />
          <ResearchRelationshipCard title="Research center" record={center} hrefBase="/centers" empty="No public related record is linked yet." />
          <ResearchRelationshipCard title="Publication or output" record={publication} hrefBase="/publications" empty="No public related record is linked yet." />
          <ResearchRelationshipCard title="Innovation" record={innovation} hrefBase="/innovations" empty="No public related record is linked yet." />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Resources"
        title="Downloads and author notes"
        body="Downloadable and supporting resources appear only when attached to the published record."
        tone="white"
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <ResearchRecordPanel title="Attachments" records={attachments} empty="No downloadable resources are linked yet." />
          <ResearchTextPanel title="Author" fields={[["Name", record.author_name], ["Bio", record.author_bio]]} />
          <ResearchTextPanel title="Publication Window" fields={[["Published", formatDate(record.published_at)], ["Expires", formatDate(record.expires_at)]]} />
        </div>
      </ResearchSection>
    </main>
  );
}

function findById<T extends { id?: string }>(records: T[], id: unknown) {
  const recordId = compactText(id as string | number | null | undefined);
  return recordId ? records.find((record) => record.id === recordId) : undefined;
}
