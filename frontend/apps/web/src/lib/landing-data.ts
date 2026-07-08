import {
  announcementsApi,
  resolveMainMediaUrl,
  slidersApi,
  type Announcement,
  type Slider,
  type SliderGroup,
} from "@ksu/api-client";
import { publicMediaUrl } from "@/lib/public-media";

export type LandingAnnouncementVariant = "info" | "warning" | "urgent" | "success";

export interface LandingAnnouncement {
  id: string;
  message: string;
  linkText?: string;
  linkHref?: string;
  variant?: LandingAnnouncementVariant;
  dismissible?: boolean;
}

export interface LandingHeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  imageUrl: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  imageAlt: string;
  primaryLabel: string;
  primaryHref: string;
  primaryExternal?: boolean;
  secondaryLabel?: string;
  secondaryHref?: string;
  secondaryExternal?: boolean;
}

export interface LandingHeroData {
  slides: LandingHeroSlide[];
  autoPlay: boolean;
  autoPlayDurationMs: number;
  showNavigationDots: boolean;
  showArrows: boolean;
  transitionEffect?: string | null;
}

interface SliderMedia {
  url?: string | null;
  public_url?: string | null;
  cdn_url?: string | null;
  thumbnail_url?: string | null;
  alt_text?: string | null;
  title?: string | null;
  original_filename?: string | null;
}

type SliderWithMedia = Slider & {
  desktop_media?: SliderMedia | null;
  mobile_media?: SliderMedia | null;
};

const defaultHeroSettings: Omit<LandingHeroData, "slides"> = {
  autoPlay: true,
  autoPlayDurationMs: 7000,
  showNavigationDots: true,
  showArrows: true,
  transitionEffect: "fade",
};

const homepageHeroLocations = new Set(["home.hero", "homepage.hero", "landing.hero"]);
const homepageHeroSlugs = new Set(["homepage-hero", "home-hero", "landing-hero"]);

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

const sliderGroupFields = [
  "id",
  "name",
  "slug",
  "location",
  "scope_type",
  "scope_id",
  "is_main",
  "is_public",
  "is_active",
  "max_slides",
  "auto_play",
  "auto_play_duration",
  "show_navigation_dots",
  "show_arrows",
  "transition_effect",
].join(",");

const sliderFields = [
  "id",
  "title",
  "subtitle",
  "plain_text",
  "rich_text",
  "desktop_media_id",
  "mobile_media_id",
  "external_url",
  "link_text",
  "open_in_new_tab",
  "scope_type",
  "scope_id",
  "is_main",
  "is_public",
  "is_active",
  "start_datetime",
  "end_datetime",
  "archived_at",
  "display_order",
].join(",");

const sliderMediaFields = [
  "id",
  "url",
  "public_url",
  "cdn_url",
  "thumbnail_url",
  "alt_text",
  "title",
  "original_filename",
].join(",");

const sliderInclude = [
  `desktop_media(${sliderMediaFields})`,
  `mobile_media(${sliderMediaFields})`,
].join(";");

const announcementFields = [
  "id",
  "title",
  "slug",
  "summary",
  "plain_text",
  "priority",
  "category",
  "audience",
  "published_at",
  "is_main",
].join(",");

