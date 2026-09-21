"use client";

export function PolicyContentDisplay({ paragraphs }: { paragraphs: string[] }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm" data-server-data-display="library-policy-content">
      <div className="grid gap-4 text-sm leading-7 text-slate-700 sm:text-base">
        {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      </div>
    </article>
  );
}

export function PolicyFileDisplay({ fileId }: { fileId: string }) {
  return (
    <div
      className="rounded-2xl bg-card p-5 ring-1 ring-primary/10"
      data-server-data-display="library-policy-file"
    >
      <p className="text-sm font-semibold text-foreground">Policy file</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        A related file is attached to this policy record.
      </p>
      <p className="mt-3 text-xs text-muted-foreground">{fileId}</p>
    </div>
  );
}
