"use client";

import Image from "next/image";
import { RevealItem } from "../motion/reveal";
import type { PartnerSummary } from "../../lib/api";

export function PartnerDirectoryPreview({ partners }: { partners: PartnerSummary[] }) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" data-server-data-display="heri-partner-preview">
      {partners.slice(0, 8).map((partner, index) => (
        <RevealItem key={partner.id} index={index} className="h-full">
          <article className="flex h-full items-center gap-4 rounded-2xl border border-slate-200 p-5">
            {partner.logo_url ? (
              <Image
                alt={`${partner.name} logo`}
                className="size-14 object-contain"
                height={56}
                src={partner.logo_url}
                unoptimized
                width={56}
              />
            ) : (
              <span className="grid size-14 place-items-center rounded-full bg-heri-cream text-sm font-bold text-heri-teal">
                {partner.name.slice(0, 2).toUpperCase()}
              </span>
            )}
            <div>
              <h3 className="font-bold text-heri-blue">{partner.name}</h3>
              <p className="text-xs text-slate-500">{partner.country ?? "Africa"}</p>
            </div>
          </article>
        </RevealItem>
      ))}
    </div>
  );
}
