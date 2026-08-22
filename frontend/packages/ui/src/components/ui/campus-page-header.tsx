import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

/**
 * Campus header imagery shared by the public apps. Each app must serve these
 * files from its own `public/images/headers/` directory.
 *
 * These are photographs of named Kisii University landmarks, not stock campus
 * scenery. The `landmark` string is rendered as a credit on the header, which
 * is the whole point of the set: a visitor should be able to tell that they
 * are looking at *this* university, in the Kisii highlands, and not at an
 * anonymous quad that could belong to anyone.
 */
export const CAMPUS_HEADER_IMAGES = {
  "main-admin": {
    src: "/images/headers/main-admin.jpg",
    landmark: "Central Administration Building",
    alt: "The Central Administration Building at Kisii University, its blue glass frontage carrying the university name above the Kisii highlands",
    /** Keeps the signage and the hills in frame as the band gets shorter. */
    focus: "50% 38%",
    subject: "building",
    /** Route segments and topics this landmark speaks for. */
    themes: [
      "about",
      "administration",
      "governance",
      "leadership",
      "management",
      "council",
      "policy",
      "registrar",
      "finance",
      "tenders",
      "careers",
      "contact",
      "vice-chancellor",
    ],
  },
  sakagwa: {
    src: "/images/headers/sakagwa.jpg",
    landmark: "Sakagwa Academic Block",
    alt: "The Sakagwa Academic Block at Kisii University, fronted by clipped hedges and lawns with the teaching blocks rising behind",
    focus: "50% 45%",
    subject: "building",
    themes: [
      "academics",
      "schools",
      "faculties",
      "programmes",
      "programs",
      "courses",
      "departments",
      "teaching",
      "admissions",
      "apply",
      "study",
      "learning",
      "library",
      "examinations",
    ],
  },
  "chancellors-pavilion": {
    src: "/images/headers/chancellors-pavilion.jpg",
    landmark: "Chancellor's Pavilion",
    alt: "Students gathered on the field in front of the Chancellor's Pavilion at Kisii University",
    focus: "50% 55%",
    subject: "building",
    themes: [
      "campus-life",
      "students",
      "student",
      "sports",
      "games",
      "clubs",
      "events",
      "graduation",
      "alumni",
      "culture",
      "welfare",
      "accommodation",
      "community",
      "visitors",
      "news",
      "media",
    ],
  },
  "management-header": {
    src: "/images/headers/management-header.jpg",
    landmark: "University Management",
    alt: "Members of Kisii University management in session at a meeting table",
    // Framed low so all three faces sit above the copy; the headline then
    // lands on the desks rather than across someone's chin.
    focus: "50% 85%",
    // A room full of people, not a facade: the building duotone would crush
    // faces into silhouettes, so this one gets the lighter treatment.
    subject: "people",
    themes: [],
  },
  "block-c": {
    src: "/images/headers/block-c.jpg",
    landmark: "Block C",
    alt: "Block C at Kisii University, a modern blue glass teaching block lined with faculty banners",
    focus: "58% 50%",
    subject: "building",
    themes: [
      "research",
      "innovation",
      "postgraduate",
      "graduate",
      "science",
      "health",
      "medicine",
      "engineering",
      "technology",
      "ict",
      "partnerships",
      "conferences",
      "publications",
      "grants",
    ],
  },
} as const;

export type CampusHeaderImageName = keyof typeof CAMPUS_HEADER_IMAGES;

const CAMPUS_HEADER_IMAGE_NAMES = Object.keys(
  CAMPUS_HEADER_IMAGES,
) as CampusHeaderImageName[];

/** Stable, SSR-safe string hash. Never use Math.random() here — the server and
 *  the client must agree on the image or React will report a mismatch. */
