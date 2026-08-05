import { mainApi } from "@ksu/api-client";

import { nullIfNotFound } from "./public-fetch";

export type PublicMedia = {
  id?: string | null;
  url?: string | null;
  alt?: string | null;
  alt_text?: string | null;
  caption?: string | null;
  media_type?: string | null;
  mime_type?: string | null;
} | null;

export type PublicAboutUniversity = {
  name: string;
  short_name?: string | null;
  acronym?: string | null;
  motto?: string | null;
  overview?: string | null;
  mission?: string | null;
  vision?: string | null;
  philosophy?: string | null;
  strategic_plan_summary?: string | null;
  core_values?: string | null;
  founding_year?: number | null;
  institution_type?: string | null;
  charter_summary?: string | null;
  history_summary?: string | null;
  quick_facts?: Record<string, string | number | null> | null;
  physical_address?: string | null;
  city?: string | null;
  county?: string | null;
  country?: string | null;
};

export type PublicHistoryMilestone = {
  id: string;
  slug: string;
  year_label: string;
  title: string;
  summary: string;
  expanded_body?: string | null;
  image?: PublicMedia;
  image_alt_text?: string | null;
  source_title?: string | null;
  source_url?: string | null;
  display_order?: number | null;
};

export type PublicDocument = {
  id?: string | null;
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  public_label?: string | null;
  is_featured?: boolean;
  file?: PublicMedia;
} | null;

export type PublicInstitutionalItem = {
  id: string;
  title: string;
  description?: string | null;
  supporting_label?: string | null;
  supporting_value?: string | null;
  icon_key?: string | null;
  image?: PublicMedia;
  image_alt_text?: string | null;
  link_label?: string | null;
  link_url?: string | null;
  display_order?: number;
};

export type PublicInstitutionalSection = {
  id: string;
  slug: string;
  section_type: "narrative" | "commitments" | "process" | "priorities" | "outcomes" | "quote" | "document_collection" | "related_links" | "governance_links" | "institutional_profile";
  eyebrow?: string | null;
  heading: string;
  summary?: string | null;
  body?: string | null;
  layout_variant?: string | null;
  theme?: "light" | "ivory" | "blue" | "green" | null;
  primary_media?: PublicMedia;
  media_alt_text?: string | null;
  video_url?: string | null;
  display_order?: number;
  items: PublicInstitutionalItem[];
  documents: Array<NonNullable<PublicDocument>>;
};

export type PublicInstitutionalPage = {
  id: string;
  page_type: "about" | "service_charter" | "strategic_plan";
  slug: string;
  eyebrow?: string | null;
  title: string;
  introduction: string;
  hero_media?: PublicMedia;
  mobile_hero_media?: PublicMedia;
  hero_alt_text?: string | null;
  primary_document?: PublicDocument;
  reporting_period_label?: string | null;
  effective_date?: string | null;
  review_date?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  sections: PublicInstitutionalSection[];
};

export type PublicAboutData = {
  university: PublicAboutUniversity;
  content: {
    hero_eyebrow?: string | null;
    hero_headline?: string | null;
    hero_introduction?: string | null;
    identity_heading?: string | null;
    identity_narrative?: string | null;
    mandate_introduction?: string | null;
    video_title?: string | null;
    video_url?: string | null;
    video_transcript_url?: string | null;
    virtual_tour_type?: "embed" | "video" | null;
    virtual_tour_title?: string | null;
    virtual_tour_provider?: string | null;
    virtual_tour_url?: string | null;
    virtual_tour_accessibility_url?: string | null;
    hero_media?: PublicMedia;
    identity_media?: PublicMedia;
    video_poster_media?: PublicMedia;
    virtual_tour_media?: PublicMedia;
    virtual_tour_poster_media?: PublicMedia;
    old_campus_media?: PublicMedia;
    modern_campus_media?: PublicMedia;
  } | null;
  history: {
    milestones: PublicHistoryMilestone[];
    document?: { url?: string | null; title?: string | null } | null;
  };
  institutional_page?: PublicInstitutionalPage | null;
};

export type PublicFactItem = {
  id: string;
  kind?: string | null;
  label: string;
  display_value: string;
  numeric_value?: number | null;
  prefix?: string | null;
  suffix?: string | null;
  unit?: string | null;
  explanation?: string | null;
  icon_key?: string | null;
  link_url?: string | null;
  link_label?: string | null;
  source_title?: string | null;
  source_url?: string | null;
  verified_on?: string | null;
  is_featured?: boolean;
};

export type PublicFactsData = {
  edition: {
    reporting_year: number;
    title: string;
    introduction?: string | null;
    methodology_note?: string | null;
    verified_on?: string | null;
    source_document?: { url?: string | null; title?: string | null } | null;
  };
  groups: Array<{
    id: string;
    slug: string;
    heading: string;
    summary?: string | null;
    image?: PublicMedia;
    image_alt_text?: string | null;
    items: PublicFactItem[];
  }>;
  available_years: number[];
};

type DataResponse<T> = { data: T };

export async function getPublicAboutData(): Promise<PublicAboutData | null> {
  try {
    const response = await mainApi.get<DataResponse<PublicAboutData>>(
      "/api/v1/public/about",
    );
    return response.data;
  } catch (error) {
    console.error("Failed to load public About content:", error);
    return nullIfNotFound(error);
  }
}

export async function getPublicFactsData(
  year?: number,
): Promise<PublicFactsData | null> {
  try {
    const response = await mainApi.get<DataResponse<PublicFactsData>>(
      "/api/v1/public/about/facts",
      year ? { year } : undefined,
    );
    return response.data;
  } catch (error) {
    console.error("Failed to load public institutional facts:", error);
    return nullIfNotFound(error);
  }
}

export async function getPublicInstitutionalPage(slug: string): Promise<PublicInstitutionalPage | null> {
  try {
    const response = await mainApi.get<DataResponse<PublicInstitutionalPage>>(
      `/api/v1/public/institutional-pages/${slug}`,
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to load public institutional page ${slug}:`, error);
    return nullIfNotFound(error);
  }
}
