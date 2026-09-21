"use client";

import { useReducedMotionPref } from "@/components/home/reveal";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import type { HomePartner } from "@/lib/homepage-data";

export interface PartnersMarqueeProps {
  partners: HomePartner[];
  className?: string;
}

export interface PartnerLogoRailProps {
  partners: HomePartner[];
  compact?: boolean;
}

/**
 * The partnership rail.
 *
 * One continuous loop, no cards and no individual borders. Every logo is
 * boxed to the same height so a dense wordmark and a sparse one carry equal
 * weight regardless of the dimensions they were uploaded at, but each keeps
 * its own colour: these are named institutions, not texture.
 *
 * Under reduced motion the loop is replaced with a static wrapping row. The
 * duplicate half exists only to make the animation seamless, so it is dropped
 * there and hidden from assistive technology everywhere.
 */
export function PartnersMarquee({ partners, className }: PartnersMarqueeProps) {
  if (partners.length === 0) return null;

  return (
    <section
      aria-labelledby="partners-heading"
      className={cn(
        "border-y border-brand-overlay/10 bg-white py-14 text-brand-overlay lg:py-16",
        className,
      )}
    >
      <div className="ksu-shell max-w-[46rem] text-center">
        <h2 id="partners-heading" className="ksu-l-h2 font-normal">
          Research and learning, shared across borders
        </h2>
        <p className="ksu-l-small mx-auto mt-3 max-w-[54ch] text-brand-overlay/65">
          Universities, research institutes and public agencies across Africa,
          Asia, Europe and North America work with Kisii University on joint
          research, staff and student exchange, and community programmes.
        </p>
      </div>

      <PartnerLogoRail partners={partners} />
    </section>
  );
}

/**
 * An embeddable logo rail for composed homepage sections. It intentionally
 * owns only the moving row, so a section such as Research can introduce its
 * partners without creating a second, disconnected homepage beat.
 */
export function PartnerLogoRail({
  partners,
  compact = false,
}: PartnerLogoRailProps) {
  const reducedMotion = useReducedMotionPref();

  if (partners.length === 0) return null;

  const logoClassName = compact
    ? "h-10 w-32 bg-transparent"
    : "h-[3.025rem] w-40 bg-transparent";

  return reducedMotion ? (
    <ul
      className={cn(
        "flex flex-wrap items-center justify-center",
        compact
          ? "gap-x-8 gap-y-5"
          : "ksu-shell mt-10 gap-x-14 gap-y-8",
      )}
    >
      {partners.map((partner) => (
        <li key={partner.id}>
          <PartnerLogo
            partner={partner}
            className={logoClassName}
            eager={!compact}
          />
        </li>
      ))}
    </ul>
  ) : (
    <div
      className={cn(
        "ksu-partner-rail relative overflow-hidden",
        compact ? "mt-4" : "mt-10",
      )}
      style={{
        // Keeps the travel speed roughly constant as partners are added.
        ["--rail-duration" as string]: `${Math.max(28, partners.length * 6)}s`,
        // Soft fades at both edges instead of a hard clip.
        maskImage:
          "linear-gradient(to right, transparent, #000 6rem, #000 calc(100% - 6rem), transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, #000 6rem, #000 calc(100% - 6rem), transparent)",
      }}
    >
      <ul
        className={cn(
          "ksu-partner-rail-track flex w-max items-center pl-16",
          compact ? "gap-10" : "gap-16",
        )}
      >
        {partners.map((partner) => (
          <li key={partner.id}>
            <PartnerLogo
              partner={partner}
              className={logoClassName}
              eager={!compact}
            />
          </li>
        ))}
        {/* Second pass: purely visual, so the loop has no seam. */}
        {partners.map((partner) => (
          <li key={`${partner.id}-loop`} aria-hidden>
            <PartnerLogo
              partner={partner}
              decorative
              className={logoClassName}
              eager={false}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function PartnerLogo({
  partner,
  decorative = false,
  className,
  eager = true,
}: {
  partner: HomePartner;
  decorative?: boolean;
  className?: string;
  eager?: boolean;
}) {
  const logo = (
    <PublicImage
      src={partner.logoUrl}
      alt={decorative ? "" : partner.name}
      ratio="fill"
      /* Height is the previous 44px plus 10%. Logos render in their own
         colours: these are institutions the university is proud to name, and
         a grey wash made a wall of unreadable smudges out of them. */
      className={className ?? "h-[3.025rem] w-40 bg-transparent"}
      imageClassName="object-contain"
      sizes="160px"
      /* The rail translates its items well past the viewport edge, so a lazy
         logo out at the right never intersects and never loads — it would
         scroll into view blank. They are ~10-40KB each, so loading the set
         up front is cheaper than the pop-in. */
      eager={eager}
      /* The seeded marks are self-hosted, but `logo_url` is an editable field
         and an editor can point it at any host. next/image rejects a hostname
         outside `images.remotePatterns` by throwing — which took the whole
         homepage to a 500 the moment one partner's logo was off-domain. These
         are already-small brand assets (and several are SVG, which the
         optimizer passes through anyway), so skipping it costs nothing and
         removes the allowlist as a failure mode. */
      unoptimized
      /* A logo hosted on someone else's server will eventually 404. Without
         this, PublicImage would swap in the shared KSU fallback photograph
         and the rail would show a Kisii campus scene captioned as another
         institution — worse than showing nothing. The partner's name is the
         honest substitute. */
      fallbackContent={
        <span className="ksu-l-small px-2 text-center leading-tight text-brand-overlay/70">
          {partner.name}
        </span>
      }
    />
  );

  if (decorative || !partner.href) {
    return <span className="block shrink-0">{logo}</span>;
  }

  return (
    <a
      href={partner.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("block shrink-0", focusVisibleStyles.primary)}
      aria-label={`${partner.name} (opens in a new tab)`}
    >
      {logo}
    </a>
  );
}

export default PartnersMarquee;