function hashSeed(seed: string): number {
  let hash = 5381;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 33 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * Picks a campus landmark for a page.
 *
 * Tries meaning first: a seed such as `/academics/schools` resolves to the
 * academic block rather than to whatever a hash happens to land on. Only when
 * nothing in the seed matches a known theme does it fall back to hashing, so
 * unmapped pages still get a stable image instead of a repeated default.
 */
export function pickCampusHeaderImage(seed: string): CampusHeaderImageName {
  const normalized = seed.toLowerCase();
  const words = normalized.split(/[^a-z]+/).filter(Boolean);

  let best: { name: CampusHeaderImageName; score: number } | null = null;

  for (const name of CAMPUS_HEADER_IMAGE_NAMES) {
    for (const theme of CAMPUS_HEADER_IMAGES[name].themes) {
      // Match on whole words so "research" does not also fire on "researcher's
      // day" typos while "campus-life" still matches its own hyphenated slug.
      const themeWords = theme.split("-");
      const matches = themeWords.every((word) => words.includes(word));
      if (!matches) continue;
      // Longer themes are more specific, so let them outrank generic ones.
      const score = theme.length;
      if (!best || score > best.score) {
        best = { name, score };
      }
    }
  }

  if (best) return best.name;

  // Only themed images join the fallback pool. An image with no themes is
  // pinned-only — a specific photograph for a specific page, which should
  // never turn up on an unrelated route because a hash happened to land on it.
  const pool = CAMPUS_HEADER_IMAGE_NAMES.filter(
    (name) => CAMPUS_HEADER_IMAGES[name].themes.length > 0,
  );
  return pool[hashSeed(seed) % pool.length];
}

type CampusHeaderVariant = "compact" | "default" | "feature";

/** Band heights, 15% shorter than the first cut so the photograph reads as a
 *  banner rather than a splash screen. The image band starts at `md`. */
const variantHeights: Record<CampusHeaderVariant, string> = {
  compact: "min-h-[185px] lg:min-h-[212px]",
  default: "min-h-[272px] lg:min-h-[323px]",
  feature: "min-h-[374px] lg:min-h-[442px]",
};

const variantTitle: Record<CampusHeaderVariant, string> = {
  compact: "text-2xl lg:text-[2.35rem]",
  default: "text-3xl lg:text-[2.9rem]",
  feature: "text-4xl lg:text-[3.4rem]",
};

const variantPadding: Record<CampusHeaderVariant, string> = {
  compact: "pb-5 pt-9",
  default: "pb-8 pt-12",
  feature: "pb-11 pt-16",
};

export type CampusPageHeaderProps = {
  /**
   * Accepts a node so headlines can carry inline emphasis — the about section
   * writes titles like `A Future of <em>Impact.</em>`. When it is not a plain
   * string, pass `seed` (or `image`) so the landmark can still be resolved.
   */
  title: ReactNode;
  eyebrow?: string;
  description?: string;
  /**
   * Lighten the display face. The about section sets this: its editorial
   * headlines are set in regular weight with italic accents, not bold.
   */
  titleWeight?: "bold" | "normal";
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
  /** Rendered under the copy — stat strips, meta rows, search fields. */
  children?: ReactNode;
  /** Pin a specific landmark; omit to resolve one from `seed`/`title`. */
  image?: CampusHeaderImageName;
  /**
   * What to resolve the landmark from when `image` is omitted. Pass the route
   * path (`"/academics/schools"`) rather than the title — routes are stable and
   * carry the topic words the resolver matches on. Defaults to `title`.
   */
  seed?: string;
  variant?: CampusHeaderVariant;
  /** Hides the landmark credit. Only do this where the caption would collide. */
  hideLandmarkCredit?: boolean;
  /** Set false on headers below the fold to drop them out of the LCP path. */
  priority?: boolean;
  className?: string;
};

/**
 * Shared inner-page header: a named Kisii University landmark under a brand
 * navy duotone, with the display-serif title and orange kicker used across the
 * public site.
 *
 * The two scrims do different jobs and both are needed. The multiply layer
 * pulls the photographs — which are bright, high-key and cyan-skewed — into the
 * university's deep blue so a run of pages reads as one identity. The gradient
 * layer above it is purely for text contrast.
 */
export function CampusPageHeader({
  title,
  titleWeight = "bold",
  eyebrow,
  description,
  breadcrumbs,
  actions,
  children,
  image,
  seed,
  variant = "default",
  hideLandmarkCredit = false,
  priority = true,
  className,
}: CampusPageHeaderProps) {
  const resolvedSeed = seed ?? (typeof title === "string" ? title : "");
  const key = image ?? pickCampusHeaderImage(resolvedSeed);
  const picked = CAMPUS_HEADER_IMAGES[key];
  // Facades tolerate a heavy side scrim; faces do not. For people photographs
  // the weight moves to the foot of the band, so the copy still reads while
  // the subjects stay recognisable rather than sinking into silhouette.
  const isPeople = picked.subject === "people";

  return (
    <>
      {/* Small screens get the copy without the photograph. A band short enough
          for a phone cannot hold a legible headline over an unscrimmed image,
          and the whole point of this pass is that the image stays clear. */}
      <header className="border-b border-border bg-surface-subtle px-4 py-5 md:hidden">
        {breadcrumbs?.length ? (
          <nav
            aria-label="Breadcrumb"
            className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-muted-foreground"
          >
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <span
                  key={`${item.label}-${index}`}
                  className="inline-flex items-center gap-2"
                >
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="rounded-sm transition hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={isLast ? "text-foreground" : undefined}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                  {!isLast ? (
                    <ChevronRight
                      aria-hidden
                      className="h-3.5 w-3.5 text-muted-foreground/60"
                    />
                  ) : null}
                </span>
              );
            })}
          </nav>
        ) : null}

        {eyebrow ? (
          <p className="flex items-center gap-3 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-secondary">
            <span
              aria-hidden
              className="h-[3px] w-6 shrink-0 rounded-full bg-secondary"
            />
            {eyebrow}
          </p>
        ) : null}

        <h1
          className={cn(
            "mt-2 text-balance font-[family-name:var(--font-display)] text-2xl leading-[1.1] tracking-[-0.02em] text-foreground",
            titleWeight === "normal" ? "font-normal" : "font-bold",
          )}
        >
          {title}
        </h1>

        {description ? (
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {description}
          </p>
        ) : null}

        {actions ? (
          <div className="mt-4 flex flex-wrap gap-3">{actions}</div>
        ) : null}
        {children ? <div className="mt-4">{children}</div> : null}
      </header>

      <header
        className={cn(
          "relative isolate hidden overflow-hidden bg-[#04162f] md:block",
          variantHeights[variant],
          className,
        )}
      >
        <Image
          src={picked.src}
          alt={picked.alt}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: picked.focus }}
        />

        {/* The image is left essentially clear. What remains is the smallest
            scrim that still carries white type: a short wash under the copy at
            the foot of the band, and nothing at all across the picture. */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-x-0 bottom-0",
            // Reaches far enough up to sit behind the breadcrumb and eyebrow,
            // which are small and land on the brightest part of these
            // photographs — white facades under a white sky.
            isPeople
              ? "h-4/5 bg-[linear-gradient(180deg,transparent_0%,rgba(3,17,40,0.30)_45%,rgba(3,17,40,0.78)_100%)]"
              : "h-4/5 bg-[linear-gradient(180deg,transparent_0%,rgba(3,17,40,0.26)_45%,rgba(3,17,40,0.72)_100%)]",
          )}
        />

        {/* Kicker rule along the foot, in the university's blue-to-orange pair. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1 bg-[linear-gradient(90deg,hsl(var(--secondary))_0%,hsl(var(--secondary))_14%,rgba(255,255,255,0.22)_14%,rgba(255,255,255,0.16)_100%)]"
        />

        <div
          className={cn(
            "relative mx-auto flex h-full w-full max-w-[1680px] flex-col justify-end px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12",
            variantHeights[variant],
            variantPadding[variant],
          )}
        >
          {breadcrumbs?.length ? (
            <nav
              aria-label="Breadcrumb"
              // Small text cannot survive on shadow alone against a white
              // facade, so the trail carries its own slim backdrop instead of
              // the whole photograph being dimmed for its sake.
              className="mb-4 mr-auto flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-md bg-[rgba(3,17,40,0.42)] px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-[2px]"
            >
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <span
                    key={`${item.label}-${index}`}
                    className="inline-flex items-center gap-2"
                  >
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="rounded-sm transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        className={isLast ? "text-white" : undefined}
                        aria-current={isLast ? "page" : undefined}
                      >
                        {item.label}
                      </span>
                    )}
                    {!isLast ? (
                      <ChevronRight
                        aria-hidden
                        className="h-3.5 w-3.5 text-white/60"
                      />
                    ) : null}
                  </span>
                );
              })}
            </nav>
          ) : null}

          {eyebrow ? (
            // A filled chip rather than bare type with a rule: it is the one
            // element small enough to disappear entirely against a bright
            // building, and the university's orange makes it a brand mark.
            <p className="mr-auto inline-flex items-center rounded-full bg-secondary px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white shadow-[0_2px_10px_rgba(3,17,40,0.45)]">
              {eyebrow}
            </p>
          ) : null}

          <h1
            className={cn(
              // With the scrim this light the shadow is doing the legibility
              // work, so it is heavier than a shadow would normally be.
              "mt-3 max-w-4xl text-balance font-[family-name:var(--font-display)] leading-[1.06] tracking-[-0.02em] text-white [text-shadow:0_2px_6px_rgba(3,17,40,0.85),0_6px_28px_rgba(3,17,40,0.75)]",
              titleWeight === "normal" ? "font-normal" : "font-bold",
              variantTitle[variant],
            )}
          >
            {title}
          </h1>

          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white [text-shadow:0_1px_6px_rgba(3,17,40,0.95),0_3px_16px_rgba(3,17,40,0.8)] lg:text-base lg:leading-8">
              {description}
            </p>
          ) : null}

          {actions ? (
            <div className="mt-5 flex flex-wrap gap-3">{actions}</div>
          ) : null}

          {children ? <div className="mt-5">{children}</div> : null}
        </div>

        {!hideLandmarkCredit ? (
          <p className="pointer-events-none absolute bottom-4 right-4 flex max-w-[45%] items-center gap-2 text-right text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/80 [text-shadow:0_1px_6px_rgba(3,17,40,0.95)] sm:right-6 lg:right-8 xl:right-10 2xl:right-12">
            <span aria-hidden className="h-px w-5 shrink-0 bg-white/50" />
            {picked.landmark}
          </p>
        ) : null}
      </header>
    </>
  );
}

type NamedHeaderProps = Omit<CampusPageHeaderProps, "image" | "seed">;

export function BlockCPageHeader(props: NamedHeaderProps) {
  return <CampusPageHeader {...props} image="block-c" />;
}

export function ChancellorsPavilionPageHeader(props: NamedHeaderProps) {
  return <CampusPageHeader {...props} image="chancellors-pavilion" />;
}

export function MainAdminPageHeader(props: NamedHeaderProps) {
  return <CampusPageHeader {...props} image="main-admin" />;
}

export function SakagwaPageHeader(props: NamedHeaderProps) {
  return <CampusPageHeader {...props} image="sakagwa" />;
}
