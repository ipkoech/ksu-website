"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "@ksu/ui/lib/utils";
import { Section, SectionHeader } from "@ksu/ui/motion";
import { PublicImage } from "@/components/public/public-image";
import type { HomePartner } from "@/lib/homepage-data";

export interface PartnersMarqueeProps {
  partners: HomePartner[];
  className?: string;
}

export function PartnersMarquee({ partners, className }: PartnersMarqueeProps) {
  const reducedMotion = useReducedMotion();
  const marqueePartners = [...partners, ...partners];

  if (partners.length === 0) return null;

  return (
    <Section className={cn("border-y border-border bg-white py-10", className)}>
      <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <SectionHeader
          title="Our Partners"
          description="Collaborating with organizations worldwide to advance education, research, and community development"
          align="center"
        />
      </div>

      <div className="relative mt-8 overflow-hidden py-4">
        <style>
          {`
            @keyframes partner-marquee {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
          `}
        </style>
        <div
          className={cn(
            "flex w-max gap-10 px-4",
            !reducedMotion && "[animation:partner-marquee_40s_linear_infinite] hover:[animation-play-state:paused]"
          )}
        >
          {marqueePartners.map((partner, index) => {
            const content = (
              <div className="flex h-20 w-48 items-center justify-center rounded-lg border border-border bg-white p-4 shadow-sm transition hover:shadow-md">
                <PublicImage
                  src={partner.logoUrl}
                  alt={partner.name}
                  ratio="logo"
                  sizes="160px"
                  className="h-12 w-full"
                  imageClassName="object-contain"
                />
              </div>
            );

            return partner.href ? (
              <a
                key={`${partner.id}-${index}`}
                href={partner.href}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
                aria-label={`Visit ${partner.name}`}
              >
                {content}
              </a>
            ) : (
              <div key={`${partner.id}-${index}`} className="shrink-0">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

export default PartnersMarquee;
