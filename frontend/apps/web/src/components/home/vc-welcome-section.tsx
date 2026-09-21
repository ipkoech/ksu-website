import Link from "next/link";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import { ImageCurtainReveal } from "@/components/about/image-curtain-reveal";
import { Reveal } from "@/components/home/motion-primitives";
import type { HomeLeader } from "@/lib/homepage-data";

export interface VcWelcomeContent {
  /** The university-info record's approved message label. */
  eyebrow?: string | null;
  /** The VC record's own welcome headline. */
  title?: string | null;
  /** The welcome message, as published by the Office of the VC. */
  message: string;
  /** Where "Meet our VC" goes: the official profile or message page. */
  href: string;
}

/** Trim to whole sentences under `limit`, so the excerpt never ends mid-clause. */
function excerpt(message: string, limit = 320) {
  const text = message.trim();
  if (text.length <= limit) return text;
  const sentences = text.slice(0, limit + 1).match(/[^.!?]+[.!?]+/g);
  if (sentences && sentences.length > 0) {
    const joined = sentences.join("").trim();
    if (joined.length > 80) return joined;
  }
  return `${text.slice(0, limit - 1).trimEnd()}…`;
}

/**
 * The Vice-Chancellor's welcome: a clear institutional message from the
 * university-info record, set beside the official portrait and signed by the
 * current VC. The hub's navigation copy never replaces the message itself.
 */
export function VcWelcomeSection({
  leader,
  content,
}: {
  leader: HomeLeader | null;
  content?: VcWelcomeContent;
}) {
  const message = content?.message?.trim() || leader?.message?.trim();
  if (!leader || !message) return null;

  const href = content?.href || leader.href || "/about/university-management";
  const eyebrow =
    content?.eyebrow?.trim() || "Message from the Vice Chancellor";
  const title =
    content?.title?.trim() || "Leadership that listens, connects and acts";

  return (
    <section
      aria-labelledby="vc-welcome-heading"
      className="relative overflow-hidden bg-[hsl(var(--primary-deep))] text-white"
    >
      <div className="ksu-shell relative ksu-band-compact">
        <div className="grid items-stretch gap-0 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
          {/* Portrait */}
          <ImageCurtainReveal className="relative min-h-[16rem] sm:min-h-[18rem] lg:min-h-[20rem]">
            <PublicImage
              src={leader.image ?? "/images/Home/VCProfSUKUBA.jpg"}
              alt={`${leader.name}, ${leader.title}`}
              ratio="fill"
              className="absolute inset-0 h-full w-full bg-transparent"
              imageClassName="object-cover object-top"
              sizes="(min-width: 1024px) 36vw, 100vw"
            />
            {/* Feathers the portrait into the ink ground rather than ending
                on a hard rectangle edge. */}
            <div
              className="absolute inset-0 bg-[linear-gradient(to_right,transparent_55%,hsl(var(--primary-deep)/0.85)_100%)] lg:bg-[linear-gradient(to_right,transparent_60%,hsl(var(--primary-deep))_100%)]"
              aria-hidden
            />
          </ImageCurtainReveal>

          {/* Welcome */}
          <Reveal
            delay={0.1}
            className="flex min-w-0 flex-col justify-center py-8 lg:py-10 lg:pl-12"
          >
            <p className="ksu-eyebrow text-[hsl(var(--gold-light))]">
              {eyebrow}
            </p>
            <h2 id="vc-welcome-heading" className="ksu-l-h2 mt-3 font-normal">
              {title}
            </h2>

            <blockquote className="mt-5 max-w-[62ch] text-[1.02rem] leading-7 text-white/85">
              {excerpt(message, 640)}
            </blockquote>

            <div className="mt-5 flex items-center gap-5">
              <span
                className="h-px w-10 bg-[hsl(var(--gold-light))]"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="font-medium">{leader.name}</p>
                <p className="ksu-l-small text-white/60">{leader.title}</p>
              </div>
            </div>

            <Link
              href={href}
              className={cn(
                "group mt-5 inline-flex min-h-11 w-fit items-center gap-2 rounded-md bg-secondary px-6 py-3 font-medium text-white transition-[background-color,transform] duration-200 hover:bg-secondary/90 active:scale-[0.99]",
                focusVisibleStyles.white,
              )}
            >
              Meet our VC
              <span
                className="transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden
              >
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default VcWelcomeSection;
