export function ValueCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <article className="rounded-[1.5rem] border border-border bg-white p-6 shadow-lg shadow-primary/40">
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="mt-3 text-base leading-7 text-muted-foreground">{body}</p>
    </article>
  );
}
