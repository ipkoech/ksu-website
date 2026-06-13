import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { ResearchGenericRecord, ResearchProject, ResearchPublication } from "@ksu/api-client";
import { ResearchDetailHero } from "../../../components/research-detail";
import { Badge, ResearchSection, StatusMessage } from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getArticleBySlug,
  getCenters,
  getInnovations,
  getNewsBySlug,
  getProjects,
  getPublications,
} from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";
const passthroughImageLoader = ({ src }: { src: string }) => src;

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const recordResult = article.data ? article : await getNewsBySlug(slug);
  const { data, error } = recordResult;
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
        imageSrc="/images/research/research-hero-imagegen.png"
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
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
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
            <TextPanel
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

          <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Badge>{formatLabel(record.article_type ?? record.news_type ?? "update")}</Badge>
              {record.category ? <Badge>{formatLabel(record.category)}</Badge> : null}
              {record.status ? <Badge>{formatLabel(record.status)}</Badge> : null}
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <Fact label="Published" value={formatDate(record.published_at)} />
              <Fact label="Author" value={compactText(record.author_name)} />
              <Fact label="Source" value={compactText(record.source)} />
              <Fact label="Reading time" value={record.reading_time_minutes ? `${record.reading_time_minutes} minutes` : ""} />
              <Fact label="Views" value={compactText(record.view_count)} />
            </dl>
            {compactText(record.external_url) ? (
              <a href={record.external_url} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white">
                Open source link
              </a>
            ) : null}
            {compactText(record.video_url) ? (
              <a href={record.video_url} className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-primary/25 px-4 text-sm font-semibold text-primary">
                Watch media
              </a>
            ) : null}
          </aside>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Research Context"
        title="Connected research records"
        body="When the update is linked to a research project, center, publication, or innovation, those relationships are shown as public context rather than internal database fields."
      >
        <div className="grid gap-5 lg:grid-cols-4">
          <RelatedPanel title="Research project" record={project} hrefBase="/projects" />
          <RelatedPanel title="Research center" record={center} hrefBase="/centers" />
          <RelatedPanel title="Publication or output" record={publication} hrefBase="/publications" />
          <RelatedPanel title="Innovation" record={innovation} hrefBase="/innovations" />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Resources"
        title="Downloads and author notes"
        body="Downloadable and supporting resources appear only when attached to the published record."
        tone="white"
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <RecordPanel title="Attachments" records={attachments} />
          <TextPanel title="Author" fields={[["Name", record.author_name], ["Bio", record.author_bio]]} />
          <TextPanel title="Publication Window" fields={[["Published", formatDate(record.published_at)], ["Expires", formatDate(record.expires_at)]]} />
        </div>
      </ResearchSection>
    </main>
  );
}

function TextPanel({ title, fields }: { title: string; fields: Array<[string, string | number | null | undefined]> }) {
  const entries = fields.map(([label, value]) => [label, compactText(value)] as const).filter(([, value]) => value);
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
        {title}
      </h2>
      {entries.length ? (
        <div className="mt-4 space-y-4">
          {entries.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
              <p className="mt-1 whitespace-pre-line text-sm leading-7 text-slate-600">{value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-7 text-slate-600">This information has not been published yet.</p>
      )}
    </section>
  );
}

function RelatedPanel({
  title,
  record,
  hrefBase,
}: {
  title: string;
  record?: ResearchGenericRecord | ResearchProject | ResearchPublication;
  hrefBase: string;
}) {
  const item = record as Record<string, string | number | null | undefined> | undefined;
  const name = compactText(item?.title) || compactText(item?.name);
  const summary =
    compactText(item?.summary) ||
    compactText(item?.abstract) ||
    compactText(item?.description);
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
      {record && name ? (
        <>
          <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">{name}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {summary || "A linked research record is published without a short description."}
          </p>
          {record.slug ? (
            <Link href={`${hrefBase}/${record.slug}`} className="mt-4 inline-flex text-sm font-semibold text-primary">
              View related record
            </Link>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-sm leading-7 text-slate-600">No public related record is linked yet.</p>
      )}
    </article>
  );
}

function RecordPanel({ title, records }: { title: string; records: ResearchGenericRecord[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
        {title}
      </h2>
      <div className="mt-4 divide-y divide-slate-200">
        {records.slice(0, 8).map((record, index) => (
          <article key={record.id ?? `${title}-${index}`} className="py-4 first:pt-0 last:pb-0">
            <h3 className="text-base font-semibold text-slate-950">
              {record.name ?? record.title ?? record.file_name ?? record.document_name ?? `Resource ${index + 1}`}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {compactText(record.description) || compactText(record.caption) || "Supporting resource"}
            </p>
            {record.url || record.file_url || record.document_url ? (
              <a href={record.url ?? record.file_url ?? record.document_url} className="mt-2 inline-flex text-sm font-semibold text-primary">
                Open resource
              </a>
            ) : null}
          </article>
        ))}
        {records.length === 0 ? (
          <p className="py-4 text-sm text-slate-600">No downloadable resources are linked yet.</p>
        ) : null}
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-semibold text-slate-950">{value || "Not published"}</dd>
    </div>
  );
}

function findById<T extends { id?: string }>(records: T[], id: unknown) {
  const recordId = compactText(id as string | number | null | undefined);
  return recordId ? records.find((record) => record.id === recordId) : undefined;
}
