import Image from "next/image";
import type { PartnerSummary } from "../../lib/api";

export function PartnerMarquee({ partners }: { partners: PartnerSummary[] }) {
  if (!partners.length) return null;
  const row = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-14 pr-14"
    >
      {partners.map((partner) => (
        <li
          key={`${hidden ? "dup-" : ""}${partner.id}`}
          className="flex items-center gap-3 whitespace-nowrap"
        >
          {partner.logo_url ? (
            <Image
              src={partner.logo_url}
              alt=""
              width={36}
              height={36}
              unoptimized
              className="size-9 object-contain"
            />
          ) : null}
          <span className="text-lg font-bold text-heri-teal">
            {partner.name}
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <section
      aria-label="Our partners"
      className="heri-marquee overflow-hidden border-y border-slate-100 bg-white py-8"
    >
      <h2 className="text-center text-2xl font-bold text-heri-blue">
        Who we work with
      </h2>
      <div className="mt-6 flex w-max">
        <div className="heri-marquee-track flex">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
