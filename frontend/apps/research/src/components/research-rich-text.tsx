import { RichTextRenderer } from "@ksu/ui/rich-text-renderer";
import type { NarrativeSection } from "../lib/research-page-model";
import { StatusMessage } from "./research-ui";

export function ResearchRichText({
  content,
  className = "text-sm leading-7 text-slate-600",
}: {
  content?: string | null;
  className?: string;
}) {
  return (
    <RichTextRenderer
      content={content}
      className={[
        "prose-sm prose-slate max-w-none",
        "[&_a]:font-semibold [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline",
        "[&_img]:rounded-lg [&_table]:text-sm",
        className,
      ].join(" ")}
    />
  );
}

export function ResearchStoryAccordion({
  sections,
  empty,
}: {
  sections: NarrativeSection[];
  empty: string;
}) {
  if (sections.length === 0) {
    return <StatusMessage>{empty}</StatusMessage>;
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {sections.map((section, index) => (
        <details
          key={section.title}
          className="group border-b border-slate-200 last:border-b-0"
          open={index === 0}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-50">
            {section.title}
            <span className="text-primary transition group-open:rotate-45">+</span>
          </summary>
          <div className="px-5 pb-5">
            <ResearchRichText content={section.body} />
          </div>
        </details>
      ))}
    </section>
  );
}
