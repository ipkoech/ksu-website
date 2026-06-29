"use client";

import { useEffect, useState, useRef } from "react";

function CountUpMetricCard({
  value,
  label,
  href,
  suffix = "",
}: {
  value: number;
  label: string;
  href: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || counted.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 1200;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return (
    <a href={href} className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-md">
      <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950 sm:text-4xl">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase text-slate-500">{label}</p>
      <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-secondary">
        Explore <span aria-hidden>→</span>
      </span>
    </a>
  );
}

export function CountUpMetrics({
  projects,
  publications,
  grants,
  innovations,
  partners,
}: {
  projects: { data: any[] };
  publications: { data: any[] };
  grants: { data: any[] };
  innovations: { data: any[] };
  partners: { data: any[] };
}) {
  return (
    <section className="bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-10 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto max-w-[1680px]">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase text-secondary">Research at a Glance</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Live counts from the research ecosystem — updated as records are published.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <CountUpMetricCard value={projects.data.length} label="Active Projects" href="/projects" />
          <CountUpMetricCard value={publications.data.length} label="Publications" href="/publications" />
          <CountUpMetricCard value={grants.data.length} label="Funding Calls" href="/funding" />
          <CountUpMetricCard value={innovations.data.length} label="Innovations" href="/innovations" />
          <CountUpMetricCard value={partners.data.length} label="Partners" href="/partners" />
        </div>
      </div>
    </section>
  );
}
