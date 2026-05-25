import Image from "next/image";
import { PageHeading } from "@/components/site-shell";

export const aboutIllustrations = {
  overview: "/images/about/about-overview.webp",
  history: "/images/about/about-history.webp",
  missionVision: "/images/about/about-mission-vision.webp",
  governance: "/images/about/about-governance.webp",
  leadership: "/images/about/about-leadership.webp",
  qualityAssurance: "/images/about/about-quality-assurance.webp",
  management: "/images/about/about-management.webp",
  administration: "/images/about/about-administration.webp",
  serviceCharter: "/images/about/about-service-charter.webp",
  strategicPlan: "/images/about/about-strategic-plan.webp",
} as const;

type AboutIllustrationProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imageClassName?: string;
};

function classes(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function AboutIllustration({
  src,
  alt,
  priority = false,
  sizes = "(min-width: 1280px) 520px, (min-width: 1024px) 42vw, 100vw",
  className,
  imageClassName,
}: AboutIllustrationProps) {
  return (
    <figure
      className={classes(
        "relative isolate min-h-[220px] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-100 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.48)]",
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className={classes("object-cover", imageClassName)}
      />
      <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/45" />
    </figure>
  );
}

type AboutIllustratedHeadingProps = {
  eyebrow: string;
  title: string;
  body: string;
  illustration: string;
  alt: string;
  priority?: boolean;
};

export function AboutIllustratedHeading({
  eyebrow,
  title,
  body,
  illustration,
  alt,
  priority = true,
}: AboutIllustratedHeadingProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-center">
      <PageHeading eyebrow={eyebrow} title={title} body={body} fullWidth />
      <AboutIllustration
        src={illustration}
        alt={alt}
        priority={priority}
        className="aspect-[4/3] min-h-[260px]"
      />
    </div>
  );
}
