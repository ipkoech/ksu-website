import type { Event } from "@ksu/api-client";
import { notFound } from "next/navigation";
import {
  LibraryHero,
  LibrarySection,
  LibraryShell,
  SecondaryLink,
  StatusMessage,
} from "../../../../components/library-ui";
import {
  compactText,
  formatDate,
  getLibraryUpdateDetail,
  isLibraryUpdateType,
  shortText,
  type LibraryUpdateType,
} from "../../../../lib/library-public-data";
import { LibraryUpdateContentDisplay } from "./update-content-display";

// Published update details can use ISR; missing/upstream failures stay request-only.
export const revalidate = 300;

const TYPE_LABELS: Record<LibraryUpdateType, string> = {
  news: "News",
  events: "Event",
  articles: "Article",
};

type UpdateDetailPageProps = {
  params: Promise<{ type: string; slug: string }>;
};

export async function generateMetadata({ params }: UpdateDetailPageProps) {
  const { type, slug } = await params;
  if (!isLibraryUpdateType(type)) return { title: "Update" };
  const { data } = await getLibraryUpdateDetail(type, slug);
  if (!data) return { title: TYPE_LABELS[type] };
  return {
    title: data.title,
    description: shortText(data.summary ?? data.plain_text, "", 160) || undefined,
  };
}

export default async function LibraryUpdateDetailPage({
  params,
}: UpdateDetailPageProps) {
  const { type, slug } = await params;
  if (!isLibraryUpdateType(type)) notFound();

  const { data: record, error } = await getLibraryUpdateDetail(type, slug);
  if (!record && !error) notFound();

  const typeLabel = TYPE_LABELS[type];
  const event = type === "events" ? (record as Event) : null;
  const metaParts = [
    record
      ? formatDate(
          (event?.start_date ?? record.published_at) || record.created_at,
        )
      : null,
    event?.is_virtual ? "Virtual event" : compactText(event?.venue ?? event?.location) || null,
    record && "category" in record && record.category
      ? compactText(record.category)
      : null,
  ].filter(Boolean) as string[];

  return (
    <LibraryShell>
      <LibraryHero
        eyebrow={`Library ${typeLabel}`}
        title={record?.title ?? `Library ${typeLabel.toLowerCase()}`}
        body={
          record
            ? shortText(record.summary ?? record.plain_text, metaParts.join(" · ") || "Published by Kisii University Library.")
            : "This update is temporarily unavailable."
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Updates", href: "/updates" },
          { label: typeLabel },
        ]}
        actions={<SecondaryLink href={`/updates${type === "news" ? "" : `?type=${type}`}`}>All {typeLabel.toLowerCase() === "news" ? "news" : `${typeLabel.toLowerCase()}s`}</SecondaryLink>}
      />

      {error ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1320px]">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        </section>
      ) : null}

      {record ? (
        <LibrarySection
          eyebrow={metaParts.join(" · ") || typeLabel}
          title={record.title}
          tone="white"
        >
          <LibraryUpdateContentDisplay
            content={record.rich_text || record.content || record.plain_text || ""}
            fallback={shortText(
              record.summary ?? record.plain_text,
              "The full text of this update has not been published yet. Contact the library desk for details.",
              600,
            )}
          />
        </LibrarySection>
      ) : null}
    </LibraryShell>
  );
}
