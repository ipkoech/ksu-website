import type { Metadata } from "next";
import type { ResearchGenericRecord } from "@ksu/api-client";

import { getRecordSummary, getRecordTitle } from "./research-page-model";

type PublicRecord = Record<string, unknown>;

const DEFAULT_DESCRIPTION =
  "Explore research, innovation, partnerships, and public impact at Kisii University.";

export function researchRecordMetadata(
  record: unknown,
  options: { fallbackTitle: string; pathname: string },
): Metadata {
  const publicRecord = record as (ResearchGenericRecord & PublicRecord) | null | undefined;
  const title = publicRecord ? getRecordTitle(publicRecord, options.fallbackTitle) : options.fallbackTitle;
  const description = truncate(
    (publicRecord ? getRecordSummary(publicRecord) : "") || DEFAULT_DESCRIPTION,
    160,
  );
  const image = resolveImage(publicRecord);

  return {
    title,
    description,
    alternates: { canonical: options.pathname },
    openGraph: {
      type: "article",
      title,
      description,
      url: options.pathname,
      siteName: "Kisii University Research",
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

function resolveImage(record?: PublicRecord | null) {
  const candidates = [
    record?.cover_image_url,
    record?.featured_image_url,
    record?.image_url,
    record?.thumbnail_url,
  ];
  const image = candidates.find((value) => typeof value === "string" && value.trim());
  return typeof image === "string" ? image : "/images/research/research-home-hero.webp";
}

function truncate(value: string, maximum: number) {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length <= maximum ? text : `${text.slice(0, maximum - 1).trimEnd()}…`;
}
