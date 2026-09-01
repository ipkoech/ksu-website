import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

import type { ResearchGenericRecord, ResearchProject, ResearchPublication } from "@ksu/api-client";
import { compactText, formatDate, formatLabel } from "../lib/research-public-data";
import { getRecordSummary, getRecordTitle } from "../lib/research-page-model";
import { ResearchRichText } from "./research-rich-text";

type StorySection = { title: string; body: string };

const chapterImages = [
  "/institutional-research-images/KSUGreenLandscapingWithoutWMJuly2026-3942.jpg",
  "/institutional-research-images/KSUInnovationWeek2025,April7,2026-8210.jpg",
  "/institutional-research-images/KSUGreenLandscapingWithoutWMJuly2026-3976.jpg",
  "/institutional-research-images/KSUInnovationWeek2025,April7,2026-8034.jpg",
  "/institutional-research-images/KSUGreenLandscapingWithoutWMJuly2026-3944.jpg",
  "/institutional-research-images/KSUInnovationWeek2025,April7,2026-8246.jpg",
];

export function ProjectEditorialStory({ sections, project, center, program, leadName, contactEmail }: { sections: StorySection[]; project: ResearchProject & ResearchGenericRecord; center?: ResearchGenericRecord; program?: ResearchGenericRecord; leadName?: string; contactEmail?: string }) {
  const gallery = projectMediaRecords(project, ["gallery", "gallery_media", "media"]);
  const overviewImage = mediaUrl(gallery[0]) || chapterImages[0];

  return (
    <section className="relative overflow-hidden border-y border-primary/10 bg-white/55 backdrop-blur-sm">
      <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,.75fr)] lg:items-stretch">
        <div className="px-5 py-9 sm:px-8 lg:px-12 lg:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">The research story</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">Where the inquiry begins</h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">{getRecordSummary(project) || compactText(project.abstract)}</p>
          <dl className="mt-7 grid gap-x-8 gap-y-4 border-t border-primary/10 pt-6 text-xs sm:grid-cols-2">
            {[{ label: "Programme", value: program ? getRecordTitle(program, "") : "" }, { label: "Principal investigator", value: leadName }, { label: "Centre", value: center ? getRecordTitle(center, "") : "" }, { label: "Contact", value: contactEmail }, { label: "Start date", value: formatDate(project.start_date) }, { label: "Status", value: formatLabel(compactText(project.status)) }].filter((item) => item.value).map((item) => <div key={item.label}><dt className="font-bold uppercase tracking-wider text-primary/70">{item.label}</dt><dd className="mt-1 text-sm font-semibold text-foreground">{item.value}</dd></div>)}
          </dl>
        </div>
        <div className="relative min-h-[320px] overflow-hidden lg:min-h-full">
          <Image src={overviewImage} alt="Kisii University research activity" fill sizes="(min-width:1024px) 38vw, 100vw" className="object-cover" unoptimized />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 py-4 sm:px-8 lg:px-12">
        {sections.map((section, index) => {
          const image = mediaUrl(gallery[index + 1]) || chapterImages[index % chapterImages.length];
          const showImage = index % 2 === 0;
          return (
            <article id={`story-${index}`} key={section.title} className="relative grid scroll-mt-28 gap-7 border-t border-primary/10 py-10 first:border-t-0 sm:py-14 lg:grid-cols-12 lg:items-center lg:gap-12">
              <div className={`${index % 2 ? "lg:col-start-6 lg:col-end-13" : "lg:col-span-7"}`}>
                <span aria-hidden className="mb-4 block h-1 w-14 rounded-full bg-[linear-gradient(90deg,hsl(var(--secondary)),hsl(var(--primary)))]" />
                <h3 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">{section.title}</h3>
                <ResearchRichText content={section.body} className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground" />
              </div>
              {showImage ? (
                <figure className={`relative min-h-[260px] overflow-hidden rounded-[1.75rem] shadow-[0_24px_60px_-38px_hsl(var(--primary)/0.65)] lg:col-span-5 ${index % 2 ? "lg:col-start-1 lg:row-start-1" : ""}`}>
                  <Image src={image} alt={`${section.title} research activity`} fill sizes="(min-width:1024px) 36vw, 100vw" className="object-cover" unoptimized />
                </figure>
              ) : (
                <div aria-hidden className={`hidden lg:col-span-5 lg:block ${index % 2 ? "lg:col-start-1 lg:row-start-1" : ""}`}><span className="block font-display text-7xl leading-none text-primary/[0.06]">KSU</span><span className="mt-4 block h-px w-full bg-gradient-to-r from-primary/30 to-transparent" /></div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function ProjectEvidenceSection({ publications, outputs }: { publications: ResearchPublication[]; outputs: ResearchGenericRecord[] }) {
  const groups = [publications.length ? { title: "Publications", records: publications, hrefBase: "/publications" } : null, outputs.length ? { title: "Outputs", records: outputs, hrefBase: "/outputs" } : null].filter(Boolean) as Array<{ title: string; records: Array<ResearchPublication | ResearchGenericRecord>; hrefBase: string }>;
  return <section id="evidence-outputs" className="overflow-hidden rounded-2xl border border-primary/15 bg-white/88 shadow-[0_22px_60px_-48px_hsl(var(--primary)/0.65)] backdrop-blur-sm"><h2 className="border-b border-border px-5 py-4 font-display text-xl font-semibold text-foreground">Evidence & Outputs</h2><div className="grid divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0">{groups.map((group) => <div key={group.title} className="min-w-0 p-5 sm:p-6"><div className="flex items-center justify-between gap-3"><h3 className="font-display text-lg font-semibold text-primary">{group.title}</h3><span className="rounded-full bg-primary/8 px-2.5 py-1 text-xs font-bold text-primary">{group.records.length}</span></div><div className="mt-4 divide-y divide-primary/10">{group.records.slice(0, 4).map((record) => { const generic = record as ResearchGenericRecord; return <Link key={`${group.title}-${generic.id}`} href={generic.slug ? `${group.hrefBase}/${generic.slug}` : group.hrefBase} className="group flex items-start gap-3 py-3"><FileText aria-hidden className="mt-1 h-4 w-4 shrink-0 text-primary" /><span className="min-w-0 flex-1"><span className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary">{getRecordTitle(generic, group.title)}</span><span className="mt-1 block text-xs text-muted-foreground">{formatDate(generic.publication_date) || formatDate(generic.created_at) || formatLabel(compactText(generic.output_type) || compactText(generic.publication_type))}</span></span><ArrowRight aria-hidden className="mt-1 h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-1" /></Link>; })}</div><Link href={group.hrefBase} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-secondary">View all {group.title.toLowerCase()} <ArrowRight aria-hidden className="h-3.5 w-3.5" /></Link></div>)}</div></section>;
}

export function projectMediaRecords(record: ResearchGenericRecord, fields: string[]) {
  for (const field of fields) {
    const value = record[field];
    if (Array.isArray(value)) {
      const records = value.filter((item): item is ResearchGenericRecord => Boolean(item && typeof item === "object"));
      if (records.length) return records;
    }
  }
  return [];
}

export function mediaUrl(record?: ResearchGenericRecord) {
  return compactText(record?.url) || compactText(record?.public_url) || compactText(record?.thumbnail_url) || compactText(record?.image_url);
}
