export interface TimelineItem {
  year: string;
  title: string;
  detail: string;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="rounded-[2rem] border border-border bg-white p-6 shadow-xl shadow-primary/50 sm:p-8">
      <div className="space-y-8">
        {items.map((item, index) => (
          <div
            key={`${item.year}-${item.title}`}
            className="grid gap-4 md:grid-cols-[110px_28px_1fr]"
          >
            <div>
              <p className="text-2xl font-semibold text-primary">{item.year}</p>
            </div>
            <div className="relative flex justify-center">
              <span className="mt-1.5 h-4 w-4 rounded-full border-4 border-secondary bg-white" />
              {index < items.length - 1 ? (
                <span className="absolute top-6 h-[calc(100%+2rem)] w-px bg-surface-muted" />
              ) : null}
            </div>
            <div className="rounded-2xl bg-surface-subtle p-5">
              <h3 className="text-xl font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-base leading-7 text-muted-foreground">
                {item.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
