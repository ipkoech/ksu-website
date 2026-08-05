import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

/**
 * Campus header imagery shared by the public apps. Each app must serve these
 * files from its own `public/images/headers/` directory.
 */
export const CAMPUS_HEADER_IMAGES = {
  "block-c": {
    src: "/images/headers/block-c.jpg",
    alt: "Block C at Kisii University",
  },
  "chancellors-pavilion": {
    src: "/images/headers/chancellors-pavilion.jpg",
    alt: "Chancellor's Pavilion at Kisii University",
  },
  "main-admin": {
    src: "/images/headers/main-admin.jpg",
    alt: "Main administration building at Kisii University",
  },
  sakagwa: {
    src: "/images/headers/sakagwa.jpg",
    alt: "Sakagwa building at Kisii University",
  },
} as const;

export type CampusHeaderImageName = keyof typeof CAMPUS_HEADER_IMAGES;

const CAMPUS_HEADER_IMAGE_NAMES = Object.keys(
  CAMPUS_HEADER_IMAGES,
) as CampusHeaderImageName[];

/**
 * Deterministically picks a campus header image from a seed (usually the page
 * pathname or title), so a given page always renders the same image while the
 * set still varies across the site. Server-render safe, unlike Math.random().
 */
export function pickCampusHeaderImage(seed: string): CampusHeaderImageName {
  let hash = 5381;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 33 + seed.charCodeAt(i)) >>> 0;
  }
  return CAMPUS_HEADER_IMAGE_NAMES[hash % CAMPUS_HEADER_IMAGE_NAMES.length];
}

export type CampusPageHeaderProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
  /** Pin a specific campus image; omit to pick one from `seed`/`title`. */
  image?: CampusHeaderImageName;
  /** Stable input for the image pick when `image` is omitted. Defaults to `title`. */
  seed?: string;
  className?: string;
};

/**
 * Shared inner-page header in the landing-page design language: campus photo,
 * navy side scrim, orange eyebrow with kicker rule, display-serif title.
 */
export function CampusPageHeader({
  title,
  eyebrow,
  description,
  breadcrumbs,
  actions,
  image,
  seed,
  className,
}: CampusPageHeaderProps) {
  const picked = CAMPUS_HEADER_IMAGES[image ?? pickCampusHeaderImage(seed ?? title)];

  return (
    <header
      className={cn(
        "relative isolate min-h-[260px] overflow-hidden bg-brand-overlay sm:min-h-[300px] lg:min-h-[340px]",
        className,
      )}
    >
      <Image
        src={picked.src}
        alt={picked.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,20,49,0.78)_0%,rgba(2,20,49,0.42)_55%,rgba(2,20,49,0.1)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
      <div className="relative mx-auto flex min-h-[260px] max-w-[1680px] flex-col justify-end px-4 pb-8 pt-20 sm:min-h-[300px] sm:px-6 sm:pb-10 lg:min-h-[340px] lg:px-8 xl:px-10 2xl:px-12">
        {breadcrumbs?.length ? (
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/75"
          >
            {breadcrumbs.map((item, index) => (
              <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
                {item.href && index < breadcrumbs.length - 1 ? (
                  <Link href={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                ) : (
                  <span className={index === breadcrumbs.length - 1 ? "text-white" : undefined}>
                    {item.label}
                  </span>
                )}
                {index < breadcrumbs.length - 1 ? (
                  <ChevronRight aria-hidden className="h-3.5 w-3.5" />
                ) : null}
              </span>
            ))}
          </nav>
        ) : null}
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
            {eyebrow}
            <span aria-hidden className="mt-2 block h-0.5 w-7 bg-secondary" />
          </p>
        ) : null}
        <h1 className="mt-3 max-w-3xl text-balance font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.1] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.55)] sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85 sm:text-base sm:leading-8">
            {description}
          </p>
        ) : null}
        {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </header>
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
