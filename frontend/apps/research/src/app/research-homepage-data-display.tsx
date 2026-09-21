"use client";

export type ResearchHomepageDataDisplayProps = {
  featuredWorkCount: number;
  partnerCount: number;
  resourceCount: number;
  newsCount: number;
};

/** A small interactive boundary for the server-projected homepage summary. */
export function ResearchHomepageDataDisplay({
  featuredWorkCount,
  partnerCount,
  resourceCount,
  newsCount,
}: ResearchHomepageDataDisplayProps) {
  const facts = [
    ["Featured work", featuredWorkCount],
    ["Partners", partnerCount],
    ["Resources", resourceCount],
    ["News and events", newsCount],
  ] as const;

  return (
    <section
      aria-label="Research activity at a glance"
      className="mx-auto grid max-w-[1680px] gap-3 px-4 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8 xl:px-10 2xl:px-12"
      data-server-data-display="research-homepage-summary"
    >
      {facts.map(([label, value]) => (
        <div key={label} className="rounded-lg border border-primary/10 bg-white/80 px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-2xl font-semibold text-primary">{value}</p>
        </div>
      ))}
    </section>
  );
}