function plainText(value?: string | null) {
  const decoded = (value ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return decoded
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length - 1).trim()}…` : value;
}

function mediaUrl(media?: SliderMedia | null) {
  if (!media) return undefined;
  return publicMediaUrl(media) ?? (
    resolveMainMediaUrl(media.cdn_url) ??
    resolveMainMediaUrl(media.public_url) ??
    resolveMainMediaUrl(media.url) ??
    resolveMainMediaUrl(media.thumbnail_url)
  );
}

function isExternalHref(value: string) {
  return /^https?:\/\//i.test(value);
}

function normalizeSlider(slider: SliderWithMedia): LandingHeroSlide {
  const desktopUrl = mediaUrl(slider.desktop_media);
  const mobileUrl = mediaUrl(slider.mobile_media);
  const imageUrl = desktopUrl || mobileUrl || "/logos/ksu-bck5.jpg";
  const body =
    plainText(slider.rich_text) ||
    plainText(slider.plain_text) ||
    "Access admissions, academic programmes, research enterprise, governance information, and student or staff services from one clear institutional entry point.";
  const primaryHref = slider.external_url || "/admissions/how-to-apply";

  return {
    id: slider.id,
    eyebrow: slider.subtitle || "Kisii University",
    title: slider.title || "Kisii University",
    body: truncate(body, 240),
    imageUrl,
    desktopImageUrl: desktopUrl || mobileUrl || "/logos/ksu-bck5.jpg",
    mobileImageUrl: mobileUrl || undefined,
    imageAlt:
      slider.desktop_media?.alt_text ||
      slider.mobile_media?.alt_text ||
      slider.desktop_media?.title ||
      slider.mobile_media?.title ||
      slider.title ||
      "Kisii University",
    primaryLabel: slider.link_text || (slider.external_url ? "Learn more" : "View Admissions Guide"),
    primaryHref,
    primaryExternal: slider.open_in_new_tab || isExternalHref(primaryHref),
    secondaryLabel: (slider as unknown as Record<string, unknown>).secondary_label as string | undefined,
    secondaryHref: (slider as unknown as Record<string, unknown>).secondary_url as string | undefined,
    secondaryExternal: (slider as unknown as Record<string, unknown>).secondary_open_in_new_tab as boolean | undefined,
  };
}

function chooseHeroGroup(groups: SliderGroup[], allowFallback: boolean) {
  const unscopedGroups = groups.filter((group) => !group.scope_type && !group.scope_id);

  return (
    unscopedGroups.find((group) => group.location && homepageHeroLocations.has(group.location.toLowerCase())) ??
    unscopedGroups.find((group) => homepageHeroSlugs.has(group.slug.toLowerCase())) ??
    (allowFallback ? unscopedGroups[0] : undefined)
  );
}

function heroSettingsFromGroup(group?: SliderGroup | null): Omit<LandingHeroData, "slides"> {
  if (!group) return defaultHeroSettings;

  const duration = group.auto_play_duration ?? defaultHeroSettings.autoPlayDurationMs;
  const safeDuration = Number.isFinite(duration) && duration >= 3000 ? duration : defaultHeroSettings.autoPlayDurationMs;

  return {
    autoPlay: Boolean(group.auto_play),
    autoPlayDurationMs: safeDuration,
    showNavigationDots: group.show_navigation_dots ?? true,
    showArrows: group.show_arrows ?? true,
    transitionEffect: group.transition_effect || "fade",
  };
}

function maxSlidesFromGroup(group?: SliderGroup | null) {
  if (!group?.max_slides) return 5;
  return Math.min(Math.max(group.max_slides, 1), 12);
}

function priorityVariant(priority?: string | null): LandingAnnouncementVariant {
  const value = (priority ?? "").toLowerCase();
  if (/(urgent|critical|emergency|high)/.test(value)) return "urgent";
  if (/(warning|deadline|medium|important)/.test(value)) return "warning";
  if (/(open|success|available|normal)/.test(value)) return "success";
  return "info";
}

function normalizeAnnouncement(announcement: Announcement): LandingAnnouncement {
  const detail =
    plainText(announcement.summary) ||
    plainText(announcement.plain_text) ||
    plainText(announcement.content) ||
    announcement.title;
  const hasDetailTitle = detail.toLowerCase().startsWith(announcement.title.toLowerCase());

  return {
    id: announcement.id,
    message: truncate(hasDetailTitle ? detail : `${announcement.title}: ${detail}`, 150),
    linkText: "Read",
    linkHref: `/media/announcements/${announcement.slug}`,
    variant: priorityVariant(announcement.priority),
    dismissible: false,
  };
}

async function listMainSliders() {
  const response = await slidersApi.listSliders({
    is_main: true,
    fields: sliderFields,
    include: sliderInclude,
  });
  return (response.data ?? []) as SliderWithMedia[];
}

async function listGroupSliders(groupId: string) {
  const response = await slidersApi.listSliders({
    slider_group_id: groupId,
    fields: sliderFields,
    include: sliderInclude,
  });
  return (response.data ?? []) as SliderWithMedia[];
}

async function getLandingHeroGroup() {
  const mainGroupsResponse = await slidersApi.listGroups({
    is_main: true,
    fields: sliderGroupFields,
  });
  const mainGroup = chooseHeroGroup(mainGroupsResponse.data ?? [], true);
  if (mainGroup) return mainGroup;

  const groupsResponse = await slidersApi.listGroups({
    fields: sliderGroupFields,
  });
  return chooseHeroGroup(groupsResponse.data ?? [], false) ?? null;
}

export async function getLandingHeroData(): Promise<LandingHeroData> {
  try {
    const group = await getLandingHeroGroup();
    if (group) {
      const sliders = await listGroupSliders(group.id);
      return {
        ...heroSettingsFromGroup(group),
        slides: sliders.slice(0, maxSlidesFromGroup(group)).map(normalizeSlider),
      };
    }

    const mainSliders = await listMainSliders();
    return {
      ...defaultHeroSettings,
      slides: mainSliders
        .filter((slider) => !slider.scope_type && !slider.scope_id)
        .slice(0, 5)
        .map(normalizeSlider),
    };
  } catch (error) {
    if (!isAbortError(error)) {
      console.error("Failed to fetch landing sliders:", error);
    }
    return { ...defaultHeroSettings, slides: [] };
  }
}

export async function getLandingHeroSlides(): Promise<LandingHeroSlide[]> {
  const hero = await getLandingHeroData();
  return hero.slides;
}

async function listMainAnnouncements() {
  const response = await announcementsApi.list({
    is_published: true,
    is_main: true,
    per_page: 5,
    fields: announcementFields,
  });
  return response.data ?? [];
}

async function listLatestAnnouncements() {
  const response = await announcementsApi.list({
    is_published: true,
    per_page: 5,
    fields: announcementFields,
  });
  return response.data ?? [];
}

export async function getLandingAnnouncements(): Promise<LandingAnnouncement[]> {
  try {
    const mainAnnouncements = await listMainAnnouncements();
    const announcements = mainAnnouncements.length ? mainAnnouncements : await listLatestAnnouncements();
    return announcements.slice(0, 5).map(normalizeAnnouncement);
  } catch (error) {
    if (!isAbortError(error)) {
      console.error("Failed to fetch landing announcements:", error);
    }
    return [];
  }
}
