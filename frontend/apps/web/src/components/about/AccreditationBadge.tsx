export function AccreditationBadge({
  acronym,
  title,
  body,
  href,
}: {
  acronym: string;
  title: string;
  body: string;
  href?: string;
}) {
  return (
    <article className="rounded-[1.75rem] border border-border bg-white p-6 shadow-lg shadow-primary/40">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-semibold uppercase tracking-[0.16em] text-white">
          {acronym}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="mt-3 text-base leading-7 text-muted-foreground">{body}</p>
          {href ? (
            <a
              href={href}
              className="mt-4 inline-flex text-sm font-semibold text-primary"
            >
              View document
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
